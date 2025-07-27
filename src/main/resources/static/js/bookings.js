// FootballTix Bookings Page Integration
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

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializeBookingsPage();
});

async function initializeBookingsPage() {
    try {
        // Check if user is logged in
        const token = localStorage.getItem('accessToken');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        // Update navigation based on user role
        updateNavigation();

        // Load bookings and events
        await Promise.all([
            loadBookings(),
            loadBookingEvents()
        ]);
        
        // Setup event listeners
        setupEventListeners();
        setupBookingEventListeners();
        
    } catch (error) {
        console.error('Error initializing bookings page:', error);
        showError('Failed to load bookings. Please try again.');
    }
}

function updateNavigation() {
    const token = localStorage.getItem('accessToken');
    const userRole = localStorage.getItem('userRole');
    const username = localStorage.getItem('username');
    
    const signInBtn = document.querySelector('a[href="login.html"]');
    const navContainer = document.querySelector('.hidden.md\\:flex.items-center.space-x-4');
    
    if (token && username) {
        // Remove sign in button
        if (signInBtn) {
            signInBtn.parentElement.remove();
        }
        
        // Add user menu
        const userMenu = document.createElement('div');
        userMenu.className = 'flex items-center space-x-4';
        userMenu.innerHTML = `
            <div class="relative">
                <button id="user-menu-btn" class="flex items-center space-x-2 text-gray-700 hover:text-blue-700">
                    <span class="text-sm font-medium">${username}</span>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
                <div id="user-dropdown" class="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    ${userRole === 'ADMIN' ? '<a href="admin-dashboard.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Admin Dashboard</a>' : ''}
                    <a href="profile.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
                    <a href="#" onclick="handleLogout()" class="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Logout</a>
                </div>
            </div>
        `;
        
        // Replace sign in button with user menu
        const signInContainer = document.querySelector('.flex.items-center');
        if (signInContainer) {
            signInContainer.innerHTML = '';
            signInContainer.appendChild(userMenu);
        }
        
        // Add dropdown functionality
        const userMenuBtn = document.getElementById('user-menu-btn');
        const userDropdown = document.getElementById('user-dropdown');
        
        if (userMenuBtn && userDropdown) {
            userMenuBtn.addEventListener('click', () => {
                userDropdown.classList.toggle('hidden');
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                    userDropdown.classList.add('hidden');
                }
            });
        }
    }
}

