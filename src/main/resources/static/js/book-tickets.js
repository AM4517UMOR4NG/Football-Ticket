// FootballTix - Full JS (Booking + Admin panel right-slide + Refund Policy narration)
const API_BASE_URL = '/api';

// DOM Elements (Booking page)
const eventsGrid = document.getElementById('events-grid');
const loadingState = document.getElementById('loading-state');
const errorState = document.getElementById('error-state');
const bookingSummary = document.getElementById('booking-summary');
const noSelection = document.getElementById('no-selection');

// Booking summary elements
const selectedEventTitle = document.getElementById('selected-event-title');
const selectedEventVenue = document.getElementById('selected-event-venue');
const selectedEventDate = document.getElementById('selected-event-date');
const ticketCount = document.getElementById('ticket-count');
const pricePerTicket = document.getElementById('price-per-ticket');
const totalPrice = document.getElementById('total-price');
const decreaseTickets = document.getElementById('decrease-tickets');
const increaseTickets = document.getElementById('increase-tickets');
const confirmBooking = document.getElementById('confirm-booking');

// Admin slide panel (should exist on admin dashboard)
const adminPanel = document.getElementById('admin-slide-panel');

// Global variables
let allEvents = [];
let selectedEvent = null;
let currentTicketCount = 1;

// Initialize the page
document.addEventListener('DOMContentLoaded', function () {
    initializeBookingPage();
});

async function initializeBookingPage() {
    try {
        // If page requires login, check token
        const token = localStorage.getItem('accessToken');
        // For booking page we redirect if not logged in. If it's admin page, adminInit will handle separately.
        if (!token && location.pathname.includes('booking')) {
            window.location.href = 'login.html';
            return;
        }

        // Update navigation (header)
        updateNavigation();

        // Load events (used both by booking and admin)
        await loadEvents();

        // Setup page listeners (ticket controls, confirm)
        setupEventListeners();

        // If admin panel exists, setup admin-specific handlers
        if (adminPanel) adminInit();

    } catch (error) {
        console.error('Error initializing booking page:', error);
        showError('Failed to initialize page. Please try again.');
    }
}

