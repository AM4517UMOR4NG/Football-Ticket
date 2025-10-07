document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('jwtToken'); // Assuming the token is stored in localStorage

    if (!token) {
        console.error('No JWT token found. Please log in.');
        // Optionally, redirect to login page
        // window.location.href = '/login.html';
        return;
    }

    fetch('/api/cashier/dashboard/bookings', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch bookings. Status: ' + response.status);
        }
        return response.json();
    })
    .then(bookings => {
        const tableBody = document.querySelector('#bookings-table tbody');
        tableBody.innerHTML = ''; // Clear existing rows

        bookings.forEach(booking => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${booking.id}</td>
                <td>${booking.bookingReference}</td>
                <td>${booking.eventTitle}</td>
                <td>${booking.numberOfTickets}</td>
                <td>${booking.totalAmount}</td>
                <td>${booking.status}</td>
                <td>${new Date(booking.bookingDate).toLocaleString()}</td>
            `;

            tableBody.appendChild(row);
        });
    })
    .catch(error => {
        console.error('Error fetching bookings:', error);
        const tableBody = document.querySelector('#bookings-table tbody');
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:red;">${error.message}</td></tr>`;
    });
});