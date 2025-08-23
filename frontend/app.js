const API_BASE = 'http://localhost:8080';

// Fetch and update hero stats from backend
async function loadHeroStats() {
  try {
    const response = await fetch(`${API_BASE}/services/platform-stats`);
    if (response.ok) {
      const stats = await response.json();
      
      // Update hero stats with animation
      const providersElement = document.getElementById('hero-providers-count');
      const servicesElement = document.getElementById('hero-services-count');
      const ratingElement = document.getElementById('hero-rating');
      
      if (providersElement) {
        animateNumber(providersElement, stats.verifiedProviders || 0, '+');
      }
      
      if (servicesElement) {
        animateNumber(servicesElement, stats.activeServices || 0, '+');
      }
      
      if (ratingElement) {
        const rating = stats.averageRating || 0;
        animateNumber(ratingElement, rating, '★', 1);
      }
      
      console.log('Hero stats updated successfully:', stats);
    } else {
      console.warn('Failed to fetch platform stats, using fallback values');
    }
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    console.log('Using fallback hero stats values');
  }
}

// Animate number counting up effect
function animateNumber(element, targetValue, suffix = '', decimals = 0) {
  const startValue = 0;
  const duration = 2000; // 2 seconds
  const startTime = performance.now();
  
  function updateNumber(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function for smooth animation
    const easeOutCubic = 1 - Math.pow(1 - progress, 3);
    const currentValue = startValue + (targetValue - startValue) * easeOutCubic;
    
    if (decimals > 0) {
      element.textContent = currentValue.toFixed(decimals) + suffix;
    } else {
      element.textContent = Math.floor(currentValue) + suffix;
    }
    
    if (progress < 1) {
      requestAnimationFrame(updateNumber);
    }
  }
  
  requestAnimationFrame(updateNumber);
}

// Load platform stats for the dedicated stats section
async function loadPlatformStats() {
  try {
    const response = await fetch(`${API_BASE}/services/platform-stats`);
    if (response.ok) {
      const stats = await response.json();
      
      // Update platform stats with animation
      const platformServicesElement = document.getElementById('platform-services-count');
      const platformProvidersElement = document.getElementById('platform-providers-count');
      const platformCustomersElement = document.getElementById('platform-customers-count');
      const platformRatingElement = document.getElementById('platform-rating');
      
      if (platformServicesElement) {
        animateNumber(platformServicesElement, stats.activeServices || 0, '+');
      }
      
      if (platformProvidersElement) {
        animateNumber(platformProvidersElement, stats.verifiedProviders || 0, '+');
      }
      
      if (platformCustomersElement) {
        animateNumber(platformCustomersElement, stats.happyCustomers || 0, '+');
      }
      
      if (platformRatingElement) {
        const rating = stats.averageRating || 0;
        animateNumber(platformRatingElement, rating, '★', 1);
      }
      
      console.log('Platform stats updated successfully:', stats);
    } else {
      console.warn('Failed to fetch platform stats for stats section, using fallback values');
    }
  } catch (error) {
    console.error('Error fetching platform stats for stats section:', error);
    console.log('Using fallback platform stats values');
  }
}

// Load hero stats when page loads
document.addEventListener('DOMContentLoaded', function() {
  // Only load stats on homepage
  if (document.getElementById('hero-providers-count')) {
    loadHeroStats();
  }
  
  // Load platform stats section if it exists
  if (document.getElementById('platform-services-count')) {
    loadPlatformStats();
  }
});

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

// Add validation functions at the top
const validationRules = {
  name: /^[a-zA-Z\s]{2,50}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  phone: /^[\d\s+()-]{10,15}$/,
  price: /^\d+(\.\d{1,2})?$/,
  otp: /^\d{6}$/
};

function validateInput(value, type) {
  if (!validationRules[type]) return true; // If no regex defined for this type
  return validationRules[type].test(value);
}

function getValidationMessage(type) {
  const messages = {
    name: "Name should only contain letters and spaces (2-50 characters)",
    email: "Please enter a valid email address",
    phone: "Please enter a valid phone number",
    password: "Password must be at least 8 characters long and contain at least one letter and one number",
    price: "Please enter a valid price (e.g., 99.99)",
    otp: "OTP should be 6 digits"
  };
  return messages[type] || "Invalid input";
}

