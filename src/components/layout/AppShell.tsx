import { FiGrid, FiHome, FiLogIn, FiLogOut, FiUserPlus } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import { logout, selectAuthUser, selectIsAuthenticated } from '../../features/auth/authSlice';
import {
  Brand,
  Controls,
  GhostButton,
  Nav,
  Shell,
  StyledNavLink,
  Topbar,
} from '../../styles/components/appShell.styles';
import { LanguageSwitcher } from '../features/switches/LanguageSwitcher';
import { ThemeChanger } from '../features/switches/ThemeChanger';

interface NavLinkItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

export function AppShell() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authUser = useSelector(selectAuthUser);

  // These links stay declarative so adding pages later is low friction.
  const primaryLinks: NavLinkItem[] = [
    { to: '/', label: t('nav.home'), icon: <FiHome /> },
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
        <Brand>{t('layout.brand')}</Brand>

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
