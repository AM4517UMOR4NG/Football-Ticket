// FootballTix Bookings Page Integration - Fixed Version
const API_BASE_URL = '/api';

// DOM Elements
const bookingsGrid = document.getElementById('bookings-grid');
const loadingState = document.getElementById('loading-state');
const errorState = document.getElementById('error-state');
const emptyState = document.getElementById('empty-state');

// Stats elements
const totalBookings = document.getElementById('total-bookings');
const confirmedBookings = document.getElementById('confirmed-bookings');
const upcomingBookings = document.getElementById('upcoming-bookings');
const totalSpent = document.getElementById('total-spent');

// Filter buttons
const allFilter = document.getElementById('all-filter');
const confirmedFilter = document.getElementById('confirmed-filter');
const cancelledFilter = document.getElementById('cancelled-filter');
const completedFilter = document.getElementById('completed-filter');

// View buttons
const gridViewBtn = document.getElementById('grid-view');
const listViewBtn = document.getElementById('list-view');

// Booking elements
const bookingLoadingState = document.getElementById('booking-loading-state');
const bookingEventsGrid = document.getElementById('booking-events-grid');
const bookingErrorState = document.getElementById('booking-error-state');
const bookingSummary = document.getElementById('booking-summary');
const noSelection = document.getElementById('no-selection');
const selectedEventTitle = document.getElementById('selected-event-title');
const selectedEventVenue = document.getElementById('selected-event-venue');
const selectedEventDate = document.getElementById('selected-event-date');
const ticketCount = document.getElementById('ticket-count');
const pricePerTicket = document.getElementById('price-per-ticket');
const totalPrice = document.getElementById('total-price');
const decreaseTickets = document.getElementById('decrease-tickets');
const increaseTickets = document.getElementById('increase-tickets');
const confirmBooking = document.getElementById('confirm-booking');

// Global variables
let allBookings = [];
let allEvents = [];
let currentFilter = 'all';
let currentView = 'grid';
let selectedEvent = null;
let currentTicketCount = 1;

// Theme & Navigation delegated to shared FootballTixLayout
document.addEventListener('DOMContentLoaded', function () {
    initializeBookingsPage();
});

async function initializeBookingsPage() {
    try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        updateNavigation();
        await Promise.all([
            loadBookings(),
            loadBookingEvents()
        ]);

        setupEventListeners();
        setupBookingEventListeners();

    } catch (error) {
        console.error('Error initializing bookings page:', error);
        showError('Please refresh the page to see the cancelled bookings.');
    }
}

function updateNavigation() {
    if (window.FootballTixLayout) {
        window.FootballTixLayout.renderNavbar();
    }
}

