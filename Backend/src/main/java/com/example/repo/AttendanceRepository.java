package com.example.repo;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.entity.Attendance;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    // Enforce one record per student per day
    Optional<Attendance> findByStudentIdAndDate(String studentId, LocalDate date);

    // For history view — all records for a student, newest first
    List<Attendance> findByStudentIdOrderByDateDesc(String studentId);

    // For fetching today's attendance for all students
    List<Attendance> findByDate(LocalDate date);
}
