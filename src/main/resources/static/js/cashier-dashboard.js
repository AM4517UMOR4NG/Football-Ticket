document.addEventListener('DOMContentLoaded', function() {
    console.log('Cashier Dashboard loaded');

    // Gatekeeping: only CASHIER role can view this page
    const role = (localStorage.getItem('userRole') || '').toUpperCase();
    if (role !== 'CASHIER') {
        // Block UI and redirect away
        const blocker = document.createElement('div');
        blocker.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.6);z-index:9999;';
        blocker.innerHTML = `
            <div style="background:#fff;border-radius:16px;padding:24px 28px;max-width:420px;width:90%;box-shadow:0 12px 30px rgba(0,0,0,.2);text-align:center;">
                <div style="display:flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;background:#fee2e2;color:#dc2626;margin:0 auto 12px;">⚠️</div>
                <h3 style="margin:0 0 6px;font-size:18px;font-weight:700;color:#111827;">Akses Ditolak</h3>
                <p style="margin:0;color:#6b7280;font-size:14px;">Halaman ini khusus kasir. Anda akan diarahkan ke beranda...</p>
            </div>
        `;
        document.body.appendChild(blocker);
        setTimeout(() => { window.location.href = 'index.html'; }, 1500);
        return; // prevent further initialization
    }

    // Load initial data
    loadBookings();

    // Add event listeners for search functionality
    document.getElementById('search-btn').addEventListener('click', handleSearch);
    document.getElementById('refresh-btn').addEventListener('click', loadBookings);
    document.getElementById('search-reference').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') handleSearch();
    });
    document.getElementById('status-filter').addEventListener('change', handleSearch);
});

function loadBookings() {
    console.log('Loading real bookings from database...');
    
    const token = localStorage.getItem('accessToken') || localStorage.getItem('jwtToken');
    fetch('/api/cashier/dashboard/bookings', {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
    })
    .then(response => {
        console.log('Response status:', response.status);
        
        if (response.status === 401 || response.status === 403) {
            showToast('Unauthorized. Please login as cashier.', true);
            throw new Error('Unauthorized. Please login as cashier first.');
        }
        if (!response.ok) {
            throw new Error('Failed to fetch bookings. Status: ' + response.status);
        }
        return response.json();
    })
    .then(bookings => {
        console.log('Real bookings received:', bookings);
        
        // Store all bookings for filtering
        window.allBookings = bookings || [];
        
        // Populate metrics and modern list
        renderMetrics(window.allBookings);
        renderSalesList(window.allBookings);
        setText('total-count', `${(window.allBookings || []).length} tiket`);
    })
    .catch(error => {
        console.error('Error fetching real bookings:', error);
        const salesEmpty = document.getElementById('sales-empty');
        if (salesEmpty) salesEmpty.textContent = `Error: ${error.message}`;
        setText('total-count', '0 tiket');
        showToast(error.message || 'Failed to load data', true);
    });
}

function handleSearch() {
    const searchRef = document.getElementById('search-reference').value.trim();
    const statusFilter = document.getElementById('status-filter').value;
    const token = localStorage.getItem('accessToken') || localStorage.getItem('jwtToken');

    if (searchRef) {
        // Search by booking reference in mock data
        const filteredBookings = (window.allBookings || []).filter(booking => 
            booking.bookingReference.toLowerCase().includes(searchRef.toLowerCase())
        );
        renderSalesList(filteredBookings);
        setText('total-count', `${filteredBookings.length} tiket`);
    } else if (statusFilter) {
        // Filter by status in mock data
        const filteredBookings = (window.allBookings || []).filter(booking => 
            booking.status === statusFilter
        );
        renderSalesList(filteredBookings);
        setText('total-count', `${filteredBookings.length} tiket`);
    } else {
        // Show all bookings
        renderSalesList(window.allBookings || []);
        setText('total-count', `${(window.allBookings || []).length} tiket`);
    }
}

