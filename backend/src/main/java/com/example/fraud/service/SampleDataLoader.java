package com.example.fraud.service;

import com.example.fraud.dto.TransactionRequest;
import com.example.fraud.repository.TransactionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.Random;
import java.time.LocalDateTime;

@Component
public class SampleDataLoader implements CommandLineRunner {
    private final TransactionRepository repository;
    private final TransactionService service;
    public SampleDataLoader(TransactionRepository repository, TransactionService service) {
        this.repository = repository; this.service = service;
    }

    @Override public void run(String... args) {
        if (repository.count() > 0) return;
        Random random = new Random(42);
        String[] locations = {"Chennai", "Madurai", "Bengaluru", "Mumbai", "Hyderabad", "Kochi"};
        String[] types = {"TRANSFER", "PAYMENT", "WITHDRAWAL", "PURCHASE"};
        for (int i = 1; i <= 250; i++) {
            boolean unusual = i % 19 == 0;
            // Seed rows use the same prediction and persistence path as user-created transactions.
            service.create(new SeedRequest("TXN%04d".formatted(i),
                unusual ? 12000 + random.nextInt(40000) : 100 + random.nextInt(4900),
                types[random.nextInt(types.length)], locations[random.nextInt(locations.length)],
                unusual ? random.nextInt(5) : 30 + random.nextInt(1800),
                unusual ? 18 + random.nextInt(35) : random.nextInt(12)),
                LocalDateTime.now().minusDays(random.nextInt(7)).minusMinutes(random.nextInt(1440)));
        }
    }

    private static class SeedRequest extends TransactionRequest {
        private final String id, type, location; private final double amount; private final int age, frequency;
        SeedRequest(String id, double amount, String type, String location, int age, int frequency) {
            this.id=id; this.amount=amount; this.type=type; this.location=location; this.age=age; this.frequency=frequency;
        }
        @Override public String getTransactionId(){return id;} @Override public double getAmount(){return amount;}
        @Override public String getTransactionType(){return type;} @Override public String getLocation(){return location;}
        @Override public int getAccountAge(){return age;} @Override public int getTransactionFrequency(){return frequency;}
    }
}
