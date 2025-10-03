// User Profile Page JavaScript

document.addEventListener('DOMContentLoaded', function () {
    // Check authentication first
    const token = localStorage.getItem('accessToken');
    const userRole = localStorage.getItem('userRole');

    if (!token) {
        // Redirect to login if not authenticated
        window.location.href = 'login.html';
        return;
    }

    // Update navigation based on user role
    updateNavigation(userRole);

    // Initialize profile functionality
    initializeProfile();

    // Initialize form handling
    initializeForms();

    // Initialize section switching
    initializeSectionSwitching();

    // Initialize profile image upload
    initializeImageUpload();
});

// Update navigation based on user role
function updateNavigation(userRole) {
    const profileLink = document.getElementById('profile-link');
    const adminLink = document.getElementById('admin-link');
    const adminProfileLink = document.getElementById('admin-profile-link');
    const logoutLink = document.getElementById('logout-link');
    const loginLink = document.getElementById('login-link');

    if (userRole === 'ADMIN') {
        if (adminLink) adminLink.classList.remove('hidden');
        if (adminProfileLink) adminProfileLink.classList.remove('hidden');
    }

    if (logoutLink) logoutLink.classList.remove('hidden');
    if (loginLink) loginLink.classList.add('hidden');
}

// Initialize Profile Page
function initializeProfile() {
    // Load user data from API
    loadUserData();

    // Initialize statistics
    loadUserStats();

    // Initialize booking history
    loadBookingHistory();
}

// Load user data from API
async function loadUserData() {
    try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/profile', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                // Token expired or invalid
                localStorage.removeItem('accessToken');
                localStorage.removeItem('userData');
                localStorage.removeItem('userRole');
                window.location.href = 'login.html';
                return;
            }
            throw new Error('Failed to load user data');
        }

        const userData = await response.json();
        populateUserData(userData);

    } catch (error) {
        console.error('Error loading user data:', error);
        showNotification('Failed to load user data. Using demo data.', 'warning');
        // Use demo data as fallback
        populateUserData({
            id: 1,
            username: 'demo_user',
            email: 'demo@example.com',
            fullName: 'Demo User',
            role: 'USER',
            phone: '+1 (555) 123-4567',
            address: '123 Demo Street, Demo City, DC 12345',
            createdAt: new Date().toISOString()
        });
    }
}

// Load user statistics
async function loadUserStats() {
    try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/profile/stats', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load user stats');
        }

        const stats = await response.json();
        updateStatistics(stats);

    } catch (error) {
        console.error('Error loading user stats:', error);
        // Use demo data as fallback
        updateStatistics({
            totalBookings: 12,
            activeBookings: 3,
            totalSpent: 1250.00
        });
    }
}

// Load booking history
async function loadBookingHistory() {
    try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/bookings/my-bookings', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load booking history');
        }

        const bookings = await response.json();
        updateBookingHistory(bookings);

    } catch (error) {
        console.error('Error loading booking history:', error);
        // Show empty state
        updateBookingHistory([]);
    }
}

