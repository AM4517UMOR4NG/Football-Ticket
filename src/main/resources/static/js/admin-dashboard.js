// Admin Dashboard JS - Improved Version
const API_BASE_URL = '/api/admin';

// DOM Elements
const statTotalUsers = document.getElementById('stat-total-users');
const statTotalBookings = document.getElementById('stat-total-bookings');
const statConfirmedBookings = document.getElementById('stat-confirmed-bookings');
const statCancelledBookings = document.getElementById('stat-cancelled-bookings');
const usersTableBody = document.getElementById('admin-users-tbody');
const bookingsTableBody = document.getElementById('admin-bookings-tbody');
const toast = document.getElementById('toast');

// Chart.js instances
let userRoleChart, bookingStatusChart;

// --- Strict Authentication Check ---
async function checkAdminAuth() {
    const token = localStorage.getItem('accessToken');
    const userRole = localStorage.getItem('userRole');

    // First check: token and role must exist
    if (!token || userRole !== 'ADMIN') {
        redirectToLogin();
        return false;
    }

    try {
        // Second check: verify token with backend
        const response = await fetch('/api/auth/verify', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Token verification failed');
        }

        const userData = await response.json();

        // Third check: confirm admin role from backend
        if (userData.role !== 'ADMIN') {
            throw new Error('Insufficient privileges');
        }

        // Update user data in localStorage
        localStorage.setItem('userData', JSON.stringify(userData));
        return true;

    } catch (error) {
        console.error('Authentication verification failed:', error);
        clearAuthData();
        redirectToLogin();
        return false;
    }
}

// --- Clear authentication data ---
function clearAuthData() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
    localStorage.removeItem('refreshToken');
}

// --- Redirect to login ---
function redirectToLogin() {
    showToast('Access denied. Admin privileges required.', true);
    setTimeout(() => {
        window.location.href = '/login.html';
    }, 1500);
}

// --- Fetch & Render Statistics ---
async function loadStats() {
    try {
        const isAuthenticated = await checkAdminAuth();
        if (!isAuthenticated) return;

        const [userStats, bookingStats] = await Promise.all([
            fetchJson(`${API_BASE_URL}/users/stats`),
            fetchJson(`${API_BASE_URL}/bookings/stats`)
        ]);

        // Update stats display
        updateStatElement(statTotalUsers, userStats?.total, 0);
        updateStatElement(statTotalBookings, bookingStats?.total, 0);
        updateStatElement(statConfirmedBookings, bookingStats?.confirmed, 0);
        updateStatElement(statCancelledBookings, bookingStats?.cancelled, 0);

    } catch (error) {
        console.error('Error loading stats:', error);
        showToast('Failed to load statistics', true);
        // Reset stats to 0 on error
        updateStatElement(statTotalUsers, 0);
        updateStatElement(statTotalBookings, 0);
        updateStatElement(statConfirmedBookings, 0);
        updateStatElement(statCancelledBookings, 0);
    }
}

// --- Helper function to update stat elements ---
function updateStatElement(element, value, fallback = 0) {
    if (element) {
        element.textContent = value !== null && value !== undefined ? value : fallback;
    }
}

// --- Fetch & Render User Table ---
async function loadUsers() {
    if (!usersTableBody) {
        console.error('Users table body element not found');
        return;
    }

    try {
        const isAuthenticated = await checkAdminAuth();
        if (!isAuthenticated) return;

        usersTableBody.innerHTML = '<tr><td colspan="6"><div class="flex items-center justify-center py-4"><div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div><span class="ml-2">Loading users...</span></div></td></tr>';

        const users = await fetchJson(`${API_BASE_URL}/users`);

        if (!users) {
            throw new Error('Failed to fetch users data');
        }

        renderUsersTable(users);
        renderUserRoleChart(users);

    } catch (error) {
        console.error('Error loading users:', error);
        usersTableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-red-600">Failed to load users. Please try again.</td></tr>';
        showToast('Failed to load users', true);
    }
}

