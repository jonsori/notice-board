// ===================================
// Login Form Handling
// ===================================
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');


// Handle form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Hide any existing error
    errorMessage.classList.add('hidden');

    // Get form values
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    // Validate inputs
    if (!username || !password) {
        showError('Please enter both username and password');
        return;
    }

    // Show loading state
    loginBtn.classList.add('loading');
    loginBtn.querySelector('.btn-text').textContent = 'Signing in...';

    try {
        const response = await fetch('', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': CSRF_TOKEN
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const result = await response.json();

        if (response.ok && result.status === 'success') {
            // Success - show success state
            loginBtn.querySelector('.btn-text').textContent = 'Success!';

            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = result.redirect_url || '/dashboard/';
            }, 500);
        } else {
            // Failed login
            loginBtn.classList.remove('loading');
            loginBtn.querySelector('.btn-text').textContent = 'Sign In';
            showError(result.message || 'Invalid username or password. Please try again.');

            // Shake the form
            loginForm.style.animation = 'shake 0.4s ease';
            setTimeout(() => {
                loginForm.style.animation = '';
            }, 400);
        }
    } catch (error) {
        console.error('Login error:', error);
        loginBtn.classList.remove('loading');
        loginBtn.querySelector('.btn-text').textContent = 'Sign In';
        showError('A server error occurred. Please try again later.');
    }
});

// Show error message
function showError(message) {
    errorText.textContent = message;
    errorMessage.classList.remove('hidden');
}

// ===================================
// Password Toggle
// ===================================
const togglePasswordBtn = document.getElementById('toggle-password');
const eyeOpen = togglePasswordBtn.querySelector('.eye-open');
const eyeClosed = togglePasswordBtn.querySelector('.eye-closed');

togglePasswordBtn.addEventListener('click', () => {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;

    // Toggle icons
    eyeOpen.classList.toggle('hidden');
    eyeClosed.classList.toggle('hidden');
});

// ===================================
// Input Focus Effects
// ===================================
const inputs = document.querySelectorAll('input[type="text"], input[type="password"]');

inputs.forEach(input => {
    input.addEventListener('focus', () => {
        input.parentElement.style.transform = 'scale(1.01)';
        input.parentElement.style.transition = 'transform 0.2s ease';
    });

    input.addEventListener('blur', () => {
        input.parentElement.style.transform = 'scale(1)';
    });
});

// ===================================
// Forgot Password Handler
// ===================================
const forgotPasswordLink = document.querySelector('.forgot-password');

forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    alert('Please contact the Student Union IT administrator to reset your password.\n\nEmail: it@studentunion.edu\nPhone: +1 (555) 123-4567');
});

// ===================================
// Help Link Handler
// ===================================
const helpLink = document.querySelector('.help-link');

helpLink.addEventListener('click', (e) => {
    e.preventDefault();
    alert('Student Union Notice Board System Help\n\n' +
        'For technical support:\n' +
        '• Email: support@studentunion.edu\n' +
        '• Phone: +1 (555) 123-4567\n' +
        '• Office: Student Union Building, Room 201\n\n' +
        'Office Hours: Mon-Fri, 9:00 AM - 5:00 PM');
});

// ===================================
// Initialize
// ===================================
console.log('🔐 Student Union Login System Initialized');
