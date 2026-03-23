import { useState, useEffect, useCallback, memo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
    Trash2,
    Search,
    X,
    RotateCcw,
} from 'lucide-react';

import { api, ApiError } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';

// --- UserRow Component ---
const UserRow = memo(
    ({
        user,
        currentUser,
        onToggleRole,
        onDelete,
        onRestore,
        onToggleBirthday,
        onVerifyEmail,
    }: {
        user: any;
        currentUser: any;
        onToggleRole: (user: any) => void;
        onDelete: (user: any) => void;
        onRestore: (user: any) => void;
        onToggleBirthday: (id: number, verified: boolean) => void;
        onVerifyEmail: (user: any) => void;
    }) => {
        const isOnline = user.last_seen_at
            ? new Date().getTime() - new Date(user.last_seen_at).getTime() < 5 * 60 * 1000
            : false;

        const lastSeenStr = user.last_seen_at
            ? (() => {
                  const lastSeenDate = new Date(user.last_seen_at);
                  const today = new Date();
                  if (lastSeenDate.toLocaleDateString() === today.toLocaleDateString()) {
                      return (
                          'Hoy ' +
                          lastSeenDate.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                          })
                      );
                  }
                  return lastSeenDate.toLocaleDateString([], {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                  });
              })()
            : 'Nunca';

        const regDate = new Date(user.created_at).toLocaleDateString();
        const birthDate = user.birth_date ? new Date(user.birth_date).toLocaleDateString() : null;

        const initials =
            user.name
                .split(' ')
                .filter(Boolean)
                .map((n: string) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2) || '??';

        return (
            <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-2 font-semibold text-gray-900">#{user.id}</td>
                <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm transition-transform hover:scale-110">
                            {user.avatar ? (
                                user.avatar.startsWith('http') ? (
                                    <img
                                        src={`${user.avatar}${user.avatar.includes('?') ? '&' : '?'}t=${Date.now()}`}
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                        onError={e => {
                                            (
                                                e.currentTarget as HTMLImageElement
                                            ).style.display = 'none';
                                            e.currentTarget.parentElement!.innerText = initials;
                                        }}
                                    />
                                ) : (
                                    <div className="text-xl select-none">{user.avatar}</div>
                                )
                            ) : (
                                <div className="text-[10px] font-black text-gray-400 select-none">
                                    {initials}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <div className="font-bold text-gray-900">{user.name}</div>
                                {user.is_verified ? (
                                    <span
                                        title="Email verificado"
                                        className="text-green-500 bg-green-50 p-0.5 rounded-full border border-green-100"
                                    >
                                        <CheckCircle size={12} strokeWidth={1.5} />
                                    </span>
                                ) : (
                                    <div className="flex items-center gap-1">
                                        <span
                                            title="Email pendiente de verificación"
                                            className="text-yellow-500 bg-yellow-50 p-0.5 rounded-full border border-yellow-100"
                                        >
                                            <Clock size={12} strokeWidth={1.5} />
                                        </span>
                                        <button
                                            onClick={() => onVerifyEmail(user)}
                                            className="px-1.5 py-0.5 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded text-[9px] font-bold uppercase transition-colors"
                                            title="Verificar email manualmente"
                                        >
                                            Verificar
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="text-gray-500 text-xs">{user.email}</div>
                            {user.phone && (
                                <div className="text-gray-400 text-[10px]">{user.phone}</div>
                            )}
                        </div>
                    </div>
                </td>
                <td className="px-4 py-2">
                    <div className="flex flex-col gap-1.5">
                        {birthDate ? (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                                <Calendar size={12} strokeWidth={1.5} className="text-gray-400" />
                                {birthDate}
                            </div>
                        ) : (
                            <span className="text-xs text-gray-400">Sin fecha</span>
                        )}

                        {birthDate && (
                            <button
                                onClick={() => onToggleBirthday(user.id, user.birth_date_verified)}
                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold w-fit transition-all ${
                                    user.birth_date_verified
                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                }`}
                            >
                                {user.birth_date_verified ? (
                                    <>
                                        <CheckCircle size={10} strokeWidth={1.5} /> Verificado
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle size={10} strokeWidth={1.5} /> Sin Verificar
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </td>
                <td className="px-4 py-2 text-center">
                    <div className="inline-flex items-center justify-center bg-gray-100 text-gray-700 w-8 h-8 rounded-full font-bold">
                        {user.orderCount}
                    </div>
                </td>
                <td className="px-4 py-2 text-center">
                    <div className="font-bold text-gray-900">
                        {Number(user.totalSpent || 0)
                            .toFixed(2)
                            .replace('.', ',')}{' '}
                        €
                    </div>
                </td>

                <td className="px-4 py-2">
                    <div className="flex flex-col gap-1">
                        {user.last_seen_at ? (
                            <div className="flex items-center gap-2">
                                {isOnline ? (
                                    <div className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </div>
                                ) : (
                                    <div className="h-2 w-2 rounded-full bg-gray-300"></div>
                                )}
                                <span className="text-gray-900 font-bold text-xs">
                                    {lastSeenStr}
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-gray-400">
                                <Clock size={12} strokeWidth={1.5} />
                                <span className="text-xs italic">Nunca</span>
                            </div>
                        )}
                    </div>
                </td>
                <td className="px-4 py-2">{regDate}</td>
                <td className="px-4 py-2 text-center">
                    {user.is_superadmin ? (
                        <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-bold text-xs">
                            <Crown size={12} strokeWidth={1.5} /> Owner
                        </span>
                    ) : user.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full font-bold text-xs">
                            <Shield size={12} strokeWidth={1.5} /> Admin
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-bold text-xs">
                            <UsersIcon size={12} strokeWidth={1.5} /> Cliente
                        </span>
                    )}
                    {user.deleted_at && (
                        <div className="mt-1">
                            <span className="inline-flex items-center gap-1 bg-gray-900 text-white px-2 py-0.5 rounded-full font-black text-[9px] uppercase tracking-tighter">
                                Archivivado
                            </span>
                        </div>
                    )}
                </td>
                <td className="px-4 py-2 text-center flex items-center justify-center gap-1.5 min-w-[140px]">
                    {!user.is_superadmin && (
                        <div className="flex items-center gap-1.5">
                            {user.deleted_at ? (
                                <button
                                    onClick={() => onRestore(user)}
                                    className="p-1 px-2 flex items-center gap-1 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg font-black text-[10px] uppercase tracking-wider transition border border-green-100"
                                    title="Restaurar usuario"
                                >
                                    <RotateCcw size={14} strokeWidth={2} /> Restaurar
                                </button>
                            ) : (
                                <>
                                    {currentUser?.is_superadmin && (
                                        <button
                                            onClick={() => onToggleRole(user)}
                                            className={`px-3 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider transition ${
                                                user.role === 'admin'
                                                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                    : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                                            }`}
                                        >
                                            {user.role === 'admin' ? 'Revocar' : 'Hacer Admin'}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => onDelete(user)}
                                        className="p-1 text-gray-400 hover:text-red-600 transition"
                                        title="Archivar usuario"
                                    >
                                        <Trash2 size={16} strokeWidth={1.5} />
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </td>
            </tr>
        );
    }
);

export default function AdminUsers() {
    const { user: currentUser } = useAuth();
    const queryClient = useQueryClient();

    // UI state
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState({ field: 'last_seen_at', order: 'desc' });
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filter, setFilter] = useState('active'); // 'active', 'archived', 'all'

    // Modal state
    const [userToDelete, setUserToDelete] = useState<any>(null);
    const [userToChangeRole, setUserToChangeRole] = useState<any>(null);
    const [userToVerify, setUserToVerify] = useState<any>(null);

    const LIMIT = 20;

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Users Query
    const {
        data,
        isLoading,
        error: fetchError,
        isFetching,
        refetch,
    } = useQuery({
        queryKey: ['admin-users', page, sort.field, sort.order, debouncedSearch, filter],
        queryFn: () =>
            api.get(
                `/admin/users?page=${page}&limit=${LIMIT}&sortBy=${sort.field}&order=${sort.order}&search=${debouncedSearch}&filter=${filter}`
            ),
    });

    const users = data?.users || [];
    const pagination = data?.pagination || { page: 1, limit: LIMIT, total: 0, pages: 1 };

    // Mutations
    const deleteMutation = useMutation({
        mutationFn: (userId: number) => api.delete(`/admin/users/${userId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        },
    });

    const roleMutation = useMutation({
        mutationFn: ({ id, role }: { id: number; role: string }) =>
            api.patch(`/admin/users/${id}/role`, { role }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        },
    });

    const verifyEmailMutation = useMutation({
        mutationFn: (id: number) =>
            api.patch(`/admin/users/${id}/verify-email`, { is_verified: true }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        },
    });

    const verifyBirthdayMutation = useMutation({
        mutationFn: ({ id, verified }: { id: number; verified: boolean }) =>
            api.patch(`/admin/users/${id}/verify-birthday`, { verified }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        },
    });

    const restoreMutation = useMutation({
        mutationFn: (userId: number) => api.patch(`/admin/users/${userId}/restore`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        },
    });

    const handleSort = (field: string) => {
        setSort(prev => ({
            field,
            order: prev.field === field && prev.order === 'desc' ? 'asc' : 'desc',
        }));
    };

    const confirmToggleRole = async () => {
        if (!userToChangeRole) return;
        const { id, role: currentRole } = userToChangeRole;
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        roleMutation.mutate({ id, role: newRole });
        setUserToChangeRole(null);
    };

    const confirmVerifyEmail = async () => {
        if (!userToVerify) return;
        verifyEmailMutation.mutate(userToVerify.id);
        setUserToVerify(null);
    };

    const toggleBirthdayVerified = useCallback(
        (userId: number, currentVerified: boolean) => {
            verifyBirthdayMutation.mutate({ id: userId, verified: !currentVerified });
        },
        [verifyBirthdayMutation]
    );

    if (isLoading && users.length === 0) {
        return (
            <div className="text-center py-12 text-gray-400">
                <RefreshCw size={32} strokeWidth={1.5} className="mx-auto mb-4 animate-spin" />
                <p>Cargando usuarios...</p>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Search Bar */}
            <div className="mb-6 flex justify-between items-center">
                <div className="relative w-full max-w-md">
                    <Search
                        size={18}
                        strokeWidth={1.5}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                        type="text"
                        placeholder="Buscar por ID, nombre o email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 border border-gray-100 rounded-xl bg-white shadow-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all text-sm"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 border-none bg-transparent cursor-pointer"
                        >
                            <X size={16} strokeWidth={1.5} />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={filter}
                        onChange={e => {
                            setFilter(e.target.value);
                            setPage(1);
                        }}
                        className="pl-4 pr-10 py-2 border border-gray-100 rounded-xl bg-white shadow-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all text-sm font-bold text-gray-700 appearance-none cursor-pointer"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 0.75rem center',
                            backgroundSize: '1rem',
                        }}
                    >
                        <option value="active">Solo Activos</option>
                        <option value="archived">Solo Archivados</option>
                        <option value="all">Todos</option>
                    </select>

                    <button
                        onClick={() => refetch()}
                        className="p-2 text-gray-500 hover:text-gray-900 bg-white border border-gray-100 rounded-xl shadow-sm transition"
                        title="Actualizar"
                    >
                        <RefreshCw
                            size={18}
                            strokeWidth={1.5}
                            className={isFetching ? 'animate-spin' : ''}
                        />
                    </button>
                </div>
            </div>

            {fetchError && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 flex items-center gap-3">
                    <AlertCircle size={18} strokeWidth={1.5} />
                    <p className="font-medium">
                        {fetchError instanceof ApiError
                            ? fetchError.message
                            : 'Error al cargar los usuarios'}
                    </p>
                </div>
            )}

            <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-100">
                            <tr>
                                <th
                                    className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition"
                                    onClick={() => handleSort('id')}
                                >
                                    <div className="flex items-center gap-1">
                                        ID{' '}
                                        {sort.field === 'id' ? (
                                            sort.order === 'desc' ? (
                                                <ChevronDown size={14} strokeWidth={1.5} />
                                            ) : (
                                                <ChevronUp size={14} strokeWidth={1.5} />
                                            )
                                        ) : (
                                            <ArrowUpDown
                                                size={12}
                                                strokeWidth={1.5}
                                                className="opacity-30"
                                            />
                                        )}
                                    </div>
                                </th>
                                <th className="px-4 py-3 whitespace-nowrap">Nombre / Email</th>
                                <th className="px-4 py-3 whitespace-nowrap">Cumple / Verif.</th>
                                <th
                                    className="px-4 py-3 text-center cursor-pointer hover:bg-gray-100 transition"
                                    onClick={() => handleSort('orderCount')}
                                >
                                    <div className="flex items-center justify-center gap-1">
                                        Pedidos{' '}
                                        {sort.field === 'orderCount' ? (
                                            sort.order === 'desc' ? (
                                                <ChevronDown size={14} strokeWidth={1.5} />
                                            ) : (
                                                <ChevronUp size={14} strokeWidth={1.5} />
                                            )
                                        ) : (
                                            <ArrowUpDown
                                                size={12}
                                                strokeWidth={1.5}
                                                className="opacity-30"
                                            />
                                        )}
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3 text-center cursor-pointer hover:bg-gray-100 transition"
                                    onClick={() => handleSort('totalSpent')}
                                >
                                    <div className="flex items-center justify-center gap-1">
                                        Gastado{' '}
                                        {sort.field === 'totalSpent' ? (
                                            sort.order === 'desc' ? (
                                                <ChevronDown size={14} strokeWidth={1.5} />
                                            ) : (
                                                <ChevronUp size={14} strokeWidth={1.5} />
                                            )
                                        ) : (
                                            <ArrowUpDown
                                                size={12}
                                                strokeWidth={1.5}
                                                className="opacity-30"
                                            />
                                        )}
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition"
                                    onClick={() => handleSort('last_seen_at')}
                                >
                                    <div className="flex items-center gap-1">
                                        Actividad{' '}
                                        {sort.field === 'last_seen_at' ? (
                                            sort.order === 'desc' ? (
                                                <ChevronDown size={14} strokeWidth={1.5} />
                                            ) : (
                                                <ChevronUp size={14} strokeWidth={1.5} />
                                            )
                                        ) : (
                                            <ArrowUpDown
                                                size={12}
                                                strokeWidth={1.5}
                                                className="opacity-30"
                                            />
                                        )}
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition"
                                    onClick={() => handleSort('created_at')}
                                >
                                    <div className="flex items-center gap-1">
                                        Reg.{' '}
                                        {sort.field === 'created_at' ? (
                                            sort.order === 'desc' ? (
                                                <ChevronDown size={14} strokeWidth={1.5} />
                                            ) : (
                                                <ChevronUp size={14} strokeWidth={1.5} />
                                            )
                                        ) : (
                                            <ArrowUpDown
                                                size={12}
                                                strokeWidth={1.5}
                                                className="opacity-30"
                                            />
                                        )}
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3 text-center cursor-pointer hover:bg-gray-100 transition"
                                    onClick={() => handleSort('role')}
                                >
                                    <div className="flex items-center justify-center gap-1">
                                        Rol{' '}
                                        {sort.field === 'role' ? (
                                            sort.order === 'desc' ? (
                                                <ChevronDown size={14} strokeWidth={1.5} />
                                            ) : (
                                                <ChevronUp size={14} strokeWidth={1.5} />
                                            )
                                        ) : (
                                            <ArrowUpDown
                                                size={12}
                                                strokeWidth={1.5}
                                                className="opacity-30"
                                            />
                                        )}
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-center whitespace-nowrap">
                                    Acciones
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 text-pretty">
                            {users.map((user: any) => (
                                <UserRow
                                    key={user.id}
                                    user={user}
                                    currentUser={currentUser}
                                    onToggleRole={setUserToChangeRole}
                                    onDelete={setUserToDelete}
                                    onRestore={u => restoreMutation.mutate(u.id)}
                                    onToggleBirthday={toggleBirthdayVerified}
                                    onVerifyEmail={setUserToVerify}
                                />
                            ))}
                            {!isLoading && users.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={9}
                                        className="px-4 py-12 text-center text-gray-400"
                                    >
                                        No se encontraron usuarios
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {pagination.pages > 1 && (
                    <div className="p-4 border-t border-gray-100 flex justify-center gap-2 bg-gray-50">
                        {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(pageNum => (
                            <button
                                key={pageNum}
                                onClick={() => setPage(pageNum)}
                                className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm transition ${
                                    pageNum === page
                                        ? 'bg-red-600 text-white shadow-md'
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                            >
                                {pageNum}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Permanent Delete Confirmation Modal */}
            {userToDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        onClick={() => setUserToDelete(null)}
                    />
                    <div className="relative bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Trash2 size={32} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2">
                                ¿Eliminar usuario PARA SIEMPRE?
                            </h3>
                            <p className="text-sm text-gray-500 font-medium mb-6">
                                Estás a punto de borrar definitivamente a{' '}
                                <span className="text-red-600 font-black">
                                    {userToDelete.name} (ID: #{userToDelete.id}, Email:{' '}
                                    {userToDelete.email})
                                </span>
                                .
                                <br />
                                <br />
                                <span className="p-3 bg-red-50 border border-red-100 rounded-xl block text-red-700 font-bold text-xs uppercase tracking-tight">
                                    ¡Atención! Esta acción es irreversible. Se ELIMINARÁN PARA
                                    SIEMPRE todos sus pedidos, direcciones, historial y cualquier
                                    dato asociado.
                                </span>
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => {
                                        deleteMutation.mutate(userToDelete.id);
                                        setUserToDelete(null);
                                    }}
                                    disabled={deleteMutation.isPending}
                                    className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-xs md:text-sm hover:bg-black transition-all flex items-center justify-center gap-2"
                                >
                                    {deleteMutation.isPending && (
                                        <RefreshCw size={16} className="animate-spin" />
                                    )}
                                    SÍ, ELIMINAR AHORA
                                </button>
                                <button
                                    onClick={() => setUserToDelete(null)}
                                    className="w-full py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs md:text-sm hover:bg-gray-200"
                                >
                                    CANCELAR
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Role Change Confirmation Modal */}
            {userToChangeRole && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        onClick={() => setUserToChangeRole(null)}
                    />
                    <div className="relative bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Shield size={32} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2">
                                {userToChangeRole.role === 'admin'
                                    ? '¿Revocar permisos de Admin?'
                                    : '¿Asignar como Administrador?'}
                            </h3>
                            <p className="text-sm text-gray-500 font-medium mb-6 text-pretty">
                                ¿Deseas realmente{' '}
                                <span className="font-black text-red-600">
                                    {userToChangeRole.role === 'admin' ? 'QUITAR' : 'OTORGAR'}
                                </span>{' '}
                                permisos de administración a:
                                <br />
                                <span className="block mt-2 font-black text-gray-900 text-base">
                                    {userToChangeRole.name}
                                </span>
                                <span className="block text-gray-400 text-xs">
                                    {userToChangeRole.email}
                                </span>
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={confirmToggleRole}
                                    disabled={roleMutation.isPending}
                                    className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-xs md:text-sm hover:bg-black transition-all flex items-center justify-center gap-2"
                                >
                                    {roleMutation.isPending && (
                                        <RefreshCw size={16} className="animate-spin" />
                                    )}
                                    SÍ, CAMBIAR PERMISOS
                                </button>
                                <button
                                    onClick={() => setUserToChangeRole(null)}
                                    className="w-full py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs md:text-sm hover:bg-gray-200"
                                >
                                    CANCELAR
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Email Verify Confirmation Modal */}
            {userToVerify && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        onClick={() => setUserToVerify(null)}
                    />
                    <div className="relative bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <CheckCircle size={32} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2">
                                ¿Verificar Email Manualmente?
                            </h3>
                            <p className="text-sm text-gray-500 font-medium mb-6 text-pretty">
                                Estás a punto de verificar manualmente la cuenta de:
                                <br />
                                <span className="block mt-2 font-black text-gray-900 text-base">
                                    {userToVerify.name}
                                </span>
                                <span className="block text-gray-400 text-xs">
                                    {userToVerify.email}
                                </span>
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={confirmVerifyEmail}
                                    disabled={verifyEmailMutation.isPending}
                                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs md:text-sm hover:bg-black transition-all flex items-center justify-center gap-2"
                                >
                                    {verifyEmailMutation.isPending && (
                                        <RefreshCw size={16} className="animate-spin" />
                                    )}
                                    SÍ, VERIFICAR AHORA
                                </button>
                                <button
                                    onClick={() => setUserToVerify(null)}
                                    className="w-full py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs md:text-sm hover:bg-gray-200"
                                >
                                    CANCELAR
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
