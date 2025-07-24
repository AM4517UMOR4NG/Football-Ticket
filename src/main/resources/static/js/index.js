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

document.addEventListener('DOMContentLoaded', function() {
    const userRole = localStorage.getItem('userRole');
    if (userRole && userRole.toUpperCase() === 'ADMIN') {
        const adminLink = document.getElementById('adminDashboardLink');
        if (adminLink) adminLink.style.display = '';
    }
});

const newsList = [
  { id: 1, title: 'Ronaldo Cetak Hattrick, Al Nassr Menang Besar!', summary: 'Cristiano Ronaldo kembali mencetak hattrick di Liga Arab.', content: 'Cristiano Ronaldo tampil gemilang dengan mencetak tiga gol saat Al Nassr mengalahkan lawannya 5-1 di Liga Arab. Ini adalah hattrick ke-60 sepanjang kariernya.' },
  { id: 2, title: 'Timnas Indonesia Lolos ke Final Piala Asia U-23', summary: 'Garuda Muda melaju ke final setelah menang dramatis adu penalti.', content: 'Timnas Indonesia U-23 berhasil melaju ke final Piala Asia U-23 setelah menyingkirkan Jepang lewat adu penalti. Ini menjadi sejarah baru bagi sepak bola Indonesia.' },
  { id: 3, title: 'Messi Resmi Pindah ke Inter Miami', summary: 'Lionel Messi resmi bergabung dengan klub MLS Inter Miami.', content: 'Setelah berkarier di Eropa, Lionel Messi akhirnya memilih berpetualang di Amerika Serikat bersama Inter Miami. Kontrak berdurasi 2 tahun dengan opsi perpanjangan.' },
  { id: 4, title: 'Erling Haaland Pecahkan Rekor Gol Liga Inggris', summary: 'Striker Norwegia itu kini menjadi top skor sepanjang masa EPL.', content: 'Erling Haaland mencetak gol ke-37 musim ini, memecahkan rekor gol terbanyak dalam satu musim Liga Inggris.' },
  { id: 5, title: 'Persija Jakarta Juara Liga 1 Indonesia', summary: 'Persija mengalahkan Persib di final dramatis.', content: 'Persija Jakarta berhasil menjadi juara Liga 1 Indonesia setelah mengalahkan Persib Bandung 2-1 di final yang menegangkan.' },
  { id: 6, title: 'Piala Dunia 2026 Akan Digelar di 3 Negara', summary: 'FIFA resmi umumkan tuan rumah Piala Dunia 2026.', content: 'Piala Dunia 2026 akan digelar di Amerika Serikat, Kanada, dan Meksiko. Ini pertama kalinya tiga negara menjadi tuan rumah bersama.' },
  { id: 7, title: 'Kylian Mbappé Bertahan di PSG', summary: 'Mbappé tolak Real Madrid, perpanjang kontrak di Paris.', content: 'Kylian Mbappé resmi memperpanjang kontrak di PSG hingga 2027, menolak tawaran besar dari Real Madrid.' },
  { id: 8, title: 'Arema FC Bangkit dari Zona Degradasi', summary: 'Arema FC menang beruntun dan keluar dari zona merah.', content: 'Arema FC meraih tiga kemenangan beruntun dan kini keluar dari zona degradasi Liga 1.' },
  { id: 9, title: 'Juventus Dihukum Pengurangan Poin', summary: 'Kasus finansial membuat Juventus kehilangan 10 poin.', content: 'Juventus terkena sanksi pengurangan 10 poin oleh FIGC akibat pelanggaran finansial, membuat mereka terlempar dari zona Liga Champions.' },
  { id: 10, title: 'Bayern Munchen Pecat Pelatih di Tengah Musim', summary: 'Keputusan mengejutkan dari manajemen Bayern.', content: 'Bayern Munchen memecat pelatih utama mereka setelah serangkaian hasil buruk, dan menunjuk asisten pelatih sebagai caretaker.' },
  { id: 11, title: 'Chelsea Borong Pemain Muda di Bursa Transfer', summary: 'Chelsea aktif di bursa transfer musim panas.', content: 'Chelsea mendatangkan lima pemain muda berbakat dari berbagai negara untuk memperkuat skuad musim depan.' },
  { id: 12, title: 'Timnas Wanita Indonesia Lolos ke Piala Asia', summary: 'Prestasi membanggakan dari timnas wanita.', content: 'Timnas sepak bola wanita Indonesia berhasil lolos ke Piala Asia Wanita untuk pertama kalinya dalam sejarah.' },
  { id: 13, title: 'VAR Kembali Jadi Kontroversi di Liga Champions', summary: 'Keputusan VAR menuai protes dari pemain dan pelatih.', content: 'Pertandingan semifinal Liga Champions diwarnai kontroversi setelah VAR menganulir gol kemenangan di menit akhir.' },
  { id: 14, title: 'PSSI Umumkan Liga 1 Musim Baru Dimulai Juli', summary: 'Jadwal resmi Liga 1 Indonesia diumumkan.', content: 'PSSI mengumumkan Liga 1 musim baru akan dimulai pada Juli dengan format baru dan jadwal yang lebih padat.' },
  { id: 15, title: 'Cristiano Ronaldo Raih Ballon d’Or ke-6', summary: 'Ronaldo kembali jadi pemain terbaik dunia.', content: 'Cristiano Ronaldo meraih Ballon d’Or keenamnya setelah tampil luar biasa bersama Al Nassr dan timnas Portugal.' }
];

