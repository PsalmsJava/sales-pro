import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

// Register service worker for PWA
serviceWorkerRegistration.register({
    onUpdate: (registration) => {
        // Notify user about update
        if (window.confirm('A new version is available. Refresh to update?')) {
            if (registration.waiting) {
                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
            window.location.reload();
        }
    },
    onSuccess: () => {
        console.log('[PWA] App ready for offline use');
    }
});