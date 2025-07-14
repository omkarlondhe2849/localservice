package com.local.localservice.model;

import java.math.BigDecimal;

public class Service {
    private Long id;
    private String title;
    private String description;
    private String category;
    private String location;
    private BigDecimal price;
    private Long providerId;
    private String createdAt;
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getTitle() {
		return title;
	}
	public void setTitle(String title) {
		this.title = title;
	}
	public String getDescription() {
		return description;
	}
	public void setDescription(String description) {
		this.description = description;
	}
	public String getCategory() {
		return category;
	}
	public void setCategory(String category) {
		this.category = category;
	}
	public String getLocation() {
		return location;
	}
	public void setLocation(String location) {
		this.location = location;
	}
	public BigDecimal getPrice() {
		return price;
	}
	public void setPrice(BigDecimal price) {
		this.price = price;
	}
	public Long getProviderId() {
		return providerId;
	}
	public void setProviderId(Long providerId) {
		this.providerId = providerId;
	}
	public String getCreatedAt() {
		return createdAt;
	}
	public void setCreatedAt(String createdAt) {
		this.createdAt = createdAt;
	}
	@Override
	public String toString() {
		return "Service [id=" + id + ", title=" + title + ", description=" + description + ", category=" + category
				+ ", location=" + location + ", price=" + price + ", providerId=" + providerId + ", createdAt="
				+ createdAt + ", getId()=" + getId() + ", getTitle()=" + getTitle() + ", getDescription()="
				+ getDescription() + ", getCategory()=" + getCategory() + ", getLocation()=" + getLocation()
				+ ", getPrice()=" + getPrice() + ", getProviderId()=" + getProviderId() + ", getCreatedAt()="
				+ getCreatedAt() + ", getClass()=" + getClass() + ", hashCode()=" + hashCode() + ", toString()="
				+ super.toString() + "]";
	}

    // Getters and Setters
    
}

