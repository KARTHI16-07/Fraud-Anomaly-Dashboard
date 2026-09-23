package com.example.fraud.dto;

public record PredictionResponse(int prediction, String status, double anomalyScore) {}
