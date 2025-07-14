package com.local.localservice.model;

public class Review {
    private Long id;
    private Long userId;
    private Long serviceId;
    private int rating;   // 1 to 5
    private String comment;
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
	public int getRating() {
		return rating;
	}
	public void setRating(int rating) {
		this.rating = rating;
	}
	public String getComment() {
		return comment;
	}
	public void setComment(String comment) {
		this.comment = comment;
	}
	public String getCreatedAt() {
		return createdAt;
	}
	public void setCreatedAt(String createdAt) {
		this.createdAt = createdAt;
	}
	@Override
	public String toString() {
		return "Review [id=" + id + ", userId=" + userId + ", serviceId=" + serviceId + ", rating=" + rating
				+ ", comment=" + comment + ", createdAt=" + createdAt + ", getId()=" + getId() + ", getUserId()="
				+ getUserId() + ", getServiceId()=" + getServiceId() + ", getRating()=" + getRating()
				+ ", getComment()=" + getComment() + ", getCreatedAt()=" + getCreatedAt() + ", getClass()=" + getClass()
				+ ", hashCode()=" + hashCode() + ", toString()=" + super.toString() + "]";
	}

    // Getters and Setters
}
