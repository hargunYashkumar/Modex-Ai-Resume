import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore from '../../store/authStore'
import { useScrollToTop } from '../../hooks'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: <IconDashboard /> },
  { to: '/resumes',   label: 'Resumes',   icon: <IconResume /> },
  { to: '/jobs',      label: 'Jobs',       icon: <IconBriefcase /> },
  { to: '/courses',   label: 'Courses',    icon: <IconBook /> },
  { to: '/profile',   label: 'Profile',    icon: <IconUser /> },
]

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  useScrollToTop()

  const handleLogout = () => { logout(); navigate('/auth') }

  return (
    <div className="flex h-screen bg-stone-50 overflow-hidden">
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink-900/40 z-20 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 220 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className={`
          hidden lg:flex flex-col bg-ink-700 text-stone-100 z-30
          border-r border-ink-600 flex-shrink-0 overflow-hidden
        `}
      >
        <SidebarContent collapsed={collapsed} user={user} onLogout={handleLogout} />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mx-3 mb-4 p-2 rounded text-ink-300 hover:text-stone-50 hover:bg-ink-600 transition-colors flex items-center justify-center"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d={collapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'} />
          </svg>
        </button>
      </motion.aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed left-0 top-0 h-full w-56 bg-ink-700 text-stone-100 z-30 flex flex-col lg:hidden"
          >
            <SidebarContent collapsed={false} user={user} onLogout={handleLogout} onNav={() => setMobileOpen(false)} />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center justify-between h-14 px-4 bg-white border-b border-stone-200">
          <button onClick={() => setMobileOpen(true)} className="p-2 text-ink-500 hover:text-ink-700">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-serif font-medium text-ink-700 text-lg">Modex</span>
          <div className="w-8 h-8 rounded bg-ink-700 flex items-center justify-center text-stone-50 text-xs font-medium">
            {user?.name?.[0]?.toUpperCase()}
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function SidebarContent({ collapsed, user, onLogout, onNav }) {
  return (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-ink-600">
        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
          <img src="/logo.png" alt="Modex Logo" className="w-full h-full object-contain" />
        </div>
        {!collapsed && (
          <span className="font-serif font-medium text-stone-50 text-lg tracking-tight whitespace-nowrap">Modex</span>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {NAV.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} onClick={onNav}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded transition-all duration-150 group
              ${isActive
                ? 'bg-gold-400/15 text-gold-300 border-l-2 border-gold-400 pl-[10px]'
                : 'text-ink-200 hover:bg-ink-600 hover:text-stone-50 border-l-2 border-transparent pl-[10px]'
              }
            `}
          >
            <span className="flex-shrink-0">{icon}</span>
            {!collapsed && <span className="text-sm font-medium whitespace-nowrap">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="px-2 pb-2 border-t border-ink-600 pt-3">
        {!collapsed ? (
          <div className="px-3 py-2 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-gold-400/20 flex items-center justify-center text-gold-400 text-xs font-semibold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-stone-200 truncate">{user?.name}</p>
              <p className="text-2xs text-ink-300 truncate">{user?.email}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-2">
            <div className="w-7 h-7 rounded bg-gold-400/20 flex items-center justify-center text-gold-400 text-xs font-semibold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        )}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded text-ink-300 hover:text-stone-50 hover:bg-ink-600 transition-colors text-sm mt-1"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </>
  )
}

function IconDashboard() {
  return <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
}
function IconResume() {
  return <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
}
function IconBriefcase() {
  return <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
}
function IconBook() {
  return <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
}
function IconUser() {
  return <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
}
