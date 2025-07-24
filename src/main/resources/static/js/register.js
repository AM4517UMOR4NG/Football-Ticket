// Toggle password visibility
const passwordInput = document.getElementById('password');
let togglePasswordBtn = document.getElementById('togglePassword');
if (!togglePasswordBtn && passwordInput) {
  // Add toggle button if missing
  togglePasswordBtn = document.createElement('button');
  togglePasswordBtn.type = 'button';
  togglePasswordBtn.id = 'togglePassword';
  togglePasswordBtn.textContent = 'Show';
  togglePasswordBtn.className = 'absolute right-4 top-3 text-blue-200 hover:text-white';
  passwordInput.parentElement.appendChild(togglePasswordBtn);
}
if (togglePasswordBtn && passwordInput) {
  togglePasswordBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      togglePasswordBtn.textContent = 'Hide';
    } else {
      passwordInput.type = 'password';
      togglePasswordBtn.textContent = 'Show';
    }
  });
}

// Register form submit
const registerForm = document.getElementById('registerForm');
let registerBtn = document.getElementById('createAccountBtn');
if (!registerBtn) {
  // Add id to submit button if missing
  const btn = registerForm.querySelector('button[type="submit"]');
  if (btn) {
    btn.id = 'createAccountBtn';
    registerBtn = btn;
  }
}
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    registerBtn.disabled = true;
    registerBtn.textContent = 'Creating...';
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const fullName = document.getElementById('fullName').value.trim();
    const phone = document.getElementById('phoneNumber').value.trim();
    const password = document.getElementById('password').value;
    let terms = document.getElementById('terms');
    if (!terms) {
      // Add terms checkbox if missing
      terms = document.createElement('input');
      terms.type = 'checkbox';
      terms.id = 'terms';
      terms.checked = true; // default checked for now
      terms.style.display = 'none';
      registerForm.appendChild(terms);
    }
    if (!terms.checked) {
      alert('You must agree to the Terms & Conditions.');
      registerBtn.disabled = false;
      registerBtn.textContent = 'Create Account';
      return;
    }
    try {
      const res = await axios.post('/api/auth/register', {
        username, email, fullName, phoneNumber: phone, password
      });
      alert('Registration successful! Please login.');
      window.location.href = 'login.html';
    } catch (err) {
      alert(err?.response?.data?.message || 'Registration failed!');
    } finally {
      registerBtn.disabled = false;
      registerBtn.textContent = 'Create Account';
    }
  });
} 