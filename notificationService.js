/**
 * Notification Service
 * Handles toast notifications and browser push notifications
 */

const NOTIFICATION_CONTAINER_ID = "wellness-notification-container";
const NOTIFICATIONS_KEY = "wellness_notifications";

/**
 * Initialize the notification container in the DOM
 */
function ensureNotificationContainer() {
  if (typeof window === "undefined") return;

  if (!document.getElementById(NOTIFICATION_CONTAINER_ID)) {
    const container = document.createElement("div");
    container.id = NOTIFICATION_CONTAINER_ID;
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      pointer-events: none;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 400px;
    `;
    document.body.appendChild(container);
  }
}

/**
 * Show a toast notification
 * @param {string} message - Notification message
 * @param {string} type - "success" | "error" | "info" | "warning"
 * @param {number} duration - Duration in milliseconds (0 = persistent)
 */
export function showToast(message, type = "info", duration = 5000) {
  if (typeof window === "undefined") return;

  ensureNotificationContainer();
  const container = document.getElementById(NOTIFICATION_CONTAINER_ID);

  const toast = document.createElement("div");
  const bgColor = {
    success: "#10b981",
    error: "#ef4444",
    info: "#3b82f6",
    warning: "#f59e0b",
  }[type] || "#3b82f6";

  const textColor = "#ffffff";

  toast.style.cssText = `
    background: ${bgColor};
    color: ${textColor};
    padding: 16px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-size: 14px;
    font-weight: 500;
    pointer-events: auto;
    animation: slideIn 0.3s ease-out;
    opacity: 1;
    transition: opacity 0.3s ease-out;
  `;

  toast.textContent = message;

  container.appendChild(toast);

  if (duration > 0) {
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  return toast;
}

/**
 * Request browser notification permission
 */
export async function requestNotificationPermission() {
  if (typeof window === "undefined") return false;
  if (!("Notification" in window)) return false;

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    try {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    } catch (err) {
      console.error("Notification permission error:", err);
      return false;
    }
  }

  return false;
}

/**
 * Send a browser push notification
 * @param {string} title - Notification title
 * @param {object} options - Notification options
 */
export function sendBrowserNotification(title, options = {}) {
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) return;

  if (Notification.permission === "granted") {
    try {
      const notification = new Notification(title, {
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        ...options,
      });

      if (options.onClick) {
        notification.onclick = options.onClick;
      }

      return notification;
    } catch (err) {
      console.error("Browser notification error:", err);
    }
  }
}

/**
 * Store notification in local history
 */
function storeNotificationHistory(notification) {
  if (typeof window === "undefined") return;

  try {
    const history = JSON.parse(window.localStorage.getItem(NOTIFICATIONS_KEY) || "[]");
    history.push({
      timestamp: new Date().toISOString(),
      ...notification,
    });

    // Keep only last 50 notifications
    if (history.length > 50) {
      history.shift();
    }

    window.localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(history));
  } catch (err) {
    console.error("Store notification history error:", err);
  }
}

/**
 * Send booking completion notification
 * @param {object} bookingDetails - Booking information
 */
export function notifyBookingComplete(bookingDetails) {
  const { counselorName, amount, bookingId, transactionId } = bookingDetails;

  // Toast notification
  showToast(
    `✓ Booking confirmed with ${counselorName}! Slot reserved.`,
    "success",
    6000
  );

  // Browser push notification
  sendBrowserNotification("Booking Confirmed!", {
    body: `Your consultation with ${counselorName} has been booked. Amount: ₹${amount}`,
    tag: `booking-${bookingId}`,
    requireInteraction: false,
  });

  // Store in history
  storeNotificationHistory({
    type: "booking",
    counselorName,
    amount,
    bookingId,
    transactionId,
  });
}

/**
 * Send activity completion notification
 */
export function notifyActivityComplete(activityName) {
  showToast(`✓ Great job! You completed ${activityName}`, "success", 5000);

  sendBrowserNotification("Activity Complete!", {
    body: `You finished "${activityName}". Keep going!`,
    tag: "activity-complete",
  });

  storeNotificationHistory({
    type: "activity",
    activityName,
  });
}

/**
 * Send general success notification
 */
export function notifySuccess(message) {
  showToast(message, "success", 4000);
  storeNotificationHistory({ type: "success", message });
}

/**
 * Send error notification
 */
export function notifyError(message) {
  showToast(message, "error", 5000);
  storeNotificationHistory({ type: "error", message });
}

/**
 * Get notification history
 */
export function getNotificationHistory() {
  if (typeof window === "undefined") return [];

  try {
    return JSON.parse(window.localStorage.getItem(NOTIFICATIONS_KEY) || "[]");
  } catch {
    return [];
  }
}

/**
 * Clear notification history
 */
export function clearNotificationHistory() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(NOTIFICATIONS_KEY);
}

// Add CSS animation for toast slide-in
if (typeof document !== "undefined" && !document.getElementById("wellness-toast-styles")) {
  const style = document.createElement("style");
  style.id = "wellness-toast-styles";
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
}
