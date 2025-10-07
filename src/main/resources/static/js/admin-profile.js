// Admin Profile Page JavaScript

document.addEventListener('DOMContentLoaded', function () {
    // Check authentication first
    const token = localStorage.getItem('accessToken');
    const userRole = localStorage.getItem('userRole');

    if (!token || userRole !== 'ADMIN') {
        // Redirect to login if not authenticated as admin
        window.location.href = 'login.html';
        return;
    }

    // Update navigation
    updateNavigation();

    // Initialize admin profile functionality
    initializeAdminProfile();

    // Initialize system management
    initializeSystemManagement();

    // Initialize user management
    initializeUserManagement();

    // Initialize security settings
    initializeSecuritySettings();

    // Initialize audit logs
    initializeAuditLogs();
});

// Update navigation
function updateNavigation() {
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) logoutLink.classList.remove('hidden');
}

// Initialize Admin Profile Page
function initializeAdminProfile() {
    // Load admin data from API
    loadAdminData();

    // Initialize statistics
    loadSystemStats();

    // Initialize real-time monitoring
    initializeRealTimeMonitoring();
}

// Load admin data from API
async function loadAdminData() {
    try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/admin/profile', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                // Token expired or invalid
                localStorage.removeItem('accessToken');
                localStorage.removeItem('userData');
                localStorage.removeItem('userRole');
                window.location.href = 'login.html';
                return;
            }
            throw new Error('Failed to load admin data');
        }

        const adminData = await response.json();
        populateAdminData(adminData);

    } catch (error) {
        console.error('Error loading admin data:', error);
        showNotification('Failed to load admin data. Using demo data.', 'warning');
        // Use demo data as fallback
        populateAdminData({
            id: 1,
            username: 'admin',
            email: 'admin@footballtix.com',
            fullName: 'Admin User',
            role: 'ADMIN',
            phone: '+1 (555) 987-6543',
            address: '123 Admin Street, Tech City, TC 12345',
            department: 'IT Management',
            employeeId: 'ADM001',
            emergencyContact: 'Emergency Contact',
            emergencyPhone: '+1 (555) 123-4567',
            workSchedule: 'Monday-Friday, 9AM-5PM',
            officeLocation: 'Main Office, Floor 3',
            notes: 'Primary system administrator with full access to all system features.',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    }
}

// Populate admin data in form fields
function populateAdminData(adminData) {
    // Update admin header
    const adminName = document.getElementById('admin-name');
    const adminEmail = document.getElementById('admin-email');

    // Use real admin data
    const displayName = adminData.fullName && adminData.fullName.trim() !== '' ? adminData.fullName : (adminData.username || 'Admin');
    if (adminName) adminName.textContent = displayName;
    if (adminEmail) adminEmail.textContent = adminData.email || '';

    // Populate form fields with real data
    const firstNameInput = document.getElementById('admin-first-name');
    const lastNameInput = document.getElementById('admin-last-name');
    const emailInput = document.getElementById('admin-email-input');
    const phoneInput = document.getElementById('admin-phone');
    const roleInput = document.getElementById('admin-role');
    const departmentInput = document.getElementById('admin-department');
    const addressInput = document.getElementById('admin-address');

    // Split fullName for first and last name
    let firstName = '', lastName = '';
    if (adminData.fullName && adminData.fullName.trim() !== '') {
        const names = adminData.fullName.split(' ');
        firstName = names[0] || '';
        lastName = names.slice(1).join(' ') || '';
    } else if (adminData.username) {
        firstName = adminData.username;
        lastName = '';
    }

    if (firstNameInput) firstNameInput.value = firstName;
    if (lastNameInput) lastNameInput.value = lastName;
    if (emailInput) emailInput.value = adminData.email || '';
    if (phoneInput) phoneInput.value = adminData.phone || '';
    if (roleInput) roleInput.value = adminData.role || 'System Administrator';
    if (departmentInput) departmentInput.value = adminData.department || 'IT Management';
    if (addressInput) addressInput.value = adminData.address || '';

    // Populate additional admin fields
    const employeeIdInput = document.getElementById('admin-employee-id');
    const emergencyContactInput = document.getElementById('admin-emergency-contact');
    const emergencyPhoneInput = document.getElementById('admin-emergency-phone');
    const workScheduleInput = document.getElementById('admin-work-schedule');
    const officeLocationInput = document.getElementById('admin-office-location');
    const notesInput = document.getElementById('admin-notes');

    if (employeeIdInput) employeeIdInput.value = adminData.employeeId || 'ADM001';
    if (emergencyContactInput) emergencyContactInput.value = adminData.emergencyContact || 'Emergency Contact';
    if (emergencyPhoneInput) emergencyPhoneInput.value = adminData.emergencyPhone || '+1 (555) 123-4567';
    if (workScheduleInput) workScheduleInput.value = adminData.workSchedule || 'Monday-Friday, 9AM-5PM';
    if (officeLocationInput) officeLocationInput.value = adminData.officeLocation || 'Main Office, Floor 3';
    if (notesInput) notesInput.value = adminData.notes || 'Primary system administrator with full access to all system features.';
}

// Load system statistics from API
async function loadSystemStats() {
    try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/admin/stats', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load system statistics');
        }

        const stats = await response.json();
        updateSystemStatistics(stats);

    } catch (error) {
        console.error('Error loading system statistics:', error);
        showNotification('Failed to load system statistics. Using demo data.', 'warning');
        // Use demo data as fallback
        updateSystemStatistics({
            totalUsers: 1247,
            activeEvents: 23,
            totalRevenue: 45250.00,
            systemStatus: 'Online'
        });
    }
}

