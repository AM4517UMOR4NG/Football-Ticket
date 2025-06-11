function validateLoginForm() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  if (!email || !password) {
    alert('Email dan password harus diisi!');
    return false;
  }
  return true;
}

function validateTicketForm() {
  const quantity = document.getElementById('quantity').value;
  if (quantity <= 0) {
    alert('Jumlah tiket harus lebih dari 0!');
    return false;
  }
  return true;
}

document.querySelector('.login-form').addEventListener('submit', (e) => {
  if (!validateLoginForm()) e.preventDefault();
});

document.querySelector('.ticket-form').addEventListener('submit', (e) => {
  if (!validateTicketForm()) e.preventDefault();
});