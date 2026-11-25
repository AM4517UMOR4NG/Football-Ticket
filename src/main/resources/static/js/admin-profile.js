/**
 * FootballTix — Admin Profile Controller
 * Integrates with /api/admin/profile, /api/admin/stats, /api/admin/users/search,
 * /api/admin/users/{id}, /api/admin/audit-logs, /api/admin/system/maintenance,
 * /api/admin/security/force-logout-all, and /api/profile/change-password.
 */
(function () {
    'use strict';

    const state = {
        profile: null,
        users: [],
        logs: [],
        editing: false
    };

    function getToken() {
        return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    }

    function getStoredRole() {
        return (localStorage.getItem('userRole') || sessionStorage.getItem('userRole') || '').toUpperCase();
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

    function formatDateTime(isoValue) {
        if (!isoValue) return '—';
        const d = new Date(isoValue);
        if (Number.isNaN(d.getTime())) return '—';
        return d.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function getInitials(name, username) {
        const source = (name || username || 'AD').trim();
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

        if (response.status === 403) {
            showToast('Admin privileges required to access this page.', 'error');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1100);
            throw new Error('Forbidden');
        }

        return response;
    }

    function activateSection(sectionId) {
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.toggle('hidden', section.id !== sectionId);
        });

        document.querySelectorAll('#admin-tab-nav .ft-tab-btn').forEach(btn => {
            const isActive = btn.dataset.section === sectionId;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', String(isActive));
        });
    }

    function applyAdminProfile(admin) {
        state.profile = admin;
        const displayName = admin.fullName && admin.fullName.trim() ? admin.fullName.trim() : admin.username;

        document.getElementById('admin-avatar-initials').textContent = getInitials(admin.fullName, admin.username);
        document.getElementById('admin-name').textContent = displayName || 'System Administrator';
        document.getElementById('admin-email').textContent = admin.email || '—';
        document.getElementById('admin-access-badge').textContent = admin.permissions || 'Full Access';
        document.getElementById('last-login').textContent = `Last login: ${formatDateTime(admin.lastLogin)}`;

        document.getElementById('sidebar-employee-id').textContent = admin.employeeId || '—';
        document.getElementById('sidebar-department').textContent = admin.department || 'Administration';

        document.getElementById('admin-fullname').value = admin.fullName || '';
        document.getElementById('admin-email-input').value = admin.email || '';
        document.getElementById('admin-phone').value = admin.phone || '';
        document.getElementById('admin-username').value = admin.username || '';
        document.getElementById('admin-address').value = admin.address || '';

        document.getElementById('admin-role').value = admin.adminLevel || admin.role || 'ADMIN';
        document.getElementById('admin-employee-id').value = admin.employeeId || '—';
        document.getElementById('admin-department').value = admin.department || '—';
        document.getElementById('admin-office').value = admin.officeLocation || '—';
        document.getElementById('admin-schedule').value = admin.workSchedule || '—';
        document.getElementById('admin-permissions').value = admin.permissions || 'Full Access';
    }

    function setEditMode(enabled) {
        state.editing = enabled;
        const editableIds = ['admin-fullname', 'admin-email-input', 'admin-phone', 'admin-address'];
        editableIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.disabled = !enabled;
        });

        document.getElementById('admin-save-buttons')?.classList.toggle('hidden', !enabled);
        document.getElementById('edit-admin-btn')?.classList.toggle('hidden', enabled);

        if (enabled) {
            document.getElementById('admin-fullname')?.focus();
        } else if (state.profile) {
            applyAdminProfile(state.profile);
        }
    }

    async function loadAdminProfile() {
        try {
            const response = await apiRequest('/api/admin/profile');
            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.error || 'Failed to load admin profile');
            }
            const admin = await response.json();
            applyAdminProfile(admin);
        } catch (err) {
            if (err.message !== 'Unauthorized' && err.message !== 'Forbidden') {
                showToast(err.message || 'Unable to load admin profile', 'error');
            }
        }
    }

    async function loadSystemStats() {
        try {
            const response = await apiRequest('/api/admin/stats');
            if (!response.ok) return;
            const stats = await response.json();

            const totalUsers = stats.totalUsers ?? 0;
            const activeUsers = stats.activeUsers ?? 0;
            const adminUsers = stats.adminUsers ?? 0;
            const activeEvents = stats.activeEvents ?? 0;
            const totalEvents = stats.totalEvents ?? 0;
            const upcomingEvents = stats.upcomingEvents ?? 0;
            const totalBookings = stats.totalBookings ?? 0;
            const confirmedBookings = stats.confirmedBookings ?? 0;
            const pendingBookings = stats.pendingBookings ?? 0;
            const cancelledBookings = stats.cancelledBookings ?? 0;

            document.getElementById('total-users').textContent = totalUsers.toLocaleString('id-ID');
            document.getElementById('users-breakdown').textContent = `${activeUsers} Users · ${adminUsers} Admins`;

            document.getElementById('active-events').textContent = activeEvents.toLocaleString('id-ID');
            document.getElementById('events-breakdown').textContent = `${totalEvents} Total · ${upcomingEvents} Upcoming`;

            document.getElementById('total-revenue').textContent = formatIdr(stats.totalRevenue ?? 0);
            document.getElementById('bookings-breakdown').textContent = `${confirmedBookings} Confirmed · ${totalBookings} Total`;

            document.getElementById('system-status').textContent = stats.systemStatus || 'Online';
            document.getElementById('stats-updated-at').textContent = `Updated ${formatDateTime(stats.lastUpdated || new Date().toISOString())}`;

            document.getElementById('sidebar-pending-bookings').textContent = String(pendingBookings);

            document.getElementById('metric-total-bookings').textContent = String(totalBookings);
            document.getElementById('metric-confirmed-bookings').textContent = String(confirmedBookings);
            document.getElementById('metric-pending-bookings').textContent = String(pendingBookings);
            document.getElementById('metric-cancelled-bookings').textContent = String(cancelledBookings);
        } catch (err) {
            if (err.message !== 'Unauthorized' && err.message !== 'Forbidden') {
                console.error('Failed to load system stats:', err);
            }
        }
    }

    function getRoleBadgeClass(role) {
        switch ((role || '').toUpperCase()) {
            case 'ADMIN': return 'ft-badge-error';
            case 'CASHIER': return 'ft-badge-warning';
            default: return 'ft-badge-confirmed';
        }
    }

    function renderUsers() {
        const container = document.getElementById('user-list-container');
        const countBadge = document.getElementById('user-count-badge');
        const roleFilter = (document.getElementById('user-role-filter')?.value || 'ALL').toUpperCase();
        if (!container) return;

        const filtered = roleFilter === 'ALL'
            ? state.users
            : state.users.filter(u => (u.role || 'USER').toUpperCase() === roleFilter);

        if (countBadge) {
            countBadge.textContent = `${filtered.length} ${filtered.length === 1 ? 'account' : 'accounts'}`;
        }

        if (!filtered.length) {
            container.innerHTML = `
                <div class="ft-empty-state">
                    <i class="fas fa-users-slash text-xl mb-2 opacity-60" aria-hidden="true"></i>
                    <p class="text-sm font-semibold">No matching accounts found</p>
                    <p class="text-xs mt-1">Adjust your search query or role filter.</p>
                </div>`;
            return;
        }

        container.innerHTML = filtered.map(user => {
            const role = (user.role || 'USER').toUpperCase();
            const isProtected = role === 'ADMIN';
            const displayName = user.fullName && user.fullName.trim() ? user.fullName.trim() : user.username;

            return `
                <div class="ft-user-row">
                    <div class="flex items-center gap-3.5 min-w-0">
                        <div class="ft-user-tile" aria-hidden="true">${escapeHtml(getInitials(user.fullName, user.username))}</div>
                        <div class="min-w-0">
                            <div class="flex flex-wrap items-center gap-2">
                                <span class="text-sm font-bold truncate">${escapeHtml(displayName)}</span>
                                <span class="ft-status-badge ${getRoleBadgeClass(role)}">${escapeHtml(role)}</span>
                            </div>
                            <div class="text-xs text-[var(--ft-muted)] truncate mt-0.5">
                                @${escapeHtml(user.username || '')} &middot; ${escapeHtml(user.email || 'No email')}
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 flex-shrink-0">
                        <button type="button" class="ft-btn-outline text-xs view-user-btn" data-user-id="${escapeHtml(user.id)}">
                            <i class="fas fa-eye text-xs" aria-hidden="true"></i>
                            <span>Details</span>
                        </button>
                        ${isProtected ? `
                            <span class="ft-status-badge ft-badge-neutral" title="Admin accounts are protected">
                                <i class="fas fa-lock mr-1" aria-hidden="true"></i>Protected
                            </span>
                        ` : `
                            <button type="button" class="ft-btn-danger-outline text-xs delete-user-btn" data-user-id="${escapeHtml(user.id)}" data-username="${escapeHtml(user.username)}">
                                <i class="fas fa-trash text-xs" aria-hidden="true"></i>
                                <span>Delete</span>
                            </button>
                        `}
                    </div>
                </div>`;
        }).join('');

        container.querySelectorAll('.view-user-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const user = state.users.find(u => String(u.id) === String(btn.dataset.userId));
                if (user) openUserModal(user);
            });
        });

        container.querySelectorAll('.delete-user-btn').forEach(btn => {
            btn.addEventListener('click', () => handleDeleteUser(btn.dataset.userId, btn.dataset.username, btn));
        });
    }

    function openUserModal(user) {
        const modal = document.getElementById('user-detail-modal');
        const body = document.getElementById('modal-user-body');
        if (!modal || !body) return;

        const role = (user.role || 'USER').toUpperCase();
        body.innerHTML = `
            <div class="ft-stat-list">
                <div class="ft-stat-row">
                    <span class="ft-stat-label">User ID</span>
                    <span class="ft-ref-code">#${escapeHtml(user.id)}</span>
                </div>
                <div class="ft-stat-row">
                    <span class="ft-stat-label">Full Name</span>
                    <span class="font-bold">${escapeHtml(user.fullName || '—')}</span>
                </div>
                <div class="ft-stat-row">
                    <span class="ft-stat-label">Username</span>
                    <span class="font-mono font-semibold">@${escapeHtml(user.username || '—')}</span>
                </div>
                <div class="ft-stat-row">
                    <span class="ft-stat-label">Email</span>
                    <span class="font-medium">${escapeHtml(user.email || '—')}</span>
                </div>
                <div class="ft-stat-row">
                    <span class="ft-stat-label">Role</span>
                    <span class="ft-status-badge ${getRoleBadgeClass(role)}">${escapeHtml(role)}</span>
                </div>
                <div class="ft-stat-row">
                    <span class="ft-stat-label">Registered</span>
                    <span class="font-medium">${escapeHtml(formatDateTime(user.createdAt))}</span>
                </div>
            </div>`;

        modal.classList.remove('hidden');
    }

    function closeUserModal() {
        document.getElementById('user-detail-modal')?.classList.add('hidden');
    }

    async function loadUsers(query = '') {
        const container = document.getElementById('user-list-container');
        if (container) {
            container.innerHTML = `
                <div class="ft-empty-state">
                    <i class="fas fa-circle-notch fa-spin text-lg mb-2" aria-hidden="true"></i>
                    <p class="text-sm font-medium">Loading user directory...</p>
                </div>`;
        }

        try {
            const url = query && query.trim()
                ? `/api/admin/users/search?q=${encodeURIComponent(query.trim())}`
                : '/api/admin/users/search';
            const response = await apiRequest(url);
            if (!response.ok) throw new Error('Unable to fetch users');
            const users = await response.json();
            state.users = Array.isArray(users) ? users : [];
            renderUsers();
        } catch (err) {
            if (err.message !== 'Unauthorized' && err.message !== 'Forbidden' && container) {
                container.innerHTML = `
                    <div class="ft-empty-state">
                        <i class="fas fa-exclamation-triangle text-xl mb-2 text-red-500" aria-hidden="true"></i>
                        <p class="text-sm font-semibold">Failed to load user directory</p>
                    </div>`;
            }
        }
    }

    async function handleDeleteUser(userId, username, triggerBtn) {
        if (!confirm(`Delete account @${username}? This action cannot be undone.`)) {
            return;
        }

        triggerBtn.disabled = true;
        try {
            const response = await apiRequest(`/api/admin/users/${encodeURIComponent(userId)}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                throw new Error(payload.error || 'Failed to delete user');
            }
            showToast(`Account @${username} deleted.`, 'success');
            const query = document.getElementById('user-search-input')?.value || '';
            await Promise.all([loadUsers(query), loadSystemStats()]);
        } catch (err) {
            triggerBtn.disabled = false;
            if (err.message !== 'Unauthorized' && err.message !== 'Forbidden') {
                showToast(err.message || 'Unable to delete account', 'error');
            }
        }
    }

    function renderAuditLogs() {
        const container = document.getElementById('audit-logs-container');
        const levelFilter = (document.getElementById('audit-level-filter')?.value || 'ALL').toUpperCase();
        if (!container) return;

        const filtered = levelFilter === 'ALL'
            ? state.logs
            : state.logs.filter(log => (log.level || '').toUpperCase() === levelFilter);

        if (!filtered.length) {
            container.innerHTML = `
                <div class="ft-empty-state">
                    <i class="fas fa-clipboard-check text-xl mb-2 opacity-60" aria-hidden="true"></i>
                    <p class="text-sm font-semibold">No audit logs match this severity level</p>
                </div>`;
            return;
        }

        container.innerHTML = filtered.map(log => {
            const level = (log.level || 'INFO').toUpperCase();
            const rowClass = level === 'ERROR' ? 'ft-audit-error' : level === 'WARNING' ? 'ft-audit-warning' : 'ft-audit-info';
            const badgeClass = level === 'ERROR' ? 'ft-badge-error' : level === 'WARNING' ? 'ft-badge-warning' : 'ft-badge-confirmed';

            return `
                <div class="ft-audit-row ${rowClass}">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                        <div class="flex items-center gap-2">
                            <span class="ft-status-badge ${badgeClass}">${escapeHtml(level)}</span>
                            <span class="text-sm font-bold">${escapeHtml(log.message || 'System event')}</span>
                        </div>
                        <span class="font-mono text-xs text-[var(--ft-muted)]">${escapeHtml(formatDateTime(log.timestamp))}</span>
                    </div>
                    <div class="flex flex-wrap items-center gap-3 text-xs text-[var(--ft-muted)]">
                        <span><i class="fas fa-user mr-1" aria-hidden="true"></i>${escapeHtml(log.user || 'system')}</span>
                        <span><i class="fas fa-network-wired mr-1" aria-hidden="true"></i>${escapeHtml(log.ip || 'internal')}</span>
                    </div>
                </div>`;
        }).join('');
    }

    async function loadAuditLogs() {
        try {
            const response = await apiRequest('/api/admin/audit-logs');
            if (!response.ok) throw new Error('Unable to load audit logs');
            const logs = await response.json();
            state.logs = Array.isArray(logs) ? logs : [];
            renderAuditLogs();
        } catch (err) {
            if (err.message !== 'Unauthorized' && err.message !== 'Forbidden') {
                const container = document.getElementById('audit-logs-container');
                if (container) {
                    container.innerHTML = `
                        <div class="ft-empty-state">
                            <i class="fas fa-exclamation-triangle text-xl mb-2 text-red-500" aria-hidden="true"></i>
                            <p class="text-sm font-semibold">Failed to load audit logs</p>
                        </div>`;
                }
            }
        }
    }

    async function handleSaveAdminProfile(e) {
        e.preventDefault();
        const saveBtn = document.getElementById('save-admin-btn');
        const fullName = document.getElementById('admin-fullname').value.trim();
        const email = document.getElementById('admin-email-input').value.trim();
        const phone = document.getElementById('admin-phone').value.trim();
        const address = document.getElementById('admin-address').value.trim();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showToast('Please provide a valid email address.', 'error');
            return;
        }

        saveBtn.disabled = true;
        try {
            const response = await apiRequest('/api/admin/profile', {
                method: 'PUT',
                body: JSON.stringify({ fullName, email, phone, address })
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.error || 'Failed to save administrator profile');
            }
            applyAdminProfile(data);
            setEditMode(false);
            showToast('Administrator details updated.', 'success');
        } catch (err) {
            if (err.message !== 'Unauthorized' && err.message !== 'Forbidden') {
                showToast(err.message || 'Unable to save details', 'error');
            }
        } finally {
            saveBtn.disabled = false;
        }
    }

    async function handleAdminPasswordChange(e) {
        e.preventDefault();
        const currentPassword = document.getElementById('admin-current-password').value;
        const newPassword = document.getElementById('admin-new-password').value;
        const confirmPassword = document.getElementById('admin-confirm-password').value;
        const btn = document.getElementById('admin-update-password-btn');

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

        btn.disabled = true;
        try {
            const response = await apiRequest('/api/profile/change-password', {
                method: 'POST',
                body: JSON.stringify({ currentPassword, newPassword })
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.error || 'Failed to update password');
            }
            document.getElementById('admin-password-form').reset();
            showToast(data.message || 'Admin password updated.', 'success');
        } catch (err) {
            if (err.message !== 'Unauthorized' && err.message !== 'Forbidden') {
                showToast(err.message || 'Unable to change password', 'error');
            }
        } finally {
            btn.disabled = false;
        }
    }

    async function handleToggleMaintenance(e) {
        const checkbox = e.target;
        const enabled = checkbox.checked;
        const statusBadge = document.getElementById('maintenance-status-text');

        try {
            const response = await apiRequest('/api/admin/system/maintenance', {
                method: 'POST',
                body: JSON.stringify({ enabled })
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.error || 'Failed to update maintenance mode');
            }
            if (statusBadge) {
                statusBadge.textContent = enabled ? 'Maintenance Active' : 'Operational';
                statusBadge.className = 'ft-status-badge ' + (enabled ? 'ft-badge-warning' : 'ft-badge-confirmed');
            }
            showToast(data.message || `Maintenance mode ${enabled ? 'enabled' : 'disabled'}.`, 'success');
        } catch (err) {
            checkbox.checked = !enabled;
            if (err.message !== 'Unauthorized' && err.message !== 'Forbidden') {
                showToast(err.message || 'Unable to toggle maintenance mode', 'error');
            }
        }
    }

    async function handleForceLogoutAll() {
        if (!confirm('Force logout all user sessions across the platform?')) {
            return;
        }

        const btn = document.getElementById('force-logout-btn');
        btn.disabled = true;
        try {
            const response = await apiRequest('/api/admin/security/force-logout-all', {
                method: 'POST'
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.error || 'Failed to execute force logout');
            }
            const affected = data.affectedUsers !== undefined ? ` (${data.affectedUsers} accounts)` : '';
            showToast(`${data.message || 'Global logout executed'}${affected}.`, 'success');
        } catch (err) {
            if (err.message !== 'Unauthorized' && err.message !== 'Forbidden') {
                showToast(err.message || 'Unable to force logout users', 'error');
            }
        } finally {
            btn.disabled = false;
        }
    }

    function bindEvents() {
        document.querySelectorAll('#admin-tab-nav .ft-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => activateSection(btn.dataset.section));
        });

        document.getElementById('edit-admin-btn')?.addEventListener('click', () => setEditMode(true));
        document.getElementById('cancel-admin-edit-btn')?.addEventListener('click', () => setEditMode(false));
        document.getElementById('admin-info-form')?.addEventListener('submit', handleSaveAdminProfile);

        const refreshAll = async () => {
            await Promise.all([loadAdminProfile(), loadSystemStats(), loadAuditLogs()]);
            showToast('System metrics refreshed.', 'info');
        };
        document.getElementById('refresh-admin-btn')?.addEventListener('click', refreshAll);
        document.getElementById('sys-refresh-btn')?.addEventListener('click', refreshAll);

        document.getElementById('maintenance-toggle')?.addEventListener('change', handleToggleMaintenance);

        const triggerSearch = () => {
            const q = document.getElementById('user-search-input')?.value || '';
            loadUsers(q);
        };
        document.getElementById('user-search-btn')?.addEventListener('click', triggerSearch);
        document.getElementById('user-search-input')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                triggerSearch();
            }
        });
        document.getElementById('user-role-filter')?.addEventListener('change', renderUsers);
        document.getElementById('user-reset-btn')?.addEventListener('click', () => {
            const input = document.getElementById('user-search-input');
            const filter = document.getElementById('user-role-filter');
            if (input) input.value = '';
            if (filter) filter.value = 'ALL';
            loadUsers('');
        });

        document.getElementById('admin-password-form')?.addEventListener('submit', handleAdminPasswordChange);
        document.getElementById('force-logout-btn')?.addEventListener('click', handleForceLogoutAll);

        document.getElementById('audit-level-filter')?.addEventListener('change', renderAuditLogs);
        document.getElementById('refresh-logs-btn')?.addEventListener('click', () => {
            loadAuditLogs().then(() => showToast('Audit logs refreshed.', 'info'));
        });

        document.getElementById('close-user-modal')?.addEventListener('click', closeUserModal);
        document.getElementById('user-detail-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'user-detail-modal') closeUserModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeUserModal();
        });

        document.getElementById('admin-logout-btn')?.addEventListener('click', () => {
            if (window.FootballTixLayout) {
                window.FootballTixLayout.logout();
            } else {
                localStorage.removeItem('accessToken');
                window.location.href = 'index.html';
            }
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (!getToken()) {
            window.location.href = 'login.html';
            return;
        }
        if (getStoredRole() && getStoredRole() !== 'ADMIN') {
            window.location.href = 'index.html';
            return;
        }
        activateSection('admin-info');
        bindEvents();
        Promise.all([loadAdminProfile(), loadSystemStats(), loadUsers(''), loadAuditLogs()]);
    });
})();
