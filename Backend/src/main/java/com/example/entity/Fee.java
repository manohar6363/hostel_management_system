package com.example.entity;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "fees")
public class Fee {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne
	@JoinColumn(name = "student_id")
	private Student student;

	private BigDecimal amount;
	private LocalDate paymentDate;

	// NEW: defaults to false for every new record
	@Column(nullable = false, columnDefinition = "TINYINT(1) DEFAULT 0")
	private boolean paid = false;

	// ── Constructors ──────────────────────────────────────────────────────────

	public Fee() {
		super();
	}

	public Fee(Long id, Student student, BigDecimal amount, LocalDate paymentDate) {
		super();
		this.id = id;
		this.student = student;
		this.amount = amount;
		this.paymentDate = paymentDate;
		// paid stays false by default
	}

	// ── Getters & Setters ─────────────────────────────────────────────────────

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }

	public Student getStudent() { return student; }
	public void setStudent(Student student) { this.student = student; }

	public BigDecimal getAmount() { return amount; }
	public void setAmount(BigDecimal amount) { this.amount = amount; }

	public LocalDate getPaymentDate() { return paymentDate; }
	public void setPaymentDate(LocalDate paymentDate) { this.paymentDate = paymentDate; }

	// NEW getter/setter
	public boolean isPaid() { return paid; }
	public void setPaid(boolean paid) { this.paid = paid; }
}