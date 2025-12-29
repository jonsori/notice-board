// ===================================
// TV Display - Constants and State
// ===================================
let currentSlide = 0;
let slidesList = [];
let indicatorsList = [];
let activeNotices = [];
let slideTimeout = null;

// ===================================
// TV Display - Fetch and Content Loading
// ===================================

async function fetchNotices() {
    try {
        const response = await fetch(API_NOTICES_URL);
        if (!response.ok) throw new Error('API fetch failed');
        const notices = await response.json();
        renderSlides(notices);
        setupTicker(notices);
    } catch (error) {
        console.error('Error loading notices:', error);
    }
}

function renderSlides(notices) {
    activeNotices = notices.filter(n => n.type !== 'text' || n.urgent);

    const mainDisplay = document.querySelector('.main-display');
    const indicators = document.querySelector('.slide-indicators');
    if (!mainDisplay || !indicators) return;

    const existing = mainDisplay.querySelectorAll('.slide-container');
    existing.forEach(s => s.remove());
    indicators.innerHTML = '';

    if (activeNotices.length === 0) {
        mainDisplay.innerHTML += `
            <div class="slide-container active">
                <div class="slide-content" style="display: flex; align-items: center; justify-content: center; background: #111;">
                    <h2 style="color: white; font-family: var(--font-display); opacity: 0.5;">No active notices at this time.</h2>
                </div>
            </div>
        `;
        return;
    }

    activeNotices.forEach((notice, index) => {
        const slideContainer = document.createElement('div');
        slideContainer.className = 'slide-container';
        if (index === 0) slideContainer.classList.add('active');

        let contentHTML = '';
        if (notice.type === 'image') {
            contentHTML = `
                <div class="slide-content image-slide">
                    <div class="image-placeholder" style="background-image: url('${notice.fileData}'); background-size: contain; background-repeat: no-repeat; background-position: center; background-color: #000; height: 100%;">
                        <div class="slide-overlay" style="position: absolute; bottom: 0; left: 0; right: 0; padding: 4rem 3rem 3rem 3rem; background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.85) 100%); display: flex; align-items: flex-end; justify-content: space-between;">
                            <div class="info">
                                <h2 style="font-family: var(--font-display); font-size: 3.5rem; font-weight: 800; color: white; margin-bottom: 0.5rem; text-shadow: 0 4px 12px rgba(0,0,0,0.5);">${notice.title}</h2>
                                <p style="font-size: 1.5rem; color: rgba(255,255,255,0.9); font-weight: 600;">Managed by ${notice.author}</p>
                            </div>
                            ${notice.clubLogo ? `<img src="${notice.clubLogo}" style="height: 100px; width: 100px; object-fit: contain; border-radius: 12px; background: white; padding: 10px; box-shadow: 0 10px 20px rgba(0,0,0,0.3);">` : ''}
                        </div>
                    </div>
                </div>
            `;
        } else if (notice.type === 'video' || notice.type === 'text') {
            // Text on slides is rare but supported via urgent
            contentHTML = `
                <div class="slide-content ${notice.type}-slide">
                    <div class="${notice.type}-placeholder" style="background: #000; height: 100%; position: relative; display: flex; align-items: center; justify-content: center;">
                        ${notice.type === 'video' ? `<video src="${notice.fileData}" style="width: 100%; height: 100%; object-fit: contain;" autoplay muted loop></video>` : `<div style="color: white; font-size: 2rem; padding: 4rem; text-align: center;">${notice.textContent}</div>`}
                        <div class="slide-overlay" style="position: absolute; bottom: 0; left: 0; right: 0; padding: 4rem 3rem 3rem 3rem; background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.85) 100%); display: flex; align-items: flex-end; justify-content: space-between;">
                            <div class="info">
                                <h2 style="font-family: var(--font-display); font-size: 3.5rem; font-weight: 800; color: white; margin-bottom: 0.5rem; text-shadow: 0 4px 12px rgba(0,0,0,0.5);">${notice.title}</h2>
                                <p style="font-size: 1.5rem; color: rgba(255,255,255,0.9); font-weight: 600;">${notice.author}</p>
                            </div>
                            ${notice.clubLogo ? `<img src="${notice.clubLogo}" style="height: 100px; width: 100px; object-fit: contain; border-radius: 12px; background: white; padding: 10px;">` : ''}
                        </div>
                    </div>
                </div>
            `;
        }

        slideContainer.innerHTML = contentHTML;
        mainDisplay.insertBefore(slideContainer, indicators);

        const dot = document.createElement('span');
        dot.className = 'indicator';
        if (index === 0) dot.classList.add('active');
        dot.onclick = () => {
            currentSlide = index;
            showSlide(index);
        };
        indicators.appendChild(dot);
    });

    slidesList = document.querySelectorAll('.slide-container');
    indicatorsList = document.querySelectorAll('.indicator');

    currentSlide = 0;
    showSlide(0);
}

