/**
 * AdvancedHowItWorks.js - Ultra Modern & Sophisticated Version
 * 
 * Features:
 * ✨ Advanced animations with GSAP-like timing
 * 🎨 Dynamic theme switching with smooth transitions
 * 🔮 Particle effects and ambient animations
 * 🎯 Smart intersection observers with predictive loading
 * 🌊 Fluid parallax with momentum physics
 * 🎪 Advanced micro-interactions
 * 🎵 Sound effects (optional)
 * 📱 Advanced responsive behaviors
 * 🧠 AI-powered content suggestions
 * 🌈 Dynamic color morphing
 */

class AdvancedHowItWorks {
    constructor() {
        this.state = {
            theme: 'auto',
            soundEnabled: false,
            animationSpeed: 1,
            reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            currentStep: 0,
            scrollVelocity: 0,
            lastScrollTop: 0,
            particles: [],
            mousePosition: { x: 0, y: 0 },
            touchPoints: new Map(),
            performanceMode: this.detectPerformanceMode()
        };

        this.modules = new Map();
        this.eventBus = new EventTarget();
        this.animationQueue = [];
        this.intersectionObservers = new Map();
        
        this.init();
    }

    async init() {
        await this.waitForDOMReady();
        
        // Initialize core modules
        await this.initializeModules();
        
        // Setup advanced event handling
        this.setupAdvancedEventHandlers();
        
        // Initialize performance monitoring
        this.initPerformanceMonitoring();
        
        // Start ambient animations
        this.startAmbientAnimations();
        
        // Initialize AI features
        this.initAIFeatures();
        
        console.log('🚀 AdvancedHowItWorks initialized successfully!');
    }

    async initializeModules() {
        const modules = [
            { name: 'navigation', fn: () => this.initAdvancedNavigation() },
            { name: 'animations', fn: () => this.initSmartAnimations() },
            { name: 'interactions', fn: () => this.initAdvancedInteractions() },
            { name: 'particles', fn: () => this.initParticleSystem() },
            { name: 'parallax', fn: () => this.initFluidParallax() },
            { name: 'audio', fn: () => this.initAudioSystem() },
            { name: 'theme', fn: () => this.initDynamicTheme() },
            { name: 'gestures', fn: () => this.initAdvancedGestures() }
        ];

        for (const module of modules) {
            try {
                await module.fn();
                this.modules.set(module.name, { loaded: true, timestamp: Date.now() });
            } catch (error) {
                console.warn(`Module ${module.name} failed to load:`, error);
                this.modules.set(module.name, { loaded: false, error });
            }
        }
    }

    /* ==================== ADVANCED NAVIGATION ==================== */
    
    async initAdvancedNavigation() {
        const nav = document.querySelector('nav');
        if (!nav) return;

        // Smart navigation with morphing background
        this.createSmartNavbar(nav);
        
        // Advanced user menu with animations
        await this.createAdvancedUserMenu();
        
        // Breadcrumb system
        this.initDynamicBreadcrumbs();
        
        // Navigation shortcuts
        this.initNavigationShortcuts();
    }

    createSmartNavbar(nav) {
        // Add glassmorphism and smart hiding
        nav.style.cssText += `
            backdrop-filter: blur(20px) saturate(180%);
            background: rgba(255, 255, 255, 0.8);
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
            transform-origin: top;
        `;

        let lastScroll = 0;
        let navVisible = true;

        window.addEventListener('scroll', this.throttle(() => {
            const currentScroll = window.pageYOffset;
            const scrollDelta = currentScroll - lastScroll;
            
            // Smart hiding based on scroll direction and velocity
            if (Math.abs(scrollDelta) > 5) {
                if (scrollDelta > 0 && currentScroll > 100 && navVisible) {
                    // Hide nav
                    nav.style.transform = 'translateY(-100%) scaleY(0.8)';
                    nav.style.opacity = '0';
                    navVisible = false;
                } else if (scrollDelta < 0 && !navVisible) {
                    // Show nav
                    nav.style.transform = 'translateY(0) scaleY(1)';
                    nav.style.opacity = '1';
                    navVisible = true;
                }
            }

            // Dynamic blur intensity based on scroll
            const blurIntensity = Math.min(25, currentScroll / 10);
            nav.style.backdropFilter = `blur(${blurIntensity}px) saturate(${180 + currentScroll / 20}%)`;

            lastScroll = currentScroll;
        }, 16));
    }

    async createAdvancedUserMenu() {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const username = localStorage.getItem('username');
        const userRole = localStorage.getItem('userRole');
        const nav = document.querySelector('nav');
        
        if (!nav || nav.querySelector('#advanced-user-menu')) return;

        // Add to nav
        const navContainer = nav.querySelector('.nav-right') || nav.querySelector('.flex');
        if (navContainer) {
            navContainer.insertAdjacentHTML('beforeend', userMenuHTML);
            this.initUserMenuInteractions();
            this.addUserMenuStyles();
        }
    }

    getInitials(name) {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'U';
    }

    getUserStatus() {
        // Simulate user status
        const statuses = ['online', 'away', 'busy'];
        return statuses[Math.floor(Math.random() * statuses.length)];
    }

    getAdminMenuItems() {
        return `
            <div class="menu-section">
                <span class="menu-section-title">Admin</span>
                <a href="admin-dashboard.html" class="menu-item">
                    <svg viewBox="0 0 20 20" fill="currentColor">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                    </svg>
                    Dashboard
                </a>
                <a href="admin-profile.html" class="menu-item">
                    <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd"/>
                    </svg>
                    Admin Profile
                </a>
            </div>
        `;
    }

    getStandardMenuItems() {
        return `
            <div class="menu-section">
                <span class="menu-section-title">Account</span>
                <a href="profile.html" class="menu-item">
                    <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                    </svg>
                    Profile
                </a>
                <a href="settings.html" class="menu-item">
                    <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
                    </svg>
                    Settings
                </a>
            </div>
        `;
    }

