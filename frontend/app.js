const API_BASE = 'http://localhost:8080';

function saveUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

function getUser() {
  return JSON.parse(localStorage.getItem('user'));
}

function logout() {
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

if (document.getElementById('loginForm')) {
  document.getElementById('loginForm').onsubmit = async function(e) {
    e.preventDefault();
    const email = this.email.value;
    const password = this.password.value;
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (res.ok) {
      const user = await res.json();
      saveUser(user);
      if (user.role === 'USER') {
        window.location.href = 'dashboard.html';
      } else if (user.role === 'PROVIDER') {
        window.location.href = 'provider.html';
      } else {
        window.location.href = 'index.html';
      }
    } else {
      document.getElementById('loginMessage').textContent = 'Invalid credentials.';
    }
  };
}

if (document.getElementById('registerForm')) {
  document.getElementById('registerForm').onsubmit = async function(e) {
    e.preventDefault();
    const name = this.name.value;
    const email = this.email.value;
    const password = this.password.value;
    const phone = this.phone.value;
    const role = this.role.value;
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone, role })
    });
    if (res.ok) {
      document.getElementById('registerMessage').textContent = 'Registration successful! Please login.';
      setTimeout(() => window.location.href = 'login.html', 1500);
    } else {
      document.getElementById('registerMessage').textContent = 'Registration failed.';
    }
  };
}

let allServices = [];
let allServicesWithDetails = [];

if (document.getElementById('servicesList')) {
  fetch(`${API_BASE}/services`)
    .then(res => res.json())
    .then(async services => {
      allServices = services;
      const div = document.getElementById('servicesList');
      if (!services.length) {
        div.textContent = 'No services found.';
        return;
      }
      
      const user = getUser();
      const serviceCards = [];
      
      for (const service of services) {
        try {
          const detailsRes = await fetch(`${API_BASE}/services/${service.id}/details`);
          if (detailsRes.ok) {
            const details = await detailsRes.json();
            const provider = details.provider;
            const avgRating = details.averageRating;
            const reviewCount = details.reviewCount;
            
            const serviceWithDetails = {
              ...service,
              provider: provider,
              avgRating: avgRating,
              reviewCount: reviewCount
            };
            allServicesWithDetails.push(serviceWithDetails);
            
            let bookBtn = '';
            let reviewBtn = '';
            if (user && user.role === 'USER') {
              bookBtn = `<button onclick="showBookingForm(${service.id}, '${service.title}', ${service.providerId})">Book</button>`;
              reviewBtn = `<button onclick="showReviewSection(${service.id}, '${service.title}')">Reviews</button>`;
            } else {
              reviewBtn = `<button onclick="showReviewSection(${service.id}, '${service.title}')">Reviews</button>`;
            }
            
            const ratingDisplay = avgRating ? 
              `<div class="provider-rating">⭐ ${avgRating} (${reviewCount} reviews)</div>` : 
              '<div class="provider-rating">⭐ New provider</div>';
            
            serviceCards.push(`
              <div class="service-card" data-category="${service.category}" data-location="${service.location}" data-price="${service.price}" data-title="${service.title.toLowerCase()}">
                <div class="service-header">
                  <h3><a href='service.html?id=${service.id}'>${service.title}</a></h3>
                  <div class="service-price">$${service.price}</div>
                </div>
                <div class="service-details">
                  <p><strong>Category:</strong> ${service.category}</p>
                  <p><strong>Location:</strong> ${service.location}</p>
                  <p><strong>Provider:</strong> ${provider ? provider.name : 'Unknown'}</p>
                  ${ratingDisplay}
                </div>
                <div class="service-actions">
                  ${bookBtn} ${reviewBtn}
                </div>
              </div>
            `);
          } else {
            serviceCards.push(`
              <div class="service-card" data-category="${service.category}" data-location="${service.location}" data-price="${service.price}" data-title="${service.title.toLowerCase()}">
                <h3><a href='service.html?id=${service.id}'>${service.title}</a></h3>
                <p><strong>Category:</strong> ${service.category}</p>
                <p><strong>Location:</strong> ${service.location}</p>
                <p><strong>Price:</strong> $${service.price}</p>
              </div>
            `);
          }
        } catch (error) {
          serviceCards.push(`
            <div class="service-card" data-category="${service.category}" data-location="${service.location}" data-price="${service.price}" data-title="${service.title.toLowerCase()}">
              <h3><a href='service.html?id=${service.id}'>${service.title}</a></h3>
              <p><strong>Category:</strong> ${service.category}</p>
              <p><strong>Location:</strong> ${service.location}</p>
              <p><strong>Price:</strong> $${service.price}</p>
            </div>
          `);
        }
      }
      
      div.innerHTML = '<div class="services-grid">' + serviceCards.join('') + '</div>';
      div.innerHTML += '<div id="bookingFormContainer"></div>';
      
      populateFilters();
    })
    .catch(() => {
      document.getElementById('servicesList').textContent = 'Failed to load services.';
    });
}

