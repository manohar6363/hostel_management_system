package com.example.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.entity.Admin;
import com.example.repo.AdminRepo;

@Service
public class AdminService {

    @Autowired
    AdminRepo repo;

    // Get admin by username
    public Optional<Admin> findByUsername(String username) {
        return repo.findByUsername(username);
    }

    // Change password: verify current password, then update
    public String changePassword(String username, String currentPassword, String newPassword) {
        Optional<Admin> adminOpt = repo.findByUsername(username);
        if (adminOpt.isEmpty()) {
            return "Admin not found";
        }
        Admin admin = adminOpt.get();
        if (!admin.getPassword().equals(currentPassword)) {
            return "Current password is incorrect";
        }
        admin.setPassword(newPassword);
        repo.save(admin);
        return "Password updated successfully";
    }

    // Create new admin: check username uniqueness, then save
    public String createAdmin(Admin newAdmin) {
        Optional<Admin> existing = repo.findByUsername(newAdmin.getUsername());
        if (existing.isPresent()) {
            return "Username already exists";
        }
        // Auto-generate id: find max id and increment
        int maxId = repo.findMaxId().orElse(0);
        newAdmin.setId(maxId + 1);
        repo.save(newAdmin);
        return "Admin created successfully";
    }
}
