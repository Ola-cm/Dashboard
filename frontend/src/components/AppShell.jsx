import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { IconMenu } from './icons';

const COLLAPSED_KEY = 'dashboard-sidebar-collapsed';

function readStoredCollapsed() {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === 'true';
  } catch {
    return false;
  }
}

export default function AppShell({ title, actions, children, contentClassName = '' }) {
  const [collapsed, setCollapsed] = useState(readStoredCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSED_KEY, String(collapsed));
    } catch {
      // Per-viewer convenience only — nothing breaks if it can't be persisted.
    }
  }, [collapsed]);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((prev) => !prev)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Same `fixed` + in-flow spacer approach as the sidebar, for the same reason: a sticky
            bar stops following the scroll once the dashboard's absolutely positioned widgets
            extend past the page's layout box. On desktop its left edge tracks the sidebar's width;
            below that the sidebar is a drawer, so the bar spans the screen and gets a menu button. */}
        <div aria-hidden="true" className="h-20 shrink-0" />
        <header
          className={`floating-glass fixed right-3 top-3 z-10 flex h-14 items-center justify-between gap-2 rounded-[22px] px-3 transition-[left] duration-200 ease-out left-3 lg:px-6 ${
            collapsed ? 'lg:left-[96px]' : 'lg:left-[264px]'
          }`}
        >
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-brown-600 hover:bg-brown-600/10 lg:hidden"
            >
              <IconMenu className="h-5 w-5" />
            </button>
            <h1 className="truncate font-display text-lg font-semibold text-brown-800 sm:text-xl">
              {title}
            </h1>
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
        <main className={`relative flex-1 ${contentClassName}`}>{children}</main>
      </div>
    </div>
  );
}
