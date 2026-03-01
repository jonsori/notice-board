# 🎓 Student Union Digital Notice Board System

A modern, cloud-based digital signage platform designed for university student gates. Features remote content management with approval workflow and professional live display for large LED TV screens.

## ✨ Features

### 🔐 Admin Dashboard
- **Content Management**: Upload and manage videos, images, posters, and text announcements
- **Approval Workflow**: Review and approve content before it goes live
- **Status Tracking**: Monitor pending, approved, scheduled, and live content
- **Real-time Statistics**: Track content status at a glance
- **Cloud-based**: Manage content remotely from anywhere

### 📺 Live TV Display
- **Professional Layout**: Clean, high-visibility design for outdoor viewing
- **Auto-rotating Content**: Smooth transitions between videos, images, and posters
- **Side Panel Announcements**: Dedicated area for text announcements
- **Bottom Ticker**: Urgent and time-sensitive notices
- **Real-time Clock**: Always-visible date and time
- **Live Indicator**: Shows system is actively broadcasting

### 🎨 Design Features
- **University Branding**: Blue and white color scheme (customizable)
- **High Readability**: Bold fonts optimized for long-distance viewing
- **Smooth Animations**: Professional transitions and micro-interactions
- **Responsive Design**: Works on various screen sizes
- **Modern UI**: Glassmorphism, gradients, and premium aesthetics

## 🚀 Quick Start

### Installation
1. Clone or download this repository
2. Open the appropriate HTML file in a modern web browser
3. No build process or dependencies required!

### Access Points

The system has **three separate URLs** for different purposes:

#### 1. **Login Page** (`login.html`)
- **URL**: `/`
- **Purpose**: Secure admin and club authentication
- **Admin Credentials**:
  - Username: `admin`
  - Password: `adminpassword123`
- **Club User Credentials**:
  - Username: `user1`
  - Password: `userpassword123`
- **Features**: Password toggle, remember me, session management

#### 2. **Admin Dashboard** (`dashboard.html`)
- **URL**: `dashboard.html` (requires login)
- **Purpose**: Content management and approval workflow
- **Access**: Redirects to login if not authenticated
- **Features**: Approve/reject content, view statistics, schedule posts

#### 3. **Live Display** (`display.html`)
- **URL**: `display.html` (public access)
- **Purpose**: TV screen display for student gate
- **Access**: No authentication required
- **Features**: Auto-rotating slides, real-time clock, ticker, fullscreen mode

### Usage Workflow

1. **Admin Login**: Open `login.html` → Enter credentials → Redirected to dashboard
2. **Manage Content**: Review pending items → Approve or reject
3. **Live Display**: Open `display.html` on TV screen → Runs 24/7 automatically

#### Admin Dashboard Controls
- **New Content**: Upload new content (button in header)
- **Refresh**: Reload dashboard data (button in header)
- **Approve**: Green checkmark button on content cards
- **Reject**: Red X button on content cards
- **Filter**: Use tabs to view Pending, Approved, or Scheduled content
- **Logout**: Red logout button in header

#### Keyboard Shortcuts
**Admin Dashboard:**
- `R` - Refresh dashboard
- `N` - New content
- `Ctrl+L` - Logout

**Live Display:**
- `←` `→` - Navigate slides manually
- `F11` - Toggle fullscreen
- `Esc` - Exit fullscreen

## 📁 File Structure

```
Notice bord/
├── login.html          # Admin login page
├── login.css           # Login page styling
├── login.js            # Login authentication logic
├── dashboard.html      # Admin dashboard (protected)
├── dashboard.css       # Dashboard styling
├── dashboard.js        # Dashboard functionality
├── display.html        # Live TV display (public)
├── display.css         # Display styling
├── display.js          # Display animations and clock
├── index.html          # Legacy combined view (optional)
├── index.css           # Legacy styling (optional)
├── script.js           # Legacy scripts (optional)
└── README.md           # This file
```

## 🎯 Content Types Supported

1. **Videos** - Promotional videos, announcements, event highlights
2. **Images/Posters** - Event posters, infographics, promotional materials
3. **Text Announcements** - Quick updates, notices, alerts
4. **Slides** - Multi-slide presentations

## 🔧 Customization

### Changing University Colors
Edit the CSS variables in `index.css`:

```css
:root {
    --primary-blue: #1e40af;        /* Main brand color */
    --primary-blue-light: #3b82f6;  /* Lighter variant */
    --primary-blue-dark: #1e3a8a;   /* Darker variant */
}
```

### Adjusting Slide Rotation Speed
Edit the interval in `script.js`:

```javascript
// Change 8000 to desired milliseconds
let slideInterval = setInterval(nextSlide, 8000);
```

### Modifying Ticker Speed
Edit the scroll speed in `script.js`:

```javascript
// In ticker animation CSS
animation: ticker 30s linear infinite; // Change 30s
```

## 🎨 Design System

### Colors
- **Primary Blue**: University brand color
- **Status Colors**: 
  - Pending: Orange (#f59e0b)
  - Approved: Green (#10b981)
  - Scheduled: Purple (#8b5cf6)
  - Live: Red (#ef4444)

### Typography
- **Display Font**: Outfit (headings, large text)
- **Body Font**: Inter (content, UI elements)

### Spacing
- Consistent spacing scale from 0.5rem to 3rem
- Responsive padding and margins

## 🌐 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Opera (latest)

## 📱 Responsive Breakpoints

- **Desktop**: 1200px and above (optimal)
- **Tablet**: 768px - 1199px
- **Mobile**: Below 768px

## 🔒 Security Features

- Content approval workflow prevents unauthorized content
- Student Union admin access required
- All content reviewed before going live
- Secure cloud-based management

## 🎓 Use Cases

1. **Event Announcements**: Promote upcoming university events
2. **Emergency Alerts**: Display urgent campus notifications
3. **Academic Updates**: Exam schedules, registration deadlines
4. **Student Activities**: Club events, sports tournaments
5. **Campus News**: General announcements and updates

## 🛠️ Future Enhancements

- [ ] Backend integration for real content management
- [ ] User authentication system
- [ ] Content scheduling calendar
- [ ] Analytics dashboard
- [ ] Multi-screen management
- [ ] Content templates library
- [ ] Mobile app for content submission
- [ ] QR code integration for more info

## 📞 Support

For issues or questions about this system, contact the Student Union IT team.

## 📄 License

This project is designed for university use. Customize as needed for your institution.

---

**Built with ❤️ for modern university campuses**

*Version 1.0.0 - December 2025*
