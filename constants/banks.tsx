
import React from 'react';

// --- DADOS MESTRES (COM SVGs INLINE) ---
export const BANKS_DATA = [
  // GRANDES BANCOS
  { 
    id: 'nubank', 
    name: 'Nubank', 
    color: '#820AD1', 
    logo: '', 
    logoComponent: (
      <svg viewBox="0 0 40 40" fill="none" className="h-full w-auto">
        <path d="M12.7 26.6h4.2v-7.5c0-2.4 1.3-3.6 3.6-3.6s3.6 1.3 3.6 3.6v7.5h4.2v-8c0-4.4-2.7-7.3-6.8-7.3-2.6 0-4.5 1.1-5.6 3-1.1-1.9-3-3-5.6-3-4.1 0-6.8 2.9-6.8 7.3v8h4.2v-7.5c0-2.4 1.3-3.6 3.6-3.6 2.4 0 3.6 1.2 3.6 3.6v7.5z" fill="white"/>
        <path d="M7.5 13.6c0-1.5-.9-2.5-2.5-2.5-1.5 0-2.5.9-2.5 2.5s.9 2.5 2.5 2.5c1.5 0 2.5-1 2.5-2.5zM36.5 13.6c0-1.5-.9-2.5-2.5-2.5-1.5 0-2.5.9-2.5 2.5s.9 2.5 2.5 2.5c1.5 0 2.5-1 2.5-2.5z" fill="white"/>
      </svg>
    )
  },
  { 
    id: 'itau', 
    name: 'Itaú', 
    color: '#EC7000', 
    logo: '',
    logoComponent: (
      <svg viewBox="0 0 48 48" className="h-full w-auto">
        <rect width="48" height="48" rx="8" fill="#00358E"/>
        <path d="M16 34h4v-7.2c0-2.8 1.4-4.8 4.6-4.8 2.6 0 4 1.6 4 4.2V34h4V24.8c0-5-2.8-7.8-7.2-7.8-2.6 0-4.8 1.4-6 3.4V12h-4v22zM34 12h-4v4h4v-4z" fill="#FEF115"/>
        <path d="M12 12h4v16h-4z" fill="#FEF115" opacity="0"/> 
      </svg>
    )
  },
  { 
    id: 'bradesco', 
    name: 'Bradesco', 
    color: '#CC092F', 
    logo: '',
    logoComponent: (
      <svg viewBox="0 0 100 100" className="h-full w-auto">
         <path d="M22 74h14l-7-24z m28-24l-7 24h14z m26 6h-10l-12-38h34z m-52-38h34l-12 38h-10z" fill="white"/>
      </svg>
    )
  },
  { 
    id: 'bb', 
    name: 'Banco do Brasil', 
    color: '#FEF115', 
    textColor: 'black', 
    logo: '',
    logoComponent: (
      <svg viewBox="0 0 100 100" className="h-full w-auto">
        <path fill="#003DA5" d="M10 50a40 40 0 1 1 80 0 40 40 0 0 1-80 0z M68 38h-8l-4 12-4-12h-8l-8 24h6l2-8h12l2 8h6L68 38z"/>
      </svg>
    )
  },
  { 
    id: 'santander', 
    name: 'Santander', 
    color: '#EC0000', 
    logo: '',
    logoComponent: (
      <svg viewBox="0 0 100 40" className="h-full w-auto">
        <path d="M15 20c0-6 4-10 10-11v5c-3 1-4 3-4 6 0 3 4 4 8 4 5 0 8-2 8-6 0-3-2-5-5-6V7c6 2 10 6 10 13 0 8-6 12-14 12-7 0-13-4-13-12z" fill="white"/>
        <path d="M45 20c0-6 4-10 10-11v5c-3 1-4 3-4 6 0 3 4 4 8 4 5 0 8-2 8-6 0-3-2-5-5-6V7c6 2 10 6 10 13 0 8-6 12-14 12-7 0-13-4-13-12z" fill="white" opacity="0.5"/>
      </svg>
    )
  },
  { 
    id: 'caixa', 
    name: 'Caixa', 
    color: '#005CA9', 
    logo: '',
    logoComponent: (
      <svg viewBox="0 0 100 30" className="h-full w-auto">
        <path d="M15 5l-10 10 10 10h5l-10-10 10-10z m10 0l10 10-10 10h5l10-10-10-10z" fill="#F39200"/>
        <path d="M40 5h5v20h-5z M50 5h5v20h-5z M60 5h15v5h-10v2.5h10v5h-10v2.5h10v5h-15z" fill="white"/>
      </svg>
    )
  },
  
  // DIGITAIS E FINTECHS
  { 
    id: 'inter', 
    name: 'Banco Inter', 
    color: '#FF7A00', 
    logo: '',
    logoComponent: (
       <svg viewBox="0 0 100 30" className="h-full w-auto">
          <path d="M10 5h8v20h-8z M25 5h8v5h-8z M25 12h8v13h-8z M40 5h8v8h5v-8h8v20h-8v-7h-5v7h-8z" fill="white"/>
       </svg>
    )
  },
  { id: 'btg', name: 'BTG Pactual', color: '#002C68', logo: 'https://raw.githubusercontent.com/gilbarbara/logos/main/logos/btg-pactual.svg' },
  { 
    id: 'c6', 
    name: 'C6 Bank', 
    color: '#242424', 
    logo: '',
    logoComponent: (
      <svg viewBox="0 0 100 100" className="h-full w-auto">
         <text x="50" y="70" textAnchor="middle" fontSize="60" fontWeight="bold" fill="white" fontFamily="Arial">C6</text>
      </svg>
    )
  },
  { 
    id: 'xp', 
    name: 'XP Investimentos', 
    color: '#000000', 
    logo: '',
    logoComponent: (
      <svg viewBox="0 0 100 40" className="h-full w-auto">
        <path d="M20 5l15 30h-5l-12.5-25-12.5 25h-5l15-30z M60 5h20c8 0 15 5 15 15s-7 15-15 15h-5v-30h5z m0 5v20h15c5 0 10-3 10-10s-5-10-10-10h-15z" fill="white"/>
      </svg>
    )
  },
  { 
    id: 'neon', 
    name: 'Neon', 
    color: '#00FFFF', 
    logo: '', 
    textColor: 'black',
    logoComponent: (
      <svg viewBox="0 0 100 30" className="h-full w-auto">
         <circle cx="15" cy="15" r="10" fill="#00235F"/>
         <path d="M40 8v14h3l8-10v10h3v-14h-3l-8 10v-10z M65 8h12v3h-9v2.5h8v3h-8v2.5h9v3h-12z" fill="#00235F"/>
      </svg>
    )
  },
  { 
    id: 'next', 
    name: 'Next', 
    color: '#00FF5F', 
    logo: '', 
    textColor: 'black',
    logoComponent: (
      <svg viewBox="0 0 100 30" className="h-full w-auto">
         <path d="M10 8v14h4l8-10v10h4v-14h-4l-8 10v-10z M40 8h12v3h-8v2.5h7v3h-7v2.5h8v3h-12z M60 8l5 7-5 7h4l3-4.5 3 4.5h4l-5-7 5-7h-4l-3 4.5-3-4.5z" fill="black"/>
      </svg>
    )
  },
  { id: 'original', name: 'Banco Original', color: '#00B44A', logo: 'https://raw.githubusercontent.com/gilbarbara/logos/main/logos/banco-original.svg' },
  { id: 'pan', name: 'Banco Pan', color: '#0088CC', logo: 'https://raw.githubusercontent.com/gilbarbara/logos/main/logos/banco-pan.svg' },
  { id: 'will', name: 'Will Bank', color: '#FFD700', logo: 'https://logospng.org/wp-content/uploads/will-bank-logo.png', textColor: 'black' },
  { id: 'digio', name: 'Digio', color: '#00235F', logo: 'https://logospng.org/wp-content/uploads/digio-logo.png' },
  { id: 'nomad', name: 'Nomad', color: '#FDB913', logo: 'https://logospng.org/wp-content/uploads/nomad-logo.png', textColor: 'black' },
  { id: 'wise', name: 'Wise', color: '#9FE870', logo: 'https://raw.githubusercontent.com/gilbarbara/logos/main/logos/wise.svg', textColor: 'black' },
  
  // CARTEIRAS E VAREJO
  { id: '99pay', name: '99Pay', color: '#D7D719', logo: 'https://logospng.org/wp-content/uploads/99-taxis-logo.png', textColor: 'black' },
  { id: 'mercadopago', name: 'Mercado Pago', color: '#009EE3', logo: 'https://raw.githubusercontent.com/gilbarbara/logos/main/logos/mercado-pago.svg' },
  { id: 'picpay', name: 'PicPay', color: '#21C25E', logo: 'https://raw.githubusercontent.com/gilbarbara/logos/main/logos/picpay.svg' },
  { id: 'pagbank', name: 'PagBank', color: '#00C365', logo: 'https://raw.githubusercontent.com/gilbarbara/logos/main/logos/pagseguro.svg' },
  { id: 'ame', name: 'Ame Digital', color: '#FF007F', logo: 'https://raw.githubusercontent.com/gilbarbara/logos/main/logos/ame-digital.svg' },
  
  // OUTROS / TRADICIONAIS
  { id: 'safra', name: 'Safra', color: '#D0A74F', logo: 'https://raw.githubusercontent.com/gilbarbara/logos/main/logos/safra.svg', textColor: 'black' },
  { id: 'sicredi', name: 'Sicredi', color: '#366336', logo: 'https://raw.githubusercontent.com/gilbarbara/logos/main/logos/sicredi.svg' },
  { id: 'sicoob', name: 'Sicoob', color: '#003641', logo: 'https://raw.githubusercontent.com/gilbarbara/logos/main/logos/sicoob.svg' },
  { id: 'bmg', name: 'Banco BMG', color: '#F58220', logo: 'https://raw.githubusercontent.com/gilbarbara/logos/main/logos/bmg.svg' },
  { id: 'daycoval', name: 'Daycoval', color: '#F39200', logo: 'https://logospng.org/wp-content/uploads/banco-daycoval-logo.png' },
  { id: 'brb', name: 'BRB', color: '#0067B1', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Banco_de_Bras%C3%ADlia_logo.svg' },
  { id: 'banrisul', name: 'Banrisul', color: '#004884', logo: 'https://raw.githubusercontent.com/gilbarbara/logos/main/logos/banrisul.svg' },
  { id: 'generic', name: 'Outro Banco', color: '#64748b', logo: '' }
];
