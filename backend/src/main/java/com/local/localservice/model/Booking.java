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
    private String address;
    private String paymentStatus;
    private String stripeSessionId;
    private String otp;
    private java.sql.Timestamp otpExpiry;
    private String providerPayoutStatus;
    private java.math.BigDecimal providerPayoutAmount;
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
	public String getAddress() {
		return address;
	}
	public void setAddress(String address) {
		this.address = address;
	}
	public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    public String getStripeSessionId() { return stripeSessionId; }
    public void setStripeSessionId(String stripeSessionId) { this.stripeSessionId = stripeSessionId; }
    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }
    public java.sql.Timestamp getOtpExpiry() { return otpExpiry; }
    public void setOtpExpiry(java.sql.Timestamp otpExpiry) { this.otpExpiry = otpExpiry; }
    public String getProviderPayoutStatus() { return providerPayoutStatus; }
    public void setProviderPayoutStatus(String providerPayoutStatus) { this.providerPayoutStatus = providerPayoutStatus; }
    public java.math.BigDecimal getProviderPayoutAmount() { return providerPayoutAmount; }
    public void setProviderPayoutAmount(java.math.BigDecimal providerPayoutAmount) { this.providerPayoutAmount = providerPayoutAmount; }
	@Override
	public String toString() {
		return "Booking [id=" + id + ", userId=" + userId + ", serviceId=" + serviceId + ", providerId=" + providerId
				+ ", bookingDate=" + bookingDate + ", bookingTime=" + bookingTime + ", status=" + status
				+ ", createdAt=" + createdAt + ", address=" + address + ", getId()=" + getId() + ", getUserId()="
				+ getUserId() + ", getServiceId()=" + getServiceId() + ", getProviderId()=" + getProviderId()
				+ ", getBookingDate()=" + getBookingDate() + ", getBookingTime()=" + getBookingTime() + ", getStatus()="
				+ getStatus() + ", getCreatedAt()=" + getCreatedAt() + ", getAddress()=" + getAddress() + ", getClass()="
				+ getClass() + ", hashCode()=" + hashCode() + ", toString()=" + super.toString() + "]";
	}

    // Getters and Setters
}
