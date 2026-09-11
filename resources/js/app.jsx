import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'PILKB';

createInertiaApp({
    title: (title) => {
        if (!title) return 'PILKB';
        let clean = title.replace(/\bLaravel\b/gi, '').replace(/\s*-\s*$/, '').replace(/^\s*-\s*/, '').trim();
        if (!clean) return 'PILKB';
        return clean.includes('PILKB') ? clean : `${clean} - PILKB`;
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
