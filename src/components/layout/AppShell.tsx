import { LuArrowLeft } from 'react-icons/lu';
import { Link, Outlet, useLocation } from 'react-router-dom';

export function AppShell() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="dark-theme app-root-fullscreen">
      {!isHome && (
        <Link
          to="/"
          className="sim-back-button"
          aria-label="Volver al menú principal"
          title="Volver al menú principal"
        >
          <LuArrowLeft />
        </Link>
      )}

      <main
        key={location.pathname}
        className={`${isHome ? 'home-container-fullscreen' : 'sim-container-fullscreen'} view-transition-enter`}
      >
        <Outlet />
      </main>
    </div>
  );
}
