/** Shared styles used across all profile tab components */

export const cardStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    padding: '24px',
    marginBottom: '20px',
};

export const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 14px',
    border: '1px solid #E5E7EB',
    borderRadius: '10px',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
    backgroundColor: '#FAFAFA',
};

export function handleInputFocus(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.borderColor = '#F26522';
    e.target.style.backgroundColor = 'white';
}

export function handleInputBlur(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.borderColor = '#E5E7EB';
    e.target.style.backgroundColor = '#FAFAFA';
}
