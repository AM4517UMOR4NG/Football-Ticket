// js/events.js
/**
 * Ticket Booking System - Matches Page
 * Displays matches in a table with API integration
 */

const API_CONFIG = {
    BASE_URL: 'http://localhost:8080/api',
    TIMEOUT: 10000
};

/**
 * Authentication utilities
 */
const auth = {
    getToken: () => localStorage.getItem('accessToken'),
    getUserId: () => parseInt(localStorage.getItem('userId')),
    clear: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userId');
    },
    validate: () => {
        const token = auth.getToken();
        const userId = auth.getUserId();
        if (!token || isNaN(userId)) {
            ui.showError('Please log in to access matches');
            setTimeout(() => {
                auth.clear();
                window.location.href = 'login.html';
            }, 2000);
            return false;
        }
        return true;
    }
};

/**
 * UI utilities for showing messages
 */
const ui = {
    showError: (message) => {
        const el = document.getElementById('errorMessage');
        el.textContent = message;
        el.classList.remove('hidden');
        setTimeout(() => el.classList.add('hidden'), 8000);
    }
};

/**
 * Configure axios client
 */
const apiClient = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.getToken()}`
    }
});

/**
 * Populate matches table with filtered events
 */
async function populateEvents() {
    const loadingEl = document.getElementById('eventsLoading');
    const contentEl = document.getElementById('eventsContent');
    const tableEl = document.getElementById('eventsTable');

    try {
        loadingEl.classList.remove('hidden');
        contentEl.classList.add('hidden');

        const response = await apiClient.get('/events');
        let events = response.data;

        // Filter for matches
        events = events.filter(event => 
            event.type?.toLowerCase() === 'match' || 
            event.title?.toLowerCase().includes('match')
        );

        if (events.length === 0) {
            tableEl.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-4 text-center text-gray-400">
                        No matches available at the moment.
                    </td>
                </tr>`;
            return;
        }

        tableEl.innerHTML = events.map(event => `
            <tr class="table-row">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${event.title || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${event.venue || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    ${event.eventDate ? new Date(event.eventDate).toLocaleString() : 'TBD'}
                </td>
                <td class="px-6 py-4 text-sm text-gray-300">${event.description || 'No description available'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    ${event.availableTickets || 'Unlimited'}
                    ${event.availableTickets && event.availableTickets < 10 ? 
                        '<span class="low-stock ml-2">Low Stock</span>' : ''}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    $${event.price || 'Free'}
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Error loading matches:', error);
        tableEl.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-4 text-center text-red-400">
                    Failed to load matches
                </td>
            </tr>`;
        ui.showError(`Failed to load matches: ${getErrorMessage(error)}`);
    } finally {
        loadingEl.classList.add('hidden');
        contentEl.classList.remove('hidden');
    }
}

/**
 * Get error message from API response
 * @param {Error} error - The error object
 * @returns {string} - Formatted error message
 */
function getErrorMessage(error) {
    return error.response?.data?.message || error.message || 'Unknown error occurred';
}

// Event listeners
document.getElementById('logout').addEventListener('click', (e) => {
    e.preventDefault();
    auth.clear();
    window.location.href = 'login.html';
});

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    if (auth.validate()) {
        populateEvents();
    }
});