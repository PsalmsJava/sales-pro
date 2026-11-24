/**
 * Utility functions for orders and customer dispatch details
 */

/**
 * Copies text to the clipboard with fallbacks for multiple browser environments.
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export const copyToClipboard = async (text) => {
    if (!text) return false;

    try {
        if (navigator?.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch (err) {
        // Fallback to execCommand if clipboard API fails
    }

    try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        textArea.setAttribute('readonly', '');
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
    } catch (err) {
        console.error('Failed to copy to clipboard:', err);
        return false;
    }
};

/**
 * Formats order customer details specifically for dispatch riders.
 * Suitable for pasting into WhatsApp, SMS, or Telegram.
 * @param {Object} order
 * @returns {string}
 */
export const formatCustomerForRider = (order) => {
    if (!order) return '';

    const customer = order.customer || {};
    const firstName = customer.firstName || '';
    const lastName = customer.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim() || 'N/A';
    const phone = customer.phone || 'N/A';
    const address = customer.address || '';
    const city = customer.city || '';
    const state = customer.state || '';
    const fullAddress = [address, city, state].filter(Boolean).join(', ') || 'N/A';

    const amount = typeof order.totalAmount === 'number'
        ? order.totalAmount
        : parseFloat(order.totalAmount || 0);
    const formattedAmount = isNaN(amount) ? '0.00' : amount.toLocaleString();

    const paymentText = order.isPaid
        ? 'PAID ONLINE (Do NOT collect money)'
        : `₦${formattedAmount} (PAYMENT ON DELIVERY)`;

    const lines = [
        '📦 *CUSTOMER DELIVERY DETAILS FOR RIDER*',
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        `👤 *Customer Name:* ${fullName}`,
        `📞 *Phone Number:* ${phone}`,
        `📍 *Delivery Address:* ${fullAddress}`,
        `🛍️ *Product:* ${order.productName || 'Order'} (Qty: ${order.quantity || 1})`,
        `💵 *Payment / Amount:* ${paymentText}`
    ];

    if (order.notes) {
        lines.push(`📝 *Notes:* ${order.notes}`);
    }

    if (order.id) {
        lines.push(`🔖 *Order Ref:* #${order.id.slice(0, 8)}`);
    }

    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return lines.join('\n');
};
