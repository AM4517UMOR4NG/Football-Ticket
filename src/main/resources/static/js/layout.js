/**
 * FootballTix Shared Layout Shell (Unified Navbar, Role Menu, Dark Mode & Footer)
 */
(function () {
    'use strict';

    const STORAGE_KEYS = ['accessToken', 'userId', 'username', 'userRole', 'userData', 'loginTime', 'sessionExpiry', 'refreshToken', 'jwtToken'];

    function escapeHtml(str) {
        return String(str ?? '').replace(/[&<>"']/g, s => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[s]));
    }

    function getCurrentPage() {
        const path = window.location.pathname || '/';
        const file = path.split('/').pop();
        if (!file || file === 'landing.html') return 'index.html';
        return file.toLowerCase();
    }

    function getAuthState() {
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        const username = localStorage.getItem('username') || sessionStorage.getItem('username') || '';
        const role = (localStorage.getItem('userRole') || sessionStorage.getItem('userRole') || '').toUpperCase();
        return { isLoggedIn: Boolean(token && username), token, username, role };
    }

    function applyTheme(mode, persist) {
        const html = document.documentElement;
        const isDark = mode === 'dark';
        html.classList.toggle('dark', isDark);
        if (persist) {
            try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch (_) {}
        }
        const btn = document.getElementById('ft-theme-toggle');
        if (btn) {
            btn.innerHTML = isDark
                ? '<i class="fas fa-sun" aria-hidden="true"></i>'
                : '<i class="fas fa-moon" aria-hidden="true"></i>';
            btn.title = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
        }
    }

    function initThemeEarly() {
        let saved = null;
        try { saved = localStorage.getItem('theme'); } catch (_) {}
        if (saved === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }

    function toggleTheme() {
        const currentlyDark = document.documentElement.classList.contains('dark');
        applyTheme(currentlyDark ? 'light' : 'dark', true);
    }

    function logout() {
        STORAGE_KEYS.forEach(k => {
            try { localStorage.removeItem(k); } catch (_) {}
            try { sessionStorage.removeItem(k); } catch (_) {}
        });
        window.location.href = 'index.html';
    }

    function buildNavbarHtml() {
        const page = getCurrentPage();
        const { isLoggedIn, username, role } = getAuthState();

        const navItems = [
            { href: 'index.html', label: 'Home', icon: 'fa-home' },
            { href: 'events.html', label: 'Matches', icon: 'fa-futbol' },
            { href: 'book-tickets.html', label: 'Book Tickets', icon: 'fa-ticket-alt' },
            { href: 'bookings.html', label: 'My Bookings', icon: 'fa-receipt' },
            { href: 'wishlist.html', label: 'Wishlist', icon: 'fa-heart' },
            { href: 'leagues.html', label: 'Leagues', icon: 'fa-trophy' }
        ];

        const desktopLinks = navItems.map(item => {
            const active = page === item.href ? ' active' : '';
            return `<a href="${item.href}" class="ft-nav-link${active}">${item.label}</a>`;
        }).join('');

        const mobileLinks = navItems.map(item => {
            const active = page === item.href ? ' active' : '';
            return `<a href="${item.href}" class="ft-mobile-link${active}"><i class="fas ${item.icon} w-4 text-center"></i><span>${item.label}</span></a>`;
        }).join('');

        const initials = username ? username.slice(0, 2).toUpperCase() : 'FT';
        const roleClass = role === 'ADMIN' ? 'ft-role-admin' : role === 'CASHIER' ? 'ft-role-cashier' : 'ft-role-user';
        const isDark = document.documentElement.classList.contains('dark');

        const authSection = isLoggedIn ? `
            <div class="ft-user-menu-wrap" id="nav-right-container">
                <button type="button" id="ft-user-menu-btn" class="ft-user-trigger" aria-expanded="false" aria-haspopup="true">
                    <span class="ft-avatar">${escapeHtml(initials)}</span>
                    <span class="ft-user-name">${escapeHtml(username)}</span>
                    <span class="ft-role-pill ${roleClass}">${escapeHtml(role || 'USER')}</span>
                    <i class="fas fa-chevron-down text-xs opacity-60"></i>
                </button>
                <div id="ft-user-dropdown" class="ft-dropdown hidden" role="menu">
                    <div class="ft-dropdown-header">
                        <div class="text-xs font-bold uppercase tracking-wider opacity-60">Signed in as</div>
                        <div class="text-sm font-bold truncate">${escapeHtml(username)}</div>
                    </div>
                    ${role === 'ADMIN' ? `
                        <a href="admin-dashboard.html" class="ft-dropdown-item" id="admin-link"><i class="fas fa-chart-line w-4"></i>Admin Dashboard</a>
                        <a href="admin-profile.html" class="ft-dropdown-item" id="admin-profile-link"><i class="fas fa-user-shield w-4"></i>Admin Profile</a>
                        <a href="cashier-dashboard.html" class="ft-dropdown-item"><i class="fas fa-cash-register w-4"></i>Cashier Dashboard</a>
                        <div class="ft-dropdown-divider"></div>
                    ` : ''}
                    ${role === 'CASHIER' ? `
                        <a href="cashier-dashboard.html" class="ft-dropdown-item"><i class="fas fa-cash-register w-4"></i>Cashier Dashboard</a>
                        <div class="ft-dropdown-divider"></div>
                    ` : ''}
                    <a href="profile.html" class="ft-dropdown-item" id="profile-link"><i class="fas fa-user w-4"></i>My Profile</a>
                    <a href="bookings.html" class="ft-dropdown-item"><i class="fas fa-ticket-alt w-4"></i>My Bookings</a>
                    <a href="wishlist.html" class="ft-dropdown-item"><i class="fas fa-heart w-4"></i>My Wishlist</a>
                    <div class="ft-dropdown-divider"></div>
                    <button type="button" id="logout-link" class="ft-dropdown-item danger"><i class="fas fa-sign-out-alt w-4"></i>Logout</button>
                </div>
            </div>
        ` : `
            <div class="flex items-center" id="nav-right-container">
                <a href="login.html" id="login-link" class="ft-btn-primary">
                    <i class="fas fa-sign-in-alt" aria-hidden="true"></i>
                    <span>Sign In</span>
                </a>
            </div>
        `;

        const mobileAuthSection = isLoggedIn ? `
            <div class="ft-dropdown-divider my-2"></div>
            ${role === 'ADMIN' ? `<a href="admin-dashboard.html" class="ft-mobile-link"><i class="fas fa-chart-line w-4"></i><span>Admin Dashboard</span></a>` : ''}
            ${role === 'CASHIER' || role === 'ADMIN' ? `<a href="cashier-dashboard.html" class="ft-mobile-link"><i class="fas fa-cash-register w-4"></i><span>Cashier Dashboard</span></a>` : ''}
            <a href="profile.html" class="ft-mobile-link"><i class="fas fa-user w-4"></i><span>My Profile (${escapeHtml(username)})</span></a>
            <button type="button" id="ft-mobile-logout" class="ft-mobile-link w-full text-left text-red-600"><i class="fas fa-sign-out-alt w-4"></i><span>Logout</span></button>
        ` : `
            <div class="pt-2">
                <a href="login.html" class="ft-btn-primary w-full py-2.5">Sign In</a>
            </div>
        `;

        return `
        <nav class="ft-navbar" data-ft-shell="true" aria-label="Primary Navigation">
            <div class="ft-nav-inner">
                <a href="index.html" class="ft-brand">
                    <span class="ft-brand-icon" aria-hidden="true">
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-3.5l6-4.5-6-4.5v9z"></path>
                        </svg>
                    </span>
                    <span class="ft-brand-name">Football<span>Tix</span></span>
                </a>

                <div class="ft-nav-links">${desktopLinks}</div>

                <div class="ft-nav-actions">
                    <button type="button" id="ft-theme-toggle" class="ft-theme-btn" aria-label="Toggle color theme" title="${isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}">
                        <i class="fas ${isDark ? 'fa-sun' : 'fa-moon'}" aria-hidden="true"></i>
                    </button>
                    ${authSection}
                    <button type="button" id="mobile-menu-toggle" class="ft-mobile-btn" aria-controls="mobile-menu" aria-expanded="false" aria-label="Open menu">
                        <i class="fas fa-bars" aria-hidden="true"></i>
                    </button>
                </div>
            </div>

            <div id="mobile-menu" class="ft-mobile-menu hidden">
                ${mobileLinks}
                ${mobileAuthSection}
            </div>
        </nav>`;
    }

    function buildFooterHtml() {
        return `
        <footer class="ft-footer" data-ft-shell="true">
            <div class="ft-footer-inner">
                <div class="ft-footer-grid">
                    <div>
                        <a href="index.html" class="ft-brand mb-4 inline-flex">
                            <span class="ft-brand-icon" aria-hidden="true">
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-3.5l6-4.5-6-4.5v9z"></path>
                                </svg>
                            </span>
                            <span class="ft-brand-name" style="color:#ffffff;">Football<span style="color:#0e9f57;">Tix</span></span>
                        </a>
                        <p class="text-sm text-neutral-400 leading-relaxed max-w-xs mt-3">
                            Official matchday box office for verified European football tickets — clear pricing, live seat inventory, instant QR entry.
                        </p>
                    </div>

                    <div>
                        <h3 class="ft-footer-heading">Explore</h3>
                        <ul class="ft-footer-list">
                            <li><a href="index.html" class="ft-footer-link">Home</a></li>
                            <li><a href="events.html" class="ft-footer-link">All Matches</a></li>
                            <li><a href="book-tickets.html" class="ft-footer-link">Book Tickets</a></li>
                            <li><a href="bookings.html" class="ft-footer-link">My Bookings</a></li>
                            <li><a href="leagues.html" class="ft-footer-link">Leagues</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 class="ft-footer-heading">Information</h3>
                        <ul class="ft-footer-list">
                            <li><a href="about.html" class="ft-footer-link">About Us</a></li>
                            <li><a href="how-it-works.html" class="ft-footer-link">How It Works</a></li>
                            <li><a href="faq.html" class="ft-footer-link">FAQs</a></li>
                            <li><a href="contactus.html" class="ft-footer-link">Contact Us</a></li>
                            <li><a href="important-information.html" class="ft-footer-link">Important Info</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 class="ft-footer-heading">Legal & Support</h3>
                        <ul class="ft-footer-list">
                            <li><a href="refund-policy.html" class="ft-footer-link">Refund Policy</a></li>
                            <li><a href="terms.html" class="ft-footer-link">Terms & Conditions</a></li>
                            <li><a href="privacy-policy.html" class="ft-footer-link">Privacy Policy</a></li>
                            <li><a href="mailto:support@footballtix.com" class="ft-footer-link"><i class="fas fa-envelope" style="color:#0e9f57;"></i>support@footballtix.com</a></li>
                        </ul>
                    </div>
                </div>

                <div class="ft-footer-bottom">
                    <p>&copy; 2026 FootballTix. All rights reserved.</p>
                    <div class="flex items-center gap-4">
                        <a href="privacy-policy.html" class="ft-footer-link">Privacy</a>
                        <a href="terms.html" class="ft-footer-link">Terms</a>
                        <a href="refund-policy.html" class="ft-footer-link">Refunds</a>
                    </div>
                </div>
            </div>
        </footer>`;
    }

    function bindNavbarInteractions() {
        const themeBtn = document.getElementById('ft-theme-toggle');
        if (themeBtn) {
            themeBtn.addEventListener('click', toggleTheme);
        }

        const userBtn = document.getElementById('ft-user-menu-btn');
        const dropdown = document.getElementById('ft-user-dropdown');
        if (userBtn && dropdown) {
            userBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isHidden = dropdown.classList.toggle('hidden');
                userBtn.setAttribute('aria-expanded', String(!isHidden));
            });
            document.addEventListener('click', (e) => {
                if (!userBtn.contains(e.target) && !dropdown.contains(e.target)) {
                    dropdown.classList.add('hidden');
                    userBtn.setAttribute('aria-expanded', 'false');
                }
            });
        }

        const mobileBtn = document.getElementById('mobile-menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileBtn && mobileMenu) {
            mobileBtn.addEventListener('click', () => {
                const isHidden = mobileMenu.classList.toggle('hidden');
                mobileBtn.setAttribute('aria-expanded', String(!isHidden));
                mobileBtn.innerHTML = isHidden
                    ? '<i class="fas fa-bars" aria-hidden="true"></i>'
                    : '<i class="fas fa-times" aria-hidden="true"></i>';
            });
        }

        const logoutBtn = document.getElementById('logout-link');
        if (logoutBtn) logoutBtn.addEventListener('click', (e) => { e.preventDefault(); logout(); });

        const mobileLogout = document.getElementById('ft-mobile-logout');
        if (mobileLogout) mobileLogout.addEventListener('click', (e) => { e.preventDefault(); logout(); });
    }

    function renderNavbar() {
        const page = getCurrentPage();
        if (page === 'login.html' || page === 'register.html') return;

        const existingNav = document.querySelector('nav');
        const wrapper = document.createElement('div');
        wrapper.innerHTML = buildNavbarHtml().trim();
        const newNav = wrapper.firstElementChild;

        if (existingNav) {
            existingNav.replaceWith(newNav);
        } else {
            document.body.insertAdjacentElement('afterbegin', newNav);
        }
        bindNavbarInteractions();
    }

    function renderFooter() {
        const page = getCurrentPage();
        if (page === 'login.html' || page === 'register.html') return;

        const existingFooter = document.querySelector('footer');
        const wrapper = document.createElement('div');
        wrapper.innerHTML = buildFooterHtml().trim();
        const newFooter = wrapper.firstElementChild;

        if (existingFooter) {
            existingFooter.replaceWith(newFooter);
        } else {
            document.body.appendChild(newFooter);
        }
    }

    initThemeEarly();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            renderNavbar();
            renderFooter();
        });
    } else {
        renderNavbar();
        renderFooter();
    }

    window.FootballTixLayout = {
        renderNavbar,
        renderFooter,
        toggleTheme,
        logout
    };
    window.handleLogout = logout;
})();