/* --------------------- Navigation & Auth --------------------- */
function updateNavigation() {
    const token = localStorage.getItem('accessToken');
    const userRole = localStorage.getItem('userRole');
    const username = localStorage.getItem('username');

    const signInBtn = document.querySelector('a[href="login.html"]');

    if (token && username) {
        if (signInBtn) {
            signInBtn.parentElement.remove();
        }

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
                <div id="user-dropdown" class="hidden absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    ${userRole === 'ADMIN' ? '<a href="admin-dashboard.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Admin Dashboard</a>' : ''}
                    <a href="profile.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
                    <a href="#" id="logout-link" class="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Logout</a>
                </div>
            </div>
        `;

        const signInContainer = document.querySelector('.flex.items-center');
        if (signInContainer) {
            signInContainer.innerHTML = '';
            signInContainer.appendChild(userMenu);
        }

        const userMenuBtn = document.getElementById('user-menu-btn');
        const userDropdown = document.getElementById('user-dropdown');

        if (userMenuBtn && userDropdown) {
            userMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle('hidden');
            });

            document.addEventListener('click', (e) => {
                if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                    userDropdown.classList.add('hidden');
                }
            });
        }

        const logoutLink = document.getElementById('logout-link');
        if (logoutLink) logoutLink.addEventListener('click', handleLogout);
    }
}

function handleLogout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    window.location.href = 'index.html';
}

/* --------------------- Load & Render Events --------------------- */
async function loadEvents() {
    try {
        showLoading();

        const response = await fetch(`${API_BASE_URL}/events`);
        if (!response.ok) throw new Error('Failed to fetch events');

        const events = await response.json();
        allEvents = events || [];

        displayEvents(allEvents);
        hideLoading();

    } catch (error) {
        console.error('Error loading events:', error);
        showError('Failed to load events. Please try again.');
        hideLoading();
    }
}

function displayEvents(events) {
    if (!eventsGrid) return;

    if (!events || events.length === 0) {
        eventsGrid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="text-gray-500 text-xl mb-4">No events available</div>
                <p class="text-gray-400">Check back later for new matches</p>
            </div>
        `;
        eventsGrid.classList.remove('hidden');
        return;
    }

    // Render cards using data attributes (no inline onclick)
    eventsGrid.innerHTML = events.map(event => {
        const selectedClass = selectedEvent && selectedEvent.id === event.id ? 'ring-2 ring-blue-500' : '';
        return `
    <div class="booking-card ${selectedClass} bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 cursor-pointer" data-event-id="${event.id}">
        <div class="relative">
            <!-- Event Image -->
            <div class="h-48 bg-gradient-to-r from-blue-600 to-blue-800 relative overflow-hidden">
                ${event.imageUrl ? `
                    <img src="${escapeAttr(event.imageUrl)}" alt="${escapeAttr(event.title)}"
                         class="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                ` : `
                    <div class="w-full h-full bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center">
                        <svg class="w-16 h-16 text-white/50" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path>
                        </svg>
                    </div>
                `}
               
                <!-- League Badge -->
                <div class="absolute top-4 left-4">
                    <div class="league-badge px-3 py-1 rounded-full text-xs font-medium text-white bg-white/20 backdrop-blur-sm">
                        ${escapeHtml(getLeagueShortName(event))}
                    </div>
                </div>
               
                <!-- Date Badge -->
                <div class="absolute top-4 right-4">
                    <div class="bg-black/50 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                        ${escapeHtml(formatEventDate(event.eventDate))}
                    </div>
                </div>
               
                <!-- Team Icons -->
                <div class="absolute bottom-4 left-4 flex space-x-2">
                    <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path>
                        </svg>
                    </div>
                    <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
       
        <div class="p-6">
            <h3 class="text-xl font-bold text-gray-900 mb-3">${escapeHtml(event.title)}</h3>
            <p class="text-gray-600 text-sm mb-4 line-clamp-2">${escapeHtml(event.description || '')}</p>
           
            <div class="space-y-2 mb-4">
                <div class="flex items-center text-gray-500 text-sm">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    ${escapeHtml(event.venue)}
                </div>
                <div class="flex items-center text-gray-500 text-sm">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    ${escapeHtml(formatEventTime(event.eventDate))}
                </div>
                <div class="flex items-center text-gray-500 text-sm">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    ${Number(event.totalSeats || 0).toLocaleString()} seats available
                </div>
            </div>
           
            <div class="flex items-center justify-between">
                <div class="text-2xl font-bold text-green-600">£${Number(event.price).toFixed(2)}</div>
                <div class="text-sm text-gray-500">per ticket</div>
            </div>
            <div class="flex space-x-3 mt-4">
                <button class="book-now-btn flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                        data-event-id="${event.id}" data-event-title="${escapeAttr(event.title)}">
                    Book Now
            </div>
            ${selectedEvent && selectedEvent.id === event.id ? `
                <div class="mt-4 text-center">
                    <div class="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                        </svg>
                        Selected
                    </div>
                </div>
            ` : ''}
        </div>
    </div>
    `;
    }).join('');

    eventsGrid.classList.remove('hidden');

    // After rendering, bind buttons
    bindEventButtons();
    // Add hover & click selection on card container for nicer UX
    bindCardClicks();
}

/* Bind dynamic buttons (Book Now, Admin Details, Select) */
function bindEventButtons() {
    // Book Now buttons
    const bookBtns = document.querySelectorAll('.book-now-btn');
    bookBtns.forEach(btn => {
        btn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            const id = parseInt(btn.dataset.eventId, 10);
            handleBuyTickets(id, btn.dataset.eventTitle);
        });
    });

    // Admin Detail buttons
    const adminBtns = document.querySelectorAll('.admin-open-btn');
    adminBtns.forEach(btn => {
        btn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            const id = parseInt(btn.dataset.eventId, 10);
            openAdminPanel(id);
        });
    });

    // Make admin buttons visible if current user is admin
    const role = localStorage.getItem('userRole');
    if (role === 'ADMIN') {
        document.querySelectorAll('.admin-open-btn').forEach(b => b.classList.remove('hidden'));
    }
}

/* Clicking the whole card selects the event */
function bindCardClicks() {
    const cards = document.querySelectorAll('.booking-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const id = parseInt(card.dataset.eventId, 10);
            selectEvent(id);
            // scroll booking summary into view (if present)
            if (bookingSummary) bookingSummary.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    });
}

/* --------------------- Selection & Booking Summary --------------------- */
function selectEvent(eventId) {
    const event = allEvents.find(e => e.id === eventId);
    if (!event) return;

    selectedEvent = event;
    currentTicketCount = 1;

    updateEventSelection();
    updateBookingSummary();
    // Re-render selection highlight without re-fetching
    // (we could re-render, but updateEventSelection manipulates DOM)
}

function updateEventSelection() {
    const cards = document.querySelectorAll('.booking-card');
    cards.forEach(card => {
        card.classList.remove('ring-2', 'ring-blue-500');
        if (card.dataset.eventId && parseInt(card.dataset.eventId, 10) === selectedEvent?.id) {
            card.classList.add('ring-2', 'ring-blue-500');
        }
    });
}