function populateFilters() {
  const categories = [...new Set(allServices.map(s => s.category))].filter(cat => cat && cat.trim() !== '');
  const locations = [...new Set(allServices.map(s => s.location))].filter(loc => loc && loc.trim() !== '');
  
  const categoryFilter = document.getElementById('categoryFilter');
  const locationFilter = document.getElementById('locationFilter');
  
  if (categoryFilter) {
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categoryFilter.appendChild(option);
    });
  }
  
  if (locationFilter) {
    locations.forEach(location => {
      const option = document.createElement('option');
      option.value = location;
      option.textContent = location;
      locationFilter.appendChild(option);
    });
  }
}

window.searchServices = function() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const categoryFilter = document.getElementById('categoryFilter').value;
  const locationFilter = document.getElementById('locationFilter').value;
  const priceFilter = document.getElementById('priceFilter').value;
  
  const serviceCards = document.querySelectorAll('.service-card');
  let visibleCount = 0;
  
  serviceCards.forEach(card => {
    const title = card.getAttribute('data-title');
    const category = card.getAttribute('data-category');
    const location = card.getAttribute('data-location');
    const price = parseFloat(card.getAttribute('data-price'));
    
    let show = true;
    
    if (searchTerm && !title.includes(searchTerm)) {
      show = false;
    }
    
    if (categoryFilter && category !== categoryFilter) {
      show = false;
    }
    
    if (locationFilter && location !== locationFilter) {
      show = false;
    }
    
    if (priceFilter) {
      const [min, max] = priceFilter.split('-').map(p => p === '+' ? Infinity : parseFloat(p.replace('$', '')));
      if (price < min || (max !== Infinity && price > max)) {
        show = false;
      }
    }
    
    card.style.display = show ? 'block' : 'none';
    if (show) visibleCount++;
  });
  
  const searchResults = document.getElementById('searchResults');
  if (searchResults) {
    if (searchTerm || categoryFilter || locationFilter || priceFilter) {
      searchResults.innerHTML = `<div class="search-summary">Found ${visibleCount} service${visibleCount !== 1 ? 's' : ''}</div>`;
    } else {
      searchResults.innerHTML = '';
    }
  }
};

window.filterServices = function() {
  searchServices();
};

window.showBookingForm = function(serviceId, serviceTitle, providerId) {
  const user = getUser();
  if (!user) {
    alert('Please login to book a service.');
    window.location.href = 'login.html';
    return;
  }
  const container = document.getElementById('bookingFormContainer');
  container.innerHTML = `
    <h3>Book: ${serviceTitle}</h3>
    <form id="bookingForm">
      <label>Date:<br><input type="date" name="date" required></label><br>
      <label>Time:<br><input type="time" name="time" required></label><br>
      <button type="submit">Confirm Booking</button>
      <button type="button" onclick="hideBookingForm()">Cancel</button>
    </form>
    <div id="bookingMessage"></div>
  `;
  document.getElementById('bookingForm').onsubmit = async function(e) {
    e.preventDefault();
    const bookingDate = this.date.value;
    const bookingTime = this.time.value + ':00';
    const booking = {
      userId: user.id,
      serviceId: serviceId,
      providerId: providerId,
      bookingDate: bookingDate,
      bookingTime: bookingTime,
      status: 'PENDING'
    };
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking)
    });
    if (res.ok) {
      document.getElementById('bookingMessage').textContent = 'Booking successful!';
      setTimeout(() => { hideBookingForm(); }, 1200);
    } else {
      document.getElementById('bookingMessage').textContent = 'Booking failed.';
    }
  };
};
window.hideBookingForm = function() {
  document.getElementById('bookingFormContainer').innerHTML = '';
};

