package com.example.fraud.controller;

import com.example.fraud.dto.TransactionRequest;
import com.example.fraud.entity.Transaction;
import com.example.fraud.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {
    private final TransactionService service;
    public TransactionController(TransactionService service) { this.service = service; }

    @GetMapping public List<Transaction> all() { return service.all(); }
    @GetMapping("/suspicious") public List<Transaction> suspicious() { return service.suspicious(); }
    @GetMapping("/{id}") public Transaction get(@PathVariable Long id) { return service.get(id); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public Transaction create(@Valid @RequestBody TransactionRequest request) { return service.create(request); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { service.delete(id); }
}
