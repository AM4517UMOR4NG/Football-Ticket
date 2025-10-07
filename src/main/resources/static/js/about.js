const API_BASE_URL = '/api/about';
document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const signInLink = document.getElementById('sign-in-link');
    const authStatus = document.getElementById('auth-status');
    const teamContainer = document.getElementById('team-container');
    const valuesContainer = document.getElementById('values-container');

    // Counter elements
    const totalEventsEl = document.getElementById('total-events');
    const totalLeaguesEl = document.getElementById('total-leagues');
    const activeLeaguesEl = document.getElementById('active-leagues');
    const teamMembersEl = document.getElementById('team-members');

    // Contact elements
    const contactEmail = document.getElementById('contact-email');
    const contactPhone = document.getElementById('contact-phone');
    const contactAddress = document.getElementById('contact-address');

    // Mission and Vision elements
    const missionText = document.getElementById('mission-text');
    const visionText = document.getElementById('vision-text');

    // FootballTix Team Data with realistic football industry professionals
    const teamMembers = [
        {
            id: 1,
            name: "Joko Bow",
            role: "CEO & Founder",
            avatar: "https://e1.pxfuel.com/desktop-wallpaper/736/959/desktop-wallpaper-anime-cool-naruto-naruto.jpg",
            bio: "Former Premier League executive with 15+ years in sports ticketing. Led digital transformation at major football clubs across Europe.",
            skills: ["Strategic Leadership", "Sports Business", "Digital Innovation", "Partnership Development"],
            experience: "15+ years",
            specialQuote: "Football is not just a game, it's a passion that unites millions.",
            achievements: ["Launched 50+ digital platforms", "Managed €100M+ in ticket sales", "Award Winner - Sports Tech Innovation"],
            social: {
                linkedin: "Joko-Bow-ceo",
                twitter: "jokobow_ft"
            }
        },
        {
            id: 2,
            name: "Pra Joko",
            role: "CTO",
            avatar: "https://i.pinimg.com/564x/1e/bf/62/1ebf621c1fea39cba14ea7369c8bb88e.jpg",
            bio: "Tech visionary who revolutionized ticket booking systems. Former lead engineer at major e-commerce platforms with expertise in scalable architecture.",
            skills: ["System Architecture", "Cloud Computing", "Security", "Team Leadership"],
            experience: "12+ years",
            specialQuote: "Code is poetry, and our platform is our masterpiece.",
            achievements: ["Built systems handling 1M+ concurrent users", "Published 15+ tech papers", "Open Source Contributor"],
            social: {
                github: "PraJoko-cto",
                linkedin: "Pra-Joko"
            }
        },
        {
            id: 3,
            name: "B. J Hgenius",
            role: "Head of Partnerships",
            avatar: "https://i.pinimg.com/736x/e5/bf/f3/e5bff35646c8c6f47561ee04ef9aa6d8.jpg",
            bio: "Football industry veteran with deep connections across major leagues. Secured partnerships with UEFA, Premier League, and top European clubs.",
            skills: ["Partnership Development", "Negotiation", "Relationship Management", "Sports Industry"],
            experience: "10+ years",
            specialQuote: "Every great partnership starts with a shared love for football.",
            achievements: ["Secured 200+ club partnerships", "Generated $50M+ in partnerships", "Industry Speaker"],
            social: {
                linkedin: "hgenius B",
                twitter: "Hgenius_J"
            }
        },
        {
            id: 4,
            name: "Megatron",
            role: "Broken of Hall",
            avatar: "https://i.pinimg.com/originals/a5/3a/fd/a53afd3ce45bf9ef8452b7640526949b.jpg",
            bio: "Customer-first advocate ensuring every fan has an amazing experience. Expert in UX design and customer service optimization.",
            skills: ["Customer Experience", "UX Design", "Data Analysis", "Team Management"],
            experience: "8+ years",
            specialQuote: "Every pixel matters when creating magical fan experiences.",
            achievements: ["Improved satisfaction by 300%", "Designed award-winning interfaces", "Led 50+ person team"],
            social: {
                linkedin: "megatron-designs",
                dribbble: "MegatronDesigns"
            }
        }
    ];

    // Company Values Data with enhanced animations
    const companyValues = [
        {
            icon: "⚽",
            title: "Passion for Football",
            description: "We live and breathe football, understanding what every match means to fans worldwide.",
            color: "from-green-400 to-emerald-600",
            hoverEffect: "hover:shadow-green-500/30"
        },
        {
            icon: "🔒",
            title: "Trust & Security",
            description: "Your security is our priority. Every transaction is protected with bank-level encryption.",
            color: "from-blue-400 to-cyan-600",
            hoverEffect: "hover:shadow-blue-500/30"
        },
        {
            icon: "🌍",
            title: "Global Accessibility",
            description: "Making football accessible to fans everywhere, regardless of location or background.",
            color: "from-purple-400 to-indigo-600",
            hoverEffect: "hover:shadow-purple-500/30"
        },
        {
            icon: "⚡",
            title: "Innovation",
            description: "Constantly improving our platform with cutting-edge technology and user experience.",
            color: "from-yellow-400 to-orange-600",
            hoverEffect: "hover:shadow-yellow-500/30"
        }
    ];

    // Dynamic Statistics (these would normally come from your API)
    const currentStats = {
        totalEvents: 100,
        totalLeagues: 6,
        activeLeagues: null,
        teamMembers: 4
    };

    // Enhanced Authentication State Management
    const isLoggedIn = checkAuthStatus();

    function checkAuthStatus() {
        try {
            const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
            return token !== null;
        } catch {
            return false;
        }
    }

    function getStoredData(key) {
        try {
            return JSON.parse(sessionStorage.getItem(key) || localStorage.getItem(key) || 'null');
        } catch {
            return null;
        }
    }

    function setStoredData(key, value) {
        try {
            if (sessionStorage) {
                sessionStorage.setItem(key, JSON.stringify(value));
            } else if (localStorage) {
                localStorage.setItem(key, JSON.stringify(value));
            }
        } catch (error) {
            console.warn('Storage not available:', error);
        }
    }

    function removeStoredData(key) {
        try {
            if (sessionStorage) sessionStorage.removeItem(key);
            if (localStorage) localStorage.removeItem(key);
        } catch (error) {
            console.warn('Storage not available:', error);
        }
    }

    // Handle Authentication UI with enhanced animations
    if (isLoggedIn) {
        handleLoggedInState();
    } else {
        handleLoggedOutState();
    }

    function handleLoggedInState() {
        if (signInLink) {
            signInLink.style.display = 'none';
        }

        const user = getStoredData('user') || {};

        if (authStatus) {
            authStatus.innerHTML = `
                <div class="flex items-center space-x-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 animate-slide-in-down">
                    <div class="flex items-center space-x-3">
                        <div class="relative">
                            <div class="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center ring-4 ring-white/30 shadow-lg animate-pulse-glow">
                                <span class="text-white text-lg font-bold animate-bounce-gentle">${(user.name || 'U').charAt(0).toUpperCase()}</span>
                            </div>
                            <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center animate-ping-slow">
                                <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                            </div>
                        </div>
                        <div>
                            <div class="text-white font-bold text-lg animate-text-shimmer bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text">Welcome back, ${user.name || 'User'}!</div>
                            <div class="text-blue-200 text-sm flex items-center space-x-1">
                                <span class="animate-pulse">⚽</span>
                                <span>Ready for the next match?</span>
                            </div>
                        </div>
                    </div>
                    <button id="logout-btn" class="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-110 hover:shadow-2xl hover:shadow-red-500/50 active:scale-95 animate-glow-pulse">
                        <span class="flex items-center space-x-2">
                            <span>Sign Out</span>
                            <span class="text-xs">👋</span>
                        </span>
                    </button>
                </div>
            `;

            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', handleLogout);
            }
        }
    }

    function handleLoggedOutState() {
        if (signInLink) {
            signInLink.style.display = 'block';
        }
        if (authStatus) {
            authStatus.innerHTML = `
                <div class="text-center relative">
                    <p class="text-gray-400 text-sm relative z-10 bg-gradient-to-r from-gray-400 via-blue-300 to-gray-400 bg-clip-text animate-text-shimmer">Join thousands of football fans worldwide</p>
                    <div class="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent blur-xl opacity-50 animate-pulse"></div>
                </div>
            `;
        }
    }

    function handleLogout() {
        removeStoredData('authToken');
        removeStoredData('user');

        // Enhanced transition effect with particles
        createLogoutParticles();

        if (authStatus) {
            authStatus.style.transform = 'scale(0.8)';
            authStatus.style.opacity = '0';
            authStatus.style.filter = 'blur(10px)';
            setTimeout(() => {
                window.location.reload();
            }, 600);
        } else {
            window.location.reload();
        }
    }

    // Enhanced particle effects for logout
    function createLogoutParticles() {
        const particles = ['🔥', '🐐', '🔥', '🐐', '🦴'];
        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            particle.textContent = particles[Math.floor(Math.random() * particles.length)];
            particle.style.cssText = `
                position: fixed;
                font-size: 1.5rem;
                pointer-events: none;
                z-index: 1000;
                left: 50%;
                top: 30%;
                transform: translate(-50%, -50%);
                animation: logoutExplode 1s ease-out forwards;
                animation-delay: ${i * 0.1}s;
            `;
            document.body.appendChild(particle);
            setTimeout(() => {
                if (document.body.contains(particle)) {
                    document.body.removeChild(particle);
                }
            }, 1200);
        }
    }

    // Enhanced counter animation with more visual flair
    function animateCounter(element, target, duration = 2000) {
        if (!element) return;

        const start = 0;
        const increment = target / (duration / 16);
        let current = start;

        // Add glowing effect during animation
        element.style.textShadow = '0 0 20px rgba(59, 130, 246, 0.6)';
        element.style.transform = 'scale(1.1)';

        const updateCounter = () => {
            if (current < target) {
                current += increment;
                element.textContent = Math.floor(current).toLocaleString();

                // Add random color pulse during counting
                if (Math.random() > 0.8) {
                    element.style.color = '#10B981';
                    setTimeout(() => {
                        element.style.color = '';
                    }, 100);
                }

                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target.toLocaleString();
                element.style.textShadow = '';
                element.style.transform = 'scale(1)';

                // Final celebration effect
                createCounterCelebration(element);
            }
        };

        updateCounter();
    }

    // Counter celebration effect
    function createCounterCelebration(element) {
        const rect = element.getBoundingClientRect();
        const sparkles = ['✨', '⭐', '💫'];

        for (let i = 0; i < 5; i++) {
            const sparkle = document.createElement('div');
            sparkle.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
            sparkle.style.cssText = `
                position: fixed;
                font-size: 1rem;
                pointer-events: none;
                z-index: 1000;
                left: ${rect.left + Math.random() * rect.width}px;
                top: ${rect.top}px;
                animation: sparkleUp 1.5s ease-out forwards;
            `;
            document.body.appendChild(sparkle);
            setTimeout(() => {
                if (document.body.contains(sparkle)) {
                    document.body.removeChild(sparkle);
                }
            }, 1500);
        }
    }

    // Initialize counters with enhanced staggered animation
    function initializeCounters() {
        setTimeout(() => {
            animateCounter(totalEventsEl, currentStats.totalEvents, 2500);
            createRippleEffect(totalEventsEl);
        }, 300);
        setTimeout(() => {
            animateCounter(totalLeaguesEl, currentStats.totalLeagues, 2000);
            createRippleEffect(totalLeaguesEl);
        }, 600);
        setTimeout(() => {
            animateCounter(activeLeaguesEl, currentStats.activeLeagues, 1800);
            createRippleEffect(activeLeaguesEl);
        }, 900);
        setTimeout(() => {
            animateCounter(teamMembersEl, currentStats.teamMembers, 1500);
            createRippleEffect(teamMembersEl);
        }, 1200);
    }

    // Enhanced ripple effect
    function createRippleEffect(element) {
        if (!element) return;

        const rect = element.getBoundingClientRect();
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: fixed;
            left: ${rect.left + rect.width / 2}px;
            top: ${rect.top + rect.height / 2}px;
            width: 10px;
            height: 10px;
            background: radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 100;
            animation: rippleExpand 1s ease-out forwards;
        `;

        document.body.appendChild(ripple);
        setTimeout(() => {
            if (document.body.contains(ripple)) {
                document.body.removeChild(ripple);
            }
        }, 1000);
    }

    // Enhanced Values Section with more dynamic effects
    function renderValuesSection() {
        if (!valuesContainer) return;

        const valuesHTML = companyValues.map((value, index) => `
            <div class="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transform hover:scale-105 hover:-rotate-1 transition-all duration-500 animate-fade-in-up cursor-pointer overflow-hidden ${value.hoverEffect}" style="animation-delay: ${index * 0.2}s">
                <!-- Background gradient overlay -->
                <div class="absolute inset-0 bg-gradient-to-br ${value.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl"></div>
               
                <!-- Animated background shapes -->
                <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${value.color} rounded-full opacity-5 group-hover:scale-150 group-hover:opacity-20 transition-all duration-700 transform translate-x-8 -translate-y-8"></div>
                <div class="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr ${value.color} rounded-full opacity-5 group-hover:scale-125 group-hover:opacity-15 transition-all duration-700 transform -translate-x-6 translate-y-6"></div>
               
                <div class="text-center relative z-10">
                    <div class="text-6xl mb-6 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 animate-bounce-gentle hover:animate-spin-slow cursor-pointer">${value.icon}</div>
                    <h3 class="text-2xl font-bold text-gray-900 mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:${value.color} group-hover:bg-clip-text transition-all duration-300">${value.title}</h3>
                    <p class="text-gray-600 group-hover:text-gray-700 transition-colors duration-300 leading-relaxed">${value.description}</p>
                </div>
               
                <!-- Hover effect border -->
                <div class="absolute inset-0 border-2 border-transparent group-hover:border-gradient-to-r group-hover:${value.color} rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
               
                <!-- Floating particles on hover -->
                <div class="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                    <div class="absolute top-1/4 left-1/4 w-2 h-2 bg-gradient-to-r ${value.color} rounded-full opacity-0 group-hover:opacity-60 transition-all duration-1000 animate-float-particle-1"></div>
                    <div class="absolute top-3/4 right-1/4 w-1.5 h-1.5 bg-gradient-to-r ${value.color} rounded-full opacity-0 group-hover:opacity-40 transition-all duration-1200 animate-float-particle-2"></div>
                    <div class="absolute top-1/2 right-1/3 w-1 h-1 bg-gradient-to-r ${value.color} rounded-full opacity-0 group-hover:opacity-80 transition-all duration-800 animate-float-particle-3"></div>
                </div>
            </div>
        `).join('');

        valuesContainer.innerHTML = valuesHTML;

        // Add click interaction for each value card
        setTimeout(() => {
            const valueCards = valuesContainer.querySelectorAll('.group');
            valueCards.forEach((card, index) => {
                card.addEventListener('click', () => {
                    createValueCardEffect(card, companyValues[index]);
                });
            });
        }, 100);
    }

    // Enhanced effect when clicking value cards
    function createValueCardEffect(card, value) {
        // Create expanding circle effect
        const rect = card.getBoundingClientRect();
        const circle = document.createElement('div');
        circle.style.cssText = `
            position: fixed;
            left: ${rect.left + rect.width / 2}px;
            top: ${rect.top + rect.height / 2}px;
            width: 20px;
            height: 20px;
            background: linear-gradient(45deg, ${value.color.split(' ')[1]}, ${value.color.split(' ')[3]});
            border-radius: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 1000;
            opacity: 0.3;
            animation: expandCircle 1.5s ease-out forwards;
        `;

        document.body.appendChild(circle);

        // Show floating message
        showFloatingMessage(value.icon + " " + value.title + " activated!", rect);

        setTimeout(() => {
            if (document.body.contains(circle)) {
                document.body.removeChild(circle);
            }
        }, 1500);
    }

    // Floating message effect
    function showFloatingMessage(text, rect) {
        const message = document.createElement('div');
        message.textContent = text;
        message.style.cssText = `
            position: fixed;
            left: ${rect.left + rect.width / 2}px;
            top: ${rect.top - 20}px;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 14px;
            pointer-events: none;
            z-index: 1001;
            animation: floatMessage 2s ease-out forwards;
        `;

        document.body.appendChild(message);
        setTimeout(() => {
            if (document.body.contains(message)) {
                document.body.removeChild(message);
            }
        }, 2000);
    }

    // Enhanced Team Section with more interactive features
    function renderTeamSection() {
        if (!teamContainer) return;

        const teamHTML = teamMembers.map((member, index) => `
            <div id="team-member-${member.id}" class="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 hover:-rotate-1 transition-all duration-500 cursor-pointer overflow-hidden animate-fade-in-up" style="animation-delay: ${index * 0.15}s">
                <!-- Animated background -->
                <div class="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
               
                <!-- Floating orbs -->
                <div class="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-500 rounded-full opacity-0 group-hover:opacity-20 group-hover:animate-bounce-gentle transition-all duration-700"></div>
                <div class="absolute -bottom-4 -left-4 w-8 h-8 bg-gradient-to-br from-green-100 to-blue-500 rounded-full opacity-0 group-hover:opacity-15 group-hover:animate-pulse transition-all duration-700"></div>
               
                <div class="p-8 text-center relative z-10">
                    <div class="relative mb-6">
                        <!-- Enhanced avatar with multiple effects -->
                        <div class="relative inline-block">
                            <img src="${member.avatar}" alt="${member.name}"
                                 class="w-28 h-28 rounded-full mx-auto object-cover border-4 border-blue-500 group-hover:border-purple-500 transition-all duration-500 shadow-xl group-hover:shadow-2xl transform group-hover:scale-110 group-hover:rotate-6"
                                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjE1MCIgY3k9IjEyMCIgcj0iNDAiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTkxIDI0MEM5MSAyMTEuNzIyIDExMy43MjIgMTg5IDE0MiAxODlIMTU4QzE4Ni4yNzggMTg5IDIwOSAyMTEuNzIyIDIwOSAyNDBWMjYwSDkxVjI0MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+Cg=='"
                            >
                            <!-- Animated ring around avatar -->
                            <div class="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-500 group-hover:animate-spin-slow transition-all duration-1000"></div>
                           
                            <!-- Status indicator with pulse -->
                            <div class="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center group-hover:scale-125 transition-transform duration-300">
                                <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                <div class="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
                            </div>
                        </div>
                    </div>
                   
                    <!-- Enhanced name and role -->
                    <h3 class="text-2xl font-bold text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300 transform group-hover:scale-105">${member.name}</h3>
                    <p class="text-blue-600 font-bold mb-3 text-lg group-hover:text-purple-600 transition-colors duration-300">${member.role}</p>
                    <p class="text-sm text-gray-500 mb-4 flex items-center justify-center space-x-1">
                        <span class="animate-pulse">⭐</span>
                        <span>${member.experience} experience</span>
                        <span class="animate-pulse">⭐</span>
                    </p>
                   
                    <!-- Animated bio -->
                    <p class="text-gray-600 text-sm mb-6 line-clamp-3 group-hover:text-gray-700 transition-colors duration-300 leading-relaxed">${member.bio}</p>
                   
                    <!-- Enhanced skills with hover effects -->
                    <div class="flex flex-wrap gap-2 mb-6 justify-center">
                        ${member.skills.slice(0, 2).map((skill, skillIndex) => `
                            <span class="px-3 py-2 text-xs bg-blue-100 text-blue-800 rounded-full font-medium hover:bg-blue-200 hover:scale-105 transition-all duration-300 cursor-pointer animate-bounce-gentle" style="animation-delay: ${skillIndex * 0.1}s">
                                ${skill}
                            </span>
                        `).join('')}
                        ${member.skills.length > 2 ? `
                            <span class="px-3 py-2 text-xs bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 rounded-full font-medium hover:from-gray-200 hover:to-gray-300 hover:scale-105 transition-all duration-300 cursor-pointer">
                                +${member.skills.length - 2} more
                            </span>
                        ` : ''}
                    </div>
                   
                    <!-- Enhanced social links -->
                    <div class="flex justify-center space-x-4 mb-4">
                        ${Object.entries(member.social).map(([platform, handle]) => `
                            <a href="#" class="text-gray-400 hover:text-blue-600 transition-all duration-300 transform hover:scale-125 hover:scale-125 hover:-rotate-12 p-2 rounded-full hover:bg-blue-50 hover:shadow-lg" title="${platform}">
                                ${getSocialIcon(platform)}
                            </a>
                        `).join('')}
                    </div>
                   
                    <!-- Quick stats preview -->
                    <div class="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                        <div class="flex justify-center space-x-4">
                            <span class="flex items-center space-x-1">
                                <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                <span>Online</span>
                            </span>
                            <span class="flex items-center space-x-1">
                                <span class="text-yellow-500">⭐</span>
                                <span>Top Performer</span>
                            </span>
                        </div>
                    </div>
                </div>
               
                <!-- Hover border effect -->
                <div class="absolute inset-0 border-2 border-transparent group-hover:border-gradient-to-r group-hover:from-blue-400 group-hover:via-purple-500 group-hover:to-pink-400 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            </div>
        `).join('');

        teamContainer.innerHTML = teamHTML;

        // Add advanced interactions for team members
        setTimeout(() => {
            teamMembers.forEach(member => {
                const card = document.getElementById(`team-member-${member.id}`);
                if (card) {
                    // Click to show modal
                    card.addEventListener('click', () => showTeamMemberModal(member));

                    // Hover effects with particles
                    card.addEventListener('mouseenter', () => {
                        createHoverParticles(card, member);
                    });

                    // Double click for special effect
                    card.addEventListener('dblclick', () => {
                        createMemberSpotlight(card, member);
                    });
                }
            });
        }, 100);
    }

    // Enhanced hover particles for team members
    function createHoverParticles(card, member) {
        const rect = card.getBoundingClientRect();
        const particles = ['✨', '⭐', '💫', '🌟', '⚡'];

        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.textContent = particles[Math.floor(Math.random() * particles.length)];
                particle.style.cssText = `
                    position: fixed;
                    font-size: 1rem;
                    pointer-events: none;
                    z-index: 100;
                    left: ${rect.left + Math.random() * rect.width}px;
                    top: ${rect.top + Math.random() * rect.height}px;
                    animation: particleDance 2s ease-out forwards;
                    color: hsl(${Math.random() * 360}, 70%, 60%);
                `;
                document.body.appendChild(particle);
                setTimeout(() => {
                    if (document.body.contains(particle)) {
                        document.body.removeChild(particle);
                    }
                }, 2000);
            }, i * 100);
        }
    }

    // Member spotlight effect for double-click
    function createMemberSpotlight(card, member) {
        const spotlight = document.createElement('div');
        const rect = card.getBoundingClientRect();

        spotlight.style.cssText = `
            position: fixed;
            left: ${rect.left}px;
            top: ${rect.top}px;
            width: ${rect.width}px;
            height: ${rect.height}px;
            background: radial-gradient(circle at center, rgba(59, 130, 246, 0.3) 0%, transparent 70%);
            border-radius: 1rem;
            pointer-events: none;
            z-index: 50;
            animation: spotlightPulse 1.5s ease-out forwards;
        `;

        document.body.appendChild(spotlight);

        // Show achievement popup
        showAchievementPopup(member, rect);

        setTimeout(() => {
            if (document.body.contains(spotlight)) {
                document.body.removeChild(spotlight);
            }
        }, 1500);
    }

    // Achievement popup for spotlighted members
    function showAchievementPopup(member, rect) {
        const popup = document.createElement('div');
        popup.innerHTML = `
            <div class="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-2xl animate-bounce-gentle">
                🏆 ${member.achievements[Math.floor(Math.random() * member.achievements.length)]}
            </div>
        `;
        popup.style.cssText = `
            position: fixed;
            left: ${rect.left + rect.width / 2}px;
            top: ${rect.top - 60}px;
            transform: translateX(-50%);
            z-index: 1000;
            animation: achievementSlide 2s ease-out forwards;
        `;

        document.body.appendChild(popup);
        setTimeout(() => {
            if (document.body.contains(popup)) {
                document.body.removeChild(popup);
            }
        }, 2000);
    }

    function getSocialIcon(platform) {
        const icons = {
            github: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clip-rule="evenodd"></path></svg>',
            linkedin: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"></path></svg>',
            twitter: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84"></path></svg>',
            dribbble: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM10 1.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0110 1.475zm-2.508.81c.22.31 1.756 2.433 3.169 4.934-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.727-5.975zm-4.245 7.17c0-.097.008-.193.011-.291.388.006 4.68.062 8.824-1.219.174.381.328.766.457 1.158-.097.027-.207.055-.313.084-4.24 1.37-6.458 5.096-6.458 5.096V9.455z" clip-rule="evenodd"></path></svg>'
        };
        return icons[platform] || '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"></path></svg>';
    }

    // Ultra-Enhanced Team Member Modal with 3D effects
    function showTeamMemberModal(member) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-lg animate-fade-in';
        modal.innerHTML = `
            <div class="bg-white rounded-3xl max-w-md w-full p-0 transform transition-all duration-500 scale-90 shadow-2xl relative overflow-hidden max-h-[80vh] overflow-y-auto" id="modal-content">
                <!-- Animated background patterns -->
                <div class="absolute inset-0 opacity-5">
                    <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 animate-gradient-shift"></div>
                    <div class="absolute top-10 right-10 w-32 h-32 bg-blue-400 rounded-full mix-blend-multiply animate-blob"></div>
                    <div class="absolute top-20 left-20 w-32 h-32 bg-purple-400 rounded-full mix-blend-multiply animate-blob animation-delay-2s"></div>
                    <div class="absolute -bottom-8 left-20 w-32 h-32 bg-pink-400 rounded-full mix-blend-multiply animate-blob animation-delay-4s"></div>
                </div>
               
                <!-- Header with enhanced design -->
                <div class="bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800 rounded-t-3xl p-6 text-white text-center relative overflow-hidden">
                    <!-- Animated background elements -->
                    <div class="absolute inset-0 opacity-20">
                        <div class="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] animate-pulse"></div>
                    </div>
                   
                    <div class="relative z-10">
                        <!-- Enhanced avatar with multiple layers -->
                        <div class="relative inline-block mb-4">
                            <div class="relative">
                                <img src="${member.avatar}" alt="${member.name}" class="w-32 h-32 rounded-full mx-auto object-cover border-4 border-white shadow-2xl transform hover:scale-105 transition-transform duration-300">
                                <!-- Rotating border effect -->
                                <div class="absolute inset-0 rounded-full border-4 border-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 animate-spin-slow opacity-60"></div>
                                <!-- Pulse rings -->
                                <div class="absolute inset-0 rounded-full border-2 border-white opacity-30 animate-ping"></div>
                                <div class="absolute inset-0 rounded-full border-2 border-white opacity-20 animate-ping animation-delay-1s"></div>
                            </div>
                           
                            <!-- Status badges -->
                            <div class="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1 border-2 border-white shadow-lg animate-bounce-gentle">
                                <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                            </div>
                           
                            <!-- Achievement badge -->
                            <div class="absolute -top-2 -left-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-1 border-2 border-white shadow-lg transform rotate-12 hover:rotate-0 transition-transform duration-300">
                                <span class="text-white text-xs font-bold">🏆</span>
                            </div>
                        </div>
                       
                        <!-- Enhanced text with animations -->
                        <h3 class="text-2xl font-bold mb-2 animate-text-shimmer bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text">${member.name}</h3>
                        <p class="text-blue-100 font-bold text-lg mb-2 animate-pulse">${member.role}</p>
                        <p class="text-blue-200 text-xs mb-4 flex items-center justify-center space-x-2">
                            <span class="animate-bounce">⭐</span>
                            <span>${member.experience} in the industry</span>
                            <span class="animate-bounce animation-delay-500ms">⭐</span>
                        </p>
                       
                        <!-- Special quote with typewriter effect -->
                        <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-3 mb-4">
                            <p class="text-blue-100 italic text-xs" id="quote-${member.id}"></p>
                        </div>
                    </div>
                </div>
               
                <!-- Enhanced body content -->
                <div class="p-6 relative">
                    <!-- About section with enhanced styling -->
                    <div class="mb-6">
                        <h4 class="text-xl font-bold text-gray-900 mb-3 flex items-center space-x-2">
                            <span class="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <span class="text-white text-xs">👤</span>
                            </span>
                            <span>About</span>
                        </h4>
                        <p class="text-gray-600 leading-relaxed text-base hyphens-auto break-words">${member.bio}</p>
                    </div>
                   
                    <!-- Achievements section -->
                    <div class="mb-6">
                        <h4 class="text-xl font-bold text-gray-900 mb-3 flex items-center space-x-2">
                            <span class="w-5 h-5 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
                                <span class="text-white text-xs">🏆</span>
                            </span>
                            <span>Key Achievements</span>
                        </h4>
                        <div class="space-y-2">
                            ${member.achievements.map((achievement, index) => `
                                <div class="flex items-center space-x-2 p-2 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl hover:from-yellow-100 hover:to-orange-100 transition-all duration-300 transform hover:scale-102 animate-slide-in-left" style="animation-delay: ${index * 0.1}s">
                                    <div class="w-6 h-6 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span class="text-white text-xs font-bold">${index + 1}</span>
                                    </div>
                                    <span class="text-gray-700 font-medium text-sm hyphens-auto break-words">${achievement}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                   
                    <!-- Enhanced expertise section -->
                    <div class="mb-6">
                        <h4 class="text-xl font-bold text-gray-900 mb-3 flex items-center space-x-2">
                            <span class="w-5 h-5 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                                <span class="text-white text-xs">⚡</span>
                            </span>
                            <span>Expertise</span>
                        </h4>
                        <div class="flex flex-wrap gap-2">
                            ${member.skills.map((skill, index) => `
                                <span class="px-3 py-2 text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full font-bold hover:from-blue-200 hover:to-purple-200 hover:scale-110 transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg animate-bounce-gentle" style="animation-delay: ${index * 0.1}s">
                                    ${skill}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                   
                    <!-- Enhanced social connections -->
                    <div class="mb-6">
                        <h4 class="text-xl font-bold text-gray-900 mb-3 flex items-center space-x-2">
                            <span class="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                                <span class="text-white text-xs">🌐</span>
                            </span>
                            <span>Connect</span>
                        </h4>
                        <div class="flex flex-wrap gap-3">
                            ${Object.entries(member.social).map(([platform, handle], index) => `
                                <a href="#" class="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-all duration-300 p-3 rounded-2xl hover:bg-blue-50 hover:shadow-lg transform hover:scale-105 hover:-rotate-2 border-2 border-transparent hover:border-blue-200 animate-slide-in-up" style="animation-delay: ${index * 0.1}s">
                                    <div class="p-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-300">
                                        ${getSocialIcon(platform)}
                                    </div>
                                    <div>
                                        <div class="font-bold text-gray-900 capitalize text-sm">${platform}</div>
                                        <div class="text-xs text-gray-500 hyphens-auto break-words">${handle}</div>
                                    </div>
                                </a>
                            `).join('')}
                        </div>
                    </div>
                   
                    <!-- Enhanced close button -->
                    <div class="text-center">
                        <button id="close-modal" class="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white py-3 px-6 rounded-2xl font-bold text-base transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 active:scale-95 relative overflow-hidden">
                            <span class="relative z-10">Close Profile</span>
                            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Animate modal in with enhanced effects
        setTimeout(() => {
            document.getElementById('modal-content').style.transform = 'scale(1) rotateY(0deg)';
        }, 10);

        // Typewriter effect for the quote
        setTimeout(() => {
            typeWriterEffect(`quote-${member.id}`, member.specialQuote, 50);
        }, 800);

        // Enhanced close modal handlers
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeEnhancedModal(modal);
            }
        });

        document.getElementById('close-modal').addEventListener('click', () => {
            closeEnhancedModal(modal);
        });

        // Escape key to close with animation
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeEnhancedModal(modal);
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);

        // Add particle effects around modal
        createModalParticles(modal);
    }

    // Typewriter effect for quotes
    function typeWriterEffect(elementId, text, speed = 50) {
        const element = document.getElementById(elementId);
        if (!element) return;

        let i = 0;
        element.textContent = '';

        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                element.classList.add('animate-pulse');
            }
        }

        type();
    }

    // Enhanced modal closing with smooth animations
    function closeEnhancedModal(modal) {
        const modalContent = document.getElementById('modal-content');
        modal.style.opacity = '0';
        modalContent.style.transform = 'scale(0.8) rotateY(-15deg)';
        modalContent.style.filter = 'blur(5px)';

        setTimeout(() => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
        }, 400);
    }

    // Create magical particles around modal
    function createModalParticles(modal) {
        const particles = ['✨', '⭐', '💫', '🌟', '⚡', '💎', '🔮'];

        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.textContent = particles[Math.floor(Math.random() * particles.length)];
                particle.style.cssText = `
                    position: fixed;
                    font-size: ${0.8 + Math.random() * 0.8}rem;
                    pointer-events: none;
                    z-index: 40;
                    left: ${20 + Math.random() * (window.innerWidth - 40)}px;
                    top: ${20 + Math.random() * (window.innerHeight - 40)}px;
                    animation: modalParticleDance 4s ease-out infinite;
                    color: hsl(${Math.random() * 360}, 70%, 60%);
                    animation-delay: ${Math.random() * 2}s;
                `;
                document.body.appendChild(particle);

                setTimeout(() => {
                    if (document.body.contains(particle)) {
                        document.body.removeChild(particle);
                    }
                }, 4000);
            }, i * 200);
        }
    }

    function closeModal(modal) {
        modal.style.opacity = '0';
        document.getElementById('modal-content').style.transform = 'scale(0.95)';
        setTimeout(() => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
        }, 300);
    }

    // Enhanced Contact Information with interactive animations
    function enhanceContactSection() {
        if (contactEmail) {
            contactEmail.innerHTML = `
                <a href="mailto:support@footballtix.com" class="group text-blue-600 hover:text-blue-800 transition-all duration-300 font-bold text-lg relative inline-block">
                    <span class="relative z-10">support@footballtix.com</span>
                    <div class="absolute inset-0 bg-blue-100 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-lg -z-10"></div>
                    <div class="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span class="text-xs animate-bounce">📧</span>
                    </div>
                </a>
            `;
        }

        if (contactPhone) {
            contactPhone.innerHTML = `
                <a href="tel:+441234567890" class="group text-green-600 hover:text-green-800 transition-all duration-300 font-bold text-lg relative inline-block">
                    <span class="relative z-10">+44 123 456 7890</span>
                    <div class="absolute inset-0 bg-green-100 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-lg -z-10"></div>
                    <div class="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span class="text-xs animate-pulse">📞</span>
                    </div>
                </a>
            `;
        }

        if (contactAddress) {
            contactAddress.innerHTML = `
                <a href="https://maps.google.com/?q=123+Stadium+Street,+London,+UK" target="_blank" class="group text-purple-600 hover:text-purple-800 transition-all duration-300 font-bold text-lg relative inline-block">
                    <span class="relative z-10">123 Stadium Street, London, UK</span>
                    <div class="absolute inset-0 bg-purple-100 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-lg -z-10"></div>
                    <div class="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span class="text-xs animate-spin-slow">🌍</span>
                    </div>
                </a>
            `;
        }
    }

    // Enhanced Mission and Vision with animated text effects
    function enhanceMissionVision() {
        if (missionText) {
            const mission = "To revolutionize football ticketing by providing seamless, secure, and accessible booking experiences that bring fans closer to the beautiful game they love.";
            missionText.innerHTML = `
                <span class="text-lg leading-relaxed bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent font-medium">
                    ${mission}
                </span>
            `;

            // Add text reveal animation
            setTimeout(() => {
                missionText.classList.add('animate-text-reveal');
            }, 500);
        }

        if (visionText) {
            const vision = "To become the world's most trusted football ticketing platform, connecting millions of passionate fans with unforgettable match experiences across every major league and tournament.";
            visionText.innerHTML = `
                <span class="text-lg leading-relaxed bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 bg-clip-text text-transparent font-medium">
                    ${vision}
                </span>
            `;

            // Add delayed text reveal animation
            setTimeout(() => {
                visionText.classList.add('animate-text-reveal');
            }, 800);
        }
    }

    // Enhanced Intersection Observer for scroll animations
    function initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in-up');

                    // Add special effects for different sections
                    if (entry.target.classList.contains('values-section')) {
                        createSectionSparkles(entry.target);
                    }

                    if (entry.target.classList.contains('team-section')) {
                        createTeamSectionEffect(entry.target);
                    }

                    // Trigger counter animations when stats section comes into view
                    if (entry.target.id === 'total-events' || entry.target.closest('.hero-pattern')) {
                        initializeCounters();
                    }

                    // Unobserve after animation to prevent repeated triggers
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements with animation class
        document.querySelectorAll('.animate-on-scroll, #total-events, .values-section, .team-section').forEach(el => {
            observer.observe(el);
        });
    }

    // Create sparkles when sections come into view
    function createSectionSparkles(section) {
        const rect = section.getBoundingClientRect();
        const sparkles = ['✨', '⭐', '💫', '🌟'];

        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const sparkle = document.createElement('div');
                sparkle.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
                sparkle.style.cssText = `
                    position: fixed;
                    font-size: 1.2rem;
                    pointer-events: none;
                    z-index: 10;
                    left: ${rect.left + Math.random() * rect.width}px;
                    top: ${rect.top + rect.height + window.scrollY}px;
                    animation: sectionSparkle 3s ease-out forwards;
                    color: hsl(${Math.random() * 360}, 70%, 60%);
                `;
                document.body.appendChild(sparkle);
                setTimeout(() => {
                    if (document.body.contains(sparkle)) {
                        document.body.removeChild(sparkle);
                    }
                }, 3000);
            }, i * 100);
        }
    }

    // Enhanced team section entrance effect
    function createTeamSectionEffect(section) {
        const teamCards = section.querySelectorAll('[id^="team-member-"]');
        teamCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.transform = 'translateY(0) scale(1) rotateY(0)';
                card.style.opacity = '1';
                createCardEntryParticles(card);
            }, index * 200);
        });
    }

    // Particles for team card entries
    function createCardEntryParticles(card) {
        const rect = card.getBoundingClientRect();
        const particles = ['⚽', '🏆', '⭐', '🎯'];

        for (let i = 0; i < 6; i++) {
            const particle = document.createElement('div');
            particle.textContent = particles[Math.floor(Math.random() * particles.length)];
            particle.style.cssText = `
                position: fixed;
                font-size: 1rem;
                pointer-events: none;
                z-index: 10;
                left: ${rect.left + rect.width / 2}px;
                top: ${rect.top + rect.height / 2}px;
                animation: cardEntryParticle 2s ease-out forwards;
                animation-delay: ${i * 0.1}s;
            `;
            document.body.appendChild(particle);
            setTimeout(() => {
                if (document.body.contains(particle)) {
                    document.body.removeChild(particle);
                }
            }, 2100);
        }
    }

    // Theme Management with smooth transitions
    function applyThemePreference() {
        const savedTheme = getStoredData('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.documentElement.classList.add('dark');
            createThemeTransitionEffect('dark');
        } else {
            document.documentElement.classList.remove('dark');
            createThemeTransitionEffect('light');
        }
    }

    // Theme transition effect
    function createThemeTransitionEffect(theme) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: ${theme === 'dark' ? '#000' : '#fff'};
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
        `;

        document.body.appendChild(overlay);

        setTimeout(() => {
            overlay.style.opacity = '0.1';
            setTimeout(() => {
                overlay.style.opacity = '0';
                setTimeout(() => {
                    if (document.body.contains(overlay)) {
                        document.body.removeChild(overlay);
                    }
                }, 300);
            }, 100);
        }, 10);
    }

    // Enhanced CSS animations and effects
    function addAdvancedAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            /* Enhanced base animations */
            @keyframes float {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(-10px) rotate(5deg); }
            }
           
            @keyframes bounce-gentle {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-5px); }
            }
           
            @keyframes pulse-glow {
                0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.3); }
                50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.6), 0 0 30px rgba(59, 130, 246, 0.4); }
            }
           
            @keyframes text-shimmer {
                0% { background-position: -200% center; }
                100% { background-position: 200% center; }
            }
           
            @keyframes spin-slow {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
           
            @keyframes ping-slow {
                0% { transform: scale(1); opacity: 1; }
                75%, 100% { transform: scale(2); opacity: 0; }
            }
           
            @keyframes glow-pulse {
                0%, 100% { box-shadow: 0 0 5px rgba(239, 68, 68, 0.5); }
                50% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.8), 0 0 30px rgba(239, 68, 68, 0.6); }
            }
           
            /* New advanced animations */
            @keyframes gradient-shift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
           
            @keyframes blob {
                0% { transform: translate(0px, 0px) scale(1); }
                33% { transform: translate(30px, -50px) scale(1.1); }
                66% { transform: translate(-20px, 20px) scale(0.9); }
                100% { transform: translate(0px, 0px) scale(1); }
            }
           
            @keyframes slide-in-down {
                from {
                    opacity: 0;
                    transform: translateY(-100%);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
           
            @keyframes slide-in-left {
                from {
                    opacity: 0;
                    transform: translateX(-100%);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
           
            @keyframes slide-in-up {
                from {
                    opacity: 0;
                    transform: translateY(100%);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
           
            @keyframes text-reveal {
                from {
                    clip-path: inset(0 100% 0 0);
                }
                to {
                    clip-path: inset(0 0 0 0);
                }
            }
           
            @keyframes rippleExpand {
                0% {
                    transform: translate(-50%, -50%) scale(0);
                    opacity: 1;
                }
                100% {
                    transform: translate(-50%, -50%) scale(4);
                    opacity: 0;
                }
            }
           
            @keyframes sparkleUp {
                0% {
                    transform: translateY(0) rotate(0deg);
                    opacity: 1;
                }
                100% {
                    transform: translateY(-100px) rotate(180deg);
                    opacity: 0;
                }
            }
           
            @keyframes logoutExplode {
                0% {
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 1;
                }
                100% {
                    transform: translate(-50%, -50%) translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px) scale(0);
                    opacity: 0;
                }
            }
           
            @keyframes particleDance {
                0% {
                    transform: translateY(0) rotate(0deg) scale(1);
                    opacity: 0;
                }
                20% {
                    opacity: 1;
                }
                80% {
                    opacity: 1;
                }
                100% {
                    transform: translateY(-50px) rotate(360deg) scale(0);
                    opacity: 0;
                }
            }
           
            @keyframes modalParticleDance {
                0%, 100% {
                    transform: translateY(0) rotate(0deg);
                    opacity: 0.7;
                }
                25% {
                    transform: translateY(-20px) rotate(90deg);
                    opacity: 1;
                }
                50% {
                    transform: translateY(-10px) rotate(180deg);
                    opacity: 0.8;
                }
                75% {
                    transform: translateY(-15px) rotate(270deg);
                    opacity: 1;
                }
            }
           
            @keyframes expandCircle {
                0% {
                    transform: translate(-50%, -50%) scale(0);
                    opacity: 0.8;
                }
                100% {
                    transform: translate(-50%, -50%) scale(10);
                    opacity: 0;
                }
            }
           
            @keyframes floatMessage {
                0% {
                    opacity: 0;
                    transform: translateX(-50%) translateY(20px);
                }
                20% {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
                80% {
                    opacity: 1;
                    transform: translateX(-50%) translateY(-10px);
                }
                100% {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-30px);
                }
            }
           
            @keyframes achievementSlide {
                0% {
                    opacity: 0;
                    transform: translateX(-50%) translateY(20px) scale(0.8);
                }
                20% {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0) scale(1);
                }
                80% {
                    opacity: 1;
                    transform: translateX(-50%) translateY(-5px) scale(1);
                }
                100% {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-20px) scale(0.8);
                }
            }
           
            @keyframes spotlightPulse {
                0% {
                    opacity: 0;
                    transform: scale(0.8);
                }
                50% {
                    opacity: 1;
                    transform: scale(1.1);
                }
                100% {
                    opacity: 0;
                    transform: scale(1.2);
                }
            }
           
            @keyframes sectionSparkle {
                0% {
                    opacity: 0;
                    transform: translateY(20px) scale(0);
                }
                20% {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
                80% {
                    opacity: 1;
                    transform: translateY(-100px) scale(1.2);
                }
                100% {
                    opacity: 0;
                    transform: translateY(-150px) scale(0);
                }
            }
           
            @keyframes cardEntryParticle {
                0% {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0);
                }
                20% {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
                100% {
                    opacity: 0;
                    transform: translate(-50%, -50%) translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) scale(0);
                }
            }
           
            @keyframes float-particle-1 {
                0%, 100% { transform: translate(0, 0); }
                33% { transform: translate(20px, -10px); }
                66% { transform: translate(-15px, 10px); }
            }
           
            @keyframes float-particle-2 {
                0%, 100% { transform: translate(0, 0) rotate(0deg); }
                50% { transform: translate(-20px, -20px) rotate(180deg); }
            }
           
            @keyframes float-particle-3 {
                0%, 100% { transform: translate(0, 0); }
                25% { transform: translate(15px, -15px); }
                75% { transform: translate(-10px, 15px); }
            }
           
            @keyframes fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
            }
           
            @keyframes fade-in-up {
                from {
                    opacity: 0;
                    transform: translateY(40px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
           
            /* Utility classes */
            .animate-float { animation: float 3s ease-in-out infinite; }
            .animate-bounce-gentle { animation: bounce-gentle 2s ease-in-out infinite; }
            .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
            .animate-text-shimmer {
                background: linear-gradient(90deg, currentColor, transparent, currentColor);
                background-size: 200% 100%;
                animation: text-shimmer 2s ease-in-out infinite;
            }
            .animate-spin-slow { animation: spin-slow 3s linear infinite; }
            .animate-ping-slow { animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
            .animate-glow-pulse { animation: glow-pulse 2s ease-in-out infinite; }
            .animate-gradient-shift {
                background-size: 200% 200%;
                animation: gradient-shift 3s ease infinite;
            }
            .animate-blob { animation: blob 7s ease-in-out infinite; }
            .animate-slide-in-down { animation: slide-in-down 0.5s ease-out; }
            .animate-slide-in-left { animation: slide-in-left 0.5s ease-out; }
            .animate-slide-in-up { animation: slide-in-up 0.5s ease-out; }
            .animate-text-reveal { animation: text-reveal 1s ease-out; }
            .animate-fade-in { animation: fade-in 0.5s ease-out; }
            .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
            .animate-float-particle-1 { animation: float-particle-1 4s ease-in-out infinite; }
            .animate-float-particle-2 { animation: float-particle-2 5s ease-in-out infinite; }
            .animate-float-particle-3 { animation: float-particle-3 3s ease-in-out infinite; }
           
            /* Animation delays */
            .animation-delay-500ms { animation-delay: 0.5s; }
            .animation-delay-1s { animation-delay: 1s; }
            .animation-delay-2s { animation-delay: 2s; }
            .animation-delay-4s { animation-delay: 4s; }
           
            /* Hover and interaction effects */
            .line-clamp-3 {
                display: -webkit-box;
                -webkit-line-clamp: 3;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }
           
            .hover-glow:hover {
                box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
            }
           
            .scale-102:hover {
                transform: scale(1.02);
            }
           
            /* Background patterns */
            .hero-pattern {
                background-image:
                    radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0);
                background-size: 20px 20px;
            }
           
            /* Glass morphism effects */
            .glass {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
           
            .glass-dark {
                background: rgba(0, 0, 0, 0.1);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
           
            /* Enhanced focus styles */
            *:focus-visible {
                outline: 2px solid rgba(59, 130, 246, 0.8);
                outline-offset: 2px;
                border-radius: 4px;
            }
           
            /* Smooth scrolling */
            html {
                scroll-behavior: smooth;
            }
           
            /* Selection styling */
            ::selection {
                background: rgba(59, 130, 246, 0.3);
                color: inherit;
            }
        `;
        document.head.appendChild(style);
    }

    // Fun easter eggs with enhanced effects
    function addFootballEasterEggs() {
        let clickCount = 0;
        const easterEggMessages = [
            "⚽ GOOOOOAL! You found our hidden feature!",
            "🏆 Like a true football detective!",
            "⭐ You're our MVP fan!",
            "🎯 Perfect shot! Right on target!",
            "🔥 You're on fire like Messi!",
            "⚡ Faster than Mbappé!",
            "🌟 Champions League level discovery!",
            "🎪 You've got the magic touch!"
        ];

        // Enhanced click counter with visual feedback
        const title = document.querySelector('h1');
        if (title) {
            title.style.cursor = 'pointer';
            title.style.transition = 'all 0.3s ease';

            title.addEventListener('click', () => {
                clickCount++;

                // Visual feedback for each click
                title.style.transform = `scale(1.05) rotate(${clickCount * 2}deg)`;
                title.style.color = `hsl(${clickCount * 60}, 70%, 50%)`;

                setTimeout(() => {
                    title.style.transform = 'scale(1) rotate(0deg)';
                    title.style.color = '';
                }, 200);

                if (clickCount === 5) {
                    showEnhancedEasterEggModal(easterEggMessages[Math.floor(Math.random() * easterEggMessages.length)]);
                    clickCount = 0;
                }

                // Create click particles
                createClickParticles(title);
            });
        }

        // Enhanced Konami code with visual feedback
        let konamiCode = [];
        const konamiSequence = [
            'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
            'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
            'KeyB', 'KeyA'
        ];

        document.addEventListener('keydown', (e) => {
            konamiCode.push(e.code);

            // Show key press indicator
            showKeyPressIndicator(e.code);

            if (konamiCode.length > konamiSequence.length) {
                konamiCode.shift();
            }

            if (konamiCode.length === konamiSequence.length &&
                konamiCode.every((key, index) => key === konamiSequence[index])) {
                activateEnhancedSuperFanMode();
                konamiCode = [];
            }
        });

        // Secret double-tap easter egg
        let lastTap = 0;
        document.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;

            if (tapLength < 500 && tapLength > 0) {
                if (e.target.classList.contains('easter-egg-trigger')) {
                    activateTouchEasterEgg(e.target);
                }
            }
            lastTap = currentTime;
        });
    }

    // Enhanced click particles
    function createClickParticles(element) {
        const rect = element.getBoundingClientRect();
        const particles = ['⚽', '🏆', '⭐', '🎯', '🔥', '⚡'];

        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.textContent = particles[Math.floor(Math.random() * particles.length)];
            particle.style.cssText = `
                position: fixed;
                font-size: 1.5rem;
                pointer-events: none;
                z-index: 1000;
                left: ${rect.left + rect.width / 2}px;
                top: ${rect.top + rect.height / 2}px;
                animation: clickParticleExplode 1s ease-out forwards;
                animation-delay: ${i * 0.05}s;
            `;
            document.body.appendChild(particle);
            setTimeout(() => {
                if (document.body.contains(particle)) {
                    document.body.removeChild(particle);
                }
            }, 1000);
        }

        // Add click particle explosion animation
        const explosionStyle = document.createElement('style');
        explosionStyle.textContent = `
            @keyframes clickParticleExplode {
                0% {
                    transform: translate(-50%, -50%) scale(0);
                    opacity: 1;
                }
                50% {
                    transform: translate(-50%, -50%) translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) scale(1.2);
                    opacity: 1;
                }
                100% {
                    transform: translate(-50%, -50%) translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px) scale(0);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(explosionStyle);
        setTimeout(() => {
            if (document.head.contains(explosionStyle)) {
                document.head.removeChild(explosionStyle);
            }
        }, 1000);
    }

    // Visual feedback for key presses
    function showKeyPressIndicator(keyCode) {
        const indicator = document.createElement('div');
        indicator.textContent = keyCode.replace('Arrow', '').replace('Key', '');
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 8px 12px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            z-index: 1000;
            animation: keyIndicator 1s ease-out forwards;
        `;

        document.body.appendChild(indicator);
        setTimeout(() => {
            if (document.body.contains(indicator)) {
                document.body.removeChild(indicator);
            }
        }, 1000);

        // Add key indicator animation
        const keyStyle = document.createElement('style');
        keyStyle.textContent = `
            @keyframes keyIndicator {
                0% {
                    opacity: 0;
                    transform: translateY(-20px) scale(0.8);
                }
                20% {
                    opacity: 1;
                    transform: translateY(0) scale(1.1);
                }
                80% {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
                100% {
                    opacity: 0;
                    transform: translateY(20px) scale(0.8);
                }
            }
        `;
        document.head.appendChild(keyStyle);
        setTimeout(() => {
            if (document.head.contains(keyStyle)) {
                document.head.removeChild(keyStyle);
            }
        }, 1000);
    }

    // Enhanced easter egg modal with 3D effects
    function showEnhancedEasterEggModal(message) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-md';
        modal.innerHTML = `
            <div class="relative max-w-md transform transition-all duration-500 scale-75" id="easter-egg-modal">
                <!-- Animated background -->
                <div class="absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 rounded-3xl animate-gradient-shift opacity-90 blur-sm"></div>
                <div class="absolute inset-0 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 rounded-3xl animate-gradient-shift opacity-70 blur-md animation-delay-1s"></div>
               
                <!-- Content -->
                <div class="relative bg-white rounded-3xl p-8 text-center shadow-2xl border-4 border-white">
                    <!-- Floating particles -->
                    <div class="absolute inset-0 overflow-hidden rounded-3xl">
                        <div class="absolute top-4 left-4 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                        <div class="absolute top-8 right-8 w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div class="absolute bottom-6 left-8 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <div class="absolute bottom-4 right-4 w-3 h-3 bg-purple-500 rounded-full animate-spin"></div>
                    </div>
                   
                    <div class="relative z-10">
                        <div class="text-8xl mb-6 animate-bounce-gentle">🎉</div>
                        <h3 class="text-3xl font-bold mb-6 bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">${message}</h3>
                        <p class="text-gray-600 mb-8 text-lg">You've unlocked a special FootballTix surprise!</p>
                        <button id="close-easter-egg" class="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-110 hover:shadow-2xl active:scale-95">
                            <span class="flex items-center space-x-2" id="easter-button-text">
                                <span>Awesome!</span>
                                <span class="text-2xl animate-spin-slow">⚽</span>
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Enhanced entrance animation
        setTimeout(() => {
            document.getElementById('easter-egg-modal').style.transform = 'scale(1) rotateY(0deg)';
        }, 10);

        // Create celebration particles
        createCelebrationParticles(modal);

        // Event listeners
        document.getElementById('close-easter-egg').addEventListener('click', () => {
            closeModal(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });

        // Auto close after 8 seconds with countdown
        let countdown = 8;
        const countdownSpan = document.createElement('span');
        countdownSpan.id = 'easter-countdown';
        countdownSpan.textContent = ` (${countdown})`;
        document.querySelector('#easter-button-text > span:first-child').appendChild(countdownSpan);

        const countdownInterval = setInterval(() => {
            countdown--;
            countdownSpan.textContent = ` (${countdown})`;
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                closeModal(modal);
            }
        }, 1000);
    }

    // Celebration particles for easter egg
    function createCelebrationParticles(modal) {
        const particles = ['🎉', '🏆', '⚽', '⭐', '💥', '🌟', '🎊'];
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.textContent = particles[Math.floor(Math.random() * particles.length)];
            particle.style.cssText = `
                position: absolute;
                font-size: 1.5rem;
                pointer-events: none;
                z-index: 100;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                animation: logoutExplode 2s ease-out forwards;
                animation-delay: ${i * 0.05}s;
            `;
            modal.appendChild(particle);
            setTimeout(() => {
                if (modal.contains(particle)) {
                    modal.removeChild(particle);
                }
            }, 2000);
        }
    }

    // Activate super fan mode for Konami code
    function activateEnhancedSuperFanMode() {
        // Example: Change body background to football theme and show message
        document.body.style.backgroundImage = "url('https://example.com/football-background.jpg')";
        document.body.style.backgroundSize = "cover";
        const message = document.createElement('div');
        message.textContent = "Super Fan Mode Activated! ⚽🏆";
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-size: 24px;
            z-index: 1000;
            animation: floatMessage 3s ease-out forwards;
        `;
        document.body.appendChild(message);
        setTimeout(() => {
            if (document.body.contains(message)) {
                document.body.removeChild(message);
            }
            // Reset background after 10 seconds
            setTimeout(() => {
                document.body.style.backgroundImage = "";
            }, 10000);
        }, 3000);
    }

    // Activate touch easter egg
    function activateTouchEasterEgg(target) {
        // Example: Shake the element and show particles
        target.style.animation = 'bounce-gentle 0.5s ease-in-out';
        setTimeout(() => {
            target.style.animation = '';
        }, 500);
        createClickParticles(target);
        showFloatingMessage("Double Tap Magic! ✨", target.getBoundingClientRect());
    }

    // Initialize all enhancements
    renderValuesSection();
    renderTeamSection();
    enhanceContactSection();
    enhanceMissionVision();
    initScrollAnimations();
    applyThemePreference();
    addAdvancedAnimations();
    addFootballEasterEggs();
});