import React from 'react';
import {
    Html,
    Head,
    Body,
    Container,
    Section,
    Text,
    Hr,
    Row,
    Column,
} from '@react-email/components';

interface OrderItem {
    name: string;
    quantity: number;
    price_at_time: number;
}

interface OrderReceiptEmailProps {
    orderId: string;
    customerName: string;
    items: OrderItem[];
    total: number;
    deliveryAddress: string;
    phoneNumber: string;
    notes?: string;
}

export const OrderReceiptEmail = ({
    orderId,
    customerName,
    items,
    total,
    deliveryAddress,
    phoneNumber,
    notes,
}: OrderReceiptEmailProps) => {
    return (
        <Html>
            <Head />
            <Body style={main}>
                <Container style={container}>
                    <Section style={header}>
                        <Text style={headerTitle}>🍣 Sushi de Maksim</Text>
                    </Section>

                    <Section style={content}>
                        <Text style={greeting}>¡Hola {customerName}!</Text>
                        <Text style={paragraph}>
                            Gracias por tu pedido. Hemos recibido tu orden <strong>#{String(orderId).padStart(5, '0')}</strong> y la estamos preparando.
                        </Text>

                        <Hr style={divider} />

                        <Text style={sectionTitle}>Resumen de tu pedido:</Text>

                        <Section style={itemsList}>
                            {items.map((item, idx) => (
                                <Row key={idx} style={itemRow}>
                                    <Column style={itemNameCol}>
                                        <Text style={itemText}>
                                            {item.quantity}x {item.name}
                                        </Text>
                                    </Column>
                                    <Column style={itemPriceCol}>
                                        <Text style={itemTextRight}>
                                            {(item.price_at_time * item.quantity).toFixed(2).replace('.', ',')} €
                                        </Text>
                                    </Column>
                                </Row>
                            ))}
                        </Section>

                        <Hr style={divider} />

                        <Row>
                            <Column>
                                <Text style={totalLabel}>TOTAL</Text>
                            </Column>
                            <Column style={itemPriceCol}>
                                <Text style={totalValue}>{total.toFixed(2).replace('.', ',')} €</Text>
                            </Column>
                        </Row>

                        <Hr style={divider} />

                        <Text style={sectionTitle}>Detalles de entrega:</Text>
                        <Text style={detailText}><strong>Dirección:</strong> {deliveryAddress}</Text>
                        <Text style={detailText}><strong>Teléfono:</strong> {phoneNumber}</Text>
                        {notes && <Text style={detailText}><strong>Notas:</strong> {notes}</Text>}

                        <div style={footerSpacing} />

                        <Text style={footerText}>
                            Tiempo aproximado de entrega: 30-60 minutos.<br />
                            ¡Esperamos que lo disfrutes!
                        </Text>
                    </Section>

                    <Section style={footer}>
                        <Text style={footerCopyright}>© {new Date().getFullYear()} Sushi de Maksim | Madrid</Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

export default OrderReceiptEmail;

const main = {
    backgroundColor: '#f3f4f6',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
    margin: '30px auto',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
    maxWidth: '500px',
};

const header = {
    padding: '30px 20px',
    backgroundColor: '#dc2626',
    textAlign: 'center' as const,
};

const headerTitle = {
    color: '#ffffff',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0',
};

const content = {
    padding: '30px',
};

const greeting = {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '15px',
};

const paragraph = {
    fontSize: '15px',
    lineHeight: '1.5',
    color: '#374151',
    margin: '0',
};

const divider = {
    borderColor: '#e5e7eb',
    margin: '20px 0',
};

const sectionTitle = {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#9ca3af',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    marginBottom: '15px',
};

const itemsList = {
    marginBottom: '10px',
};

const itemRow = {
    marginBottom: '8px',
};

const itemNameCol = {
    width: '75%',
};

const itemPriceCol = {
    width: '25%',
    textAlign: 'right' as const,
};

const itemText = {
    fontSize: '15px',
    color: '#374151',
    margin: '0',
};

const itemTextRight = {
    fontSize: '15px',
    color: '#374151',
    margin: '0',
    fontWeight: 'bold',
};

const totalLabel = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#111827',
    margin: '0',
};

const totalValue = {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#dc2626',
    margin: '0',
};

const detailText = {
    fontSize: '14px',
    color: '#4b5563',
    margin: '4px 0',
};

const footerSpacing = {
    height: '20px',
};

const footerText = {
    fontSize: '14px',
    color: '#6b7280',
    textAlign: 'center' as const,
    marginTop: '20px',
    fontStyle: 'italic',
};

const footer = {
    backgroundColor: '#f9fafb',
    padding: '20px',
    textAlign: 'center' as const,
    borderTop: '1px solid #f3f4f6',
};

const footerCopyright = {
    fontSize: '12px',
    color: '#9ca3af',
    margin: '0',
};
