// ==========================================
// Oops:) — Main App Router & Navigation
// ==========================================

import { initFeed, destroyFeed } from './feed.js';
import { initReels, destroyReels } from './reels.js';
import { initExplore, destroyExplore } from './explore.js';

// SVG Icons for 3 navigation tabs
export const NAV_ICONS = {
    home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    homeFilled: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`,
    explore: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
    exploreFilled: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65" stroke-width="3"/></svg>`,
    reels: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M2 8h20"/><path d="M8 2l2 6"/><path d="M14 2l2 6"/><polygon points="10 12 16 15.5 10 19 10 12" fill="currentColor" stroke="none"/></svg>`,
    reelsFilled: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="currentColor"/><path d="M2 8h20" stroke="black" stroke-width="2"/><path d="M8 2l2 6" stroke="black" stroke-width="2"/><path d="M14 2l2 6" stroke="black" stroke-width="2"/><polygon points="10 12 16 15.5 10 19 10 12" fill="black" stroke="none"/></svg>`,
};

let currentPage = null;

const destroyFunctions = {
    feed: destroyFeed,
    explore: destroyExplore,
    reels: destroyReels,
};

const initFunctions = {
    feed: initFeed,
    explore: initExplore,
    reels: initReels,
};

export function navigateTo(page) {
    if (page === currentPage) return;

    // Clean up previous page
    if (currentPage && destroyFunctions[currentPage]) {
        try {
            destroyFunctions[currentPage]();
        } catch (e) {
            console.error('Error destroying page:', e);
        }
    }

    // Hide all views
    document.querySelectorAll('.page-view').forEach(view => {
        view.classList.remove('active');
    });

    // Update bottom nav active state & icons
    document.querySelectorAll('.nav-item').forEach(item => {
        const navPage = item.dataset.page;
        if (!navPage) return;
        const iconSpan = item.querySelector('.nav-icon-slot');

        if (navPage === page) {
            item.classList.add('active');
            if (iconSpan) {
                if (page === 'feed') iconSpan.innerHTML = NAV_ICONS.homeFilled;
                if (page === 'explore') iconSpan.innerHTML = NAV_ICONS.exploreFilled;
                if (page === 'reels') iconSpan.innerHTML = NAV_ICONS.reelsFilled;
            }
        } else {
            item.classList.remove('active');
            if (iconSpan) {
                if (navPage === 'feed') iconSpan.innerHTML = NAV_ICONS.home;
                if (navPage === 'explore') iconSpan.innerHTML = NAV_ICONS.explore;
                if (navPage === 'reels') iconSpan.innerHTML = NAV_ICONS.reels;
            }
        }
    });

    // Show target view
    const targetView = document.getElementById(`${page}View`);
    if (targetView) {
        targetView.classList.add('active');
    }

    currentPage = page;

    // Initialize new view
    if (initFunctions[page]) {
        try {
            initFunctions[page]();
        } catch (e) {
            console.error('Error initializing page:', e);
        }
    }

    // Update URL hash without extra history entries
    if (window.location.hash !== `#${page}`) {
        window.history.replaceState(null, '', `#${page}`);
    }
}

export function showToast(message) {
    let toast = document.getElementById('appToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'appToast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2200);
}

function initApp() {
    // Attach bottom nav click handlers
    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            if (page) navigateTo(page);
        });
    });

    // Logo click — always goes to feed top
    const logo = document.getElementById('headerLogo') || document.querySelector('.app-logo');
    if (logo) {
        logo.addEventListener('click', () => {
            navigateTo('feed');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Determine initial page from hash or default to feed
    const hash = (window.location.hash || '').replace('#', '').trim();
    const validPages = ['feed', 'explore', 'reels'];
    const initialPage = validPages.includes(hash) ? hash : 'feed';

    navigateTo(initialPage);

    // Support browser Back/Forward
    window.addEventListener('hashchange', () => {
        const newHash = window.location.hash.replace('#', '').trim();
        if (validPages.includes(newHash) && newHash !== currentPage) {
            navigateTo(newHash);
        }
    });

    document.querySelector('.app-container')?.classList.add('loaded');
}

// Reliable bootloader
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
