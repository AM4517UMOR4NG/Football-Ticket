// Animasi football
const footballContainer = document.querySelector('.football-animation');
for (let i = 0; i < 4; i++) {
    const football = document.createElement('div');
    football.classList.add('football');
    footballContainer.appendChild(football);
}

// Sidebar (toolbar) toggle logic
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const openSidebarBtn = document.getElementById('openSidebarBtn');
const closeSidebarBtn = document.getElementById('closeSidebarBtn');

function openSidebar() {
    sidebar.classList.remove('-translate-x-full');
    sidebarOverlay.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    openSidebarBtn.classList.add('hidden');
}

function closeSidebar() {
    sidebar.classList.add('-translate-x-full');
    sidebarOverlay.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    openSidebarBtn.classList.remove('hidden');
}

openSidebarBtn.addEventListener('click', openSidebar);
closeSidebarBtn.addEventListener('click', closeSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);

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

// Fungsi scroll tetap berjalan (tidak ada kode yang menghalangi scroll)