function handleLogout() {
    if (window.FootballTixLayout) {
        window.FootballTixLayout.logout();
        return;
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    window.location.href = 'index.html';
}

async function loadBookings() {
    try {
        showLoading();

        const token = localStorage.getItem('accessToken');
        const userId = localStorage.getItem('userId');

        if (!token || !userId) {
            throw new Error('User not authenticated');
        }

        const response = await fetch(`${API_BASE_URL}/bookings/my-bookings`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('userId');
                window.location.href = 'login.html';
                return;
            }
            throw new Error('Failed to fetch bookings');
        }

        const bookings = await response.json();

        // Enrich bookings with event details if missing
        const enrichedBookings = await Promise.all(bookings.map(async (booking) => {
            if (!booking.eventTitle || !booking.venue) {
                try {
                    const eventResponse = await fetch(`${API_BASE_URL}/events/${booking.eventId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (eventResponse.ok) {
                        const event = await eventResponse.json();
                        return {
                            ...booking,
                            eventTitle: event.title || 'Event Title',
                            venue: event.venue || 'Venue',
                            eventDate: event.eventDate || booking.eventDate
                        };
                    }
                } catch (error) {
                    console.warn('Failed to fetch event details for booking:', booking.id);
                }
            }
            return {
                ...booking,
                eventTitle: booking.eventTitle || 'Event Title',
                venue: booking.venue || 'Venue'
            };
        }));

        // Auto-sync PENDING bookings with Midtrans (fixes sandbox redirect issue)
        const pendingBookings = enrichedBookings.filter(b => b.status === 'PENDING');
        if (pendingBookings.length > 0) {
            console.log(`Syncing ${pendingBookings.length} PENDING booking(s) with Midtrans...`);
            await Promise.all(pendingBookings.map(async (b) => {
                try {
                    await fetch(`${API_BASE_URL}/payments/sync-status/${b.bookingReference}`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                } catch (e) { console.warn('Sync failed for', b.bookingReference, e); }
            }));
            // Re-fetch bookings to get updated statuses
            const refreshResponse = await fetch(`${API_BASE_URL}/bookings/my-bookings`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (refreshResponse.ok) {
                const refreshedBookings = await refreshResponse.json();
                allBookings = refreshedBookings;
                updateStats(refreshedBookings);
                displayBookings(refreshedBookings);
                hideLoading();
                return;
            }
        }

        allBookings = enrichedBookings;

        updateStats(enrichedBookings);
        displayBookings(enrichedBookings);

        hideLoading();

    } catch (error) {
        console.error('Error loading bookings:', error);
        showError('Failed to load bookings. Please try again.');
        hideLoading();
    }
}

async function loadBookingEvents() {
    try {
        showBookingLoading();

        const response = await fetch(`${API_BASE_URL}/events`);

        if (!response.ok) {
            throw new Error('Failed to fetch events');
        }

        const events = await response.json();
        allEvents = events;

        displayBookingEvents(events);
        hideBookingLoading();

    } catch (error) {
        console.error('Error loading events:', error);
        showBookingError('Failed to load events. Please try again.');
        hideBookingLoading();
    }
}

function displayBookingEvents(events) {
    if (!bookingEventsGrid) return;

    if (events.length === 0) {
        bookingEventsGrid.innerHTML = `
            <div class="col-span-2 text-center py-8">
                <div class="text-gray-500">No events available at the moment.</div>
            </div>
        `;
        return;
    }

    bookingEventsGrid.innerHTML = events.map(event => `
        <div class="booking-event-card bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100/80 hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] hover:border-gray-300 p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 border-transparent hover:border-blue-500" 
             onclick="selectEvent(${event.id})">
            <div class="flex justify-between items-start mb-3">
                <div class="flex-1">
                    <h4 class="font-semibold text-gray-900 text-lg mb-1">${event.title}</h4>
                    <p class="text-sm text-gray-600 mb-2">${event.venue}</p>
                    <p class="text-sm text-gray-500">${formatEventDate(event.eventDate)}</p>
                </div>
                <div class="text-right">
                    <div class="text-2xl font-bold text-green-600">Rp ${new Intl.NumberFormat('id-ID').format(event.price)}</div>
                    <div class="text-xs text-gray-500">per ticket</div>
                </div>
            </div>
            
            <div class="flex justify-between items-center text-sm">
                <span class="text-gray-600">Available seats: ${Number(event.availableSeats ?? event.totalSeats ?? 0).toLocaleString()}</span>
                <span class="text-blue-600 font-medium">Select Match</span>
            </div>
        </div>
    `).join('');
}

function selectEvent(eventId) {
    const event = allEvents.find(e => e.id === eventId);
    if (!event) return;

    selectedEvent = event;
    currentTicketCount = 1;

    selectedEventTitle.textContent = event.title;
    selectedEventVenue.textContent = event.venue;
    selectedEventDate.textContent = formatEventDate(event.eventDate);
    ticketCount.textContent = currentTicketCount;
    pricePerTicket.textContent = `Rp ${new Intl.NumberFormat('id-ID').format(event.price)}`;
    updateTotalPrice();

    bookingSummary.classList.remove('hidden');
    noSelection.classList.add('hidden');

    document.querySelectorAll('.booking-event-card').forEach(card => {
        card.classList.remove('border-blue-500', 'bg-blue-50');
    });

    const selectedCard = document.querySelector(`[onclick="selectEvent(${eventId})"]`);
    if (selectedCard) {
        selectedCard.classList.add('border-blue-500', 'bg-blue-50');
    }
}

function updateTotalPrice() {
    if (selectedEvent) {
        const total = Number(selectedEvent.price || 0) * currentTicketCount;
        totalPrice.textContent = `Rp ${new Intl.NumberFormat('id-ID').format(total)}`;
    }
}

function setupBookingEventListeners() {
    if (decreaseTickets) {
        decreaseTickets.addEventListener('click', () => {
            if (currentTicketCount > 1) {
                currentTicketCount--;
                ticketCount.textContent = currentTicketCount;
                updateTotalPrice();
            }
        });
    }

    if (increaseTickets) {
        increaseTickets.addEventListener('click', () => {
            if (currentTicketCount < 10) {
                currentTicketCount++;
                ticketCount.textContent = currentTicketCount;
                updateTotalPrice();
            }
        });
    }

    if (confirmBooking) {
        confirmBooking.addEventListener('click', handleConfirmBooking);
    }
}

async function handleConfirmBooking() {
    if (!selectedEvent) {
        showError('Please select an event first.');
        return;
    }

    try {
        const token = localStorage.getItem('accessToken');
        const userId = localStorage.getItem('userId');

        if (!token || !userId) {
            throw new Error('User not authenticated');
        }

        const bookingData = {
            eventId: selectedEvent.id,
            numberOfTickets: currentTicketCount
        };

        const response = await fetch(`${API_BASE_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(errorData);
        }

        const bookingResponse = await response.json();

        resetBookingForm();
        await loadBookings();

        showSuccess('Booking created successfully!');

    } catch (error) {
        console.error('Error creating booking:', error);
        showError('Failed to create booking: ' + error.message);
    }
}

function resetBookingForm() {
    selectedEvent = null;
    currentTicketCount = 1;

    bookingSummary.classList.add('hidden');
    noSelection.classList.remove('hidden');
    ticketCount.textContent = '1';
    pricePerTicket.textContent = 'Rp 0';
    totalPrice.textContent = 'Rp 0';

    document.querySelectorAll('.booking-event-card').forEach(card => {
        card.classList.remove('border-blue-500', 'bg-blue-50');
    });
}

function showBookingLoading() {
    if (bookingLoadingState) bookingLoadingState.classList.remove('hidden');
    if (bookingEventsGrid) bookingEventsGrid.classList.add('hidden');
    if (bookingErrorState) bookingErrorState.classList.add('hidden');
}

function hideBookingLoading() {
    if (bookingLoadingState) bookingLoadingState.classList.add('hidden');
    if (bookingEventsGrid) bookingEventsGrid.classList.remove('hidden');
}

function showBookingError(message) {
    if (bookingErrorState) {
        bookingErrorState.querySelector('.text-red-600').textContent = message;
        bookingErrorState.classList.remove('hidden');
    }
    if (bookingLoadingState) bookingLoadingState.classList.add('hidden');
    if (bookingEventsGrid) bookingEventsGrid.classList.add('hidden');
}

function displayBookings(bookings) {
    if (!bookingsGrid) return;

    if (bookings.length === 0) {
        showEmptyState();
        return;
    }

    hideEmptyState();

    bookingsGrid.innerHTML = bookings.map(booking => `
        <div class="booking-card bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100/80 hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] hover:border-gray-300 overflow-hidden transition-all duration-500 hover:scale-105">
                <div class="h-40 relative group overflow-hidden">
                    ${booking.imageUrl ? `
                    <img src="${booking.imageUrl}" alt="Event" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/60"></div>
                    ` : `
                    <div class="w-full h-full bg-neutral-900"></div>
                    <div class="absolute inset-0 ticket-pattern opacity-20"></div>
                    `}
                    <div class="absolute inset-x-0 top-0 p-4">
                        <div class="flex justify-between items-start">
                            <div>
                                <div class="text-xs font-bold text-white/80 uppercase tracking-wider mb-1">Booking Ref</div>
                                <div class="text-sm font-mono font-medium text-white bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm border border-white/10">#${booking.bookingReference}</div>
                            </div>
                            <div class="status-${booking.status.toLowerCase()} px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg backdrop-blur-md border border-white/20">
                                ${booking.status}
                            </div>
                        </div>
                    </div>
                </div>
            
            <div class="p-6">
                <h3 class="text-xl font-bold text-gray-900 mb-3 line-clamp-2">${booking.eventTitle}</h3>
                
                <div class="space-y-3 mb-6">
                    <div class="flex items-center text-gray-500 text-sm">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        ${booking.venue}
                    </div>
                    <div class="flex items-center text-gray-500 text-sm">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        ${formatEventDate(booking.eventDate)}
                    </div>
                    <div class="flex items-center text-gray-500 text-sm">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
                        </svg>
                        ${booking.numberOfTickets} ticket${booking.numberOfTickets > 1 ? 's' : ''}
                    </div>
                </div>
                
                <div class="flex items-center justify-between mb-4">
                    <div class="text-3xl font-bold text-green-600">Rp ${new Intl.NumberFormat('id-ID').format(booking.totalAmount)}</div>
                    <div class="text-sm text-gray-500">total paid</div>
                </div>
                
                <div class="flex space-x-3">
                    ${booking.status === 'CONFIRMED' ? `
                        <button onclick="viewTicket('${booking.bookingReference}')" 
                                class="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
                            View Ticket
                        </button>
                        <button onclick="cancelBooking(${booking.id})" 
                                class="px-4 py-3 border-2 border-red-600 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-all duration-200">
                            Cancel
                        </button>
                    ` : booking.status === 'CANCELLED' ? `
                        <button onclick="viewBookingDetails('${booking.bookingReference}')" 
                                class="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200">
                            View Details
                        </button>
                    ` : `
                        <button onclick="viewBookingDetails('${booking.bookingReference}')" 
                                class="flex-1 bg-emerald-600 hover:bg-emerald-700 shadow-lg hover:shadow-sm  text-white px-4 py-3 rounded-lg font-medium transition-all duration-200">
                            View Details
                        </button>
                    `}
                </div>
            </div>
        </div>
    `).join('');
}

function setupEventListeners() {
    if (allFilter) {
        allFilter.addEventListener('click', () => setFilter('all'));
    }

    if (confirmedFilter) {
        confirmedFilter.addEventListener('click', () => setFilter('confirmed'));
    }

    if (cancelledFilter) {
        cancelledFilter.addEventListener('click', () => setFilter('cancelled'));
    }

    if (completedFilter) {
        completedFilter.addEventListener('click', () => setFilter('completed'));
    }

    if (gridViewBtn) {
        gridViewBtn.addEventListener('click', () => setViewMode('grid'));
    }

    if (listViewBtn) {
        listViewBtn.addEventListener('click', () => setViewMode('list'));
    }
}

function setFilter(filter) {
    currentFilter = filter;

    const filterButtons = [allFilter, confirmedFilter, cancelledFilter, completedFilter];
    const filterNames = ['all', 'confirmed', 'cancelled', 'completed'];

    filterButtons.forEach((btn, index) => {
        if (btn) {
            if (filterNames[index] === filter) {
                btn.className = 'px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-medium';
            } else {
                btn.className = 'px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium';
            }
        }
    });

    let filteredBookings = allBookings;

    if (filter === 'confirmed') {
        filteredBookings = allBookings.filter(booking => booking.status === 'CONFIRMED');
    } else if (filter === 'cancelled') {
        filteredBookings = allBookings.filter(booking => booking.status === 'CANCELLED');
    } else if (filter === 'completed') {
        filteredBookings = allBookings.filter(booking => booking.status === 'COMPLETED');
    }

    displayBookings(filteredBookings);
}

function setViewMode(mode) {
    currentView = mode;

    if (mode === 'grid') {
        bookingsGrid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8';
        gridViewBtn.className = 'px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-medium';
        listViewBtn.className = 'px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium';
    } else {
        bookingsGrid.className = 'space-y-6';
        gridViewBtn.className = 'px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium';
        listViewBtn.className = 'px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-medium';
    }
}

async function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
    }

    try {
        const token = localStorage.getItem('accessToken');
        const userId = localStorage.getItem('userId');

        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to cancel booking');
        }

        await loadBookings();
        showSuccess('Booking cancelled successfully');

    } catch (error) {
        console.error('Error cancelling booking:', error);
        showError('Refresh the page to see the cancelled bookings.');
    }
}

function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, s => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[s]));
}

