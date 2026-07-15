/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#f0f4f8',
                    100: '#d9e2ec',
                    200: '#bcccdc',
                    300: '#9fb3c8',
                    400: '#829ab1',
                    500: '#627d98',
                    600: '#486581',
                    700: '#334e68',
                    800: '#243b53',
                    900: '#102a43',
                    950: '#0a1a2f',
                },
                gold: {
                    50: '#fffbeb',
                    100: '#fef3c7',
                    200: '#fde68a',
                    300: '#fcd34d',
                    400: '#fbbf24',
                    500: '#f59e0b',
                    600: '#d97706',
                    700: '#b45309',
                    800: '#92400e',
                    900: '#78350f',
                },
                surface: {
                    light: '#F8FAFC',
                    dark: '#0F172A',
                    card: '#FFFFFF',
                    'card-dark': '#1E293B',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
            },
            boxShadow: {
                'gold': '0 4px 14px 0 rgba(245, 158, 11, 0.25)',
                'navy': '0 4px 14px 0 rgba(30, 58, 95, 0.15)',
                'card': '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
                'elevated': '0 10px 40px -10px rgba(0, 0, 0, 0.1)',
            },
        },
    },
    plugins: [],
};