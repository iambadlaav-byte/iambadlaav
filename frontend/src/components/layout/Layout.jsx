/**
 * Layout — shared shell for all public routes.
 * Composes: Header + <Outlet> + Footer + WhatsAppFloatingButton.
 * MobileNav is rendered inside Header (it owns the open/close state).
 */
import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import WhatsAppFloatingButton from './WhatsAppFloatingButton.jsx';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFloatingButton />
    </div>
  );
}
