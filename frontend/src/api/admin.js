/**
 * admin.js — Thin wrappers around the /api/v1/admin/* endpoints.
 *
 * Every function returns a Promise resolving to the parsed JSON body. Errors
 * propagate via axios — call sites handle them inline.
 *
 * Endpoints used here are all gated server-side by authenticate + requireAdmin,
 * so the access token (already injected by the request interceptor in client.js)
 * is the only auth concern at this layer.
 */
import { apiClient } from './client.js';

// ── Dashboard ────────────────────────────────────────────────────────────────

export async function fetchDashboardStats() {
  const { data } = await apiClient.get('/admin/dashboard');
  return data;
}

// ── Health (public — used by Settings page) ──────────────────────────────────

export async function fetchHealth() {
  const { data } = await apiClient.get('/health');
  return data;
}

// ── Batches ──────────────────────────────────────────────────────────────────

export async function listBatches(params = {}) {
  const { data } = await apiClient.get('/admin/batches', { params });
  return data; // { rows, nextCursor }
}

export async function createBatch(body) {
  const { data } = await apiClient.post('/admin/batches', body);
  return data.batch;
}

export async function updateBatch(id, body) {
  const { data } = await apiClient.patch(`/admin/batches/${id}`, body);
  return data.batch;
}

// ── Registrations ────────────────────────────────────────────────────────────

export async function listRegistrations(params = {}) {
  const { data } = await apiClient.get('/admin/registrations', { params });
  return data; // { rows, nextCursor }
}

export async function getRegistration(id) {
  const { data } = await apiClient.get(`/admin/registrations/${id}`);
  return data; // { registration, invoiceSignedUrl, auditRows }
}

export async function updateRegistrationStatus(id, status) {
  const { data } = await apiClient.patch(`/admin/registrations/${id}`, { status });
  return data;
}

export async function resendConfirmationEmail(id) {
  const { data } = await apiClient.post(`/admin/registrations/${id}/resend-email`);
  return data;
}

export async function inviteFromWaitlist(id) {
  const { data } = await apiClient.post(`/admin/registrations/${id}/waitlist-invite`);
  return data;
}

export async function markPaidManually(id) {
  const { data } = await apiClient.post(`/admin/registrations/${id}/mark-paid`);
  return data;
}

export async function markRefundedManually(id, reason) {
  const { data } = await apiClient.post(`/admin/registrations/${id}/mark-refunded`, { reason });
  return data;
}

export function registrationsCsvUrl(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return `/api/v1/admin/registrations/export.csv${qs ? `?${qs}` : ''}`;
}

// ── Reports ──────────────────────────────────────────────────────────────────

export async function fetchReports(params = {}) {
  const { data } = await apiClient.get('/admin/reports', { params });
  return data; // { groupBy, from, to, rows, totals, financialsVisible }
}

export function reportsCsvUrl(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return `/api/v1/admin/reports/export.csv${qs ? `?${qs}` : ''}`;
}

// ── Coupons ──────────────────────────────────────────────────────────────────

export async function listCoupons(params = {}) {
  const { data } = await apiClient.get('/admin/coupons', { params });
  return data; // { rows, nextCursor }
}

export async function createCoupon(body) {
  const { data } = await apiClient.post('/admin/coupons', body);
  return data.coupon;
}

export async function updateCoupon(id, body) {
  const { data } = await apiClient.patch(`/admin/coupons/${id}`, body);
  return data.coupon;
}

export async function deactivateCoupon(id) {
  return updateCoupon(id, { active: false });
}

// ── Enquiries ────────────────────────────────────────────────────────────────

export async function listEnquiries(params = {}) {
  const { data } = await apiClient.get('/admin/enquiries', { params });
  return data;
}

export async function getEnquiry(id) {
  const { data } = await apiClient.get(`/admin/enquiries/${id}`);
  return data.enquiry;
}

export async function updateEnquiryStatus(id, body) {
  const { data } = await apiClient.patch(`/admin/enquiries/${id}`, body);
  return data.enquiry;
}

// ── Invoices ─────────────────────────────────────────────────────────────────

export async function listInvoices(params = {}) {
  const { data } = await apiClient.get('/admin/invoices', { params });
  return data;
}

export async function viewInvoice(id) {
  const { data } = await apiClient.get(`/admin/invoices/${id}`);
  return data; // { url, invoiceNumber }
}

export async function resendInvoice(id) {
  const { data } = await apiClient.post(`/admin/invoices/${id}/resend`);
  return data;
}
