// ==========================================
// Oops:) — Explore / Grid Page Logic
// ==========================================

import { getAllContent, shuffleArray, formatNumber, getRandomUser } from './firebase.js';

let exploreUnsubscribe = null;
let allItems = [];
let filteredItems = [];
let activeFilter = 'all';

export const EXPLORE_ICONS = {
    search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
    play: `<svg viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
    heart: `<svg viewBox="0 0 24 24" fill="white"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
    comment: `<svg viewBox="0 0 24 24" fill="white"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
    close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
};

function renderSearchBar() {
    return `
        <div class="explore-search">
            <div class="search-input-wrapper">
                ${EXPLORE_ICONS.search}
                <input type="text" class="search-input" id="exploreSearchInput" placeholder="Search videos, creators, vibes...">
            </div>
        </div>
        <div class="explore-filters" id="exploreFilters">
            <button class="filter-chip active" data-filter="all">All</button>
            <button class="filter-chip" data-filter="video">🎬 Videos</button>
            <button class="filter-chip" data-filter="image">🖼️ Photos</button>
            <button class="filter-chip" data-filter="trending">🔥 Trending</button>
            <button class="filter-chip" data-filter="recent">🕐 Recent</button>
        </div>
    `;
}

function renderGridItem(item, index) {
    const isVideo = item.type === 'video';
    const isLarge = (index % 10 === 0) || (index % 10 === 5);

    return `
        <div class="explore-grid-item ${isLarge ? 'large' : ''}" data-id="${item.id}" data-type="${item.type}" data-url="${item.url}">
            ${isVideo ? `
                <video src="${item.url}" muted loop playsinline preload="metadata"></video>
            ` : `
                <img src="${item.url}" alt="${item.title || ''}" loading="lazy">
            `}
            ${isVideo ? `
                <div class="grid-item-indicator">${EXPLORE_ICONS.play}</div>
            ` : ''}
            <div class="grid-item-overlay">
                <div class="grid-item-stat">
                    ${EXPLORE_ICONS.heart}
                    ${formatNumber(item.likes || 0)}
                </div>
                <div class="grid-item-stat">
                    ${EXPLORE_ICONS.comment}
                    ${formatNumber(item.comments || 0)}
                </div>
            </div>
        </div>
    `;
}

function renderSkeletonGrid() {
    return Array(9).fill('').map((_, i) => {
        const isLarge = i === 0 || i === 5;
        return `<div class="explore-grid-item ${isLarge ? 'large' : ''} skeleton explore-skeleton-item"></div>`;
    }).join('');
}

function renderGrid(items) {
    const grid = document.getElementById('exploreGrid');
    if (!grid) return;

    if (items.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; padding: 40px 16px; text-align: center;">
                <div class="empty-state">
                    <div class="empty-state-icon">
                        ${EXPLORE_ICONS.search}
                    </div>
                    <h3>No Matches Found</h3>
                    <p>Try searching for different keywords or select "All".</p>
                </div>
            </div>
        `;
        return;
    }

    grid.innerHTML = items.map((item, i) => renderGridItem(item, i)).join('');
    attachGridEvents(grid);
}

function attachGridEvents(grid) {
    grid.querySelectorAll('.explore-grid-item').forEach(item => {
        // Open modal
        item.addEventListener('click', () => {
            openMediaModal(item.dataset);
        });

        // Hover video auto-play
        const video = item.querySelector('video');
        if (video) {
            item.addEventListener('mouseenter', () => {
                video.play().catch(() => {});
            });
            item.addEventListener('mouseleave', () => {
                video.pause();
                video.currentTime = 0;
            });
        }
    });
}

