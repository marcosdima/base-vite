import { FiGrid, FiHome, FiLayers, FiLogIn, FiLogOut, FiUserPlus } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { LanguageSwitcher, ThemeChanger } from '@/components/switches';
import { APP_CONFIG } from '@/config/app.config';
import { logout, selectAuthUser, selectIsAuthenticated } from '@/features/auth/authSlice';
import { Brand, Controls, GhostButton, Nav, Shell, StyledNavLink, Topbar } from './AppShell.styles';

interface NavLinkItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

export function AppShell() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const authUser = useAppSelector(selectAuthUser);

  // Declarative link list keeps adding new routes low friction.
  const primaryLinks: NavLinkItem[] = [
    { to: '/', label: t('nav.home'), icon: <FiHome /> },
    { to: '/playground', label: t('nav.playground'), icon: <FiLayers /> },
    { to: '/dashboard', label: t('nav.dashboard'), icon: <FiGrid /> },
  ];

  const secondaryLinks: NavLinkItem[] = isAuthenticated
    ? []
    : [
        { to: '/login', label: t('nav.login'), icon: <FiLogIn /> },
        { to: '/signin', label: t('nav.signIn'), icon: <FiUserPlus /> },
      ];

  return (
    <Shell>
      <Topbar
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <Brand>{APP_CONFIG.name}</Brand>

        <Controls>
          <Nav aria-label={t('layout.primaryNavigation')}>
            {primaryLinks.map((link) => (
              <StyledNavLink key={link.to} to={link.to} end={link.to === '/'}>
                {link.icon}
                <span>{link.label}</span>
              </StyledNavLink>
            ))}

            {secondaryLinks.map((link) => (
              <StyledNavLink key={link.to} to={link.to}>
                {link.icon}
                <span>{link.label}</span>
              </StyledNavLink>
            ))}
          </Nav>

          <LanguageSwitcher />
          <ThemeChanger />

          {isAuthenticated ? (
            <GhostButton type="button" onClick={() => dispatch(logout())}>
              <FiLogOut />
              <span>
                {t('layout.logout')}
                {authUser?.username || authUser?.name
                  ? ` · ${authUser?.username ?? authUser?.name}`
                  : ''}
              </span>
            </GhostButton>
          ) : null}
        </Controls>
      </Topbar>

      <main>
        <Outlet />
      </main>
    </Shell>
  );
}
