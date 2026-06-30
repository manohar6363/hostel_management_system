package com.example.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.entity.Attendance;
import com.example.service.AttendanceService;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/attendances")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @Autowired
    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    /**
     * GET /api/attendances/today
     * Returns today's attendance for all students.
     * Auto-creates records and applies auto-absent for closed windows.
     */
    @GetMapping("/today")
    public ResponseEntity<List<Attendance>> getTodaysAttendance() {
        return ResponseEntity.ok(attendanceService.getTodaysAttendance());
    }

    /**
     * POST /api/attendances/mark?studentId=S001&session=morning
     * Marks the student as Present for the given session.
     * Returns 409 Conflict if window is closed or already marked.
     */
    @PostMapping("/mark")
    public ResponseEntity<?> markPresent(
            @RequestParam String studentId,
            @RequestParam String session) {
        try {
            Attendance updated = attendanceService.markPresent(studentId, session);
            return ResponseEntity.ok(updated);
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/attendances/history/{studentId}
     * Returns all attendance records for a student, newest first.
     */
    @GetMapping("/history/{studentId}")
    public ResponseEntity<List<Attendance>> getStudentHistory(@PathVariable String studentId) {
        return ResponseEntity.ok(attendanceService.getStudentHistory(studentId));
    }

    /**
     * GET /api/attendances/windows
     * Returns the configured attendance window times.
     */
    @GetMapping("/windows")
    public ResponseEntity<AttendanceService.AttendanceWindowInfo> getWindowInfo() {
        return ResponseEntity.ok(attendanceService.getWindowInfo());
    }
}
