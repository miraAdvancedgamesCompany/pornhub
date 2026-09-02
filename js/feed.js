// ==========================================
// Oops:) — Feed Page Logic (Clean & Minimal)
// ==========================================

import { getAllContent, shuffleArray, timeAgo, formatNumber, getRandomUser } from './firebase.js';

let feedUnsubscribe = null;
let feedVideos = [];

// Essential SVG Icons
export const ICONS = {
    heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
    heartFilled: `<svg viewBox="0 0 24 24" fill="#ed4956" stroke="#ed4956" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
    comment: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
    bookmark: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`,
    bookmarkFilled: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`,
    volumeOff: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`,
    volumeOn: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`,
    play: `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
    pause: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`,
};

const locations = [
    'Tokyo, Japan', 'Los Angeles, USA', 'Paris, France',
    'London, UK', 'New York City', 'Dubai, UAE',
    'Barcelona, Spain', 'Seoul, South Korea', 'Rome, Italy',
    'Sydney, Australia', 'Berlin, Germany', 'Toronto, Canada'
];

function getRandomLocation(seed) {
    const idx = seed ? Math.abs(hashSimple(seed)) % locations.length : Math.floor(Math.random() * locations.length);
    return locations[idx];
}

function hashSimple(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = ((h << 5) - h) + str.charCodeAt(i) | 0;
    return h;
}

function renderSkeletons(count = 2) {
    return Array(count).fill('').map(() => `
        <div class="feed-skeleton">
            <div class="feed-skeleton-header">
                <div class="skeleton skeleton-circle feed-skeleton-avatar"></div>
                <div class="skeleton skeleton-text feed-skeleton-name"></div>
            </div>
            <div class="skeleton feed-skeleton-media"></div>
            <div class="feed-skeleton-actions">
                <div class="skeleton feed-skeleton-action"></div>
                <div class="skeleton feed-skeleton-action"></div>
            </div>
            <div class="skeleton skeleton-text" style="width:80%"></div>
            <div class="skeleton skeleton-text short"></div>
        </div>
    `).join('');
}

function renderPost(item) {
    const user = getRandomUser(item.id);
    const isVideo = item.type === 'video';
    const location = getRandomLocation(item.id + 'loc');

    return `
        <article class="feed-post" data-id="${item.id}">
            <div class="post-header">
                <div class="avatar-ring">
                    <div class="avatar" style="background:${user.color}; width:36px; height:36px; font-size:13px; font-weight:700;">
                        ${user.username.charAt(0).toUpperCase()}
                    </div>
                </div>
                <div class="post-user-info">
                    <div class="post-username">${user.username}</div>
                    <div class="post-location">${location}</div>
                </div>
            </div>

            <div class="post-media" data-type="${item.type}" data-url="${item.url}">
                ${isVideo ? `
                    <video src="${item.url}" loop playsinline muted preload="metadata" autoplay></video>
                ` : `
                    <img src="${item.url}" alt="${item.title || ''}" loading="lazy">
                `}
                <div class="heart-burst"><svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></div>
                ${isVideo ? `
                    <div class="play-pause-indicator">${ICONS.play}</div>
                    <button class="mute-btn" data-muted="true" aria-label="Toggle Mute">${ICONS.volumeOff}</button>
                ` : ''}
            </div>

            <div class="post-actions">
                <div class="post-actions-left">
                    <button class="action-btn like-btn" data-liked="false" aria-label="Like">${ICONS.heart}</button>
                    <button class="action-btn comment-btn" aria-label="Comment">${ICONS.comment}</button>
                </div>
                <div class="post-actions-right">
                    <button class="action-btn save-btn" data-saved="false" aria-label="Save">${ICONS.bookmark}</button>
                </div>
            </div>

            <div class="post-likes">${formatNumber(item.likes || 0)} likes</div>

            ${item.title || item.description ? `
                <div class="post-caption">
                    <span class="caption-username">${user.username}</span>
                    <span class="caption-text">${item.description || item.title || ''}</span>
                </div>
            ` : ''}

            <div class="post-comments-link">View all ${item.comments || 42} comments</div>
            <div class="post-timestamp">${timeAgo(item.timestamp)}</div>
        </article>
    `;
}

function attachPostEvents(container) {
    // Like button
    container.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const liked = btn.dataset.liked === 'true';
            btn.dataset.liked = (!liked).toString();
            btn.innerHTML = liked ? ICONS.heart : ICONS.heartFilled;
            btn.classList.toggle('liked', !liked);

            const post = btn.closest('.feed-post');
            const likesEl = post.querySelector('.post-likes');
            const currentNum = parseInt((likesEl.textContent || '0').replace(/[^0-9]/g, '')) || 0;
            likesEl.textContent = `${formatNumber(liked ? Math.max(0, currentNum - 1) : currentNum + 1)} likes`;
        });
    });

    // Save button
    container.querySelectorAll('.save-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const saved = btn.dataset.saved === 'true';
            btn.dataset.saved = (!saved).toString();
            btn.innerHTML = saved ? ICONS.bookmark : ICONS.bookmarkFilled;
            btn.classList.toggle('saved', !saved);
        });
    });

    // Double-tap on media for Heart Explosion
    container.querySelectorAll('.post-media').forEach(media => {
        let lastTap = 0;
        media.addEventListener('click', (e) => {
            if (e.target.closest('.mute-btn')) return;

            const now = Date.now();
            if (now - lastTap < 300) {
                // Double tap like
                const heartBurst = media.querySelector('.heart-burst');
                if (heartBurst) {
                    heartBurst.classList.remove('active');
                    void heartBurst.offsetWidth;
                    heartBurst.classList.add('active');
                    setTimeout(() => heartBurst.classList.remove('active'), 900);
                }

                const post = media.closest('.feed-post');
                const likeBtn = post?.querySelector('.like-btn');
                if (likeBtn && likeBtn.dataset.liked !== 'true') {
                    likeBtn.click();
                }
            } else {
                // Single tap play/pause video
                const video = media.querySelector('video');
                if (video) {
                    const indicator = media.querySelector('.play-pause-indicator');
                    if (video.paused) {
                        video.play().catch(() => {});
                        if (indicator) indicator.innerHTML = ICONS.pause;
                    } else {
                        video.pause();
                        if (indicator) indicator.innerHTML = ICONS.play;
                    }
                    if (indicator) {
                        indicator.classList.remove('show');
                        void indicator.offsetWidth;
                        indicator.classList.add('show');
                    }
                }
            }
            lastTap = now;
        });
    });

    // Mute/Unmute buttons
    container.querySelectorAll('.mute-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const video = btn.closest('.post-media')?.querySelector('video');
            if (video) {
                video.muted = !video.muted;
                btn.innerHTML = video.muted ? ICONS.volumeOff : ICONS.volumeOn;
                btn.dataset.muted = video.muted.toString();
            }
        });
    });

    // Auto-play videos when visible in viewport
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target.querySelector('video');
            if (!video) return;
            if (entry.isIntersecting) {
                video.play().catch(() => {});
            } else {
                video.pause();
            }
        });
    }, { threshold: 0.5 });

    container.querySelectorAll('.post-media').forEach(media => {
        if (media.querySelector('video')) {
            observer.observe(media);
        }
    });
}

export function initFeed() {
    const container = document.getElementById('feedView');
    if (!container) return;

    container.innerHTML = `<div class="feed-container" id="feedContainer">${renderSkeletons()}</div>`;

    feedUnsubscribe = getAllContent((items) => {
        const feedContainer = document.getElementById('feedContainer');
        if (!feedContainer) return;

        const shuffled = shuffleArray(items);
        feedVideos = shuffled;

        feedContainer.innerHTML = shuffled.map(item => renderPost(item)).join('');
        attachPostEvents(feedContainer);
    });
}

export function destroyFeed() {
    if (feedUnsubscribe) {
        feedUnsubscribe();
        feedUnsubscribe = null;
    }
    // Pause all feed videos
    document.querySelectorAll('#feedView video').forEach(v => {
        try {
            v.pause();
        } catch (e) {}
    });
}
