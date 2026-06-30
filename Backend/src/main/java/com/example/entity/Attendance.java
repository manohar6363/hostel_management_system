package com.example.entity;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
    name = "attendances",
    uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "date"})
)
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false)
    private LocalDate date;

    // Morning attendance: true = Present, false = Absent, null = not yet marked
    @Column(name = "morning_status")
    private Boolean morningStatus;

    // Evening attendance: true = Present, false = Absent, null = not yet marked
    @Column(name = "evening_status")
    private Boolean eveningStatus;

    @Column(name = "morning_marked_time")
    private LocalTime morningMarkedTime;

    @Column(name = "evening_marked_time")
    private LocalTime eveningMarkedTime;

    public Attendance() {}

    public Attendance(Student student, LocalDate date) {
        this.student = student;
        this.date = date;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public Boolean getMorningStatus() { return morningStatus; }
    public void setMorningStatus(Boolean morningStatus) { this.morningStatus = morningStatus; }

    public Boolean getEveningStatus() { return eveningStatus; }
    public void setEveningStatus(Boolean eveningStatus) { this.eveningStatus = eveningStatus; }

    public LocalTime getMorningMarkedTime() { return morningMarkedTime; }
    public void setMorningMarkedTime(LocalTime morningMarkedTime) { this.morningMarkedTime = morningMarkedTime; }

    public LocalTime getEveningMarkedTime() { return eveningMarkedTime; }
    public void setEveningMarkedTime(LocalTime eveningMarkedTime) { this.eveningMarkedTime = eveningMarkedTime; }
}