// Update system statistics with real data
function updateSystemStatistics(stats) {
    const totalUsersElement = document.getElementById('total-users');
    const activeEventsElement = document.getElementById('active-events');
    const totalRevenueElement = document.getElementById('total-revenue');
    const systemStatusElement = document.getElementById('system-status');

    if (totalUsersElement) totalUsersElement.textContent = stats.totalUsers?.toLocaleString() || '0';
    if (activeEventsElement) activeEventsElement.textContent = stats.activeEvents?.toString() || '0';
    if (totalRevenueElement) totalRevenueElement.textContent = `$${stats.totalRevenue?.toLocaleString() || '0'}`;
    if (systemStatusElement) systemStatusElement.textContent = stats.systemStatus || 'Online';
}

// Initialize real-time monitoring
function initializeRealTimeMonitoring() {
    // Simulate real-time updates
    setInterval(() => {
        updateSystemStatus();
    }, 5000);
}

// Update system status
function updateSystemStatus() {
    // This would fetch real system status from API
    console.log('System status updated');
}

// Initialize system management
function initializeSystemManagement() {
    // Add event listeners for system controls
    const maintenanceToggle = document.querySelector('input[type="checkbox"]');
    if (maintenanceToggle) {
        maintenanceToggle.addEventListener('change', function () {
            toggleMaintenanceMode(this.checked);
        });
    }
}

// Toggle maintenance mode
async function toggleMaintenanceMode(enabled) {
    try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/admin/system/maintenance', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ enabled: enabled })
        });

        if (!response.ok) {
            throw new Error('Failed to toggle maintenance mode');
        }

        showNotification(`Maintenance mode ${enabled ? 'enabled' : 'disabled'}`, 'success');

    } catch (error) {
        console.error('Error toggling maintenance mode:', error);
        showNotification('Failed to toggle maintenance mode', 'error');
    }
}

// Initialize user management
function initializeUserManagement() {
    // Add event listeners for user management buttons
    const searchButton = document.querySelector('#user-management button');
    if (searchButton) {
        searchButton.addEventListener('click', function () {
            searchUsers();
        });
    }
}

