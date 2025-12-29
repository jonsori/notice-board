// ===================================
// View Toggle Functionality
// ===================================
const viewToggleBtns = document.querySelectorAll('.toggle-btn');
const adminView = document.getElementById('admin-view');
const displayView = document.getElementById('display-view');

viewToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetView = btn.dataset.view;
        
        // Update button states
        viewToggleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Switch views
        if (targetView === 'admin') {
            adminView.classList.add('active');
            displayView.classList.remove('active');
        } else {
            displayView.classList.add('active');
            adminView.classList.remove('active');
        }
    });
});

// ===================================
// Admin Dashboard - Tab Functionality
// ===================================
const tabBtns = document.querySelectorAll('.tab-btn');
const contentCards = document.querySelectorAll('.content-card');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;
        
        // Update tab button states
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Filter content cards
        contentCards.forEach(card => {
            const cardStatus = card.dataset.status;
            if (targetTab === 'all' || cardStatus === targetTab) {
                card.style.display = 'block';
                card.classList.add('fade-in');
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// ===================================
// Admin Dashboard - Action Buttons
// ===================================
const approveButtons = document.querySelectorAll('.action-btn.approve');
const rejectButtons = document.querySelectorAll('.action-btn.reject');

approveButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const card = e.target.closest('.content-card');
        showNotification('Content approved successfully!', 'success');
        
        // Animate card removal
        card.style.transform = 'translateX(100%)';
        card.style.opacity = '0';
        setTimeout(() => {
            card.remove();
            updateStats();
        }, 300);
    });
});

rejectButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const card = e.target.closest('.content-card');
        showNotification('Content rejected', 'error');
        
        // Animate card removal
        card.style.transform = 'translateX(-100%)';
        card.style.opacity = '0';
        setTimeout(() => {
            card.remove();
            updateStats();
        }, 300);
    });
});

// ===================================
// Admin Dashboard - New Content Button
// ===================================
const newContentBtn = document.getElementById('new-content-btn');

newContentBtn.addEventListener('click', () => {
    showNotification('New content upload feature coming soon!', 'info');
});

// ===================================
// Admin Dashboard - Refresh Button
// ===================================
const refreshBtn = document.getElementById('refresh-btn');

refreshBtn.addEventListener('click', () => {
    // Add rotation animation to refresh icon
    const icon = refreshBtn.querySelector('svg');
    icon.style.transform = 'rotate(360deg)';
    icon.style.transition = 'transform 0.5s ease';
    
    setTimeout(() => {
        icon.style.transform = 'rotate(0deg)';
        showNotification('Dashboard refreshed', 'success');
    }, 500);
});

// ===================================
// Update Statistics
// ===================================
function updateStats() {
    const pendingCount = document.querySelectorAll('[data-status="pending"]').length;
    const approvedCount = document.querySelectorAll('[data-status="approved"]').length;
    const scheduledCount = document.querySelectorAll('[data-status="scheduled"]').length;
    
    // Update stat numbers
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers[0]) statNumbers[0].textContent = pendingCount;
    if (statNumbers[1]) statNumbers[1].textContent = approvedCount;
    if (statNumbers[2]) statNumbers[2].textContent = scheduledCount;
    
    // Update tab counts
    const tabs = document.querySelectorAll('.tab-btn');
    if (tabs[0]) tabs[0].textContent = `Pending (${pendingCount})`;
    if (tabs[1]) tabs[1].textContent = `Approved (${approvedCount})`;
    if (tabs[2]) tabs[2].textContent = `Scheduled (${scheduledCount})`;
}

