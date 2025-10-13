document.addEventListener('DOMContentLoaded', function() {
    // Prefer the token set by login flow; fallback to any legacy key
    const token = localStorage.getItem('accessToken') || localStorage.getItem('jwtToken');

    if (!token) {
        console.error('No access token found. Please log in.');
        const salesEmpty = document.getElementById('sales-empty');
        if (salesEmpty) salesEmpty.textContent = 'Tidak ada token. Silakan login.';
        // Optionally redirect user to login page
        // window.location.href = '/login.html';
        return;
    }

    fetch('/api/cashier/dashboard/bookings', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (response.status === 401 || response.status === 403) {
            throw new Error('Unauthorized. Your session may have expired or you lack CASHIER access.');
        }
        if (!response.ok) {
            throw new Error('Failed to fetch bookings. Status: ' + response.status);
        }
        return response.json();
    })
    .then(bookings => {
        // Populate metrics and modern list
        renderMetrics(bookings || []);
        renderSalesList(bookings || []);
    })
    .catch(error => {
        console.error('Error fetching bookings:', error);
        const salesEmpty = document.getElementById('sales-empty');
        if (salesEmpty) salesEmpty.textContent = error.message;
    });
});

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
    const list = document.getElementById('sales-list');
    const empty = document.getElementById('sales-empty');
    if (!list) return;

    list.innerHTML = '';

    if (!Array.isArray(bookings) || bookings.length === 0) {
        if (empty) empty.textContent = 'Belum ada penjualan.';
        return;
    }

    bookings.forEach(b => {
        const row = document.createElement('div');
        row.className = 'p-6 hover:bg-gray-50 flex items-center justify-between';
        const dateStr = b.bookingDate ? formatDateTime(b.bookingDate) : '-';
        const statusBadge = getStatusBadge(b.status);
        row.innerHTML = `
            <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">🎫</div>
                <div>
                    <p class="font-semibold text-gray-900">${escapeHtml(b.eventTitle || 'Event')}</p>
                    <p class="text-sm text-gray-500">Ref ${escapeHtml(b.bookingReference || '-') } • ${dateStr}</p>
                    <span class="inline-flex mt-2">${statusBadge}</span>
                </div>
            </div>
            <div class="text-right">
                <p class="text-green-600 font-bold">${formatCurrency(b.totalAmount || 0)}</p>
                <p class="text-sm text-gray-500">${b.numberOfTickets || 0} tiket</p>
            </div>
        `;
        list.appendChild(row);
    });
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