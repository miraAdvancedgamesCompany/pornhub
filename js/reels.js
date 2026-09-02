// ==========================================
// Oops:) — Reels Full-Screen Viewer Logic
// ==========================================

import { getAllContent, shuffleArray, formatNumber, getRandomUser } from './firebase.js';

let reelsUnsubscribe = null;
let reelsObserver = null;
let currentReelIndex = 0;

export const REEL_ICONS = {
    heart: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
    heartFilled: `<svg viewBox="0 0 24 24" fill="#ed4956" stroke="#ed4956" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
    comment: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
    music: `<svg viewBox="0 0 24 24" fill="white"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
    play: `<svg viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
    pause: `<svg viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`,
    volumeOff: `<svg viewBox="0 0 24 24" fill="white"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`,
    volumeOn: `<svg viewBox="0 0 24 24" fill="white"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`
};

const musicTracks = [
    'Original Audio — Oops:) Viral Sounds',
    'Tokyo Night Drive — Lo-Fi Chill',
    'Golden Hour Glow — Summer Beats',
    'Deep Forest Resonance — Nature Synth',
    'Bass Drop Energy — Club Mix 2026',
    'Acoustic Strings — Live Sessions'
];

function getRandomMusic(seed) {
    const idx = seed ? Math.abs(hash(seed)) % musicTracks.length : Math.floor(Math.random() * musicTracks.length);
    return musicTracks[idx];
}

function hash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = ((h << 5) - h) + str.charCodeAt(i) | 0;
    return h;
}

function renderReel(item, index) {
    const user = getRandomUser(item.id);
    const isVideo = item.type === 'video';
    const music = getRandomMusic(item.id + 'music');

    return `
        <div class="reel-item" data-index="${index}" data-id="${item.id}">
            <div class="reel-video-wrapper">
                ${isVideo ? `
                    <video src="${item.url}" loop playsinline muted preload="auto" autoplay></video>
                ` : `
                    <img src="${item.url}" alt="${item.title || ''}">
                `}
            </div>

            <div class="reel-tap-area"></div>
            <div class="reel-play-icon">${REEL_ICONS.play}</div>

            <div class="reel-progress">
                <div class="reel-progress-bar"></div>
            </div>

            <div class="reel-gradient"></div>

            <div class="reel-info">
                <div class="reel-user">
                    <div class="avatar" style="background:${user.color}; width:34px; height:34px; font-size:12px; font-weight:700; border:2px solid white;">
                        ${user.username.charAt(0).toUpperCase()}
                    </div>
                    <span class="reel-username">${user.username}</span>
                    <button class="reel-follow-btn">Follow</button>
                </div>
                ${item.description || item.title ? `
                    <div class="reel-description">${item.description || item.title}</div>
                ` : ''}
                <div class="reel-music">
                    ${REEL_ICONS.music}
                    <div class="reel-music-text">
                        <span class="reel-music-marquee">${music} &nbsp;&nbsp;&nbsp; ${music}</span>
                    </div>
                </div>
            </div>

            <div class="reel-actions">
                <div class="reel-action-item reel-sound-toggle" data-muted="true" title="Toggle Sound">
                    <div class="reel-action-icon sound-icon">${REEL_ICONS.volumeOff}</div>
                    <span class="reel-action-count">Sound</span>
                </div>
                <div class="reel-action-item reel-like-action" data-liked="false" title="Like Reel">
                    <div class="reel-action-icon">${REEL_ICONS.heart}</div>
                    <span class="reel-action-count">${formatNumber(item.likes || 0)}</span>
                </div>
                <div class="reel-action-item" title="Comments">
                    <div class="reel-action-icon">${REEL_ICONS.comment}</div>
                    <span class="reel-action-count">${formatNumber(item.comments || 0)}</span>
                </div>
                <div class="reel-music-disc" title="Original Audio">
                    <div class="reel-music-disc-inner"></div>
                </div>
            </div>

            <div class="heart-burst" style="z-index:15;"><svg viewBox="0 0 24 24" fill="#ed4956"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></div>
        </div>
    `;
}

function attachReelEvents(container) {
    // Like button
    container.querySelectorAll('.reel-like-action').forEach(action => {
        action.addEventListener('click', (e) => {
            e.stopPropagation();
            const liked = action.dataset.liked === 'true';
            action.dataset.liked = (!liked).toString();
            action.querySelector('.reel-action-icon').innerHTML = liked ? REEL_ICONS.heart : REEL_ICONS.heartFilled;
            action.classList.toggle('liked', !liked);

            const countEl = action.querySelector('.reel-action-count');
            const current = parseInt(countEl.textContent.replace(/[^0-9]/g, '')) || 0;
            countEl.textContent = formatNumber(liked ? Math.max(0, current - 1) : current + 1);
        });
    });

    // Sound toggle
    container.querySelectorAll('.reel-sound-toggle').forEach(soundBtn => {
        soundBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const reelItem = soundBtn.closest('.reel-item');
            const video = reelItem?.querySelector('video');
            if (video) {
                video.muted = !video.muted;
                const iconEl = soundBtn.querySelector('.sound-icon');
                if (iconEl) {
                    iconEl.innerHTML = video.muted ? REEL_ICONS.volumeOff : REEL_ICONS.volumeOn;
                }
                soundBtn.dataset.muted = video.muted.toString();
            }
        });
    });

    // Follow button
    container.querySelectorAll('.reel-follow-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (btn.textContent === 'Follow') {
                btn.textContent = 'Following';
                btn.style.background = 'rgba(255,255,255,0.2)';
            } else {
                btn.textContent = 'Follow';
                btn.style.background = 'none';
            }
        });
    });

    // Tap to play/pause + double tap to like
    container.querySelectorAll('.reel-tap-area').forEach(tapArea => {
        let lastTap = 0;
        let singleTapTimer = null;

        tapArea.addEventListener('click', () => {
            const now = Date.now();
            const reelItem = tapArea.closest('.reel-item');

            if (now - lastTap < 300) {
                // Double tap like
                clearTimeout(singleTapTimer);
                const heartBurst = reelItem.querySelector('.heart-burst');
                if (heartBurst) {
                    heartBurst.classList.remove('active');
                    void heartBurst.offsetWidth;
                    heartBurst.classList.add('active');
                    setTimeout(() => heartBurst.classList.remove('active'), 900);
                }

                const likeAction = reelItem.querySelector('.reel-like-action');
                if (likeAction && likeAction.dataset.liked === 'false') {
                    likeAction.click();
                }
            } else {
                // Single tap play/pause
                singleTapTimer = setTimeout(() => {
                    const video = reelItem.querySelector('video');
                    if (video) {
                        const playIcon = reelItem.querySelector('.reel-play-icon');
                        if (video.paused) {
                            video.play().catch(() => {});
                            if (playIcon) playIcon.innerHTML = REEL_ICONS.pause;
                        } else {
                            video.pause();
                            if (playIcon) playIcon.innerHTML = REEL_ICONS.play;
                        }
                        if (playIcon) {
                            playIcon.classList.remove('show');
                            void playIcon.offsetWidth;
                            playIcon.classList.add('show');
                        }
                    }
                }, 220);
            }
            lastTap = now;
        });
    });

    // Video progress bar
    container.querySelectorAll('.reel-item video').forEach(video => {
        video.addEventListener('timeupdate', () => {
            const reelItem = video.closest('.reel-item');
            const progressBar = reelItem?.querySelector('.reel-progress-bar');
            if (progressBar && video.duration) {
                const percent = (video.currentTime / video.duration) * 100;
                progressBar.style.width = percent + '%';
            }
        });
    });

    // IntersectionObserver for auto-play active reel
    reelsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target.querySelector('video');
            const disc = entry.target.querySelector('.reel-music-disc');

            if (entry.isIntersecting) {
                if (video) {
                    video.play().catch(() => {});
                }
                if (disc) disc.style.animationPlayState = 'running';
                currentReelIndex = parseInt(entry.target.dataset.index || '0');
            } else {
                if (video) video.pause();
                if (disc) disc.style.animationPlayState = 'paused';
            }
        });
    }, { threshold: 0.6 });

    container.querySelectorAll('.reel-item').forEach(item => {
        reelsObserver.observe(item);
    });
}

export function initReels() {
    const container = document.getElementById('reelsView');
    if (!container) return;

    container.innerHTML = `
        <div class="reels-container" id="reelsScroll">
            <div class="reels-loading">
                <div class="loading-spinner"></div>
            </div>
        </div>
    `;

    document.querySelector('.app-header')?.classList.add('hidden');
    document.querySelector('.main-content')?.classList.add('reels-mode');
    document.querySelector('.bottom-nav')?.classList.add('transparent');

    reelsUnsubscribe = getAllContent((items) => {
        const scrollContainer = document.getElementById('reelsScroll');
        if (!scrollContainer) return;

        const videoItems = items.filter(i => i.type === 'video');
        const displayItems = videoItems.length > 0 ? videoItems : items;

        const shuffled = shuffleArray(displayItems);
        scrollContainer.innerHTML = shuffled.map((item, i) => renderReel(item, i)).join('');
        attachReelEvents(scrollContainer);
    });
}

export function destroyReels() {
    if (reelsUnsubscribe) {
        reelsUnsubscribe();
        reelsUnsubscribe = null;
    }
    if (reelsObserver) {
        reelsObserver.disconnect();
        reelsObserver = null;
    }

    document.querySelectorAll('#reelsView video').forEach(v => {
        try {
            v.pause();
        } catch (e) {}
    });

    document.querySelector('.app-header')?.classList.remove('hidden');
    document.querySelector('.main-content')?.classList.remove('reels-mode');
    document.querySelector('.bottom-nav')?.classList.remove('transparent');
}
