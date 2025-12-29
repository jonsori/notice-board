// ===================================
// Admin Dashboard - Core Logic
// ===================================

const CSRF_TOKEN_VAL = document.body.querySelector('script').textContent.match(/'(.*)'/)?.[1] || "";

// Initialize all components once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log("Dashboard JS Initializing...");

    // Tab Switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    const contentGrid = document.getElementById('content-grid');
    const usersSection = document.getElementById('users-section');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Handle Users Section visibility
            if (targetTab === 'users') {
                contentGrid.style.display = 'none';
                usersSection.style.display = 'block';
            } else {
                usersSection.style.display = 'none';
                contentGrid.style.display = 'grid';

                const allCards = document.querySelectorAll('.content-card');
                allCards.forEach(card => {
                    const cardStatus = card.dataset.status;
                    card.style.display = (targetTab === 'all' || cardStatus === targetTab) ? 'block' : 'none';
                });
            }
        });
    });

    // Modal Toggling Helper
    const setupModal = (btnId, modalId, closeId) => {
        const btn = document.getElementById(btnId);
        const modal = document.getElementById(modalId);
        const close = document.getElementById(closeId);

        if (btn && modal) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log(`Opening modal: ${modalId}`);
                modal.classList.add('active');
            });
        }
        if (close && modal) {
            close.addEventListener('click', () => modal.classList.remove('active'));
        }
        // Close on overlay click
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.classList.remove('active');
            });
        }
    };

    setupModal('new-content-btn', 'upload-modal', 'close-modal');
    setupModal('manage-users-btn', 'user-modal', 'close-user-modal');

    // Content Type Toggle
    const contentTypeSelect = document.getElementById('content-type');
    const textContentWrapper = document.getElementById('text-content-field');
    const fileContentWrapper = document.getElementById('file-field');

    if (contentTypeSelect) {
        contentTypeSelect.addEventListener('change', (e) => {
            const isText = e.target.value === 'text';
            textContentWrapper?.classList.toggle('hidden', !isText);
            fileContentWrapper?.classList.toggle('hidden', isText);
        });
    }

    // Notice Upload
    const uploadForm = document.getElementById('upload-form');
    let isSubmitting = false;

    if (uploadForm) {
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (isSubmitting) return;

            const submitBtn = uploadForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;

            isSubmitting = true;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Uploading...';

            const formData = new FormData(uploadForm);
            try {
                const response = await fetch('/api/upload/', {
                    method: 'POST',
                    headers: { 'X-CSRFToken': CSRF_TOKEN },
                    body: formData
                });
                const result = await response.json();
                if (result.status === 'success') {
                    showNotification('Submitted successfully!', 'success');
                    document.getElementById('upload-modal').classList.remove('active');
                    uploadForm.reset();
                    // Location reload is safer for new uploads to ensure IDs and such are correct
                    setTimeout(() => location.reload(), 1500);
                } else {
                    showNotification(result.message || 'Upload failed', 'error');
                    isSubmitting = false; // Allow retry
                }
            } catch (err) {
                showNotification('Network error', 'error');
                isSubmitting = false; // Allow retry
            } finally {
                if (!isSubmitting) { // Only reset if we failed/allowed retry. Success reloads page.
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            }
        });
    }

    // User Creation (Admin Only)
    const userForm = document.getElementById('user-form');
    if (userForm) {
        userForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = userForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating...';

            const data = {
                name: document.getElementById('new-club-name').value,
                department: document.getElementById('new-department').value,
                username: document.getElementById('new-username').value,
                password: document.getElementById('new-password').value
            };

            try {
                const response = await fetch('/api/create-club/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': CSRF_TOKEN
                    },
                    body: JSON.stringify(data)
                });
                const result = await response.json();
                if (result.status === 'success') {
                    showNotification(result.message, 'success');
                    document.getElementById('user-modal').classList.remove('active');
                    userForm.reset();
                    // Refresh stats to show new user immediately
                    setTimeout(() => location.reload(), 1500);
                } else {
                    showNotification(result.message || 'Creation failed', 'error');
                }
            } catch (err) {
                showNotification('Server error', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Create Account';
            }
        });
    }

    updateStats();
});

// ===================================
// Globals & Helpers
// ===================================

