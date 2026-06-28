package com.example.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.entity.Admin;
import com.example.repo.AdminRepo;
import com.example.service.AdminService;

@RestController
@CrossOrigin
@RequestMapping("/login")
public class AdminController {

    @Autowired
    AdminRepo repo;

    @Autowired
    AdminService adminService;

    // ─── EXISTING API (unchanged) ────────────────────────────────────────────
    @GetMapping("/getadmin")
    public Iterable<Admin> GetAll() {
        return repo.findAll();
    }

    // ─── NEW: Get admin profile by username ───────────────────────────────────
    @GetMapping("/admin/profile")
    public ResponseEntity<?> getProfile(@RequestParam String username) {
        Optional<Admin> admin = adminService.findByUsername(username);
        if (admin.isPresent()) {
            // Return only id and username (not password)
            Admin a = admin.get();
            return ResponseEntity.ok(Map.of(
                "id", a.getId(),
                "username", a.getUsername()
            ));
        }
        return ResponseEntity.status(404).body("Admin not found");
    }

    // ─── NEW: Change password ─────────────────────────────────────────────────
    @PutMapping("/admin/change-password")
    public ResponseEntity<String> changePassword(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");

        if (username == null || currentPassword == null || newPassword == null) {
            return ResponseEntity.badRequest().body("Missing required fields");
        }

        String result = adminService.changePassword(username, currentPassword, newPassword);
        if (result.equals("Password updated successfully")) {
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.badRequest().body(result);
    }

    // ─── NEW: Create new admin ────────────────────────────────────────────────
    @PostMapping("/admin/create")
    public ResponseEntity<String> createAdmin(@RequestBody Admin newAdmin) {
        if (newAdmin.getUsername() == null || newAdmin.getUsername().isEmpty()
                || newAdmin.getPassword() == null || newAdmin.getPassword().isEmpty()) {
            return ResponseEntity.badRequest().body("Username and password are required");
        }

        String result = adminService.createAdmin(newAdmin);
        if (result.equals("Admin created successfully")) {
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.badRequest().body(result);
    }
}