function updateBookingSummary() {
    if (!bookingSummary || !noSelection) return;

    if (!selectedEvent) {
        bookingSummary.classList.add('hidden');
        noSelection.classList.remove('hidden');
        return;
    }

    bookingSummary.classList.remove('hidden');
    noSelection.classList.add('hidden');

    selectedEventTitle.textContent = selectedEvent.title;
    selectedEventVenue.textContent = selectedEvent.venue;
    selectedEventDate.textContent = formatEventDate(selectedEvent.eventDate);
    pricePerTicket.textContent = `£${Number(selectedEvent.price).toFixed(2)}`;

    updateTicketCount();
}

function updateTicketCount() {
    if (!selectedEvent) return;
    ticketCount.textContent = currentTicketCount;
    const total = parseFloat(selectedEvent.price) * currentTicketCount;
    totalPrice.textContent = `£${total.toFixed(2)}`;
}

/* --------------------- Ticket controls & Confirm --------------------- */
function setupEventListeners() {
    if (decreaseTickets) {
        decreaseTickets.addEventListener('click', () => {
            if (currentTicketCount > 1) {
                currentTicketCount--;
                updateTicketCount();
            }
        });
    }

    if (increaseTickets) {
        increaseTickets.addEventListener('click', () => {
            if (currentTicketCount < 10) {
                currentTicketCount++;
                updateTicketCount();
            }
        });
    }

    if (confirmBooking) {
        confirmBooking.addEventListener('click', handleConfirmBooking);
    }
}

/* Unified buy handler (works when called by id/title or by event target) */
function handleBuyTickets(eventOrId, title) {
    let eventId, eventTitle;

    if (typeof eventOrId === 'object' && eventOrId.target) {
        const button = eventOrId.target.closest('button');
        eventId = parseInt(button.dataset.eventId, 10);
        eventTitle = button.dataset.eventTitle;
    } else {
        eventId = parseInt(eventOrId, 10);
        eventTitle = title || '';
    }

    // If not logged in, store pending action & redirect
    const token = localStorage.getItem('accessToken');
    if (!token) {
        showToast && showToast('Please sign in to purchase tickets', 'warning');
        localStorage.setItem('pendingAction', JSON.stringify({
            type: 'buyTickets',
            eventId,
            eventTitle
        }));
        window.location.href = 'login.html';
        return;
    }

    // Select event locally and reveal booking summary
    selectEvent(eventId);
    if (bookingSummary) bookingSummary.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* --------------------- Confirm Booking -> API -> Refund Policy --------------------- */
async function handleConfirmBooking() {
    if (!selectedEvent) {
        alert('Please select an event first.');
        return;
    }

    try {
        const token = localStorage.getItem('accessToken');
        const userId = localStorage.getItem('userId');

        if (!token || !userId) {
            window.location.href = 'login.html';
            return;
        }

        // Show loading state on confirm button
        confirmBooking.disabled = true;
        const originalText = confirmBooking.textContent;
        confirmBooking.textContent = 'Processing...';

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
            const errText = await response.text().catch(() => '');
            throw new Error('Failed to create booking: ' + errText);
        }

        const booking = await response.json();

        showSuccess('Booking created successfully!');

        // Immediately show refund policy + read it aloud
        setTimeout(() => {
            showRefundPolicyAndSpeak(selectedEvent, booking);
        }, 700);

    } catch (error) {
        console.error('Error creating booking:', error);
        showError('Failed to create booking. Please try again.');

        confirmBooking.disabled = false;
        confirmBooking.textContent = 'Confirm Booking';
    }
}

/* Refund policy modal + Speech Synthesis reading */
function showRefundPolicyAndSpeak(eventObj, bookingObj) {
    const policyText = generateRefundPolicyText(eventObj, bookingObj);

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white p-6 rounded-xl max-w-lg shadow-lg">
            <div class="flex justify-between items-start">
                <h2 class="text-xl font-bold mb-2">Refund Policy</h2>
                <button id="close-refund-modal" class="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div class="text-gray-700 mb-4">
                <p>${escapeHtml(policyText).replace(/\n/g, '<br>')}</p>
            </div>
            <div class="flex justify-end space-x-3">
                <button id="refund-dismiss" class="px-4 py-2 rounded bg-gray-200">Close</button>
                <button id="refund-contact" class="px-4 py-2 rounded bg-blue-600 text-white">Contact Support</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const closeBtn = document.getElementById('close-refund-modal');
    const dismiss = document.getElementById('refund-dismiss');
    const contact = document.getElementById('refund-contact');

    function removeModal() {
        // stop speaking if still speaking
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
        modal.remove();
        // redirect to bookings page after close
        window.location.href = 'bookings.html';
    }

    closeBtn && closeBtn.addEventListener('click', removeModal);
    dismiss && dismiss.addEventListener('click', removeModal);
    contact && contact.addEventListener('click', () => {
        // example: open mail client or support page
        window.location.href = 'support.html';
    });

    // Speak the policy aloud (if browser supports)
    if ('speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance(policyText);
        utter.rate = 1.0;
        utter.pitch = 1.0;
        utter.lang = 'en-US';
        // Optionally choose a voice (fallback to default)
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length) {
            // pick a default English voice if available
            const prefer = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('en'));
            if (prefer) utter.voice = prefer;
        }
        window.speechSynthesis.speak(utter);
    }
}

