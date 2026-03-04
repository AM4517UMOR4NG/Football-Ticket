document.addEventListener('DOMContentLoaded', () => {
    // Update year
    const yearEl = document.getElementById('current-year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // Scroll progress indicator (optional/cool)
    console.log('Privacy Policy loaded');
});