function renderMetrics(bookings) {
    const today = new Date();
    const isSameDay = (d1, d2) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

    let salesToday = 0;
    let ticketsSold = 0;
    let transactions = bookings.length;
    let activeMatches = new Set();

    bookings.forEach(b => {
        const date = b.bookingDate ? new Date(b.bookingDate) : null;
        if (date && isSameDay(today, date)) {
            salesToday += Number(b.totalAmount || 0);
        }
        ticketsSold += Number(b.numberOfTickets || 0);
        if (b.status === 'CONFIRMED' || b.status === 'PENDING') {
            activeMatches.add(b.eventTitle || 'Match');
        }
    });

    const avgAmount = transactions ? salesToday / transactions : 0;

    setText('sales-today', formatCurrency(salesToday));
    setText('sales-compare', '+0% dari kemarin'); // placeholder
    setText('tickets-sold', ticketsSold.toString());
    setText('tickets-left', '');
    setText('transactions-count', transactions.toString());
    setText('avg-amount', `Rata-rata ${formatCurrency(avgAmount)}`);
    setText('active-matches', activeMatches.size.toString());
    setText('upcoming-matches', `${Math.max(0, activeMatches.size - 0)} aktif`);
}

function renderSalesList(bookings) {
    console.log('Rendering sales list with bookings:', bookings);
    
    const list = document.getElementById('sales-list');
    const empty = document.getElementById('sales-empty');
    
    if (!list) {
        console.error('sales-list element not found');
        return;
    }

    list.innerHTML = '';

    if (!Array.isArray(bookings) || bookings.length === 0) {
        console.log('No bookings to display');
        if (empty) empty.textContent = 'Belum ada penjualan.';
        return;
    }

    console.log(`Rendering ${bookings.length} bookings`);

    bookings.forEach(b => {
        const row = document.createElement('div');
        row.className = 'p-6 hover:bg-gray-50 border-l-4 border-blue-200 hover:border-blue-400 transition-all duration-200';
        const dateStr = b.bookingDate ? formatDateTime(b.bookingDate) : '-';
        const statusBadge = getStatusBadge(b.status);
        const pricePerTicket = b.numberOfTickets > 0 ? (b.totalAmount / b.numberOfTickets) : 0;
        
        row.innerHTML = `
            <div class="flex items-start justify-between">
                <div class="flex items-start gap-4 flex-1">
                    <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 flex items-center justify-center text-lg">
                        🎫
                    </div>
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                            <h3 class="font-semibold text-gray-900 text-lg">${escapeHtml(b.eventTitle || 'Event')}</h3>
                            <span class="inline-flex">${statusBadge}</span>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                                <p><span class="font-medium">Booking Ref:</span> ${escapeHtml(b.bookingReference || '-')}</p>
                                <p><span class="font-medium">Tanggal:</span> ${dateStr}</p>
                            </div>
                            <div>
                                <p><span class="font-medium">Jumlah Tiket:</span> ${b.numberOfTickets || 0} tiket</p>
                                <p><span class="font-medium">Harga per Tiket:</span> ${formatCurrency(pricePerTicket)}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="text-right ml-4">
                    <div class="bg-green-50 rounded-lg p-3 border border-green-200">
                        <p class="text-green-700 font-bold text-xl">${formatCurrency(b.totalAmount || 0)}</p>
                        <p class="text-green-600 text-sm">Total Pembayaran</p>
                    </div>
                    <div class="mt-2">
                        <button onclick="viewTicketDetails('${b.bookingReference}')" 
                                class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            Lihat Detail →
                        </button>
                    </div>
                </div>
            </div>
        `;
        list.appendChild(row);
    });
    
    console.log('Sales list rendered successfully');
}