function generateRefundPolicyText(eventObj, bookingObj) {
    // Customize policy text using event and booking
    const eventTitle = eventObj?.title || 'the event';
    const bookingId = bookingObj?.id || 'your booking';
    return `Thank you for your booking for ${eventTitle}. 
Refunds are available up to 48 hours before the event start time. 
To request a refund, please contact support with your booking ID ${bookingId}. 
Refunds after this time are subject to organizer discretion. 
Processing may take 5-10 business days to reflect in your account.`;
}

/* --------------------- Admin Right-Slide Panel --------------------- */
/* adminInit sets up admin panel behaviour (slide-from-right) */
function adminInit() {
    if (!adminPanel) return;

    // Add necessary classes/styles if not present
    adminPanel.classList.add('admin-slide-panel');
    // close button inside panel
    adminPanel.addEventListener('click', (e) => {
        // don't close when clicking inside content
        if (e.target === adminPanel) closeAdminPanel();
    });

    // Provide close control if #admin-close exists
    const closeBtn = adminPanel.querySelector('.admin-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeAdminPanel);

    // Show admin buttons if role is admin
    const role = localStorage.getItem('userRole');
    if (role === 'ADMIN') {
        document.querySelectorAll('.admin-open-btn').forEach(b => b.classList.remove('hidden'));
    }
}

/* Open the right-side admin panel and populate data from allEvents */
function openAdminPanel(eventId) {
    if (!adminPanel) return;
    const eventData = allEvents.find(e => e.id === eventId);
    // Fill content (assumes certain selectors exist inside adminPanel)
    if (eventData) {
        const titleEl = adminPanel.querySelector('.panel-title');
        const venueEl = adminPanel.querySelector('.panel-venue');
        const dateEl = adminPanel.querySelector('.panel-date');
        const priceEl = adminPanel.querySelector('.panel-price');
        const descEl = adminPanel.querySelector('.panel-desc');
        const seatsEl = adminPanel.querySelector('.panel-seats');

        if (titleEl) titleEl.textContent = eventData.title;
        if (venueEl) venueEl.textContent = eventData.venue;
        if (dateEl) dateEl.textContent = formatEventDate(eventData.eventDate) + ' • ' + formatEventTime(eventData.eventDate);
        if (priceEl) priceEl.textContent = `£${Number(eventData.price).toFixed(2)}`;
        if (descEl) descEl.textContent = eventData.description || '';
        if (seatsEl) seatsEl.textContent = `${Number(eventData.totalSeats || 0).toLocaleString()} seats`;

        // Add actions (edit/delete) if admin
        const actionsEl = adminPanel.querySelector('.panel-actions');
        if (actionsEl) {
            actionsEl.innerHTML = `
                <button class="px-3 py-2 mr-2 rounded bg-yellow-500 text-white panel-edit-btn">Edit</button>
                <button class="px-3 py-2 rounded bg-red-600 text-white panel-delete-btn">Delete</button>
            `;
            const editBtn = actionsEl.querySelector('.panel-edit-btn');
            const deleteBtn = actionsEl.querySelector('.panel-delete-btn');

            editBtn && editBtn.addEventListener('click', () => {
                // redirect to admin edit page with event id
                window.location.href = `admin-edit-event.html?eventId=${eventData.id}`;
            });

            deleteBtn && deleteBtn.addEventListener('click', async () => {
                if (!confirm('Delete this event? This action cannot be undone.')) return;
                try {
                    const token = localStorage.getItem('accessToken');
                    if (!token) return alert('Not authorized');
                    const res = await fetch(`${API_BASE_URL}/events/${eventData.id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (!res.ok) throw new Error('Failed to delete event');
                    showSuccess('Event deleted');
                    closeAdminPanel();
                    // remove from local data and re-render
                    allEvents = allEvents.filter(e => e.id !== eventData.id);
                    displayEvents(allEvents);
                } catch (err) {
                    console.error(err);
                    showError('Failed to delete event');
                }
            });
        }
    }

    // open panel (slide from right)
    adminPanel.classList.add('open');
}

function closeAdminPanel() {
    if (!adminPanel) return;
    adminPanel.classList.remove('open');
}

/* --------------------- Utilities & UI helpers --------------------- */
function showLoading() {
    if (loadingState) loadingState.classList.remove('hidden');
    if (eventsGrid) eventsGrid.classList.add('hidden');
    if (errorState) errorState.classList.add('hidden');
}

function hideLoading() {
    if (loadingState) loadingState.classList.add('hidden');
    if (eventsGrid) eventsGrid.classList.remove('hidden');
}

function showError(message) {
    if (errorState) {
        const textNode = errorState.querySelector('.text-red-600');
        if (textNode) textNode.textContent = message;
        errorState.classList.remove('hidden');
    }
    if (loadingState) loadingState.classList.add('hidden');
    if (eventsGrid) eventsGrid.classList.add('hidden');
}

function showSuccess(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

/* OPTIONAL toast fallback if showToast exists elsewhere */
function showToast(message, type = 'info') {
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
        return;
    }
    // fallback: small ephemeral box
    const t = document.createElement('div');
    t.className = `fixed bottom-6 right-6 px-4 py-2 rounded shadow z-50 ${type === 'warning' ? 'bg-yellow-500' : 'bg-gray-800 text-white'}`;
    t.textContent = message;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

/* Utilities used from events.js - keep these if not already defined elsewhere */
function getLeagueFromEvent(event) {
    const title = (event.title || '').toLowerCase();
    const venue = (event.venue || '').toLowerCase();

    if (title.includes('manchester') || title.includes('chelsea') || title.includes('arsenal') ||
        title.includes('liverpool') || title.includes('tottenham') || venue.includes('london') ||
        venue.includes('manchester')) {
        return 'Premier League';
    } else if (title.includes('madrid') || title.includes('barcelona') || title.includes('atletico')) {
        return 'La Liga';
    } else if (title.includes('bayern') || title.includes('dortmund') || title.includes('leipzig')) {
        return 'Bundesliga';
    } else if (title.includes('milan') || title.includes('juventus') || title.includes('napoli')) {
        return 'Serie A';
    } else if (title.includes('psg') || title.includes('marseille') || title.includes('lyon')) {
        return 'Ligue 1';
    } else if (title.includes('champions league')) {
        return 'Champions League';
    }

    return 'Football Match';
}

function getLeagueShortName(event) {
    const league = getLeagueFromEvent(event);
    const shortNames = {
        'Premier League': 'PL',
        'La Liga': 'LL',
        'Bundesliga': 'BL',
        'Serie A': 'SA',
        'Ligue 1': 'L1',
        'Champions League': 'CL'
    };
    return shortNames[league] || 'FB';
}

function formatEventDate(dateString) {
    const date = new Date(dateString);
    if (isNaN(date)) return '';
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${dayName}, ${day} ${month} ${year}`;
}

function formatEventTime(dateString) {
    const date = new Date(dateString);
    if (isNaN(date)) return '';
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

/* Small helpers to avoid XSS when injecting dynamic content */
function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}
function escapeAttr(str) {
    if (!str && str !== 0) return '';
    return String(str).replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

/* Inject some CSS for line-clamp and admin panel if not present */
(function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        .booking-card { transition: transform 0.18s ease, box-shadow 0.18s ease; }
        .booking-card:hover { transform: translateY(-6px); box-shadow: 0 12px 30px rgba(0,0,0,0.12); }
        /* Admin slide panel */
        .admin-slide-panel {
            position: fixed;
            top: 0;
            right: -100%;
            width: 420px;
            max-width: 92%;
            height: 100%;
            background: #fff;
            box-shadow: -6px 0 30px rgba(2,6,23,0.2);
            transition: right 0.36s cubic-bezier(.2,.9,.2,1);
            z-index: 60;
            display: flex;
            flex-direction: column;
        }
        .admin-slide-panel.open { right: 0; }
        .admin-slide-panel .panel-header { padding: 16px; border-bottom: 1px solid rgba(0,0,0,0.06); display:flex; justify-content:space-between; align-items:center; }
        .admin-slide-panel .panel-body { padding: 16px; overflow:auto; flex:1; }
        @keyframes slideUp { from { transform: translateY(10px); opacity:0 } to { transform: translateY(0); opacity:1 } }
        .animate-slideUp { animation: slideUp .28s ease both; }
    `;
    document.head.appendChild(style);
})();
