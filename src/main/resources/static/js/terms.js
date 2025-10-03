// terms.js
// Terms & Conditions page script
// - progress bar
// - reading time
// - smooth scrolling
// - table of contents highlight
// - print, copy section, lazy-load images
// - hide "Sign In" buttons when user already logged in (checks localStorage token + expiry)

// ----------------- JWT helpers (light) -----------------
function b64UrlDecode(str) {
    if (!str) return null;
    str = String(str).replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) str += '=';
    try {
        return decodeURIComponent(atob(str).split('').map(c =>
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join(''));
    } catch (e) {
        return null;
    }
}

function decodeJwt(token) {
    if (!token) return null;
    token = token.replace(/^Bearer\s+/i, '');
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    try {
        return JSON.parse(b64UrlDecode(parts[1]));
    } catch (e) {
        return null;
    }
}

function isJwtExpired(token) {
    const payload = decodeJwt(token);
    if (!payload) return true;
    if (!payload.exp) return false; // jika backend tidak menyertakan exp, anggap tidak expired
    const now = Math.floor(Date.now() / 1000);
    return payload.exp <= now;
}

// ----------------- Hide Sign-In when logged in -----------------
function hideSignInIfLoggedIn() {
    const token = localStorage.getItem('accessToken');
    if (!token) return; // no token -> leave sign-in visible
    if (isJwtExpired(token)) return; // expired -> leave sign-in visible (or you can clear token)

    // selectors to try to find sign-in elements
    const selectors = [
        '#signInBtn',
        '.sign-in-btn',
        '.sign-in',
        'a[href*="login"]',
        'button[data-action="signin"]',
        '.btn-login',
        '.nav-login'
    ];

    let hiddenAny = false;
    selectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => {
            // don't hide if element contains 'logout' or 'profile' text accidentally
            try {
                el.style.display = 'none';
                hiddenAny = true;
            } catch (e) {
                // ignore
            }
        });
    });

    // Additionally hide anchor links whose href exactly equals login page (common)
    document.querySelectorAll('a').forEach(a => {
        const href = (a.getAttribute('href') || '').toLowerCase();
        if (href === 'login.html' || href.endsWith('/login') || href.endsWith('/signin')) {
            a.style.display = 'none';
            hiddenAny = true;
        }
    });

}

// ----------------- Notifications -----------------
function showNotification(message, type = 'info') {
    const existing = document.querySelector('.terms-notif');
    if (existing) existing.remove();

    const colors = {
        info: 'bg-blue-500',
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500'
    };
    const color = colors[type] || colors.info;

    const notification = document.createElement('div');
    notification.className = `terms-notif fixed top-4 right-4 p-3 rounded-lg shadow-lg z-50 text-white ${color} transform translate-x-full transition-transform duration-200`;
    notification.textContent = message;
    document.body.appendChild(notification);

    // animate in
    requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0)';
    });

    // auto remove
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 250);
    }, 3500);
}

// ----------------- Core features -----------------
function addProgressIndicator() {
    if (document.querySelector('.terms-progress')) return; // avoid duplicates
    const progressBar = document.createElement('div');
    progressBar.className = 'terms-progress fixed top-0 left-0 w-full h-1 bg-gray-200 z-50';
    progressBar.innerHTML = '<div class="h-full bg-blue-600 transition-all duration-150" style="width: 0%"></div>';
    document.body.appendChild(progressBar);

    const update = () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) - window.innerHeight;
        const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        const progressElement = progressBar.querySelector('div');
        if (progressElement) progressElement.style.width = Math.min(Math.max(scrollPercent, 0), 100) + '%';
    };

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
}

function addReadingTime() {
    const content = document.querySelector('.prose');
    if (!content) return;
    const text = content.textContent || '';
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    const readingTimeElement = document.createElement('div');
    readingTimeElement.className = 'text-sm text-gray-500 mb-4';
    readingTimeElement.innerHTML = `<i class="fas fa-clock mr-2"></i>Estimated reading time: ${readingTime} minute${readingTime !== 1 ? 's' : ''}`;
    const firstSection = document.querySelector('section') || content;
    firstSection.insertBefore(readingTimeElement, firstSection.firstChild);
}

