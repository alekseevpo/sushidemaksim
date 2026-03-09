import { useState, useEffect } from 'react';
import {
    Shield,
    Users as UsersIcon,
    RefreshCw,
    Crown,
    Calendar,
    CheckCircle,
    AlertCircle,
    Clock,
    ArrowUpDown,
    ChevronUp,
    ChevronDown,
} from 'lucide-react';

import { api, ApiError } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';

export default function AdminUsers() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
    const [sort, setSort] = useState({ field: 'last_seen_at', order: 'desc' });

    useEffect(() => {
        loadUsers(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sort]);

    const loadUsers = async (page: number) => {
        setLoading(true);
        try {
            const data = await api.get(
                `/admin/users?page=${page}&limit=${pagination.limit}&sortBy=${sort.field}&order=${sort.order}`
            );
            setUsers(data.users || []);
            setPagination(data.pagination);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (field: string) => {
        setSort(prev => ({
            field,
            order: prev.field === field && prev.order === 'desc' ? 'asc' : 'desc',
        }));
    };

    const toggleAdminRole = async (userId: number, currentRole: string) => {
        if (!window.confirm('¿Seguro que deseas cambiar los permisos de este usuario?')) return;

        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        try {
            await api.patch(`/admin/users/${userId}/role`, { role: newRole });

            // Update local state
            setUsers(users.map(u => (u.id === userId ? { ...u, role: newRole } : u)));
        } catch (err) {
            alert(err instanceof ApiError ? err.message : 'Error al cambiar rol');
        }
    };

    const toggleBirthdayVerified = async (userId: number, currentVerified: boolean) => {
        try {
            await api.patch(`/admin/users/${userId}/verify-birthday`, {
                verified: !currentVerified,
            });
            setUsers(
                users.map(u =>
                    u.id === userId ? { ...u, birth_date_verified: !currentVerified } : u
                )
            );
        } catch (err) {
            alert('Error updating verification');
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
                                <th
                                    className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition"
                                    onClick={() => handleSort('id')}
                                >
                                    <div className="flex items-center gap-1">
                                        ID{' '}
                                        {sort.field === 'id' ? (
                                            sort.order === 'desc' ? (
                                                <ChevronDown size={14} />
                                            ) : (
                                                <ChevronUp size={14} />
                                            )
                                        ) : (
                                            <ArrowUpDown size={12} className="opacity-30" />
                                        )}
                                    </div>
                                </th>
                                <th className="px-6 py-4">Nombre / Email</th>
                                <th className="px-6 py-4">Cumpleaños / Verif.</th>
                                <th
                                    className="px-6 py-4 text-center cursor-pointer hover:bg-gray-100 transition"
                                    onClick={() => handleSort('orderCount')}
                                >
                                    <div className="flex items-center justify-center gap-1">
                                        Pedidos{' '}
                                        {sort.field === 'orderCount' ? (
                                            sort.order === 'desc' ? (
                                                <ChevronDown size={14} />
                                            ) : (
                                                <ChevronUp size={14} />
                                            )
                                        ) : (
                                            <ArrowUpDown size={12} className="opacity-30" />
                                        )}
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 text-center cursor-pointer hover:bg-gray-100 transition"
                                    onClick={() => handleSort('totalSpent')}
                                >
                                    <div className="flex items-center justify-center gap-1">
                                        Gastado{' '}
                                        {sort.field === 'totalSpent' ? (
                                            sort.order === 'desc' ? (
                                                <ChevronDown size={14} />
                                            ) : (
                                                <ChevronUp size={14} />
                                            )
                                        ) : (
                                            <ArrowUpDown size={12} className="opacity-30" />
                                        )}
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition"
                                    onClick={() => handleSort('last_seen_at')}
                                >
                                    <div className="flex items-center gap-1">
                                        Última actividad{' '}
                                        {sort.field === 'last_seen_at' ? (
                                            sort.order === 'desc' ? (
                                                <ChevronDown size={14} />
                                            ) : (
                                                <ChevronUp size={14} />
                                            )
                                        ) : (
                                            <ArrowUpDown size={12} className="opacity-30" />
                                        )}
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition"
                                    onClick={() => handleSort('created_at')}
                                >
                                    <div className="flex items-center gap-1">
                                        Registro{' '}
                                        {sort.field === 'created_at' ? (
                                            sort.order === 'desc' ? (
                                                <ChevronDown size={14} />
                                            ) : (
                                                <ChevronUp size={14} />
                                            )
                                        ) : (
                                            <ArrowUpDown size={12} className="opacity-30" />
                                        )}
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 text-center cursor-pointer hover:bg-gray-100 transition"
                                    onClick={() => handleSort('role')}
                                >
                                    <div className="flex items-center justify-center gap-1">
                                        Rol{' '}
                                        {sort.field === 'role' ? (
                                            sort.order === 'desc' ? (
                                                <ChevronDown size={14} />
                                            ) : (
                                                <ChevronUp size={14} />
                                            )
                                        ) : (
                                            <ArrowUpDown size={12} className="opacity-30" />
                                        )}
                                    </div>
                                </th>
                                {currentUser?.is_superadmin === 1 && (
                                    <th className="px-6 py-4 text-center">Acciones Superadmin</th>
                                )}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-3 font-semibold text-gray-900">
                                        #{user.id}
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="font-bold text-gray-900">
                                                {user.name}
                                            </div>
                                            {user.is_verified ? (
                                                <span
                                                    title="Email verificado"
                                                    className="text-green-500 bg-green-50 p-0.5 rounded-full border border-green-100"
                                                >
                                                    <CheckCircle size={12} />
                                                </span>
                                            ) : (
                                                <span
                                                    title="Email pendiente de verificación"
                                                    className="text-yellow-500 bg-yellow-50 p-0.5 rounded-full border border-yellow-100"
                                                >
                                                    <Clock size={12} />
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-gray-500 text-xs">{user.email}</div>
                                        {user.phone && (
                                            <div className="text-gray-400 text-xs">
                                                {user.phone}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="flex flex-col gap-1.5">
                                            {user.birth_date ? (
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                                                    <Calendar size={12} className="text-gray-400" />
                                                    {new Date(user.birth_date).toLocaleDateString()}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400">
                                                    Sin fecha
                                                </span>
                                            )}

                                            {user.birth_date && (
                                                <button
                                                    onClick={() =>
                                                        toggleBirthdayVerified(
                                                            user.id,
                                                            user.birth_date_verified
                                                        )
                                                    }
                                                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold w-fit transition-all ${
                                                        user.birth_date_verified
                                                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                            : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                                    }`}
                                                >
                                                    {user.birth_date_verified ? (
                                                        <>
                                                            <CheckCircle size={10} /> Verificado
                                                        </>
                                                    ) : (
                                                        <>
                                                            <AlertCircle size={10} /> Sin Verificar
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 text-center">
                                        <div className="inline-flex items-center justify-center bg-gray-100 text-gray-700 w-8 h-8 rounded-full font-bold">
                                            {user.orderCount}
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 text-center">
                                        <div className="font-bold text-gray-900">
                                            {Number(user.totalSpent || 0)
                                                .toFixed(2)
                                                .replace('.', ',')}{' '}
                                            €
                                        </div>
                                    </td>

                                    <td className="px-6 py-3">
                                        <div className="flex flex-col gap-1">
                                            {user.last_seen_at ? (
                                                <>
                                                    <div className="flex items-center gap-2">
                                                        {new Date().getTime() -
                                                            new Date(user.last_seen_at).getTime() <
                                                        5 * 60 * 1000 ? (
                                                            <div className="relative flex h-2 w-2">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                            </div>
                                                        ) : (
                                                            <div className="h-2 w-2 rounded-full bg-gray-300"></div>
                                                        )}
                                                        <span className="text-gray-900 font-bold text-xs">
                                                            {new Date(
                                                                user.last_seen_at
                                                            ).toLocaleDateString() ===
                                                            new Date().toLocaleDateString()
                                                                ? 'Hoy ' +
                                                                  new Date(
                                                                      user.last_seen_at
                                                                  ).toLocaleTimeString([], {
                                                                      hour: '2-digit',
                                                                      minute: '2-digit',
                                                                  })
                                                                : new Date(
                                                                      user.last_seen_at
                                                                  ).toLocaleDateString([], {
                                                                      day: '2-digit',
                                                                      month: 'short',
                                                                      hour: '2-digit',
                                                                      minute: '2-digit',
                                                                  })}
                                                        </span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex items-center gap-2 text-gray-400">
                                                    <Clock size={12} />
                                                    <span className="text-xs italic">Nunca</span>
                                                </div>
                                            )}
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
                                                    onClick={() =>
                                                        toggleAdminRole(user.id, user.role)
                                                    }
                                                    className={`px-4 py-1.5 rounded-lg font-bold text-xs transition ${
                                                        user.role === 'admin'
                                                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                            : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                                                    }`}
                                                >
                                                    {user.role === 'admin'
                                                        ? 'Revocar Admin'
                                                        : 'Hacer Admin'}
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
                            else if (pagination.page >= pagination.pages - 2)
                                pageNum = pagination.pages - 4 + i;

                            if (pageNum < 1 || pageNum > pagination.pages) return null;

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => loadUsers(pageNum)}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm transition ${
                                        pageNum === pagination.page
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
