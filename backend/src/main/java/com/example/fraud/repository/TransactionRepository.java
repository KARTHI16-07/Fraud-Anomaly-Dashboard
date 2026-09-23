package com.example.fraud.repository;

import com.example.fraud.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findAllByOrderByTimestampDesc();
    List<Transaction> findByStatusOrderByTimestampDesc(String status);
    boolean existsByTransactionId(String transactionId);
}
