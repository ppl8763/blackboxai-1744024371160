// API Configuration
const API_BASE_URL = window.location.origin;

// Utility Functions
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

const checkEmailValidity = () => {
    const email = document.getElementById('email').value;
    const statusEl = document.getElementById('email-status');
    const iconEl = document.getElementById('email-icon');
    const feedbackEl = document.getElementById('email-feedback');

    if (!email) {
        statusEl.classList.add('hidden');
        feedbackEl.classList.add('hidden');
        return false;
    }

    const isValid = validateEmail(email);
    statusEl.classList.remove('hidden');
    
    if (isValid) {
        statusEl.classList.remove('text-red-500');
        statusEl.classList.add('text-green-500');
        iconEl.className = 'fas fa-check-circle';
        feedbackEl.textContent = 'Valid email format';
        feedbackEl.classList.remove('hidden', 'text-red-500');
        feedbackEl.classList.add('text-green-500');
    } else {
        statusEl.classList.remove('text-green-500');
        statusEl.classList.add('text-red-500');
        iconEl.className = 'fas fa-times-circle';
        feedbackEl.textContent = 'Please enter a valid email';
        feedbackEl.classList.remove('hidden', 'text-green-500');
        feedbackEl.classList.add('text-red-500');
    }
    return isValid;
};

const checkPasswordConfirmation = () => {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const statusEl = document.getElementById('confirm-status');
    const iconEl = document.getElementById('confirm-icon');
    const feedbackEl = document.getElementById('confirm-feedback');

    if (!password || !confirmPassword) {
        statusEl.classList.add('hidden');
        feedbackEl.classList.add('hidden');
        return false;
    }

    if (password === confirmPassword) {
        statusEl.classList.remove('hidden', 'text-red-500');
        statusEl.classList.add('text-green-500');
        iconEl.className = 'fas fa-check-circle';  
        feedbackEl.textContent = 'Passwords match';
        feedbackEl.classList.remove('hidden', 'text-red-500');
        feedbackEl.classList.add('text-green-500');
        return true;
    } else {
        statusEl.classList.remove('hidden', 'text-green-500');
        statusEl.classList.add('text-red-500');
        iconEl.className = 'fas fa-times-circle';
        feedbackEl.textContent = 'Passwords do not match';
        feedbackEl.classList.remove('hidden', 'text-green-500');
        feedbackEl.classList.add('text-red-500');
        return false;
    }
};

const showAlert = (message, type = 'success') => {
    const alertDiv = document.createElement('div');
    alertDiv.className = `fixed top-4 right-4 px-6 py-4 rounded-md shadow-lg ${
        type === 'error' ? 'bg-red-600' : 'bg-green-600'
    } text-white`;
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 5000);
};

// Username Availability Check
let usernameCheckTimeout;

