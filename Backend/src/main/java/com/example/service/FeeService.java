package com.example.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.entity.Fee;
import com.example.repo.FeeRepository;

@Service
public class FeeService {
    private final FeeRepository feeRepository;

    public FeeService(FeeRepository feeRepository) {
        this.feeRepository = feeRepository;
    }

    public List<Fee> getAllFees() {
        return feeRepository.findAll();
    }

    public Fee getFeeById(Long id) {
        return feeRepository.findById(id).orElse(null);
    }

    public Fee createFee(Fee fee) {
        return feeRepository.save(fee);
    }

    public Fee updateFee(Fee fee) {
        return feeRepository.save(fee);
    }

    public void deleteFee(Long id) {
        feeRepository.deleteById(id);
    }

    // NEW: marks a fee as paid — irreversible from the UI
    public Fee markAsPaid(Long id) {
        Fee fee = feeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fee not found: " + id));
        fee.setPaid(true);
        return feeRepository.save(fee);
    }
}