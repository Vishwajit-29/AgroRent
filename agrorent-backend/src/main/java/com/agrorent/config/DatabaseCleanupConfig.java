package com.agrorent.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.IndexInfo;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class DatabaseCleanupConfig {

    private final MongoTemplate mongoTemplate;

    @Bean
    public CommandLineRunner dropEmailIndex() {
        return args -> {
            try {
                // Check if index exists on 'users' collection
                List<IndexInfo> indexes = mongoTemplate.indexOps("users").getIndexInfo();
                boolean emailIndexExists = indexes.stream()
                        .anyMatch(index -> index.getIndexFields().stream()
                                .anyMatch(field -> field.getKey().equals("email")));

                if (emailIndexExists) {
                    System.out.println(
                            "⚠️ Found duplicate check on email. Dropping index to allow multiple null emails...");
                    // Dropping by name commonly 'email' or 'email_1'
                    try {
                        mongoTemplate.indexOps("users").dropIndex("email");
                    } catch (Exception e) {
                        mongoTemplate.indexOps("users").dropIndex("email_1");
                    }
                    System.out.println("✅ Email index dropped successfully.");
                }
            } catch (Exception e) {
                System.out.println("ℹ️ Clean up check: " + e.getMessage());
            }
        };
    }
}
