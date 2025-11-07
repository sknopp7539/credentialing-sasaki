// Data storage (using localStorage for persistence)
let credentials = [];
let users = [];
let currentUser = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
    checkAuth();
    loadCredentials();
});

// === Authentication Functions ===

function loadUsers() {
    const stored = localStorage.getItem('users');
    if (stored) {
        users = JSON.parse(stored);
    } else {
        // Create demo users
        users = [
            {
                id: 'user-001',
                name: 'Jane Issuer',
                email: 'issuer@demo.com',
                password: 'demo123',
                role: 'issuer',
                organization: 'Tech Academy'
            },
            {
                id: 'user-002',
                name: 'John Recipient',
                email: 'recipient@demo.com',
                password: 'demo123',
                role: 'recipient',
                organization: ''
            }
        ];
        saveUsers();
    }
}

function saveUsers() {
    localStorage.setItem('users', JSON.stringify(users));
}

function checkAuth() {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
        currentUser = JSON.parse(stored);
        showMainApp();
    } else {
        showAuthScreen();
    }
}

function showAuthScreen() {
    document.getElementById('auth-screen').style.display = 'flex';
    document.getElementById('main-app').style.display = 'none';
}

function showMainApp() {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
    updateUserInterface();
    renderCredentials();
}

function switchAuthForm(formType) {
    event.preventDefault();
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (formType === 'register') {
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
    } else {
        registerForm.classList.remove('active');
        loginForm.classList.add('active');
    }
}

function login(event) {
    event.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showMainApp();
    } else {
        alert('Invalid email or password. Try:\nIssuer: issuer@demo.com / demo123\nRecipient: recipient@demo.com / demo123');
    }
}

function register(event) {
    event.preventDefault();

    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const organization = document.getElementById('reg-organization').value;
    const role = document.getElementById('reg-role').value;

    // Check if email already exists
    if (users.find(u => u.email === email)) {
        alert('An account with this email already exists.');
        return;
    }

    const newUser = {
        id: `user-${Date.now()}`,
        name,
        email,
        password,
        role,
        organization
    };

    users.push(newUser);
    saveUsers();

    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    showMainApp();
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showAuthScreen();

    // Reset nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.nav-btn').classList.add('active');
}

function updateUserInterface() {
    // Update user info in navbar
    document.getElementById('user-name').textContent = currentUser.name;
    const roleBadge = document.getElementById('user-role-badge');
    roleBadge.textContent = currentUser.role;
    roleBadge.className = `user-role ${currentUser.role}`;

    // Show/hide issuer-only features
    const issuerElements = document.querySelectorAll('.issuer-only');
    issuerElements.forEach(el => {
        el.style.display = currentUser.role === 'issuer' ? 'block' : 'none';
    });

    // Update dashboard header based on role
    const dashboardHeader = document.querySelector('#dashboard-view .view-header h1');
    if (currentUser.role === 'issuer') {
        dashboardHeader.textContent = 'Issued Credentials';
    } else {
        dashboardHeader.textContent = 'My Credentials';
    }
}

