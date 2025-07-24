const apiUrl = 'http://localhost:8080/api';
let token = localStorage.getItem('accessToken');
let userId = parseInt(localStorage.getItem('userId'));

if (!token || isNaN(userId)) {
    alert('Please log in');
    window.location.href = 'login.html';
}

axios.defaults.baseURL = apiUrl;
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// Dummy images for events (by index)
const eventImages = [
  [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80'
  ],
  [
    'https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1505843273132-bc5c6e6f4a59?auto=format&fit=crop&w=600&q=80'
  ],
  [
    'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80'
  ],
  [
    'https://images.unsplash.com/photo-1465378552210-88481e0b7c33?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1505843273132-bc5c6e6f4a59?auto=format&fit=crop&w=600&q=80'
  ],
  [
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80'
  ]
];

async function populateEvents() {
    try {
        const response = await axios.get('/events');
        const events = response.data;
        const eventsList = document.getElementById('eventsList');

        if (events.length === 0) {
            eventsList.innerHTML = '<p class="text-gray-400 col-span-full text-center">No events available at the moment.</p>';
            return;
        }

        eventsList.innerHTML = events.map((event, idx) => {
          const images = eventImages[idx % eventImages.length];
          return `
            <div class="event-card p-4 animate-card-in flex flex-col gap-3">
              <div class="relative w-full h-48 rounded-xl overflow-hidden mb-2 group">
                <img src="${images[0]}" class="event-img w-full h-full object-cover transition-all duration-500 rounded-xl" data-idx="0" style="z-index:1;" />
                <button class="absolute left-2 top-1/2 -translate-y-1/2 bg-blue-700 bg-opacity-70 hover:bg-blue-900 text-white rounded-full p-2 shadow-md prev-btn" style="z-index:2;" title="Previous"><svg xmlns='http://www.w3.org/2000/svg' class='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M15 19l-7-7 7-7' /></svg></button>
                <button class="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-700 bg-opacity-70 hover:bg-blue-900 text-white rounded-full p-2 shadow-md next-btn" style="z-index:2;" title="Next"><svg xmlns='http://www.w3.org/2000/svg' class='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9 5l7 7-7 7' /></svg></button>
              </div>
              <h3 class="text-xl font-semibold text-white">${event.title}</h3>
              <p class="text-blue-200">Venue: ${event.venue}</p>
              <p class="text-blue-200">Date: ${event.eventDate ? new Date(event.eventDate).toLocaleDateString() : 'TBD'}</p>
              <p class="text-blue-100">${event.description || 'No description available'}</p>
              <p class="text-blue-100">Available Tickets: ${event.availableTickets || 'Unlimited'}</p>
              <p class="text-blue-100">Price: $${event.price || 'Free'}</p>
            </div>
          `;
        }).join('');

        // Slider logic for each event card
        document.querySelectorAll('.event-card').forEach((card, idx) => {
          const images = eventImages[idx % eventImages.length];
          let current = 0;
          const img = card.querySelector('.event-img');
          const prevBtn = card.querySelector('.prev-btn');
          const nextBtn = card.querySelector('.next-btn');
          function showImg(i) {
            current = (i + images.length) % images.length;
            img.src = images[current];
            img.setAttribute('data-idx', current);
          }
          prevBtn.addEventListener('click', e => { e.preventDefault(); showImg(current - 1); });
          nextBtn.addEventListener('click', e => { e.preventDefault(); showImg(current + 1); });
        });
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