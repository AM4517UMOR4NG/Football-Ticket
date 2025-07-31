// Admin Dashboard JS
const API_BASE_URL = '/api/admin';

// DOM Elements
const statTotalUsers = document.getElementById('stat-total-users');
const statTotalBookings = document.getElementById('stat-total-bookings');
const statConfirmedBookings = document.getElementById('stat-confirmed-bookings');
const statCancelledBookings = document.getElementById('stat-cancelled-bookings');
const usersTableBody = document.getElementById('admin-users-tbody');
const bookingsTableBody = document.getElementById('admin-bookings-tbody');
const toast = document.getElementById('toast');

// Chart.js
let userRoleChart, bookingStatusChart;

// --- Fetch & Render Statistics ---
async function loadStats() {
    try {
        // User stats
        const userStats = await fetchJson(`${API_BASE_URL}/users/stats`);
        if (statTotalUsers && userStats) {
            statTotalUsers.textContent = userStats.total || 0;
        }
        
        // Booking stats
        const bookingStats = await fetchJson(`${API_BASE_URL}/bookings/stats`);
        if (bookingStats) {
            if (statTotalBookings) statTotalBookings.textContent = bookingStats.total || 0;
            if (statConfirmedBookings) statConfirmedBookings.textContent = bookingStats.confirmed || 0;
            if (statCancelledBookings) statCancelledBookings.textContent = bookingStats.cancelled || 0;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
        showToast('Failed to load statistics', true);
    }
}

// --- Fetch & Render User Table ---
async function loadUsers() {
    if (!usersTableBody) {
        console.error('Users table body element not found');
        return;
    }
    
    try {
        usersTableBody.innerHTML = '<tr><td colspan="6">Loading...</td></tr>';
        const users = await fetchJson(`${API_BASE_URL}/users`);
        
        if (!Array.isArray(users) || users.length === 0) {
            usersTableBody.innerHTML = '<tr><td colspan="6">No users found.</td></tr>';
            return;
        }
        
        usersTableBody.innerHTML = users.map(user => `
            <tr>
                <td>${escapeHtml(user.id || '-')}</td>
                <td>${escapeHtml(user.username || '-')}</td>
                <td>${escapeHtml(user.email || '-')}</td>
                <td>${escapeHtml(user.fullName || '-')}</td>
                <td><span class="px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'ADMIN' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}">${escapeHtml(user.role || 'USER')}</span></td>
                <td>
                    <button onclick="deleteUser(${user.id})" class="text-red-600 hover:underline">Delete</button>
                </td>
            </tr>
        `).join('');
        
        renderUserRoleChart(users);
    } catch (error) {
        console.error('Error loading users:', error);
        usersTableBody.innerHTML = '<tr><td colspan="6">Error loading users</td></tr>';
        showToast('Failed to load users', true);
    }
}

// --- Fetch & Render Booking Table ---
async function loadBookings() {
    if (!bookingsTableBody) {
        console.error('Bookings table body element not found');
        return;
    }
    
    try {
        bookingsTableBody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';
        const bookings = await fetchJson(`${API_BASE_URL}/bookings`);
        
        console.log('Loaded bookings:', bookings); // Debug log
        
        if (!Array.isArray(bookings) || bookings.length === 0) {
            bookingsTableBody.innerHTML = '<tr><td colspan="5">No bookings found.</td></tr>';
            return;
        }
        
        bookingsTableBody.innerHTML = bookings.map(b => `
            <tr>
                <td>${escapeHtml(b.id || '-')}</td>
                <td>${escapeHtml((b.user && b.user.username) || '-')}</td>
                <td>${escapeHtml((b.event && b.event.title) || '-')}</td>
                <td><span class="px-2 py-1 rounded-full text-xs font-semibold ${getStatusClass(b.status)}">${escapeHtml(b.status || 'UNKNOWN')}</span></td>
                <td>
                    <button onclick="deleteBooking(${b.id})" class="text-red-600 hover:underline">Delete</button>
                </td>
            </tr>
        `).join('');
        
        renderBookingStatusChart(bookings);
    } catch (error) {
        console.error('Error loading bookings:', error);
        bookingsTableBody.innerHTML = '<tr><td colspan="5">Error loading bookings</td></tr>';
        showToast('Failed to load bookings', true);
    }
}

// --- Helper function for status classes ---
function getStatusClass(status) {
    switch (status) {
        case 'CONFIRMED':
            return 'bg-green-100 text-green-700';
        case 'CANCELLED':
            return 'bg-red-100 text-red-700';
        case 'PENDING':
            return 'bg-yellow-100 text-yellow-700';
        default:
            return 'bg-gray-100 text-gray-700';
    }
}

// --- Helper function to escape HTML ---
function escapeHtml(text) {
    if (text === null || text === undefined) return '-';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// --- Chart.js: User Role Pie Chart ---
function renderUserRoleChart(users) {
    try {
        const roleCounts = users.reduce((acc, u) => {
            const role = u.role || 'UNKNOWN';
            acc[role] = (acc[role] || 0) + 1;
            return acc;
        }, {});
        
        const ctx = document.getElementById('userRoleChart');
        if (!ctx) {
            console.warn('User role chart canvas not found');
            return;
        }
        
        if (userRoleChart) userRoleChart.destroy();
        
        userRoleChart = new Chart(ctx.getContext('2d'), {
            type: 'pie',
            data: {
                labels: Object.keys(roleCounts),
                datasets: [{
                    data: Object.values(roleCounts),
                    backgroundColor: ['#f59e42', '#3b82f6', '#10b981', '#f87171']
                }]
            },
            options: { 
                plugins: { 
                    legend: { position: 'bottom' } 
                },
                responsive: true
            }
        });
    } catch (error) {
        console.error('Error rendering user role chart:', error);
    }
}

// --- Chart.js: Booking Status Pie Chart ---
function renderBookingStatusChart(bookings) {
    try {
        const statusCounts = bookings.reduce((acc, b) => {
            const status = b.status || 'UNKNOWN';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});
        
        const ctx = document.getElementById('bookingStatusChart');
        if (!ctx) {
            console.warn('Booking status chart canvas not found');
            return;
        }
        
        if (bookingStatusChart) bookingStatusChart.destroy();
        
        bookingStatusChart = new Chart(ctx.getContext('2d'), {
            type: 'pie',
            data: {
                labels: Object.keys(statusCounts),
                datasets: [{
                    data: Object.values(statusCounts),
                    backgroundColor: ['#10b981', '#f87171', '#fbbf24', '#64748b']
                }]
            },
            options: { 
                plugins: { 
                    legend: { position: 'bottom' } 
                },
                responsive: true
            }
        });
    } catch (error) {
        console.error('Error rendering booking status chart:', error);
    }
}

// --- Delete User ---
async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'DELETE',
            headers: { 
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json'
            }
        });
        
        if (res.ok) {
            showToast('User deleted successfully!');
            await loadUsers();
            await loadStats(); // Refresh stats
        } else {
            const errorText = await res.text();
            console.error('Delete user error:', errorText);
            showToast('Failed to delete user: ' + (errorText || 'Unknown error'), true);
        }
    } catch (error) {
        console.error('Delete user error:', error);
        showToast('Failed to delete user: ' + error.message, true);
    }
}

