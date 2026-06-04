import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';

function WhatsappButton() {
  const whatsappNumber = '923399119906';
  const message = encodeURIComponent('Hello, I need help with BagsVerse!');

  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <a
      href={whatsappLink}
      target='_blank'
      rel='noopener noreferrer'
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: '#25D366',
        color: 'white',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
        zIndex: 1000,
        cursor: 'pointer'
      }}
    >
      <FaWhatsapp size={24} />
    </a>
  );
}

export default WhatsappButton;
