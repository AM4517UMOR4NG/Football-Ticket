// Configuration
const API_BASE_URL = 'http://localhost:8080/api';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Get authentication data
let token = localStorage.getItem('accessToken');
let userId = localStorage.getItem('userId');

// Validate authentication
if (!token || !userId) {
    showError('Please log in to access bookings');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 2000);
}

// Parse userId to integer
userId = parseInt(userId);
if (isNaN(userId)) {
    showError('Invalid user ID. Please log in again.');
    setTimeout(() => {
        localStorage.clear();
        window.location.href = 'login.html';
    }, 2000);
}

// Configure axios with proper error handling
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000, // 10 second timeout
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
});

// Add request interceptor for debugging
apiClient.interceptors.request.use(
    (config) => {
        console.log('Making request to:', config.url);
        console.log('Headers:', config.headers);
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => {
        console.log('Response received:', response.status);
        return response;
    },
    (error) => {
        console.error('Response error:', error);

        // Handle different types of errors
        if (error.response) {
            // Server responded with error status
            console.error('Error status:', error.response.status);
            console.error('Error data:', error.response.data);

            if (error.response.status === 401) {
                showError('Session expired. Please log in again.');
                setTimeout(() => {
                    localStorage.clear();
                    window.location.href = 'login.html';
                }, 2000);
            }
        } else if (error.request) {
            // Network error
            console.error('Network error:', error.request);
            showError('Network error. Please check your connection and try again.');
        } else {
            // Other error
            console.error('Error:', error.message);
            showError('An unexpected error occurred.');
        }

        return Promise.reject(error);
    }
);

// Retry function for failed requests
async function retryRequest(requestFn, maxRetries = MAX_RETRIES) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await requestFn();
        } catch (error) {
            console.log(`Attempt ${i + 1} failed:`, error.message);

            if (i === maxRetries - 1) {
                throw error; // Last attempt failed
            }

            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (i + 1)));
        }
    }
}

async function populateEvents() {
    try {
        const eventSelect = document.getElementById('eventSelect');
        eventSelect.innerHTML = '<option value="">Loading events...</option>';

        const response = await retryRequest(() => apiClient.get('/events/upcoming'));
        const events = response.data;

        eventSelect.innerHTML = '<option value="">Choose an Event</option>';

        if (events && events.length > 0) {
            events.forEach(event => {
                const option = document.createElement('option');
                option.value = event.id;
                option.textContent = `${event.title} - ${event.venue} (${new Date(event.eventDate).toLocaleString()})`;
                eventSelect.appendChild(option);
            });
        } else {
            eventSelect.innerHTML = '<option value="">No events available</option>';
        }

        console.log('Events loaded successfully:', events.length);
    } catch (error) {
        console.error('Failed to load events:', error);
        const eventSelect = document.getElementById('eventSelect');
        eventSelect.innerHTML = '<option value="">Failed to load events</option>';
        showError(`Failed to load events: ${getErrorMessage(error)}`);
    }
}

async function populateBookings() {
    const loadingEl = document.getElementById('bookingsLoading');
    const contentEl = document.getElementById('bookingsContent');
    const tableEl = document.getElementById('bookingsTable');

    try {
        loadingEl.classList.remove('hidden');
        contentEl.classList.add('hidden');

        const response = await retryRequest(() => apiClient.get(`/bookings/user/${userId}`));
        const bookings = response.data;

        if (bookings && bookings.length > 0) {
            tableEl.innerHTML = bookings.map(booking => `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${booking.bookingReference || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${booking.eventTitle || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${booking.venue || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${booking.eventDate ? new Date(booking.eventDate).toLocaleString() : 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${booking.numberOfTickets || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">$${booking.totalAmount || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <span class="px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}">
                            ${booking.status || 'N/A'}
                        </span>
                    </td>
                </tr>
            `).join('');
        } else {
            tableEl.innerHTML = '<tr><td colspan="7" class="px-6 py-4 text-center text-gray-400">No bookings found</td></tr>';
        }

        console.log('Bookings loaded successfully:', bookings.length);
    } catch (error) {
        console.error('Failed to load bookings:', error);
        tableEl.innerHTML = '<tr><td colspan="7" class="px-6 py-4 text-center text-red-400">Failed to load bookings</td></tr>';
        showError(`Failed to load bookings: ${getErrorMessage(error)}`);
    } finally {
        loadingEl.classList.add('hidden');
        contentEl.classList.remove('hidden');
    }
}

