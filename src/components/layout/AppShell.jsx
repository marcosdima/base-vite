import { FiGrid, FiHome, FiLogIn, FiLogOut, FiUserPlus } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { Outlet } from 'react-router-dom'
import { logout, selectAuthUser, selectIsAuthenticated } from '../../features/auth/authSlice'
import {
  Brand,
  Controls,
  GhostButton,
  Nav,
  Shell,
  StyledNavLink,
  Topbar,
} from '../../styles/components/appShell.styles'
import { LanguageSwitcher } from '../ui/LanguageSwitcher'


export function AppShell() {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const authUser = useSelector(selectAuthUser)

  // These links stay declarative so adding pages later is low friction.
  const primaryLinks = [
    { to: '/', label: t('nav.home'), icon: <FiHome /> },
    { to: '/dashboard', label: t('nav.dashboard'), icon: <FiGrid /> },
  ]

  const secondaryLinks = isAuthenticated
    ? []
    : [
        { to: '/login', label: t('nav.login'), icon: <FiLogIn /> },
        { to: '/sign-up', label: t('nav.signUp'), icon: <FiUserPlus /> },
      ]

  return (
    <Shell>
      <Topbar
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <Brand>App</Brand>

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

          {isAuthenticated ? (
            <GhostButton type="button" onClick={() => dispatch(logout())}>
              <FiLogOut />
              <span>
                {t('layout.logout')}
                {authUser?.name ? ` · ${authUser.name}` : ''}
              </span>
            </GhostButton>
          ) : null}
        </Controls>
      </Topbar>

      <main>
        <Outlet />
      </main>
    </Shell>
  )
}