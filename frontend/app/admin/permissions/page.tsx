'use client'

import { useState, useEffect } from 'react'
import TopNavLayout from '@/components/TopNavLayout'
import axiosInstance from '@/lib/axios'

interface Permission {
  id: number
  name: string
  guard_name: string
  created_at: string
  updated_at: string
}

interface GroupedPermissions {
  [key: string]: Permission[]
}

export default function PermissionsManagementPage() {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [groupedPermissions, setGroupedPermissions] = useState<GroupedPermissions>({})
  const [loading, setLoading] = useState(true)
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    guard_name: 'web'
  })
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchPermissions()
  }, [])

  const fetchPermissions = async () => {
    setLoading(true)
    try {
      const [listResponse, groupedResponse] = await Promise.all([
        axiosInstance.get('/admin/permissions'),
        axiosInstance.get('/admin/permissions-grouped')
      ])
      setPermissions(listResponse.data.data)
      setGroupedPermissions(groupedResponse.data)
    } catch (error) {
      console.error('Failed to fetch permissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    setUpdating(true)
    try {
      await axiosInstance.post('/admin/permissions', formData)
      await fetchPermissions()
      setCreateModalOpen(false)
      setFormData({ name: '', guard_name: 'web' })
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create permission')
    } finally {
      setUpdating(false)
    }
  }

  const handleUpdate = async () => {
    if (!selectedPermission) return
    setUpdating(true)
    try {
      await axiosInstance.put(`/admin/permissions/${selectedPermission.id}`, formData)
      await fetchPermissions()
      setModalOpen(false)
      setSelectedPermission(null)
      setFormData({ name: '', guard_name: 'web' })
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update permission')
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async (permissionId: number) => {
    if (!confirm('Are you sure you want to delete this permission?')) return
    try {
      await axiosInstance.delete(`/admin/permissions/${permissionId}`)
      await fetchPermissions()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete permission')
    }
  }

  const openEditModal = (permission: Permission) => {
    setSelectedPermission(permission)
    setFormData({
      name: permission.name,
      guard_name: permission.guard_name
    })
    setModalOpen(true)
  }

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'loan':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'user':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )
      case 'role':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        )
      case 'permission':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  const getModuleColor = (module: string) => {
    switch (module) {
      case 'loan':
        return 'from-green-500 to-emerald-600'
      case 'user':
        return 'from-blue-500 to-indigo-600'
      case 'role':
        return 'from-purple-500 to-pink-600'
      case 'permission':
        return 'from-amber-500 to-orange-600'
      default:
        return 'from-gray-500 to-slate-600'
    }
  }

  const isSystemPermission = (name: string) => {
    const corePermissions = [
      'loan.create', 'loan.view', 'loan.approve', 'loan.delete',
      'user.manage', 'role.manage', 'permission.manage'
    ]
    return corePermissions.includes(name)
  }

  return (
    <TopNavLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Permission Management</h1>
            <p className="text-slate-500 mt-1">Manage system permissions and access controls</p>
          </div>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-white font-semibold rounded-xl transition-all duration-200 transform hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Permission
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {Object.keys(groupedPermissions).map((module) => (
            <div key={module} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getModuleColor(module)} flex items-center justify-center text-white`}>
                  {getModuleIcon(module)}
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{groupedPermissions[module]?.length || 0}</p>
                  <p className="text-xs text-slate-500 capitalize">{module} Permissions</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Permissions by Module */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-slate-500">Loading permissions...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
              <div key={module} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className={`px-6 py-3 bg-gradient-to-r ${getModuleColor(module)}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white">
                      {getModuleIcon(module)}
                    </div>
                    <h3 className="text-lg font-bold text-white capitalize">{module} Module</h3>
                    <span className="ml-auto px-3 py-1 bg-white/20 rounded-full text-white text-sm">
                      {modulePermissions.length} permissions
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {modulePermissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium text-slate-700">{permission.name}</p>
                            <p className="text-xs text-slate-400">Guard: {permission.guard_name}</p>
                          </div>
                        </div>
                        {!isSystemPermission(permission.name) && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => openEditModal(permission)}
                              className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(permission.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}
                        {isSystemPermission(permission.name) && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">System</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Permission Modal */}
        {createModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={() => setCreateModalOpen(false)}></div>
              <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-fadeIn">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Create New Permission</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Permission Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., module.action"
                    />
                    <p className="text-xs text-slate-400 mt-1">Format: module.action (e.g., user.edit, report.view)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Guard Name</label>
                    <select
                      value={formData.guard_name}
                      onChange={(e) => setFormData({ ...formData, guard_name: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="web">Web</option>
                      <option value="api">API</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setCreateModalOpen(false)}
                    className="flex-1 py-2 px-4 border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={updating}
                    className="flex-1 py-2 px-4 text-white font-medium rounded-lg disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                  >
                    {updating ? 'Creating...' : 'Create Permission'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Permission Modal */}
        {modalOpen && selectedPermission && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={() => setModalOpen(false)}></div>
              <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-fadeIn">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Edit Permission</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Permission Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., module.action"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-2 px-4 border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    disabled={updating}
                    className="flex-1 py-2 px-4 text-white font-medium rounded-lg disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                  >
                    {updating ? 'Updating...' : 'Update Permission'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </TopNavLayout>
  )
}