// Update booking history display
function updateBookingHistory(bookings) {
    const bookingHistoryContainer = document.getElementById('booking-history');
    if (!bookingHistoryContainer) return;

    if (bookings.length === 0) {
        bookingHistoryContainer.innerHTML = `
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Booking History</h2>
            <div class="text-center text-gray-500 py-8">
                <i class="fas fa-ticket-alt text-4xl mb-4"></i>
                <p>No booking history available</p>
                <p class="text-sm mt-2">Start by booking your first match!</p>
            </div>
        `;
        return;
    }

    let bookingHTML = '<h2 class="text-2xl font-bold text-gray-900 mb-6">Booking History</h2><div class="space-y-4">';

    bookings.forEach(booking => {
        const statusClass = booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
            booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                booking.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800';

        bookingHTML += `
            <div class="border border-gray-200 rounded-lg p-4">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-semibold text-gray-900">${booking.eventTitle || 'Match Event'}</h3>
                        <p class="text-gray-600">${booking.venue || 'Venue'} • ${new Date(booking.eventDate).toLocaleDateString()}</p>
                        <p class="text-sm text-gray-500">Booking ID: ${booking.bookingReference}</p>
                    </div>
                    <div class="text-right">
                        <span class="${statusClass} px-2 py-1 rounded-full text-xs font-medium">${booking.status}</span>
                        <p class="text-lg font-bold text-gray-900 mt-1">$${booking.totalAmount}</p>
                    </div>
                </div>
                <div class="mt-4 flex space-x-2">
                    <button class="text-blue-600 hover:text-blue-700 text-sm font-medium">View Details</button>
                    ${booking.status === 'CONFIRMED' ? '<button class="text-red-600 hover:text-red-700 text-sm font-medium">Cancel</button>' : ''}
                </div>
            </div>
        `;
    });

    bookingHTML += '</div>';
    bookingHistoryContainer.innerHTML = bookingHTML;
}

// Populate user data in form fields
function populateUserData(userData) {
    // Update profile header
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');

    if (profileName) profileName.textContent = userData.fullName || userData.username || 'User';
    if (profileEmail) profileEmail.textContent = userData.email || '';

    // Populate form fields
    const firstNameInput = document.getElementById('first-name');
    const lastNameInput = document.getElementById('last-name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const addressInput = document.getElementById('address');

    if (firstNameInput && lastNameInput) {
        const names = (userData.fullName || '').split(' ');
        firstNameInput.value = names[0] || '';
        lastNameInput.value = names.slice(1).join(' ') || '';
    }

    if (emailInput) emailInput.value = userData.email || '';
    if (phoneInput) phoneInput.value = userData.phone || '';
    if (addressInput) addressInput.value = userData.address || '';
}

// Update statistics display
function updateStatistics(stats = null) {
    const totalBookingsElement = document.getElementById('total-bookings');
    const activeBookingsElement = document.getElementById('active-bookings');
    const totalSpentElement = document.getElementById('total-spent');

    if (stats) {
        if (totalBookingsElement) totalBookingsElement.textContent = stats.totalBookings || 0;
        if (activeBookingsElement) activeBookingsElement.textContent = stats.activeBookings || 0;
        if (totalSpentElement) totalSpentElement.textContent = `$${(stats.totalSpent || 0).toFixed(2)}`;
    }
}

// Initialize booking history
function initializeBookingHistory() {
    // This would load real booking data from API
    const bookingHistoryContainer = document.getElementById('booking-history');
    if (bookingHistoryContainer) {
        bookingHistoryContainer.innerHTML = `
            <div class="text-center text-gray-500 py-8">
                <i class="fas fa-ticket-alt text-4xl mb-4"></i>
                <p>No booking history available</p>
            </div>
        `;
    }
}

// Initialize forms
function initializeForms() {
    // Personal information form
    const personalInfoForm = document.getElementById('personal-info-form');
    if (personalInfoForm) {
        personalInfoForm.addEventListener('submit', function (e) {
            e.preventDefault();
            savePersonalInfo();
        });
    }

    // Password change form
    const passwordForm = document.getElementById('password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', function (e) {
            e.preventDefault();
            changePassword();
        });
    }
}

// Edit personal information
function editPersonalInfo() {
    const inputs = document.querySelectorAll('#personal-info input[disabled]');
    const editBtn = document.querySelector('#personal-info .edit-btn');
    const saveBtn = document.getElementById('save-personal-btn');
    const cancelBtn = document.getElementById('cancel-personal-btn');

    inputs.forEach(input => input.disabled = false);
    if (editBtn) editBtn.classList.add('hidden');
    if (saveBtn) saveBtn.classList.remove('hidden');
    if (cancelBtn) cancelBtn.classList.remove('hidden');
}