// --- Delete Booking ---
async function deleteBooking(bookingId) {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    
    try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
            method: 'DELETE',
            headers: { 
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json'
            }
        });
        
        if (res.ok) {
            showToast('Booking deleted successfully!');
            await loadBookings();
            await loadStats(); // Refresh stats
        } else {
            const errorText = await res.text();
            console.error('Delete booking error:', errorText);
            showToast('Failed to delete booking: ' + (errorText || 'Unknown error'), true);
        }
    } catch (error) {
        console.error('Delete booking error:', error);
        showToast('Failed to delete booking: ' + error.message, true);
    }
}

// --- Toast Notification ---
function showToast(message, isError = false) {
    if (!toast) {
        console.warn('Toast element not found');
        return;
    }
    
    toast.textContent = message;
    toast.className = `fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-lg z-50 ${isError ? 'bg-red-700' : 'bg-blue-700'} text-white`;
    toast.style.display = 'block';
    toast.classList.remove('hidden');
    
    setTimeout(() => { 
        toast.classList.add('hidden'); 
        toast.style.display = 'none'; 
    }, 2500);
}

// --- Helper: Fetch JSON ---
async function fetchJson(url) {
    try {
        const token = localStorage.getItem('accessToken');
        console.log('Fetching:', url); // Debug log
        
        const res = await fetch(url, { 
            headers: { 
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json'
            } 
        });
        
        console.log('Response status:', res.status); // Debug log
        
        if (!res.ok) {
            const errorText = await res.text();
            console.error('Fetch error:', errorText);
            throw new Error(`HTTP ${res.status}: ${errorText}`);
        }
        
        const data = await res.json();
        console.log('Response data:', data); // Debug log
        return data;
    } catch (err) {
        console.error('fetchJson error:', err);
        showToast('Error: ' + err.message, true);
        return [];
    }
}

// --- Init ---
async function initAdminDashboard() {
    console.log('Initializing admin dashboard...');
    
    try {
        await loadStats();
        await loadUsers();
        await loadBookings();
        console.log('Admin dashboard initialized successfully');
    } catch (error) {
        console.error('Failed to initialize admin dashboard:', error);
        showToast('Failed to initialize dashboard', true);
    }
}

document.addEventListener('DOMContentLoaded', initAdminDashboard);