package com.example.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.entity.Attendance;
import com.example.entity.Student;
import com.example.repo.AttendanceRepository;
import com.example.repo.StudentRepository;

@Service
public class AttendanceService {

    // ── Attendance time windows (edit these constants to change the schedule) ──
    public static final LocalTime MORNING_WINDOW_START = LocalTime.of(8, 30);   // 08:30 AM
    public static final LocalTime MORNING_WINDOW_END   = LocalTime.of(9, 0);    // 09:00 AM

    public static final LocalTime EVENING_WINDOW_START = LocalTime.of(21, 0);   // 09:00 PM
    public static final LocalTime EVENING_WINDOW_END   = LocalTime.of(21, 10);  // 09:10 PM
    // ──────────────────────────────────────────────────────────────────────────

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;

    @Autowired
    public AttendanceService(AttendanceRepository attendanceRepository,
                             StudentRepository studentRepository) {
        this.attendanceRepository = attendanceRepository;
        this.studentRepository = studentRepository;
    }

    /**
     * Returns today's attendance record for all students.
     * If a student has no record yet, it is created with nulls (not yet marked).
     * If a session window has closed and that session is still null, it is set to Absent.
     */
    public List<Attendance> getTodaysAttendance() {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        List<Student> allStudents = studentRepository.findAll();

        for (Student student : allStudents) {
            Optional<Attendance> existing =
                attendanceRepository.findByStudentIdAndDate(student.getId(), today);

            Attendance record = existing.orElseGet(() -> {
                Attendance a = new Attendance(student, today);
                return attendanceRepository.save(a);
            });

            boolean changed = false;

            // Auto-absent morning if window closed and not marked
            if (now.isAfter(MORNING_WINDOW_END) && record.getMorningStatus() == null) {
                record.setMorningStatus(false);
                changed = true;
            }

            // Auto-absent evening if window closed and not marked
            if (now.isAfter(EVENING_WINDOW_END) && record.getEveningStatus() == null) {
                record.setEveningStatus(false);
                changed = true;
            }

            if (changed) {
                attendanceRepository.save(record);
            }
        }

        return attendanceRepository.findByDate(today);
    }

    /**
     * Marks a student as Present for a session (morning or evening).
     * Validates:
     *   - The session window must currently be open.
     *   - The session must not have been marked already.
     * Throws IllegalStateException with a descriptive message on violations.
     */
    public Attendance markPresent(String studentId, String session) {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        boolean isMorning = "morning".equalsIgnoreCase(session);
        boolean isEvening = "evening".equalsIgnoreCase(session);

        if (!isMorning && !isEvening) {
            throw new IllegalArgumentException("Session must be 'morning' or 'evening'.");
        }

        // Validate window
        if (isMorning && (now.isBefore(MORNING_WINDOW_START) || now.isAfter(MORNING_WINDOW_END))) {
            throw new IllegalStateException(
                "Morning attendance window is closed. Window: "
                + MORNING_WINDOW_START + " – " + MORNING_WINDOW_END);
        }
        if (isEvening && (now.isBefore(EVENING_WINDOW_START) || now.isAfter(EVENING_WINDOW_END))) {
            throw new IllegalStateException(
                "Evening attendance window is closed. Window: "
                + EVENING_WINDOW_START + " – " + EVENING_WINDOW_END);
        }

        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new IllegalArgumentException("Student not found: " + studentId));

        Attendance record = attendanceRepository
            .findByStudentIdAndDate(studentId, today)
            .orElseGet(() -> new Attendance(student, today));

        if (isMorning) {
            if (record.getMorningStatus() != null) {
                throw new IllegalStateException("Morning attendance already marked.");
            }
            record.setMorningStatus(true);
            record.setMorningMarkedTime(now);
        } else {
            if (record.getEveningStatus() != null) {
                throw new IllegalStateException("Evening attendance already marked.");
            }
            record.setEveningStatus(true);
            record.setEveningMarkedTime(now);
        }

        return attendanceRepository.save(record);
    }

    /**
     * Returns all attendance records for a student, newest date first.
     */
    public List<Attendance> getStudentHistory(String studentId) {
        return attendanceRepository.findByStudentIdOrderByDateDesc(studentId);
    }

    /**
     * Returns the attendance window schedule so the frontend can display it.
     */
    public AttendanceWindowInfo getWindowInfo() {
        return new AttendanceWindowInfo(
            MORNING_WINDOW_START, MORNING_WINDOW_END,
            EVENING_WINDOW_START, EVENING_WINDOW_END
        );
    }

    // ── Simple DTO for window info ───────────────────────────────────────────
    public static class AttendanceWindowInfo {
        public final String morningStart;
        public final String morningEnd;
        public final String eveningStart;
        public final String eveningEnd;

        public AttendanceWindowInfo(LocalTime ms, LocalTime me, LocalTime es, LocalTime ee) {
            this.morningStart = ms.toString();
            this.morningEnd   = me.toString();
            this.eveningStart = es.toString();
            this.eveningEnd   = ee.toString();
        }
    }
}
