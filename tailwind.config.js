// Personaliza el tema de Tailwind; estos nombres de configuración son propios del framework.
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'on-secondary': '#ffffff',
        'on-primary-fixed': '#281800',
        'inverse-primary': '#e0c298',
        'on-primary-container': '#513d1d',
        'inverse-on-surface': '#faeeec',
        'on-surface-variant': '#4d463c',
        'surface-container-high': '#f1e6e4',
        'on-surface': '#201a19',
        'surface-variant': '#ece0de',
        'primary-fixed-dim': '#e0c298',
        'secondary-container': '#ffc6cc',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',
        'on-secondary-container': '#7b5055',
        'surface-container': '#f7ebe9',
        'surface-container-highest': '#ece0de',
        'tertiary-fixed-dim': '#e9c349',
        'secondary-fixed': '#ffd9dd',
        background: '#fff8f6',
        'on-primary': '#ffffff',
        'secondary-fixed-dim': '#f0b8be',
        'surface-tint': '#725b38',
        'surface-container-low': '#fdf1ef',
        'surface-container-lowest': '#ffffff',
        'on-secondary-fixed': '#311117',
        error: '#ba1a1a',
        outline: '#7f766a',
        'outline-variant': '#d1c5b8',
        'on-tertiary-fixed': '#241a00',
        'tertiary-fixed': '#ffe088',
        primary: '#725b38',
        'surface-dim': '#e3d7d6',
        'on-tertiary': '#ffffff',
        'tertiary-container': '#cda931',
        'on-error': '#ffffff',
        'surface-bright': '#fff8f6',
        'on-primary-fixed-variant': '#584323',
        'on-tertiary-fixed-variant': '#574500',
        'inverse-surface': '#352f2e',
        secondary: '#7e5258',
        surface: '#fff8f6',
        'primary-container': '#c5a880',
        'on-tertiary-container': '#503f00'
      },
      fontFamily: {
        titular: ['Bodoni Moda', 'serif'],
        cuerpo: ['Plus Jakarta Sans', 'sans-serif']
      },
      boxShadow: {
        suave: '0 12px 36px -8px rgba(74, 62, 61, 0.08)',
        tarjeta: '0 18px 40px -20px rgba(72,58,50,0.22)'
      }
    }
  }
}
