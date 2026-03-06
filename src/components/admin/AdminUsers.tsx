import { useState, useEffect } from 'react';
import { Shield, Users as UsersIcon, RefreshCw, Crown } from 'lucide-react';
import { api, ApiError } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';

export default function AdminUsers() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });

    useEffect(() => {
        loadUsers(1);
    }, []);

    const loadUsers = async (page: number) => {
        setLoading(true);
        try {
            const data = await api.get(`/admin/users?page=${page}&limit=${pagination.limit}`);
            setUsers(data.users || []);
            setPagination(data.pagination);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleAdminRole = async (userId: number, currentRole: string) => {
        if (!window.confirm('¿Seguro que deseas cambiar los permisos de este usuario?')) return;

        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        try {
            await api.patch(`/admin/users/${userId}/role`, { role: newRole });

            // Update local state
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (err) {
            alert(err instanceof ApiError ? err.message : 'Error al cambiar rol');
        }
    };

    if (loading && users.length === 0) {
        return (
            <div className="text-center py-12 text-gray-400">
                <RefreshCw size={32} className="mx-auto mb-4 animate-spin" />
                <p>Cargando usuarios...</p>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Nombre / Email</th>
                                <th className="px-6 py-4 text-center">Pedidos</th>
                                <th className="px-6 py-4">Registro</th>
                                <th className="px-6 py-4 text-center">Rol</th>
                                {currentUser?.is_superadmin === 1 && (
                                    <th className="px-6 py-4 text-center">Acciones Superadmin</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-3 font-semibold text-gray-900">#{user.id}</td>
                                    <td className="px-6 py-3">
                                        <div className="font-bold text-gray-900">{user.name}</div>
                                        <div className="text-gray-500 text-xs">{user.email}</div>
                                        {user.phone && <div className="text-gray-400 text-xs">{user.phone}</div>}
                                    </td>
                                    <td className="px-6 py-3 text-center">
                                        <div className="inline-flex items-center justify-center bg-gray-100 text-gray-700 w-8 h-8 rounded-full font-bold">
                                            {user.orderCount}
                                        </div>
                                    </td>
                                    <td className="px-6 py-3">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-3 text-center">
                                        {user.is_superadmin === 1 ? (
                                            <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-bold text-xs">
                                                <Crown size={12} /> Owner
                                            </span>
                                        ) : user.role === 'admin' ? (
                                            <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full font-bold text-xs">
                                                <Shield size={12} /> Admin
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-bold text-xs">
                                                <UsersIcon size={12} /> Cliente
                                            </span>
                                        )}
                                    </td>
                                    {currentUser?.is_superadmin === 1 && (
                                        <td className="px-6 py-3 text-center">
                                            {user.is_superadmin !== 1 && (
                                                <button
                                                    onClick={() => toggleAdminRole(user.id, user.role)}
                                                    className={`px-4 py-1.5 rounded-lg font-bold text-xs transition ${user.role === 'admin'
                                                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                        : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                                                        }`}
                                                >
                                                    {user.role === 'admin' ? 'Revocar Admin' : 'Hacer Admin'}
                                                </button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {pagination.pages > 1 && (
                    <div className="p-4 border-t border-gray-100 flex justify-center gap-2 bg-gray-50">
                        {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                            // Simple pagination logic, showing up to 5 surrounding pages
                            let pageNum = pagination.page - 2 + i;
                            if (pagination.page <= 3) pageNum = i + 1;
                            else if (pagination.page >= pagination.pages - 2) pageNum = pagination.pages - 4 + i;

                            if (pageNum < 1 || pageNum > pagination.pages) return null;

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => loadUsers(pageNum)}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm transition ${pageNum === pagination.page
                                        ? 'bg-red-600 text-white'
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
