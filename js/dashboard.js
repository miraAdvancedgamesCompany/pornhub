// ==========================================
// Oops:) Studio — Dashboard Logic
// Full CRUD, Realtime Sync, Live Preview
// ==========================================

import { addContent, getAllContent, deleteContent, timeAgo, formatNumber, seedAllDefaultData } from './firebase.js';

let libraryItems = [];
let activeFilter = 'all';
let searchQuery = '';

function initDashboard() {
    setupUploadForm();
    setupLibraryToolbar();
    setupSeedButton();
    listenToFirebaseContent();
}

// ---- 1. Upload Form & Live Preview ----
function setupUploadForm() {
    const form = document.getElementById('uploadForm');
    const urlInput = document.getElementById('contentUrl');
    const typeSelect = document.getElementById('contentType');
    const titleInput = document.getElementById('contentTitle');
    const descInput = document.getElementById('contentDesc');
    const clearUrlBtn = document.getElementById('clearUrlBtn');
    const previewBox = document.getElementById('urlPreviewBox');
    const previewMediaContainer = document.getElementById('previewMediaContainer');
    const previewBadge = document.getElementById('previewTypeBadge');
    const submitBtn = document.getElementById('submitBtn');
    const statusMsg = document.getElementById('uploadStatusMsg');

    if (!form || !urlInput) return;

    let previewTimer = null;

    // Clear URL button
    if (clearUrlBtn) {
        clearUrlBtn.addEventListener('click', () => {
            urlInput.value = '';
            clearUrlBtn.classList.remove('show');
            previewBox.classList.remove('active');
            previewMediaContainer.innerHTML = '';
            urlInput.focus();
        });
    }

    // Auto preview on paste or type
    urlInput.addEventListener('input', () => {
        const url = urlInput.value.trim();
        if (clearUrlBtn) clearUrlBtn.classList.toggle('show', url.length > 0);

        clearTimeout(previewTimer);
        if (!url) {
            previewBox.classList.remove('active');
            previewMediaContainer.innerHTML = '';
            return;
        }

        previewTimer = setTimeout(() => {
            // Auto detect type if obvious
            const lower = url.toLowerCase();
            if (lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov') || lower.includes('video')) {
                typeSelect.value = 'video';
            } else if (lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.webp') || lower.includes('photo')) {
                typeSelect.value = 'image';
            }

            renderLivePreview(url, typeSelect.value);
        }, 300);
    });

    typeSelect.addEventListener('change', () => {
        const url = urlInput.value.trim();
        if (url) renderLivePreview(url, typeSelect.value);
    });

    function renderLivePreview(url, type) {
        previewBox.classList.add('active');
        previewBadge.textContent = type;

        if (type === 'video') {
            previewMediaContainer.innerHTML = `
                <video src="${url}" controls autoplay muted playsinline style="width:100%;max-height:300px;object-fit:contain;background:#000;" onerror="window.handlePreviewError(this)"></video>
            `;
        } else {
            previewMediaContainer.innerHTML = `
                <img src="${url}" alt="Preview" style="width:100%;max-height:300px;object-fit:contain;background:#000;" onerror="window.handlePreviewError(this)">
            `;
        }
    }

    window.handlePreviewError = function(el) {
        previewMediaContainer.innerHTML = `
            <div class="preview-error">
                ⚠️ Unable to load media from this URL. Please verify that it is a direct public link.
            </div>
        `;
    };

    // Form Submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const url = urlInput.value.trim();
        const type = typeSelect.value;
        const title = titleInput.value.trim();
        const description = descInput.value.trim();

        if (!url) {
            showToast('⚠️ Please enter a valid URL.');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>⏳ Saving to Firebase...</span>';
        statusMsg.className = 'upload-status-msg';
        statusMsg.style.display = 'none';

        try {
            await addContent({
                url,
                type,
                title: title || 'Untitled Media',
                description: description || ''
            });

            // Reset form
            form.reset();
            if (clearUrlBtn) clearUrlBtn.classList.remove('show');
            previewBox.classList.remove('active');
            previewMediaContainer.innerHTML = '';

            statusMsg.textContent = '✅ Published successfully to Realtime Database!';
            statusMsg.className = 'upload-status-msg success';
            showToast('🎉 Content added to Firebase!');

            setTimeout(() => {
                statusMsg.style.display = 'none';
            }, 4000);
        } catch (err) {
            console.error('Firebase save error:', err);
            statusMsg.textContent = '❌ Failed to save. Check your Firebase database rules.';
            statusMsg.className = 'upload-status-msg error';
            showToast('❌ Firebase Error. Check database rules.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <span>Publish to Realtime Database</span>
            `;
        }
    });
}

// ---- 2. Quick Seed Sample Videos ----
function setupSeedButton() {
    const seedBtn = document.getElementById('seedDbBtn');
    if (!seedBtn) return;

    seedBtn.addEventListener('click', async () => {
        if (!confirm('Push 11 curated high-quality sample videos & photos to your Firebase database?')) {
            return;
        }

        seedBtn.disabled = true;
        seedBtn.textContent = '⏳ Seeding...';

        try {
            await seedAllDefaultData();
            showToast('🚀 11 Sample Videos added to Firebase!');
        } catch (err) {
            console.error('Seed error:', err);
            showToast('⚠️ Seeding note: Check database write rules.');
        } finally {
            seedBtn.disabled = false;
            seedBtn.textContent = '⚡ Quick Seed Sample Videos';
        }
    });
}

// ---- 3. Library Search & Filter ----
function setupLibraryToolbar() {
    const searchInput = document.getElementById('librarySearchInput');
    const filterButtons = document.querySelectorAll('.lib-filter-btn');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            renderLibrary();
        });
    }

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilter = btn.dataset.type;
            renderLibrary();
        });
    });
}

// ---- 4. Realtime Content Listener ----
function listenToFirebaseContent() {
    getAllContent((items) => {
        libraryItems = items;
        updateStats(items);
        renderLibrary();
    });
}

function updateStats(items) {
    const statTotal = document.getElementById('statTotal');
    const statVideos = document.getElementById('statVideos');
    const statImages = document.getElementById('statImages');
    const countBadge = document.getElementById('libraryCountBadge');

    const total = items.length;
    const videos = items.filter(i => i.type === 'video').length;
    const images = items.filter(i => i.type === 'image').length;

    if (statTotal) statTotal.textContent = total;
    if (statVideos) statVideos.textContent = videos;
    if (statImages) statImages.textContent = images;
    if (countBadge) countBadge.textContent = total;
}

function renderLibrary() {
    const container = document.getElementById('libraryContainer');
    if (!container) return;

    let filtered = [...libraryItems];

    // Filter by type
    if (activeFilter !== 'all') {
        filtered = filtered.filter(i => i.type === activeFilter);
    }

    // Filter by search
    if (searchQuery) {
        filtered = filtered.filter(i =>
            (i.title || '').toLowerCase().includes(searchQuery) ||
            (i.description || '').toLowerCase().includes(searchQuery)
        );
    }

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span style="font-size:36px;">📭</span>
                <h3>No Items Found</h3>
                <p>Upload a new video above or click "Quick Seed Sample Videos".</p>
            </div>
        `;
        return;
    }

    // Sort newest first
    const sorted = filtered.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    container.innerHTML = sorted.map(item => `
        <div class="lib-item-card" data-id="${item.id}">
            <div class="lib-item-media">
                <span class="lib-item-badge">${item.type}</span>
                ${item.type === 'video' ? `
                    <video src="${item.url}" controls muted preload="metadata" playsinline></video>
                ` : `
                    <img src="${item.url}" alt="${item.title || ''}" loading="lazy">
                `}
            </div>
            <div class="lib-item-body">
                <div>
                    <div class="lib-item-title" title="${item.title || 'Untitled'}">${item.title || 'Untitled'}</div>
                    <div class="lib-item-desc">${item.description || 'No caption'}</div>
                </div>
                <div class="lib-item-footer">
                    <span>${timeAgo(item.timestamp)} • ❤️ ${formatNumber(item.likes || 0)}</span>
                    <button class="lib-delete-btn" data-id="${item.id}">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Attach delete handlers
    container.querySelectorAll('.lib-delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            if (confirm('Delete this item permanently from Firebase?')) {
                btn.disabled = true;
                btn.textContent = 'Deleting...';
                try {
                    await deleteContent(id);
                    showToast('🗑️ Item deleted successfully.');
                } catch (err) {
                    console.error('Delete error:', err);
                    showToast('❌ Failed to delete item.');
                }
            }
        });
    });
}

function showToast(message) {
    const toast = document.getElementById('dashToast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Direct boot
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
} else {
    initDashboard();
}
