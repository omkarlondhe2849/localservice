package com.local.localservice.model;

import java.sql.Date;
import java.sql.Time;

public class Booking {
    private Long id;
    private Long userId;
    private Long serviceId;
    private Long providerId;
    private Date bookingDate;
    private Time bookingTime;
    private String status;  // PENDING, CONFIRMED, COMPLETED, CANCELLED
    private String createdAt;
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public Long getUserId() {
		return userId;
	}
	public void setUserId(Long userId) {
		this.userId = userId;
	}
	public Long getServiceId() {
		return serviceId;
	}
	public void setServiceId(Long serviceId) {
		this.serviceId = serviceId;
	}
	public Long getProviderId() {
		return providerId;
	}
	public void setProviderId(Long providerId) {
		this.providerId = providerId;
	}
	public Date getBookingDate() {
		return bookingDate;
	}
	public void setBookingDate(Date bookingDate) {
		this.bookingDate = bookingDate;
	}
	public Time getBookingTime() {
		return bookingTime;
	}
	public void setBookingTime(Time bookingTime) {
		this.bookingTime = bookingTime;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	public String getCreatedAt() {
		return createdAt;
	}
	public void setCreatedAt(String createdAt) {
		this.createdAt = createdAt;
	}
	@Override
	public String toString() {
		return "Booking [id=" + id + ", userId=" + userId + ", serviceId=" + serviceId + ", providerId=" + providerId
				+ ", bookingDate=" + bookingDate + ", bookingTime=" + bookingTime + ", status=" + status
				+ ", createdAt=" + createdAt + ", getId()=" + getId() + ", getUserId()=" + getUserId()
				+ ", getServiceId()=" + getServiceId() + ", getProviderId()=" + getProviderId() + ", getBookingDate()="
				+ getBookingDate() + ", getBookingTime()=" + getBookingTime() + ", getStatus()=" + getStatus()
				+ ", getCreatedAt()=" + getCreatedAt() + ", getClass()=" + getClass() + ", hashCode()=" + hashCode()
				+ ", toString()=" + super.toString() + "]";
	}

    // Getters and Setters
}
