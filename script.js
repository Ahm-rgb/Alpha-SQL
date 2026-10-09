/**
 * AIRCIMPco Organizations - Professional Login UI
 * Complete JavaScript Implementation with Local Storage
 */

const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const rememberCheckbox = document.getElementById('remember');
const eyeIcon = document.getElementById('eyeIcon');
const successModal = document.getElementById('successModal');
const sliderTrack = document.getElementById('sliderTrack');
const statNumbers = document.querySelectorAll('.stat-number');

const StorageManager = {
    KEYS: { USER_DATA: 'aircimpco_user_data', AUTH_TOKEN: 'aircimpco_auth_token', REMEMBER_ME: 'aircimpco_remember_me', LOGIN_TIMESTAMP: 'aircimpco_login_timestamp' },
    
    saveUserData(data) {
        try {
            const userData = {
                email: data.email,
                passwordHash: this.hashPassword(data.password),
                rememberMe: data.rememberMe || false,
                lastLogin: new Date().toISOString(),
                sessionId: 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
            };
            localStorage.setItem(this.KEYS.USER_DATA, JSON.stringify(userData));
            if (data.rememberMe) {
                localStorage.setItem(this.KEYS.REMEMBER_ME, 'true');
                localStorage.setItem(this.KEYS.AUTH_TOKEN, 'tok_' + Math.random().toString(36).substr(2, 16));
            }
            localStorage.setItem(this.KEYS.LOGIN_TIMESTAMP, Date.now().toString());
            console.log('✅ User data saved to localStorage');
            return true;
        } catch (error) {
            console.error('❌ Error saving user data:', error);
            return false;
        }
    },

    getUserData() {
        try {
            const userData = localStorage.getItem(this.KEYS.USER_DATA);
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('❌ Error getting user data:', error);
            return null;
        }
    },

    isRemembered() { return localStorage.getItem(this.KEYS.REMEMBER_ME) === 'true'; },

    clearUserData() {
        Object.values(this.KEYS).forEach(key => localStorage.removeItem(key));
        console.log('🗑️ User data cleared');
    },

    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return 'hash_' + Math.abs(hash).toString(16);
    },

    autoFillForm() {
        const userData = this.getUserData();
        if (userData && userData.rememberMe) {
            emailInput.value = userData.email;
            rememberCheckbox.checked = true;
            console.log('📝 Form auto-filled from saved data');
        }
    }
};

const AnimationManager = {
    animateCounter(element, target, duration = 2000) {
        const start = 0;
        const startTime = performance.now();
        const isDecimal = target % 1 !== 0;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const current = start + (target - start) * ease;

            element.textContent = isDecimal ? current.toFixed(1) : Math.floor(current).toLocaleString();

            if (progress < 1) requestAnimationFrame(animate);
            else element.textContent = isDecimal ? target.toFixed(1) : target.toLocaleString();
        };
        requestAnimationFrame(animate);
    },

    startCounters() {
        statNumbers.forEach((stat, index) => {
            const target = parseFloat(stat.getAttribute('data-target'));
            setTimeout(() => this.animateCounter(stat, target, 2000), index * 200);
        });
    },

    createRipple(event, button) {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.cssText = `position:absolute;width:${size}px;height:${size}px;left:${x}px;top:${y}px;background:rgba(255,255,255,0.3);border-radius:50%;transform:scale(0);animation:rippleEffect 0.6s ease-out;pointer-events:none;`;
        button.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    },

    parallaxEffect(event) {
        const cards = document.querySelectorAll('.feature-card');
        const mouseX = event.clientX / window.innerWidth - 0.5;
        const mouseY = event.clientY / window.innerHeight - 0.5;
        cards.forEach((card, index) => {
            const depth = (index + 1) * 10;
            card.style.transform = `translate(${mouseX * depth}px, ${mouseY * depth}px)`;
        });
    }
};

const rippleStyle = document.createElement('style');
rippleStyle.textContent = '@keyframes rippleEffect{to{transform:scale(4);opacity:0}}';
document.head.appendChild(rippleStyle);

const FormHandler = {
    togglePassword() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        eyeIcon.classList.toggle('fa-eye');
        eyeIcon.classList.toggle('fa-eye-slash');
    },

    validateEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); },

    validatePassword(password) {
        const result = { valid: true, errors: [] };
        if (password.length < 8) { result.valid = false; result.errors.push('Password must be at least 8 characters'); }
        if (!/[A-Z]/.test(password)) { result.valid = false; result.errors.push('Password must contain an uppercase letter'); }
        if (!/[a-z]/.test(password)) { result.valid = false; result.errors.push('Password must contain a lowercase letter'); }
        if (!/[0-9]/.test(password)) { result.valid = false; result.errors.push('Password must contain a number'); }
        return result;
    },

    showLoading(button) { button.classList.add('loading'); button.disabled = true; },
    hideLoading(button) { button.classList.remove('loading'); button.disabled = false; },

    showError(message) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = 'position:fixed;top:20px;right:20px;background:#ff4444;color:white;padding:16px 24px;border-radius:8px;font-size:14px;z-index:10000;animation:slideInRight 0.3s ease;box-shadow:0 4px 12px rgba(0,0,0,0.3);';
        document.body.appendChild(toast);
        setTimeout(() => { toast.style.animation = 'slideOutRight 0.3s ease'; setTimeout(() => toast.remove(), 300); }, 3000);
    },

    showSuccess(message) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = 'position:fixed;top:20px;right:20px;background:#00cc66;color:white;padding:16px 24px;border-radius:8px;font-size:14px;z-index:10000;animation:slideInRight 0.3s ease;box-shadow:0 4px 12px rgba(0,0,0,0.3);';
        document.body.appendChild(toast);
        setTimeout(() => { toast.style.animation = 'slideOutRight 0.3s ease'; setTimeout(() => toast.remove(), 300); }, 3000);
    }
};

