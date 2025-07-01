const sidebar = document.getElementById('sidebar');
const openSidebarBtn = document.getElementById('openSidebarBtn');
const closeSidebarBtn = document.getElementById('closeSidebarBtn');
const sidebarOverlay = document.getElementById('sidebarOverlay');

function isDesktop() {
    return window.innerWidth >= 1024;
}

let sidebarOpen = false;

function openSidebar() {
    sidebar.classList.remove('-translate-x-full');
    if (!isDesktop()) {
        sidebarOverlay.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
    } else {
        sidebarOverlay.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    }
    if (openSidebarBtn) openSidebarBtn.classList.add('hidden');
    sidebarOpen = true;
}
function closeSidebar() {
    sidebar.classList.add('-translate-x-full');
    sidebarOverlay.classList.add('hidden');
    if (openSidebarBtn) openSidebarBtn.classList.remove('hidden');
    sidebarOpen = false;
    document.body.classList.remove('overflow-hidden');
}

function setSidebarState() {
    if (sidebarOpen) {
        openSidebar();
    } else {
        closeSidebar();
    }
}

// Initial state: sidebar tertutup
closeSidebar();

if (openSidebarBtn) {
    openSidebarBtn.addEventListener('click', openSidebar);
}
if (closeSidebarBtn) {
    closeSidebarBtn.addEventListener('click', closeSidebar);
}
if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebar);
}
window.addEventListener('resize', () => {
    setSidebarState();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebarOpen) {
        closeSidebar();
    }
});

// Tambahkan animasi football
const footballContainer = document.querySelector('.football-animation');
for (let i = 0; i < 4; i++) {
    const football = document.createElement('div');
    football.classList.add('football');
    footballContainer.appendChild(football);
}

// Cek autentikasi
const token = localStorage.getItem('accessToken');
const userId = localStorage.getItem('userId');

if (!token || !userId) {
    window.location.href = 'login.html';
}

document.getElementById('logoutLink').addEventListener('click', () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    window.location.href = 'login.html';
});