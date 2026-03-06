import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle } from 'lucide-react';
import { api } from '../../utils/api';
import { cardStyle } from './profileStyles';

function OrderTimer({ createdAt }: { createdAt: string }) {
    const [timeLeft, setTimeLeft] = useState('');
    const [isLate, setIsLate] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const d = new Date(createdAt);
            const validDate = isNaN(d.getTime())
                ? new Date(
                      createdAt.replace(' ', 'T') +
                          (createdAt.includes('Z') || createdAt.includes('+') ? '' : 'Z')
                  )
                : d;
            const start = validDate.getTime();
            const end = start + 60 * 60 * 1000; // 60 minutes
            const now = new Date().getTime();
            const diff = end - now;

            if (diff <= 0) {
                setIsLate(true);
                setTimeLeft('00:00 (Atrasado)');
            } else {
                setIsLate(false);
                const minutes = Math.floor(diff / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft(
                    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                );
            }
        };

        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(interval);
    }, [createdAt]);

    return (
        <span style={{ color: isLate ? '#DC2626' : '#D97706', fontWeight: 'bold' }}>
            ⏱️ {timeLeft}
        </span>
    );
}

function getStatusBadge(status: string) {
    const styles: Record<string, { bg: string; color: string; label: string }> = {
        pending: { bg: '#FEF3C7', color: '#D97706', label: 'Pendiente' },
        confirmed: { bg: '#DBEAFE', color: '#2563EB', label: 'Confirmado' },
        preparing: { bg: '#EDE9FE', color: '#7C3AED', label: 'Preparando' },
        on_the_way: { bg: '#FEE2E2', color: '#DC2626', label: 'En camino 🛵' },
        delivered: { bg: '#D1FAE5', color: '#059669', label: 'Entregado' },
        cancelled: { bg: '#F3F4F6', color: '#6B7280', label: 'Cancelado' },
    };
    const s = styles[status] || styles.pending;
    return (
        <span
            style={{
                backgroundColor: s.bg,
                color: s.color,
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 'bold',
            }}
        >
            {s.label}
        </span>
    );
}