// --- Render Users Table ---
function renderUsersTable(users) {
    if (!Array.isArray(users) || users.length === 0) {
        usersTableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-gray-500">No users found.</td></tr>';
        return;
    }

    usersTableBody.innerHTML = users.map(user => `
        <tr class="hover:bg-gray-50">
            <td class="px-4 py-2">${escapeHtml(user.id || '-')}</td>
            <td class="px-4 py-2">${escapeHtml(user.username || '-')}</td>
            <td class="px-4 py-2">${escapeHtml(user.email || '-')}</td>
            <td class="px-4 py-2">${escapeHtml(user.fullName || user.firstName + ' ' + user.lastName || '-')}</td>
            <td class="px-4 py-2">
                <span class="px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'ADMIN' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}">
                    ${escapeHtml(user.role || 'USER')}
                </span>
            </td>
            <td class="px-4 py-2">
                ${user.role !== 'ADMIN' ? `<button onclick="deleteUser(${user.id})" class="text-red-600 hover:text-red-800 hover:underline transition-colors">Delete</button>` : '<span class="text-gray-400">Protected</span>'}
            </td>
        </tr>
    `).join('');
}

// --- Fetch & Render Booking Table ---
async function loadBookings() {
    if (!bookingsTableBody) {
        console.error('Bookings table body element not found');
        return;
    }

    try {
        const isAuthenticated = await checkAdminAuth();
        if (!isAuthenticated) return;

        bookingsTableBody.innerHTML = '<tr><td colspan="5"><div class="flex items-center justify-center py-4"><div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div><span class="ml-2">Loading bookings...</span></div></td></tr>';

        const bookings = await fetchJson(`${API_BASE_URL}/bookings`);

        if (!bookings) {
            throw new Error('Failed to fetch bookings data');
        }

        console.log('Loaded bookings:', bookings);

        renderBookingsTable(bookings);
        renderBookingStatusChart(bookings);

    } catch (error) {
        console.error('Error loading bookings:', error);
        bookingsTableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-red-600">Failed to load bookings. Please try again.</td></tr>';
        showToast('Failed to load bookings', true);
    }
}

// --- Render Bookings Table ---
function renderBookingsTable(bookings) {
    if (!Array.isArray(bookings) || bookings.length === 0) {
        bookingsTableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-gray-500">No bookings found.</td></tr>';
        return;
    }

    bookingsTableBody.innerHTML = bookings.map(booking => {
        // Ambil judul event dari DTO
        const eventTitle = booking.eventTitle || booking.eventName || booking.title || 'Unknown Event';
        // Safely extract user information
        const username = booking.user?.username ||
            booking.user?.email ||
            booking.userDetails?.username ||
            booking.username ||
            booking.username || // fallback untuk DTO
            'Unknown User';
        return `
        <tr class="hover:bg-gray-50">
            <td class="px-4 py-2">${escapeHtml(booking.id || '-')}</td>
            <td class="px-4 py-2">${escapeHtml(username)}</td>
            <td class="px-4 py-2">${escapeHtml(eventTitle)}</td>
            <td class="px-4 py-2">
                <span class="px-2 py-1 rounded-full text-xs font-semibold ${getStatusClass(booking.status)}">
                    ${escapeHtml(booking.status || 'UNKNOWN')}
                </span>
            </td>
            <td class="px-4 py-2">
                <button onclick="deleteBooking(${booking.id})" class="text-red-600 hover:text-red-800 hover:underline transition-colors">Delete</button>
            </td>
        </tr>
        `;
    }).join('');
}

// --- Helper function for status classes ---
function getStatusClass(status) {
    switch (status?.toLowerCase()) {
        case 'confirmed':
            return 'bg-green-100 text-green-700';
        case 'cancelled':
        case 'canceled':
            return 'bg-red-100 text-red-700';
        case 'pending':
            return 'bg-yellow-100 text-yellow-700';
        case 'completed':
            return 'bg-blue-100 text-blue-700';
        default:
            return 'bg-gray-100 text-gray-700';
    }
}

// --- Helper function to escape HTML ---
function escapeHtml(text) {
    if (text === null || text === undefined) return '-';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

// --- Chart.js: User Role Pie Chart ---
function renderUserRoleChart(users) {
    try {
        const roleCounts = users.reduce((acc, user) => {
            const role = user.role || 'UNKNOWN';
            acc[role] = (acc[role] || 0) + 1;
            return acc;
        }, {});

        const ctx = document.getElementById('userRoleChart');
        if (!ctx) return;

        if (userRoleChart) userRoleChart.destroy();

        userRoleChart = new Chart(ctx.getContext('2d'), {
            type: 'pie',
            data: {
                labels: Object.keys(roleCounts),
                datasets: [{
                    data: Object.values(roleCounts),
                    backgroundColor: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return `${context.label}: ${context.parsed} users`;
                            }
                        }
                    }
                },
                responsive: true,
                maintainAspectRatio: false
            }
        });
    } catch (error) {
        console.error('Error rendering user role chart:', error);
    }
}

