/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        premium: {
          dark: '#0F172A',
          darker: '#111827',
          card: '#1E293B',
          emerald: '#10B981',
          violet: '#8B5CF6',
          amber: '#F59E0B',
          orange: '#FB923C',
          success: '#22C55E',
          warning: '#F59E0B',
          error: '#EF4444',
          text: '#F8FAFC',
          muted: '#94A3B8',
        },
      },
      backgroundImage: {
        'gradient-emerald-violet': 'linear-gradient(135deg, #10B981 0%, #8B5CF6 100%)',
        'gradient-amber-orange': 'linear-gradient(135deg, #F59E0B 0%, #FB923C 100%)',
        'gradient-hero': 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)',
      },
      boxShadow: {
        'emerald-glow': '0 0 20px rgba(16, 185, 129, 0.3)',
        'violet-glow': '0 0 20px rgba(139, 92, 246, 0.3)',
        'premium': '0 8px 32px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
};