window.showReviewSection = async function(serviceId, serviceTitle) {
  const user = getUser();
  const container = document.getElementById('serviceReviewContainer');
  container.innerHTML = `<h3>Reviews for: ${serviceTitle}</h3><div id="reviewsList">Loading...</div>`;
  fetch(`${API_BASE}/reviews/service/${serviceId}`)
    .then(res => res.json())
    .then(reviews => {
      const reviewsDiv = document.getElementById('reviewsList');
      if (!reviews.length) {
        reviewsDiv.textContent = 'No reviews yet.';
      } else {
        reviewsDiv.innerHTML = '<ul>' + reviews.map(r => `<li><b>Rating:</b> ${r.rating} - ${r.comment}</li>`).join('') + '</ul>';
      }
      if (user && user.role === 'USER') {
        fetch(`${API_BASE}/bookings/user/${user.id}`)
          .then(res => res.json())
          .then(bookings => {
            const hasBooked = bookings.some(b => b.serviceId === serviceId && b.status !== 'CANCELLED');
            if (hasBooked) {
              reviewsDiv.innerHTML += `
                <h4>Leave a Review</h4>
                <form id="reviewForm">
                  <label>Rating (1-5):<br><input type="number" name="rating" min="1" max="5" required></label><br>
                  <label>Comment:<br><input type="text" name="comment" required></label><br>
                  <button type="submit">Submit Review</button>
                </form>
                <div id="reviewMessage"></div>
              `;
              document.getElementById('reviewForm').onsubmit = async function(e) {
                e.preventDefault();
                const rating = this.rating.value;
                const comment = this.comment.value;
                const review = {
                  userId: user.id,
                  serviceId: serviceId,
                  rating: parseInt(rating),
                  comment: comment
                };
                const res = await fetch(`${API_BASE}/reviews`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(review)
                });
                if (res.ok) {
                  document.getElementById('reviewMessage').textContent = 'Review submitted!';
                  setTimeout(() => { showReviewSection(serviceId, serviceTitle); }, 1000);
                } else {
                  document.getElementById('reviewMessage').textContent = 'Failed to submit review.';
                }
              };
            }
          });
      }
    });
};

if (document.getElementById('bookingsList')) {
  const user = getUser();
  if (!user) {
    document.getElementById('bookingsList').textContent = 'Please login to view your bookings.';
  } else {
    fetch(`${API_BASE}/bookings/user/${user.id}`)
      .then(res => res.json())
      .then(async bookings => {
        if (!bookings.length) {
          document.getElementById('bookingsList').textContent = 'No bookings found.';
          return;
        }
        const servicesRes = await fetch(`${API_BASE}/services`);
        const services = await servicesRes.json();
        const serviceMap = {};
        services.forEach(s => { serviceMap[s.id] = s; });
        document.getElementById('bookingsList').innerHTML =
          '<table><tr><th>Service</th><th>Date</th><th>Time</th><th>Status</th><th>Action</th></tr>' +
          bookings.map(b => {
            let cancelBtn = '';
            if (b.status === 'PENDING' || b.status === 'CONFIRMED') {
              cancelBtn = `<button onclick="cancelBooking(${b.id})">Cancel</button>`;
            }
            return `<tr>
              <td>${serviceMap[b.serviceId] ? serviceMap[b.serviceId].title : b.serviceId}</td>
              <td>${b.bookingDate}</td>
              <td>${b.bookingTime}</td>
              <td>${b.status}</td>
              <td>${cancelBtn}</td>
            </tr>`;
          }).join('') + '</table>';
      })
      .catch(() => {
        document.getElementById('bookingsList').textContent = 'Failed to load bookings.';
      });
  }
}

