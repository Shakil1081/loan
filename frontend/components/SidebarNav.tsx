'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Users,
  Shield,
  Key,
  Plus,
  Settings,
  LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

interface NavItem {
  name: string
  href: string
  icon: React.ReactNode
  permission: string | null
}

export function SidebarNav() {
  const pathname = usePathname()
  const { user, logout, hasRole, hasPermission } = useAuth()
  const isSuperAdmin = hasRole('Super Admin')

  const navigation: NavItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      permission: null
    },
    {
      name: 'Apply for Loan',
      href: '/loan/apply',
      icon: <Plus className="w-4 h-4" />,
      permission: 'loan.create'
    },
    {
      name: 'My Loans',
      href: '/loans/my',
      icon: <FileText className="w-4 h-4" />,
      permission: 'loan.view'
    },
    {
      name: 'Loan Applications',
      href: '/admin/loans',
      icon: <FolderOpen className="w-4 h-4" />,
      permission: 'loan.approve'
    },
    {
      name: 'User Management',
      href: '/admin/users',
      icon: <Users className="w-4 h-4" />,
      permission: 'user.manage'
    },
    {
      name: 'Roles',
      href: '/admin/roles',
      icon: <Shield className="w-4 h-4" />,
      permission: 'role.manage'
    },
    {
      name: 'Permissions',
      href: '/admin/permissions',
      icon: <Key className="w-4 h-4" />,
      permission: 'permission.manage'
    }
  ]

  const canAccessItem = (item: NavItem) => {
    if (isSuperAdmin) return true
    if (!item.permission) return true
    return hasPermission(item.permission)
  }

  const filteredNavigation = navigation.filter(canAccessItem)

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {filteredNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="px-3 py-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}
