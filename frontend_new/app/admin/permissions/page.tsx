'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { Key, Plus, Edit, Trash2, X, Loader2, Search } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { Permission } from '@/lib/types';

export default function PermissionManagementPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPerm, setEditingPerm] = useState<Permission | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchPermissions();
    }
  }, [user, authLoading, router]);

  const fetchPermissions = async () => {
    try {
      const response = await axiosInstance.get('/admin/permissions');
      
      // Handle ResponseService format with pagination: { success: true, data: { data: [...], ... } }
      let permsData = [];
      if (response.data.data) {
        permsData = Array.isArray(response.data.data) 
          ? response.data.data 
          : (response.data.data.data || []);
      } else if (Array.isArray(response.data)) {
        permsData = response.data;
      }
      
      setPermissions(permsData);
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingPerm(null);
    setFormData({ name: '' });
    setShowModal(true);
  };

  const openEditModal = (perm: Permission) => {
    setEditingPerm(perm);
    setFormData({ name: perm.name });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingPerm) {
        await axiosInstance.put(`/admin/permissions/${editingPerm.id}`, formData);
      } else {
        await axiosInstance.post('/admin/permissions', formData);
      }
      await fetchPermissions();
      setShowModal(false);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save permission');
    } finally {
      setSaving(false);
    }
  };

  const deletePermission = async (permId: number) => {
    if (!confirm('Are you sure you want to delete this permission?')) return;
    try {
      await axiosInstance.delete(`/admin/permissions/${permId}`);
      await fetchPermissions();
    } catch (error) {
      console.error('Failed to delete permission:', error);
    }
  };

  const filteredPermissions = permissions.filter(perm =>
    perm.name.toLowerCase().includes(search.toLowerCase())
  );

  // Group permissions by module
  const groupedPermissions = filteredPermissions.reduce((acc, perm) => {
    const module = perm.name.split('.')[0] || 'other';
    if (!acc[module]) acc[module] = [];
    acc[module].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

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
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Permission Management</h1>
            <p className="text-slate-500">Manage system permissions</p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Permission
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search permissions..."
              className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Permissions List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedPermissions).map(([module, perms]) => (
              <div key={module} className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4">
                  <h3 className="text-lg font-bold text-white capitalize flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    {module} Permissions
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {perms.map((perm) => (
                      <div
                        key={perm.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <Key className="w-4 h-4 text-indigo-600" />
                          </div>
                          <span className="font-medium text-slate-700">{perm.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEditModal(perm)} className="p-1.5 text-slate-600 hover:bg-white rounded-lg">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => deletePermission(perm.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h3 className="text-xl font-bold text-slate-800">{editingPerm ? 'Edit Permission' : 'Create Permission'}</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Permission Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    placeholder="e.g., loan.create, user.manage"
                  />
                  <p className="text-xs text-slate-400 mt-1">Use format: module.action (e.g., loan.create)</p>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  {editingPerm ? 'Update Permission' : 'Create Permission'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