const checkUsernameAvailability = async (username) => {
    const statusEl = document.getElementById('username-status');
    const iconEl = document.getElementById('username-icon');
    const feedbackEl = document.getElementById('username-feedback');  
    
    if (username.length < 3) {
        statusEl.classList.add('hidden');
        feedbackEl.classList.add('hidden');
        return false;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/check-username/${encodeURIComponent(username)}`);
        const { available } = await response.json();
        
        statusEl.classList.remove('hidden');
        if (available) {
            statusEl.classList.remove('text-red-500');
            statusEl.classList.add('text-green-500');
            iconEl.className = 'fas fa-check-circle';
            feedbackEl.textContent = 'Username available';
            feedbackEl.classList.remove('text-red-500', 'hidden');
            feedbackEl.classList.add('text-green-500');
            return true;
        } else {
            statusEl.classList.remove('text-green-500');
            statusEl.classList.add('text-red-500');
            iconEl.className = 'fas fa-times-circle';
            feedbackEl.textContent = 'Username already taken';
            feedbackEl.classList.remove('text-green-500', 'hidden');
            feedbackEl.classList.add('text-red-500');
            return false;
        }
    } catch (error) {
        console.error('Username check error:', error);
        return false;
    }
};

// Authentication Functions
const handleLogin = async (formData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(formData)
        });
        return await response.json();
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

const handleRegistration = async (formData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(formData)
        });
        return await response.json();
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
};

// Event Management
const fetchEvents = async () => {
    const searchTerm = document.getElementById('search-input')?.value || '';
    const loadingDiv = document.getElementById('loading-events');
    const eventsContainer = document.getElementById('events-container');

    try {
        loadingDiv.style.display = 'block';
        eventsContainer.innerHTML = '';
        
        const response = await fetch(`${API_BASE_URL}/api/events?search=${encodeURIComponent(searchTerm)}`, {
            headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}
        });
        const events = await response.json();

        if (!events.length) {
            eventsContainer.innerHTML = `
                <div class="col-span-3 text-center py-10 text-gray-500">
                    <i class="fas fa-calendar-times fa-2x mb-2"></i>
                    <p>No events found</p>
                </div>`;
            return;
        }

        events.forEach(event => {
            const eventCard = document.createElement('div');
            eventCard.className = 'bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300';
            eventCard.innerHTML = `
                <div class="p-6">
                    ${event.sponsor_logo ? `
                        <div class="flex items-center mb-4">
                            <img src="${event.sponsor_logo}" alt="${event.sponsor_name}" class="h-8 mr-2">
                            <span class="text-sm text-gray-400">Sponsored by ${event.sponsor_name}</span>
                        </div>` : ''}
                    <h3 class="text-xl font-bold text-indigo-400 mb-2">${event.title}</h3>
                    <div class="flex items-center text-gray-400 mb-2">
                        <i class="fas fa-calendar-day mr-2"></i>
                        <span>${new Date(event.date).toLocaleDateString()} at ${event.time}</span>
                    </div>
                    <div class="flex items-center text-gray-400 mb-4">
                        <i class="fas fa-map-marker-alt mr-2"></i>
                        <span>${event.location}</span>
                    </div>
                    <p class="text-gray-300 mb-4">${event.description}</p>
                    <div class="flex justify-between items-center">
                        <span class="px-3 py-1 bg-gray-700 rounded-full text-xs text-indigo-400">${event.category}</span>
                        <button class="text-indigo-500 hover:text-indigo-400">
                            <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>`;
            eventsContainer.appendChild(eventCard);
        });
    } catch (error) {
        showAlert('Failed to load events', 'error');
        console.error('Error:', error);
    } finally {
        loadingDiv.style.display = 'none';
    }
};

// Page Initialization
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const currentPage = window.location.pathname;

    // Authentication check
    if (token) {
        const usernameDisplay = document.getElementById('username-display');
        if (usernameDisplay) usernameDisplay.textContent = localStorage.getItem('username');
        
        if (['/login.html', '/'].includes(currentPage)) {
            window.location.href = '/events.html';
        }
    } else if (!['/login.html', '/register.html'].includes(currentPage)) {
        window.location.href = '/login.html';
        return;
    }

    // Page-specific setup
    if (currentPage === '/login.html' && document.getElementById('loginForm')) {
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const { data } = await handleLogin({
                    username: document.getElementById('username').value,
                    password: document.getElementById('password').value
                });
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.username);
                window.location.href = '/events.html';
            } catch (error) {
                showAlert('Login failed', 'error');
            }
        });
    }

    if (currentPage === '/register.html' && document.getElementById('registerForm')) {
        const usernameInput = document.getElementById('username');
        usernameInput.addEventListener('input', () => {
            clearTimeout(usernameCheckTimeout);
            usernameCheckTimeout = setTimeout(() => {
                checkUsernameAvailability(usernameInput.value);
            }, 500);
        });

        const passwordInput = document.getElementById('password');
        const confirmInput = document.getElementById('confirmPassword');
        const emailInput = document.getElementById('email');
        
        emailInput.addEventListener('input', () => {
            checkEmailValidity();
        });

        passwordInput.addEventListener('input', () => {
            checkPasswordStrength(passwordInput.value);
            checkPasswordConfirmation();
        });

        confirmInput.addEventListener('input', () => {
            checkPasswordConfirmation();
        });



        document.getElementById('registerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Run all validations
            const isUsernameValid = await checkUsernameAvailability(document.getElementById('username').value);
            const isEmailValid = checkEmailValidity();
            const isPasswordValid = checkPasswordStrength(document.getElementById('password').value);
            const isPasswordMatch = checkPasswordConfirmation();
            
            if (!isUsernameValid || !isEmailValid || !isPasswordValid || !isPasswordMatch) {
                showAlert('Please fix all validation errors before submitting', 'error');
                return;
            }

            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            const submitBtn = document.querySelector('#registerForm button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            
            try {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `
                    <i class="fas fa-spinner fa-spin mr-2"></i>
                    Registering...
                `;
                
                await handleRegistration({
                    username: document.getElementById('username').value,
                    email: document.getElementById('email').value,
                    password: password
                });
                showAlert('Registration successful!', 'success');
                setTimeout(() => window.location.href = '/login.html', 2000);
            } catch (error) {
                showAlert('Registration failed', 'error');
            } finally {
                if (submitBtn && originalBtnText) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }
            }
        });
    }

    if (currentPage === '/events.html') {
        fetchEvents();
        document.getElementById('logout-btn')?.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '/login.html';
        });
    }
});