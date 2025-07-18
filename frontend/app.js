// app.js - Handles frontend logic for Local Service Provider

// Helper: Get API base URL
const API_BASE = 'http://localhost:8080';

// Helper: Save user info to localStorage
function saveUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

// Helper: Get user info from localStorage
function getUser() {
  return JSON.parse(localStorage.getItem('user'));
}

// Helper: Remove user info (logout)
function logout() {
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

// Login form handler
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
      window.location.href = 'dashboard.html';
    } else {
      document.getElementById('loginMessage').textContent = 'Invalid credentials.';
    }
  };
}

// Register form handler
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

// Service listing
if (document.getElementById('servicesList')) {
  fetch(`${API_BASE}/services`)
    .then(res => res.json())
    .then(services => {
      const div = document.getElementById('servicesList');
      if (!services.length) {
        div.textContent = 'No services found.';
        return;
      }
      const user = getUser();
      div.innerHTML = '<ul>' + services.map(s => {
        let bookBtn = '';
        let reviewBtn = '';
        if (user && user.role === 'USER') {
          bookBtn = `<button onclick="showBookingForm(${s.id}, '${s.title}', ${s.providerId})">Book</button>`;
          reviewBtn = `<button onclick="showReviewSection(${s.id}, '${s.title}')">Reviews</button>`;
        } else {
          reviewBtn = `<button onclick="showReviewSection(${s.id}, '${s.title}')">Reviews</button>`;
        }
        return `<li><b>${s.title}</b> - ${s.category} - ${s.location} - $${s.price} ${bookBtn} ${reviewBtn}</li>`;
      }).join('') + '</ul>';
      // Booking form placeholder
      div.innerHTML += '<div id="bookingFormContainer"></div>';
    })
    .catch(() => {
      document.getElementById('servicesList').textContent = 'Failed to load services.';
    });
}

// Show booking form for a service
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
      bookingTime: bookingTime, // <-- fix here
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