function showSlide(index) {
    if (!slidesList.length) return;

    slidesList.forEach(s => s.classList.remove('active'));
    indicatorsList.forEach(i => i.classList.remove('active'));

    slidesList[index].classList.add('active');
    indicatorsList[index].classList.add('active');

    // Handle variable duration
    if (slideTimeout) clearTimeout(slideTimeout);

    const duration = (activeNotices[index]?.duration || 10) * 1000;
    slideTimeout = setTimeout(() => {
        nextSlide();
    }, duration);
}

function nextSlide() {
    if (!slidesList.length) return;
    currentSlide = (currentSlide + 1) % slidesList.length;
    showSlide(currentSlide);
}

function resetInterval() {
    if (slideInterval) clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, 10000); // 10s per slide
}

// ===================================
// TV Display - Ticker
// ===================================

function setupTicker(notices) {
    const tickerText = document.querySelector('.ticker-text');
    if (!tickerText) return;

    // Use text announcements and urgent items
    const tickerItems = notices.filter(n => n.type === 'text' || n.urgent);

    if (tickerItems.length > 0) {
        tickerText.innerHTML = '';
        tickerItems.forEach((item, idx) => {
            const span = document.createElement('span');

            // Icon definitions
            const noticeIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: #fbbf24; margin-right: 8px;"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>`;
            const urgentIcon = `<svg class="pulse-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: #f87171; margin-right: 8px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

            if (item.type === 'text') {
                span.innerHTML = `${noticeIcon} <span style="color: #fbbf24; font-weight: 800; margin-right: 8px;">${item.title}:</span> ${item.textContent}`;
            } else {
                span.innerHTML = `${urgentIcon} <span style="color: #f87171; font-weight: 800; margin-right: 8px;">URGENT:</span> ${item.title} - ${item.author}`;
            }
            tickerText.appendChild(span);

            // Add a separator unless it's the last item (and we're not looping yet)
            const separator = document.createElement('div');
            separator.className = 'ticker-item-separator';
            separator.innerHTML = '&bull;';
            tickerText.appendChild(separator);
        });

        // Loop effect: duplicate the content to ensure continuous scrolling
        const content = tickerText.innerHTML;
        tickerText.innerHTML = content + content;
    }
}

// ===================================
// TV Display - Clock (Ethiopian & Gregorian)
// ===================================

let lastDateString = "";

function updateClock() {
    const now = new Date();

    // Ethiopian Time (6-hour offset)
    let ethHour = (now.getHours() + 6) % 12;
    if (ethHour === 0) ethHour = 12;
    const minutes = String(now.getMinutes()).padStart(2, '0');

    const h24 = now.getHours();
    let period = h24 >= 6 && h24 < 12 ? 'Morning' :
        h24 >= 12 && h24 < 18 ? 'Day' :
            h24 >= 18 && h24 < 24 ? 'Evening' : 'Night';

    const timeElement = document.querySelector('.time');
    if (timeElement) timeElement.textContent = `${ethHour}:${minutes} ${period}`;

    // Only update the date once per minute or when it changes to save CPU
    const currentDateKey = now.toDateString();
    if (currentDateKey !== lastDateString) {
        lastDateString = currentDateKey;

        // Ethiopian Calendar
        const ethMonths = ['Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yakatit', 'Magabit', 'Miyazya', 'Gimbot', 'Sene', 'Hamle', 'Nehasse', 'Pagume'];
        const refGreg = new Date(2023, 8, 11).getTime();
        const diffDays = Math.floor((now.getTime() - refGreg) / (1000 * 60 * 60 * 24));

        let ethYear = 2016, ethMonth = 0, ethDay = 1 + diffDays;
        while (ethDay > 30) {
            if (ethMonth < 12) { ethDay -= 30; ethMonth++; }
            else {
                const pagume = (ethYear + 1) % 4 === 0 ? 6 : 5;
                if (ethDay > pagume) { ethDay -= pagume; ethMonth = 0; ethYear++; }
                else break;
            }
        }

        const dateElement = document.querySelector('.date');
        if (dateElement) {
            const greg = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            dateElement.textContent = `${greg} | ${ethMonths[ethMonth]} ${ethDay}, ${ethYear} E.C.`;
        }
    }
}

// ===================================
// Initialization
// ===================================

window.addEventListener('load', () => {
    updateClock();
    setInterval(updateClock, 1000);

    fetchNotices();
    // Refresh content every 5 minutes
    setInterval(fetchNotices, 5 * 60 * 1000);

    // Kiosk optimizations
    document.addEventListener('contextmenu', e => e.preventDefault());

    // Wake Lock
    if ('wakeLock' in navigator) {
        navigator.wakeLock.request('screen').catch(e => console.log('Wake Lock denied'));
    }
});

// Fullscreen on F11 or Click
document.addEventListener('keydown', e => {
    if (e.key === 'F11' || e.key === 'f') {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen();
        else document.exitFullscreen();
    }
});