function getStatusColor(status) {
    switch (status?.toLowerCase()) {
        case 'confirmed':
            return 'bg-green-100 text-green-800';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800';
        case 'cancelled':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

function getErrorMessage(error) {
    if (error.response && error.response.data && error.response.data.message) {
        return error.response.data.message;
    } else if (error.message) {
        return error.message;
    } else {
        return 'Unknown error occurred';
    }
}

document.getElementById('bookNow').addEventListener('click', async () => {
    const eventSelect = document.getElementById('eventSelect');
    const numberOfTicketsInput = document.getElementById('numberOfTickets');
    const bookButton = document.getElementById('bookNow');
    const bookButtonText = document.getElementById('bookButtonText');
    const bookSpinner = document.getElementById('bookSpinner');

    const eventId = eventSelect.value;
    const numberOfTickets = parseInt(numberOfTicketsInput.value);

    // Validation
    if (!eventId || eventId === "") {
        showError('Please select an event');
        return;
    }

    if (!numberOfTickets || numberOfTickets < 1 || numberOfTickets > 10) {
        showError('Please enter a valid number of tickets (1-10)');
        return;
    }

    // Show loading state
    bookButton.disabled = true;
    bookButtonText.textContent = 'Booking...';
    bookSpinner.classList.remove('hidden');

    try {
        const bookingRequest = {
            eventId: parseInt(eventId),
            numberOfTickets: numberOfTickets
        };

        console.log('Creating booking:', bookingRequest);

        const response = await retryRequest(() =>
            apiClient.post(`/bookings?userId=${userId}`, bookingRequest)
        );

        console.log('Booking created successfully:', response.data);
        showMessage(`Booking created successfully! Reference: ${response.data.bookingReference || 'N/A'}`);

        // Reset form
        eventSelect.value = '';
        numberOfTicketsInput.value = 1;

        // Refresh bookings
        await populateBookings();

    } catch (error) {
        console.error('Failed to create booking:', error);
        showError(`Failed to create booking: ${getErrorMessage(error)}`);
    } finally {
        // Reset button state
        bookButton.disabled = false;
        bookButtonText.textContent = 'Book Now';
        bookSpinner.classList.add('hidden');
    }
});

document.getElementById('logout').addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    window.location.href = 'index.html';
});

function showMessage(message) {
    const messageEl = document.getElementById('bookingMessage');
    const errorEl = document.getElementById('bookingError');

    // Hide error message
    errorEl.classList.add('hidden');

    // Show success message
    messageEl.textContent = message;
    messageEl.classList.remove('hidden');

    // Auto hide after 5 seconds
    setTimeout(() => {
        messageEl.classList.add('hidden');
    }, 5000);
}

function showError(message) {
    const errorEl = document.getElementById('bookingError');
    const messageEl = document.getElementById('bookingMessage');

    // Hide success message
    messageEl.classList.add('hidden');

    // Show error message
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');

    // Auto hide after 8 seconds (longer for errors)
    setTimeout(() => {
        errorEl.classList.add('hidden');
    }, 8000);
}

// Initialize the page
async function initializePage() {
    try {
        console.log('Initializing page...');
        console.log('User ID:', userId);
        console.log('Token:', token ? 'Present' : 'Missing');

        await Promise.all([
            populateEvents(),
            populateBookings()
        ]);

        console.log('Page initialized successfully');
    } catch (error) {
        console.error('Failed to initialize page:', error);
        showError('Failed to load page data. Please refresh and try again.');
    }
}

// Start initialization when page loads
document.addEventListener('DOMContentLoaded', initializePage);