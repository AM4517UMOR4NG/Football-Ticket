const API_BASE_URL = 'http://localhost:8080/api';
const token = localStorage.getItem('accessToken');

if (!token) {
    window.location.href = 'login.html';
}

axios.defaults.baseURL = API_BASE_URL;
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

async function loadDashboardStats() {
    try {
        const response = await axios.get('/admin/dashboard');
        const stats = response.data;
        document.getElementById('totalUsers').textContent = stats.totalUsers;
        document.getElementById('totalEvents').textContent = stats.totalEvents;
        document.getElementById('totalBookings').textContent = stats.totalBookings;
        document.getElementById('totalBookingsConfirmed').textContent = stats.totalBookingsConfirmed;
        document.getElementById('totalBookingsCancelled').textContent = stats.totalBookingsCancelled;
    } catch (error) {
        document.getElementById('errorMessage').textContent = 'Failed to load dashboard stats. You may not have admin access.';
        document.getElementById('errorMessage').classList.remove('hidden');
        if (error.response && error.response.status === 401) {
            setTimeout(() => window.location.href = 'login.html', 2000);
        }
    }
}

document.addEventListener('DOMContentLoaded', loadDashboardStats); 