// Update the registration form handler
if (document.getElementById('registerForm')) {
  document.getElementById('registerForm').onsubmit = async function(e) {
    e.preventDefault();
    const name = this.name.value;
    const email = this.email.value;
    const password = this.password.value;
    const phone = this.phone.value;
    const role = this.role.value;
    
    // Validate all inputs
    const validations = {
      name: validateInput(name, 'name'),
      email: validateInput(email, 'email'),
      password: validateInput(password, 'password'),
      phone: validateInput(phone, 'phone')
    };

    // Check for validation errors
    const errors = Object.entries(validations)
      .filter(([_, isValid]) => !isValid)
      .map(([field]) => getValidationMessage(field));

    if (errors.length > 0) {
      document.getElementById('registerMessage').innerHTML = `
        <div class="error-message">
          ${errors.join('<br>')}
        </div>
      `;
      return;
    }

    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone, role })
    });
    if (res.ok) {
      document.getElementById('registerMessage').innerHTML = '<div class="success-message">Registration successful! Please login.</div>';
      setTimeout(() => window.location.href = 'login.html', 1500);
    } else {
      const errorText = await res.text();
      document.getElementById('registerMessage').innerHTML = `<div class="error-message">${errorText || 'Registration failed.'}</div>`;
    }
  };
}

let allServices = [];
let allServicesWithDetails = [];

if (document.getElementById('servicesList')) {
  // Check for category parameter in URL and populate search bar
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category');
  
  if (categoryParam) {
    // Wait for page to load, then populate search bar and trigger search
    setTimeout(() => {
      const searchInput = document.getElementById('searchInput');
      if (searchInput) {
        searchInput.value = categoryParam;
        // Trigger search with the category term
        searchServices();
      }
    }, 100);
  }
  
  // Add a function to get category image
  function getCategoryImage(category) {
    // Main category images
    const categoryImages = {
      'Home Services': 'images/homeservice.jpg',
      'Professional Services': 'images/professional.jpeg',
      'Health & Wellness': 'images/health.jpg',
      'Education & Training': 'images/training.jpg'
    };

    // Category mapping for specific services
    const categoryMapping = {
      // Home Services
      'Home Repair': 'Home Services',
      'Cleaning': 'Home Services',
      'Gardening': 'Home Services',
      'Moving': 'Home Services',
      
      // Professional Services
      'Tech Support': 'Professional Services',
      'Automotive': 'Professional Services',
      'Professional Services': 'Professional Services',
      
      // Health & Wellness
      'Fitness': 'Health & Wellness',
      'Health & Wellness': 'Health & Wellness',
      'Pet Care': 'Health & Wellness',
      'Child Care': 'Health & Wellness',
      
      // Education & Training
      'Education': 'Education & Training',
      'Education & Training': 'Education & Training'
    };

    // Log for debugging
    console.log('Service Category:', category);
    console.log('Mapped Category:', categoryMapping[category]);
    
    // Get the main category for this service
    const mainCategory = categoryMapping[category];
    
    // Return the appropriate image
    if (mainCategory && categoryImages[mainCategory]) {
      return categoryImages[mainCategory];
    }
    
    // If no mapping found, return a default image
    console.log('No mapping found for:', category);
    return 'images/professional.jpeg';
  }

  // Load initial services
  loadAllServices();
}

async function loadAllServices() {
  try {
    const response = await fetch(`${API_BASE}/services`);
    const services = await response.json();
      allServices = services;
    await renderServices(services);
    populateFilters();
  } catch (error) {
    console.error('Error loading services:', error);
    document.getElementById('servicesList').textContent = 'Failed to load services.';
  }
}

