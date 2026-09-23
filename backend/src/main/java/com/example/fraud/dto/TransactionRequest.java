package com.example.fraud.dto;

import jakarta.validation.constraints.*;

public class TransactionRequest {
    @NotBlank @Size(max = 40) private String transactionId;
    @Positive private double amount;
    @NotBlank private String transactionType;
    @NotBlank private String location;
    @Min(0) private int accountAge;
    @Min(0) private int transactionFrequency;

    public String getTransactionId() { return transactionId; }
    public double getAmount() { return amount; }
    public String getTransactionType() { return transactionType; }
    public String getLocation() { return location; }
    public int getAccountAge() { return accountAge; }
    public int getTransactionFrequency() { return transactionFrequency; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    public void setAmount(double amount) { this.amount = amount; }
    public void setTransactionType(String transactionType) { this.transactionType = transactionType; }
    public void setLocation(String location) { this.location = location; }
    public void setAccountAge(int accountAge) { this.accountAge = accountAge; }
    public void setTransactionFrequency(int transactionFrequency) { this.transactionFrequency = transactionFrequency; }
}