function handleLogout() {
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
        
        const response = await fetch(`${API_BASE_URL}/bookings/user/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                // Token expired or invalid
                localStorage.removeItem('accessToken');
                localStorage.removeItem('userId');
                window.location.href = 'login.html';
                return;
            }
            throw new Error('Failed to fetch bookings');
        }
        
        const bookings = await response.json();
        allBookings = bookings;
        
        updateStats(bookings);
        displayBookings(bookings);
        
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
        <div class="booking-event-card bg-white rounded-lg shadow-md p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 border-transparent hover:border-blue-500" 
             onclick="selectEvent(${event.id})">
            <div class="flex justify-between items-start mb-3">
                <div class="flex-1">
                    <h4 class="font-semibold text-gray-900 text-lg mb-1">${event.title}</h4>
                    <p class="text-sm text-gray-600 mb-2">${event.venue}</p>
                    <p class="text-sm text-gray-500">${formatEventDate(event.eventDate)}</p>
                </div>
                <div class="text-right">
                    <div class="text-2xl font-bold text-green-600">£${event.price}</div>
                    <div class="text-xs text-gray-500">per ticket</div>
                </div>
            </div>
            
            <div class="flex justify-between items-center text-sm">
                <span class="text-gray-600">Available seats: ${event.totalSeats}</span>
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
    
    // Update UI
    selectedEventTitle.textContent = event.title;
    selectedEventVenue.textContent = event.venue;
    selectedEventDate.textContent = formatEventDate(event.eventDate);
    ticketCount.textContent = currentTicketCount;
    pricePerTicket.textContent = `£${event.price}`;
    updateTotalPrice();
    
    // Show booking summary
    bookingSummary.classList.remove('hidden');
    noSelection.classList.add('hidden');
    
    // Update selected event styling
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
        const total = selectedEvent.price * currentTicketCount;
        totalPrice.textContent = `£${total.toFixed(2)}`;
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
        
        const response = await fetch(`${API_BASE_URL}/bookings?userId=${userId}`, {
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
        
        // Reset booking form
        resetBookingForm();
        
        // Reload bookings
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
    
    // Reset UI
    bookingSummary.classList.add('hidden');
    noSelection.classList.remove('hidden');
    ticketCount.textContent = '1';
    pricePerTicket.textContent = '£0';
    totalPrice.textContent = '£0';
    
    // Remove selection styling
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
        <div class="booking-card bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-500 hover:scale-105">
            <div class="relative">
                <div class="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4">
                    <div class="flex justify-between items-center">
                        <div>
                            <div class="text-sm font-medium">Booking #${booking.bookingReference}</div>
                            <div class="text-xs opacity-90">${formatBookingDate(booking.bookingDate)}</div>
                        </div>
                        <div class="status-${booking.status.toLowerCase()} px-3 py-1 rounded-full text-xs font-medium text-white">
                            ${booking.status}
                        </div>
                    </div>
                </div>
                
                <!-- Ticket Pattern Overlay -->
                <div class="absolute inset-0 ticket-pattern opacity-10"></div>
            </div>
            
            <div class="p-6">
                <h3 class="text-xl font-bold text-gray-900 mb-3 line-clamp-2">${booking.eventTitle}</h3>
                
                <!-- Event Details -->
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
                
                <!-- Price and Actions -->
                <div class="flex items-center justify-between mb-4">
                    <div class="text-3xl font-bold text-green-600">£${booking.totalAmount}</div>
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
                                class="flex-1 bg-blue-700 hover:bg-blue-800 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200">
                            View Details
                        </button>
                    `}
                </div>
            </div>
        </div>
    `).join('');
}

function setupEventListeners() {
    // Filter functionality
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
    
    // View toggle
    if (gridViewBtn) {
        gridViewBtn.addEventListener('click', () => setViewMode('grid'));
    }
    
    if (listViewBtn) {
        listViewBtn.addEventListener('click', () => setViewMode('list'));
    }
}

function setFilter(filter) {
    currentFilter = filter;
    
    // Update filter button styles
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
    
    // Filter bookings
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
        
        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel?userId=${userId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to cancel booking');
        }
        
        // Reload bookings
        await loadBookings();
        
        showSuccess('Booking cancelled successfully');
        
    } catch (error) {
        console.error('Error cancelling booking:', error);
        showError('Failed to cancel booking. Please try again.');
    }
}

function viewTicket(bookingReference) {
    // Show ticket modal
    showTicketModal(bookingReference);
}

function viewBookingDetails(bookingReference) {
    // Show booking details modal
    showBookingDetailsModal(bookingReference);
}

function viewAllTickets() {
    // Show all tickets modal
    showAllTicketsModal();
}

function viewHistory() {
    // Show booking history modal
    showBookingHistoryModal();
}

async function showTicketModal(bookingReference) {
    const booking = allBookings.find(b => b.bookingReference === bookingReference);
    if (!booking) return;
    
    const modalHTML = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div class="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-xl">
                    <div class="flex justify-between items-start">
                        <div>
                            <h2 class="text-2xl font-bold mb-2">Digital Ticket</h2>
                            <p class="text-green-100">Booking #${booking.bookingReference}</p>
                        </div>
                        <button onclick="closeModal()" class="text-white hover:text-gray-200">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="p-6">
                    <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6">
                        <div class="text-center">
                            <div class="text-4xl font-bold text-gray-900 mb-2">${booking.eventTitle}</div>
                            <div class="text-gray-600 mb-4">${formatEventDate(booking.eventDate)} • ${booking.venue}</div>
                            <div class="text-2xl font-bold text-green-600 mb-2">£${booking.totalAmount}</div>
                            <div class="text-sm text-gray-500">${booking.numberOfTickets} ticket${booking.numberOfTickets > 1 ? 's' : ''}</div>
                        </div>
                        <div class="mt-6 text-center">
                            <div class="inline-block bg-gray-100 p-4 rounded-lg">
                                <div class="text-xs text-gray-500 mb-2">QR Code</div>
                                <div class="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <svg class="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M3 3h6v6H3V3zm0 12h6v6H3v-6zm12-12h6v6h-6V3zm0 12h6v6h-6v-6z"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex space-x-3">
                        <button onclick="downloadTicket('${booking.bookingReference}')" 
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
                            <div class="font-medium text-green-600">£${booking.totalAmount}</div>
                        </div>
                    </div>
                    <div class="flex space-x-3">
                        <button onclick="closeModal()" 
                                class="flex-1 bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-medium">
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
                <div class="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-t-xl">
                    <div class="flex justify-between items-start">
                        <div>
                            <h2 class="text-2xl font-bold mb-2">Booking History</h2>
                            <p class="text-purple-100">${allBookings.length} total booking${allBookings.length > 1 ? 's' : ''}</p>
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
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">£${booking.totalAmount}</td>
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

function downloadTicket(bookingReference) {
    // In a real application, this would generate and download a PDF ticket
    alert(`Downloading ticket for booking #${bookingReference}`);
}

function updateStats(bookings) {
    const total = bookings.length;
    const confirmed = bookings.filter(b => b.status === 'CONFIRMED').length;
    const upcoming = bookings.filter(b => {
        const eventDate = new Date(b.eventDate);
        const now = new Date();
        return b.status === 'CONFIRMED' && eventDate > now;
    }).length;
    const totalSpentAmount = bookings.reduce((sum, b) => sum + parseFloat(b.totalAmount), 0);
    
    if (totalBookings) totalBookings.textContent = total;
    if (confirmedBookings) confirmedBookings.textContent = confirmed;
    if (upcomingBookings) upcomingBookings.textContent = upcoming;
    if (totalSpent) totalSpent.textContent = `£${totalSpentAmount.toFixed(2)}`;
}

// Utility functions
function formatBookingDate(dateString) {
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
        errorState.querySelector('.text-red-600').textContent = message;
        errorState.classList.remove('hidden');
    }
    if (loadingState) loadingState.classList.add('hidden');
    if (bookingsGrid) bookingsGrid.classList.add('hidden');
    if (emptyState) emptyState.classList.add('hidden');
}

function showSuccess(message) {
    // Create a success notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
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

// Add CSS for line-clamp utility
const style = document.createElement('style');
style.textContent = `
    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
`;
document.head.appendChild(style);