// Cancel edit
function cancelEdit() {
    const inputs = document.querySelectorAll('#personal-info input');
    const editBtn = document.querySelector('#personal-info .edit-btn');
    const saveBtn = document.getElementById('save-personal-btn');
    const cancelBtn = document.getElementById('cancel-personal-btn');

    inputs.forEach(input => input.disabled = true);
    if (editBtn) editBtn.classList.remove('hidden');
    if (saveBtn) saveBtn.classList.add('hidden');
    if (cancelBtn) cancelBtn.classList.add('hidden');

    // Reload user data to reset form
    loadUserData();
}

// Save personal information
async function savePersonalInfo() {
    try {
        const firstName = document.getElementById('first-name').value;
        const lastName = document.getElementById('last-name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const address = document.getElementById('address').value;

        const updateData = {
            fullName: `${firstName} ${lastName}`.trim(),
            email: email,
            phone: phone,
            address: address
        };

        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/profile', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (!response.ok) {
            throw new Error('Failed to update profile');
        }

        const updatedUser = await response.json();
        populateUserData(updatedUser);
        cancelEdit();
        showNotification('Profile updated successfully!', 'success');

    } catch (error) {
        console.error('Error updating profile:', error);
        showNotification('Failed to update profile', 'error');
    }
}

// Change password
async function changePassword() {
    try {
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (!currentPassword || !newPassword || !confirmPassword) {
            showNotification('Please fill in all password fields', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showNotification('New passwords do not match', 'error');
            return;
        }

        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/profile/change-password', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                currentPassword: currentPassword,
                newPassword: newPassword
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to change password');
        }

        // Clear password fields
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';

        showNotification('Password changed successfully!', 'success');

    } catch (error) {
        console.error('Error changing password:', error);
        showNotification(error.message, 'error');
    }
}

// Initialize section switching
function initializeSectionSwitching() {
    const sidebarButtons = document.querySelectorAll('.sidebar button');
    const sections = document.querySelectorAll('.profile-section');

    sidebarButtons.forEach(button => {
        button.addEventListener('click', function () {
            const targetSection = this.getAttribute('onclick').match(/showSection\('([^']+)'\)/)[1];
            showSection(targetSection);
        });
    });
}

// Show specific section
function showSection(sectionId) {
    const sections = document.querySelectorAll('.profile-section');
    const sidebarButtons = document.querySelectorAll('.sidebar button');

    // Hide all sections
    sections.forEach(section => section.classList.add('hidden'));

    // Remove active class from all buttons
    sidebarButtons.forEach(button => button.classList.remove('bg-blue-100', 'text-blue-700'));

    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }

    // Add active class to clicked button
    const clickedButton = document.querySelector(`[onclick="showSection('${sectionId}')"]`);
    if (clickedButton) {
        clickedButton.classList.add('bg-blue-100', 'text-blue-700');
    }
}

// Initialize image upload
function initializeImageUpload() {
    const uploadButton = document.querySelector('.profile-image-upload');
    if (uploadButton) {
        uploadButton.addEventListener('click', function () {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = function (e) {
                uploadProfileImage(e.target.files[0]);
            };
            input.click();
        });
    }
}

// Upload profile image
async function uploadProfileImage(file) {
    if (!file) return;

    try {
        const formData = new FormData();
        formData.append('image', file);

        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/profile/upload-image', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to upload image');
        }

        showNotification('Profile image updated successfully!', 'success');

    } catch (error) {
        console.error('Error uploading image:', error);
        showNotification('Failed to upload image', 'error');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${type === 'error' ? 'bg-red-600' :
            type === 'success' ? 'bg-green-600' :
                type === 'warning' ? 'bg-yellow-600' :
                    'bg-blue-600'
        } text-white`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Track event for analytics
function trackEvent(eventName, eventData = {}) {
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventData);
    }
    if (typeof window.analytics !== 'undefined') {
        window.analytics.track(eventName, eventData);
    }
}

// Handle logout function
function handleLogout() {
    // Clear authentication data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('userRole');

    // Redirect to login page
    window.location.href = 'login.html';
}

// Make handleLogout globally available
window.handleLogout = handleLogout; 