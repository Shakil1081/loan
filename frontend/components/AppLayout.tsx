'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  FileText,
  DollarSign,
  Users,
  Shield,
  Key,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  UserCircle,
  Lock
} from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, logout, hasRole, hasPermission } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      show: true,
    },
    {
      title: 'Apply for Loan',
      icon: FileText,
      href: '/loan/apply',
      show: hasPermission('loan.create'),
    },
    {
      title: 'My Loans',
      icon: DollarSign,
      href: '/loans/my',
      show: hasPermission('loan.view'),
    },
    {
      title: 'Admin',
      icon: Shield,
      href: '#',
      show: hasRole('Super Admin') || hasPermission('user.manage') || hasPermission('loan.approve'),
      children: [
        {
          title: 'Loan Applications',
          icon: FileText,
          href: '/admin/loans',
          show: hasPermission('loan.approve') || hasRole('Super Admin'),
        },
        {
          title: 'User Management',
          icon: Users,
          href: '/admin/users',
          show: hasPermission('user.manage') || hasRole('Super Admin'),
        },
        {
          title: 'Role Management',
          icon: Shield,
          href: '/admin/roles',
          show: hasPermission('role.manage') || hasRole('Super Admin'),
        },
        {
          title: 'Permission Management',
          icon: Key,
          href: '/admin/permissions',
          show: hasPermission('permission.manage') || hasRole('Super Admin'),
        },
      ],
    },
  ];

  const handleLogout = () => {
    logout();
  };

  const isActive = (href: string) => pathname === href;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-800">LoanHub Pro</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-0 left-0 z-40 h-screen w-72
            bg-gradient-to-b from-slate-900 to-slate-950 text-white
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            shadow-2xl
          `}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="hidden lg:flex items-center gap-3 px-6 py-6 border-b border-slate-800">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">LoanHub Pro</h1>
                <p className="text-xs text-slate-400">Loan Management</p>
              </div>
            </div>

            {/* User Info */}
            <div className="px-6 py-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{user?.name}</p>
                  <p className="text-xs text-slate-400 truncate">
                    {user?.roles?.map(r => r.name).join(', ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 py-4">
              <div className="space-y-1">
                {menuItems.filter(item => item.show).map((item) => (
                  <div key={item.title}>
                    {item.children ? (
                      <div>
                        <div className="px-4 py-3 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                          {item.title}
                        </div>
                        <div className="space-y-1 ml-2">
                          {item.children.filter(child => child.show).map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setSidebarOpen(false)}
                              className={`
                                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                                ${isActive(child.href)
                                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                }
                              `}
                            >
                              <child.icon className="w-5 h-5" />
                              <span className="font-medium">{child.title}</span>
                              {isActive(child.href) && (
                                <ChevronRight className="w-4 h-4 ml-auto" />
                              )}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`
                          flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                          ${isActive(item.href)
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }
                        `}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.title}</span>
                        {isActive(item.href) && (
                          <ChevronRight className="w-4 h-4 ml-auto" />
                        )}
                      </Link>
                    )}
                  </div>
                ))}
              </div>

              {/* Settings & Logout */}
              <div className="mt-6 pt-6 border-t border-slate-800 space-y-1">
                <Link
                  href="/profile"
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive('/profile')
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }
                  `}
                >
                  <UserCircle className="w-5 h-5" />
                  <span className="font-medium">Profile</span>
                </Link>

                <Link
                  href="/change-password"
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive('/change-password')
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }
                  `}
                >
                  <Lock className="w-5 h-5" />
                  <span className="font-medium">Change Password</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-red-600 hover:text-white transition-all duration-200"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </nav>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