// Simple toast used for notifications
function showToast(message, isError = false) {
    const el = document.createElement('div');
    el.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 10000;
        background: ${isError ? '#dc2626' : '#2563eb'}; color: #fff; padding: 12px 16px;
        border-radius: 10px; box-shadow: 0 8px 20px rgba(0,0,0,.15); font-weight:600;`;
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function formatCurrency(val) {
    const num = Number(val || 0);
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
}

function formatDateTime(dt) {
    try { return new Date(dt).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' }); } catch { return '-'; }
}

function getStatusBadge(status) {
    const s = (status || '').toUpperCase();
    const map = {
        CONFIRMED: 'bg-green-100 text-green-700',
        PENDING: 'bg-yellow-100 text-yellow-700',
        CANCELLED: 'bg-red-100 text-red-700',
        COMPLETED: 'bg-blue-100 text-blue-700'
    };
    const cls = map[s] || 'bg-gray-100 text-gray-700';
    return `<span class="px-2 py-0.5 text-xs rounded-full ${cls}">${s || 'UNKNOWN'}</span>`;
}

function escapeHtml(str) {
    return String(str).replace(/[&<>"]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));
}

function viewTicketDetails(bookingReference) {
    // Find booking in mock data
    const booking = (window.allBookings || []).find(b => b.bookingReference === bookingReference);
    
    if (booking) {
        showTicketModal(booking);
    } else {
        alert('Tiket tidak ditemukan.');
    }
}

function showTicketModal(booking) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-900">Detail Tiket</h2>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            
            <div class="space-y-6">
                <div class="bg-blue-50 rounded-lg p-4">
                    <h3 class="font-semibold text-blue-900 mb-2">Informasi Event</h3>
                    <p class="text-blue-800 text-lg">${escapeHtml(booking.eventTitle || 'Event')}</p>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-gray-50 rounded-lg p-4">
                        <h4 class="font-semibold text-gray-900 mb-2">Booking Information</h4>
                        <p><span class="font-medium">Reference:</span> ${escapeHtml(booking.bookingReference || '-')}</p>
                        <p><span class="font-medium">Status:</span> ${getStatusBadge(booking.status)}</p>
                        <p><span class="font-medium">Tanggal Booking:</span> ${booking.bookingDate ? formatDateTime(booking.bookingDate) : '-'}</p>
                    </div>
                    
                    <div class="bg-gray-50 rounded-lg p-4">
                        <h4 class="font-semibold text-gray-900 mb-2">Detail Tiket</h4>
                        <p><span class="font-medium">Jumlah Tiket:</span> ${booking.numberOfTickets || 0}</p>
                        <p><span class="font-medium">Harga per Tiket:</span> ${formatCurrency(booking.numberOfTickets > 0 ? (booking.totalAmount / booking.numberOfTickets) : 0)}</p>
                        <p><span class="font-medium">Total:</span> ${formatCurrency(booking.totalAmount || 0)}</p>
                    </div>
                </div>
                
                <div class="bg-green-50 rounded-lg p-4 border border-green-200">
                    <h4 class="font-semibold text-green-900 mb-2">Status Pembayaran</h4>
                    <div class="flex items-center gap-2">
                        ${getStatusBadge(booking.status)}
                        <span class="text-green-700 font-medium">${getStatusText(booking.status)}</span>
                    </div>
                </div>
            </div>
            
            <div class="mt-6 flex justify-end gap-3">
                <button onclick="this.closest('.fixed').remove()" 
                        class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
                    Tutup
                </button>
                <button onclick="printTicket('${booking.bookingReference}')" 
                        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Cetak Tiket
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function getStatusText(status) {
    const statusMap = {
        'CONFIRMED': 'Tiket Terkonfirmasi',
        'PENDING': 'Menunggu Konfirmasi',
        'CANCELLED': 'Dibatalkan',
        'COMPLETED': 'Selesai'
    };
    return statusMap[status] || 'Status Tidak Diketahui';
}

function printTicket(bookingReference) {
    // Simple print functionality - in a real app, this would generate a proper ticket
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Tiket - ${bookingReference}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .ticket { border: 2px solid #000; padding: 20px; max-width: 400px; }
                .header { text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 20px; }
                .info { margin: 10px 0; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="ticket">
                <div class="header">🎫 TIKET FOOTBALL</div>
                <div class="info"><strong>Booking Reference:</strong> ${bookingReference}</div>
                <div class="info"><strong>Tanggal Cetak:</strong> ${new Date().toLocaleString('id-ID')}</div>
                <div class="footer">Terima kasih telah menggunakan FootballTix!</div>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}