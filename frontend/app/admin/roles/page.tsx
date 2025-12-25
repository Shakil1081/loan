'use client'

import { useState, useEffect } from 'react'
import TopNavLayout from '@/components/TopNavLayout'
import axiosInstance from '@/lib/axios'

interface Permission {
  id: number
  name: string
}

interface Role {
  id: number
  name: string
  permissions: Permission[]
  created_at: string
  updated_at: string
}

export default function RolesManagementPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    permissions: [] as string[]
  })
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchRoles()
    fetchPermissions()
  }, [])

  const fetchRoles = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get('/admin/roles')
      setRoles(response.data.data)
    } catch (error) {
      console.error('Failed to fetch roles:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPermissions = async () => {
    try {
      const response = await axiosInstance.get('/admin/permissions')
      setPermissions(response.data.data)
    } catch (error) {
      console.error('Failed to fetch permissions:', error)
    }
  }

  const handleCreate = async () => {
    setUpdating(true)
    try {
      await axiosInstance.post('/admin/roles', formData)
      await fetchRoles()
      setCreateModalOpen(false)
      setFormData({ name: '', permissions: [] })
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create role')
    } finally {
      setUpdating(false)
    }
  }

  const handleUpdate = async () => {
    if (!selectedRole) return
    setUpdating(true)
    try {
      await axiosInstance.put(`/admin/roles/${selectedRole.id}`, formData)
      await fetchRoles()
      setModalOpen(false)
      setSelectedRole(null)
      setFormData({ name: '', permissions: [] })
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update role')
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async (roleId: number) => {
    if (!confirm('Are you sure you want to delete this role?')) return
    try {
      await axiosInstance.delete(`/admin/roles/${roleId}`)
      await fetchRoles()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete role')
    }
  }

  const openEditModal = (role: Role) => {
    setSelectedRole(role)
    setFormData({
      name: role.name,
      permissions: role.permissions.map(p => p.name)
    })
    setModalOpen(true)
  }

  const togglePermission = (permissionName: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionName)
        ? prev.permissions.filter(p => p !== permissionName)
        : [...prev.permissions, permissionName]
    }))
  }

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case 'Super Admin':
        return 'bg-gradient-to-r from-purple-500 to-pink-500'
      case 'Applicant':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500'
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600'
    }
  }

  return (
    <TopNavLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Role Management</h1>
            <p className="text-slate-500 mt-1">Manage system roles and their permissions</p>
          </div>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-white font-semibold rounded-xl transition-all duration-200 transform hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Role
          </button>
        </div>

        {/* Roles Grid */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-slate-500">Loading roles...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => (
              <div key={role.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className={`h-2 ${getRoleBadgeColor(role.name)}`}></div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-800">{role.name}</h3>
                    {role.name !== 'Super Admin' && role.name !== 'Applicant' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(role)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(role.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {role.name === 'Super Admin' ? (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <p className="text-sm text-purple-700 font-medium">Full System Access</p>
                      <p className="text-xs text-purple-600 mt-1">This role has all permissions by default</p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-3">
                        <p className="text-sm text-slate-500">Permissions ({role.permissions.length})</p>
                      </div>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {role.permissions.length > 0 ? (
                          role.permissions.map((permission) => (
                            <div key={permission.id} className="flex items-center gap-2 py-1">
                              <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-xs text-slate-600">{permission.name}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-400 italic">No permissions assigned</p>
                        )}
                      </div>
                    </>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-400">
                      Created {new Date(role.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Role Modal */}
        {createModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={() => setCreateModalOpen(false)}></div>
              <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 animate-fadeIn max-h-[80vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Create New Role</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Role Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter role name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">Permissions</label>
                    <div className="grid grid-cols-2 gap-2">
                      {permissions.map((permission) => (
                        <label key={permission.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(permission.name)}
                            onChange={() => togglePermission(permission.name)}
                            className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                          />
                          <span className="text-sm text-slate-700">{permission.name}</span>
                        </label>
                      ))}
                    </div>
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
                    {updating ? 'Creating...' : 'Create Role'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Role Modal */}
        {modalOpen && selectedRole && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={() => setModalOpen(false)}></div>
              <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 animate-fadeIn max-h-[80vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Edit Role</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Role Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter role name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">Permissions</label>
                    <div className="grid grid-cols-2 gap-2">
                      {permissions.map((permission) => (
                        <label key={permission.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(permission.name)}
                            onChange={() => togglePermission(permission.name)}
                            className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                          />
                          <span className="text-sm text-slate-700">{permission.name}</span>
                        </label>
                      ))}
                    </div>
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
                    {updating ? 'Updating...' : 'Update Role'}
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