// Fetch genuine ISO/IEC 18004 QR Code PNG from authenticated backend endpoint
async function fetchTicketQrDataUrl(bookingReference, size = 240) {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(
        `${API_BASE_URL}/bookings/${encodeURIComponent(bookingReference)}/qr?size=${size}`,
        {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        }
    );
    if (!response.ok) {
        throw new Error(`Failed to load QR code (${response.status})`);
    }
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

function viewTicket(bookingReference) {
    showTicketModal(bookingReference);
}

function viewBookingDetails(bookingReference) {
    showBookingDetailsModal(bookingReference);
}

function viewAllTickets() {
    showAllTicketsModal();
}

function viewHistory() {
    showBookingHistoryModal();
}

async function showTicketModal(bookingReference) {
    const booking = allBookings.find(b => b.bookingReference === bookingReference);
    if (!booking) return;

    let qrCodeData = '';
    try {
        qrCodeData = await fetchTicketQrDataUrl(booking.bookingReference, 240);
    } catch (err) {
        console.error('Failed to fetch ticket QR code:', err);
    }

    const modalHTML = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div class="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-xl">
                    <div class="flex justify-between items-start">
                        <div>
                            <h2 class="text-2xl font-bold mb-2">Digital Ticket</h2>
                            <p class="text-green-100">Booking #${escapeHtml(booking.bookingReference)}</p>
                        </div>
                        <button onclick="closeModal()" class="text-white hover:text-gray-200">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="p-6">
                    <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6 ticket-container">
                        <div class="text-center">
                            <div class="text-4xl font-bold text-gray-900 mb-2">${escapeHtml(booking.eventTitle)}</div>
                            <div class="text-gray-600 mb-4">${escapeHtml(formatEventDate(booking.eventDate))} • ${escapeHtml(booking.venue)}</div>
                            <div class="text-2xl font-bold text-green-600 mb-2">Rp ${new Intl.NumberFormat('id-ID').format(booking.totalAmount)}</div>
                            <div class="text-sm text-gray-500">${booking.numberOfTickets} ticket${booking.numberOfTickets > 1 ? 's' : ''}</div>
                        </div>
                        <div class="mt-6 text-center">
                            <div class="inline-block bg-gray-100 p-4 rounded-lg">
                                <div class="text-xs text-gray-500 mb-2">Verified Ticket QR Code</div>
                                ${qrCodeData ? `<img src="${qrCodeData}" alt="QR Code" class="w-40 h-40 rounded-lg mx-auto" />` : '<div class="text-xs text-red-500">QR unavailable</div>'}
                                <div class="text-xs text-gray-500 mt-2 font-mono">${escapeHtml(booking.bookingReference)}</div>
                            </div>
                        </div>
                    </div>
                    <div class="flex space-x-3">
                        <button onclick="downloadTicket('${escapeHtml(booking.bookingReference)}')" 
                                class="flex-1 bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg font-medium">
                            Download PDF
                        </button>
                        <button onclick="closeModal()" 
                                class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function showBookingDetailsModal(bookingReference) {
    const booking = allBookings.find(b => b.bookingReference === bookingReference);
    if (!booking) return;

    const modalHTML = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl">
                    <div class="flex justify-between items-start">
                        <div>
                            <h2 class="text-2xl font-bold mb-2">Booking Details</h2>
                            <p class="text-blue-100">Booking #${booking.bookingReference}</p>
                        </div>
                        <button onclick="closeModal()" class="text-white hover:text-gray-200">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <div class="text-sm text-gray-500">Event</div>
                            <div class="font-medium">${booking.eventTitle}</div>
                        </div>
                        <div>
                            <div class="text-sm text-gray-500">Status</div>
                            <div class="font-medium">
                                <span class="status-${booking.status.toLowerCase()} px-2 py-1 rounded-full text-xs text-white">
                                    ${booking.status}
                                </span>
                            </div>
                        </div>
                        <div>
                            <div class="text-sm text-gray-500">Venue</div>
                            <div class="font-medium">${booking.venue}</div>
                        </div>
                        <div>
                            <div class="text-sm text-gray-500">Date & Time</div>
                            <div class="font-medium">${formatEventDate(booking.eventDate)}</div>
                        </div>
                        <div>
                            <div class="text-sm text-gray-500">Tickets</div>
                            <div class="font-medium">${booking.numberOfTickets}</div>
                        </div>
                        <div>
                            <div class="text-sm text-gray-500">Total Amount</div>
                            <div class="font-medium text-green-600">Rp ${new Intl.NumberFormat('id-ID').format(booking.totalAmount)}</div>
                        </div>
                    </div>
                    <div class="flex space-x-3">
                        <button onclick="closeModal()" 
                                class="flex-1 bg-emerald-600 hover:bg-emerald-700 shadow-lg hover:shadow-sm  text-white px-6 py-3 rounded-lg font-medium">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function showAllTicketsModal() {
    const confirmedBookings = allBookings.filter(b => b.status === 'CONFIRMED');

    if (confirmedBookings.length === 0) {
        alert('No confirmed tickets found.');
        return;
    }

    const modalHTML = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div class="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-xl">
                    <div class="flex justify-between items-start">
                        <div>
                            <h2 class="text-2xl font-bold mb-2">All Tickets</h2>
                            <p class="text-green-100">${confirmedBookings.length} confirmed ticket${confirmedBookings.length > 1 ? 's' : ''}</p>
                        </div>
                        <button onclick="closeModal()" class="text-white hover:text-gray-200">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        ${confirmedBookings.map(booking => `
                            <div class="border border-gray-200 rounded-lg p-4">
                                <div class="font-semibold text-gray-900 mb-2">${booking.eventTitle}</div>
                                <div class="text-sm text-gray-600 mb-2">${formatEventDate(booking.eventDate)}</div>
                                <div class="text-sm text-gray-600 mb-3">${booking.venue}</div>
                                <button onclick="viewTicket('${booking.bookingReference}')" 
                                        class="w-full bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg text-sm font-medium">
                                    View Ticket
                                </button>
                            </div>
                        `).join('')}
                    </div>
                    <div class="mt-6 text-center">
                        <button onclick="closeModal()" 
                                class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function showBookingHistoryModal() {
    const modalHTML = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div class="bg-neutral-900 text-white p-6 rounded-t-xl">
                    <div class="flex justify-between items-start">
                        <div>
                            <h2 class="text-2xl font-bold mb-2">Booking History</h2>
                            <p class="text-emerald-100">${allBookings.length} total booking${allBookings.length > 1 ? 's' : ''}</p>
                        </div>
                        <button onclick="closeModal()" class="text-white hover:text-gray-200">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="p-6">
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking Ref</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                ${allBookings.map(booking => `
                                    <tr>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${booking.bookingReference}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.eventTitle}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatEventDate(booking.eventDate)}</td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span class="status-${booking.status.toLowerCase()} px-2 py-1 rounded-full text-xs text-white">
                                                ${booking.status}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Rp ${new Intl.NumberFormat('id-ID').format(booking.totalAmount)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    <div class="mt-6 text-center">
                        <button onclick="closeModal()" 
                                class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeModal() {
    const modal = document.querySelector('.fixed.inset-0');
    if (modal) {
        modal.remove();
    }
}

// Enhanced PDF ticket download function
async function downloadTicket(bookingReference) {
    const booking = allBookings.find(b => b.bookingReference === bookingReference);
    if (!booking) {
        alert('Booking not found');
        return;
    }

    try {
        // Fetch verified ISO QR code before opening print window
        const qrCodeData = await fetchTicketQrDataUrl(booking.bookingReference, 240);

        // Create a new window with the ticket content for printing
        const ticketWindow = window.open('', '_blank', 'width=800,height=600');
        if (!ticketWindow) {
            alert('Please allow popups to download your ticket.');
            return;
        }

        const ticketHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Ticket - ${escapeHtml(booking.bookingReference)}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 20px;
                        background: #f5f5f5;
                    }
                    .ticket {
                        background: white;
                        border: 2px dashed #ccc;
                        border-radius: 15px;
                        padding: 30px;
                        margin: 20px auto;
                        max-width: 600px;
                        position: relative;
                        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                    }
                    .ticket::before {
                        content: '';
                        position: absolute;
                        left: -10px;
                        top: 50%;
                        transform: translateY(-50%);
                        width: 20px;
                        height: 20px;
                        background: #f5f5f5;
                        border-radius: 50%;
                    }
                    .ticket::after {
                        content: '';
                        position: absolute;
                        right: -10px;
                        top: 50%;
                        transform: translateY(-50%);
                        width: 20px;
                        height: 20px;
                        background: #f5f5f5;
                        border-radius: 50%;
                    }
                    .header {
                        text-align: center;
                        border-bottom: 2px dashed #ccc;
                        padding-bottom: 20px;
                        margin-bottom: 20px;
                    }
                    .event-title {
                        font-size: 28px;
                        font-weight: bold;
                        color: #333;
                        margin-bottom: 10px;
                    }
                    .booking-ref {
                        font-size: 14px;
                        color: #666;
                        background: #f0f0f0;
                        padding: 5px 15px;
                        border-radius: 20px;
                        display: inline-block;
                    }
                    .details {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 20px;
                        margin-bottom: 30px;
                    }
                    .detail-item {
                        padding: 10px;
                    }
                    .detail-label {
                        font-size: 12px;
                        color: #666;
                        text-transform: uppercase;
                        margin-bottom: 5px;
                    }
                    .detail-value {
                        font-size: 16px;
                        font-weight: bold;
                        color: #333;
                    }
                    .qr-section {
                        text-align: center;
                        border-top: 2px dashed #ccc;
                        padding-top: 20px;
                    }
                    .qr-code {
                        display: inline-block;
                        background: #f9f9f9;
                        padding: 15px;
                        border-radius: 10px;
                    }
                    .price {
                        color: #22c55e;
                        font-size: 24px;
                        font-weight: bold;
                    }
                    .status {
                        background: #22c55e;
                        color: white;
                        padding: 5px 15px;
                        border-radius: 20px;
                        font-size: 12px;
                        font-weight: bold;
                    }
                    @media print {
                        body { background: white; }
                        .ticket { box-shadow: none; }
                    }
                </style>
            </head>
            <body>
                <div class="ticket">
                    <div class="header">
                        <div class="event-title">${booking.eventTitle}</div>
                        <div class="booking-ref">Booking #${booking.bookingReference}</div>
                    </div>
                    
                    <div class="details">
                        <div class="detail-item">
                            <div class="detail-label">Venue</div>
                            <div class="detail-value">${booking.venue}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Date & Time</div>
                            <div class="detail-value">${formatEventDate(booking.eventDate)}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Tickets</div>
                            <div class="detail-value">${booking.numberOfTickets} ticket${booking.numberOfTickets > 1 ? 's' : ''}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Total Amount</div>
                            <div class="detail-value price">Rp ${new Intl.NumberFormat('id-ID').format(booking.totalAmount)}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Status</div>
                            <div class="detail-value"><span class="status">${booking.status}</span></div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Booking Date</div>
                            <div class="detail-value">${formatBookingDate(booking.bookingDate)}</div>
                        </div>
                    </div>
                    
                    <div class="qr-section">
                        <div class="detail-label">QR Code</div>
                        <div class="qr-code">
                            <img src="${qrCodeData}" alt="QR Code" style="width: 120px; height: 120px;" />
                        </div>
                        <div style="margin-top: 10px; font-size: 12px; color: #666;">
                            Present this QR code at the venue entrance
                        </div>
                    </div>
                </div>
                
                <script>
                    window.onload = function() {
                        window.print();
                    }
                </script>
            </body>
            </html>
        `;

        ticketWindow.document.write(ticketHTML);
        ticketWindow.document.close();

    } catch (error) {
        console.error('Error generating ticket:', error);
        alert('Failed to generate ticket. Please try again.');
    }
}

function updateStats(bookings) {
    const total = bookings.length;
    const confirmed = bookings.filter(b => b.status === 'CONFIRMED').length;
    const upcoming = bookings.filter(b => {
        const eventDate = new Date(b.eventDate);
        const now = new Date();
        return b.status === 'CONFIRMED' && eventDate > now;
    }).length;
    const totalSpentAmount = bookings
        .filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
        .reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0);

    if (totalBookings) totalBookings.textContent = total;
    if (confirmedBookings) confirmedBookings.textContent = confirmed;
    if (upcomingBookings) upcomingBookings.textContent = upcoming;
    if (totalSpent) totalSpent.textContent = `Rp ${new Intl.NumberFormat('id-ID').format(totalSpentAmount)}`;
}

// Utility functions
function formatBookingDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${dayName}, ${day} ${month} ${year}`;
}

function formatEventDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${dayName}, ${day} ${month} ${year} • ${hours}:${minutes}`;
}

function showLoading() {
    if (loadingState) loadingState.classList.remove('hidden');
    if (bookingsGrid) bookingsGrid.classList.add('hidden');
    if (errorState) errorState.classList.add('hidden');
    if (emptyState) emptyState.classList.add('hidden');
}

function hideLoading() {
    if (loadingState) loadingState.classList.add('hidden');
    if (bookingsGrid) bookingsGrid.classList.remove('hidden');
}

function showError(message) {
    if (errorState) {
        const errorElement = errorState.querySelector('.text-red-600');
        if (errorElement) {
            errorElement.textContent = message;
        }
        errorState.classList.remove('hidden');
    }
    if (loadingState) loadingState.classList.add('hidden');
    if (bookingsGrid) bookingsGrid.classList.add('hidden');
    if (emptyState) emptyState.classList.add('hidden');
}

function showSuccess(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300';
    notification.innerHTML = `
        <div class="flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            ${message}
        </div>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function showEmptyState() {
    if (emptyState) emptyState.classList.remove('hidden');
    if (loadingState) loadingState.classList.add('hidden');
    if (errorState) errorState.classList.add('hidden');
    if (bookingsGrid) bookingsGrid.classList.add('hidden');
}

function hideEmptyState() {
    if (emptyState) emptyState.classList.add('hidden');
    if (bookingsGrid) bookingsGrid.classList.remove('hidden');
}

// Add CSS for line-clamp utility and status colors
const style = document.createElement('style');
style.textContent = `
    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    
    .status-confirmed {
        background-color: #22c55e;
    }
    
    .status-cancelled {
        background-color: #ef4444;
    }
    
    .status-completed {
        background-color: #6b7280;
    }
    
    .status-pending {
        background-color: #f59e0b;
    }
    
    .ticket-pattern {
        background-image: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(255,255,255,0.1) 10px,
            rgba(255,255,255,0.1) 20px
        );
    }
`;
document.head.appendChild(style);

// Admin dashboard access control and league loading
function checkAdminDashboardAccess() {
    const userRole = localStorage.getItem('userRole');
    if (window.location.pathname.endsWith('admin-dashboard.html')) {
        if (userRole !== 'ADMIN') {
            window.location.href = 'index.html';
            return;
        }
        loadAdminLeagues();
    }
}

async function loadAdminLeagues() {
    const leaguesTable = document.getElementById('admin-leagues-table');
    const leaguesTbody = document.getElementById('admin-leagues-tbody');
    if (!leaguesTable || !leaguesTbody) return;

    leaguesTbody.innerHTML = '<tr><td colspan="6" class="text-center py-4">Loading...</td></tr>';

    try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/leagues`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });

        if (!response.ok) throw new Error('Failed to fetch leagues');

        const leagues = await response.json();

        if (leagues.length === 0) {
            leaguesTbody.innerHTML = '<tr><td colspan="6" class="text-center py-4">No leagues found.</td></tr>';
            return;
        }

        leaguesTbody.innerHTML = leagues.map(l => `
            <tr class="hover:bg-gray-50">
                <td class="px-4 py-2">${l.id}</td>
                <td class="px-4 py-2">${l.name}</td>
                <td class="px-4 py-2">${l.country}</td>
                <td class="px-4 py-2">
                    <span class="px-2 py-1 rounded-full text-xs ${l.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                        ${l.status}
                    </span>
                </td>
                <td class="px-4 py-2">${l.foundedYear}</td>
                <td class="px-4 py-2">${l.totalTeams}</td>
            </tr>
        `).join('');
    } catch (err) {
        leaguesTbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-red-600">Error: ${err.message}</td></tr>`;
    }
}

