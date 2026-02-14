import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'

interface LayoutProps {
  children: React.ReactNode
}

const mockNotifications = [
  { id: 1, title: 'Project Approved', message: 'Your "Residential Extension – Sandton" project has been approved.', type: 'success', time: '5 min ago', read: false },
  { id: 2, title: 'Payment Received', message: 'R4,500 payment received for project #1024.', type: 'info', time: '1 hour ago', read: false },
  { id: 3, title: 'AI Review Complete', message: 'Compliance check finished with 2 warnings on boundary setback.', type: 'warning', time: '3 hours ago', read: false },
  { id: 4, title: 'Freelancer Assigned', message: 'John M. accepted the "Office Renovation" task.', type: 'info', time: 'Yesterday', read: true },
  { id: 5, title: 'Revision Required', message: 'Admin flagged Site Plan for revision – see comments.', type: 'error', time: '2 days ago', read: true },
]

const notifTypeStyles: Record<string, string> = {
  success: 'bg-green-500',
  info: 'bg-blue-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
}

export default function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState(mockNotifications)
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()

  const unreadCount = notifications.filter(n => !n.read).length

  const isActive = (path: string) => router.pathname === path || router.pathname.startsWith(path + '/')

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  // Filter nav items based on role
  const getNavItems = () => {
    const baseItems = [{ href: '/', label: 'Home' }]

    if (!isAuthenticated) {
      return baseItems
    }

    // Add role-specific items
    if (user?.role === 'client') {
      return [
        ...baseItems,
        { href: '/dashboard', label: 'My Projects' },
        { href: '/start', label: 'New Project' },
      ]
    }

    if (user?.role === 'freelancer') {
      return [
        ...baseItems,
        { href: '/freelancer', label: 'Workspace' },
      ]
    }

    if (user?.role === 'admin') {
      return [
        ...baseItems,
        { href: '/admin', label: 'Admin' },
        { href: '/dashboard', label: 'Projects' },
      ]
    }

    return baseItems
  }

  const navItems = getNavItems()

  // Get user initials for avatar
  const getInitials = () => {
    if (!user?.full_name) return '?'
    return user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src="/logo.png"
                alt="Architex Axis Logo"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
              <span className="text-xl font-bold font-roboto tracking-tight text-teal-800">
                Architex Axis
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(item.href)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Right side: Notifications + User */}
            <div className="hidden md:flex items-center space-x-3">
              {/* Notifications */}
              <div className="relative">
                <button
                  id="notification-bell"
                  onClick={() => { setNotificationsOpen(!notificationsOpen); setUserMenuOpen(false) }}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition relative"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                      <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-gray-400">No notifications</div>
                      ) : (
                        notifications.map(n => (
                          <button
                            key={n.id}
                            onClick={() => markAsRead(n.id)}
                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition flex items-start space-x-3 ${!n.read ? 'bg-primary-50/40' : ''}`}
                          >
                            <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!n.read ? notifTypeStyles[n.type] : 'bg-gray-300'}`} />
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${!n.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-600'}`}>{n.title}</p>
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                              <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                    <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 text-center">
                      <button className="text-xs text-primary-600 hover:text-primary-700 font-medium">View all notifications</button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative">
                {isAuthenticated ? (
                  <button
                    onClick={() => { setUserMenuOpen(!userMenuOpen); setNotificationsOpen(false) }}
                    className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {getInitials()}
                    </div>
                    <span className="hidden lg:block text-sm font-medium">{user?.full_name}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                ) : (
                  <Link href="/login" className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition">
                    Sign In
                  </Link>
                )}

                {userMenuOpen && isAuthenticated && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{user?.full_name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <span className="mt-1 inline-block px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full capitalize">
                        {user?.role}
                      </span>
                    </div>
                    <Link href="/profile" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Profile</Link>
                    <Link href="/settings" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Settings</Link>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2 rounded-lg text-sm font-medium ${isActive(item.href)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  {item.label}
                </Link>
              ))}
              <hr className="my-2 border-gray-100" />
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-2 flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {getInitials()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{user?.full_name}</p>
                      <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
