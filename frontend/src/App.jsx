import AppRoutes from './routes.jsx';

/**
 * App — thin shell that renders the route tree.
 * Global providers are in main.jsx (AuthProvider, HelmetProvider, BrowserRouter).
 */
export default function App() {
  return <AppRoutes />;
}