if (document.getElementById('activeBookings') || document.getElementById('completedServices') || document.getElementById('reviewsGiven')) {
  const user = getUser();
  if (user) {
    async function loadUserDashboardStats() {
      try {
        const bookingsRes = await fetch(`${API_BASE}/bookings/user/${user.id}`);
        const bookings = await bookingsRes.json();
        
        const activeBookings = bookings.filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED').length;
        const completedServices = bookings.filter(b => b.status === 'COMPLETED').length;
        
        const reviewsRes = await fetch(`${API_BASE}/reviews`);
        const reviews = await reviewsRes.json();
        const userReviews = reviews.filter(r => r.userId === user.id).length;
        
        if (document.getElementById('activeBookings')) {
          document.getElementById('activeBookings').textContent = activeBookings;
        }
        if (document.getElementById('completedServices')) {
          document.getElementById('completedServices').textContent = completedServices;
        }
        if (document.getElementById('reviewsGiven')) {
          document.getElementById('reviewsGiven').textContent = userReviews;
        }
        
        if (document.getElementById('recentActivity')) {
          const recentBookings = bookings.slice(0, 3);
          if (recentBookings.length > 0) {
            const servicesRes = await fetch(`${API_BASE}/services`);
            const services = await servicesRes.json();
            const serviceMap = {};
            services.forEach(s => { serviceMap[s.id] = s; });
            
            const activityHtml = recentBookings.map(b => {
              const service = serviceMap[b.serviceId];
              return `<div class="activity-item">
                <strong>${service ? service.title : 'Unknown Service'}</strong> - ${b.status} on ${b.bookingDate}
              </div>`;
            }).join('');
            
            document.getElementById('recentActivity').innerHTML = activityHtml;
          } else {
            document.getElementById('recentActivity').innerHTML = '<p>No recent activity.</p>';
          }
        }
      } catch (error) {
        console.error('Failed to load user dashboard stats:', error);
      }
    }
    loadUserDashboardStats();
  }
}