// Show reviews and review form for a service
window.showReviewSection = async function(serviceId, serviceTitle) {
  const user = getUser();
  const container = document.getElementById('serviceReviewContainer');
  container.innerHTML = `<h3>Reviews for: ${serviceTitle}</h3><div id="reviewsList">Loading...</div>`;
  // Fetch reviews
  fetch(`${API_BASE}/reviews/service/${serviceId}`)
    .then(res => res.json())
    .then(reviews => {
      const reviewsDiv = document.getElementById('reviewsList');
      if (!reviews.length) {
        reviewsDiv.textContent = 'No reviews yet.';
      } else {
        reviewsDiv.innerHTML = '<ul>' + reviews.map(r => `<li><b>Rating:</b> ${r.rating} - ${r.comment}</li>`).join('') + '</ul>';
      }
      // If user is logged in and has booked this service, show review form
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

// Bookings listing (fetch and display)
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
        // Fetch all services to map serviceId to service name
        const servicesRes = await fetch(`${API_BASE}/services`);
        const services = await servicesRes.json();
        const serviceMap = {};
        services.forEach(s => { serviceMap[s.id] = s; });
        // Render bookings
        document.getElementById('bookingsList').innerHTML =
          '<table><tr><th>Service</th><th>Date</th><th>Time</th><th>Status</th><th>Action</th></tr>' +
          bookings.map(b => {
            let cancelBtn = '';
            if (b.status === 'PENDING' || b.status === 'CONFIRMED') {
              cancelBtn = `<button onclick=\"cancelBooking(${b.id})\">Cancel</button>`;
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

// Cancel booking function
window.cancelBooking = function(bookingId) {
  if (!confirm('Are you sure you want to cancel this booking?')) return;
  // PATCH or PUT to update booking status to CANCELLED
  fetch(`${API_BASE}/bookings/${bookingId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'CANCELLED' })
  })
    .then(res => {
      if (res.ok) {
        // Reload bookings list
        if (document.getElementById('bookingsList')) {
          // Re-run the bookings fetch logic
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
                    cancelBtn = `<button onclick=\\"cancelBooking(${b.id})\\">Cancel</button>`;
                  }
                  return `<tr>
                    <td>${serviceMap[b.serviceId] ? serviceMap[b.serviceId].title : b.serviceId}</td>
                    <td>${b.bookingDate}</td>
                    <td>${b.bookingTime}</td>
                    <td>${b.status}</td>
                    <td>${cancelBtn}</td>
                  </tr>`;
                }).join('') + '</table>';
            });
        }
      } else {
        alert('Failed to cancel booking.');
      }
    });
};

// User dashboard info (stub)
if (document.getElementById('userInfo')) {
  const user = getUser();
  if (!user) {
    window.location.href = 'login.html';
  } else {
    document.getElementById('userInfo').innerHTML = `<p>Welcome, <b>${user.name}</b> (${user.role})</p><button onclick="logout()">Logout</button>`;
  }
}

// Provider dashboard (manage services)
if (document.getElementById('providerServices')) {
  const user = getUser();
  if (!user || user.role !== 'PROVIDER') {
    document.getElementById('providerServices').textContent = 'Only providers can access this page.';
  } else {
    // Fetch and display provider's services
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

    // Add Service
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

    // Edit Service
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

    // Delete Service
    window.deleteService = function(serviceId) {
      if (!confirm('Are you sure you want to delete this service?')) return;
      fetch(`${API_BASE}/services/${serviceId}`, { method: 'DELETE' })
        .then(res => {
          if (res.ok) {
            loadProviderServices();
          } else {
            alert('Failed to delete service.');
          }
        });
    };

    window.hideServiceForm = function() {
      document.getElementById('serviceFormContainer').innerHTML = '';
    };

    // Provider Bookings Management
    async function loadProviderBookings() {
      // Fetch all services for this provider
      const servicesRes = await fetch(`${API_BASE}/services`);
      const services = await servicesRes.json();
      const myServices = services.filter(s => s.providerId === user.id);
      if (!myServices.length) {
        document.getElementById('providerBookings').innerHTML = '';
        return;
      }
      // Fetch all bookings for these services
      let allBookings = [];
      for (const s of myServices) {
        const res = await fetch(`${API_BASE}/bookings/user/${user.id}`); // fallback if no endpoint for provider bookings
        // Ideally, there should be an endpoint to get bookings by providerId
        // For now, fetch all bookings and filter
        const bookingsRes = await fetch(`${API_BASE}/bookings/user/${user.id}`);
        const bookings = await bookingsRes.json();
        allBookings = allBookings.concat(bookings.filter(b => b.providerId === user.id && b.serviceId === s.id));
      }
      // Remove duplicates
      allBookings = allBookings.filter((b, i, arr) => arr.findIndex(x => x.id === b.id) === i);
      if (!allBookings.length) {
        document.getElementById('providerBookings').innerHTML = '<h3>Your Service Bookings</h3><p>No bookings found.</p>';
        return;
      }
      // Render bookings
      document.getElementById('providerBookings').innerHTML =
        '<h3>Your Service Bookings</h3>' +
        '<table><tr><th>Service</th><th>User</th><th>Date</th><th>Time</th><th>Status</th><th>Action</th></tr>' +
        allBookings.map(b => {
          let actionBtns = '';
          if (b.status === 'PENDING') {
            actionBtns = `<button onclick=\"updateBookingStatus(${b.id}, 'CONFIRMED')\">Confirm</button> <button onclick=\"updateBookingStatus(${b.id}, 'CANCELLED')\">Cancel</button>`;
          } else if (b.status === 'CONFIRMED') {
            actionBtns = `<button onclick=\"updateBookingStatus(${b.id}, 'COMPLETED')\">Complete</button> <button onclick=\"updateBookingStatus(${b.id}, 'CANCELLED')\">Cancel</button>`;
          }
          return `<tr>
            <td>${myServices.find(s => s.id === b.serviceId)?.title || b.serviceId}</td>
            <td>${b.userId}</td>
            <td>${b.bookingDate}</td>
            <td>${b.bookingTime}</td>
            <td>${b.status}</td>
            <td>${actionBtns}</td>
          </tr>`;
        }).join('') + '</table>';
    }
    loadProviderBookings();
    // Update booking status
    window.updateBookingStatus = function(bookingId, newStatus) {
      fetch(`${API_BASE}/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
        .then(res => {
          if (res.ok) {
            loadProviderBookings();
          } else {
            alert('Failed to update booking status.');
          }
        });
    };
  }
}

// Navigation and access control
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
      ${user ? '<button id="logoutBtn" style="display:inline; background:none; border:none; color:#0074d9; cursor:pointer;">Logout</button>' : ''}
    `;
    if (user) {
      const logoutBtn = nav.querySelector('#logoutBtn');
      if (logoutBtn) logoutBtn.onclick = logout;
    }
  });
}

document.addEventListener('DOMContentLoaded', updateNav);

// Restrict access to dashboard and provider pages
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

// User profile page logic
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
        <label>Password:<br><input type="password" name="password" value="${user.password}" required></label><br>
        <button type="submit">Save</button>
      </form>
      <div id="profileMessage"></div>
    `;
    document.getElementById('profileForm').onsubmit = function(e) {
      e.preventDefault();
      // For now, just update localStorage (no backend endpoint for update)
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

// Service details page logic
if (window.location.pathname.endsWith('service.html')) {
  // Helper to get query param
  function getQueryParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
  }
  const serviceId = parseInt(getQueryParam('id'));
  if (!serviceId) {
    document.getElementById('serviceDetails').textContent = 'No service selected.';
  } else {
    // Fetch and show service info
    fetch(`${API_BASE}/services/${serviceId}`)
      .then(res => res.json())
      .then(service => {
        document.getElementById('serviceDetails').innerHTML = `
          <h3>${service.title}</h3>
          <p><b>Category:</b> ${service.category}</p>
          <p><b>Location:</b> ${service.location}</p>
          <p><b>Price:</b> $${service.price}</p>
          <p><b>Description:</b> ${service.description}</p>
        `;
        // Show booking form for users
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
        // Show reviews
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
            // If user has booked, show review form
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