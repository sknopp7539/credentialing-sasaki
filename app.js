// ProviderVault - Healthcare Credentialing System
// Data storage
let providers = [];
let payers = [];
let enrollments = [];
let locations = [];
let currentUser = null;
let selectedProvider = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadData();
});

// ===== AUTHENTICATION =====
function checkAuth() {
    const stored = localStorage.getItem('pvCurrentUser');
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
    document.getElementById('main-app').style.display = 'flex';
    updateDashboard();
    renderProviders();
}

function login(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    // Simple auth for demo
    if (email && password) {
        currentUser = {
            id: 'user-001',
            name: 'Admin User',
            email: email
        };
        localStorage.setItem('pvCurrentUser', JSON.stringify(currentUser));
        showMainApp();
    } else {
        alert('Please enter email and password');
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('pvCurrentUser');
    showAuthScreen();

    // Reset navigation
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.nav-item[data-view="dashboard"]').classList.add('active');
}

// ===== VIEW NAVIGATION =====
function showView(viewName) {
    // Update nav buttons
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.nav-item[data-view="${viewName}"]`)?.classList.add('active');

    // Update views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    const viewElement = document.getElementById(`${viewName}-view`);
    if (viewElement) {
        viewElement.classList.add('active');
    }

    // Render content for specific views
    if (viewName === 'dashboard') {
        updateDashboard();
    } else if (viewName === 'providers') {
        renderProviders();
    } else if (viewName === 'payers') {
        renderPayers();
    } else if (viewName === 'enrollments') {
        renderEnrollments();
    } else if (viewName === 'locations') {
        renderLocations();
    } else if (viewName === 'analytics') {
        renderAnalytics();
    }
}

// ===== DATA MANAGEMENT =====
function loadData() {
    // Load providers
    const storedProviders = localStorage.getItem('pvProviders');
    if (storedProviders) {
        providers = JSON.parse(storedProviders);
    } else {
        providers = [
            {
                id: 'PROV-001',
                name: 'Dr. Sarah Johnson',
                specialty: 'Family Medicine',
                npi: '1234567890',
                email: 'sarah.j@example.com',
                phone: '(555) 123-4567',
                status: 'Active'
            },
            {
                id: 'PROV-002',
                name: 'Dr. Michael Chen',
                specialty: 'Cardiology',
                npi: '9876543210',
                email: 'michael.c@example.com',
                phone: '(555) 987-6543',
                status: 'Active'
            },
            {
                id: 'PROV-003',
                name: 'Dr. Emily Davis',
                specialty: 'Pediatrics',
                npi: '5555555555',
                email: 'emily.d@example.com',
                phone: '(555) 555-5555',
                status: 'Pending'
            }
        ];
        saveProviders();
    }

    // Load payers
    const storedPayers = localStorage.getItem('pvPayers');
    if (storedPayers) {
        payers = JSON.parse(storedPayers);
    } else {
        payers = [
            {
                id: 'PAY-001',
                name: 'Blue Cross Blue Shield',
                type: 'Commercial',
                payerId: '12345',
                status: 'Active'
            },
            {
                id: 'PAY-002',
                name: 'Aetna',
                type: 'Commercial',
                payerId: '67890',
                status: 'Active'
            },
            {
                id: 'PAY-003',
                name: 'Medicare',
                type: 'Medicare',
                payerId: '00001',
                status: 'Active'
            }
        ];
        savePayers();
    }

    // Load enrollments
    const storedEnrollments = localStorage.getItem('pvEnrollments');
    if (storedEnrollments) {
        enrollments = JSON.parse(storedEnrollments);
    } else {
        enrollments = [
            {
                id: 'ENR-001',
                providerId: 'PROV-001',
                payerId: 'PAY-001',
                applicationDate: '2024-01-15',
                status: 'Approved'
            },
            {
                id: 'ENR-002',
                providerId: 'PROV-002',
                payerId: 'PAY-002',
                applicationDate: '2024-02-20',
                status: 'Pending'
            }
        ];
        saveEnrollments();
    }

    // Load locations
    const storedLocations = localStorage.getItem('pvLocations');
    if (storedLocations) {
        locations = JSON.parse(storedLocations);
    } else {
        locations = [
            {
                id: 'LOC-001',
                name: 'Main Medical Center',
                type: 'Hospital',
                address: '123 Health St',
                city: 'San Francisco',
                state: 'CA',
                phone: '(555) 100-1000',
                status: 'Active'
            },
            {
                id: 'LOC-002',
                name: 'Downtown Clinic',
                type: 'Clinic',
                address: '456 Medical Ave',
                city: 'Oakland',
                state: 'CA',
                phone: '(555) 200-2000',
                status: 'Active'
            }
        ];
        saveLocations();
    }
}

function saveProviders() {
    localStorage.setItem('pvProviders', JSON.stringify(providers));
}

function savePayers() {
    localStorage.setItem('pvPayers', JSON.stringify(payers));
}

function saveEnrollments() {
    localStorage.setItem('pvEnrollments', JSON.stringify(enrollments));
}

function saveLocations() {
    localStorage.setItem('pvLocations', JSON.stringify(locations));
}

// ===== DASHBOARD =====
function updateDashboard() {
    // Update stats
    document.getElementById('total-providers').textContent = providers.length;
    document.getElementById('total-enrollments').textContent = enrollments.length;
    document.getElementById('pending-credentialing').textContent =
        providers.filter(p => p.status === 'Pending').length;
    document.getElementById('open-claims').textContent = '1';

    // Populate expirations table
    renderExpirationsTable();
}

function renderExpirationsTable() {
    const tbody = document.getElementById('expirations-tbody');
    if (!tbody) return;

    const sampleExpirations = [
        {
            provider: 'Dr. Sarah Johnson',
            specialty: 'Family Medicine',
            document: 'State Medical License',
            category: 'License',
            expiresIn: '30 days',
            dueDate: '12/15/2024',
            status: 'Upcoming'
        },
        {
            provider: 'Dr. Michael Chen',
            specialty: 'Cardiology',
            document: 'DEA Certificate',
            category: 'License',
            expiresIn: '60 days',
            dueDate: '01/15/2025',
            status: 'Upcoming'
        },
        {
            provider: 'Dr. Emily Davis',
            specialty: 'Pediatrics',
            document: 'Board Certification',
            category: 'Education',
            expiresIn: 'Overdue',
            dueDate: '10/01/2024',
            status: 'Expired'
        },
        {
            provider: 'Dr. Sarah Johnson',
            specialty: 'Family Medicine',
            document: 'Malpractice Insurance',
            category: 'Insurance',
            expiresIn: '15 days',
            dueDate: '11/30/2024',
            status: 'Upcoming'
        }
    ];

    tbody.innerHTML = sampleExpirations.map(item => `
        <tr>
            <td>
                <div style="font-weight: 500; color: #1e293b;">${item.provider}</div>
                <div style="font-size: 0.8125rem; color: #64748b;">${item.specialty}</div>
            </td>
            <td>${item.document}</td>
            <td>${item.category}</td>
            <td>
                <div style="font-weight: 500;">${item.expiresIn}</div>
                <div style="font-size: 0.8125rem; color: #64748b;">${item.dueDate}</div>
            </td>
            <td>
                <span class="status-badge status-${item.status.toLowerCase()}">
                    ${item.status}
                </span>
            </td>
            <td>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-secondary btn-small">View Details</button>
                    <button class="btn btn-danger btn-small">Resolve</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function filterExpirations(filter) {
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    // Filter logic would go here
}

function filterByTag(tag) {
    // Update active tag
    document.querySelectorAll('.tag-group .tag').forEach(t => {
        t.classList.remove('active');
    });
    event.target.classList.add('active');
    // Filter logic would go here
}

// ===== PROVIDERS =====
function renderProviders() {
    const container = document.getElementById('providers-list');
    if (!container) return;

    if (providers.length === 0) {
        container.innerHTML = `
            <div class="coming-soon">
                No providers found. Click "Add Provider" to get started.
            </div>
        `;
        return;
    }

    container.innerHTML = providers.map(provider => {
        const initials = provider.name.split(' ').map(n => n[0]).join('');
        return `
            <div class="provider-card" onclick="viewProviderDetail('${provider.id}')">
                <div class="provider-info">
                    <div class="provider-avatar">${initials}</div>
                    <div class="provider-details">
                        <h3>${provider.name}</h3>
                        <div class="provider-specialty">${provider.specialty}</div>
                    </div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                    <span style="font-size: 0.875rem; color: #64748b;">NPI: ${provider.npi}</span>
                    <span class="status-badge status-${provider.status.toLowerCase()}">${provider.status}</span>
                </div>
                <div style="font-size: 0.875rem; color: #64748b; margin-bottom: 0.5rem;">
                    <div>📧 ${provider.email}</div>
                    <div>📞 ${provider.phone}</div>
                </div>
                <div style="display: flex; gap: 0.5rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e2e8f0;">
                    <button class="btn btn-primary btn-small" onclick="event.stopPropagation(); editProvider('${provider.id}')">Edit</button>
                    <button class="btn btn-danger btn-small" onclick="event.stopPropagation(); deleteProvider('${provider.id}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

function viewProviderDetail(providerId) {
    selectedProvider = providers.find(p => p.id === providerId);
    if (!selectedProvider) return;

    const detailView = document.getElementById('provider-detail-view');
    const initials = selectedProvider.name.split(' ').map(n => n[0]).join('');

    detailView.innerHTML = `
        <div class="detail-header">
            <button class="back-btn" onclick="closeProviderDetail()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Back to Providers
            </button>
        </div>
        <div class="detail-content">
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem;">
                <div class="provider-avatar" style="width: 64px; height: 64px; font-size: 1.5rem;">
                    ${initials}
                </div>
                <div>
                    <h1 style="font-size: 1.75rem; font-weight: 700; margin-bottom: 0.25rem;">${selectedProvider.name}</h1>
                    <p style="color: #64748b; font-size: 1.125rem;">${selectedProvider.specialty}</p>
                </div>
                <span class="status-badge status-${selectedProvider.status.toLowerCase()}" style="margin-left: auto;">
                    ${selectedProvider.status}
                </span>
            </div>

            <div class="info-grid">
                <div class="info-card">
                    <h3>Contact Information</h3>
                    <div class="info-field">
                        <div class="info-label">Email</div>
                        <div class="info-value">${selectedProvider.email}</div>
                    </div>
                    <div class="info-field">
                        <div class="info-label">Phone</div>
                        <div class="info-value">${selectedProvider.phone}</div>
                    </div>
                    <div class="info-field">
                        <div class="info-label">NPI Number</div>
                        <div class="info-value">${selectedProvider.npi}</div>
                    </div>
                </div>

                <div class="info-card">
                    <h3>Professional Information</h3>
                    <div class="info-field">
                        <div class="info-label">Specialty</div>
                        <div class="info-value">${selectedProvider.specialty}</div>
                    </div>
                    <div class="info-field">
                        <div class="info-label">Provider ID</div>
                        <div class="info-value">${selectedProvider.id}</div>
                    </div>
                </div>
            </div>

            <div class="coming-soon" style="margin-top: 2rem;">
                Additional provider details (licenses, documents, etc.) coming soon...
            </div>
        </div>
    `;

    // Show detail view
    document.getElementById('providers-view').classList.remove('active');
    detailView.classList.add('active');
}

function closeProviderDetail() {
    document.getElementById('provider-detail-view').classList.remove('active');
    document.getElementById('providers-view').classList.add('active');
    selectedProvider = null;
}

function showProviderModal() {
    document.getElementById('provider-modal-title').textContent = 'Add Provider';
    document.getElementById('provider-form').reset();
    document.getElementById('provider-edit-id').value = '';
    document.getElementById('provider-modal').classList.add('active');
}

function closeProviderModal() {
    document.getElementById('provider-modal').classList.remove('active');
}

function saveProvider(event) {
    event.preventDefault();

    const id = document.getElementById('provider-edit-id').value;
    const providerData = {
        id: id || `PROV-${String(providers.length + 1).padStart(3, '0')}`,
        name: document.getElementById('provider-name').value,
        npi: document.getElementById('provider-npi').value,
        specialty: document.getElementById('provider-specialty').value,
        email: document.getElementById('provider-email').value,
        phone: document.getElementById('provider-phone').value,
        status: document.getElementById('provider-status').value
    };

    if (id) {
        const index = providers.findIndex(p => p.id === id);
        if (index !== -1) {
            providers[index] = providerData;
        }
    } else {
        providers.push(providerData);
    }

    saveProviders();
    renderProviders();
    closeProviderModal();
}

function editProvider(id) {
    const provider = providers.find(p => p.id === id);
    if (!provider) return;

    document.getElementById('provider-modal-title').textContent = 'Edit Provider';
    document.getElementById('provider-edit-id').value = provider.id;
    document.getElementById('provider-name').value = provider.name;
    document.getElementById('provider-npi').value = provider.npi;
    document.getElementById('provider-specialty').value = provider.specialty;
    document.getElementById('provider-email').value = provider.email;
    document.getElementById('provider-phone').value = provider.phone;
    document.getElementById('provider-status').value = provider.status;

    document.getElementById('provider-modal').classList.add('active');
}

function deleteProvider(id) {
    if (confirm('Are you sure you want to delete this provider?')) {
        providers = providers.filter(p => p.id !== id);
        saveProviders();
        renderProviders();
    }
}

// ===== PAYERS =====
function renderPayers() {
    const container = document.getElementById('payers-list');
    if (!container) return;

    if (payers.length === 0) {
        container.innerHTML = '<div class="coming-soon">No payers found.</div>';
        return;
    }

    container.innerHTML = payers.map(payer => `
        <div class="payer-card">
            <div class="card-header">
                <span style="font-family: monospace; color: #64748b; font-size: 0.875rem;">${payer.id}</span>
                <span class="status-badge status-${payer.status.toLowerCase()}">${payer.status}</span>
            </div>
            <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem;">${payer.name}</h3>
            <div style="background: #f1f5f9; padding: 0.375rem 0.75rem; border-radius: 6px; display: inline-block; font-size: 0.875rem; margin-bottom: 1rem;">
                ${payer.type}
            </div>
            <div style="font-size: 0.875rem; color: #64748b;">
                Payer ID: <span style="font-weight: 500; color: #1e293b;">${payer.payerId}</span>
            </div>
            <div style="display: flex; gap: 0.5rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e2e8f0;">
                <button class="btn btn-primary btn-small" onclick="editPayer('${payer.id}')">Edit</button>
                <button class="btn btn-danger btn-small" onclick="deletePayer('${payer.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function showPayerModal() {
    document.getElementById('payer-modal-title').textContent = 'Add Payer';
    document.getElementById('payer-form').reset();
    document.getElementById('payer-edit-id').value = '';
    document.getElementById('payer-modal').classList.add('active');
}

function closePayerModal() {
    document.getElementById('payer-modal').classList.remove('active');
}

function savePayer(event) {
    event.preventDefault();

    const id = document.getElementById('payer-edit-id').value;
    const payerData = {
        id: id || `PAY-${String(payers.length + 1).padStart(3, '0')}`,
        name: document.getElementById('payer-name').value,
        type: document.getElementById('payer-type').value,
        payerId: document.getElementById('payer-id').value,
        status: document.getElementById('payer-status').value
    };

    if (id) {
        const index = payers.findIndex(p => p.id === id);
        if (index !== -1) {
            payers[index] = payerData;
        }
    } else {
        payers.push(payerData);
    }

    savePayers();
    renderPayers();
    closePayerModal();
}

function editPayer(id) {
    const payer = payers.find(p => p.id === id);
    if (!payer) return;

    document.getElementById('payer-modal-title').textContent = 'Edit Payer';
    document.getElementById('payer-edit-id').value = payer.id;
    document.getElementById('payer-name').value = payer.name;
    document.getElementById('payer-type').value = payer.type;
    document.getElementById('payer-id').value = payer.payerId;
    document.getElementById('payer-status').value = payer.status;

    document.getElementById('payer-modal').classList.add('active');
}

function deletePayer(id) {
    if (confirm('Are you sure you want to delete this payer?')) {
        payers = payers.filter(p => p.id !== id);
        savePayers();
        renderPayers();
    }
}

// ===== ENROLLMENTS =====
function renderEnrollments() {
    const container = document.getElementById('enrollments-list');
    if (!container) return;

    if (enrollments.length === 0) {
        container.innerHTML = '<div class="coming-soon">No enrollments found.</div>';
        return;
    }

    container.innerHTML = enrollments.map(enrollment => {
        const provider = providers.find(p => p.id === enrollment.providerId);
        const payer = payers.find(p => p.id === enrollment.payerId);

        return `
            <div class="enrollment-card">
                <div class="card-header">
                    <span style="font-family: monospace; color: #64748b; font-size: 0.875rem;">${enrollment.id}</span>
                    <span class="status-badge status-${enrollment.status.toLowerCase().replace(' ', '-')}">${enrollment.status}</span>
                </div>
                <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem;">
                    ${provider ? provider.name : 'Unknown Provider'}
                </h3>
                <div style="background: #f1f5f9; padding: 0.375rem 0.75rem; border-radius: 6px; display: inline-block; font-size: 0.875rem; margin-bottom: 1rem;">
                    ${payer ? payer.name : 'Unknown Payer'}
                </div>
                <div style="font-size: 0.875rem; color: #64748b;">
                    Application Date: <span style="font-weight: 500; color: #1e293b;">${enrollment.applicationDate}</span>
                </div>
                <div style="display: flex; gap: 0.5rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e2e8f0;">
                    <button class="btn btn-primary btn-small" onclick="editEnrollment('${enrollment.id}')">Edit</button>
                    <button class="btn btn-danger btn-small" onclick="deleteEnrollment('${enrollment.id}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

function showEnrollmentModal() {
    document.getElementById('enrollment-modal-title').textContent = 'Add Enrollment';
    document.getElementById('enrollment-form').reset();
    document.getElementById('enrollment-edit-id').value = '';
    populateEnrollmentDropdowns();
    document.getElementById('enrollment-modal').classList.add('active');
}

function closeEnrollmentModal() {
    document.getElementById('enrollment-modal').classList.remove('active');
}

function populateEnrollmentDropdowns() {
    const providerSelect = document.getElementById('enrollment-provider');
    const payerSelect = document.getElementById('enrollment-payer');

    providerSelect.innerHTML = '<option value="">Select Provider</option>' +
        providers.map(p => `<option value="${p.id}">${p.name}</option>`).join('');

    payerSelect.innerHTML = '<option value="">Select Payer</option>' +
        payers.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
}

function saveEnrollment(event) {
    event.preventDefault();

    const id = document.getElementById('enrollment-edit-id').value;
    const enrollmentData = {
        id: id || `ENR-${String(enrollments.length + 1).padStart(3, '0')}`,
        providerId: document.getElementById('enrollment-provider').value,
        payerId: document.getElementById('enrollment-payer').value,
        applicationDate: document.getElementById('enrollment-application-date').value,
        status: document.getElementById('enrollment-status').value
    };

    if (id) {
        const index = enrollments.findIndex(e => e.id === id);
        if (index !== -1) {
            enrollments[index] = enrollmentData;
        }
    } else {
        enrollments.push(enrollmentData);
    }

    saveEnrollments();
    renderEnrollments();
    closeEnrollmentModal();
}

function editEnrollment(id) {
    const enrollment = enrollments.find(e => e.id === id);
    if (!enrollment) return;

    document.getElementById('enrollment-modal-title').textContent = 'Edit Enrollment';
    document.getElementById('enrollment-edit-id').value = enrollment.id;
    populateEnrollmentDropdowns();
    document.getElementById('enrollment-provider').value = enrollment.providerId;
    document.getElementById('enrollment-payer').value = enrollment.payerId;
    document.getElementById('enrollment-application-date').value = enrollment.applicationDate;
    document.getElementById('enrollment-status').value = enrollment.status;

    document.getElementById('enrollment-modal').classList.add('active');
}

function deleteEnrollment(id) {
    if (confirm('Are you sure you want to delete this enrollment?')) {
        enrollments = enrollments.filter(e => e.id !== id);
        saveEnrollments();
        renderEnrollments();
    }
}

// ===== LOCATIONS =====
function renderLocations() {
    const container = document.getElementById('locations-list');
    if (!container) return;

    if (locations.length === 0) {
        container.innerHTML = '<div class="coming-soon">No locations found.</div>';
        return;
    }

    container.innerHTML = locations.map(location => `
        <div class="location-card">
            <div class="card-header">
                <span style="font-family: monospace; color: #64748b; font-size: 0.875rem;">${location.id}</span>
                <span class="status-badge status-${location.status.toLowerCase()}">${location.status}</span>
            </div>
            <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem;">${location.name}</h3>
            <div style="background: #f1f5f9; padding: 0.375rem 0.75rem; border-radius: 6px; display: inline-block; font-size: 0.875rem; margin-bottom: 1rem;">
                ${location.type}
            </div>
            <div style="font-size: 0.875rem; color: #64748b; margin-bottom: 0.5rem;">
                <div>${location.address}</div>
                <div>${location.city}, ${location.state}</div>
                <div>📞 ${location.phone}</div>
            </div>
            <div style="display: flex; gap: 0.5rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e2e8f0;">
                <button class="btn btn-primary btn-small" onclick="editLocation('${location.id}')">Edit</button>
                <button class="btn btn-danger btn-small" onclick="deleteLocation('${location.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function showLocationModal() {
    document.getElementById('location-modal-title').textContent = 'Add Location';
    document.getElementById('location-form').reset();
    document.getElementById('location-edit-id').value = '';
    document.getElementById('location-modal').classList.add('active');
}

function closeLocationModal() {
    document.getElementById('location-modal').classList.remove('active');
}

function saveLocation(event) {
    event.preventDefault();

    const id = document.getElementById('location-edit-id').value;
    const locationData = {
        id: id || `LOC-${String(locations.length + 1).padStart(3, '0')}`,
        name: document.getElementById('location-name').value,
        type: document.getElementById('location-type').value,
        address: document.getElementById('location-address').value,
        city: document.getElementById('location-city').value,
        state: document.getElementById('location-state').value,
        phone: document.getElementById('location-phone').value,
        status: 'Active'
    };

    if (id) {
        const index = locations.findIndex(l => l.id === id);
        if (index !== -1) {
            locations[index] = locationData;
        }
    } else {
        locations.push(locationData);
    }

    saveLocations();
    renderLocations();
    closeLocationModal();
}

function editLocation(id) {
    const location = locations.find(l => l.id === id);
    if (!location) return;

    document.getElementById('location-modal-title').textContent = 'Edit Location';
    document.getElementById('location-edit-id').value = location.id;
    document.getElementById('location-name').value = location.name;
    document.getElementById('location-type').value = location.type;
    document.getElementById('location-address').value = location.address;
    document.getElementById('location-city').value = location.city;
    document.getElementById('location-state').value = location.state;
    document.getElementById('location-phone').value = location.phone;

    document.getElementById('location-modal').classList.add('active');
}

function deleteLocation(id) {
    if (confirm('Are you sure you want to delete this location?')) {
        locations = locations.filter(l => l.id !== id);
        saveLocations();
        renderLocations();
    }
}

// ===== ANALYTICS =====
function renderAnalytics() {
    const container = document.getElementById('analytics-content');
    if (!container) return;

    container.innerHTML = `
        <div class="coming-soon">
            Analytics and reporting features coming soon...
        </div>
    `;
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modals = ['provider-modal', 'payer-modal', 'enrollment-modal', 'location-modal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (event.target === modal) {
            modal.classList.remove('active');
        }
    });
}