// ===================================
// Notification System
// ===================================
function showNotification(message, type = 'info') {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                ${getNotificationIcon(type)}
            </svg>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '100px',
        right: '20px',
        zIndex: '10000',
        background: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6',
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '0.75rem',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        animation: 'slideInRight 0.3s ease',
        fontFamily: 'Inter, sans-serif',
        fontWeight: '600',
        fontSize: '0.875rem'
    });
    
    notification.querySelector('.notification-content').style.cssText = `
        display: flex;
        align-items: center;
        gap: 0.75rem;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success':
            return '<polyline points="20 6 9 17 4 12"></polyline>';
        case 'error':
            return '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>';
        default:
            return '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>';
    }
}

// Add notification animations to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===================================
// TV Display - Slide Rotation
// ===================================
let currentSlide = 0;
const slides = document.querySelectorAll('.slide-container');
const indicators = document.querySelectorAll('.indicator');

function showSlide(index) {
    // Remove active class from all slides and indicators
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));
    
    // Add active class to current slide and indicator
    slides[index].classList.add('active');
    indicators[index].classList.add('active');
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
}

// Auto-rotate slides every 8 seconds
let slideInterval = setInterval(nextSlide, 8000);

// Manual slide control via indicators
indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
        currentSlide = index;
        showSlide(currentSlide);
        
        // Reset interval
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 8000);
    });
});

// ===================================
// TV Display - Real-time Clock
// ===================================
function updateClock() {
    const now = new Date();
    
    // Format time (24-hour format)
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    
    // Format date
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = now.toLocaleDateString('en-US', options);
    
    // Update DOM
    const timeElement = document.querySelector('.time');
    const dateElement = document.querySelector('.date');
    
    if (timeElement) timeElement.textContent = timeString;
    if (dateElement) dateElement.textContent = dateString;
}

// Update clock immediately and then every second
updateClock();
setInterval(updateClock, 1000);

// ===================================
// TV Display - Ticker Animation
// ===================================
function setupTicker() {
    const tickerText = document.querySelector('.ticker-text');
    if (!tickerText) return;
    
    // Clone ticker content for seamless loop
    const tickerContent = tickerText.innerHTML;
    tickerText.innerHTML = tickerContent + tickerContent;
}

setupTicker();

// ===================================
// TV Display - Announcement Auto-scroll
// ===================================
function setupAnnouncementScroll() {
    const announcementsList = document.querySelector('.announcements-list');
    if (!announcementsList) return;
    
    let scrollPosition = 0;
    const scrollSpeed = 0.5; // pixels per frame
    const scrollDelay = 3000; // delay before starting scroll (ms)
    
    setTimeout(() => {
        function autoScroll() {
            if (announcementsList.scrollHeight > announcementsList.clientHeight) {
                scrollPosition += scrollSpeed;
                
                if (scrollPosition >= announcementsList.scrollHeight - announcementsList.clientHeight) {
                    scrollPosition = 0;
                }
                
                announcementsList.scrollTop = scrollPosition;
            }
            requestAnimationFrame(autoScroll);
        }
        
        autoScroll();
    }, scrollDelay);
}

setupAnnouncementScroll();

// ===================================
// Generate Sample Content for Demo
// ===================================
function generateSampleContent() {
    const contentGrid = document.getElementById('content-grid');
    
    const sampleApproved = [
        {
            type: 'video',
            title: 'Campus Tour 2025',
            duration: '3:45',
            author: 'Admissions Office',
            status: 'approved'
        },
        {
            type: 'image',
            title: 'Graduation Ceremony Poster',
            resolution: '1920x1080',
            author: 'Events Committee',
            status: 'approved'
        },
        {
            type: 'text',
            title: 'Exam Schedule Update',
            category: 'Announcement',
            author: 'Academic Affairs',
            status: 'approved'
        }
    ];
    
    const sampleScheduled = [
        {
            type: 'video',
            title: 'New Year Celebration Highlights',
            duration: '2:15',
            author: 'Student Union',
            status: 'scheduled'
        },
        {
            type: 'image',
            title: 'Blood Donation Camp',
            resolution: '1920x1080',
            author: 'Health Services',
            status: 'scheduled'
        }
    ];
    
    // Note: In a real application, this would dynamically generate cards
    // For now, the HTML already contains sample pending items
}

// ===================================
// Keyboard Shortcuts
// ===================================
document.addEventListener('keydown', (e) => {
    // Press '1' for Admin view
    if (e.key === '1') {
        viewToggleBtns[0].click();
    }
    
    // Press '2' for Display view
    if (e.key === '2') {
        viewToggleBtns[1].click();
    }
    
    // Press 'R' to refresh (in admin view)
    if (e.key === 'r' || e.key === 'R') {
        if (adminView.classList.contains('active')) {
            refreshBtn.click();
        }
    }
    
    // Press 'N' for new content (in admin view)
    if (e.key === 'n' || e.key === 'N') {
        if (adminView.classList.contains('active')) {
            newContentBtn.click();
        }
    }
    
    // Arrow keys for slide navigation (in display view)
    if (displayView.classList.contains('active')) {
        if (e.key === 'ArrowRight') {
            nextSlide();
            clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, 8000);
        } else if (e.key === 'ArrowLeft') {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(currentSlide);
            clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, 8000);
        }
    }
});

// ===================================
// Smooth Scroll for Announcements
// ===================================
const announcementItems = document.querySelectorAll('.announcement-item');
announcementItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
        item.style.transition = 'all 0.3s ease';
    });
});

// ===================================
// Initialize Application
// ===================================
function init() {
    console.log('🎓 Student Union Notice Board System Initialized');
    console.log('📱 Press 1 for Admin Dashboard, 2 for Live Display');
    console.log('⌨️ Keyboard shortcuts: R (Refresh), N (New Content), Arrow Keys (Navigate Slides)');
    
    // Set initial view to admin
    adminView.classList.add('active');
    
    // Update initial stats
    updateStats();
    
    // Show welcome notification
    setTimeout(() => {
        showNotification('Welcome to Student Union Notice Board System', 'info');
    }, 500);
}

// Run initialization when DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ===================================
// Export functions for external use
// ===================================
window.NoticeBoard = {
    showNotification,
    updateStats,
    switchView: (view) => {
        const btn = document.querySelector(`[data-view="${view}"]`);
        if (btn) btn.click();
    }
};