async function renderServices(services) {
      const div = document.getElementById('servicesList');
  if (!services || services.length === 0) {
    div.innerHTML = '<div class="no-services">No services found.</div>';
        return;
      }
  
  // Log all unique categories for debugging
  const uniqueCategories = [...new Set(services.map(s => s.category))];
  console.log('All unique categories in services:', uniqueCategories);
      
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
          bookBtn = `<button class="btn-book-now" onclick="showBookingForm(${service.id}, '${service.title}', ${service.providerId})">Book Now</button>`;
              reviewBtn = `<button onclick="showReviewSection(${service.id}, '${service.title}')">Reviews</button>`;
            } else {
              reviewBtn = `<button onclick="showReviewSection(${service.id}, '${service.title}')">Reviews</button>`;
            }
            
            const ratingDisplay = avgRating 
              ? `<div class="amazon-service-rating">
               <span class="stars">${'&starf;'.repeat(Math.round(avgRating))}${'&star;'.repeat(5 - Math.round(avgRating))}</span>
               <span class="review-count">${reviewCount} reviews</span>
                 </div>`
              : '<div class="amazon-service-rating">No reviews yet</div>';
            
            serviceCards.push(`
              <div class="amazon-service-card" data-category="${service.category}" data-location="${service.location}" data-price="${service.price}" data-title="${service.title.toLowerCase()}">
            <div class="amazon-service-image" style="background-image: url('${getCategoryImage(service.category)}')">
              <div class="category-tag">${service.category}</div>
                </div>
                <div class="amazon-service-details">
                  <h3><a href='service.html?id=${service.id}'>${service.title}</a></h3>
                  <p class="provider-name">Provider: ${provider ? provider.name : 'Unknown'}</p>
                  ${ratingDisplay}
              <div class="amazon-service-price">&#8377;${service.price}</div>
                  ${bookBtn}
                </div>
              </div>
            `);
          } else {
            serviceCards.push(`
              <div class="service-card" data-category="${service.category}" data-location="${service.location}" data-price="${service.price}" data-title="${service.title.toLowerCase()}">
                <h3><a href='service.html?id=${service.id}'>${service.title}</a></h3>
                <p><strong>Category:</strong> ${service.category}</p>
                <p><strong>Location:</strong> ${service.location}</p>
            <p><strong>Price:</strong> &#8377;${service.price}</p>
              </div>
            `);
          }
        } catch (error) {
          serviceCards.push(`
            <div class="service-card" data-category="${service.category}" data-location="${service.location}" data-price="${service.price}" data-title="${service.title.toLowerCase()}">
              <h3><a href='service.html?id=${service.id}'>${service.title}</a></h3>
              <p><strong>Category:</strong> ${service.category}</p>
              <p><strong>Location:</strong> ${service.location}</p>
          <p><strong>Price:</strong> &#8377;${service.price}</p>
            </div>
          `);
        }
      }
      
  // Clear existing services and populate with new ones
      div.innerHTML = serviceCards.join('');
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

window.searchServices = async function() {
  const searchTerm = document.getElementById('searchInput').value;
  const categoryFilter = document.getElementById('categoryFilter').value;
  const locationFilter = document.getElementById('locationFilter').value;
  const priceFilter = document.getElementById('priceFilter').value;
  
  // Show loading state
  const servicesList = document.getElementById('servicesList');
  const searchResults = document.getElementById('searchResults');
  
  if (searchResults) {
    searchResults.innerHTML = '<div class="search-summary">Searching...</div>';
  }
  
  try {
    // Map broad categories to specific database categories
    const categoryMapping = {
      'Home Services': ['Home Repair', 'Cleaning', 'Gardening', 'Moving'],
      'Professional Services': ['Professional Services', 'Tech Support'],
      'Health & Wellness': ['Health & Wellness', 'Fitness', 'Yoga'],
      'Education & Training': ['Education & Training', 'Education']
    };
    
    // If searching by a broad category, search for all related specific categories
    let finalSearchTerm = searchTerm;
    if (searchTerm && categoryMapping[searchTerm]) {
      // For broad categories, we'll use the category filter instead of search term
      finalSearchTerm = '';
      // We'll search all services and filter client-side for better results
    }
    
    // Build query parameters
    const params = new URLSearchParams();
    if (finalSearchTerm) params.append('searchTerm', finalSearchTerm);
    if (categoryFilter) params.append('category', categoryFilter);
    if (locationFilter) params.append('location', locationFilter);
    if (priceFilter) params.append('priceRange', priceFilter);
    
    // If no specific filters and we have a broad category search, get all services and filter client-side
    let response, data;
    if (searchTerm && categoryMapping[searchTerm] && !categoryFilter && !locationFilter && !priceFilter) {
      response = await fetch(`${API_BASE}/services`);
      const allServices = await response.json();
      const mappedCategories = categoryMapping[searchTerm];
      const filteredServices = allServices.filter(service => 
        mappedCategories.some(cat => 
          service.category.toLowerCase().includes(cat.toLowerCase()) ||
          cat.toLowerCase().includes(service.category.toLowerCase()) ||
          service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      data = { services: filteredServices };
    } else {
      response = await fetch(`${API_BASE}/services/search?${params.toString()}`);
      data = await response.json();
    }
    
    if (response.ok) {
      const services = data.services || [];
      
      if (services.length === 0) {
        servicesList.innerHTML = '<div class="no-services">No services found matching your criteria.</div>';
        if (searchResults) {
          searchResults.innerHTML = '<div class="search-summary">No services found</div>';
        }
        return;
      }
      
      // Render the services
      await renderServices(services);
      
  if (searchResults) {
        searchResults.innerHTML = `<div class="search-summary">Found ${services.length} service${services.length !== 1 ? 's' : ''}</div>`;
      }
    } else {
      servicesList.innerHTML = '<div class="error-message">Failed to search services. Please try again.</div>';
      if (searchResults) {
        searchResults.innerHTML = '';
      }
    }
  } catch (error) {
    console.error('Search error:', error);
    servicesList.innerHTML = '<div class="error-message">Failed to search services. Please try again.</div>';
    if (searchResults) {
      searchResults.innerHTML = '';
    }
  }
};

window.filterServices = function() {
  searchServices();
};

// Debounced search to prevent too many API calls while typing
let searchTimeout;
window.debouncedSearch = function() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchServices();
  }, 300); // Wait 300ms after user stops typing
};

