document.addEventListener('DOMContentLoaded', () => {
    // Update year
    const yearEl = document.getElementById('current-year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
});