// Search users
async function searchUsers() {
    try {
        const searchInput = document.querySelector('#user-management input[type="text"]');
        const query = searchInput ? searchInput.value : '';

        const token = localStorage.getItem('accessToken');
        const response = await fetch(`/api/admin/users/search?q=${encodeURIComponent(query)}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to search users');
        }

        const users = await response.json();
        updateUserList(users);
        showNotification(`Found ${users.length} users`, 'success');

    } catch (error) {
        console.error('Error searching users:', error);
        showNotification('Failed to search users', 'error');
    }
}

// Update user list display
function updateUserList(users) {
    const userListContainer = document.querySelector('#user-management .space-y-4');
    if (!userListContainer) return;

    userListContainer.innerHTML = '';

    users.forEach(user => {
        const userCard = document.createElement('div');
        userCard.className = 'flex items-center justify-between p-4 bg-gray-50 rounded-lg';
        userCard.innerHTML = `
            <div>
                <h4 class="font-medium text-gray-900">${user.fullName || user.username}</h4>
                <p class="text-sm text-gray-600">${user.email}</p>
                <p class="text-xs text-gray-500">Member since ${new Date(user.createdAt).toLocaleDateString()}</p>
                <span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">${user.role}</span>
            </div>
            <div class="flex space-x-2">
                <button class="text-blue-600 hover:text-blue-700 text-sm font-medium" onclick="viewUser(${user.id})">View</button>
                <button class="text-orange-600 hover:text-orange-700 text-sm font-medium" onclick="editUser(${user.id})">Edit</button>
                <button class="text-red-600 hover:text-red-700 text-sm font-medium" onclick="suspendUser(${user.id})">Suspend</button>
            </div>
        `;
        userListContainer.appendChild(userCard);
    });
}

// Initialize security settings
function initializeSecuritySettings() {
    // Add event listeners for security settings
    const forceLogoutButton = document.querySelector('#security-settings button');
    if (forceLogoutButton) {
        forceLogoutButton.addEventListener('click', function () {
            forceLogoutAll();
        });
    }
}

// Force logout all users
async function forceLogoutAll() {
    if (!confirm('Are you sure you want to force logout all users?')) {
        return;
    }

    try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/admin/security/force-logout-all', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to force logout all users');
        }

        showNotification('All users have been logged out', 'success');

    } catch (error) {
        console.error('Error forcing logout:', error);
        showNotification('Failed to force logout all users', 'error');
    }
}

// Initialize audit logs
function initializeAuditLogs() {
    // Load audit logs
    loadAuditLogs();
}

// Load audit logs
async function loadAuditLogs() {
    try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/admin/audit-logs', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load audit logs');
        }

        const logs = await response.json();
        updateAuditLogs(logs);

    } catch (error) {
        console.error('Error loading audit logs:', error);
        showNotification('Failed to load audit logs', 'error');
    }
}

// Update audit logs display
function updateAuditLogs(logs) {
    const logsContainer = document.querySelector('#audit-logs .space-y-4');
    if (!logsContainer) return;

    logsContainer.innerHTML = '';

    logs.forEach(log => {
        const logCard = document.createElement('div');
        const levelClass = log.level === 'ERROR' ? 'bg-red-50 border-red-200' :
            log.level === 'WARNING' ? 'bg-yellow-50 border-yellow-200' :
                log.level === 'INFO' ? 'bg-green-50 border-green-200' :
                    'bg-blue-50 border-blue-200';
        const textClass = log.level === 'ERROR' ? 'text-red-900 text-red-700 text-red-600' :
            log.level === 'WARNING' ? 'text-yellow-900 text-yellow-700 text-yellow-600' :
                log.level === 'INFO' ? 'text-green-900 text-green-700 text-green-600' :
                    'text-blue-900 text-blue-700 text-blue-600';
        const badgeClass = log.level === 'ERROR' ? 'bg-red-100 text-red-800' :
            log.level === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                log.level === 'INFO' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800';

        logCard.className = `flex items-center justify-between p-4 ${levelClass} border rounded-lg`;
        logCard.innerHTML = `
            <div>
                <h4 class="font-medium ${textClass.split(' ')[0]}">${log.message}</h4>
                <p class="text-sm ${textClass.split(' ')[1]}">IP: ${log.ip} • User: ${log.user}</p>
                <p class="text-xs ${textClass.split(' ')[2]}">${new Date(log.timestamp).toLocaleString()}</p>
            </div>
            <span class="${badgeClass} px-2 py-1 rounded-full text-xs font-medium">${log.level}</span>
        `;
        logsContainer.appendChild(logCard);
    });
}

// Edit admin information
function editAdminInfo() {
    const inputs = document.querySelectorAll('#admin-info input[disabled]');
    const editBtn = document.querySelector('#admin-info .edit-btn');
    const saveBtn = document.getElementById('admin-save-btn');
    const cancelBtn = document.getElementById('admin-cancel-btn');

    inputs.forEach(input => input.disabled = false);
    if (editBtn) editBtn.classList.add('hidden');
    if (saveBtn) saveBtn.classList.remove('hidden');
    if (cancelBtn) cancelBtn.classList.remove('hidden');
}

// Save admin profile changes
async function saveAdminProfile() {
    try {
        const firstNameInput = document.getElementById('admin-first-name');
        const lastNameInput = document.getElementById('admin-last-name');
        const emailInput = document.getElementById('admin-email-input');
        const phoneInput = document.getElementById('admin-phone');
        const departmentInput = document.getElementById('admin-department');
        const addressInput = document.getElementById('admin-address');

        const updateData = {
            fullName: `${firstNameInput.value} ${lastNameInput.value}`.trim(),
            email: emailInput.value,
            phone: phoneInput.value,
            department: departmentInput.value,
            address: addressInput.value,
            emergencyContact: document.getElementById('admin-emergency-contact')?.value,
            emergencyPhone: document.getElementById('admin-emergency-phone')?.value,
            workSchedule: document.getElementById('admin-work-schedule')?.value,
            officeLocation: document.getElementById('admin-office-location')?.value,
            notes: document.getElementById('admin-notes')?.value
        };

        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/admin/profile', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (!response.ok) {
            throw new Error('Failed to update admin profile');
        }

        const updatedAdminData = await response.json();
        populateAdminData(updatedAdminData);

        // Disable inputs and hide save/cancel buttons
        const inputs = document.querySelectorAll('#admin-info input');
        const editBtn = document.querySelector('#admin-info .edit-btn');
        const saveBtn = document.getElementById('admin-save-btn');
        const cancelBtn = document.getElementById('admin-cancel-btn');

        inputs.forEach(input => input.disabled = true);
        if (editBtn) editBtn.classList.remove('hidden');
        if (saveBtn) saveBtn.classList.add('hidden');
        if (cancelBtn) cancelBtn.classList.add('hidden');

        showNotification('Admin profile updated successfully', 'success');

    } catch (error) {
        console.error('Error updating admin profile:', error);
        showNotification('Failed to update admin profile', 'error');
    }
}

// Cancel admin edit
function cancelAdminEdit() {
    const inputs = document.querySelectorAll('#admin-info input');
    const editBtn = document.querySelector('#admin-info .edit-btn');
    const saveBtn = document.getElementById('admin-save-btn');
    const cancelBtn = document.getElementById('admin-cancel-btn');

    inputs.forEach(input => input.disabled = true);
    if (editBtn) editBtn.classList.remove('hidden');
    if (saveBtn) saveBtn.classList.add('hidden');
    if (cancelBtn) cancelBtn.classList.add('hidden');

    // Reload admin data to reset form
    loadAdminData();
}

// Show specific section
function showSection(sectionId) {
    const sections = document.querySelectorAll('.profile-section');
    const sidebarButtons = document.querySelectorAll('.sidebar button');

    // Hide all sections
    sections.forEach(section => section.classList.add('hidden'));

    // Remove active class from all buttons
    sidebarButtons.forEach(button => button.classList.remove('bg-orange-100', 'text-orange-700'));

    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }

    // Add active class to clicked button
    const clickedButton = document.querySelector(`[onclick="showSection('${sectionId}')"]`);
    if (clickedButton) {
        clickedButton.classList.add('bg-orange-100', 'text-orange-700');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${type === 'error' ? 'bg-red-600' :
            type === 'success' ? 'bg-green-600' :
                type === 'warning' ? 'bg-yellow-600' :
                    'bg-blue-600'
        } text-white`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Track event for analytics
function trackEvent(eventName, eventData = {}) {
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventData);
    }
    if (typeof window.analytics !== 'undefined') {
        window.analytics.track(eventName, eventData);
    }
}

// Handle logout function
function handleLogout() {
    // Clear authentication data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('userRole');

    // Redirect to login page
    window.location.href = 'login.html';
}

// User management functions
function viewUser(userId) {
    showNotification(`Viewing user ${userId}`, 'info');
    // Implement user view functionality
}

function editUser(userId) {
    showNotification(`Editing user ${userId}`, 'info');
    // Implement user edit functionality
}

function suspendUser(userId) {
    if (confirm('Are you sure you want to suspend this user?')) {
        showNotification(`User ${userId} suspended`, 'success');
        // Implement user suspension functionality
    }
}

// Make functions globally available
window.handleLogout = handleLogout;
window.saveAdminProfile = saveAdminProfile;
window.viewUser = viewUser;
window.editUser = editUser;
window.suspendUser = suspendUser; 