export default function OrdersTab() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

    useEffect(() => {
        loadOrders(1);
    }, []);

    const loadOrders = async (page: number) => {
        setLoading(true);
        try {
            const data = await api.get(`/orders?page=${page}&limit=10`);
            setOrders(data.orders);
            setPagination(data.pagination);
        } catch {
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const markDelivered = async (id: number) => {
        try {
            await api.patch(`/orders/${id}/deliver`);
            loadOrders(pagination.page);
        } catch (e) {
            alert('Error al actualizar el pedido');
        }
    };

    if (loading) {
        return (
            <div>
                <h1
                    style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        marginBottom: '20px',
                        color: '#111827',
                    }}
                >
                    Mis Pedidos
                </h1>
                <div
                    style={{ ...cardStyle, textAlign: 'center', padding: '48px', color: '#6B7280' }}
                >
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
                    Cargando pedidos...
                </div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div>
                <h1
                    style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        marginBottom: '20px',
                        color: '#111827',
                    }}
                >
                    Mis Pedidos
                </h1>
                <div style={{ ...cardStyle, textAlign: 'center', padding: '48px 24px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                    <h3
                        style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            marginBottom: '8px',
                            color: '#111827',
                        }}
                    >
                        No tienes pedidos todavía
                    </h3>
                    <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '20px' }}>
                        ¡Haz tu primer pedido y aparecerá aquí!
                    </p>
                    <button
                        onClick={() => navigate('/menu')}
                        style={{
                            backgroundColor: '#DC2626',
                            color: 'white',
                            padding: '10px 24px',
                            borderRadius: '8px',
                            border: 'none',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            cursor: 'pointer',
                        }}
                    >
                        Ver menú
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h1
                style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    marginBottom: '20px',
                    color: '#111827',
                }}
            >
                Mis Pedidos
            </h1>

            {orders.map(order => (
                <div key={order.id} style={cardStyle}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '16px',
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    marginBottom: '4px',
                                }}
                            >
                                <h3
                                    style={{
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        margin: 0,
                                        color: '#111827',
                                    }}
                                >
                                    Pedido #{String(order.id).padStart(5, '0')}
                                </h3>
                                {getStatusBadge(order.status)}
                            </div>
                            <p
                                style={{
                                    fontSize: '13px',
                                    color: '#6B7280',
                                    margin: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                }}
                            >
                                <Clock size={12} />
                                {(() => {
                                    const d = new Date(order.created_at);
                                    const validDate = isNaN(d.getTime())
                                        ? new Date(
                                              order.created_at.replace(' ', 'T') +
                                                  (order.created_at.includes('Z') ||
                                                  order.created_at.includes('+')
                                                      ? ''
                                                      : 'Z')
                                          )
                                        : d;
                                    return validDate.toLocaleDateString('es-ES', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    });
                                })()}
                            </p>
                            {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                <p style={{ fontSize: '13px', margin: '4px 0 0 0' }}>
                                    Tiempo restante: <OrderTimer createdAt={order.created_at} />
                                </p>
                            )}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#DC2626' }}>
                                {order.total.toFixed(2).replace('.', ',')} €
                            </div>
                            <div style={{ fontSize: '12px', color: '#6B7280' }}>
                                {order.items?.reduce((s: number, i: any) => s + i.quantity, 0) ?? 0}{' '}
                                productos
                            </div>
                        </div>
                    </div>
                    <div
                        style={{
                            marginBottom: order.notes ? '16px' : '12px',
                            backgroundColor: '#F9FAFB',
                            borderRadius: '12px',
                            padding: '16px',
                            border: '1px solid #F3F4F6',
                        }}
                    >
                        <h4
                            style={{
                                fontSize: '14px',
                                fontWeight: 'bold',
                                color: '#374151',
                                marginBottom: '12px',
                                paddingBottom: '8px',
                                borderBottom: '1px solid #E5E7EB',
                            }}
                        >
                            Detalles del pedido
                        </h4>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                                marginBottom: '12px',
                            }}
                        >
                            {order.items?.map((item: any, i: number) => (
                                <div
                                    key={i}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: '14px',
                                        color: '#4B5563',
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            gap: '8px',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontWeight: 'bold',
                                                color: '#111827',
                                                minWidth: '24px',
                                            }}
                                        >
                                            x{item.quantity}
                                        </span>
                                        <span>{item.name}</span>
                                    </div>
                                    <div style={{ fontWeight: 'medium' }}>
                                        {(item.price_at_time * item.quantity)
                                            .toFixed(2)
                                            .replace('.', ',')}{' '}
                                        €
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div
                            style={{
                                paddingTop: '12px',
                                borderTop: '1px dashed #D1D5DB',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px',
                            }}
                        >
                            {/* Calculate subtotal from items if possible, otherwise rely on order total */}
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '14px',
                                    color: '#6B7280',
                                }}
                            >
                                <span>Subtotal:</span>
                                <span>
                                    {order.items
                                        ?.reduce(
                                            (s: number, i: any) => s + i.price_at_time * i.quantity,
                                            0
                                        )
                                        .toFixed(2)
                                        .replace('.', ',')}{' '}
                                    €
                                </span>
                            </div>

                            {order.items?.reduce(
                                (s: number, i: any) => s + i.price_at_time * i.quantity,
                                0
                            ) > order.total && (
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: '14px',
                                        color: '#10B981',
                                        fontWeight: 'bold',
                                    }}
                                >
                                    <span>Descuento aplicado:</span>
                                    <span>
                                        -
                                        {(
                                            order.items?.reduce(
                                                (s: number, i: any) =>
                                                    s + i.price_at_time * i.quantity,
                                                0
                                            ) - order.total
                                        )
                                            .toFixed(2)
                                            .replace('.', ',')}{' '}
                                        €
                                    </span>
                                </div>
                            )}

                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '16px',
                                    color: '#111827',
                                    fontWeight: 'bold',
                                    marginTop: '4px',
                                    paddingTop: '8px',
                                    borderTop: '1px solid #E5E7EB',
                                }}
                            >
                                <span>Total Pagado:</span>
                                <span style={{ color: '#DC2626' }}>
                                    {order.total.toFixed(2).replace('.', ',')} €
                                </span>
                            </div>
                        </div>
                    </div>
                    {order.notes && (
                        <div
                            style={{
                                backgroundColor: '#FEF2F2',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                fontSize: '13px',
                                color: '#B91C1C',
                                borderLeft: '3px solid #DC2626',
                                marginBottom: '12px',
                            }}
                        >
                            <span style={{ fontWeight: 'bold' }}>Notas:</span> {order.notes}
                        </div>
                    )}
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <button
                            onClick={() => markDelivered(order.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 16px',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                backgroundColor: '#10B981',
                                color: 'white',
                                fontSize: '13px',
                                fontWeight: 'bold',
                                width: 'fit-content',
                            }}
                        >
                            <CheckCircle size={14} /> Marcar como entregado (Detener timer)
                        </button>
                    )}
                </div>
            ))}

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '8px',
                        marginTop: '8px',
                    }}
                >
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                        <button
                            key={p}
                            onClick={() => loadOrders(p)}
                            style={{
                                padding: '6px 14px',
                                border: '1px solid #E5E7EB',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                backgroundColor: p === pagination.page ? '#DC2626' : 'white',
                                color: p === pagination.page ? 'white' : '#374151',
                                fontWeight: p === pagination.page ? 'bold' : 'normal',
                            }}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
