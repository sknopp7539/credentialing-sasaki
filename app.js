// Credential data storage (using localStorage for persistence)
let credentials = [];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadCredentials();
    renderCredentials();
});

// Load credentials from localStorage
function loadCredentials() {
    const stored = localStorage.getItem('credentials');
    if (stored) {
        credentials = JSON.parse(stored);
    } else {
        // Add some sample data
        credentials = [
            {
                id: 'CRED-2024-001',
                name: 'Advanced JavaScript Certification',
                type: 'Certification',
                recipient: 'John Smith',
                issuer: 'Tech Academy',
                issueDate: '2024-01-15',
                expiryDate: '2026-01-15',
                status: 'Active'
            },
            {
                id: 'CRED-2024-002',
                name: 'Project Management Professional',
                type: 'License',
                recipient: 'Sarah Johnson',
                issuer: 'PMI Institute',
                issueDate: '2023-06-20',
                expiryDate: '2024-06-20',
                status: 'Expired'
            },
            {
                id: 'CRED-2024-003',
                name: 'Cybersecurity Specialist Badge',
                type: 'Badge',
                recipient: 'Michael Chen',
                issuer: 'CyberSec Global',
                issueDate: '2024-09-10',
                expiryDate: '',
                status: 'Active'
            }
        ];
        saveCredentials();
    }
}

// Save credentials to localStorage
function saveCredentials() {
    localStorage.setItem('credentials', JSON.stringify(credentials));
}

// Generate unique credential ID
function generateCredentialId() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 9000) + 1000;
    return `CRED-${year}-${random}`;
}

