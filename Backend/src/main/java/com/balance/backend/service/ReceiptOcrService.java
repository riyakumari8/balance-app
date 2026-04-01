package com.balance.backend.service;

import com.balance.backend.dto.ReceiptDataDto;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ReceiptOcrService {

    @Value("${tesseract.datapath}")
    private String tessDataPath;

    public ReceiptDataDto extractReceiptData(MultipartFile file) throws IOException, TesseractException {
        // Save file to temp location
        File tempFile = File.createTempFile("receipt-", "-" + file.getOriginalFilename());
        file.transferTo(tempFile);

        Tesseract tesseract = new Tesseract();
        tesseract.setDatapath(tessDataPath);
        
        // Execute OCR
        String extractedText = tesseract.doOCR(tempFile);
        
        // Cleanup
        tempFile.delete();

        // Parse extracted data using AI-like heuristics / Regex
        return parseData(extractedText);
    }

    private ReceiptDataDto parseData(String text) {
        BigDecimal amount = extractAmount(text);
        LocalDate date = extractDate(text);
        String merchant = extractMerchant(text);

        return ReceiptDataDto.builder()
                .amount(amount)
                .date(date != null ? date : LocalDate.now())
                .merchant(merchant)
                .rawText(text) // Helpful for debugging or manual correction
                .build();
    }

    private BigDecimal extractAmount(String text) {
        // Regex to find largest dollar amount or last amount (simplified heuristic)
        // Matches $12.34 or 12.34
        Pattern pattern = Pattern.compile("\\$?\\s*([0-9]+\\.[0-9]{2})");
        Matcher matcher = pattern.matcher(text);
        BigDecimal maxAmount = null;

        while (matcher.find()) {
            try {
                BigDecimal foundUrl = new BigDecimal(matcher.group(1));
                if (maxAmount == null || foundUrl.compareTo(maxAmount) > 0) {
                    maxAmount = foundUrl;
                }
            } catch (Exception ignored) {}
        }
        return maxAmount;
    }

    private LocalDate extractDate(String text) {
        // Simple regex for MM/DD/YYYY or YYYY-MM-DD
        Pattern pattern1 = Pattern.compile("([0-9]{1,2})[/\\-]([0-9]{1,2})[/\\-]([0-9]{2,4})");
        Matcher m1 = pattern1.matcher(text);
        if(m1.find()) {
            try {
                int part1 = Integer.parseInt(m1.group(1));
                int part2 = Integer.parseInt(m1.group(2));
                int part3 = Integer.parseInt(m1.group(3));
                
                if (part3 < 100) part3 += 2000;
                
                // DD/MM vs MM/DD is tricky, assume MM/DD standard US format for receipts
                int month = part1;
                int day = part2;
                if(month > 12) {
                    month = part2;
                    day = part1;
                }
                return LocalDate.of(part3, month, day);
            } catch (Exception ignored){}
        }
        return null;
    }

    private String extractMerchant(String text) {
        // Assume first non-empty line with alphabet characters is the merchant name
        String[] lines = text.split("\\r?\\n");
        for (String line : lines) {
            line = line.trim();
            if (line.matches(".*[a-zA-Z].*") && line.length() > 2) {
                // remove clutter
                return line.replaceAll("[^a-zA-Z0-9 &\\-]", "");
            }
        }
        return "Unknown Merchant";
    }
}
