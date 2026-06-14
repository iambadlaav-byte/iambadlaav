/**
 * Formatting utilities for currency, dates, and invoice numbers.
 * Uses dayjs for dates (2 KB, sufficient for IST display).
 */
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Format a number as Indian Rupees.
 * Examples: 15000 → "₹15,000"  |  1500.50 → "₹1,500.50"
 */
export function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a date in Indian Standard Time.
 * Defaults to IST (Asia/Kolkata, UTC+5:30).
 */
export function formatDate(date, tz = 'Asia/Kolkata', format = 'DD MMM YYYY') {
  return dayjs(date).tz(tz).format(format);
}

/**
 * Format a date + time for display (e.g. on receipts and email timestamps).
 */
export function formatDateTime(date, tz = 'Asia/Kolkata') {
  return dayjs(date).tz(tz).format('DD MMM YYYY, h:mm A');
}

/**
 * Pass through a pre-formatted invoice number string.
 * Invoice numbers are generated server-side as DNY/YYYY-YY/NNNNN.
 */
export function formatInvoiceNumber(invoiceNumber) {
  return invoiceNumber;
}