// === Credential Management ===

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
                recipientEmail: 'john@example.com',
                issuer: 'Tech Academy',
                issuerId: 'user-001',
                issueDate: '2024-01-15',
                expiryDate: '2026-01-15',
                status: 'Active'
            },
            {
                id: 'CRED-2024-002',
                name: 'Project Management Professional',
                type: 'License',
                recipient: 'Sarah Johnson',
                recipientEmail: 'sarah@example.com',
                issuer: 'Tech Academy',
                issuerId: 'user-001',
                issueDate: '2023-06-20',
                expiryDate: '2024-06-20',
                status: 'Expired'
            },
            {
                id: 'CRED-2024-003',
                name: 'Cybersecurity Specialist Badge',
                type: 'Badge',
                recipient: 'Michael Chen',
                recipientEmail: 'michael@example.com',
                issuer: 'CyberSec Global',
                issuerId: 'user-003',
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

// Render all credentials (filtered by role)
function renderCredentials() {
    const container = document.getElementById('credentials-list');

    if (!currentUser) return;

    // Filter credentials based on role
    let filteredCreds = credentials;
    if (currentUser.role === 'issuer') {
        // Show credentials issued by this user
        filteredCreds = credentials.filter(c => c.issuerId === currentUser.id);
    } else {
        // Show credentials received by this user
        filteredCreds = credentials.filter(c => c.recipientEmail === currentUser.email);
    }

    if (filteredCreds.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h2>No credentials found</h2>
                <p>${currentUser.role === 'issuer' ? 'Click "Add Credential" to issue your first credential.' : 'You have not received any credentials yet.'}</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredCreds.map(cred => `
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
            ${currentUser.role === 'issuer' ? `
            <div class="credential-actions">
                <button class="btn btn-primary btn-small" onclick="editCredential('${cred.id}')">Edit</button>
                <button class="btn btn-danger btn-small" onclick="deleteCredential('${cred.id}')">Delete</button>
            </div>
            ` : ''}
        </div>
    `).join('');
}

// Render recipients (for issuers only)
function renderRecipients() {
    const container = document.getElementById('recipients-list');

    if (!currentUser || currentUser.role !== 'issuer') {
        container.innerHTML = '<p>Access denied</p>';
        return;
    }

    // Get unique recipients from credentials issued by this user
    const recipientMap = new Map();
    credentials
        .filter(c => c.issuerId === currentUser.id)
        .forEach(cred => {
            const key = cred.recipientEmail;
            if (!recipientMap.has(key)) {
                recipientMap.set(key, {
                    name: cred.recipient,
                    email: cred.recipientEmail,
                    credentials: []
                });
            }
            recipientMap.get(key).credentials.push(cred);
        });

    const recipients = Array.from(recipientMap.values());

    if (recipients.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h2>No recipients yet</h2>
                <p>Issue credentials to see recipients here.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = recipients.map(recipient => {
        const activeCount = recipient.credentials.filter(c => c.status === 'Active').length;
        const totalCount = recipient.credentials.length;

        return `
            <div class="recipient-card">
                <div class="recipient-name">${recipient.name}</div>
                <div class="recipient-email">${recipient.email}</div>
                <div class="recipient-stats">
                    <div class="stat">
                        <div class="stat-value">${totalCount}</div>
                        <div class="stat-label">Total</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${activeCount}</div>
                        <div class="stat-label">Active</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
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

    // Render content for specific views
    if (viewName === 'recipients') {
        renderRecipients();
    }
}

// Modal functions
function showAddModal() {
    document.getElementById('modal-title').textContent = 'Add Credential';
    document.getElementById('credential-form').reset();
    document.getElementById('edit-id').value = '';

    // Hide issuer field for issuers (auto-filled from their organization)
    const issuerField = document.getElementById('issuer-field');
    if (currentUser && currentUser.role === 'issuer') {
        issuerField.style.display = 'none';
        document.getElementById('cred-issuer').removeAttribute('required');
    } else {
        issuerField.style.display = 'block';
        document.getElementById('cred-issuer').setAttribute('required', '');
    }

    document.getElementById('credential-modal').classList.add('active');
}

function closeModal() {
    document.getElementById('credential-modal').classList.remove('active');
}

// Save credential (add or edit)
function saveCredential(event) {
    event.preventDefault();

    const id = document.getElementById('edit-id').value;
    const recipientName = document.getElementById('cred-recipient').value;

    // For issuer role, automatically use their organization as issuer
    const issuerValue = currentUser.role === 'issuer'
        ? (currentUser.organization || currentUser.name)
        : document.getElementById('cred-issuer').value;

    const credentialData = {
        id: id || generateCredentialId(),
        name: document.getElementById('cred-name').value,
        type: document.getElementById('cred-type').value,
        recipient: recipientName,
        recipientEmail: document.getElementById('cred-recipient-email').value,
        issuer: issuerValue,
        issuerId: currentUser.role === 'issuer' ? currentUser.id : (id ? credentials.find(c => c.id === id)?.issuerId : 'unknown'),
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
    document.getElementById('cred-recipient-email').value = credential.recipientEmail || '';
    document.getElementById('cred-issuer').value = credential.issuer;
    document.getElementById('cred-issue-date').value = credential.issueDate;
    document.getElementById('cred-expiry-date').value = credential.expiryDate;
    document.getElementById('cred-status').value = credential.status;

    // Hide issuer field for issuers
    const issuerField = document.getElementById('issuer-field');
    if (currentUser && currentUser.role === 'issuer') {
        issuerField.style.display = 'none';
        document.getElementById('cred-issuer').removeAttribute('required');
    } else {
        issuerField.style.display = 'block';
        document.getElementById('cred-issuer').setAttribute('required', '');
    }

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
