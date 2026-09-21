import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'PILKB';

createInertiaApp({
    title: (title) => {
        if (!title) return 'PILKB';
        let clean = String(title).trim();
        clean = clean.replace(/\bLaravel\b/gi, '').trim();
        clean = clean.replace(/^PILKB\s*[-–|:]\s*/i, '').trim();
        clean = clean.replace(/\s*[-–|:]\s*PILKB$/i, '').trim();
        clean = clean.replace(/^[-–|:]\s*|\s*[-–|:]$/g, '').trim();
        if (!clean || clean.toUpperCase() === 'PILKB') return 'PILKB';
        return `${clean} - PILKB`;
    },
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.jsx`,
            import.meta.glob('./pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#2563eb',
        showSpinner: false,
    },
});