    initUserMenuInteractions() {
        const trigger = document.getElementById('user-menu-trigger');
        const dropdown = document.getElementById('user-dropdown-advanced');
        const logoutBtn = document.getElementById('advanced-logout');

        if (!trigger || !dropdown) return;

        // Advanced dropdown with spring animation
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = dropdown.classList.contains('active');
            
            if (isOpen) {
                this.closeUserMenu();
            } else {
                this.openUserMenu();
            }
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!trigger.contains(e.target) && !dropdown.contains(e.target)) {
                this.closeUserMenu();
            }
        });

        // Logout handler
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleAdvancedLogout();
            });
        }

        // Keyboard navigation
        dropdown.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeUserMenu();
                trigger.focus();
            }
        });
    }

    openUserMenu() {
        const dropdown = document.getElementById('user-dropdown-advanced');
        const trigger = document.getElementById('user-menu-trigger');
        
        if (!dropdown || !trigger) return;

        dropdown.classList.add('active');
        trigger.setAttribute('aria-expanded', 'true');
        
        // Spring animation
        this.animate(dropdown, {
            from: { opacity: 0, scale: 0.8, translateY: '-10px' },
            to: { opacity: 1, scale: 1, translateY: '0px' },
            duration: 400,
            easing: 'spring(1, 80, 10, 0)'
        });

        // Focus first menu item
        setTimeout(() => {
            const firstMenuItem = dropdown.querySelector('.menu-item');
            firstMenuItem?.focus();
        }, 200);
    }

    closeUserMenu() {
        const dropdown = document.getElementById('user-dropdown-advanced');
        const trigger = document.getElementById('user-menu-trigger');
        
        if (!dropdown || !trigger) return;

        this.animate(dropdown, {
            from: { opacity: 1, scale: 1, translateY: '0px' },
            to: { opacity: 0, scale: 0.95, translateY: '-5px' },
            duration: 200,
            easing: 'ease-out',
            complete: () => {
                dropdown.classList.remove('active');
                trigger.setAttribute('aria-expanded', 'false');
            }
        });
    }

    async handleAdvancedLogout() {
        // Show confirmation with smooth animation
        const confirmed = await this.showConfirmDialog({
            title: 'Sign Out',
            message: 'Are you sure you want to sign out?',
            confirmText: 'Sign Out',
            cancelText: 'Cancel'
        });

        if (confirmed) {
            // Animate logout process
            this.showLoadingSpinner('Signing out...');
            
            // Clear storage
            ['accessToken', 'userId', 'username', 'userRole'].forEach(key => {
                localStorage.removeItem(key);
            });

            // Smooth redirect
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }
    }

    /* ==================== SMART ANIMATIONS ==================== */
    
    initSmartAnimations() {
        // Create advanced intersection observer with predictive loading
        this.createSmartObserver();
        
        // Initialize morphing animations
        this.initMorphingElements();
        
        // Setup scroll-triggered animations
        this.initScrollAnimations();
        
        // Magnetic effects
        this.initMagneticElements();
    }

    createSmartObserver() {
        const observerOptions = {
            threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
            rootMargin: '50px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const element = entry.target;
                const ratio = entry.intersectionRatio;
                
                if (ratio > 0.1 && !element.classList.contains('animated')) {
                    this.triggerSmartAnimation(element);
                }
                
                // Parallax based on intersection ratio
                if (element.dataset.parallax) {
                    const intensity = parseFloat(element.dataset.parallax) || 0.5;
                    const offset = (0.5 - ratio) * intensity * 100;
                    element.style.transform = `translateY(${offset}px)`;
                }
            });
        }, observerOptions);

        // Observe elements with smart selectors
        document.querySelectorAll(`
            .step-container,
            .grid > div,
            .space-y-6 > div,
            [data-animate],
            .card,
            .feature-item
        `).forEach(el => observer.observe(el));

        this.intersectionObservers.set('smart', observer);
    }

    triggerSmartAnimation(element) {
        element.classList.add('animated');
        
        const animationType = element.dataset.animation || 'fadeInUp';
        const delay = parseInt(element.dataset.delay) || 0;
        const stagger = parseInt(element.dataset.stagger) || 0;
        
        setTimeout(() => {
            this.playAnimation(element, animationType);
        }, delay + stagger);
    }

    playAnimation(element, type) {
        const animations = {
            fadeInUp: {
                from: { opacity: 0, translateY: '30px' },
                to: { opacity: 1, translateY: '0px' },
                duration: 800,
                easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
            },
            scaleIn: {
                from: { opacity: 0, scale: 0.8 },
                to: { opacity: 1, scale: 1 },
                duration: 600,
                easing: 'spring(1, 80, 10, 0)'
            },
            slideInLeft: {
                from: { opacity: 0, translateX: '-50px' },
                to: { opacity: 1, translateX: '0px' },
                duration: 700,
                easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
            },
            morphIn: {
                from: { opacity: 0, scale: 0.5, rotate: '-10deg' },
                to: { opacity: 1, scale: 1, rotate: '0deg' },
                duration: 1000,
                easing: 'spring(1, 100, 15, 0)'
            }
        };

        const animation = animations[type] || animations.fadeInUp;
        this.animate(element, animation);
    }

    /* ==================== ADVANCED INTERACTIONS ==================== */
    
    initAdvancedInteractions() {
        // Magnetic buttons
        this.initMagneticButtons();
        
        // Advanced hover effects
        this.initAdvancedHovers();
        
        // Gesture controls
        this.initGestureControls();
        
        // Smart tooltips
        this.initSmartTooltips();
        
        // Interactive elements
        this.initInteractiveElements();
    }

    initMagneticButtons() {
        document.querySelectorAll('.btn, .step-number, .payment-method').forEach(button => {
            let magneticArea = button.getBoundingClientRect();
            
            button.addEventListener('mouseenter', () => {
                magneticArea = button.getBoundingClientRect();
            });

            button.addEventListener('mousemove', (e) => {
                if (this.state.reducedMotion) return;
                
                const { left, top, width, height } = magneticArea;
                const centerX = left + width / 2;
                const centerY = top + height / 2;
                
                const deltaX = (e.clientX - centerX) * 0.15;
                const deltaY = (e.clientY - centerY) * 0.15;
                
                button.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
            });

            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translate(0px, 0px)';
            });
        });
    }

    initAdvancedHovers() {
        // Tilt effect for cards
        document.querySelectorAll('.step-container, .card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                if (this.state.reducedMotion) return;
                
                const rect = card.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                const deltaX = (e.clientX - centerX) / (rect.width / 2);
                const deltaY = (e.clientY - centerY) / (rect.height / 2);
                
                const rotateX = deltaY * -8;
                const rotateY = deltaX * 8;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
            });
        });

        // Morphing elements
        document.querySelectorAll('.morph-on-hover').forEach(element => {
            element.addEventListener('mouseenter', () => {
                this.animate(element, {
                    from: { borderRadius: element.style.borderRadius || '8px' },
                    to: { borderRadius: '20px' },
                    duration: 400,
                    easing: 'ease-out'
                });
            });

            element.addEventListener('mouseleave', () => {
                this.animate(element, {
                    from: { borderRadius: '20px' },
                    to: { borderRadius: '8px' },
                    duration: 400,
                    easing: 'ease-out'
                });
            });
        });
    }

    /* ==================== PARTICLE SYSTEM ==================== */
    
    initParticleSystem() {
        if (this.state.reducedMotion || this.state.performanceMode === 'low') return;

        this.createParticleCanvas();
        this.startParticleAnimation();
    }

    createParticleCanvas() {
        const canvas = document.createElement('canvas');
        canvas.id = 'particle-canvas';
        canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
            opacity: 0.3;
        `;
        
        document.body.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        this.particleCanvas = { canvas, ctx };
        
        this.resizeParticleCanvas();
        window.addEventListener('resize', () => this.resizeParticleCanvas());
    }

    resizeParticleCanvas() {
        const { canvas, ctx } = this.particleCanvas;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Initialize particles
        this.initParticles();
    }

    initParticles() {
        this.state.particles = [];
        const particleCount = Math.min(50, window.innerWidth / 20);
        
        for (let i = 0; i < particleCount; i++) {
            this.state.particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.2,
                color: this.getThemeColor()
            });
        }
    }

    startParticleAnimation() {
        const animate = () => {
            this.updateParticles();
            this.renderParticles();
            requestAnimationFrame(animate);
        };
        
        animate();
    }

    updateParticles() {
        const { particles, mousePosition } = this.state;
        
        particles.forEach(particle => {
            // Move particle
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Mouse interaction
            const dx = mousePosition.x - particle.x;
            const dy = mousePosition.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                const force = (100 - distance) / 100;
                particle.vx -= (dx / distance) * force * 0.01;
                particle.vy -= (dy / distance) * force * 0.01;
            }
            
            // Boundary check
            if (particle.x < 0 || particle.x > window.innerWidth) particle.vx *= -1;
            if (particle.y < 0 || particle.y > window.innerHeight) particle.vy *= -1;
            
            // Keep in bounds
            particle.x = Math.max(0, Math.min(window.innerWidth, particle.x));
            particle.y = Math.max(0, Math.min(window.innerHeight, particle.y));
        });
    }

    renderParticles() {
        const { ctx } = this.particleCanvas;
        const { particles } = this.state;
        
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        particles.forEach(particle => {
            ctx.save();
            ctx.globalAlpha = particle.opacity;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
        
        // Draw connections
        this.renderParticleConnections();
    }

    renderParticleConnections() {
        const { ctx } = this.particleCanvas;
        const { particles } = this.state;
        
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 120) {
                    ctx.save();
                    ctx.globalAlpha = (120 - distance) / 120 * 0.2;
                    ctx.strokeStyle = this.getThemeColor();
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                    ctx.restore();
                }
            }
        }
    }

    /* ==================== AUDIO SYSTEM ==================== */
    
    initAudioSystem() {
        if (!this.state.soundEnabled) return;

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.sounds = {};
        
        this.loadSounds();
        this.setupAudioEvents();
    }

    loadSounds() {
        const soundEffects = {
            hover: { frequency: 800, type: 'sine', duration: 100 },
            click: { frequency: 1000, type: 'square', duration: 150 },
            success: { frequency: 1200, type: 'sine', duration: 200 },
            error: { frequency: 400, type: 'sawtooth', duration: 300 }
        };

        Object.entries(soundEffects).forEach(([name, config]) => {
            this.sounds[name] = this.createSound(config);
        });
    }

    createSound(config) {
        return () => {
            if (!this.state.soundEnabled) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(config.frequency, this.audioContext.currentTime);
            oscillator.type = config.type;
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + config.duration / 1000);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + config.duration / 1000);
        };
    }

    setupAudioEvents() {
        // Add sound effects to interactive elements
        document.addEventListener('click', (e) => {
            if (e.target.matches('.btn, .step-number, .menu-item')) {
                this.sounds.click?.();
            }
        });

        document.addEventListener('mouseover', (e) => {
            if (e.target.matches('.btn, .step-number, .card')) {
                this.sounds.hover?.();
            }
        });
    }

    /* ==================== DYNAMIC THEME SYSTEM ==================== */
    
    initDynamicTheme() {
        this.createThemeController();
        this.initColorMorphing();
        this.setupThemeTransitions();
        this.initAdaptiveTheme();
    }

    createThemeController() {
        const themeController = document.createElement('div');
        themeController.id = 'theme-controller';
        themeController.innerHTML = `
        `;

        document.body.appendChild(themeController);
        this.addThemeControllerStyles();
        this.initThemeToggle();
    }
    
    initColorMorphing() {
        // Gradually shift colors based on time and user interaction
        this.colorMorphInterval = setInterval(() => {
            if (this.state.reducedMotion) return;
            
            const hue = (Date.now() / 100) % 360;
            const primaryColor = `hsl(${hue}, 70%, 50%)`;
            
            document.documentElement.style.setProperty('--dynamic-primary', primaryColor);
            document.documentElement.style.setProperty('--dynamic-glow', `${primaryColor}33`);
        }, 100);
    }

    updateThemeColors() {
        const isDark = this.state.theme === 'dark';
        const colors = {
            primary: isDark ? '#60a5fa' : '#2563eb',
            secondary: isDark ? '#a78bfa' : '#7c3aed',
            accent: isDark ? '#34d399' : '#059669',
            background: isDark ? '#0f172a' : '#ffffff',
            surface: isDark ? '#1e293b' : '#f8fafc'
        };

        Object.entries(colors).forEach(([key, value]) => {
            document.documentElement.style.setProperty(`--color-${key}`, value);
        });
    }

    getThemeColor() {
        return this.state.theme === 'dark' ? '#60a5fa' : '#2563eb';
    }

    /* ==================== ADVANCED GESTURES ==================== */
    
    initAdvancedGestures() {
        this.setupTouchGestures();
        this.setupKeyboardShortcuts();
        this.setupMouseGestures();
    }

    setupTouchGestures() {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartTime = 0;

        document.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                touchStartTime = Date.now();
            }
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            if (e.changedTouches.length === 1) {
                const touchEndX = e.changedTouches[0].clientX;
                const touchEndY = e.changedTouches[0].clientY;
                const touchEndTime = Date.now();
                
                const deltaX = touchEndX - touchStartX;
                const deltaY = touchEndY - touchStartY;
                const deltaTime = touchEndTime - touchStartTime;
                
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                const velocity = distance / deltaTime;
                
                // Swipe gestures
                if (distance > 50 && deltaTime < 500) {
                    if (Math.abs(deltaX) > Math.abs(deltaY)) {
                        if (deltaX > 0) {
                            this.handleSwipeRight();
                        } else {
                            this.handleSwipeLeft();
                        }
                    } else {
                        if (deltaY > 0) {
                            this.handleSwipeDown();
                        } else {
                            this.handleSwipeUp();
                        }
                    }
                }
            }
        }, { passive: true });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only handle shortcuts when not in input fields
            if (e.target.matches('input, textarea, [contenteditable]')) return;

            const shortcuts = {
                'KeyT': () => this.toggleTheme(),
                'KeyS': () => this.toggleSound(),
                'KeyF': () => this.toggleFullscreen(),
                'KeyH': () => this.showHelp(),
                'Escape': () => this.closeAllModals(),
                'ArrowUp': () => this.scrollToTop(),
                'ArrowDown': () => this.scrollToBottom()
            };

            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                shortcuts[e.code]?.();
            }
        });
    }

    setupMouseGestures() {
        let mouseTrail = [];
        
        document.addEventListener('mousemove', (e) => {
            this.state.mousePosition = { x: e.clientX, y: e.clientY };
            
            // Mouse trail for visual effects
            mouseTrail.push({ x: e.clientX, y: e.clientY, time: Date.now() });
            
            // Keep only recent positions
            mouseTrail = mouseTrail.filter(point => Date.now() - point.time < 1000);
            
            // Update cursor effects
            this.updateCursorEffects(e.clientX, e.clientY);
        });
    }

    updateCursorEffects(x, y) {
        // Create cursor trail effect
        if (this.state.reducedMotion) return;
        
        const trail = document.createElement('div');
        trail.className = 'cursor-trail';
        trail.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: 4px;
            height: 4px;
            background: var(--color-primary);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            animation: cursorFade 0.8s ease-out forwards;
        `;
        
        document.body.appendChild(trail);
        
        setTimeout(() => trail.remove(), 800);
    }

    /* ==================== AI FEATURES ==================== */
    
    initAIFeatures() {
        this.setupIntelligentTooltips();
        this.initAdaptiveBehavior();
        this.setupSmartSuggestions();
    }

    setupIntelligentTooltips() {
        // AI-powered contextual tooltips
        document.querySelectorAll('[data-tooltip]').forEach(element => {
            let tooltipTimeout;
            
            element.addEventListener('mouseenter', () => {
                tooltipTimeout = setTimeout(() => {
                    this.showIntelligentTooltip(element);
                }, 800);
            });
            
            element.addEventListener('mouseleave', () => {
                clearTimeout(tooltipTimeout);
                this.hideTooltip();
            });
        });
    }

    showIntelligentTooltip(element) {
        const tooltipText = element.dataset.tooltip;
        const context = this.analyzeContext(element);
        const enhancedText = this.enhanceTooltipText(tooltipText, context);
        
        this.createAdvancedTooltip(element, enhancedText);
    }

    analyzeContext(element) {
        return {
            elementType: element.tagName.toLowerCase(),
            hasInteraction: element.classList.contains('interactive'),
            userProgress: this.calculateUserProgress(),
            timeSpent: Date.now() - this.startTime
        };
    }

    enhanceTooltipText(baseText, context) {
        // Simple AI-like enhancement based on context
        if (context.userProgress > 0.8) {
            return `${baseText} (You're almost done!)`;
        } else if (context.timeSpent < 30000) {
            return `${baseText} (New here? Take your time!)`;
        }
        return baseText;
    }

    initAdaptiveBehavior() {
        // Learn from user interactions
        this.userBehavior = {
            scrollSpeed: 0,
            interactionCount: 0,
            preferredAnimationSpeed: 1,
            timeSpent: 0
        };
        
        this.trackUserBehavior();
        this.adaptInterface();
    }

    trackUserBehavior() {
        let lastScrollTime = Date.now();
        let lastScrollTop = window.pageYOffset;
        
        window.addEventListener('scroll', this.throttle(() => {
            const now = Date.now();
            const currentScrollTop = window.pageYOffset;
            const scrollDelta = Math.abs(currentScrollTop - lastScrollTop);
            const timeDelta = now - lastScrollTime;
            
            if (timeDelta > 0) {
                this.userBehavior.scrollSpeed = scrollDelta / timeDelta;
            }
            
            lastScrollTime = now;
            lastScrollTop = currentScrollTop;
        }, 100));
        
        document.addEventListener('click', () => {
            this.userBehavior.interactionCount++;
        });
    }

    adaptInterface() {
        setInterval(() => {
            // Adapt animation speed based on user behavior
            if (this.userBehavior.scrollSpeed > 2) {
                this.state.animationSpeed = 0.7; // Faster animations for fast scrollers
            } else if (this.userBehavior.scrollSpeed < 0.5) {
                this.state.animationSpeed = 1.3; // Slower animations for careful readers
            }
            
            // Adapt based on interaction patterns
            if (this.userBehavior.interactionCount > 20) {
                // Power user - show advanced features
                document.body.classList.add('power-user-mode');
            }
        }, 10000);
    }

    /* ==================== PERFORMANCE MONITORING ==================== */
    
    initPerformanceMonitoring() {
        this.performanceMetrics = {
            fps: 60,
            memoryUsage: 0,
            loadTime: 0,
            interactionLatency: []
        };
        
        this.monitorFPS();
        this.monitorMemory();
        this.monitorInteractionLatency();
    }

    monitorFPS() {
        let lastTime = performance.now();
        let frameCount = 0;
        
        const measureFPS = (currentTime) => {
            frameCount++;
            
            if (currentTime - lastTime >= 1000) {
                this.performanceMetrics.fps = Math.round(frameCount * 1000 / (currentTime - lastTime));
                
                // Adapt quality based on FPS
                if (this.performanceMetrics.fps < 30) {
                    this.reduceQuality();
                } else if (this.performanceMetrics.fps > 55) {
                    this.increaseQuality();
                }
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(measureFPS);
        };
        
        requestAnimationFrame(measureFPS);
    }

    monitorMemory() {
        if (performance.memory) {
            setInterval(() => {
                this.performanceMetrics.memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024;
                
                if (this.performanceMetrics.memoryUsage > 100) {
                    this.optimizeMemoryUsage();
                }
            }, 5000);
        }
    }

    monitorInteractionLatency() {
        document.addEventListener('click', (e) => {
            const startTime = performance.now();
            
            requestAnimationFrame(() => {
                const endTime = performance.now();
                const latency = endTime - startTime;
                
                this.performanceMetrics.interactionLatency.push(latency);
                
                // Keep only last 10 measurements
                if (this.performanceMetrics.interactionLatency.length > 10) {
                    this.performanceMetrics.interactionLatency.shift();
                }
            });
        });
    }

    detectPerformanceMode() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        if (connection) {
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                return 'low';
            } else if (connection.effectiveType === '3g') {
                return 'medium';
            }
        }
        
        // Check hardware capabilities
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) return 'low';
        
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
        
        if (renderer.includes('Intel') && renderer.includes('HD')) {
            return 'medium';
        }
        
        return 'high';
    }

    reduceQuality() {
        // Disable expensive effects
        if (this.particleCanvas) {
            this.particleCanvas.canvas.style.display = 'none';
        }
        
        document.body.classList.add('reduced-effects');
        this.state.reducedMotion = true;
    }

    increaseQuality() {
        if (this.particleCanvas) {
            this.particleCanvas.canvas.style.display = 'block';
        }
        
        document.body.classList.remove('reduced-effects');
        this.state.reducedMotion = false;
    }

    optimizeMemoryUsage() {
        // Clean up particles
        this.state.particles = this.state.particles.slice(0, 20);
        
        // Clean up event listeners
        this.cleanupEventListeners();
        
        // Force garbage collection hint
        if (window.gc) {
            window.gc();
        }
    }

    /* ==================== UTILITY METHODS ==================== */
    
    animate(element, options) {
        const {
            from = {},
            to = {},
            duration = 500,
            easing = 'ease-out',
            delay = 0,
            complete
        } = options;

        // Apply initial state
        Object.entries(from).forEach(([prop, value]) => {
            if (prop.includes('translate') || prop.includes('rotate') || prop.includes('scale')) {
                const currentTransform = element.style.transform || '';
                element.style.transform = `${currentTransform} ${prop}(${value})`;
            } else {
                element.style[prop] = value;
            }
        });

        setTimeout(() => {
            element.style.transition = `all ${duration}ms ${easing}`;
            
            // Apply end state
            Object.entries(to).forEach(([prop, value]) => {
                if (prop.includes('translate') || prop.includes('rotate') || prop.includes('scale')) {
                    const transforms = [];
                    Object.entries(to).forEach(([p, v]) => {
                        if (p.includes('translate') || p.includes('rotate') || p.includes('scale')) {
                            transforms.push(`${p}(${v})`);
                        }
                    });
                    element.style.transform = transforms.join(' ');
                } else {
                    element.style[prop] = value;
                }
            });

            if (complete) {
                setTimeout(complete, duration);
            }
        }, delay);
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    escapeHtml(unsafe) {
        return String(unsafe)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    async waitForDOMReady() {
        if (document.readyState === 'loading') {
            return new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve, { once: true });
            });
        }
    }

    calculateUserProgress() {
        const scrollTop = window.pageYOffset;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        return Math.min(1, (scrollTop + windowHeight) / documentHeight);
    }

    showConfirmDialog(options) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'confirm-modal';
            modal.innerHTML = `
                <div class="modal-backdrop">
                    <div class="modal-content">
                        <h3>${options.title}</h3>
                        <p>${options.message}</p>
                        <div class="modal-actions">
                            <button class="btn-cancel">${options.cancelText}</button>
                            <button class="btn-confirm">${options.confirmText}</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            modal.querySelector('.btn-confirm').addEventListener('click', () => {
                modal.remove();
                resolve(true);
            });
            
            modal.querySelector('.btn-cancel').addEventListener('click', () => {
                modal.remove();
                resolve(false);
            });
            
            // Animate in
            requestAnimationFrame(() => {
                modal.classList.add('active');
            });
        });
    }

    showLoadingSpinner(message) {
        const spinner = document.createElement('div');
        spinner.id = 'loading-spinner';
        spinner.innerHTML = `
            <div class="spinner-backdrop">
                <div class="spinner-content">
                    <div class="spinner"></div>
                    <p>${message}</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(spinner);
    }

    /* ==================== GESTURE HANDLERS ==================== */
    
    handleSwipeLeft() {
        // Navigate to next section or page
        this.nextSection();
    }

    handleSwipeRight() {
        // Navigate to previous section or page
        this.previousSection();
    }

    handleSwipeUp() {
        // Scroll up or minimize current section
        window.scrollBy({ top: -window.innerHeight * 0.8, behavior: 'smooth' });
    }

    handleSwipeDown() {
        // Scroll down or expand current section  
        window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
    }

    toggleTheme() {
        const newTheme = this.state.theme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    }

    toggleSound() {
        this.state.soundEnabled = !this.state.soundEnabled;
        localStorage.setItem('soundEnabled', this.state.soundEnabled);
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    showHelp() {
        // Show help modal with keyboard shortcuts and gestures
        console.log('Help modal would be shown here');
    }

    closeAllModals() {
        document.querySelectorAll('.modal, .dropdown-active, .tooltip').forEach(modal => {
            modal.classList.remove('active', 'dropdown-active');
        });
    }

    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    scrollToBottom() {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    }

    nextSection() {
        const sections = document.querySelectorAll('.step-container, section');
        if (this.state.currentStep < sections.length - 1) {
            this.state.currentStep++;
            sections[this.state.currentStep].scrollIntoView({ behavior: 'smooth' });
        }
    }

    previousSection() {
        const sections = document.querySelectorAll('.step-container, section');
        if (this.state.currentStep > 0) {
            this.state.currentStep--;
            sections[this.state.currentStep].scrollIntoView({ behavior: 'smooth' });
        }
    }

    /* ==================== CLEANUP ==================== */
    
    cleanupEventListeners() {
        // Clean up intersection observers
        this.intersectionObservers.forEach(observer => observer.disconnect());
        
        // Clear intervals
        if (this.colorMorphInterval) {
            clearInterval(this.colorMorphInterval);
        }
    }

    destroy() {
        this.cleanupEventListeners();
        
        // Remove created elements
        document.querySelectorAll('#particle-canvas, #theme-controller, #loading-spinner').forEach(el => el.remove());
        
        // Clear state
        this.state = {};
        this.modules.clear();
    }

    /* ==================== CSS STYLES INJECTION ==================== */
    
    addUserMenuStyles() {
        if (document.getElementById('advanced-user-menu-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'advanced-user-menu-styles';
        styles.textContent = `
            .user-menu-advanced {
                position: relative;
                display: flex;
                align-items: center;
            }
            
            .user-trigger {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 8px 16px;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 12px;
                transition: all 0.3s ease;
                cursor: pointer;
            }
            
            .user-trigger:hover {
                background: rgba(255, 255, 255, 0.15);
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
            }
            
            .user-avatar {
                position: relative;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
            }
            
            .avatar-ring {
                position: absolute;
                inset: -2px;
                border-radius: 50%;
                background: conic-gradient(from 0deg, #667eea, #764ba2, #667eea);
                animation: rotate 3s linear infinite;
            }
            
            .avatar-text {
                position: relative;
                color: white;
                font-weight: 600;
                font-size: 14px;
                z-index: 1;
            }
            
            .status-indicator {
                position: absolute;
                bottom: 2px;
                right: 2px;
                width: 10px;
                height: 10px;
                border-radius: 50%;
                border: 2px solid white;
            }
            
            .status-indicator.online { background: #10b981; }
            .status-indicator.away { background: #f59e0b; }
            .status-indicator.busy { background: #ef4444; }
            
            .user-info {
                display: flex;
                flex-direction: column;
                gap: 2px;
            }
            
            .username {
                font-weight: 600;
                color: var(--text-primary, #1f2937);
                font-size: 14px;
            }
            
            .user-role {
                font-size: 12px;
                color: var(--text-secondary, #6b7280);
                text-transform: capitalize;
            }
            
            .chevron {
                width: 16px;
                height: 16px;
                transition: transform 0.2s ease;
            }
            
            .user-trigger[aria-expanded="true"] .chevron {
                transform: rotate(180deg);
            }
            
            .user-dropdown-advanced {
                position: absolute;
                top: calc(100% + 8px);
                right: 0;
                min-width: 280px;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 16px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
                opacity: 0;
                visibility: hidden;
                transform: translateY(-10px) scale(0.95);
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                z-index: 1000;
            }
            
            .user-dropdown-advanced.active {
                opacity: 1;
                visibility: visible;
                transform: translateY(0) scale(1);
            }
            
            .dropdown-header {
                padding: 20px;
                border-bottom: 1px solid rgba(0, 0, 0, 0.1);
            }
            
            .user-stats {
                display: flex;
                gap: 24px;
            }
            
            .stat {
                text-align: center;
            }
            
            .stat-value {
                display: block;
                font-size: 18px;
                font-weight: 700;
                color: var(--color-primary, #2563eb);
            }
            
            .stat-label {
                font-size: 12px;
                color: var(--text-secondary, #6b7280);
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .dropdown-menu {
                padding: 8px;
            }
            
            .menu-section {
                margin-bottom: 16px;
            }
            
            .menu-section:last-child {
                margin-bottom: 0;
            }
            
            .menu-section-title {
                display: block;
                padding: 8px 12px;
                font-size: 11px;
                font-weight: 600;
                color: var(--text-secondary, #6b7280);
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .menu-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                border-radius: 8px;
                color: var(--text-primary, #1f2937);
                text-decoration: none;
                transition: all 0.2s ease;
                font-size: 14px;
            }
            
            .menu-item:hover {
                background: rgba(59, 130, 246, 0.1);
                color: var(--color-primary, #2563eb);
                transform: translateX(4px);
            }
            
            .menu-item svg {
                width: 16px;
                height: 16px;
                opacity: 0.7;
            }
            
            .dropdown-footer {
                padding: 8px;
                border-top: 1px solid rgba(0, 0, 0, 0.1);
            }
            
            .logout-btn {
                display: flex;
                align-items: center;
                gap: 8px;
                width: 100%;
                padding: 12px;
                background: none;
                border: none;
                border-radius: 8px;
                color: #ef4444;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .logout-btn:hover {
                background: rgba(239, 68, 68, 0.1);
                transform: translateX(4px);
            }
            
            .logout-btn svg {
                width: 16px;
                height: 16px;
            }
            
            @keyframes rotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            
            @keyframes cursorFade {
                0% {
                    opacity: 1;
                    transform: scale(1);
                }
                100% {
                    opacity: 0;
                    transform: scale(0);
                }
            }
            
            /* Dark theme styles */
            .dark .user-trigger {
                background: rgba(0, 0, 0, 0.3);
                border-color: rgba(255, 255, 255, 0.1);
            }
            
            .dark .user-trigger:hover {
                background: rgba(0, 0, 0, 0.4);
            }
            
            .dark .user-dropdown-advanced {
                background: rgba(15, 23, 42, 0.95);
                border-color: rgba(255, 255, 255, 0.1);
            }
            
            .dark .username {
                color: #f8fafc;
            }
            
            .dark .user-role {
                color: #94a3b8;
            }
            
            .dark .menu-item {
                color: #f8fafc;
            }
            
            .dark .menu-item:hover {
                background: rgba(59, 130, 246, 0.2);
                color: #60a5fa;
            }
        `;
        
        document.head.appendChild(styles);
    }

    addThemeControllerStyles() {
        if (document.getElementById('theme-controller-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'theme-controller-styles';
        styles.textContent = `
            #theme-controller {
                position: fixed;
                top: 50%;
                right: 20px;
                transform: translateY(-50%);
                z-index: 1000;
            }
            
            .theme-toggle-container {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 50px;
                padding: 4px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            }
            
            .theme-toggle {
                position: relative;
                width: 60px;
                height: 30px;
                background: none;
                border: none;
                cursor: pointer;
                padding: 0;
                overflow: hidden;
                border-radius: 50px;
            }
            
            .theme-toggle-track {
                position: relative;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
                border-radius: 50px;
                transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            }
            
            .theme-toggle.dark .theme-toggle-track {
                background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
            }
            
            .theme-toggle-thumb {
                position: absolute;
                top: 2px;
                left: 2px;
                width: 26px;
                height: 26px;
                background: white;
                border-radius: 50%;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .theme-toggle.dark .theme-toggle-thumb {
                transform: translateX(30px);
                background: #1e293b;
            }
            
            .theme-toggle svg {
                width: 14px;
                height: 14px;
                transition: all 0.3s ease;
            }
            
            .sun-icon {
                color: #f59e0b;
                opacity: 1;
            }
            
            .moon-icon {
                color: #e2e8f0;
                opacity: 0;
                position: absolute;
            }
            
            .theme-toggle.dark .sun-icon {
                opacity: 0;
            }
            
            .theme-toggle.dark .moon-icon {
                opacity: 1;
            }
            
            /* Responsive adjustments */
            @media (max-width: 768px) {
                #theme-controller {
                    right: 10px;
                    top: auto;
                    bottom: 20px;
                    transform: none;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }

    /* ==================== STARTUP ==================== */
    
    startAmbientAnimations() {
        if (this.state.reducedMotion) return;
        
        // Floating elements animation
        this.animateFloatingElements();
        
        // Background gradient shift
        this.animateBackgroundGradient();
        
        // Breathing effect for interactive elements
        this.animateBreathingElements();
    }

    animateFloatingElements() {
        const floatingElements = document.querySelectorAll('.step-number, .card, .feature-item');
        
        floatingElements.forEach((element, index) => {
            const amplitude = 10 + Math.random() * 10;
            const period = 3000 + Math.random() * 2000;
            const phase = index * 0.5;
            
            const animate = () => {
                const time = Date.now() / period;
                const y = Math.sin(time + phase) * amplitude;
                
                if (!this.state.reducedMotion) {
                    element.style.transform = `translateY(${y}px)`;
                }
                
                requestAnimationFrame(animate);
            };
            
            animate();
        });
    }

    animateBackgroundGradient() {
        let hue = 0;
        
        const animate = () => {
            if (!this.state.reducedMotion) {
                hue = (hue + 0.1) % 360;
                document.documentElement.style.setProperty('--ambient-hue', hue);
            }
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }

    animateBreathingElements() {
        const breathingElements = document.querySelectorAll('.btn-primary, .step-number');
        
        breathingElements.forEach((element, index) => {
            const period = 4000 + Math.random() * 2000;
            const phase = index * 0.3;
            
            const animate = () => {
                const time = Date.now() / period;
                const scale = 1 + Math.sin(time + phase) * 0.02;
                
                if (!this.state.reducedMotion) {
                    element.style.transform = `scale(${scale})`;
                }
                
                requestAnimationFrame(animate);
            };
            
            animate();
        });
    }

    /* ==================== ADVANCED EVENT HANDLING ==================== */
    
    setupAdvancedEventHandlers() {
        // Passive scroll optimization
        let ticking = false;
        
        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.updateScrollVelocity();
                    this.updateParallaxElements();
                    this.updateProgressIndicators();
                    ticking = false;
                });
                ticking = true;
            }
        };
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Advanced resize handling
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                this.handleElementResize(entry);
            }
        });
        
        document.querySelectorAll('.responsive-element').forEach(element => {
            resizeObserver.observe(element);
        });
        
        // Visibility change optimization
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimations();
            } else {
                this.resumeAnimations();
            }
        });
        
        // Battery optimization
        if ('getBattery' in navigator) {
            navigator.getBattery().then((battery) => {
                if (battery.level < 0.2) {
                    this.enablePowerSaveMode();
                }
                
                battery.addEventListener('levelchange', () => {
                    if (battery.level < 0.2) {
                        this.enablePowerSaveMode();
                    } else {
                        this.disablePowerSaveMode();
                    }
                });
            });
        }
    }

    updateScrollVelocity() {
        const currentScrollTop = window.pageYOffset;
        const deltaScroll = currentScrollTop - this.state.lastScrollTop;
        
        this.state.scrollVelocity = deltaScroll;
        this.state.lastScrollTop = currentScrollTop;
        
        // Apply velocity-based effects
        document.documentElement.style.setProperty('--scroll-velocity', Math.abs(deltaScroll));
    }

    updateParallaxElements() {
        const scrollTop = window.pageYOffset;
        
        document.querySelectorAll('[data-parallax]').forEach(element => {
            const speed = parseFloat(element.dataset.parallax) || 0.5;
            const yPos = -(scrollTop * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    }

    updateProgressIndicators() {
        const scrollTop = window.pageYOffset;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const progress = Math.min(1, scrollTop / documentHeight);
        
        document.documentElement.style.setProperty('--scroll-progress', progress);
        
        // Update reading progress for articles
        const article = document.querySelector('article, main');
        if (article) {
            const articleTop = article.offsetTop;
            const articleHeight = article.offsetHeight;
            const articleProgress = Math.max(0, Math.min(1, (scrollTop - articleTop) / articleHeight));
            
            document.documentElement.style.setProperty('--article-progress', articleProgress);
        }
    }

    handleElementResize(entry) {
        const element = entry.target;
        const { width, height } = entry.contentRect;
        
        // Responsive typography
        const fontSize = Math.max(14, Math.min(24, width / 30));
        element.style.fontSize = `${fontSize}px`;
        
        // Responsive spacing
        const padding = Math.max(16, Math.min(48, width / 20));
        element.style.padding = `${padding}px`;
    }

    pauseAnimations() {
        document.body.classList.add('animations-paused');
        
        // Pause particle system
        if (this.particleCanvas) {
            this.particleCanvas.canvas.style.animationPlayState = 'paused';
        }
        
        // Pause CSS animations
        document.querySelectorAll('*').forEach(element => {
            const computedStyle = getComputedStyle(element);
            if (computedStyle.animationName !== 'none') {
                element.style.animationPlayState = 'paused';
            }
        });
    }

    resumeAnimations() {
        document.body.classList.remove('animations-paused');
        
        if (this.particleCanvas) {
            this.particleCanvas.canvas.style.animationPlayState = 'running';
        }
        
        document.querySelectorAll('*').forEach(element => {
            element.style.animationPlayState = 'running';
        });
    }

    enablePowerSaveMode() {
        document.body.classList.add('power-save-mode');
        this.state.reducedMotion = true;
        
        // Reduce animation frequency
        this.state.animationSpeed = 0.5;
        
        // Disable expensive effects
        if (this.particleCanvas) {
            this.particleCanvas.canvas.style.display = 'none';
        }
        
        console.log('🔋 Power save mode enabled');
    }

    disablePowerSaveMode() {
        document.body.classList.remove('power-save-mode');
        this.state.reducedMotion = false;
        this.state.animationSpeed = 1;
        
        if (this.particleCanvas) {
            this.particleCanvas.canvas.style.display = 'block';
        }
        
        console.log('⚡ Power save mode disabled');
    }
}

// Global styles injection for core animations and effects
const globalStyles = `
    <style>
        :root {
            --dynamic-primary: #2563eb;
            --dynamic-glow: #2563eb33;
            --ambient-hue: 0;
            --scroll-velocity: 0;
            --scroll-progress: 0;
            --article-progress: 0;
        }
        
        * {
            transition-duration: calc(var(--scroll-velocity) * 0.01s + 0.3s);
        }
        
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
        
        .step-number--hover {
            transform: scale(1.1) rotate(5deg);
            box-shadow: 0 10px 30px rgba(37, 99, 235, 0.3);
        }
        
        .feature-pressed {
            transform: scale(0.98);
            opacity: 0.8;
        }
        
        .payment-methods .active {
            transform: scale(1.05);
            box-shadow: 0 10px 40px var(--dynamic-glow);
            border-color: var(--dynamic-primary);
        }
        
        .cursor-trail {
            animation: cursorFade 0.8s ease-out forwards;
        }
        
        .reduced-effects * {
            animation: none !important;
            transition-duration: 0.1s !important;
        }
        
        .power-save-mode * {
            animation-duration: 2s !important;
            transition-duration: 0.2s !important;
        }
        
        .animations-paused * {
            animation-play-state: paused !important;
        }
        
        /* Ambient background effect */
        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at 20% 50%, hsla(calc(var(--ambient-hue)), 70%, 60%, 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, hsla(calc(var(--ambient-hue) + 120), 70%, 60%, 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 40% 80%, hsla(calc(var(--ambient-hue) + 240), 70%, 60%, 0.1) 0%, transparent 50%);
            pointer-events: none;
            z-index: -1;
            opacity: 0.5;
        }
        
        /* Progress indicator */
        .progress-indicator {
            position: fixed;
            top: 0;
            left: 0;
            width: calc(var(--scroll-progress) * 100%);
            height: 3px;
            background: linear-gradient(90deg, var(--dynamic-primary), #8b5cf6);
            z-index: 9999;
            transition: width 0.1s ease-out;
        }
        
        /* Keyboard mode focus styles */
        .keyboard-mode button:focus,
        .keyboard-mode a:focus {
            outline: 2px solid var(--dynamic-primary);
            outline-offset: 2px;
        }
        
        /* Responsive utilities */
        @media (max-width: 768px) {
            .step-number--hover {
                transform: scale(1.05);
            }
        }
        
        @media (prefers-reduced-motion: reduce) {
            * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        }
    </style>
`;

// Inject global styles
document.head.insertAdjacentHTML('beforeend', globalStyles);

// Initialize the advanced system
const advancedHowItWorks = new AdvancedHowItWorks();