// --- Chart.js: Booking Status Pie Chart ---
function renderBookingStatusChart(bookings) {
    try {
        const statusCounts = bookings.reduce((acc, booking) => {
            const status = booking.status || 'UNKNOWN';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        const ctx = document.getElementById('bookingStatusChart');
        if (!ctx) return;

        if (bookingStatusChart) bookingStatusChart.destroy();

        bookingStatusChart = new Chart(ctx.getContext('2d'), {
            type: 'pie',
            data: {
                labels: Object.keys(statusCounts),
                datasets: [{
                    data: Object.values(statusCounts),
                    backgroundColor: ['#10b981', '#ef4444', '#f59e0b', '#6b7280'],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return `${context.label}: ${context.parsed} bookings`;
                            }
                        }
                    }
                },
                responsive: true,
                maintainAspectRatio: false
            }
        });
    } catch (error) {
        console.error('Error rendering booking status chart:', error);
    }
}

// --- Delete User ---
async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
        const isAuthenticated = await checkAdminAuth();
        if (!isAuthenticated) return;

        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            showToast('User deleted successfully!');
            await Promise.all([loadUsers(), loadStats()]);
        } else {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('Delete user error:', error);
        showToast(`Failed to delete user: ${error.message}`, true);
    }
}

// --- Delete Booking ---
async function deleteBooking(bookingId) {
    if (!confirm('Are you sure you want to delete this booking? This action cannot be undone.')) return;

    try {
        const isAuthenticated = await checkAdminAuth();
        if (!isAuthenticated) return;

        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            showToast('Booking deleted successfully!');
            await Promise.all([loadBookings(), loadStats()]);
        } else {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('Delete booking error:', error);
        showToast(`Failed to delete booking: ${error.message}`, true);
    }
}

// --- Toast Notification ---
function showToast(message, isError = false) {
    if (!toast) {
        console.warn('Toast element not found');
        return;
    }

    toast.textContent = message;
    toast.className = `fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 ${isError ? 'bg-red-600 border-red-700' : 'bg-green-600 border-green-700'
        } text-white border`;

    toast.style.display = 'block';
    toast.classList.remove('hidden');

    // Add fade-in animation
    setTimeout(() => toast.style.opacity = '1', 10);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.classList.add('hidden');
            toast.style.display = 'none';
        }, 300);
    }, 3000);
}

// --- Helper: Fetch JSON with better error handling ---
async function fetchJson(url) {
    try {
        const token = localStorage.getItem('accessToken');
        console.log('Fetching:', url);

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Response status:', response.status);

        if (response.status === 401 || response.status === 403) {
            // Token invalid or insufficient privileges
            clearAuthData();
            redirectToLogin();
            return null;
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log('Response data:', data);
        return data;

    } catch (error) {
        console.error('fetchJson error:', error);
        if (error.message.includes('401') || error.message.includes('403')) {
            clearAuthData();
            redirectToLogin();
        }
        throw error;
    }
}

// --- Refresh data function ---
async function refreshAllData() {
    try {
        showToast('Refreshing data...', false);
        await Promise.all([loadStats(), loadUsers(), loadBookings()]);
        showToast('Data refreshed successfully!');
    } catch (error) {
        console.error('Error refreshing data:', error);
        showToast('Failed to refresh data', true);
    }
}

// --- Initialize Admin Dashboard ---
async function initAdminDashboard() {
    console.log('Initializing admin dashboard...');

    try {
        // First check authentication
        const isAuthenticated = await checkAdminAuth();
        if (!isAuthenticated) return;

        // Load all data
        await Promise.all([
            loadStats(),
            loadUsers(),
            loadBookings()
        ]);

        console.log('Admin dashboard initialized successfully');

        // Set up auto-refresh every 5 minutes
        setInterval(refreshAllData, 5 * 60 * 1000);

    } catch (error) {
        console.error('Failed to initialize admin dashboard:', error);
        showToast('Failed to initialize dashboard', true);
    }
}

// --- Expose functions to global scope for HTML onclick handlers ---
window.deleteUser = deleteUser;
window.deleteBooking = deleteBooking;
window.refreshAllData = refreshAllData;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initAdminDashboard);

// Handle page visibility changes to refresh data when returning to tab
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        refreshAllData();
    }
});