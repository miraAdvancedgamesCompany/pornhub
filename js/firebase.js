// ==========================================
// Oops:) — Firebase Configuration & Helpers
// ==========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getDatabase, ref, push, set, onValue, remove, update } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAxSCsufdqcZyBiBQeFVw4JYObeQAl7zsw",
    authDomain: "its116so.firebaseapp.com",
    databaseURL: "https://its116so-default-rtdb.firebaseio.com",
    projectId: "its116so",
    storageBucket: "its116so.firebasestorage.app",
    messagingSenderId: "420035063931",
    appId: "1:420035063931:web:9dced5c8c5429ef45172de",
    measurementId: "G-JH9FBWWKXZ"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ---- Default Built-in Seed Data (for instant viewing & fallback) ----
export const DEFAULT_CONTENT = [
    {
        id: 'seed_01',
        type: 'video',
        title: 'Neon City Lights & Night Vibes ✨',
        description: 'Late night drives through Tokyo streets. The neon reflections in the rain are magical #nightvibes #tokyo #cinematic',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-video-of-a-neon-sign-on-a-building-42537-large.mp4',
        likes: 14200,
        views: 85000,
        comments: 384,
        timestamp: Date.now() - 1000 * 60 * 30
    },
    {
        id: 'seed_02',
        type: 'video',
        title: 'Sunset Skatepark Session 🛹',
        description: 'Golden hour lines at Venice Beach. Never stop rolling 🌅 #skate #goldenhour #reels #sunset',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-video-of-a-skatepark-at-sunset-42516-large.mp4',
        likes: 9820,
        views: 52400,
        comments: 215,
        timestamp: Date.now() - 1000 * 60 * 90
    },
    {
        id: 'seed_03',
        type: 'video',
        title: 'DJ Club Energy 🔥',
        description: 'Weekend festival vibes! The drop was unreal 🎧🔊 #dj #edm #club #party #music',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-view-of-a-dj-playing-music-in-a-club-42544-large.mp4',
        likes: 23400,
        views: 142000,
        comments: 612,
        timestamp: Date.now() - 1000 * 60 * 180
    },
    {
        id: 'seed_04',
        type: 'video',
        title: 'Dancing in the Golden Wildflower Field 🌾',
        description: 'Pure joy and freedom. Nature heals everything 💛 #dance #nature #freedom #aesthetic',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-video-of-a-woman-dancing-in-a-field-42526-large.mp4',
        likes: 18750,
        views: 98000,
        comments: 430,
        timestamp: Date.now() - 1000 * 60 * 300
    },
    {
        id: 'seed_05',
        type: 'video',
        title: 'Hidden Forest Waterfall 🌿🌊',
        description: 'Found this secret paradise deep in the rainforest #waterfall #travel #naturelovers #explore',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-video-of-a-waterfall-in-a-lush-forest-42512-large.mp4',
        likes: 31200,
        views: 180000,
        comments: 780,
        timestamp: Date.now() - 1000 * 60 * 450
    },
    {
        id: 'seed_06',
        type: 'video',
        title: 'City Highway Speed Light Trails 🚗💨',
        description: 'Long exposure speed lapse over the metropolitan bridge #cyberpunk #timelapse #citylights',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-video-of-a-city-at-night-with-light-trails-42539-large.mp4',
        likes: 12500,
        views: 67000,
        comments: 198,
        timestamp: Date.now() - 1000 * 60 * 600
    },
    {
        id: 'seed_07',
        type: 'video',
        title: 'Ocean Waves Crashing in 4K 🌊',
        description: 'Listen to the rhythm of the waves. Instant peace of mind #ocean #relax #meditation #waves',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4',
        likes: 27800,
        views: 156000,
        comments: 540,
        timestamp: Date.now() - 1000 * 60 * 800
    },
    {
        id: 'seed_08',
        type: 'video',
        title: 'Breeze Through the Cherry Blossoms 🌸',
        description: 'Spring in Kyoto is a dream come true #sakura #spring #japan #calm',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-tree-branches-in-the-breeze-1188-large.mp4',
        likes: 15600,
        views: 89000,
        comments: 312,
        timestamp: Date.now() - 1000 * 60 * 1200
    },
    {
        id: 'seed_09',
        type: 'image',
        title: 'Cozy Coffee & Minimalist Aesthetics ☕',
        description: 'Morning rituals. Slow down and enjoy the simple moments #coffee #aesthetic #morning #minimal',
        url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1000&q=80',
        likes: 8420,
        views: 41000,
        comments: 120,
        timestamp: Date.now() - 1000 * 60 * 1500
    },
    {
        id: 'seed_10',
        type: 'image',
        title: 'Moody Mountain Fog Peak 🏔️',
        description: 'Above the clouds in the Swiss Alps. Silence is golden #mountains #wanderlust #hiking',
        url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80',
        likes: 19300,
        views: 112000,
        comments: 450,
        timestamp: Date.now() - 1000 * 60 * 2000
    },
    {
        id: 'seed_11',
        type: 'image',
        title: 'Cyberpunk Neon Alleyways 🏮',
        description: 'Lost in the glowing backstreets of Shinjuku #tokyo #cyberpunk #streetphotography',
        url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80',
        likes: 22100,
        views: 134000,
        comments: 510,
        timestamp: Date.now() - 1000 * 60 * 2500
    }
];