async function moderateNotice(id, action, btnElement) {
    if (btnElement) {
        btnElement.disabled = true;
        btnElement.style.opacity = '0.5';
    }

    try {
        const response = await fetch(`/api/moderate/${id}/${action}/`, {
            method: 'POST',
            headers: { 'X-CSRFToken': CSRF_TOKEN }
        });
        const result = await response.json();
        if (result.status === 'success') {
            showNotification(`Content ${action}ed!`, 'success');
            const card = document.querySelector(`.content-card[data-id="${id}"]`);
            if (card) {
                card.style.transition = 'all 0.4s ease';
                card.style.transform = 'scale(0.9)';
                card.style.opacity = '0';
                setTimeout(() => {
                    card.remove();
                    updateStats();
                }, 400);
            }
        } else {
            if (btnElement) {
                btnElement.disabled = false;
                btnElement.style.opacity = '1';
            }
            showNotification(result.message || 'Operation failed', 'error');
        }
    } catch (err) {
        if (btnElement) {
            btnElement.disabled = false;
            btnElement.style.opacity = '1';
        }
        showNotification('Operation failed', 'error');
    }
}

function updateStats() {
    const pending = document.querySelectorAll('.content-card[data-status="pending"]').length;
    const approved = document.querySelectorAll('.content-card[data-status="approved"]').length;
    const scheduled = document.querySelectorAll('.content-card[data-status="scheduled"]').length;

    const nums = document.querySelectorAll('.stat-number');
    if (nums[0]) nums[0].textContent = pending;
    if (nums[1]) nums[1].textContent = approved;
    if (nums[2]) nums[2].textContent = scheduled;

    document.querySelectorAll('.tab-btn').forEach(tab => {
        const t = tab.dataset.tab;
        if (t === 'pending') tab.textContent = `Pending (${pending})`;
        if (t === 'approved') tab.textContent = `Approved (${approved})`;
        if (t === 'scheduled') tab.textContent = `Scheduled (${scheduled})`;
    });
}

function showNotification(message, type) {
    const old = document.querySelector('.notification');
    if (old) old.remove();

    const div = document.createElement('div');
    div.className = `notification notification-${type}`;
    div.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 10000;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white; padding: 1rem 2rem; border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2); font-weight: 700;
        animation: slideIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `;
    div.textContent = message;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 4000);
}

const style = document.createElement('style');
style.textContent = `@keyframes slideIn { from { transform: translateX(120%); } to { transform: translateX(0); } }`;
document.head.appendChild(style);

async function deleteUser(id, name) {
    if (!confirm(`Are you sure you want to delete the account for "${name}"? This will also remove all their notices.`)) {
        return;
    }

    try {
        const response = await fetch(`/api/delete-club/${id}/`, {
            method: 'POST',
            headers: { 'X-CSRFToken': CSRF_TOKEN }
        });
        const result = await response.json();
        if (result.status === 'success') {
            showNotification(result.message, 'success');
            // Reload to update the users list and stats
            setTimeout(() => location.reload(), 1500);
        } else {
            showNotification(result.message || 'Deletion failed', 'error');
        }
    } catch (err) {
        showNotification('Operation failed', 'error');
    }
}

async function toggleAccount(id, name, currentStatus) {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} the account for "${name}"?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/toggle-club-status/${id}/`, {
            method: 'POST',
            headers: { 'X-CSRFToken': CSRF_TOKEN }
        });
        const result = await response.json();
        if (result.status === 'success') {
            showNotification(result.message, 'success');
            setTimeout(() => location.reload(), 1000);
        } else {
            showNotification(result.message || 'Operation failed', 'error');
        }
    } catch (err) {
        showNotification('Operation failed', 'error');
    }
}

async function changeUserPassword(id, name) {
    const newPassword = prompt(`Enter new password for ${name} (min 8 chars):`);
    if (!newPassword) return;

    if (newPassword.length < 8) {
        showNotification('Password must be at least 8 characters', 'error');
        return;
    }

    try {
        const response = await fetch(`/api/change-password/${id}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': CSRF_TOKEN
            },
            body: JSON.stringify({ password: newPassword })
        });
        const result = await response.json();
        if (result.status === 'success') {
            showNotification(result.message, 'success');
        } else {
            showNotification(result.message || 'Update failed', 'error');
        }
    } catch (err) {
        showNotification('Operation failed', 'error');
    }
}

window.moderateNotice = moderateNotice;
window.deleteUser = deleteUser;
window.toggleAccount = toggleAccount;
window.changeUserPassword = changeUserPassword;