// Stripe publishable key
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51RoQN5Jca3aSItTY1BucdHOLHJHi77Y5Zty6vNrBHyoFYz64pwBR1Fan7v4lbMbxyw6QrVC4xAkmp9CayIpL6Iry00wlJ0hHst';

window.showBookingForm = function(serviceId, serviceTitle, providerId) {
  const user = getUser();
  if (!user) {
    alert('Please login to book a service.');
    window.location.href = 'login.html';
    return;
  }
  const overlay = document.getElementById('modalOverlay');
  const modal = document.getElementById('bookingModal');
  overlay.style.display = 'flex';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <button class="modal-close" onclick="hideBookingModal()">&times;</button>
    <h3>Book: ${serviceTitle}</h3>
    <form id="bookingForm">
      <label>Date:<br><input type="date" name="date" required min="${new Date().toISOString().split('T')[0]}"></label><br>
      <label>Time:<br><input type="time" name="time" required></label><br>
      <label>Address:<br><input type="text" name="address" required></label><br>
      <button type="submit">Pay & Book</button>
    </form>
    <div id="bookingMessage"></div>
  `;
  overlay.onclick = hideBookingModal;
  document.getElementById('bookingForm').onsubmit = async function(e) {
    e.preventDefault();
    const address = this.address.value;

    const bookingDate = this.date.value;
    const bookingTime = this.time.value + ':00';
    const bookingPayload = {
      userId: user.id,
      serviceId: serviceId,
      bookingDate: bookingDate,
      bookingTime: bookingTime,
      address: address,
      successUrl: window.location.origin + '/success.html',
      cancelUrl: window.location.origin + '/cancel.html',
      currency: 'inr'
    };
    const res = await fetch(`${API_BASE}/bookings/create-with-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingPayload)
    });
    let data;
    if (res.ok) {
      data = await res.json();
    } else {
      const errorText = await res.text();
      document.getElementById('bookingMessage').textContent = 'Booking/payment failed: ' + errorText;
      return;
    }
    if (data.sessionId) {
      localStorage.setItem('lastBookingId', data.bookingId);
      const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
      stripe.redirectToCheckout({ sessionId: data.sessionId });
    } else {
      document.getElementById('bookingMessage').textContent = 'Booking/payment failed.';
    }
  };
};
window.hideBookingModal = function() {
  document.getElementById('modalOverlay').style.display = 'none';
  document.getElementById('bookingModal').style.display = 'none';
  document.getElementById('bookingModal').innerHTML = '';
};