const toastStyle = document.createElement('style');
toastStyle.textContent = '@keyframes slideInRight{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}@keyframes slideOutRight{from{transform:translateX(0);opacity:1}to{transform:translateX(100%);opacity:0}}';
document.head.appendChild(toastStyle);

const AuthHandler = {
    async handleLogin(event) {
        event.preventDefault();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const rememberMe = rememberCheckbox.checked;
        const loginBtn = document.querySelector('.login-btn');

        if (!FormHandler.validateEmail(email)) { FormHandler.showError('Please enter a valid email address'); emailInput.focus(); return; }

        const passwordValidation = FormHandler.validatePassword(password);
        if (!passwordValidation.valid) { FormHandler.showError(passwordValidation.errors[0]); passwordInput.focus(); return; }

        FormHandler.showLoading(loginBtn);
        await new Promise(resolve => setTimeout(resolve, 1500));

        StorageManager.saveUserData({ email, password, rememberMe });
        FormHandler.hideLoading(loginBtn);
        this.showSuccessModal();
    },

    async handleSocialAuth(provider) {
        const providerNames = { google: 'Google', linkedin: 'LinkedIn', meta: 'Meta', apple: 'Apple' };
        console.log(`🔐 Initiating ${providerNames[provider]} authentication...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        StorageManager.saveUserData({ email: `user@${provider}.com`, password: 'oauth_token_' + Date.now(), rememberMe: true, provider });
        FormHandler.showSuccess(`${providerNames[provider]} authentication successful!`);
        setTimeout(() => this.showSuccessModal(), 500);
    },

    showSuccessModal() {
        successModal.classList.add('active');
        setTimeout(() => { console.log('🚀 Redirecting to dashboard...'); }, 3500);
    }
};

const SliderManager = {
    initializeSlider() {
        if (!sliderTrack) return;
        const logoItems = sliderTrack.querySelectorAll('.logo-item');
        logoItems.forEach(item => { sliderTrack.appendChild(item.cloneNode(true)); sliderTrack.appendChild(item.cloneNode(true)); });
        console.log('🎠 Slider initialized with', sliderTrack.querySelectorAll('.logo-item').length, 'items');
    },

    setupHoverPause() {
        const sliderContainer = document.querySelector('.slider-container');
        if (!sliderContainer) return;
        sliderContainer.addEventListener('mouseenter', () => { sliderTrack.style.animationPlayState = 'paused'; });
        sliderContainer.addEventListener('mouseleave', () => { sliderTrack.style.animationPlayState = 'running'; });
    }
};

function initializeEventListeners() {
    if (loginForm) loginForm.addEventListener('submit', (e) => AuthHandler.handleLogin(e));

    const togglePasswordBtn = document.querySelector('.toggle-password');
    if (togglePasswordBtn) togglePasswordBtn.addEventListener('click', () => FormHandler.togglePassword());

    document.querySelectorAll('.auth-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const provider = btn.classList.contains('google') ? 'google' : btn.classList.contains('linkedin') ? 'linkedin' : btn.classList.contains('meta') ? 'meta' : btn.classList.contains('apple') ? 'apple' : '';
            if (provider) { AnimationManager.createRipple(e, btn); AuthHandler.handleSocialAuth(provider); }
        });
        btn.addEventListener('click', (e) => AnimationManager.createRipple(e, btn));
    });

    document.querySelectorAll('.input-wrapper input').forEach(input => {
        input.addEventListener('focus', () => input.parentElement.classList.add('focused'));
        input.addEventListener('blur', () => input.parentElement.classList.remove('focused'));
    });

    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('mouseenter', () => { card.style.zIndex = '10'; });
        card.addEventListener('mouseleave', () => { card.style.zIndex = '1'; });
    });

    if (window.innerWidth > 1024) document.addEventListener('mousemove', (e) => AnimationManager.parallaxEffect(e));

    successModal.addEventListener('click', (e) => { if (e.target === successModal) successModal.classList.remove('active'); });
}

function initializeApp() {
    console.log('🚀 Initializing AIRCIMPco Login UI...');
    StorageManager.autoFillForm();
    SliderManager.initializeSlider();
    SliderManager.setupHoverPause();
    initializeEventListeners();

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) { AnimationManager.startCounters(); observer.unobserve(entry.target); }
        });
    }, { threshold: 0.5 });

    const statsSection = document.querySelector('.stats-section');
    if (statsSection) observer.observe(statsSection);

    document.body.classList.add('loaded');
    console.log('✅ AIRCIMPco Login UI initialized successfully');
    console.log('📊 Features: Local storage, Animated counters, Infinite slider, Ripple effects, Parallax, Form validation, Social auth');
}

window.togglePassword = FormHandler.togglePassword;
window.handleAuth = (provider) => AuthHandler.handleSocialAuth(provider);

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeApp);
else initializeApp();

console.log('%c AIRCIMPco Organizations ', 'background:#000;color:#fff;font-size:20px;padding:10px 20px;border-radius:5px;');
console.log('%c Professional Login Interface ', 'color:#888;font-size:14px;');
console.log('%c Built with ❤️ using modern web technologies ', 'color:#666;font-size:12px;');
