/**
 * AdminSidebar — desktop navigation rail + mobile drawer body.
 *
 * Single source of truth for the nav-item array and the logout button so the
 * desktop fixed sidebar and the mobile Radix Dialog drawer render identically.
 *
 * Renders inside <AdminLayout /> (desktop, always visible at lg+) and inside
 * <AdminDrawer /> (mobile/tablet, slide-out). The drawer passes onNavigate
 * to auto-close itself when a link is clicked.
 */
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarClock,
  TicketPercent,
  Users,
  BarChart3,
  Inbox,
  HeartHandshake,
  FileText,
  BookOpen,
  Image,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '../../lib/cn.js';
import { useAuth } from '../../context/AuthContext.jsx';

// Friendly role labels + token-based pill colors. Mirrors StatusBadge styling
// (rounded, bordered, font-mono uppercase). Display only — no permission logic.
const ROLE_BADGE = {
  SUPERADMIN:  { label: 'Super Admin', classes: 'bg-ochre/20 text-ochre border-ochre/40' },
  ADMIN:       { label: 'Admin',       classes: 'bg-gold/15 text-gold border-gold/30' },
  CONTRIBUTOR: { label: 'Contributor', classes: 'bg-teal/15 text-teal border-teal/30' },
  VIEWER:      { label: 'Viewer',      classes: 'bg-pearl/10 text-pearl/70 border-pearl/20' },
};

// adminOnly items (financials, user management) are hidden from Contributor/Viewer.
export const ADMIN_NAV_ITEMS = [
  { to: '/admin/dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
  { to: '/admin/batches',       label: 'Batches',       icon: CalendarClock },
  { to: '/admin/coupons',       label: 'Coupons',       icon: TicketPercent, adminOnly: true },
  { to: '/admin/registrations', label: 'Registrations', icon: Users },
  { to: '/admin/reports',       label: 'Reports',       icon: BarChart3 },
  { to: '/admin/enquiries',     label: 'Enquiries',     icon: Inbox },
  { to: '/admin/volunteers',    label: 'Volunteers',    icon: HeartHandshake },
  { to: '/admin/invoices',      label: 'Invoices',      icon: FileText, adminOnly: true },
  { to: '/admin/stories',       label: 'Stories',       icon: BookOpen },
  { to: '/admin/gallery',       label: 'Gallery',       icon: Image },
  { to: '/admin/settings',      label: 'Settings',      icon: Settings, adminOnly: true },
];

export function AdminSidebar({ onNavigate }) {
  const { user, logout } = useAuth();
  const isAdminTier = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';
  const navItems = ADMIN_NAV_ITEMS.filter((item) => !item.adminOnly || isAdminTier);
  const roleBadge = user?.role ? ROLE_BADGE[user.role] : null;

  return (
    <aside className="h-full flex flex-col bg-ink text-pearl">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-pearl/10">
        <p className="font-display text-xl font-light leading-none">Badlaav</p>
        <p className="font-mono text-[10px] uppercase tracking-widest text-pearl/60 mt-1">
          Admin
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto" aria-label="Admin navigation">
        <ul className="flex flex-col gap-0.5">
          {navItems.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded',
                    'font-sans text-sm transition-colors duration-100',
                    isActive
                      ? 'bg-pearl/15 text-pearl font-medium'
                      : 'text-pearl/70 hover:bg-pearl/5 hover:text-pearl'
                  )
                }
              >
                <Icon size={16} aria-hidden="true" />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User + logout */}
      <div className="px-3 py-4 border-t border-pearl/10">
        {user && (
          <div className="px-2 mb-2">
            <p className="text-sm font-sans text-pearl truncate">{user.name || user.email}</p>
            {roleBadge ? (
              <span
                className={cn(
                  'inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full border',
                  'font-mono text-[10px] uppercase tracking-widest font-medium',
                  roleBadge.classes,
                )}
              >
                {roleBadge.label}
              </span>
            ) : (
              <p className="text-[11px] font-mono uppercase tracking-widest text-pearl/50 mt-1">
                {user.role}
              </p>
            )}
          </div>
        )}
        <button
          type="button"
          onClick={() => { onNavigate?.(); logout(); }}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded',
            'font-sans text-sm text-pearl/70 hover:bg-pearl/5 hover:text-pearl',
            'transition-colors duration-100'
          )}
        >
          <LogOut size={16} aria-hidden="true" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
