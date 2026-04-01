package com.balance.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class ReceiptDataDto {
    private BigDecimal amount;
    private LocalDate date;
    private String merchant;
    private String rawText;
}
