const apiUrl = 'http://localhost:8080/api';
let token = localStorage.getItem('accessToken');
let userId = parseInt(localStorage.getItem('userId'));

if (!token || isNaN(userId)) {
    alert('Please log in');
    window.location.href = 'login.html';
}

axios.defaults.baseURL = apiUrl;
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

async function populateEvents() {
    try {
        const response = await axios.get('/events');
        const events = response.data;
        const eventsList = document.getElementById('eventsList');

        if (events.length === 0) {
            eventsList.innerHTML = '<p class="text-gray-400 col-span-full text-center">No events available at the moment.</p>';
            return;
        }

        eventsList.innerHTML = events.map(event => `
            <div class="bg-gray-800 p-4 rounded-lg shadow-md hover:bg-gray-700 transition">
                <h3 class="text-xl font-semibold">${event.title}</h3>
                <p class="text-gray-400">Venue: ${event.venue}</p>
                <p class="text-gray-400">Date: ${event.eventDate ? new Date(event.eventDate).toLocaleDateString() : 'TBD'}</p>
                <p class="text-gray-400">Description: ${event.description || 'No description available'}</p>
                <p class="text-gray-400">Available Tickets: ${event.availableTickets || 'Unlimited'}</p>
                <p class="text-gray-400">Price: $${event.price || 'Free'}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading events:', error);
        document.getElementById('errorMessage').textContent = 'Failed to load events: ' + (error.response?.data?.message || error.message);
        document.getElementById('errorMessage').classList.remove('hidden');
    }
}

function attachBookingHandlers() {
    document.querySelectorAll('.bookEventBtn').forEach(btn => {
        btn.addEventListener('click', async function (e) {
            const form = e.target.closest('form');
            const eventId = form.getAttribute('data-event-id');
            const numberOfTickets = form.querySelector('.numberOfTickets').value;

            if (!numberOfTickets || numberOfTickets < 1) {
                showError('Please select a valid number of tickets');
                return;
            }

            try {
                const bookingRequest = {
                    eventId: parseInt(eventId),
                    numberOfTickets: parseInt(numberOfTickets)
                };
                const response = await axios.post(`/bookings?userId=${userId}`, bookingRequest);
                showSuccess('Booking successful! Reference: ' + (response.data.bookingReference || 'N/A'));
                // Refresh the events list to update available tickets
                populateEvents();
            } catch (error) {
                showError('Booking failed: ' + (error.response?.data?.message || error.message));
            }
        });
    });
}

function showSuccess(message) {
    const el = document.getElementById('successMessage');
    el.textContent = message;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 5000);
}

function showError(message) {
    const el = document.getElementById('errorMessage');
    el.textContent = message;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 8000);
}

document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    window.location.href = 'login.html';
});

// Initialize the page
populateEvents();