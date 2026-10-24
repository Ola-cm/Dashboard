import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { DESKTOP_QUERY, useMediaQuery } from '../hooks/useMediaQuery';
import { useTheme } from '../hooks/useTheme';
import {
  IconAdmin,
  IconCherry,
  IconDashboard,
  IconLogout,
  IconMoon,
  IconProfile,
  IconServices,
  IconSpider,
  IconSun,
  IconTheme,
} from './icons';

// Each theme gets its own icon in the cycle button below, so the icon itself tells you which
// theme is active — not just its target/next state like a plain two-way toggle would.
const THEME_META = {
  light: { Icon: IconSun, label: 'Light' },
  dark: { Icon: IconMoon, label: 'Dark' },
  spider: { Icon: IconSpider, label: 'Spider' },
  cherry: { Icon: IconCherry, label: 'Cherry' },
};

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: IconDashboard, end: true },
  { to: '/services', label: 'Services', icon: IconServices },
  { to: '/theme', label: 'Theme', icon: IconTheme },
  { to: '/profile', label: 'Profile', icon: IconProfile },
];

// `collapsed` lives in AppShell, not here: the floating top bar also has to know the sidebar's
// width to sit right next to it. Below the desktop breakpoint the sidebar is an off-canvas
// drawer (`mobileOpen`) that is always shown expanded, so `collapsed` only applies on desktop.
export default function Sidebar({
  collapsed: collapsedPref,
  onToggleCollapsed,
  mobileOpen,
  onCloseMobile,
}) {
  const { user, logout } = useAuth();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const collapsed = collapsedPref && isDesktop;

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const onKeyDown = (event) => event.key === 'Escape' && onCloseMobile();
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen, onCloseMobile]);
  const { theme, cycleTheme } = useTheme();
  const { Icon: ThemeIcon, label: themeLabel } = THEME_META[theme];

  const items =
    user.role === 'ADMIN'
      ? [...NAV_ITEMS, { to: '/admin', label: 'Admin', icon: IconAdmin }]
      : NAV_ITEMS;

  // `fixed` rather than `sticky`: dashboard widgets are absolutely positioned, so they never grow
  // the page's layout box, and a sticky sidebar would stop following the scroll once it reached
  // the bottom of that box. The in-flow spacer reserves the sidebar's width (plus its margins) so
  // the page content still starts to its right.
  return (
    <>
      <div
        aria-hidden="true"
        className={`hidden shrink-0 transition-[width] duration-200 ease-out lg:block ${
          collapsed ? 'w-[96px]' : 'w-[264px]'
        }`}
      />
      {mobileOpen && (
        <div
          aria-hidden="true"
          onClick={onCloseMobile}
          className="fixed inset-0 z-30 bg-brown-900/40 backdrop-blur-sm lg:hidden"
        />
      )}
      <aside
        className={`floating-glass fixed bottom-3 left-3 top-3 z-40 flex flex-col overflow-y-auto rounded-[28px] px-3 py-4 transition-[width,transform] duration-200 ease-out lg:z-20 ${
          collapsed ? 'w-[72px]' : 'w-60'
        } ${mobileOpen ? '' : 'max-lg:pointer-events-none max-lg:-translate-x-[120%]'}`}
      >
        <button
          type="button"
          onClick={isDesktop ? onToggleCollapsed : onCloseMobile}
          aria-label={
            isDesktop ? (collapsed ? 'Expand sidebar' : 'Collapse sidebar') : 'Close menu'
          }
          aria-expanded={isDesktop ? !collapsed : undefined}
          title={isDesktop ? (collapsed ? 'Expand sidebar' : 'Collapse sidebar') : 'Close menu'}
          className={`mb-6 flex items-center gap-2 rounded-xl px-2 py-1 transition-[background-color,transform] duration-150 ease-[var(--ease-out)] hover:bg-brown-600/10 active:scale-[0.97] ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brown-600 font-display font-bold text-cream shadow shadow-brown-900/20">
            D
          </span>
          {!collapsed && (
            <span className="truncate font-display text-base font-semibold text-brown-800">
              Dashboard
            </span>
          )}
        </button>

        <nav className="flex-1 space-y-1">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onCloseMobile}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  collapsed ? 'justify-center' : ''
                } ${
                  isActive
                    ? 'bg-brown-600 text-cream shadow shadow-brown-900/20'
                    : 'text-brown-500 hover:bg-brown-600/10 hover:text-brown-700'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-4 space-y-1 border-t border-card-2/60 pt-4">
          <button
            type="button"
            onClick={cycleTheme}
            title={collapsed ? `Theme: ${themeLabel} (click to change)` : undefined}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-brown-500 hover:bg-brown-600/10 hover:text-brown-700 ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <ThemeIcon className="h-4 w-4 shrink-0" />
            {!collapsed && `${themeLabel} theme`}
          </button>

          <div className={`flex items-center gap-2 px-2 py-1 ${collapsed ? 'justify-center' : ''}`}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brown-600 text-xs font-semibold text-cream">
              {user.name.slice(0, 1).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-brown-800">{user.name}</p>
                <p className="truncate text-xs text-brown-400">{user.email}</p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={logout}
            title={collapsed ? 'Log out' : undefined}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-brown-500 hover:bg-brown-600/10 hover:text-brown-700 ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <IconLogout className="h-4 w-4 shrink-0" />
            {!collapsed && 'Log out'}
          </button>
        </div>
      </aside>
    </>
  );
}