// Render all credentials
function renderCredentials() {
    const container = document.getElementById('credentials-list');

    if (credentials.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h2>No credentials found</h2>
                <p>Click "Add Credential" to create your first credential.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = credentials.map(cred => `
        <div class="credential-card">
            <div class="credential-header">
                <span class="credential-id">${cred.id}</span>
                <span class="credential-status status-${cred.status.toLowerCase()}">${cred.status}</span>
            </div>
            <div class="credential-name">${cred.name}</div>
            <span class="credential-type">${cred.type}</span>
            <div class="credential-details">
                <div class="credential-detail">
                    <span class="detail-label">Recipient:</span>
                    <span class="detail-value">${cred.recipient}</span>
                </div>
                <div class="credential-detail">
                    <span class="detail-label">Issuer:</span>
                    <span class="detail-value">${cred.issuer}</span>
                </div>
                <div class="credential-detail">
                    <span class="detail-label">Issued:</span>
                    <span class="detail-value">${formatDate(cred.issueDate)}</span>
                </div>
                ${cred.expiryDate ? `
                <div class="credential-detail">
                    <span class="detail-label">Expires:</span>
                    <span class="detail-value">${formatDate(cred.expiryDate)}</span>
                </div>
                ` : ''}
            </div>
            <div class="credential-actions">
                <button class="btn btn-primary btn-small" onclick="editCredential('${cred.id}')">Edit</button>
                <button class="btn btn-danger btn-small" onclick="deleteCredential('${cred.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Show/hide views
function showView(viewName) {
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Update views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(`${viewName}-view`).classList.add('active');
}

// Modal functions
function showAddModal() {
    document.getElementById('modal-title').textContent = 'Add Credential';
    document.getElementById('credential-form').reset();
    document.getElementById('edit-id').value = '';
    document.getElementById('credential-modal').classList.add('active');
}

function closeModal() {
    document.getElementById('credential-modal').classList.remove('active');
}

// Save credential (add or edit)
function saveCredential(event) {
    event.preventDefault();

    const id = document.getElementById('edit-id').value;
    const credentialData = {
        id: id || generateCredentialId(),
        name: document.getElementById('cred-name').value,
        type: document.getElementById('cred-type').value,
        recipient: document.getElementById('cred-recipient').value,
        issuer: document.getElementById('cred-issuer').value,
        issueDate: document.getElementById('cred-issue-date').value,
        expiryDate: document.getElementById('cred-expiry-date').value,
        status: document.getElementById('cred-status').value
    };

    if (id) {
        // Edit existing credential
        const index = credentials.findIndex(c => c.id === id);
        if (index !== -1) {
            credentials[index] = credentialData;
        }
    } else {
        // Add new credential
        credentials.push(credentialData);
    }

    saveCredentials();
    renderCredentials();
    closeModal();
}

// Edit credential
function editCredential(id) {
    const credential = credentials.find(c => c.id === id);
    if (!credential) return;

    document.getElementById('modal-title').textContent = 'Edit Credential';
    document.getElementById('edit-id').value = credential.id;
    document.getElementById('cred-name').value = credential.name;
    document.getElementById('cred-type').value = credential.type;
    document.getElementById('cred-recipient').value = credential.recipient;
    document.getElementById('cred-issuer').value = credential.issuer;
    document.getElementById('cred-issue-date').value = credential.issueDate;
    document.getElementById('cred-expiry-date').value = credential.expiryDate;
    document.getElementById('cred-status').value = credential.status;

    document.getElementById('credential-modal').classList.add('active');
}

// Delete credential
function deleteCredential(id) {
    if (confirm('Are you sure you want to delete this credential?')) {
        credentials = credentials.filter(c => c.id !== id);
        saveCredentials();
        renderCredentials();
    }
}

// Verify credential
function verifyCredential() {
    const credId = document.getElementById('credential-id').value.trim();
    const resultContainer = document.getElementById('verification-result');

    if (!credId) {
        resultContainer.innerHTML = `
            <div class="verify-card invalid">
                <div class="verify-header">
                    <div class="verify-icon invalid">⚠️</div>
                    <div class="verify-title invalid">Invalid Input</div>
                </div>
                <p>Please enter a credential ID to verify.</p>
            </div>
        `;
        return;
    }

    const credential = credentials.find(c => c.id === credId);

    if (!credential) {
        resultContainer.innerHTML = `
            <div class="verify-card invalid">
                <div class="verify-header">
                    <div class="verify-icon invalid">❌</div>
                    <div class="verify-title invalid">Credential Not Found</div>
                </div>
                <p>No credential found with ID: <strong>${credId}</strong></p>
                <p style="margin-top: 1rem; color: #7f8c8d;">This credential may not exist or has been revoked.</p>
            </div>
        `;
        return;
    }

    const isValid = credential.status === 'Active';

    resultContainer.innerHTML = `
        <div class="verify-card ${isValid ? 'valid' : 'invalid'}">
            <div class="verify-header">
                <div class="verify-icon ${isValid ? 'valid' : 'invalid'}">${isValid ? '✓' : '❌'}</div>
                <div class="verify-title ${isValid ? 'valid' : 'invalid'}">
                    ${isValid ? 'Valid Credential' : 'Invalid Credential'}
                </div>
            </div>
            ${!isValid ? `<p style="color: #e74c3c; margin-bottom: 1rem;">This credential is ${credential.status.toLowerCase()}.</p>` : ''}
            <div class="verify-details">
                <div class="verify-detail">
                    <span class="verify-label">Credential ID:</span>
                    <span class="verify-value">${credential.id}</span>
                </div>
                <div class="verify-detail">
                    <span class="verify-label">Name:</span>
                    <span class="verify-value">${credential.name}</span>
                </div>
                <div class="verify-detail">
                    <span class="verify-label">Type:</span>
                    <span class="verify-value">${credential.type}</span>
                </div>
                <div class="verify-detail">
                    <span class="verify-label">Recipient:</span>
                    <span class="verify-value">${credential.recipient}</span>
                </div>
                <div class="verify-detail">
                    <span class="verify-label">Issuing Organization:</span>
                    <span class="verify-value">${credential.issuer}</span>
                </div>
                <div class="verify-detail">
                    <span class="verify-label">Issue Date:</span>
                    <span class="verify-value">${formatDate(credential.issueDate)}</span>
                </div>
                ${credential.expiryDate ? `
                <div class="verify-detail">
                    <span class="verify-label">Expiry Date:</span>
                    <span class="verify-value">${formatDate(credential.expiryDate)}</span>
                </div>
                ` : ''}
                <div class="verify-detail">
                    <span class="verify-label">Status:</span>
                    <span class="verify-value" style="color: ${isValid ? '#27ae60' : '#e74c3c'};">${credential.status}</span>
                </div>
            </div>
        </div>
    `;
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('credential-modal');
    if (event.target === modal) {
        closeModal();
    }
}
