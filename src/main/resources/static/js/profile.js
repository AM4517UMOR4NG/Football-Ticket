/**
 * FootballTix — User Profile Controller
 * Integrates with /api/profile, /api/profile/stats, /api/profile/change-password,
 * /api/bookings/my-bookings, and /api/bookings/{id}/cancel.
 */
(function () {
    'use strict';

    const PREFS_STORAGE_KEY = 'ft_user_preferences';
    const state = {
        profile: null,
        bookings: [],
        editing: false
    };

    function getToken() {
        return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    }

    function escapeHtml(str) {
        return String(str ?? '').replace(/[&<>"']/g, s => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[s]));
    }

    function formatIdr(amount) {
        const numeric = Number(amount);
        if (!Number.isFinite(numeric)) return 'Rp 0';
        return 'Rp ' + new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(numeric);
    }

    function formatDate(isoValue, includeTime) {
        if (!isoValue) return '—';
        const d = new Date(isoValue);
        if (Number.isNaN(d.getTime())) return '—';
        if (includeTime) {
            return d.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        return d.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }

    function getInitials(name, username) {
        const source = (name || username || 'FT').trim();
        const parts = source.split(/\s+/).filter(Boolean);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return source.slice(0, 2).toUpperCase();
    }

    function showToast(message, type = 'info') {
        const container = document.getElementById('ft-toast-container');
        if (!container) return;

        const iconMap = {
            success: 'fa-check-circle text-emerald-400',
            error: 'fa-exclamation-circle text-red-400',
            info: 'fa-info-circle text-sky-400'
        };

        const toast = document.createElement('div');
        toast.className = `ft-toast ft-toast-${type}`;
        toast.innerHTML = `<i class="fas ${iconMap[type] || iconMap.info}" aria-hidden="true"></i><span>${escapeHtml(message)}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.2s ease';
            setTimeout(() => toast.remove(), 220);
        }, 3400);
    }

    async function apiRequest(url, options = {}) {
        const token = getToken();
        if (!token) {
            window.location.href = 'login.html';
            throw new Error('Authentication required');
        }

        const headers = {
            'Authorization': `Bearer ${token}`,
            ...(options.body ? { 'Content-Type': 'application/json' } : {}),
            ...(options.headers || {})
        };

        const response = await fetch(url, { ...options, headers });

        if (response.status === 401) {
            showToast('Session expired. Please sign in again.', 'error');
            setTimeout(() => {
                if (window.FootballTixLayout) {
                    window.FootballTixLayout.logout();
                } else {
                    window.location.href = 'login.html';
                }
            }, 900);
            throw new Error('Unauthorized');
        }

        return response;
    }

    function activateSection(sectionId) {
        document.querySelectorAll('.profile-section').forEach(section => {
            section.classList.toggle('hidden', section.id !== sectionId);
        });

        document.querySelectorAll('#profile-tab-nav .ft-tab-btn').forEach(btn => {
            const isActive = btn.dataset.section === sectionId;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', String(isActive));
        });
    }

    function applyProfileData(user) {
        state.profile = user;
        const displayName = user.fullName && user.fullName.trim() ? user.fullName.trim() : user.username;
        const role = (user.role || 'USER').toUpperCase();

        document.getElementById('profile-avatar-initials').textContent = getInitials(user.fullName, user.username);
        document.getElementById('profile-name').textContent = displayName || 'Member';
        document.getElementById('profile-email').textContent = user.email || 'No email on file';
        document.getElementById('profile-username-pill').textContent = `@${user.username || 'user'}`;

        const roleBadge = document.getElementById('profile-role-badge');
        roleBadge.textContent = role;
        roleBadge.className = 'ft-masthead-pill ' + (
            role === 'ADMIN' ? 'ft-pill-admin' :
            role === 'CASHIER' ? 'ft-pill-cashier' : 'ft-pill-pitch'
        );

        const joinedYear = user.createdAt ? new Date(user.createdAt).getFullYear() : null;
        document.getElementById('member-since').textContent = joinedYear && !Number.isNaN(joinedYear)
            ? `Member since ${joinedYear}`
            : 'Verified Member';

        // Populate form fields
        document.getElementById('fullname-input').value = user.fullName || '';
        document.getElementById('email-input').value = user.email || '';
        document.getElementById('phone-input').value = user.phone || '';
        document.getElementById('username-input').value = user.username || '';
        document.getElementById('role-input').value = role;
        document.getElementById('member-since-input').value = formatDate(user.createdAt, false);
        document.getElementById('address-input').value = user.address || '';

        // Show staff shortcut if applicable
        const staffLink = document.getElementById('staff-dashboard-link');
        const staffLabel = document.getElementById('staff-dashboard-label');
        if (role === 'ADMIN') {
            staffLink.href = 'admin-dashboard.html';
            staffLabel.textContent = 'Admin Dashboard';
            staffLink.classList.remove('hidden');
        } else if (role === 'CASHIER') {
            staffLink.href = 'cashier-dashboard.html';
            staffLabel.textContent = 'Cashier Dashboard';
            staffLink.classList.remove('hidden');
        } else {
            staffLink.classList.add('hidden');
        }
    }

    function setEditMode(enabled) {
        state.editing = enabled;
        const editableIds = ['fullname-input', 'email-input', 'phone-input', 'address-input'];
        editableIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.disabled = !enabled;
        });

        const saveButtons = document.getElementById('save-buttons');
        const editBtn = document.getElementById('edit-profile-btn');
        if (saveButtons) saveButtons.classList.toggle('hidden', !enabled);
        if (editBtn) editBtn.classList.toggle('hidden', enabled);

        if (enabled) {
            const first = document.getElementById('fullname-input');
            if (first) first.focus();
        } else if (state.profile) {
            applyProfileData(state.profile);
        }
    }

    async function loadProfile() {
        try {
            const response = await apiRequest('/api/profile');
            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.error || 'Failed to load profile');
            }
            const user = await response.json();
            applyProfileData(user);
        } catch (err) {
            if (err.message !== 'Unauthorized') {
                showToast(err.message || 'Could not load profile details', 'error');
            }
        }
    }

    async function loadStats() {
        try {
            const response = await apiRequest('/api/profile/stats');
            if (!response.ok) return;
            const stats = await response.json();
            document.getElementById('total-bookings').textContent = String(stats.totalBookings ?? 0);
            document.getElementById('active-bookings').textContent = String(stats.activeBookings ?? 0);
            document.getElementById('total-spent').textContent = formatIdr(stats.totalSpent ?? 0);
        } catch (err) {
            if (err.message !== 'Unauthorized') {
                console.error('Failed to load profile stats:', err);
            }
        }
    }

    function getStatusBadgeClass(status) {
        switch ((status || '').toUpperCase()) {
            case 'CONFIRMED': return 'ft-badge-confirmed';
            case 'COMPLETED': return 'ft-badge-completed';
            case 'PENDING': return 'ft-badge-pending';
            case 'CANCELLED': return 'ft-badge-cancelled';
            default: return 'ft-badge-pending';
        }
    }

    function renderBookings() {
        const container = document.getElementById('booking-history-list');
        const filter = (document.getElementById('booking-status-filter')?.value || 'ALL').toUpperCase();
        if (!container) return;

        const filtered = filter === 'ALL'
            ? state.bookings
            : state.bookings.filter(b => (b.status || '').toUpperCase() === filter);

        if (!filtered.length) {
            container.innerHTML = `
                <div class="ft-empty-state">
                    <i class="fas fa-ticket-alt text-2xl mb-2 opacity-60" aria-hidden="true"></i>
                    <p class="text-sm font-semibold mb-1">${filter === 'ALL' ? 'No bookings yet' : `No ${escapeHtml(filter.toLowerCase())} bookings`}</p>
                    <p class="text-xs mb-4">When you reserve seats for a match, your ticket ledger will appear here.</p>
                    <a href="events.html" class="ft-btn-solid-pitch">Browse Upcoming Matches</a>
                </div>`;
            return;
        }

        container.innerHTML = filtered.map(booking => {
            const status = (booking.status || 'PENDING').toUpperCase();
            const canCancel = status === 'PENDING' || status === 'CONFIRMED';
            const ticketLabel = booking.numberOfTickets === 1 ? '1 ticket' : `${booking.numberOfTickets || 0} tickets`;
            const ref = booking.bookingReference || `BK-${booking.id}`;

            return `
                <div class="ft-booking-row">
                    <div class="min-w-0 space-y-1">
                        <div class="flex flex-wrap items-center gap-2">
                            <span class="ft-ref-code">${escapeHtml(ref)}</span>
                            <span class="ft-status-badge ${getStatusBadgeClass(status)}">${escapeHtml(status)}</span>
                        </div>
                        <h3 class="text-base font-bold truncate">${escapeHtml(booking.eventTitle || 'Football Match')}</h3>
                        <p class="text-xs text-[var(--ft-muted)]">
                            <i class="fas fa-map-marker-alt mr-1" aria-hidden="true"></i>${escapeHtml(booking.venue || 'Stadium TBA')}
                            <span class="mx-1.5">&middot;</span>
                            <i class="far fa-calendar mr-1" aria-hidden="true"></i>${escapeHtml(formatDate(booking.eventDate, true))}
                        </p>
                        <p class="text-xs font-semibold">
                            ${escapeHtml(ticketLabel)} &middot; <span class="text-[var(--ft-pitch)]">${escapeHtml(formatIdr(booking.totalAmount))}</span>
                        </p>
                    </div>
                    <div class="flex flex-wrap items-center gap-2 flex-shrink-0">
                        <a href="bookings.html" class="ft-btn-outline">
                            <i class="fas fa-qrcode text-xs" aria-hidden="true"></i>
                            <span>View Ticket</span>
                        </a>
                        ${canCancel ? `
                            <button type="button" class="ft-btn-danger-outline cancel-booking-btn" data-booking-id="${escapeHtml(booking.id)}" data-booking-ref="${escapeHtml(ref)}">
                                <span>Cancel</span>
                            </button>
                        ` : ''}
                    </div>
                </div>`;
        }).join('');

        container.querySelectorAll('.cancel-booking-btn').forEach(btn => {
            btn.addEventListener('click', () => handleCancelBooking(btn.dataset.bookingId, btn.dataset.bookingRef, btn));
        });
    }

    async function loadBookings() {
        const container = document.getElementById('booking-history-list');
        if (container) {
            container.innerHTML = `
                <div class="ft-empty-state">
                    <i class="fas fa-circle-notch fa-spin text-lg mb-2" aria-hidden="true"></i>
                    <p class="text-sm font-medium">Loading your booking history...</p>
                </div>`;
        }

        try {
            const response = await apiRequest('/api/bookings/my-bookings');
            if (!response.ok) {
                throw new Error('Could not fetch booking history');
            }
            const data = await response.json();
            state.bookings = Array.isArray(data) ? data : [];
            renderBookings();
        } catch (err) {
            if (err.message !== 'Unauthorized' && container) {
                container.innerHTML = `
                    <div class="ft-empty-state">
                        <i class="fas fa-exclamation-triangle text-xl mb-2 text-red-500" aria-hidden="true"></i>
                        <p class="text-sm font-semibold">Unable to load booking history</p>
                        <p class="text-xs mt-1">${escapeHtml(err.message)}</p>
                    </div>`;
            }
        }
    }

    async function handleCancelBooking(bookingId, bookingRef, triggerBtn) {
        if (!confirm(`Cancel booking ${bookingRef}? This action cannot be undone.`)) {
            return;
        }

        const originalText = triggerBtn.innerHTML;
        triggerBtn.disabled = true;
        triggerBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin text-xs"></i>';

        try {
            const response = await apiRequest(`/api/bookings/${encodeURIComponent(bookingId)}/cancel`, {
                method: 'POST'
            });
            const payload = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(payload.detail || payload.error || 'Failed to cancel booking');
            }
            showToast(`Booking ${bookingRef} cancelled.`, 'success');
            await Promise.all([loadBookings(), loadStats()]);
        } catch (err) {
            triggerBtn.disabled = false;
            triggerBtn.innerHTML = originalText;
            if (err.message !== 'Unauthorized') {
                showToast(err.message || 'Unable to cancel booking', 'error');
            }
        }
    }

    async function handleSaveProfile(e) {
        e.preventDefault();
        const saveBtn = document.getElementById('save-profile-btn');
        const fullName = document.getElementById('fullname-input').value.trim();
        const email = document.getElementById('email-input').value.trim();
        const phone = document.getElementById('phone-input').value.trim();
        const address = document.getElementById('address-input').value.trim();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showToast('Please enter a valid email address.', 'error');
            return;
        }

        saveBtn.disabled = true;
        try {
            const response = await apiRequest('/api/profile', {
                method: 'PUT',
                body: JSON.stringify({ fullName, email, phone, address })
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.error || 'Failed to update profile');
            }
            applyProfileData(data);
            setEditMode(false);
            showToast('Profile updated successfully.', 'success');
        } catch (err) {
            if (err.message !== 'Unauthorized') {
                showToast(err.message || 'Failed to update profile', 'error');
            }
        } finally {
            saveBtn.disabled = false;
        }
    }

    async function handleChangePassword(e) {
        e.preventDefault();
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const submitBtn = document.getElementById('update-password-btn');

        if (!currentPassword || !newPassword || !confirmPassword) {
            showToast('Please complete all password fields.', 'error');
            return;
        }
        if (newPassword.length < 8) {
            showToast('New password must be at least 8 characters with uppercase, lowercase, number, and symbol.', 'error');
            return;
        }
        if (newPassword !== confirmPassword) {
            showToast('New password and confirmation do not match.', 'error');
            return;
        }

        submitBtn.disabled = true;
        try {
            const response = await apiRequest('/api/profile/change-password', {
                method: 'POST',
                body: JSON.stringify({ currentPassword, newPassword })
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.error || 'Failed to change password');
            }
            document.getElementById('password-form').reset();
            showToast(data.message || 'Password updated successfully.', 'success');
        } catch (err) {
            if (err.message !== 'Unauthorized') {
                showToast(err.message || 'Failed to change password', 'error');
            }
        } finally {
            submitBtn.disabled = false;
        }
    }

    function syncThemePreferenceControl() {
        const isDark = document.documentElement.classList.contains('dark');
        const label = document.getElementById('pref-theme-label');
        const icon = document.getElementById('pref-theme-icon');
        if (label) label.textContent = isDark ? 'Dark Mode' : 'Light Mode';
        if (icon) icon.className = isDark ? 'fas fa-sun text-xs' : 'fas fa-moon text-xs';
    }

    function loadPreferences() {
        try {
            const raw = localStorage.getItem(PREFS_STORAGE_KEY);
            if (raw) {
                const prefs = JSON.parse(raw);
                document.getElementById('pref-email-notifications').checked = prefs.emailNotifications !== false;
                document.getElementById('pref-sms-alerts').checked = Boolean(prefs.smsAlerts);
                document.getElementById('pref-marketing').checked = Boolean(prefs.marketing);
                if (prefs.language) document.getElementById('pref-language').value = prefs.language;
                if (prefs.currency) document.getElementById('pref-currency').value = prefs.currency;
            }
        } catch (_) {
            // Ignore corrupt preference cache
        }
        syncThemePreferenceControl();
    }

    function handleSavePreferences(e) {
        e.preventDefault();
        const prefs = {
            emailNotifications: document.getElementById('pref-email-notifications').checked,
            smsAlerts: document.getElementById('pref-sms-alerts').checked,
            marketing: document.getElementById('pref-marketing').checked,
            language: document.getElementById('pref-language').value,
            currency: document.getElementById('pref-currency').value
        };
        try {
            localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
            showToast('Preferences saved.', 'success');
        } catch (_) {
            showToast('Unable to persist preferences in this browser.', 'error');
        }
    }

    function bindEvents() {
        document.querySelectorAll('#profile-tab-nav .ft-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => activateSection(btn.dataset.section));
        });

        document.getElementById('edit-profile-btn')?.addEventListener('click', () => setEditMode(true));
        document.getElementById('cancel-edit-btn')?.addEventListener('click', () => setEditMode(false));
        document.getElementById('personal-info-form')?.addEventListener('submit', handleSaveProfile);

        document.getElementById('booking-status-filter')?.addEventListener('change', renderBookings);
        document.getElementById('refresh-bookings-btn')?.addEventListener('click', () => {
            loadBookings();
            loadStats();
        });

        document.getElementById('password-form')?.addEventListener('submit', handleChangePassword);
        document.querySelectorAll('.ft-pw-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const input = document.getElementById(btn.dataset.target);
                if (!input) return;
                const showing = input.type === 'text';
                input.type = showing ? 'password' : 'text';
                const icon = btn.querySelector('i');
                if (icon) icon.className = showing ? 'fas fa-eye' : 'fas fa-eye-slash';
            });
        });

        document.getElementById('preferences-form')?.addEventListener('submit', handleSavePreferences);
        document.getElementById('pref-theme-toggle')?.addEventListener('click', () => {
            if (window.FootballTixLayout) {
                window.FootballTixLayout.toggleTheme();
            }
            syncThemePreferenceControl();
        });

        const triggerLogout = () => {
            if (window.FootballTixLayout) {
                window.FootballTixLayout.logout();
            } else {
                localStorage.removeItem('accessToken');
                window.location.href = 'index.html';
            }
        };

        document.getElementById('sidebar-logout-btn')?.addEventListener('click', triggerLogout);
        document.getElementById('security-logout-btn')?.addEventListener('click', triggerLogout);
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (!getToken()) {
            window.location.href = 'login.html';
            return;
        }
        activateSection('personal-info');
        loadPreferences();
        bindEvents();
        Promise.all([loadProfile(), loadStats(), loadBookings()]);
    });
})();
