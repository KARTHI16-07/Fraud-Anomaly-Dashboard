package com.example.fraud.service;

import com.example.fraud.dto.PredictionResponse;
import com.example.fraud.dto.TransactionRequest;
import com.example.fraud.entity.Transaction;
import com.example.fraud.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class TransactionService {
    private final TransactionRepository repository;
    private final RestClient mlClient;

    public TransactionService(TransactionRepository repository, @Value("${ml.service.url}") String mlUrl) {
        this.repository = repository;
        this.mlClient = RestClient.builder().baseUrl(mlUrl).build();
    }

    public List<Transaction> all() { return repository.findAllByOrderByTimestampDesc(); }
    public List<Transaction> suspicious() { return repository.findByStatusOrderByTimestampDesc("SUSPICIOUS"); }
    public Transaction get(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));
    }

    public Transaction create(TransactionRequest request) {
        return create(request, LocalDateTime.now());
    }

    public Transaction create(TransactionRequest request, LocalDateTime timestamp) {
        if (repository.existsByTransactionId(request.getTransactionId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Transaction ID already exists");
        }
        PredictionResponse prediction;
        try {
            prediction = mlClient.post().uri("/predict")
                .body(Map.of("amount", request.getAmount(), "accountAge", request.getAccountAge(),
                             "transactionFrequency", request.getTransactionFrequency()))
                .retrieve().body(PredictionResponse.class);
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "ML service is unavailable", exception);
        }
        if (prediction == null) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "ML service returned no prediction");
        Transaction transaction = new Transaction(request.getTransactionId(), request.getAmount(),
            request.getTransactionType().trim().toUpperCase(), request.getLocation().trim(),
            timestamp, request.getAccountAge(), request.getTransactionFrequency(),
            prediction.status(), prediction.anomalyScore());
        return repository.save(transaction);
    }

    public void delete(Long id) { repository.delete(get(id)); }
}
