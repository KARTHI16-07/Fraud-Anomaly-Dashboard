package com.example.fraud.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
public class Transaction {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "transaction_id", nullable = false, unique = true)
    private String transactionId;
    @Column(nullable = false)
    private double amount;
    @Column(name = "transaction_type", nullable = false)
    private String transactionType;
    @Column(nullable = false)
    private String location;
    @Column(nullable = false)
    private LocalDateTime timestamp;
    @Column(name = "account_age", nullable = false)
    private int accountAge;
    @Column(name = "transaction_frequency", nullable = false)
    private int transactionFrequency;
    @Column(nullable = false)
    private String status;
    @Column(name = "anomaly_score", nullable = false)
    private double anomalyScore;

    protected Transaction() {}

    public Transaction(String transactionId, double amount, String transactionType, String location,
                       LocalDateTime timestamp, int accountAge, int transactionFrequency,
                       String status, double anomalyScore) {
        this.transactionId = transactionId;
        this.amount = amount;
        this.transactionType = transactionType;
        this.location = location;
        this.timestamp = timestamp;
        this.accountAge = accountAge;
        this.transactionFrequency = transactionFrequency;
        this.status = status;
        this.anomalyScore = anomalyScore;
    }

    public Long getId() { return id; }
    public String getTransactionId() { return transactionId; }
    public double getAmount() { return amount; }
    public String getTransactionType() { return transactionType; }
    public String getLocation() { return location; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public int getAccountAge() { return accountAge; }
    public int getTransactionFrequency() { return transactionFrequency; }
    public String getStatus() { return status; }
    public double getAnomalyScore() { return anomalyScore; }
}
