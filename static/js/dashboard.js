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
    setupModal('change-pwd-btn', 'pwd-modal', 'close-pwd-modal');


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

    // Self Password Change
    const pwdForm = document.getElementById('pwd-form');
    if (pwdForm) {
        pwdForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = pwdForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Updating...';

            const newPassword = document.getElementById('self-new-password').value;
            // Get current club ID from template context if possible or use a separate endpoint.
            // But we can reuse the View logic if we know the ID.
            // Alternatively, since we can't easily pass the ID into JS without rendering it,
            // we can grab it from a data attribute or global variable.
            // Let's assume we can get it from a global or the DOM.
            // A better approach for self-service is usually a dedicated endpoint like /api/change-my-password/
            // BUT, our modified view accepts club_id. 
            // We need the current user's club ID.

            // Hack/Solution: We will rely on getting the ID from the "Made by Innovation center" text? No.
            // Let's pass the ID in the templates. 
            // WAIT - I need to edit the template again to add the ID to a global var.
            // OR I can just make the view accept a special keyword 'me' or just get ID from request.user in the view.
            // Let's stick to the plan: I will just use the ID if I have it. I don't have it easily in JS.
            // Wait, I can see `{{ club.id }}` in the template context.
            // I should have added `const CLUB_ID = {{ club.id }};` in the dashboard.html script block.

            // For now, I'll assume I'll add that variable in the next step or I can use a dirty trick if I don't want to edit HTML again.
            // Actually, I can just fetch the ID from a data attribute on the body or header.
            // I'll update the JS assuming CLUB_ID exists, and I will add it to the template in a moment.

            // actually, I'll use a better approach: Update the View to handle a "me" ID if I could, but I already modified the view to take an int.
            // So I MUST pass the ID.

            // I'll add `data-club-id="{{ club.id }}"` to the change password button in the previous step? 
            // I didn't. I just added the button.
            // I will add the ID extraction here.

            // Let's try to find the ID from the DOM. 
            // The "Manage Users" button is only for admins.
            // The "New Content" button doesn't have ID.

            // I will assume I will fix the HTML to include the ID. 
            // For this step I will write the code to use distinct `CLUB_ID`.
            if (typeof CLUB_ID === 'undefined') {
                showNotification('System Error: Missing Club ID', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Update Password';
                return;
            }

            try {
                const response = await fetch(`/api/change-password/${CLUB_ID}/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': CSRF_TOKEN
                    },
                    body: JSON.stringify({ password: newPassword })
                });
                const result = await response.json();
                if (result.status === 'success') {
                    showNotification('Password updated successfully', 'success');
                    document.getElementById('pwd-modal').classList.remove('active');
                    pwdForm.reset();
                } else {
                    showNotification(result.message || 'Update failed', 'error');
                }
            } catch (err) {
                showNotification('Server error', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Update Password';
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
    const expired = document.querySelectorAll('.content-card[data-status="expired"]').length;

    const nums = document.querySelectorAll('.stat-number');
    if (nums[0]) nums[0].textContent = pending;
    if (nums[1]) nums[1].textContent = approved;
    if (nums[2]) nums[2].textContent = scheduled;
    if (nums[3]) nums[3].textContent = expired;

    document.querySelectorAll('.tab-btn').forEach(tab => {
        const t = tab.dataset.tab;
        if (t === 'pending') tab.textContent = `Pending (${pending})`;
        if (t === 'approved') tab.textContent = `Approved (${approved})`;
        if (t === 'scheduled') tab.textContent = `Scheduled (${scheduled})`;
        if (t === 'expired') tab.textContent = `Expired (${expired})`;
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