window.cancelBooking = function(bookingId) {
  if (!confirm('Are you sure you want to cancel this booking?')) return;
  
  fetch(`${API_BASE}/bookings/${bookingId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'CANCELLED' })
  })
    .then(res => {
      if (res.ok) {
        alert('Booking cancelled successfully!');
        if (document.getElementById('bookingsList')) {
          const user = getUser();
          fetch(`${API_BASE}/bookings/user/${user.id}`)
            .then(res => res.json())
            .then(async bookings => {
              if (!bookings.length) {
                document.getElementById('bookingsList').textContent = 'No bookings found.';
                return;
              }
              const servicesRes = await fetch(`${API_BASE}/services`);
              const services = await servicesRes.json();
              const serviceMap = {};
              services.forEach(s => { serviceMap[s.id] = s; });
              document.getElementById('bookingsList').innerHTML =
                '<table><tr><th>Service</th><th>Date</th><th>Time</th><th>Status</th><th>Action</th></tr>' +
                bookings.map(b => {
                  let cancelBtn = '';
                  if (b.status === 'PENDING' || b.status === 'CONFIRMED') {
                    cancelBtn = `<button onclick="cancelBooking(${b.id})">Cancel</button>`;
                  }
                  return `<tr>
                    <td>${serviceMap[b.serviceId] ? serviceMap[b.serviceId].title : b.serviceId}</td>
                    <td>${b.bookingDate}</td>
                    <td>${b.bookingTime}</td>
                    <td>${b.status}</td>
                    <td>${cancelBtn}</td>
                  </tr>`;
                }).join('') + '</table>';
            })
            .catch(() => {
              document.getElementById('bookingsList').textContent = 'Failed to refresh bookings.';
            });
        }
      } else {
        alert('Failed to cancel booking. Please try again.');
      }
    })
    .catch(() => {
      alert('Network error. Please try again.');
    });
};

if (document.getElementById('userInfo')) {
  const user = getUser();
  if (!user) {
    window.location.href = 'login.html';
  } else {
    document.getElementById('userInfo').innerHTML = `<p>Welcome, <b>${user.name}</b> (${user.role})</p><button onclick="logout()">Logout</button>`;
  }
}

if (document.getElementById('providerServices')) {
  const user = getUser();
  if (!user || user.role !== 'PROVIDER') {
    document.getElementById('providerServices').textContent = 'Only providers can access this page.';
  } else {
    function loadProviderServices() {
      fetch(`${API_BASE}/services`)
        .then(res => res.json())
        .then(services => {
          const myServices = services.filter(s => s.providerId === user.id);
          let html = '<h3>Your Services</h3>';
          if (!myServices.length) {
            html += '<p>No services found.</p>';
          } else {
            html += '<ul>' + myServices.map(s =>
              `<li><b>${s.title}</b> - ${s.category} - ${s.location} - $${s.price}
                <button onclick="showEditServiceForm(${s.id})">Edit</button>
                <button onclick="deleteService(${s.id})">Delete</button>
              </li>`
            ).join('') + '</ul>';
          }
          html += '<button onclick="showAddServiceForm()">Add New Service</button>';
          html += '<div id="serviceFormContainer"></div>';
          document.getElementById('providerServices').innerHTML = html;
        });
    }
    loadProviderServices();

    window.showAddServiceForm = function() {
      document.getElementById('serviceFormContainer').innerHTML = `
        <h4>Add Service</h4>
        <form id="addServiceForm">
          <label>Title:<br><input type="text" name="title" required></label><br>
          <label>Description:<br><input type="text" name="description" required></label><br>
          <label>Category:<br><input type="text" name="category" required></label><br>
          <label>Location:<br><input type="text" name="location" required></label><br>
          <label>Price:<br><input type="number" name="price" step="0.01" required></label><br>
          <button type="submit">Add</button>
          <button type="button" onclick="hideServiceForm()">Cancel</button>
        </form>
        <div id="serviceFormMessage"></div>
      `;
      document.getElementById('addServiceForm').onsubmit = async function(e) {
        e.preventDefault();
        const form = this;
        const service = {
          title: form.title.value,
          description: form.description.value,
          category: form.category.value,
          location: form.location.value,
          price: parseFloat(form.price.value),
          providerId: user.id
        };
        const res = await fetch(`${API_BASE}/services`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(service)
        });
        if (res.ok) {
          document.getElementById('serviceFormMessage').textContent = 'Service added!';
          setTimeout(() => { hideServiceForm(); loadProviderServices(); }, 1000);
        } else {
          document.getElementById('serviceFormMessage').textContent = 'Failed to add service.';
        }
      };
    };

    window.showEditServiceForm = function(serviceId) {
      fetch(`${API_BASE}/services/${serviceId}`)
        .then(res => res.json())
        .then(service => {
          document.getElementById('serviceFormContainer').innerHTML = `
            <h4>Edit Service</h4>
            <form id="editServiceForm">
              <label>Title:<br><input type="text" name="title" value="${service.title}" required></label><br>
              <label>Description:<br><input type="text" name="description" value="${service.description}" required></label><br>
              <label>Category:<br><input type="text" name="category" value="${service.category}" required></label><br>
              <label>Location:<br><input type="text" name="location" value="${service.location}" required></label><br>
              <label>Price:<br><input type="number" name="price" step="0.01" value="${service.price}" required></label><br>
              <button type="submit">Update</button>
              <button type="button" onclick="hideServiceForm()">Cancel</button>
            </form>
            <div id="serviceFormMessage"></div>
          `;
          document.getElementById('editServiceForm').onsubmit = async function(e) {
            e.preventDefault();
            const form = this;
            const updated = {
              title: form.title.value,
              description: form.description.value,
              category: form.category.value,
              location: form.location.value,
              price: parseFloat(form.price.value),
              providerId: user.id
            };
            const res = await fetch(`${API_BASE}/services/${serviceId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updated)
            });
            if (res.ok) {
              document.getElementById('serviceFormMessage').textContent = 'Service updated!';
              setTimeout(() => { hideServiceForm(); loadProviderServices(); }, 1000);
            } else {
              document.getElementById('serviceFormMessage').textContent = 'Failed to update service.';
            }
          };
        });
    };

    window.deleteService = function(serviceId) {
      if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) return;
      fetch(`${API_BASE}/services/${serviceId}`, { method: 'DELETE' })
        .then(res => {
          if (res.ok) {
            loadProviderServices();
          } else {
            alert('Failed to delete service. This service may have existing bookings or reviews. Please cancel all bookings and remove reviews before deleting the service.');
          }
        })
        .catch(() => {
          alert('Failed to delete service. This service may have existing bookings or reviews. Please cancel all bookings and remove reviews before deleting the service.');
        });
    };

    window.hideServiceForm = function() {
      document.getElementById('serviceFormContainer').innerHTML = '';
    };

    async function loadProviderBookings() {
      try {
        const bookingsRes = await fetch(`${API_BASE}/bookings/provider/${user.id}/with-customers`);
        const bookingsWithCustomers = await bookingsRes.json();
        
        if (!bookingsWithCustomers.length) {
          document.getElementById('providerBookings').innerHTML = '<h3>Your Service Bookings</h3><p>No bookings found.</p>';
          return;
        }

        const servicesRes = await fetch(`${API_BASE}/services`);
        const services = await servicesRes.json();
        const myServices = services.filter(s => s.providerId === user.id);
        const serviceMap = {};
        myServices.forEach(s => { serviceMap[s.id] = s; });

        document.getElementById('providerBookings').innerHTML =
          '<h3>Your Service Bookings</h3>' +
          '<table><tr><th>Service</th><th>Customer</th><th>Contact Info</th><th>Date</th><th>Time</th><th>Status</th><th>Action</th></tr>' +
          bookingsWithCustomers.map(item => {
            const b = item.booking;
            const customer = item.customer;
            
            let actionBtns = '';
            if (b.status === 'PENDING') {
              actionBtns = `<button onclick="updateBookingStatus(${b.id}, 'CONFIRMED')" class="btn-confirm">Confirm</button> <button onclick="updateBookingStatus(${b.id}, 'CANCELLED')" class="btn-cancel">Cancel</button>`;
            } else if (b.status === 'CONFIRMED') {
              actionBtns = `<button onclick="updateBookingStatus(${b.id}, 'COMPLETED')" class="btn-complete">Complete</button> <button onclick="updateBookingStatus(${b.id}, 'CANCELLED')" class="btn-cancel">Cancel</button>`;
            } else if (b.status === 'COMPLETED') {
              actionBtns = '<span class="status-completed">Completed</span>';
            } else if (b.status === 'CANCELLED') {
              actionBtns = '<span class="status-cancelled">Cancelled</span>';
            }
            
            const service = serviceMap[b.serviceId];
            const customerName = customer ? customer.name : 'Unknown Customer';
            const customerContact = customer ? 
              `<div class="customer-contact">
                <div><strong>Email:</strong> ${customer.email}</div>
                <div><strong>Phone:</strong> ${customer.phone}</div>
              </div>` : 
              '<div class="customer-contact">Contact info unavailable</div>';
            
            return `<tr>
              <td>${service ? service.title : 'Unknown Service'}</td>
              <td><strong>${customerName}</strong></td>
              <td>${customerContact}</td>
              <td>${b.bookingDate}</td>
              <td>${b.bookingTime}</td>
              <td><span class="status-${b.status.toLowerCase()}">${b.status}</span></td>
              <td>${actionBtns}</td>
            </tr>`;
          }).join('') + '</table>';
      } catch (error) {
        document.getElementById('providerBookings').innerHTML = '<h3>Your Service Bookings</h3><p>Failed to load bookings.</p>';
      }
    }
    loadProviderBookings();
    
    async function updateProviderStats() {
      try {
        const bookingsRes = await fetch(`${API_BASE}/bookings/provider/${user.id}/with-customers`);
        const bookingsWithCustomers = await bookingsRes.json();
        const bookings = bookingsWithCustomers.map(item => item.booking);
        
        const activeServices = myServices.length;
        const pendingBookings = bookings.filter(b => b.status === 'PENDING').length;
        const totalEarnings = bookings.filter(b => b.status === 'COMPLETED').length * 50; // Assuming $50 per service
        const avgRating = 4.5; // This would come from reviews
        
        document.getElementById('activeServices').textContent = activeServices;
        document.getElementById('pendingBookings').textContent = pendingBookings;
        document.getElementById('totalEarnings').textContent = `$${totalEarnings}`;
        document.getElementById('averageRating').textContent = `${avgRating}★`;
      } catch (error) {
        console.error('Failed to update provider stats:', error);
      }
    }
    
    updateProviderStats();
    
    window.updateBookingStatus = function(bookingId, newStatus) {
      fetch(`${API_BASE}/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
        .then(res => {
          if (res.ok) {
            loadProviderBookings();
            updateProviderStats();
            alert(`Booking ${newStatus.toLowerCase()} successfully!`);
          } else {
            alert('Failed to update booking status.');
          }
        })
        .catch(() => {
          alert('Failed to update booking status.');
        });
    };
  }
}

function updateNav() {
  const user = getUser();
  const navs = document.querySelectorAll('nav');
  navs.forEach(nav => {
    nav.innerHTML = `
      <a href="index.html">Home</a> |
      ${!user ? '<a href="login.html">Login</a> | <a href="register.html">Register</a> |' : ''}
      <a href="services.html">Services</a> |
      ${user && user.role === 'USER' ? '<a href="dashboard.html">User Dashboard</a> | <a href="bookings.html">My Bookings</a> |' : ''}
      ${user && user.role === 'PROVIDER' ? '<a href="provider.html">Provider Dashboard</a> |' : ''}
      ${user ? '<a href="profile.html">Profile</a> |' : ''}
      ${user ? '<button id="logoutBtn" style="display:inline; background:none; border:none; color:#2563eb; cursor:pointer;">Logout</button>' : ''}
    `;
    if (user) {
      const logoutBtn = nav.querySelector('#logoutBtn');
      if (logoutBtn) logoutBtn.onclick = logout;
    }
  });
}

document.addEventListener('DOMContentLoaded', updateNav);

if (document.getElementById('stats-grid')) {
  async function loadHomepageStats() {
    try {
      const servicesRes = await fetch(`${API_BASE}/services`);
      const services = await servicesRes.json();
      
      const bookingsRes = await fetch(`${API_BASE}/bookings`);
      const bookings = await bookingsRes.json();
      
      const reviewsRes = await fetch(`${API_BASE}/reviews`);
      const reviews = await reviewsRes.json();
      
      const activeServices = services.length;
      const verifiedProviders = new Set(services.map(s => s.providerId)).size;
      const happyCustomers = new Set(bookings.map(b => b.userId)).size;
      
      let avgRating = 0;
      if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        avgRating = Math.round((totalRating / reviews.length) * 10) / 10;
      }
      
      const statCards = document.querySelectorAll('.stat-card h3');
      if (statCards.length >= 4) {
        statCards[0].textContent = `${activeServices}+`;
        statCards[1].textContent = `${verifiedProviders}+`;
        statCards[2].textContent = `${happyCustomers}+`;
        statCards[3].textContent = `${avgRating}★`;
      }
    } catch (error) {
      console.error('Failed to load homepage stats:', error);
    }
  }
  loadHomepageStats();
}

if (window.location.pathname.endsWith('dashboard.html')) {
  const user = getUser();
  if (!user || user.role !== 'USER') {
    window.location.href = 'login.html';
  }
}
if (window.location.pathname.endsWith('provider.html')) {
  const user = getUser();
  if (!user || user.role !== 'PROVIDER') {
    window.location.href = 'login.html';
  }
}

if (window.location.pathname.endsWith('profile.html')) {
  const user = getUser();
  if (!user) {
    window.location.href = 'login.html';
  } else {
    const container = document.getElementById('profileContainer');
    container.innerHTML = `
      <form id="profileForm">
        <label>Name:<br><input type="text" name="name" value="${user.name}" required></label><br>
        <label>Email:<br><input type="email" name="email" value="${user.email}" required></label><br>
        <label>Phone:<br><input type="text" name="phone" value="${user.phone}" required></label><br>
        <label>User Type:<br><input type="text" name="role" value="${user.role}" readonly style="background-color: #f1f5f9; color: #64748b;"></label><br>
        <label>Password:<br><input type="password" name="password" value="${user.password}" required></label><br>
        <button type="submit">Save</button>
      </form>
      <div id="profileMessage"></div>
    `;
    document.getElementById('profileForm').onsubmit = function(e) {
      e.preventDefault();
      const updated = {
        ...user,
        name: this.name.value,
        email: this.email.value,
        phone: this.phone.value,
        password: this.password.value
      };
      saveUser(updated);
      document.getElementById('profileMessage').textContent = 'Profile updated (locally).';
    };
  }
}

if (window.location.pathname.endsWith('service.html')) {
  function getQueryParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
  }
  const serviceId = parseInt(getQueryParam('id'));
  if (!serviceId) {
    document.getElementById('serviceDetails').textContent = 'No service selected.';
  } else {
    fetch(`${API_BASE}/services/${serviceId}/details`)
      .then(res => res.json())
      .then(details => {
        const service = details.service;
        const provider = details.provider;
        const avgRating = details.averageRating;
        const reviewCount = details.reviewCount;
        
        const ratingDisplay = avgRating ? 
          `<div class="provider-rating-large">⭐ ${avgRating} (${reviewCount} reviews)</div>` : 
          '<div class="provider-rating-large">⭐ New provider</div>';
        
        document.getElementById('serviceDetails').innerHTML = `
          <div class="service-detail-header">
            <h3>${service.title}</h3>
            <div class="service-price-large">$${service.price}</div>
          </div>
          <div class="service-detail-layout">
            <div class="service-detail-main">
              <div class="service-detail-info">
                <p><strong>Category:</strong> ${service.category}</p>
                <p><strong>Location:</strong> ${service.location}</p>
                <p><strong>Description:</strong> ${service.description}</p>
              </div>
            </div>
            <div class="service-detail-sidebar">
              <div class="provider-info">
                <h4>About the Provider</h4>
                <p><strong>Name:</strong> ${provider ? provider.name : 'Unknown'}</p>
                <p><strong>Phone:</strong> ${provider ? provider.phone : 'Not available'}</p>
                ${ratingDisplay}
              </div>
            </div>
          </div>
        `;
        const user = getUser();
        if (user && user.role === 'USER') {
          document.getElementById('serviceBooking').innerHTML = `
            <h4>Book this Service</h4>
            <form id="serviceBookingForm">
              <label>Date:<br><input type="date" name="date" required></label><br>
              <label>Time:<br><input type="time" name="time" required></label><br>
              <button type="submit">Book</button>
            </form>
            <div id="serviceBookingMessage"></div>
          `;
          document.getElementById('serviceBookingForm').onsubmit = async function(e) {
            e.preventDefault();
            const bookingDate = this.date.value;
            const bookingTime = this.time.value + ':00';
            const booking = {
              userId: user.id,
              serviceId: serviceId,
              providerId: service.providerId,
              bookingDate: bookingDate,
              bookingTime: bookingTime,
              status: 'PENDING'
            };
            const res = await fetch(`${API_BASE}/bookings`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(booking)
            });
            if (res.ok) {
              document.getElementById('serviceBookingMessage').textContent = 'Booking successful!';
              setTimeout(() => { document.getElementById('serviceBookingMessage').textContent = ''; }, 1200);
            } else {
              document.getElementById('serviceBookingMessage').textContent = 'Booking failed.';
            }
          };
        }
        fetch(`${API_BASE}/reviews/service/${serviceId}`)
          .then(res => res.json())
          .then(reviews => {
            const reviewsDiv = document.getElementById('serviceReviews');
            reviewsDiv.innerHTML = '<h4>Reviews</h4>';
            if (!reviews.length) {
              reviewsDiv.innerHTML += '<p>No reviews yet.</p>';
            } else {
              reviewsDiv.innerHTML += '<ul>' + reviews.map(r => `<li><b>Rating:</b> ${r.rating} - ${r.comment}</li>`).join('') + '</ul>';
            }
            if (user && user.role === 'USER') {
              fetch(`${API_BASE}/bookings/user/${user.id}`)
                .then(res => res.json())
                .then(bookings => {
                  const hasBooked = bookings.some(b => b.serviceId === serviceId && b.status !== 'CANCELLED');
                  if (hasBooked) {
                    reviewsDiv.innerHTML += `
                      <h5>Leave a Review</h5>
                      <form id="serviceReviewForm">
                        <label>Rating (1-5):<br><input type="number" name="rating" min="1" max="5" required></label><br>
                        <label>Comment:<br><input type="text" name="comment" required></label><br>
                        <button type="submit">Submit Review</button>
                      </form>
                      <div id="serviceReviewMessage"></div>
                    `;
                    document.getElementById('serviceReviewForm').onsubmit = async function(e) {
                      e.preventDefault();
                      const rating = this.rating.value;
                      const comment = this.comment.value;
                      const review = {
                        userId: user.id,
                        serviceId: serviceId,
                        rating: parseInt(rating),
                        comment: comment
                      };
                      const res = await fetch(`${API_BASE}/reviews`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(review)
                      });
                      if (res.ok) {
                        document.getElementById('serviceReviewMessage').textContent = 'Review submitted!';
                        setTimeout(() => { window.location.reload(); }, 1000);
                      } else {
                        document.getElementById('serviceReviewMessage').textContent = 'Failed to submit review.';
                      }
                    };
                  }
                });
            }
          });
      });
  }
} 