window.showReviewSection = async function(serviceId, serviceTitle) {
  const overlay = document.getElementById('reviewModalOverlay');
  const modal = document.getElementById('reviewModal');
  overlay.style.display = 'flex';
  modal.style.display = 'flex';
  modal.innerHTML = `<button class="modal-close" onclick="hideReviewModal()">&times;</button><h3>Reviews for: ${serviceTitle}</h3><div id="reviewsList">Loading...</div>`;
  overlay.onclick = hideReviewModal;
  fetch(`${API_BASE}/reviews/service/${serviceId}`)
    .then(res => res.json())
    .then(reviews => {
      const reviewsDiv = document.getElementById('reviewsList');
      if (!reviews.length) {
        reviewsDiv.textContent = 'No reviews yet.';
      } else {
        reviewsDiv.innerHTML = '<ul>' + reviews.map(r => `<li><b>Rating:</b> ${r.rating} - ${r.comment}</li>`).join('') + '</ul>';
      }
      const user = getUser();
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
window.hideReviewModal = function() {
  document.getElementById('reviewModalOverlay').style.display = 'none';
  document.getElementById('reviewModal').style.display = 'none';
  document.getElementById('reviewModal').innerHTML = '';
};

if (document.getElementById('bookingsList')) {
  const user = getUser();
  if (!user) {
    document.getElementById('bookingsList').textContent = 'Please login to view your bookings.';
  } else {
    let allBookings = [];
    let allServices = {};

    function updateBookingStats() {
      const pendingCount = allBookings.filter(b => b.status === 'PENDING').length;
      const confirmedCount = allBookings.filter(b => b.status === 'CONFIRMED').length;
      const completedCount = allBookings.filter(b => b.status === 'COMPLETED').length;
      const cancelledCount = allBookings.filter(b => b.status === 'CANCELLED').length;

      document.getElementById('pendingCount').textContent = pendingCount;
      document.getElementById('confirmedCount').textContent = confirmedCount;
      document.getElementById('completedCount').textContent = completedCount;
      document.getElementById('cancelledCount').textContent = cancelledCount;
    }

    function renderBookings() {
      const statusFilter = document.getElementById('statusFilter').value;
      const numEntries = document.getElementById('showEntries').value;
      
      // Filter bookings by status
      let filteredBookings = allBookings;
      if (statusFilter !== 'ALL') {
        filteredBookings = allBookings.filter(b => b.status === statusFilter);
      }

      // Apply limit if not showing all
      const bookingsToShow = numEntries === 'all' ? filteredBookings : filteredBookings.slice(0, parseInt(numEntries));

      if (!bookingsToShow.length) {
        document.getElementById('bookingsList').innerHTML = `<p>No ${statusFilter.toLowerCase()} bookings found.</p>`;
          return;
        }

      document.getElementById('bookingsList').innerHTML = bookingsToShow.map(b => {
        const service = allServices[b.serviceId] || { title: 'Unknown Service' };
            let cancelBtn = '';
            if (b.status === 'PENDING' || b.status === 'CONFIRMED') {
          cancelBtn = `<button class="btn-cancel" onclick="cancelBooking(${b.id})">Cancel Booking</button>`;
            }
        
        let statusClass = '';
        switch(b.status) {
          case 'PENDING':
            statusClass = 'status-warning';
            break;
          case 'CONFIRMED':
            statusClass = 'status-info';
            break;
          case 'COMPLETED':
            statusClass = 'status-success';
            break;
          case 'CANCELLED':
            statusClass = 'status-danger';
            break;
            }
        
        return `
          <div class="booking-card">
            <div class="booking-card-image"></div>
            <div class="booking-card-details">
              <h3><a href="service.html?id=${b.serviceId}">${service.title}</a></h3>
              <p><strong>Date:</strong> ${b.bookingDate} at ${b.bookingTime}</p>
              <p><strong>Price:</strong> &#8377;${service.price || 'N/A'}</p>
              <p><strong>Address:</strong> ${b.address || 'Not provided'}</p>
            </div>
            <div class="booking-card-actions">
              <span class="status ${statusClass}">${b.status}</span>
              ${cancelBtn}
            </div>
          </div>
        `;
      }).join('');
    }

    async function fetchDataAndRender() {
      try {
        const [bookingsRes, servicesRes] = await Promise.all([
          fetch(`${API_BASE}/bookings/user/${user.id}`),
          fetch(`${API_BASE}/services`)
        ]);

        allBookings = await bookingsRes.json();
        const services = await servicesRes.json();
        services.forEach(s => { allServices[s.id] = s; });
        
        // Sort bookings by most recent date
        allBookings.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

        updateBookingStats();
        renderBookings();
      } catch (error) {
        document.getElementById('bookingsList').innerHTML = '<p>Failed to load bookings.</p>';
      }
    }

    // Add event listeners for filters
    document.getElementById('statusFilter').addEventListener('change', renderBookings);
    document.getElementById('showEntries').addEventListener('change', renderBookings);
    
    fetchDataAndRender();
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
                `<table class="bookings-table">
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${bookings.map((b, i) => {
                  let cancelBtn = '';
                  if (b.status === 'PENDING' || b.status === 'CONFIRMED') {
                    cancelBtn = `<button onclick="cancelBooking(${b.id})">Cancel</button>`;
                  }
                      const service = serviceMap[b.serviceId];
                      return `<tr class="${i % 2 === 0 ? 'even' : 'odd'}">
                        <td><a href="service.html?id=${b.serviceId}" class="service-link">${service ? service.title : b.serviceId}</a></td>
                    <td>${b.bookingDate}</td>
                    <td>${b.bookingTime}</td>
                        <td><span class="status-${b.status.toLowerCase()}">${b.status}</span></td>
                    <td>${cancelBtn}</td>
                  </tr>`;
                    }).join('')}
                  </tbody>
                </table>`;
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
              `<li><b>${s.title}</b> - ${s.category} - ${s.location} - &#8377;${s.price}
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
          <label>Category:<br>
            <select name="category" required>
              <option value="">Select Category</option>
              <option value="Home Services">Home Services</option>
              <option value="Professional Services">Professional Services</option>
              <option value="Health & Wellness">Health & Wellness</option>
              <option value="Education & Training">Education & Training</option>
            </select>
          </label><br>
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
        const price = form.price.value;

        if (!validateInput(price, 'price')) {
          alert(getValidationMessage('price'));
          return;
        }

        if (parseFloat(price) < 50) {
          alert('Minimum price is ₹50 due to Stripe requirements.');
          return;
        }
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
              <label>Category:<br>
                <select name="category" required>
                  <option value="">Select Category</option>
                  <option value="Home Services" ${service.category === 'Home Services' ? 'selected' : ''}>Home Services</option>
                  <option value="Professional Services" ${service.category === 'Professional Services' ? 'selected' : ''}>Professional Services</option>
                  <option value="Health & Wellness" ${service.category === 'Health & Wellness' ? 'selected' : ''}>Health & Wellness</option>
                  <option value="Education & Training" ${service.category === 'Education & Training' ? 'selected' : ''}>Education & Training</option>
                </select>
              </label><br>
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
            if (parseFloat(form.price.value) < 50) {
              alert('Minimum price is ₹50 due to Stripe requirements.');
              return;
            }
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
      fetch(`${API_BASE}/bookings/provider/${user.id}/with-customers`)
        .then(res => res.json())
        .then(bookingsWithCustomers => {
        if (!bookingsWithCustomers.length) {
          document.getElementById('providerBookings').innerHTML = '<h3>Your Service Bookings</h3><p>No bookings found.</p>';
          return;
        }
          fetch(`${API_BASE}/services`).then(res => res.json()).then(services => {
        const myServices = services.filter(s => s.providerId === user.id);
        const serviceMap = {};
        myServices.forEach(s => { serviceMap[s.id] = s; });
        document.getElementById('providerBookings').innerHTML =
          '<h3>Your Service Bookings</h3>' +
              '<table><tr><th>Service</th><th>Customer</th><th>Contact Info</th><th>Address</th><th>Date</th><th>Time</th><th>Status</th><th>Payout</th><th>Action</th></tr>' +
          bookingsWithCustomers.map(item => {
            const b = item.booking;
            const customer = item.customer;
            let actionBtns = '';
                if (b.status === 'CONFIRMED' && b.paymentStatus === 'PAID') {
                  actionBtns = `<button onclick="completeBookingWithOtp(${b.id})" class="btn-complete">Complete with OTP</button>`;
            } else if (b.status === 'COMPLETED') {
              actionBtns = '<span class="status-completed">Completed</span>';
            } else if (b.status === 'CANCELLED') {
              actionBtns = '<span class="status-cancelled">Cancelled</span>';
                } else if (b.status === 'PENDING') {
                  actionBtns = `<button onclick="updateBookingStatus(${b.id}, 'CONFIRMED')" class="btn-confirm">Confirm</button> <button onclick="updateBookingStatus(${b.id}, 'CANCELLED')" class="btn-cancel">Cancel</button>`;
                }
                let payoutDisplay = '';
                if (b.providerPayoutStatus === 'PAID') {
                  payoutDisplay = `<span style='color:green;'>₹${b.providerPayoutAmount || 0} (Paid)</span>`;
                } else if (b.paymentStatus === 'PAID') {
                  payoutDisplay = `<span style='color:orange;'>Pending</span>`;
                } else {
                  payoutDisplay = '-';
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
              <td>${b.address || ''}</td>
              <td>${b.bookingDate}</td>
              <td>${b.bookingTime}</td>
              <td><span class="status-${b.status.toLowerCase()}">${b.status}</span></td>
                  <td>${payoutDisplay}</td>
              <td>${actionBtns}</td>
            </tr>`;
          }).join('') + '</table>';
          });
        })
        .catch(() => {
        document.getElementById('providerBookings').innerHTML = '<h3>Your Service Bookings</h3><p>Failed to load bookings.</p>';
        });
    }
    loadProviderBookings();
    
    async function updateProviderStats() {
      try {
        const statsRes = await fetch(`${API_BASE}/services/provider/${user.id}/stats`);
        if (!statsRes.ok) throw new Error('Failed to fetch provider stats');
        const stats = await statsRes.json();
        document.getElementById('activeServices').textContent = stats.activeServices;
        document.getElementById('pendingBookings').textContent = stats.pendingBookings;
        document.getElementById('totalEarnings').innerHTML = `₹${stats.totalEarnings}`;
        document.getElementById('averageRating').innerHTML = `${stats.averageRating || '0'}★`;
      } catch (error) {
        console.error('Failed to update provider stats:', error);
        document.getElementById('activeServices').textContent = 'Error';
        document.getElementById('pendingBookings').textContent = 'Error';
        document.getElementById('totalEarnings').textContent = 'Error';
        document.getElementById('averageRating').textContent = 'Error';
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

window.completeBookingWithOtp = function(bookingId) {
  const otp = prompt('Enter OTP provided by the user:');
  if (!otp) return;
  
  if (!validateInput(otp, 'otp')) {
    alert(getValidationMessage('otp'));
    return;
  }

  fetch(`${API_BASE}/bookings/complete-with-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookingId, otp })
  })
    .then(res => res.text())
    .then(msg => alert(msg));
};

function updateNav() {
  const user = getUser();
  const navs = document.querySelectorAll('nav');
  navs.forEach(nav => {
    nav.innerHTML = `
      <div class="nav-container">
        <a href="index.html" class="nav-brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          LocalService
        </a>
        
        <button class="nav-mobile-toggle" aria-label="Toggle menu">
          <svg viewBox="0 0 24 24">
            <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>

        <div class="nav-links">
          <a href="services.html" class="nav-link ${window.location.pathname.endsWith('services.html') ? 'active' : ''}">Services</a>
          ${!user ? `
            <a href="login.html" class="nav-link ${window.location.pathname.endsWith('login.html') ? 'active' : ''}">Login</a>
            <a href="register.html" class="nav-link-button">Register</a>
          ` : ''}
          ${user && user.role === 'USER' ? `
            <a href="dashboard.html" class="nav-link ${window.location.pathname.endsWith('dashboard.html') ? 'active' : ''}">Dashboard</a>
            <a href="bookings.html" class="nav-link ${window.location.pathname.endsWith('bookings.html') ? 'active' : ''}">My Bookings</a>
          ` : ''}
          ${user && user.role === 'PROVIDER' ? `
            <a href="provider.html" class="nav-link ${window.location.pathname.endsWith('provider.html') ? 'active' : ''}">Provider Dashboard</a>
          ` : ''}
          ${user ? `
            <div class="user-menu">
              <button class="user-menu-button">
                <div class="user-avatar">${user.name.charAt(0).toUpperCase()}</div>
                <span>${user.name}</span>
                <svg width="20" height="20" viewBox="0 0 20 20">
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <div class="user-menu-content">
                <a href="profile.html" class="user-menu-item">
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    <path d="M8 8C10.2091 8 12 6.20914 12 4C12 1.79086 10.2091 0 8 0C5.79086 0 4 1.79086 4 4C4 6.20914 5.79086 8 8 8Z" fill="currentColor"/>
                    <path d="M8 9C5.33333 9 0 10.3333 0 13V16H16V13C16 10.3333 10.6667 9 8 9Z" fill="currentColor"/>
                  </svg>
                  Profile
                </a>
                <div class="user-menu-divider"></div>
                <a href="#" class="user-menu-item" id="logoutBtn">
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    <path d="M12 12L16 8L12 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M16 8H6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M6 16H2C0.895431 16 0 15.1046 0 14V2C0 0.895431 0.895431 0 2 0H6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Logout
                </a>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    // Setup mobile menu toggle
    const mobileToggle = nav.querySelector('.nav-mobile-toggle');
    const navLinks = nav.querySelector('.nav-links');
    if (mobileToggle && navLinks) {
      mobileToggle.addEventListener('click', () => {
        navLinks.classList.toggle('show');
      });
    }

    // Setup user menu toggle
    const userMenu = nav.querySelector('.user-menu');
    const userMenuButton = nav.querySelector('.user-menu-button');
    if (userMenu && userMenuButton) {
      userMenuButton.addEventListener('click', (e) => {
        e.stopPropagation();
        userMenu.classList.toggle('active');
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!userMenu.contains(e.target)) {
          userMenu.classList.remove('active');
        }
      });
    }

    // Setup logout
    if (user) {
      const logoutBtn = nav.querySelector('#logoutBtn');
      if (logoutBtn) {
        logoutBtn.onclick = function(e) {
          e.preventDefault();
          logout();
        };
      }
    }
  });
}

// Call updateNav when DOM is loaded
document.addEventListener('DOMContentLoaded', updateNav);

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
  const navLinks = document.querySelector('.nav-links');
  const mobileToggle = document.querySelector('.nav-mobile-toggle');
  if (navLinks && mobileToggle && !navLinks.contains(e.target) && !mobileToggle.contains(e.target)) {
    navLinks.classList.remove('show');
  }
});

if (document.getElementById('stats-grid')) {
  async function loadHomepageStats() {
    try {
      const statsRes = await fetch(`${API_BASE}/services/platform-stats`);
      if (!statsRes.ok) throw new Error('Failed to fetch platform stats');
      const stats = await statsRes.json();
      const statCards = document.querySelectorAll('.stat-card h3');
      if (statCards.length >= 4) {
        statCards[0].textContent = `${stats.activeServices}+`;
        statCards[1].textContent = `${stats.verifiedProviders}+`;
        statCards[2].textContent = `${stats.happyCustomers}+`;
        statCards[3].textContent = `${stats.averageRating}\u2605`;
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
    // Populate read-only profile data
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('profilePhone').textContent = user.phone;
    document.getElementById('profileRole').textContent = user.role;

    // Attach click listener for the edit button
    document.getElementById('editProfileBtn').onclick = function() {
      showEditProfileModal(user);
    };
  }
}

function showEditProfileModal(user) {
  const overlay = document.getElementById('editProfileModalOverlay');
  const modal = document.getElementById('editProfileModal');
  overlay.style.display = 'flex';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <button class="modal-close" onclick="hideEditProfileModal()">&times;</button>
    <h2>Edit Profile</h2>
      <form id="profileForm">
        <label>Name:<br>
          <input type="text" name="name" value="${user.name}" 
            pattern="[a-zA-Z\\s]{2,50]" 
            title="${getValidationMessage('name')}" required>
        </label><br>
        <label>Email:<br>
          <input type="email" name="email" value="${user.email}" 
            pattern="[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}"
            title="${getValidationMessage('email')}" required>
        </label><br>
        <label>Phone:<br>
          <input type="text" name="phone" value="${user.phone}"
            pattern="[6-9]\\d{9}"
            title="${getValidationMessage('phone')}" required>
        </label><br>
        <label>Password:<br>
          <input type="password" name="password" 
            pattern="(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*#?&]{8,}"
            title="${getValidationMessage('password')}"
            placeholder="Enter new password or leave blank">
        </label><br>
      <button type="submit">Save Changes</button>
      </form>
      <div id="profileMessage"></div>
    `;
  overlay.onclick = hideEditProfileModal;

  document.getElementById('profileForm').onsubmit = async function(e) {
      e.preventDefault();
    const newPassword = this.password.value;
    const updatedUser = {
        ...user,
        name: this.name.value,
        email: this.email.value,
        phone: this.phone.value,
    };
    // Only include password in the payload if a new one is entered
    if (newPassword) {
      updatedUser.password = newPassword;
    }

    const res = await fetch(`${API_BASE}/auth/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedUser)
    });

    if (res.ok) {
        const savedUser = await res.json();
        saveUser(savedUser); // Update localStorage with the final saved user data
        document.getElementById('profileMessage').textContent = 'Profile updated successfully!';
        setTimeout(() => {
          hideEditProfileModal();
          window.location.reload(); // Reload to show updated info
        }, 1200);
    } else {
        const errorText = await res.text();
        document.getElementById('profileMessage').textContent = `Update failed: ${errorText}`;
    }
    };
  }

function hideEditProfileModal() {
  const overlay = document.getElementById('editProfileModalOverlay');
  const modal = document.getElementById('editProfileModal');
  overlay.style.display = 'none';
  modal.style.display = 'none';
  modal.innerHTML = '';
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
            <div class="service-price-large">&#8377;${service.price}</div>
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
              <label>Address:<br><input type="text" name="address" required></label><br>
              <button type="submit">Pay & Book</button>
            </form>
            <div id="serviceBookingMessage"></div>
          `;
          document.getElementById('serviceBookingForm').onsubmit = async function(e) {
            e.preventDefault();
            const bookingDate = this.date.value;
            const bookingTime = this.time.value + ':00';
            if (service && service.price < 50) {
              alert('Minimum price is ₹50 due to Stripe requirements.');
              return;
            }
            const bookingPayload = {
              userId: user.id,
              serviceId: serviceId,
              bookingDate: bookingDate,
              bookingTime: bookingTime,
              address: this.address.value,
              successUrl: window.location.origin + '/success.html',
              cancelUrl: window.location.origin + '/cancel.html',
              currency: 'inr'
            };
            const res = await fetch(`${API_BASE}/bookings/create-with-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(bookingPayload)
            });
            let data;
            if (res.ok) {
              data = await res.json();
            } else {
              const errorText = await res.text();
              document.getElementById('serviceBookingMessage').textContent = 'Booking/payment failed: ' + errorText;
              return;
            }
            if (data.sessionId) {
              localStorage.setItem('lastBookingId', data.bookingId);
              const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
              stripe.redirectToCheckout({ sessionId: data.sessionId });
            } else {
              document.getElementById('serviceBookingMessage').textContent = 'Booking/payment failed.';
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