// ---- Content CRUD ----

export function addContent(contentData) {
    const contentRef = ref(db, 'content');
    const newRef = push(contentRef);
    return set(newRef, {
        ...contentData,
        timestamp: Date.now(),
        likes: Math.floor(Math.random() * 9000) + 1000,
        views: Math.floor(Math.random() * 45000) + 5000,
        comments: Math.floor(Math.random() * 450) + 50
    });
}

export function seedAllDefaultData() {
    const promises = DEFAULT_CONTENT.map(item => {
        const contentRef = ref(db, 'content');
        const newRef = push(contentRef);
        return set(newRef, {
            type: item.type,
            title: item.title,
            description: item.description,
            url: item.url,
            likes: item.likes,
            views: item.views,
            comments: item.comments,
            timestamp: item.timestamp
        });
    });
    return Promise.all(promises);
}

export function getAllContent(callback) {
    const contentRef = ref(db, 'content');
    return onValue(contentRef, (snapshot) => {
        const data = snapshot.val();
        if (data && Object.keys(data).length > 0) {
            const items = Object.entries(data).map(([id, val]) => ({ id, ...val }));
            callback(items);
        } else {
            // If Firebase is empty, provide instant default items so the app is immediately alive
            callback(DEFAULT_CONTENT);
        }
    }, (error) => {
        console.warn('Firebase error/permission note, using fallback content:', error);
        callback(DEFAULT_CONTENT);
    });
}

export function deleteContent(id) {
    return remove(ref(db, `content/${id}`));
}

export function updateContent(id, data) {
    return update(ref(db, `content/${id}`), data);
}

// ---- Utility Helpers ----

export function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export function timeAgo(timestamp) {
    if (!timestamp) return 'Just now';
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
}

export function formatNumber(num) {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace('.0', '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace('.0', '') + 'K';
    return num.toString();
}

// ---- Fake User Data ----

export const fakeUsers = [
    { username: 'creative.lens', color: '#833ab4' },
    { username: 'pixel_perfect', color: '#e1306c' },
    { username: 'visual.stories', color: '#f56040' },
    { username: 'dream.catcher', color: '#fcaf45' },
    { username: 'urban.explorer', color: '#0095f6' },
    { username: 'art.daily', color: '#5b51d8' },
    { username: 'mood.board', color: '#c13584' },
    { username: 'vibe.check', color: '#fd1d1d' },
    { username: 'cinema.club', color: '#405de6' },
    { username: 'sunset.vibes', color: '#e95950' },
    { username: 'wonder.world', color: '#7c3aed' },
    { username: 'neon.nights', color: '#06b6d4' },
    { username: 'golden.hour', color: '#f59e0b' },
    { username: 'deep.focus', color: '#10b981' },
    { username: 'wild.spirit', color: '#ef4444' },
];

export function getRandomUser(seed) {
    const index = seed ? Math.abs(hashCode(String(seed))) % fakeUsers.length : Math.floor(Math.random() * fakeUsers.length);
    return fakeUsers[index];
}

function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return hash;
}

// ---- Story Categories ----

export const storyCategories = [
    { name: 'Trending', emoji: '🔥' },
    { name: 'Music', emoji: '🎵' },
    { name: 'Comedy', emoji: '😂' },
    { name: 'Sports', emoji: '⚽' },
    { name: 'Gaming', emoji: '🎮' },
    { name: 'Food', emoji: '🍕' },
    { name: 'Travel', emoji: '✈️' },
    { name: 'Fashion', emoji: '👗' },
    { name: 'Art', emoji: '🎨' },
    { name: 'Tech', emoji: '💻' },
    { name: 'Nature', emoji: '🌿' },
    { name: 'Fitness', emoji: '💪' },
];