function renderNewsBoard() {
  const newsBoard = document.getElementById('newsBoard');
  if (!newsBoard) return;
  newsBoard.innerHTML = newsList.map(news =>
    `<li><a href="berita.html" class="block bg-blue-900 bg-opacity-30 hover:bg-blue-700 hover:bg-opacity-40 text-white rounded-lg px-4 py-3 transition-all duration-200 shadow-md cursor-pointer font-semibold" data-id="${news.id}">${news.title}</a></li>`
  ).join('');
  newsBoard.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', function(e) {
      localStorage.setItem('selectedNewsId', this.getAttribute('data-id'));
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {
  renderNewsBoard();
});
// Fungsi scroll tetap berjalan (tidak ada kode yang menghalangi scroll)

// Quote inspiratif sepak bola
const footballQuotes = [
  '“The more difficult the victory, the greater the happiness in winning.” – Pelé',
  '“You have to fight to reach your dream. You have to sacrifice and work hard for it.” – Lionel Messi',
  '“Success is no accident. It is hard work, perseverance, learning, studying, sacrifice and most of all, love of what you are doing.” – Pelé',
  '“Talent without working hard is nothing.” – Cristiano Ronaldo',
  '“Football is simple, but it is difficult to play simple.” – Johan Cruyff',
  '“I learned all about life with a ball at my feet.” – Ronaldinho',
  '“The ball is round, the game lasts ninety minutes, and everything else is just theory.” – Sepp Herberger',
  '“In football, the worst blindness is only seeing the ball.” – Nelson Falcão Rodrigues',
  '“Every disadvantage has its advantage.” – Johan Cruyff',
  '“If you do not believe you can do it then you have no chance at all.” – Arsène Wenger'
];
function renderFootballQuote() {
  const quote = footballQuotes[Math.floor(Math.random() * footballQuotes.length)];
  document.getElementById('footballQuote').textContent = quote;
}

// Countdown event terdekat (dummy)
const events = [
  { name: 'Final Liga 1', date: new Date(new Date().getFullYear(), 6, 15, 19, 0, 0) },
  { name: 'Piala Dunia 2026', date: new Date(2026, 5, 8, 20, 0, 0) },
  { name: 'Friendly Match: Indonesia vs Malaysia', date: new Date(new Date().getFullYear(), 7, 1, 18, 30, 0) }
];
function renderEventCountdown() {
  const now = new Date();
  const nextEvent = events.filter(e => e.date > now).sort((a, b) => a.date - b.date)[0];
  if (!nextEvent) {
    document.getElementById('eventCountdown').textContent = 'Tidak ada event terdekat.';
    return;
  }
  function updateCountdown() {
    const now = new Date();
    const diff = nextEvent.date - now;
    if (diff <= 0) {
      document.getElementById('eventCountdown').textContent = 'Event sedang berlangsung!';
      return;
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    document.getElementById('eventCountdown').textContent = `${nextEvent.name} dimulai dalam ${days} hari ${hours} jam ${minutes} menit ${seconds} detik`;
    setTimeout(updateCountdown, 1000);
  }
  updateCountdown();
}

// Fun fact sepak bola
const footballFacts = [
  'Piala Dunia pertama digelar di Uruguay pada tahun 1930.',
  'Cristiano Ronaldo adalah pemain pertama yang mencetak gol di lima edisi Piala Dunia.',
  'Gol tercepat di dunia dicetak hanya dalam waktu 2,4 detik.',
  'Timnas Indonesia pernah tampil di Piala Dunia 1938 dengan nama Hindia Belanda.',
  'Lionel Messi memegang rekor Ballon d’Or terbanyak sepanjang sejarah.',
  'Klub dengan gelar Liga Champions terbanyak adalah Real Madrid.',
  'Wasit pertama kali menggunakan kartu kuning dan merah di Piala Dunia 1970.',
  'Sepak bola adalah olahraga paling populer di dunia.',
  'Pertandingan sepak bola terlama berlangsung selama 169 jam.',
  'Piala Dunia Wanita pertama digelar pada tahun 1991.'
];
function renderFootballFact() {
  const fact = footballFacts[Math.floor(Math.random() * footballFacts.length)];
  document.getElementById('footballFact').textContent = fact;
}

// Polling sederhana
const pollingOptions = [
  { id: 'persija', name: 'Persija Jakarta' },
  { id: 'persib', name: 'Persib Bandung' },
  { id: 'arema', name: 'Arema FC' },
  { id: 'bali', name: 'Bali United' }
];
function renderPolling() {
  const container = document.getElementById('pollingOptions');
  const resultDiv = document.getElementById('pollingResult');
  if (!container) return;
  let votes = JSON.parse(localStorage.getItem('pollingVotes') || '{}');
  function updateResult() {
    const total = Object.values(votes).reduce((a, b) => a + b, 0) || 1;
    resultDiv.innerHTML = pollingOptions.map(opt => {
      const percent = Math.round(((votes[opt.id] || 0) / total) * 100);
      return `<span class="inline-block mr-4">${opt.name}: <span class="font-bold">${percent}%</span></span>`;
    }).join('');
  }
  container.innerHTML = pollingOptions.map(opt =>
    `<button class="px-4 py-2 bg-blue-700 hover:bg-blue-900 text-white rounded-lg font-semibold transition-all duration-200" data-id="${opt.id}">${opt.name}</button>`
  ).join('');
  container.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      votes[id] = (votes[id] || 0) + 1;
      localStorage.setItem('pollingVotes', JSON.stringify(votes));
      updateResult();
    });
  });
  updateResult();
}

document.addEventListener('DOMContentLoaded', function() {
  renderFootballQuote();
  renderEventCountdown();
  renderFootballFact();
  renderPolling();
});