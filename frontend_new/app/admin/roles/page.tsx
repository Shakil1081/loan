'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { Shield, Plus, Edit, Trash2, X, Loader2, Key } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { Role, Permission } from '@/lib/types';

export default function RoleManagementPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPermModal, setShowPermModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchData();
    }
  }, [user, authLoading, router]);

  const fetchData = async () => {
    try {
      const [rolesRes, permsRes] = await Promise.all([
        axiosInstance.get('/admin/roles'),
        axiosInstance.get('/admin/permissions'),
      ]);
      
      // Handle ResponseService format with pagination: { success: true, data: { data: [...], ... } }
      let rolesData = [];
      if (rolesRes.data.data) {
        rolesData = Array.isArray(rolesRes.data.data) 
          ? rolesRes.data.data 
          : (rolesRes.data.data.data || []);
      } else if (Array.isArray(rolesRes.data)) {
        rolesData = rolesRes.data;
      }
      
      let permsData = [];
      if (permsRes.data.data) {
        permsData = Array.isArray(permsRes.data.data) 
          ? permsRes.data.data 
          : (permsRes.data.data.data || []);
      } else if (Array.isArray(permsRes.data)) {
        permsData = permsRes.data;
      }
      
      setRoles(rolesData);
      setPermissions(permsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingRole(null);
    setFormData({ name: '' });
    setShowModal(true);
  };

  const openEditModal = (role: Role) => {
    setEditingRole(role);
    setFormData({ name: role.name });
    setShowModal(true);
  };

  const openPermissionsModal = (role: Role) => {
    setSelectedRole(role);
    setSelectedPermissions(role.permissions?.map(p => p.id) || []);
    setShowPermModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingRole) {
        await axiosInstance.put(`/admin/roles/${editingRole.id}`, formData);
      } else {
        await axiosInstance.post('/admin/roles', formData);
      }
      await fetchData();
      setShowModal(false);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save role');
    } finally {
      setSaving(false);
    }
  };

  const handlePermissionsSave = async () => {
    if (!selectedRole) return;
    setSaving(true);
    try {
      await axiosInstance.post(`/admin/roles/${selectedRole.id}/assign-permissions`, {
        permissions: selectedPermissions,
      });
      await fetchData();
      setShowPermModal(false);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update permissions');
    } finally {
      setSaving(false);
    }
  };

  const togglePermission = (permId: number) => {
    setSelectedPermissions(prev =>
      prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
    );
  };

  const deleteRole = async (roleId: number) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    try {
      await axiosInstance.delete(`/admin/roles/${roleId}`);
      await fetchData();
    } catch (error) {
      console.error('Failed to delete role:', error);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Role Management</h1>
            <p className="text-slate-500">Manage system roles and their permissions</p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Role
          </button>
        </div>

        {/* Roles Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => (
              <div key={role.id} className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 hover:shadow-xl transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEditModal(role)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteRole(role.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{role.name}</h3>
                <p className="text-sm text-slate-500 mb-4">
                  {role.permissions?.length || 0} permissions assigned
                </p>
                <button
                  onClick={() => openPermissionsModal(role)}
                  className="w-full py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  Manage Permissions
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h3 className="text-xl font-bold text-slate-800">{editingRole ? 'Edit Role' : 'Create Role'}</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Role Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    placeholder="Enter role name"
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  {editingRole ? 'Update Role' : 'Create Role'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Permissions Modal */}
        {showPermModal && selectedRole && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h3 className="text-xl font-bold text-slate-800">Permissions for {selectedRole.name}</h3>
                <button onClick={() => setShowPermModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {permissions.map((perm) => (
                    <label
                      key={perm.id}
                      className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all ${
                        selectedPermissions.includes(perm.id)
                          ? 'bg-indigo-100 border-2 border-indigo-500'
                          : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(perm.id)}
                        onChange={() => togglePermission(perm.id)}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <span className="text-sm font-medium text-slate-700">{perm.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="p-6 border-t border-slate-200">
                <button
                  onClick={handlePermissionsSave}
                  disabled={saving}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  Save Permissions
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
