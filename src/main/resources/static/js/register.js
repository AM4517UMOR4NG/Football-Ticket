// register.js
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const fullName = document.getElementById('fullName').value;
    const phoneNumber = document.getElementById('phoneNumber').value;
    const password = document.getElementById('password').value;
    const alertDiv = document.getElementById('alert');

    if (!username || !email || !fullName || !phoneNumber || !password) {
        alertDiv.textContent = 'Please fill all fields.';
        alertDiv.className = 'alert error';
        alertDiv.style.display = 'block';
        return;
    }

    const registrationData = {
        username, email, fullName, phoneNumber, password, role: 'USER'
    };

    try {
        const response = await fetch('http://localhost:8080/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registrationData)
        });
        const data = await response.json();
        if (response.ok) {
            alertDiv.textContent = 'Registration successful! Redirecting to login...';
            alertDiv.className = 'alert success';
            alertDiv.style.display = 'block';
            setTimeout(() => window.location.href = 'login.html', 1500);
        } else {
            alertDiv.textContent = data.message || 'Registration failed. Try again.';
            alertDiv.className = 'alert error';
            alertDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Registration error:', error);
        alertDiv.textContent = 'Network error. Please try again.';
        alertDiv.className = 'alert error';
        alertDiv.style.display = 'block';
    }
}); 