function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return;
            e.preventDefault();
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                const headerOffset = 80;
                const rect = targetElement.getBoundingClientRect();
                const targetPosition = window.pageYOffset + rect.top - headerOffset;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                history.pushState(null, '', href);
            }
        });
    });
}

function initializeTableOfContents() {
    // links container with .bg-gray-50 from your markup
    const tocLinks = document.querySelectorAll('.bg-gray-50 a');
    tocLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            tocLinks.forEach(l => l.classList.remove('text-blue-600', 'font-semibold'));
            this.classList.add('text-blue-600', 'font-semibold');
        });
    });
}

function initializeSectionHighlighting() {
    const sections = document.querySelectorAll('section[id]');
    const tocLinks = document.querySelectorAll('.bg-gray-50 a');
    if (!sections.length || !tocLinks.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                tocLinks.forEach(link => {
                    link.classList.remove('text-blue-600', 'font-semibold');
                    const href = link.getAttribute('href') || '';
                    if (href === `#${id}`) link.classList.add('text-blue-600', 'font-semibold');
                });
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '-80px 0px -50% 0px'
    });

    sections.forEach(s => observer.observe(s));
}

function initializePrint() {
    if (document.getElementById('terms-print-btn')) return; // avoid duplicates
    const printButton = document.createElement('button');
    printButton.id = 'terms-print-btn';
    printButton.className = 'fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40';
    printButton.innerHTML = '<i class="fas fa-print"></i>';
    printButton.title = 'Print Terms & Conditions';
    printButton.addEventListener('click', () => window.print());
    document.body.appendChild(printButton);
}

function copySection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    const text = section.textContent || section.innerText || '';
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Section copied to clipboard!', 'success');
    }).catch(() => {
        showNotification('Failed to copy section', 'error');
    });
}

function trackReadingProgress() {
    const sections = document.querySelectorAll('section[id]');
    if (!sections.length) return;
    const total = sections.length;
    const read = new Set();
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                read.add(entry.target.id);
                const progress = (read.size / total) * 100;
                if (progress >= 25 && !window.tracked25) { trackEvent('terms_25_percent_read'); window.tracked25 = true; }
                if (progress >= 50 && !window.tracked50) { trackEvent('terms_50_percent_read'); window.tracked50 = true; }
                if (progress >= 75 && !window.tracked75) { trackEvent('terms_75_percent_read'); window.tracked75 = true; }
                if (progress >= 100 && !window.tracked100) { trackEvent('terms_100_percent_read'); window.tracked100 = true; }
            }
        });
    }, { threshold: 0.5 });

    sections.forEach(s => observer.observe(s));
}

function trackEvent(name, data = {}) {
    console.log('Event tracked:', name, data);
    if (typeof gtag !== 'undefined') gtag('event', name, data);
    if (window.analytics) window.analytics.track(name, data);
}

function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    if (!images.length) return;
    const io = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    }, { rootMargin: '200px 0px' });
    images.forEach(img => io.observe(img));
}

// add copy buttons to each section heading
function addSectionCopyButtons() {
    document.querySelectorAll('section').forEach(section => {
        const heading = section.querySelector('h1, h2, h3');
        if (!heading) return;
        // avoid adding duplicate button
        if (heading.querySelector('.section-copy-btn')) return;
        const btn = document.createElement('button');
        btn.className = 'section-copy-btn ml-2 text-gray-400 hover:text-blue-600 transition-colors';
        btn.innerHTML = '<i class="fas fa-copy text-sm"></i>';
        btn.title = 'Copy section';
        btn.addEventListener('click', () => {
            if (!section.id) {
                // if no id, temporarily copy content
                copySection(section.id || '');
            } else {
                copySection(section.id);
            }
        });
        heading.appendChild(btn);
    });
}

// ----------------- Initialize everything after DOM ready -----------------
document.addEventListener('DOMContentLoaded', function () {
    // Primary initialization
    addProgressIndicator();
    addReadingTime();
    initializeSmoothScrolling();
    initializeTableOfContents();
    initializeSectionHighlighting();
    initializePrint();

    // Hide sign-in buttons if logged in
    hideSignInIfLoggedIn();

    // UI extras
    addSectionCopyButtons();
    lazyLoadImages();
    trackReadingProgress();

    // Keyboard shortcuts
    document.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
            e.preventDefault();
            window.print();
        }
    });
});
