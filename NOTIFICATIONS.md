# Notification System Guide

This project now includes a comprehensive notification system for user engagement and feedback. Here's how to use it.

## Overview

The notification system provides:
1. **Toast Notifications** – Floating messages at top-right (auto-close or persistent)
2. **Browser Push Notifications** – Appear even when the browser/tab is not focused
3. **Notification History** – Stored in localStorage for tracking

## Setup

### Already Integrated In:
- ✅ **Booking Completion** (`ConsultingPage.jsx`) – Shows toast + push when user books a consultant
- ✅ **Activity Completion** (`ActivityPage.jsx`) – Shows toast + push when activity timer finishes
- ✅ **Mood Game** – Ready to integrate (see examples below)
- ✅ **Screening Results** (PHQ9/GAD7) – Ready to integrate

## API Reference

### `notificationService.js`

#### 1. Toast Notifications

```javascript
import { showToast } from './notificationService';

// Success message (auto-closes in 4 seconds)
showToast('Profile updated successfully!', 'success', 4000);

// Error message (stays 5 seconds)
showToast('Failed to save. Try again.', 'error', 5000);

// Info message
showToast('New features available', 'info', 4000);

// Warning message
showToast('Session expiring soon', 'warning', 6000);

// Persistent message (duration: 0)
showToast('Important: Read this carefully', 'info', 0);
```

**Types:** `'success'` | `'error'` | `'info'` | `'warning'`  
**Duration:** milliseconds (0 = persistent)

#### 2. Browser Push Notifications

```javascript
import { requestNotificationPermission, sendBrowserNotification } from './notificationService';

// Request user permission (runs once, user can deny)
await requestNotificationPermission();

// Send a push notification
sendBrowserNotification('Appointment Confirmed', {
  body: 'Your session with Dr. Smith is scheduled for 2:00 PM',
  tag: 'appointment-123', // Prevent duplicates
  requireInteraction: false, // Auto-dismiss after a few seconds
});

// With click callback
sendBrowserNotification('New Message', {
  body: 'Your counselor replied to your message',
  tag: 'message-456',
  onClick: () => { window.location.href = '/messages'; },
});
```

#### 3. Pre-made Notification Functions

```javascript
import {
  notifyBookingComplete,
  notifyActivityComplete,
  notifySuccess,
  notifyError,
} from './notificationService';

// Booking confirmation
notifyBookingComplete({
  counselorName: 'Dr. Sarah',
  amount: 499,
  bookingId: 'BK123',
  transactionId: 'TXN456',
});

// Activity completion
notifyActivityComplete('Deep Breathing Exercise');

// General success
notifySuccess('Settings saved!');

// General error
notifyError('Connection lost. Please try again.');
```

#### 4. Notification History

```javascript
import { getNotificationHistory, clearNotificationHistory } from './notificationService';

// Get all stored notifications
const history = getNotificationHistory();
console.log(history);
// Output:
// [
//   { timestamp: '2026-03-29T10:30:00.000Z', type: 'booking', counselorName: 'Dr. Sarah', ... },
//   { timestamp: '2026-03-29T10:25:00.000Z', type: 'activity', activityName: 'Deep Breathing', ... },
//   ...
// ]

// Clear history
clearNotificationHistory();
```

## Usage Examples

### Example 1: Quick Integration in Mood Game

File: `MoodGamePage.jsx`

```javascript
import { notifySuccess, showToast } from './notificationService';

// Inside the game logic when user wins
function onGameWin() {
  const score = calculateScore();
  recordMoodGame(score);
  
  // Toast + push notification
  notifySuccess(`🎉 Awesome score: ${score}!`);
  
  // Or custom message
  showToast(`Level up! Try the next difficulty.`, 'info', 4000);
}
```

### Example 2: Profile Settings Completion

File: `AuthPage.jsx` (Profile form submission)

```javascript
import { notifySuccess, notifyError } from './notificationService';

async function handleProfileSave(event) {
  // ... existing code ...
  
  try {
    // Save profile
    await saveProfile(...);
    
    // Success notification
    notifySuccess('Profile updated! Changes saved.');
    
  } catch (err) {
    notifyError(`Error: ${err.message}`);
  }
}
```

### Example 3: Screening Results

File: `PHQ9Page.jsx` or `GAD7Page.jsx`

```javascript
import { showToast } from './notificationService';

function handleScreeningComplete() {
  const score = calculateScore();
  recordScreening(score);
  
  const severity = getSeverity(score);
  const message = score > 20 
    ? `High score (${score}). Consider consulting a professional.`
    : `Your score: ${score}. Continue self-care practices.`;
  
  showToast(message, severity > 15 ? 'warning' : 'info', 6000);
}
```

## Browser Notification Permission

The system automatically requests notification permission when:
1. User completes a booking
2. User finishes an activity

Users can grant/deny permission in their browser settings.

**Note:** Push notifications only work when:
- User granted permission
- Browser supports `Notification` API
- Tab is active or browser has focus

## Customizing Toast Styles

Edit styles in `notificationService.js`, section "Toast Notification":

```javascript
// In showToast function, modify these colors:
const bgColor = {
  success: "#10b981",   // Green
  error: "#ef4444",     // Red
  info: "#3b82f6",      // Blue
  warning: "#f59e0b",   // Amber
}[type];
```

Or override in your own CSS:

```css
#wellness-notification-container {
  top: 20px;           /* Move to bottom: bottom: 20px; */
  right: 20px;         /* Or left: left: 20px; */
  max-width: 400px;    /* Adjust width */
}
```

## Data Privacy

- Notifications are stored in browser `localStorage` under key: `wellness_notifications`
- Up to 50 most recent notifications are kept
- Older notifications are automatically removed
- Data is cleared only when user calls `clearNotificationHistory()`

## Browser Support

| Browser | Toast | Push |
|---------|-------|------|
| Chrome | ✅ | ✅ |
| Firefox | ✅ | ✅ |
| Safari | ✅ | ⚠️ (Mac only) |
| Edge | ✅ | ✅ |
| Safari iOS | ✅ | ❌ |

## FAQ

**Q: How do I disable notifications?**  
A: Users can deny permission when the browser asks, or disable in browser settings.

**Q: Can I send email/SMS notifications?**  
A: This system is frontend-only. For emails/SMS, integrate with a service like:
- SendGrid (email)
- Twilio (SMS)
- Firebase Cloud Messaging

**Q: Can I customize notification icons?**  
A: Yes, in `notificationService.js`, the `sendBrowserNotification` function uses:
```javascript
icon: "/favicon.ico",      // Update path
badge: "/favicon.ico",     // Update path
```

**Q: How do I test push notifications?**  
A: In browser dev tools:
```javascript
// Open console and run:
new Notification('Test', { body: 'This is a test' });
```

## Next Steps

1. **Email integration** – Add transactional emails for bookings via Firebase Functions or SendGrid
2. **SMS alerts** – Send booking reminders via Twilio
3. **Notification preferences** – Let users choose which notifications they want
4. **In-app notification center** – Create a page showing notification history