function openMediaModal(data) {
    const existing = document.querySelector('.video-modal-overlay');
    if (existing) existing.remove();

    const isVideo = data.type === 'video';
    const item = allItems.find(i => i.id === data.id);
    const user = item ? getRandomUser(item.id) : getRandomUser(data.id);

    const modal = document.createElement('div');
    modal.className = 'video-modal-overlay';
    modal.innerHTML = `
        <div class="video-modal" style="background:#121212; border-radius:16px; overflow:hidden; border:1px solid #333; max-width:480px; width:92%;">
            <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border-bottom:1px solid #262626;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <div class="avatar" style="background:${user.color}; width:30px; height:30px; font-size:11px; font-weight:700;">
                        ${user.username.charAt(0).toUpperCase()}
                    </div>
                    <span style="font-weight:600; font-size:14px;">${user.username}</span>
                </div>
                <button class="video-modal-close" style="width:30px; height:30px; border-radius:50%; background:#262626; display:flex; align-items:center; justify-content:center; cursor:pointer;">
                    ${EXPLORE_ICONS.close}
                </button>
            </div>
            
            <div style="background:#000; display:flex; align-items:center; justify-content:center; min-height:300px; max-height:65vh;">
                ${isVideo ? `
                    <video src="${data.url}" autoplay loop controls playsinline style="width:100%; max-height:65vh; object-fit:contain;"></video>
                ` : `
                    <img src="${data.url}" alt="" style="width:100%; max-height:65vh; object-fit:contain;">
                `}
            </div>

            ${item ? `
                <div style="padding:14px 16px; background:#121212;">
                    <div style="font-size:14px; font-weight:600; margin-bottom:4px;">${item.title || ''}</div>
                    <div style="color:var(--text-secondary); font-size:13px; margin-bottom:8px;">${item.description || ''}</div>
                    <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-muted);">
                        <span>❤️ ${formatNumber(item.likes || 0)} likes</span>
                        <span>💬 ${formatNumber(item.comments || 0)} comments</span>
                        <span>👁️ ${formatNumber(item.views || 0)} views</span>
                    </div>
                </div>
            ` : ''}
        </div>
    `;

    modal.querySelector('.video-modal-close').addEventListener('click', () => {
        const video = modal.querySelector('video');
        if (video) video.pause();
        modal.remove();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            const video = modal.querySelector('video');
            if (video) video.pause();
            modal.remove();
        }
    });

    document.body.appendChild(modal);
}

function applyFilter(filter) {
    activeFilter = filter;

    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.filter === filter);
    });

    let result = [...allItems];

    switch (filter) {
        case 'video':
            result = result.filter(i => i.type === 'video');
            break;
        case 'image':
            result = result.filter(i => i.type === 'image');
            break;
        case 'trending':
            result = result.sort((a, b) => (b.likes || 0) - (a.likes || 0));
            break;
        case 'recent':
            result = result.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
            break;
        default:
            result = shuffleArray(result);
    }

    filteredItems = result;
    renderGrid(result);
}

export function initExplore() {
    const container = document.getElementById('exploreView');
    if (!container) return;

    container.innerHTML = renderSearchBar() + `<div class="explore-grid" id="exploreGrid">${renderSkeletonGrid()}</div>`;

    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            applyFilter(chip.dataset.filter);
        });
    });

    const searchInput = document.getElementById('exploreSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = (e.target.value || '').toLowerCase().trim();
            if (!query) {
                renderGrid(filteredItems.length ? filteredItems : allItems);
                return;
            }
            const results = allItems.filter(item =>
                (item.title || '').toLowerCase().includes(query) ||
                (item.description || '').toLowerCase().includes(query)
            );
            renderGrid(results);
        });
    }

    exploreUnsubscribe = getAllContent((items) => {
        allItems = items;
        const shuffled = shuffleArray(items);
        filteredItems = shuffled;
        renderGrid(shuffled);
    });
}

export function destroyExplore() {
    if (exploreUnsubscribe) {
        exploreUnsubscribe();
        exploreUnsubscribe = null;
    }
    document.querySelectorAll('.video-modal-overlay').forEach(m => m.remove());
}
