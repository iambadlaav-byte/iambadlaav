/**
 * AdminLayout — shell for every admin route.
 *
 * Desktop (lg+): fixed left sidebar + scrollable main column.
 * Mobile/tablet: topbar with hamburger that opens AdminDrawer.
 *
 * Every admin page renders inside <Outlet />. We also set robots=noindex at the
 * layout level so admin URLs never appear in search results even if accidentally
 * linked.
 */
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Menu } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar.jsx';
import { AdminDrawer } from './AdminDrawer.jsx';

export function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="min-h-screen bg-cream">
        {/* Desktop sidebar — fixed left */}
        <div className="hidden lg:block fixed inset-y-0 left-0 w-64 z-30">
          <AdminSidebar />
        </div>

        {/* Mobile drawer */}
        <AdminDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />

        {/* Main column */}
        <div className="lg:pl-64 flex flex-col min-h-screen">
          {/* Mobile topbar */}
          <header className="lg:hidden sticky top-0 z-20 bg-cream/95 backdrop-blur border-b border-muted/20 px-4 py-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation"
              className="p-2 -ml-2 rounded text-charcoal hover:bg-soft focus:outline focus:outline-2 focus:outline-teal focus:outline-offset-2"
            >
              <Menu size={20} />
            </button>
            <p className="font-display text-lg font-light text-charcoal leading-none">
              Badlaav <span className="font-mono text-[10px] uppercase tracking-widest text-muted ml-1">Admin</span>
            </p>
          </header>

          {/* Page content */}
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}
