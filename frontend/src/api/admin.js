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

// ── Authenticated CSV download ────────────────────────────────────────────────
//
// Protected GET endpoints (e.g. /admin/*/export.csv) require the Authorization
// header injected by the apiClient request interceptor. A plain <a href> link
// navigation does NOT carry that header, so it 401s. This helper fetches the file
// as a blob (auth header attached) and saves it via a temporary anchor.
//
// @param {string} path     — apiClient-relative path (e.g. '/admin/reports/export.csv')
// @param {object} params   — query params object
// @param {string} filename — suggested download filename
export async function downloadCsv(path, params = {}, filename = 'export.csv') {
  const res = await apiClient.get(path, { params, responseType: 'blob' });
  const url = window.URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke on the next tick so the click has a chance to start the download.
  setTimeout(() => window.URL.revokeObjectURL(url), 0);
}

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

// SUPERADMIN-only hard delete (server enforces). 409 if the batch has registrations.
export async function deleteBatch(id) {
  const { data } = await apiClient.delete(`/admin/batches/${id}`);
  return data; // { ok: true, deletedId }
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

export async function deleteRegistration(id) {
  const { data } = await apiClient.delete(`/admin/registrations/${id}`);
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

// Hard delete (Editor tier). Distinct from deactivate — frees the code for reuse.
export async function deleteCoupon(id) {
  const { data } = await apiClient.delete(`/admin/coupons/${id}`);
  return data; // { ok: true }
}

// ── Stories (retreat stories CMS) ────────────────────────────────────────────

export async function listStories(params = {}) {
  const { data } = await apiClient.get('/admin/stories', { params });
  return data; // { rows, nextCursor }
}

export async function createStory(body) {
  const { data } = await apiClient.post('/admin/stories', body);
  return data.story;
}

export async function updateStory(id, body) {
  const { data } = await apiClient.patch(`/admin/stories/${id}`, body);
  return data.story;
}

export async function archiveStory(id) {
  const { data } = await apiClient.post(`/admin/stories/${id}/archive`);
  return data.story;
}

/**
 * Upload one story photo as multipart/form-data (field name 'image').
 * Returns the Cloudinary secure_url, which the caller pushes into photos[].
 */
export async function uploadStoryPhoto(file) {
  const formData = new FormData();
  formData.append('image', file);
  const { data } = await apiClient.post('/admin/stories/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.url;
}

// ── Gallery (gallery CMS) ─────────────────────────────────────────────────────

export async function listGalleryItems(params = {}) {
  const { data } = await apiClient.get('/admin/gallery', { params });
  return data.rows;
}

export async function createGalleryItem(body) {
  const { data } = await apiClient.post('/admin/gallery', body);
  return data.item;
}

export async function updateGalleryItem(id, body) {
  const { data } = await apiClient.patch(`/admin/gallery/${id}`, body);
  return data.item;
}

export async function deleteGalleryItem(id) {
  const { data } = await apiClient.delete(`/admin/gallery/${id}`);
  return data;
}

/**
 * Upload one gallery image as multipart/form-data (field name 'image').
 * Returns the Cloudinary secure_url to pair with the mandatory altText on create.
 */
export async function uploadGalleryImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  const { data } = await apiClient.post('/admin/gallery/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.url;
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

// Admin-tier hard delete.
export async function deleteEnquiry(id) {
  const { data } = await apiClient.delete(`/admin/enquiries/${id}`);
  return data; // { ok: true }
}

// ── Volunteers ───────────────────────────────────────────────────────────────

export async function listVolunteers(params = {}) {
  const { data } = await apiClient.get('/admin/volunteers', { params });
  return data; // { rows, counts, byBatch }
}

export async function getVolunteerDetail(id) {
  const { data } = await apiClient.get(`/admin/volunteers/${id}`);
  return data.volunteer;
}

export async function updateVolunteerStatus(id, status) {
  const { data } = await apiClient.patch(`/admin/volunteers/${id}`, { status });
  return data.volunteer;
}

// Admin-tier hard delete.
export async function deleteVolunteer(id) {
  const { data } = await apiClient.delete(`/admin/volunteers/${id}`);
  return data; // { ok: true }
}

// ── Staff users (Admin only) ─────────────────────────────────────────────────

export async function listStaffUsers() {
  const { data } = await apiClient.get('/admin/users');
  return data.rows; // [{ id, name, email, role, lastLoginAt, createdAt, hasPassword }]
}

export async function createStaffUser(body) {
  const { data } = await apiClient.post('/admin/users', body);
  return data.user;
}

export async function updateStaffUserRole(id, role) {
  const { data } = await apiClient.patch(`/admin/users/${id}/role`, { role });
  return data.user;
}

export async function resetUserPassword(id, password) {
  const { data } = await apiClient.post(`/admin/users/${id}/reset-password`, { password });
  return data; // { ok: true }
}

export async function deleteStaffUser(id) {
  const { data } = await apiClient.delete(`/admin/users/${id}`);
  return data; // { ok: true }
}

// ── Login activity (Admin only) ──────────────────────────────────────────────

/**
 * Fetch login activity by merging successful and failed admin sign-ins.
 *
 * The backend audit filter only accepts one `action` at a time, so we fire two
 * requests in parallel and merge — newest first.
 */
export async function fetchLoginLogs(limit = 50) {
  const [success, failed] = await Promise.all([
    apiClient.get('/admin/audit', { params: { action: 'admin.login.success', limit } }),
    apiClient.get('/admin/audit', { params: { action: 'admin.login.failed', limit } }),
  ]);
  const rows = [...(success.data.rows ?? []), ...(failed.data.rows ?? [])];
  rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return rows;
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
