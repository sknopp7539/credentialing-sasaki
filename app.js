// ProviderVault - Healthcare Credentialing System

// Disable all console logging to prevent glitches
const originalConsole = { log: console.log, warn: console.warn, error: console.error };
console.log = function() {};
console.warn = function() {};
console.error = function() {};

// Data storage
let providers = [];
let payers = [];
let enrollments = [];
let locations = [];
let contracts = [];
let emailNotifications = [];
let organizations = [];
let claims = [];
let currentOrganization = null;
let currentUser = null;
let selectedProvider = null;
let selectedPayer = null;
let contractIdentifiers = [];
let authorizedOfficials = [];
let dbaNames = [];
let providerLicenses = [];
let providerLocations = [];
let hospitalAffiliations = [];
let credentialingContacts = [];
let liabilityInsurancePolicies = [];
let professionalReferences = [];
let refreshTimer = 20;
let refreshInterval = null;
let currentNotificationFilter = 'all';
let currentClaimFilter = 'all';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadOrganizations();
    loadData();
    loadContracts();
    loadEmailNotifications();
    loadClaims();
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
    // Don't call updateDashboard here - it will be called after organizations are loaded
    // renderProviders() will be called from loadData() after data is loaded
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
    } else if (viewName === 'credentialing') {
        renderCredentialing();
    } else if (viewName === 'payers') {
        renderPayers();
    } else if (viewName === 'enrollments') {
        renderEnrollments();
    } else if (viewName === 'locations') {
        renderLocations();
    } else if (viewName === 'claims') {
        renderClaims();
    } else if (viewName === 'analytics') {
        renderAnalytics();
    } else if (viewName === 'email-notifications') {
        renderEmailNotifications();
        startRefreshTimer();
    } else if (viewName === 'organizations') {
        renderOrganizations();
    }
}

// ===== ORGANIZATIONS =====
function loadOrganizations() {
    const storedOrganizations = localStorage.getItem('pvOrganizations');
    if (storedOrganizations) {
        organizations = JSON.parse(storedOrganizations);
    } else {
        organizations = [
            {
                id: 'ORG-001',
                name: 'Metropolitan Healthcare Group',
                dba: ['City Medical Center', 'Metro Health Services'],
                corporateAddress: {
                    street: '1500 Healthcare Blvd',
                    city: 'New York',
                    state: 'NY',
                    zipCode: '10001'
                },
                mailingAddress: {
                    street: '1500 Healthcare Blvd',
                    city: 'New York',
                    state: 'NY',
                    zipCode: '10001',
                    sameAsCorporate: true
                },
                tin: '12-3456789',
                authorizedOfficials: [
                    {
                        id: 1,
                        name: 'Robert Williams',
                        title: 'Chief Executive Officer',
                        email: 'robert.williams@metrohealthcare.com',
                        phone: '(555) 100-0001'
                    },
                    {
                        id: 2,
                        name: 'Sarah Martinez',
                        title: 'Chief Medical Officer',
                        email: 'sarah.martinez@metrohealthcare.com',
                        phone: '(555) 100-0002'
                    }
                ],
                primaryContact: {
                    name: 'Jennifer Lee',
                    title: 'Director of Operations',
                    email: 'jennifer.lee@metrohealthcare.com',
                    phone: '(555) 100-0010',
                    fax: '(555) 100-0011'
                },
                website: 'https://www.metrohealthcare.com',
                status: 'Active',
                createdAt: '2024-01-15'
            },
            {
                id: 'ORG-002',
                name: 'Coastal Medical Associates',
                dba: ['Coastal Health Clinic'],
                corporateAddress: {
                    street: '2400 Ocean Drive',
                    city: 'Los Angeles',
                    state: 'CA',
                    zipCode: '90001'
                },
                mailingAddress: {
                    street: 'PO Box 5500',
                    city: 'Los Angeles',
                    state: 'CA',
                    zipCode: '90002',
                    sameAsCorporate: false
                },
                tin: '98-7654321',
                authorizedOfficials: [
                    {
                        id: 1,
                        name: 'David Chen',
                        title: 'President',
                        email: 'david.chen@coastalmed.com',
                        phone: '(555) 200-0001'
                    }
                ],
                primaryContact: {
                    name: 'Maria Garcia',
                    title: 'Office Manager',
                    email: 'maria.garcia@coastalmed.com',
                    phone: '(555) 200-0010',
                    fax: '(555) 200-0011'
                },
                website: 'https://www.coastalmed.com',
                status: 'Active',
                createdAt: '2024-02-01'
            },
            {
                id: 'ORG-003',
                name: 'Knopp Medical',
                dba: [],
                corporateAddress: {
                    street: '1200 Medical Park Dr',
                    city: 'Houston',
                    state: 'TX',
                    zipCode: '77002'
                },
                mailingAddress: {
                    street: '1200 Medical Park Dr',
                    city: 'Houston',
                    state: 'TX',
                    zipCode: '77002',
                    sameAsCorporate: true
                },
                tin: '45-6789012',
                authorizedOfficials: [
                    {
                        id: 1,
                        name: 'Stephen Knopp',
                        title: 'Chief Executive Officer',
                        email: 'stephen.knopp@knoppmedical.com',
                        phone: '(555) 300-0001'
                    }
                ],
                primaryContact: {
                    name: 'Stephen Knopp',
                    title: 'CEO',
                    email: 'stephen.knopp@knoppmedical.com',
                    phone: '(555) 300-0010',
                    fax: '(555) 300-0011'
                },
                website: 'https://www.knoppmedical.com',
                status: 'Active',
                createdAt: '2024-03-01'
            }
        ];
        saveOrganizations();
    }

    // Set current organization if not set
    const storedCurrentOrg = localStorage.getItem('pvCurrentOrganization');
    if (storedCurrentOrg) {
        currentOrganization = JSON.parse(storedCurrentOrg);
    } else if (organizations.length > 0) {
        currentOrganization = organizations[0];
        localStorage.setItem('pvCurrentOrganization', JSON.stringify(currentOrganization));
    }

    updateOrganizationDisplay();
    // Dashboard will be updated after data is loaded in loadData()
}

function saveOrganizations() {
    localStorage.setItem('pvOrganizations', JSON.stringify(organizations));
}

function updateOrganizationDisplay() {
    const orgNameElement = document.getElementById('current-org-name');
    if (orgNameElement && currentOrganization) {
        orgNameElement.textContent = currentOrganization.name;
    }
}

function toggleOrgDropdown() {
    const dropdown = document.getElementById('org-dropdown');
    if (dropdown) {
        // Populate dropdown with organizations
        if (dropdown.style.display === 'none') {
            dropdown.innerHTML = organizations.map(org => `
                <div onclick="switchOrganization('${org.id}')"
                     onmouseover="this.style.background='#f8fafc'"
                     onmouseout="this.style.background='${currentOrganization && currentOrganization.id === org.id ? '#f1f5f9' : 'white'}'"
                     style="padding: 0.75rem; cursor: pointer; border-bottom: 1px solid #e2e8f0; ${currentOrganization && currentOrganization.id === org.id ? 'background: #f1f5f9;' : 'background: white;'} transition: background 0.2s;">
                    <div style="font-weight: 500; color: #1e293b; margin-bottom: 0.25rem;">
                        ${org.name}
                        ${currentOrganization && currentOrganization.id === org.id ? '<span style="margin-left: 0.5rem; padding: 0.125rem 0.5rem; font-size: 0.75rem; background: #06b6d4; color: white; border-radius: 9999px;">Current</span>' : ''}
                    </div>
                    <div style="font-size: 0.75rem; color: #64748b;">
                        ${org.corporateAddress.city}, ${org.corporateAddress.state}
                    </div>
                </div>
            `).join('');
        }
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    }
}

function switchOrganization(orgId) {
    const org = organizations.find(o => o.id === orgId);
    if (org) {
        currentOrganization = org;
        console.log('🏢 Switched to organization:', currentOrganization.name, 'ID:', currentOrganization.id);
        localStorage.setItem('pvCurrentOrganization', JSON.stringify(currentOrganization));
        updateOrganizationDisplay();

        // Reload data for new organization based on active view
        const activeView = document.querySelector('.view.active');
        if (activeView) {
            const viewId = activeView.id.replace('-view', '');
            console.log('🏢 Reloading view:', viewId);

            if (viewId === 'dashboard') {
                updateDashboard();
            } else if (viewId === 'providers') {
                renderProviders();
            } else if (viewId === 'credentialing') {
                renderCredentialing();
            } else if (viewId === 'enrollments') {
                renderEnrollments();
            } else if (viewId === 'locations') {
                renderLocations();
            } else if (viewId === 'payers') {
                renderPayers();
            }
        }

        // Close dropdown
        const dropdown = document.getElementById('org-dropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
        }
    }
}

function renderOrganizations() {
    const container = document.getElementById('organizations-list');
    if (!container) return;

    if (organizations.length === 0) {
        container.innerHTML = `
            <div class="coming-soon">
                No organizations found. Click "Add Organization" to get started.
            </div>
        `;
        return;
    }

    container.innerHTML = organizations.map(org => `
        <div class="provider-card" style="cursor: pointer;" onclick="viewOrganizationDetail('${org.id}')">
            <div style="display: flex; align-items: start; justify-between; margin-bottom: 1rem;">
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; flex-wrap: wrap;">
                        <h3 style="font-size: 1.125rem; font-weight: 600; margin: 0;">${org.name}</h3>
                        <span class="status-badge status-${org.status.toLowerCase()}">${org.status}</span>
                        ${currentOrganization && currentOrganization.id === org.id ? '<span style="padding: 0.25rem 0.5rem; font-size: 0.75rem; background: #06b6d4; color: white; border-radius: 9999px; font-weight: 500;">Current</span>' : ''}
                    </div>
                    ${org.dba && org.dba.length > 0 ? `
                        <div style="font-size: 0.875rem; color: #64748b; margin-bottom: 0.5rem;">
                            <strong>DBA:</strong> ${org.dba.join(', ')}
                        </div>
                    ` : ''}
                </div>
            </div>
            <div style="font-size: 0.875rem; color: #64748b; margin-bottom: 0.75rem;">
                <div style="margin-bottom: 0.25rem;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; margin-right: 0.25rem; vertical-align: text-bottom;">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    ${org.corporateAddress.street}, ${org.corporateAddress.city}, ${org.corporateAddress.state} ${org.corporateAddress.zipCode}
                </div>
                <div style="margin-bottom: 0.25rem;">
                    <strong>TIN:</strong> ${org.tin}
                </div>
                <div style="margin-bottom: 0.25rem;">
                    <strong>Authorized Officials:</strong> ${org.authorizedOfficials.length}
                </div>
                <div>
                    <strong>Primary Contact:</strong> ${org.primaryContact.name}
                </div>
            </div>
            <div style="display: flex; gap: 0.5rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e2e8f0;">
                <button class="btn btn-primary btn-small" onclick="event.stopPropagation(); editOrganization('${org.id}')">Edit</button>
                ${currentOrganization && currentOrganization.id !== org.id ? `
                    <button class="btn btn-secondary btn-small" onclick="event.stopPropagation(); switchOrganization('${org.id}')">
                        Switch To
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function viewOrganizationDetail(orgId) {
    alert('Organization detail view coming soon! For now, click Edit to modify the organization.');
}

function showOrganizationModal() {
    document.getElementById('organization-modal-title').textContent = 'Add Organization';
    document.getElementById('organization-form').reset();
    document.getElementById('organization-edit-id').value = '';

    // Reset arrays
    dbaNames = [];
    authorizedOfficials = [];

    // Reset DBA list
    document.getElementById('dba-list').innerHTML = '';

    // Reset Officials list
    document.getElementById('officials-list').innerHTML = '';

    // Reset mailing address checkbox
    document.getElementById('same-as-corporate').checked = true;
    toggleMailingAddress();

    document.getElementById('organization-modal').classList.add('active');
}

function closeOrganizationModal() {
    document.getElementById('organization-modal').classList.remove('active');
}

function addDBA() {
    const id = Date.now();
    const dbaHtml = `
        <div id="dba-${id}" style="display: flex; gap: 0.75rem; align-items: center; margin-bottom: 0.75rem;">
            <input type="text" placeholder="Enter DBA name" class="dba-name" data-id="${id}" style="flex: 1;" />
            <button type="button" onclick="removeDBA(${id})" class="btn-danger btn-small">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
    `;

    document.getElementById('dba-list').insertAdjacentHTML('beforeend', dbaHtml);
    dbaNames.push({ id, name: '' });
}

function removeDBA(id) {
    const element = document.getElementById(`dba-${id}`);
    if (element) {
        element.remove();
        dbaNames = dbaNames.filter(d => d.id !== id);
    }
}

function getDBANames() {
    const dbaInputs = document.querySelectorAll('.dba-name');
    const names = [];
    dbaInputs.forEach(input => {
        if (input.value.trim()) {
            names.push(input.value.trim());
        }
    });
    return names;
}

function addOfficial() {
    const id = Date.now();
    const officialHtml = `
        <div id="official-${id}" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; background: #f8fafc;">
            <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 0.75rem;">
                <h4 style="font-size: 0.938rem; font-weight: 600; margin: 0; flex: 1;">Authorized Official</h4>
                <button type="button" onclick="removeOfficial(${id})" class="btn-danger btn-small">Remove</button>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                    <label>Full Name <span style="color: #ef4444;">*</span></label>
                    <input type="text" class="official-name" data-id="${id}" required />
                </div>
                <div class="form-group">
                    <label>Title <span style="color: #ef4444;">*</span></label>
                    <input type="text" class="official-title" data-id="${id}" required />
                </div>
                <div class="form-group">
                    <label>Email <span style="color: #ef4444;">*</span></label>
                    <input type="email" class="official-email" data-id="${id}" required />
                </div>
                <div class="form-group">
                    <label>Phone <span style="color: #ef4444;">*</span></label>
                    <input type="tel" class="official-phone" data-id="${id}" required />
                </div>
            </div>
        </div>
    `;

    document.getElementById('officials-list').insertAdjacentHTML('beforeend', officialHtml);
    authorizedOfficials.push({ id, name: '', title: '', email: '', phone: '' });
}

function removeOfficial(id) {
    const element = document.getElementById(`official-${id}`);
    if (element) {
        element.remove();
        authorizedOfficials = authorizedOfficials.filter(o => o.id !== id);
    }
}

function getOfficials() {
    const officials = [];
    authorizedOfficials.forEach(official => {
        const nameInput = document.querySelector(`.official-name[data-id="${official.id}"]`);
        const titleInput = document.querySelector(`.official-title[data-id="${official.id}"]`);
        const emailInput = document.querySelector(`.official-email[data-id="${official.id}"]`);
        const phoneInput = document.querySelector(`.official-phone[data-id="${official.id}"]`);

        if (nameInput && titleInput && emailInput && phoneInput) {
            officials.push({
                id: official.id,
                name: nameInput.value,
                title: titleInput.value,
                email: emailInput.value,
                phone: phoneInput.value
            });
        }
    });
    return officials;
}

function toggleMailingAddress() {
    const checkbox = document.getElementById('same-as-corporate');
    const mailingSection = document.getElementById('mailing-address-section');

    if (checkbox.checked) {
        mailingSection.style.display = 'none';
    } else {
        mailingSection.style.display = 'block';
    }
}

function saveOrganization(event) {
    event.preventDefault();

    const id = document.getElementById('organization-edit-id').value;
    const sameAsCorporate = document.getElementById('same-as-corporate').checked;

    const corporateAddress = {
        street: document.getElementById('org-corporate-street').value,
        city: document.getElementById('org-corporate-city').value,
        state: document.getElementById('org-corporate-state').value.toUpperCase(),
        zipCode: document.getElementById('org-corporate-zip').value
    };

    const mailingAddress = sameAsCorporate ?
        { ...corporateAddress, sameAsCorporate: true } :
        {
            street: document.getElementById('org-mailing-street').value,
            city: document.getElementById('org-mailing-city').value,
            state: document.getElementById('org-mailing-state').value.toUpperCase(),
            zipCode: document.getElementById('org-mailing-zip').value,
            sameAsCorporate: false
        };

    const organizationData = {
        id: id || `ORG-${String(organizations.length + 1).padStart(3, '0')}`,
        name: document.getElementById('org-name').value,
        dba: getDBANames(),
        corporateAddress,
        mailingAddress,
        tin: document.getElementById('org-tin').value,
        authorizedOfficials: getOfficials(),
        primaryContact: {
            name: document.getElementById('org-primary-name').value,
            title: document.getElementById('org-primary-title').value,
            email: document.getElementById('org-primary-email').value,
            phone: document.getElementById('org-primary-phone').value,
            fax: document.getElementById('org-primary-fax').value
        },
        website: document.getElementById('org-website').value,
        status: 'Active',
        createdAt: id ? organizations.find(o => o.id === id)?.createdAt : new Date().toISOString().split('T')[0]
    };

    if (id) {
        const index = organizations.findIndex(o => o.id === id);
        if (index !== -1) {
            organizations[index] = organizationData;
        }
    } else {
        organizations.push(organizationData);

        // If this is the first organization, set it as current
        if (organizations.length === 1) {
            currentOrganization = organizationData;
            localStorage.setItem('pvCurrentOrganization', JSON.stringify(currentOrganization));
            updateOrganizationDisplay();
        }
    }

    saveOrganizations();
    renderOrganizations();
    closeOrganizationModal();
}

function editOrganization(id) {
    const org = organizations.find(o => o.id === id);
    if (!org) return;

    document.getElementById('organization-modal-title').textContent = 'Edit Organization';
    document.getElementById('organization-edit-id').value = org.id;
    document.getElementById('org-name').value = org.name;
    document.getElementById('org-tin').value = org.tin;

    // Corporate Address
    document.getElementById('org-corporate-street').value = org.corporateAddress.street;
    document.getElementById('org-corporate-city').value = org.corporateAddress.city;
    document.getElementById('org-corporate-state').value = org.corporateAddress.state;
    document.getElementById('org-corporate-zip').value = org.corporateAddress.zipCode;

    // Mailing Address
    document.getElementById('same-as-corporate').checked = org.mailingAddress.sameAsCorporate;
    if (!org.mailingAddress.sameAsCorporate) {
        document.getElementById('org-mailing-street').value = org.mailingAddress.street;
        document.getElementById('org-mailing-city').value = org.mailingAddress.city;
        document.getElementById('org-mailing-state').value = org.mailingAddress.state;
        document.getElementById('org-mailing-zip').value = org.mailingAddress.zipCode;
    }
    toggleMailingAddress();

    // Primary Contact
    document.getElementById('org-primary-name').value = org.primaryContact.name;
    document.getElementById('org-primary-title').value = org.primaryContact.title;
    document.getElementById('org-primary-email').value = org.primaryContact.email;
    document.getElementById('org-primary-phone').value = org.primaryContact.phone;
    document.getElementById('org-primary-fax').value = org.primaryContact.fax || '';
    document.getElementById('org-website').value = org.website || '';

    // DBA Names
    dbaNames = [];
    document.getElementById('dba-list').innerHTML = '';
    if (org.dba && org.dba.length > 0) {
        org.dba.forEach(name => {
            const id = Date.now() + Math.random();
            dbaNames.push({ id, name });
            const dbaHtml = `
                <div id="dba-${id}" style="display: flex; gap: 0.75rem; align-items: center; margin-bottom: 0.75rem;">
                    <input type="text" placeholder="Enter DBA name" class="dba-name" data-id="${id}" value="${name}" style="flex: 1;" />
                    <button type="button" onclick="removeDBA(${id})" class="btn-danger btn-small">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            `;
            document.getElementById('dba-list').insertAdjacentHTML('beforeend', dbaHtml);
        });
    }

    // Authorized Officials
    authorizedOfficials = [];
    document.getElementById('officials-list').innerHTML = '';
    if (org.authorizedOfficials && org.authorizedOfficials.length > 0) {
        org.authorizedOfficials.forEach(official => {
            const id = official.id || Date.now() + Math.random();
            authorizedOfficials.push({ id, ...official });
            const officialHtml = `
                <div id="official-${id}" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; background: #f8fafc;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                        <h4 style="font-size: 0.938rem; font-weight: 600; margin: 0; flex: 1;">Authorized Official</h4>
                        <button type="button" onclick="removeOfficial(${id})" class="btn-danger btn-small">Remove</button>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div class="form-group">
                            <label>Full Name <span style="color: #ef4444;">*</span></label>
                            <input type="text" class="official-name" data-id="${id}" value="${official.name}" required />
                        </div>
                        <div class="form-group">
                            <label>Title <span style="color: #ef4444;">*</span></label>
                            <input type="text" class="official-title" data-id="${id}" value="${official.title}" required />
                        </div>
                        <div class="form-group">
                            <label>Email <span style="color: #ef4444;">*</span></label>
                            <input type="email" class="official-email" data-id="${id}" value="${official.email}" required />
                        </div>
                        <div class="form-group">
                            <label>Phone <span style="color: #ef4444;">*</span></label>
                            <input type="tel" class="official-phone" data-id="${id}" value="${official.phone}" required />
                        </div>
                    </div>
                </div>
            `;
            document.getElementById('officials-list').insertAdjacentHTML('beforeend', officialHtml);
        });
    }

    document.getElementById('organization-modal').classList.add('active');
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
                organizationId: 'ORG-001',
                firstName: 'Sarah',
                lastName: 'Johnson',
                name: 'Dr. Sarah Johnson',
                specialty: 'Family Medicine',
                npi: '1234567890',
                taxId: '12-3456789',
                email: 'sarah.j@example.com',
                phone: '(555) 123-4567',
                address: '123 Medical Plaza',
                city: 'New York',
                state: 'NY',
                zipCode: '10001',
                status: 'Active',
                licenses: [
                    {
                        name: 'State Medical License (NY)',
                        status: 'active',
                        number: 'NY-12345',
                        issueDate: '12/31/2019',
                        expiration: '12/6/2025',
                        documents: [
                            { name: 'license-scan-sarah-johnson.pdf', expires: '12/6/2025' }
                        ]
                    },
                    {
                        name: 'DEA License (NY)',
                        status: 'active',
                        number: 'DEA-SJ-123456',
                        issueDate: '06/15/2020',
                        expiration: '06/15/2026',
                        documents: []
                    }
                ],
                archivedLicenses: [],
                payerEnrollments: [
                    { name: 'Blue Cross Blue Shield', npi: '1234567890', status: 'Active', expirationStatus: 'Upcoming' },
                    { name: 'Aetna', npi: '1234567890', status: 'Active', expirationStatus: 'Upcoming' },
                    { name: 'Medicare', npi: '1234567890', status: 'Active', expirationStatus: 'Upcoming' }
                ],
                documents: [
                    { id: 1, name: 'Malpractice Insurance', type: 'Insurance', expiration: '12/31/2025', uploaded: '01/15/2024', status: 'Valid' },
                    { id: 2, name: 'Board Certification', type: 'Certificate', expiration: '06/30/2026', uploaded: '02/20/2024', status: 'Valid' }
                ],
                archivedDocuments: []
            },
            {
                id: 'PROV-002',
                organizationId: 'ORG-001',
                firstName: 'Michael',
                lastName: 'Chen',
                name: 'Dr. Michael Chen',
                specialty: 'Cardiology',
                npi: '9876543210',
                taxId: '98-7654321',
                email: 'michael.c@example.com',
                phone: '(555) 987-6543',
                address: '456 Healthcare Ave',
                city: 'Los Angeles',
                state: 'CA',
                zipCode: '90001',
                status: 'Active',
                licenses: [
                    {
                        name: 'State Medical License (CA)',
                        status: 'active',
                        number: 'CA-12345',
                        issueDate: '12/31/2019',
                        expiration: '12/6/2025',
                        documents: [
                            { name: 'license-scan-michael-chen.pdf', expires: '12/6/2025' }
                        ]
                    },
                    {
                        name: 'State Medical License (TX)',
                        status: 'active',
                        number: 'TX-67890',
                        issueDate: '5/31/2020',
                        expiration: '1/5/2026',
                        documents: [
                            { name: 'license-scan-tx.pdf', expires: '1/5/2026' }
                        ]
                    },
                    {
                        name: 'DEA License (CA)',
                        status: 'active',
                        number: 'DEA-TEST-123456',
                        issueDate: '03/15/2021',
                        expiration: '12/30/2026',
                        documents: []
                    }
                ],
                archivedLicenses: [
                    {
                        name: 'State Medical License (FL)',
                        status: 'expired',
                        number: 'FL-54321',
                        issueDate: '06/15/2018',
                        expiration: '06/15/2023',
                        archivedDate: '06/16/2023',
                        documents: [
                            { name: 'license-scan-fl-expired.pdf', expires: '06/15/2023' }
                        ]
                    }
                ],
                payerEnrollments: [
                    { name: 'Blue Cross Blue Shield', npi: '9876543210', status: 'Active', expirationStatus: 'Upcoming' },
                    { name: 'Aetna', npi: '9876543210', status: 'Med Exp', expirationStatus: 'Urgent' },
                    { name: 'Medicare', npi: '9876543210', status: 'Active', expirationStatus: 'Upcoming' },
                    { name: 'Humana', npi: '9876543210', status: 'Expt Soon', expirationStatus: 'Warning' },
                    { name: 'United Healthcare', npi: '9876543210', status: 'Active', expirationStatus: 'Upcoming' },
                    { name: 'Cigna', npi: '9876543210', status: 'Active', expirationStatus: 'Upcoming' }
                ],
                documents: [
                    { id: 1, name: 'Malpractice Insurance', type: 'Insurance', expiration: '12/31/2025', uploaded: '01/15/2024', status: 'Valid' },
                    { id: 2, name: 'Board Certification - Cardiology', type: 'Certificate', expiration: '06/30/2026', uploaded: '02/20/2024', status: 'Valid' },
                    { id: 3, name: 'CPR Certification', type: 'Certificate', expiration: '03/15/2025', uploaded: '03/10/2024', status: 'Valid' }
                ],
                archivedDocuments: [
                    { id: 4, name: 'DEA Certificate (Expired)', type: 'License', expiration: '03/15/2023', uploaded: '01/10/2023', archivedDate: '03/16/2023' },
                    { id: 5, name: 'Board Certification (Old)', type: 'Certificate', expiration: '12/31/2022', uploaded: '01/05/2022', archivedDate: '01/01/2023' }
                ]
            },
            {
                id: 'PROV-003',
                organizationId: 'ORG-002',
                firstName: 'Emily',
                lastName: 'Davis',
                name: 'Dr. Emily Davis',
                specialty: 'Pediatrics',
                npi: '5555555555',
                taxId: '55-5555555',
                email: 'emily.d@example.com',
                phone: '(555) 555-5555',
                address: '789 Children Hospital Rd',
                city: 'Chicago',
                state: 'IL',
                zipCode: '60601',
                status: 'Pending',
                licenses: [
                    {
                        name: 'State Medical License (IL)',
                        status: 'pending',
                        number: 'IL-99999',
                        issueDate: '10/01/2024',
                        expiration: '10/01/2026',
                        documents: []
                    }
                ],
                archivedLicenses: [],
                payerEnrollments: [
                    { name: 'Blue Cross Blue Shield', npi: '5555555555', status: 'Pending', expirationStatus: 'Pending' },
                    { name: 'Medicare', npi: '5555555555', status: 'Pending', expirationStatus: 'Pending' }
                ],
                documents: [
                    { id: 1, name: 'Malpractice Insurance', type: 'Insurance', expiration: '12/31/2025', uploaded: '09/15/2024', status: 'Valid' }
                ],
                archivedDocuments: []
            },
            {
                id: 'PROV-004',
                organizationId: 'ORG-003',
                firstName: 'James',
                lastName: 'Williams',
                name: 'Dr. James Williams',
                specialty: 'Internal Medicine',
                npi: '6666666666',
                taxId: '66-6666666',
                email: 'james.w@knoppmedical.com',
                phone: '(555) 666-6666',
                address: '1200 Medical Park Dr',
                city: 'Houston',
                state: 'TX',
                zipCode: '77002',
                status: 'Active',
                licenses: [
                    {
                        name: 'State Medical License (TX)',
                        state: 'TX',
                        status: 'active',
                        number: 'TX-88888',
                        issueDate: '01/15/2020',
                        expiration: '01/15/2026',
                        documents: [
                            { name: 'license-scan-james-williams.pdf', expires: '01/15/2026' }
                        ]
                    }
                ],
                archivedLicenses: [],
                liabilityInsurance: [
                    {
                        carrier: 'Medical Protective',
                        policyNumber: 'MP-123456',
                        effectiveDate: '2024-01-01',
                        expirationDate: '2025-01-01',
                        coverageAmount: '1000000/3000000'
                    }
                ],
                payerEnrollments: [
                    { name: 'Medicare', npi: '6666666666', status: 'Active', expirationStatus: 'Current' },
                    { name: 'Blue Cross Blue Shield', npi: '6666666666', status: 'Active', expirationStatus: 'Current' }
                ],
                documents: [
                    { id: 1, name: 'Malpractice Insurance', type: 'Insurance', expiration: '01/01/2025', uploaded: '01/01/2024', status: 'Valid' },
                    { id: 2, name: 'Board Certification', type: 'Certificate', expiration: '06/30/2026', uploaded: '01/15/2024', status: 'Valid' }
                ],
                archivedDocuments: []
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
            },
            {
                id: 'ENR-003',
                providerId: 'PROV-004',
                payerId: 'PAY-003',
                applicationDate: '2024-03-01',
                status: 'Approved'
            },
            {
                id: 'ENR-004',
                providerId: 'PROV-004',
                payerId: 'PAY-001',
                applicationDate: '2024-03-01',
                status: 'Approved'
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
                npi: '9876543210',
                taxId: '12-3456789',
                address: '123 Hospital Blvd',
                city: 'New York',
                state: 'NY',
                zipCode: '10001',
                phone: '555-2001',
                fax: '555-2002',
                email: 'info@mainmedical.com',
                website: 'https://www.mainmedical.com',
                status: 'Active'
            },
            {
                id: 'LOC-002',
                name: 'Downtown Clinic',
                type: 'Clinic',
                npi: '9876543211',
                taxId: '12-3456790',
                address: '456 Medical Ave',
                city: 'Los Angeles',
                state: 'CA',
                zipCode: '90001',
                phone: '555-2003',
                fax: '555-2004',
                email: 'contact@downtownclinic.com',
                website: 'https://www.downtownclinic.com',
                status: 'Active'
            },
            {
                id: 'LOC-003',
                name: 'Westside Medical Office',
                type: 'Office',
                npi: '9876543212',
                taxId: '12-3456791',
                address: '789 Health St',
                city: 'Chicago',
                state: 'IL',
                zipCode: '60601',
                phone: '555-2005',
                fax: '555-2006',
                email: 'info@westside-medical.com',
                website: 'https://www.westside-medical.com',
                status: 'Active'
            }
        ];
        saveLocations();
    }

    // Validate data integrity after loading
    validateDataIntegrity();

    // Render views after data is loaded (if user is logged in and main app is visible)
    if (currentUser && document.getElementById('main-app').style.display !== 'none') {
        updateDashboard();  // Update dashboard with loaded data
        renderProviders();  // Render providers list
    }
}

// Validate data integrity - check for providers without organizationId
function validateDataIntegrity() {
    // Check providers
    const providersWithoutOrg = providers.filter(p => !p.organizationId);
    if (providersWithoutOrg.length > 0) {
        console.warn('⚠️ Found providers without organizationId:', providersWithoutOrg.map(p => `${p.firstName} ${p.lastName}`).join(', '));

        // Alert the user
        alert(`⚠️ DATA INTEGRITY ISSUE DETECTED!\n\nFound ${providersWithoutOrg.length} provider(s) without organization assignment:\n${providersWithoutOrg.map(p => `• ${p.firstName} ${p.lastName}`).join('\n')}\n\nThis is a security issue. These providers will not appear in enrollment dropdowns until they are assigned to an organization.\n\nPlease edit each provider and ensure they are assigned to the correct organization.`);
    }

    // Check for invalid organizationIds
    const validOrgIds = organizations.map(o => o.id);
    const providersWithInvalidOrg = providers.filter(p =>
        p.organizationId && !validOrgIds.includes(p.organizationId)
    );

    if (providersWithInvalidOrg.length > 0) {
        console.warn('⚠️ Found providers with invalid organizationId:', providersWithInvalidOrg.map(p => `${p.firstName} ${p.lastName} (${p.organizationId})`).join(', '));
        alert(`⚠️ DATA INTEGRITY ISSUE DETECTED!\n\nFound ${providersWithInvalidOrg.length} provider(s) assigned to non-existent organizations:\n${providersWithInvalidOrg.map(p => `• ${p.firstName} ${p.lastName} (Org: ${p.organizationId})`).join('\n')}\n\nThese providers need to be reassigned to valid organizations.`);
    }

    // Only log if there are issues
    if (providersWithoutOrg.length > 0 || providersWithInvalidOrg.length > 0) {
        console.log('Data validation complete. Issues found and reported above.');
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
    console.log('📊 Updating dashboard...');
    console.log('   Current Organization:', currentOrganization ? `${currentOrganization.name} (ID: ${currentOrganization.id})` : 'None');

    // Filter data by current organization
    const orgProviders = currentOrganization ?
        providers.filter(p => p.organizationId === currentOrganization.id) :
        providers;

    const orgEnrollments = currentOrganization ?
        enrollments.filter(e => {
            const provider = providers.find(p => p.id === e.providerId);
            return provider && provider.organizationId === currentOrganization.id;
        }) :
        enrollments;

    // Filter claims by current organization
    const orgClaims = currentOrganization ?
        claims.filter(c => c.organizationId === currentOrganization.id) :
        claims;

    const openClaims = orgClaims.filter(c => c.status === 'open').length;

    console.log('   Providers in org:', orgProviders.length);
    console.log('   Enrollments in org:', orgEnrollments.length);
    console.log('   Open claims in org:', openClaims);

    // Update stats
    document.getElementById('total-providers').textContent = orgProviders.length;
    document.getElementById('total-enrollments').textContent = orgEnrollments.length;
    document.getElementById('pending-credentialing').textContent =
        orgProviders.filter(p => p.status === 'Pending').length;
    document.getElementById('open-claims').textContent = openClaims;

    // Populate expirations table
    renderExpirationsTable();

    // Populate recent claims widget
    renderRecentClaimsWidget(orgClaims);
}

function renderRecentClaimsWidget(orgClaims) {
    const widget = document.getElementById('recent-claims-widget');
    if (!widget) return;

    console.log('📊 Rendering recent claims widget...');
    console.log('   Claims in org:', orgClaims.length);

    // Get the 3 most recent claims
    const recentClaims = orgClaims
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3);

    if (recentClaims.length === 0) {
        widget.innerHTML = `
            <p style="text-align: center; padding: 1.5rem; color: #94a3b8; font-size: 0.875rem;">
                ${currentOrganization ?
                    `No claims found for ${currentOrganization.name}.` :
                    'No claims found. Select an organization to view claims.'}
            </p>
        `;
        return;
    }

    widget.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            ${recentClaims.map(claim => {
                const provider = providers.find(p => p.id === claim.providerId);
                const providerName = provider ?
                    `${provider.firstName || ''} ${provider.lastName || ''}`.trim() || provider.name || 'Unknown' :
                    'Unknown Provider';

                const statusColors = {
                    'open': { bg: '#fee2e2', text: '#991b1b' },
                    'pending': { bg: '#fef3c7', text: '#92400e' },
                    'settled': { bg: '#d1fae5', text: '#065f46' },
                    'closed': { bg: '#e0e7ff', text: '#3730a3' }
                };
                const colors = statusColors[claim.status] || { bg: '#f1f5f9', text: '#475569' };

                return `
                    <div style="padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; background: #fafafa; transition: all 0.2s; cursor: pointer;"
                         onclick="showView('claims')"
                         onmouseover="this.style.background='#f1f5f9'; this.style.borderColor='#cbd5e1';"
                         onmouseout="this.style.background='#fafafa'; this.style.borderColor='#e2e8f0';">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                            <div style="font-weight: 600; font-size: 0.875rem; color: #1e293b;">${claim.claimId}</div>
                            <span style="padding: 0.125rem 0.5rem; font-size: 0.75rem; border-radius: 9999px; font-weight: 500; background: ${colors.bg}; color: ${colors.text};">
                                ${claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                            </span>
                        </div>
                        <div style="font-size: 0.875rem; color: #64748b; margin-bottom: 0.25rem;">
                            Provider: <span style="color: #1e293b; font-weight: 500;">${providerName}</span>
                        </div>
                        <div style="font-size: 0.75rem; color: #94a3b8;">
                            Incident: ${claim.incidentDate ? new Date(claim.incidentDate).toLocaleDateString() : 'N/A'}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function renderExpirationsTable() {
    const tbody = document.getElementById('expirations-tbody');
    if (!tbody) return;

    console.log('📅 Rendering expirations table...');
    console.log('   Current Organization:', currentOrganization ? `${currentOrganization.name} (ID: ${currentOrganization.id})` : 'None');

    // Filter providers by current organization
    const orgProviders = currentOrganization ?
        providers.filter(p => p.organizationId === currentOrganization.id) :
        providers;

    console.log('   Providers in current org:', orgProviders.length);

    // Collect all expirations from providers
    const expirations = [];
    const today = new Date();

    orgProviders.forEach(provider => {
        const providerName = `${provider.firstName || ''} ${provider.lastName || ''}`.trim() || provider.name || 'Unknown Provider';
        const providerSpecialty = provider.specialty || 'N/A';

        // Extract license expirations
        if (provider.licenses && Array.isArray(provider.licenses)) {
            provider.licenses.forEach(license => {
                if (license.expiration) {
                    const expirationDate = new Date(license.expiration);
                    const daysUntil = Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24));

                    let status, expiresIn;
                    if (daysUntil < 0) {
                        status = 'Expired';
                        expiresIn = 'Overdue';
                    } else if (daysUntil <= 30) {
                        status = 'Urgent';
                        expiresIn = `${daysUntil} days`;
                    } else if (daysUntil <= 60) {
                        status = 'Warning';
                        expiresIn = `${daysUntil} days`;
                    } else {
                        status = 'Upcoming';
                        expiresIn = `${daysUntil} days`;
                    }

                    expirations.push({
                        provider: providerName,
                        specialty: providerSpecialty,
                        document: license.name || `State License (${license.state})`,
                        category: 'License',
                        expiresIn,
                        daysUntil,
                        dueDate: new Date(license.expiration).toLocaleDateString(),
                        status
                    });
                }
            });
        }

        // Extract liability insurance expirations
        if (provider.liabilityInsurance && Array.isArray(provider.liabilityInsurance)) {
            provider.liabilityInsurance.forEach(insurance => {
                if (insurance.expirationDate) {
                    const expirationDate = new Date(insurance.expirationDate);
                    const daysUntil = Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24));

                    let status, expiresIn;
                    if (daysUntil < 0) {
                        status = 'Expired';
                        expiresIn = 'Overdue';
                    } else if (daysUntil <= 30) {
                        status = 'Urgent';
                        expiresIn = `${daysUntil} days`;
                    } else if (daysUntil <= 60) {
                        status = 'Warning';
                        expiresIn = `${daysUntil} days`;
                    } else {
                        status = 'Upcoming';
                        expiresIn = `${daysUntil} days`;
                    }

                    expirations.push({
                        provider: providerName,
                        specialty: providerSpecialty,
                        document: `Malpractice Insurance (${insurance.carrier || 'Unknown'})`,
                        category: 'Insurance',
                        expiresIn,
                        daysUntil,
                        dueDate: new Date(insurance.expirationDate).toLocaleDateString(),
                        status
                    });
                }
            });
        }
    });

    // Sort by days until expiration (most urgent first)
    expirations.sort((a, b) => a.daysUntil - b.daysUntil);

    console.log('   Total expirations found:', expirations.length);

    if (expirations.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 3rem; color: #94a3b8;">
                    ${currentOrganization ?
                        `No upcoming expirations found for ${currentOrganization.name}. Add providers with licenses to track expirations.` :
                        'No upcoming expirations found. Select an organization and add providers with licenses to track expirations.'}
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = expirations.map(item => `
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
                    <button class="btn btn-primary btn-small">Renew</button>
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

    console.log('👨‍⚕️ Rendering providers...');
    console.log('   Current Organization:', currentOrganization ? `${currentOrganization.name} (ID: ${currentOrganization.id})` : 'None');
    console.log('   Total providers in database:', providers.length);

    // Log all providers with their organization IDs
    providers.forEach(p => {
        console.log(`   - ${p.name || p.firstName + ' ' + p.lastName}: orgId=${p.organizationId}`);
    });

    // Filter providers by current organization
    const orgProviders = currentOrganization ?
        providers.filter(p => p.organizationId === currentOrganization.id) :
        providers;

    console.log('   Filtered providers for current org:', orgProviders.length);
    orgProviders.forEach(p => {
        console.log(`   ✓ ${p.name || p.firstName + ' ' + p.lastName}`);
    });

    if (orgProviders.length === 0) {
        container.innerHTML = `
            <div class="coming-soon">
                ${currentOrganization ?
                    `No providers found for ${currentOrganization.name}. Click "Add Provider" to get started.` :
                    'No providers found. Click "Add Provider" to get started.'}
            </div>
        `;
        return;
    }

    container.innerHTML = orgProviders.map(provider => {
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

// ===== CREDENTIALING VIEW =====
function renderCredentialing() {
    const container = document.getElementById('credentialing-view');
    if (!container) return;

    console.log('📋 Rendering credentialing view...');
    console.log('   Current Organization:', currentOrganization ? `${currentOrganization.name} (ID: ${currentOrganization.id})` : 'None');

    // Filter providers by current organization
    const orgProviders = currentOrganization ?
        providers.filter(p => p.organizationId === currentOrganization.id) :
        providers;

    console.log('   Filtered providers for credentialing:', orgProviders.length);

    if (orgProviders.length === 0) {
        container.innerHTML = `
            <div class="page-header">
                <h1>Credentialing</h1>
            </div>
            <div class="coming-soon">
                ${currentOrganization ?
                    `No providers found for ${currentOrganization.name}. Add providers to begin credentialing tracking.` :
                    'No providers found. Select an organization and add providers to begin.'}
            </div>
        `;
        return;
    }

    // Render credentialing view with provider cards
    container.innerHTML = `
        <div class="page-header">
            <h1>Credentialing</h1>
            <p style="color: #64748b; margin-top: 0.5rem;">Track provider credentialing status${currentOrganization ? ` for ${currentOrganization.name}` : ''}</p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem; padding: 1.5rem;">
            ${orgProviders.map(provider => renderCredentialingCard(provider)).join('')}
        </div>
    `;
}

function renderCredentialingCard(provider) {
    // Calculate credentialing completion stats
    const licenses = provider.licenses || [];
    const hospitalAffiliations = provider.hospitalAffiliations || [];
    const liabilityInsurance = provider.liabilityInsurance || [];
    const professionalReferences = provider.professionalReferences || [];
    const credentialingContacts = provider.credentialingContacts || [];
    const practiceLocations = provider.practiceLocations || [];

    // Count completed items
    let completedItems = 0;
    let totalItems = 14; // Total checklist items

    // Check what's completed
    if (licenses.length > 0) completedItems++;
    if (provider.npi) completedItems++;
    if (provider.specialty) completedItems++;
    if (hospitalAffiliations.length > 0) completedItems++;
    if (liabilityInsurance.length > 0) completedItems++;
    if (professionalReferences.length > 0) completedItems++;
    if (credentialingContacts.length > 0) completedItems++;
    if (practiceLocations.length > 0) completedItems++;
    if (provider.hireDate) completedItems++;
    if (provider.employmentStatus) completedItems++;

    const completionPercentage = Math.round((completedItems / totalItems) * 100);

    // Determine status color
    let statusColor = '#ef4444'; // red
    let statusText = 'Not Started';
    if (completionPercentage > 0 && completionPercentage < 50) {
        statusColor = '#f59e0b'; // amber
        statusText = 'In Progress';
    } else if (completionPercentage >= 50 && completionPercentage < 100) {
        statusColor = '#3b82f6'; // blue
        statusText = 'In Progress';
    } else if (completionPercentage === 100) {
        statusColor = '#10b981'; // green
        statusText = 'Complete';
    }

    return `
        <div class="provider-card" onclick="viewProviderDetail('${provider.id}')" style="cursor: pointer;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                <div>
                    <h3 style="margin: 0; font-size: 1.125rem; color: #1e293b;">${provider.name || `Dr. ${provider.firstName} ${provider.lastName}`}</h3>
                    <div style="color: #64748b; font-size: 0.875rem; margin-top: 0.25rem;">${provider.specialty}</div>
                    <div style="color: #94a3b8; font-size: 0.75rem; margin-top: 0.25rem;">NPI: ${provider.npi}</div>
                </div>
                <span style="padding: 0.375rem 0.75rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; background: ${statusColor}20; color: ${statusColor};">
                    ${statusText}
                </span>
            </div>

            <!-- Progress Bar -->
            <div style="margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <span style="font-size: 0.75rem; font-weight: 600; color: #64748b;">CREDENTIALING PROGRESS</span>
                    <span style="font-size: 0.75rem; font-weight: 600; color: ${statusColor};">${completionPercentage}%</span>
                </div>
                <div style="width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                    <div style="width: ${completionPercentage}%; height: 100%; background: ${statusColor}; transition: width 0.3s ease;"></div>
                </div>
            </div>

            <!-- Credentialing Items Summary -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; font-size: 0.875rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="color: ${licenses.length > 0 ? '#10b981' : '#94a3b8'};">
                        ${licenses.length > 0 ? '✓' : '○'}
                    </span>
                    <span style="color: #64748b;">State Licenses (${licenses.length})</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="color: ${liabilityInsurance.length > 0 ? '#10b981' : '#94a3b8'};">
                        ${liabilityInsurance.length > 0 ? '✓' : '○'}
                    </span>
                    <span style="color: #64748b;">Liability Insurance</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="color: ${hospitalAffiliations.length > 0 ? '#10b981' : '#94a3b8'};">
                        ${hospitalAffiliations.length > 0 ? '✓' : '○'}
                    </span>
                    <span style="color: #64748b;">Hospital Privileges</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="color: ${professionalReferences.length > 0 ? '#10b981' : '#94a3b8'};">
                        ${professionalReferences.length > 0 ? '✓' : '○'}
                    </span>
                    <span style="color: #64748b;">References (${professionalReferences.length})</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="color: ${practiceLocations.length > 0 ? '#10b981' : '#94a3b8'};">
                        ${practiceLocations.length > 0 ? '✓' : '○'}
                    </span>
                    <span style="color: #64748b;">Practice Locations</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="color: ${credentialingContacts.length > 0 ? '#10b981' : '#94a3b8'};">
                        ${credentialingContacts.length > 0 ? '✓' : '○'}
                    </span>
                    <span style="color: #64748b;">Contacts (${credentialingContacts.length})</span>
                </div>
            </div>

            <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e2e8f0;">
                <button class="btn btn-primary btn-small" onclick="event.stopPropagation(); editProvider('${provider.id}')" style="width: 100%;">
                    View Details & Update
                </button>
            </div>
        </div>
    `;
}

function viewProviderDetail(providerId) {
    selectedProvider = providers.find(p => p.id === providerId);
    if (!selectedProvider) return;

    const detailView = document.getElementById('provider-detail-view');

    // Initialize expandable sections state if not exists
    if (!selectedProvider.expandedSections) {
        selectedProvider.expandedSections = {
            stateLicenses: true,
            providerLocations: false,
            employment: false,
            education: false,
            hospitalAffiliations: false,
            credentialingContacts: false,
            professionalLiability: false,
            professionalReferences: false,
            disclosures: false,
            payerEnrollments: false,
            credentialDocuments: false,
            archivedDocuments: false
        };
    }

    const licenses = selectedProvider.licenses || [];
    const archivedLicenses = selectedProvider.archivedLicenses || [];
    const payerEnrollments = selectedProvider.payerEnrollments || [];
    const documents = selectedProvider.documents || [];
    const archivedDocuments = selectedProvider.archivedDocuments || [];

    // Extract comprehensive credentialing data
    const practiceLocations = selectedProvider.practiceLocations || [];
    const hospitalAffiliations = selectedProvider.hospitalAffiliations || [];
    const credentialingContacts = selectedProvider.credentialingContacts || [];
    const liabilityInsurance = selectedProvider.liabilityInsurance || [];
    const professionalReferences = selectedProvider.professionalReferences || [];
    const disclosures = selectedProvider.disclosures || {};
    const hireDate = selectedProvider.hireDate || '';
    const employmentStatus = selectedProvider.employmentStatus || '';
    const employmentNotes = selectedProvider.employmentNotes || '';

    detailView.innerHTML = `
        <!-- Sticky Header -->
        <div style="background: white; border-bottom: 1px solid #e2e8f0; padding: 1.5rem; position: sticky; top: 0; z-index: 10;">
            <div class="detail-header" style="margin-bottom: 1rem;">
                <button class="back-btn" onclick="closeProviderDetail()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    Back to Providers
                </button>
            </div>
            <div style="display: flex; align-items: center; justify-between;">
                <div>
                    <h1 style="font-size: 1.75rem; font-weight: 700; margin-bottom: 0.25rem; color: #1e293b;">${selectedProvider.name}</h1>
                    <p style="color: #64748b; font-size: 1.125rem;">${selectedProvider.specialty}</p>
                </div>
                <span class="status-badge status-${selectedProvider.status.toLowerCase()}" style="padding: 0.5rem 1rem; font-size: 0.875rem;">
                    ${selectedProvider.status}
                </span>
            </div>
        </div>

        <div class="detail-content" style="padding: 1.5rem;">
            <!-- Fixed Information Cards Grid -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                <!-- Contact Information Card -->
                <div class="info-card" style="background: white; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 1.5rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #475569;">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        <h2 style="font-size: 1rem; font-weight: 600; color: #1e293b;">Contact Information</h2>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; color: #475569;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #94a3b8;">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                            <span style="font-size: 0.875rem;">${selectedProvider.email}</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.5rem; color: #475569;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #94a3b8;">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                            </svg>
                            <span style="font-size: 0.875rem;">${selectedProvider.phone}</span>
                        </div>
                        ${selectedProvider.address ? `
                        <div style="display: flex; align-items: start; gap: 0.5rem; color: #475569;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #94a3b8; margin-top: 2px;">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            <div style="font-size: 0.875rem;">
                                <div>${selectedProvider.address}</div>
                                <div>${selectedProvider.city}, ${selectedProvider.state} ${selectedProvider.zipCode}</div>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                </div>

                <!-- Professional Information Card -->
                <div class="info-card" style="background: white; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 1.5rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #475569;">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                        <h2 style="font-size: 1rem; font-weight: 600; color: #1e293b;">Professional Information</h2>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                        <div>
                            <div style="font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">NPI Number</div>
                            <div style="font-size: 0.875rem; color: #1e293b; font-weight: 500; margin-top: 0.25rem;">${selectedProvider.npi}</div>
                        </div>
                        ${selectedProvider.taxId ? `
                        <div>
                            <div style="font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Tax ID</div>
                            <div style="font-size: 0.875rem; color: #1e293b; font-weight: 500; margin-top: 0.25rem;">${selectedProvider.taxId}</div>
                        </div>
                        ` : ''}
                        <div>
                            <div style="font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Specialty</div>
                            <div style="font-size: 0.875rem; color: #1e293b; font-weight: 500; margin-top: 0.25rem;">${selectedProvider.specialty}</div>
                        </div>
                    </div>
                </div>
            </div>

            ${renderExpandableSection('stateLicenses', 'State Licenses', licenses.length, `
                ${licenses.length > 0 ? licenses.map((license, idx) => renderLicenseCard(license, idx, false)).join('') : `
                    <div style="text-align: center; padding: 3rem; color: #94a3b8;">
                        <div style="width: 64px; height: 64px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-center; margin: 0 auto 1rem;">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #94a3b8;">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                        </div>
                        <p style="margin-bottom: 0.5rem; font-weight: 500;">No licenses found</p>
                        <p style="font-size: 0.875rem;">Add state medical licenses, DEA licenses, or other credentials.</p>
                    </div>
                `}
            `, 'Add License')}

            ${renderExpandableSection('payerEnrollments', 'Payer Enrollments', payerEnrollments.length, `
                ${payerEnrollments.length > 0 ? payerEnrollments.map((payer, idx) => renderPayerRow(payer, idx + 1)).join('') : `
                    <div style="text-align: center; padding: 3rem; color: #94a3b8;">
                        <p style="margin-bottom: 0.5rem; font-weight: 500;">No payer enrollments found</p>
                        <p style="font-size: 0.875rem;">Add insurance payer enrollments for this provider.</p>
                    </div>
                `}
            `, 'Add Enrollment')}

            ${renderExpandableSection('credentialDocuments', 'Credential Documents', documents.length, `
                ${documents.length > 0 ? documents.map(doc => renderDocumentRow(doc)).join('') : `
                    <div style="text-align: center; padding: 3rem; color: #94a3b8;">
                        <div style="width: 64px; height: 64px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content; margin: 0 auto 1rem;">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #94a3b8;">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                        </div>
                        <p style="margin-bottom: 0.5rem; font-weight: 500;">No documents found</p>
                        <p style="font-size: 0.875rem;">Upload credential documents, certificates, or insurance policies.</p>
                    </div>
                `}
            `, 'Upload Document')}

            <!-- Employment Information Section -->
            ${hireDate || employmentStatus || employmentNotes ? `
                <div class="section-card" style="background: white; border-radius: 12px; border: 1px solid #e2e8f0; padding: 1.5rem; margin-bottom: 1.5rem;">
                    <h3 style="font-size: 1rem; font-weight: 600; color: #1e293b; margin-bottom: 1rem;">Employment Information</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        ${hireDate ? `
                            <div>
                                <div style="font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Hire Date</div>
                                <div style="font-size: 0.875rem; color: #1e293b; font-weight: 500; margin-top: 0.25rem;">${hireDate}</div>
                            </div>
                        ` : ''}
                        ${employmentStatus ? `
                            <div>
                                <div style="font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Employment Status</div>
                                <div style="font-size: 0.875rem; color: #1e293b; font-weight: 500; margin-top: 0.25rem;">${employmentStatus}</div>
                            </div>
                        ` : ''}
                    </div>
                    ${employmentNotes ? `
                        <div style="margin-top: 1rem;">
                            <div style="font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Notes</div>
                            <div style="font-size: 0.875rem; color: #475569; margin-top: 0.25rem;">${employmentNotes}</div>
                        </div>
                    ` : ''}
                </div>
            ` : ''}

            <!-- Practice Locations Section -->
            ${renderExpandableSection('providerLocations', 'Practice Locations', practiceLocations.length, `
                ${practiceLocations.length > 0 ? practiceLocations.map(loc => {
                    const location = locations.find(l => l.id === loc.locationId);
                    if (!location) return '';
                    return `
                        <div style="padding: 1rem; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 0.75rem; background: #f8fafc;">
                            <div style="display: flex; align-items: start; gap: 0.75rem;">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #475569; margin-top: 2px;">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                                <div style="flex: 1;">
                                    <div style="font-weight: 600; color: #1e293b; margin-bottom: 0.25rem;">${location.name}</div>
                                    <div style="font-size: 0.875rem; color: #64748b;">${location.address}</div>
                                    <div style="font-size: 0.875rem; color: #64748b;">${location.city}, ${location.state} ${location.zipCode}</div>
                                    ${location.phone ? `<div style="font-size: 0.875rem; color: #64748b; margin-top: 0.25rem;">${location.phone}</div>` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('') : `
                    <div style="text-align: center; padding: 3rem; color: #94a3b8;">
                        <div style="width: 64px; height: 64px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #94a3b8;">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                        </div>
                        <p style="margin-bottom: 0.5rem; font-weight: 500;">No locations found</p>
                        <p style="font-size: 0.875rem;">Assign this provider to practice locations.</p>
                    </div>
                `}
            `, 'Add Location')}

            <!-- Hospital Affiliations Section -->
            ${renderExpandableSection('hospitalAffiliations', 'Hospital Affiliations & Privileges', hospitalAffiliations.length, `
                ${hospitalAffiliations.length > 0 ? hospitalAffiliations.map(affiliation => `
                    <div style="padding: 1rem; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 0.75rem; background: #f8fafc;">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                            <div style="font-weight: 600; color: #1e293b;">${affiliation.hospital}</div>
                            <span class="status-badge status-${affiliation.status.toLowerCase()}" style="font-size: 0.75rem; padding: 0.25rem 0.75rem;">
                                ${affiliation.status}
                            </span>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.875rem; color: #64748b;">
                            ${affiliation.privilegeType ? `<div><strong>Privilege:</strong> ${affiliation.privilegeType}</div>` : ''}
                            ${affiliation.department ? `<div><strong>Department:</strong> ${affiliation.department}</div>` : ''}
                            ${affiliation.startDate ? `<div><strong>Start Date:</strong> ${affiliation.startDate}</div>` : ''}
                        </div>
                    </div>
                `).join('') : `
                    <div style="text-align: center; padding: 3rem; color: #94a3b8;">
                        <p style="margin-bottom: 0.5rem; font-weight: 500;">No hospital affiliations found</p>
                        <p style="font-size: 0.875rem;">Add hospital affiliations and clinical privileges.</p>
                    </div>
                `}
            `, 'Add Affiliation')}

            <!-- Credentialing Contacts Section -->
            ${renderExpandableSection('credentialingContacts', 'Credentialing Contacts', credentialingContacts.length, `
                ${credentialingContacts.length > 0 ? credentialingContacts.map(contact => `
                    <div style="padding: 1rem; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 0.75rem; background: #f8fafc;">
                        <div style="font-weight: 600; color: #1e293b; margin-bottom: 0.5rem;">${contact.name}</div>
                        <div style="font-size: 0.875rem; color: #64748b; margin-bottom: 0.25rem;">${contact.organization}</div>
                        <div style="display: flex; gap: 1rem; font-size: 0.875rem; color: #64748b;">
                            ${contact.phone ? `<div><strong>Phone:</strong> ${contact.phone}</div>` : ''}
                            ${contact.email ? `<div><strong>Email:</strong> ${contact.email}</div>` : ''}
                        </div>
                    </div>
                `).join('') : `
                    <div style="text-align: center; padding: 3rem; color: #94a3b8;">
                        <p style="margin-bottom: 0.5rem; font-weight: 500;">No credentialing contacts found</p>
                        <p style="font-size: 0.875rem;">Add contacts for credentialing coordination.</p>
                    </div>
                `}
            `, 'Add Contact')}

            <!-- Professional Liability Insurance Section -->
            ${renderExpandableSection('professionalLiability', 'Professional Liability Insurance', liabilityInsurance.length, `
                ${liabilityInsurance.length > 0 ? liabilityInsurance.map(policy => `
                    <div style="padding: 1rem; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 0.75rem; background: #f8fafc;">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                            <div>
                                <div style="font-weight: 600; color: #1e293b;">${policy.carrier}</div>
                                <div style="font-size: 0.875rem; color: #64748b; margin-top: 0.25rem;">Policy #: ${policy.policyNumber}</div>
                            </div>
                            ${policy.coverageAmount ? `
                                <div style="font-weight: 600; color: #10b981;">$${policy.coverageAmount}</div>
                            ` : ''}
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem; font-size: 0.875rem; color: #64748b;">
                            ${policy.policyType ? `<div><strong>Type:</strong> ${policy.policyType}</div>` : ''}
                            ${policy.effectiveDate ? `<div><strong>Effective:</strong> ${policy.effectiveDate}</div>` : ''}
                            ${policy.expirationDate ? `<div><strong>Expires:</strong> ${policy.expirationDate}</div>` : ''}
                        </div>
                    </div>
                `).join('') : `
                    <div style="text-align: center; padding: 3rem; color: #94a3b8;">
                        <p style="margin-bottom: 0.5rem; font-weight: 500;">No liability insurance found</p>
                        <p style="font-size: 0.875rem;">Add professional liability insurance policies.</p>
                    </div>
                `}
            `, 'Add Policy')}

            <!-- Professional References Section -->
            ${renderExpandableSection('professionalReferences', 'Professional References', professionalReferences.length, `
                ${professionalReferences.length > 0 ? professionalReferences.map(reference => `
                    <div style="padding: 1rem; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 0.75rem; background: #f8fafc;">
                        <div style="font-weight: 600; color: #1e293b; margin-bottom: 0.25rem;">${reference.name}</div>
                        <div style="font-size: 0.875rem; color: #64748b; margin-bottom: 0.5rem;">
                            ${reference.title ? `${reference.title}` : ''}
                            ${reference.title && reference.organization ? ' at ' : ''}
                            ${reference.organization ? `${reference.organization}` : ''}
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem; font-size: 0.875rem; color: #64748b;">
                            ${reference.relationship ? `<div><strong>Relationship:</strong> ${reference.relationship}</div>` : ''}
                            ${reference.phone ? `<div><strong>Phone:</strong> ${reference.phone}</div>` : ''}
                            ${reference.email ? `<div><strong>Email:</strong> ${reference.email}</div>` : ''}
                        </div>
                    </div>
                `).join('') : `
                    <div style="text-align: center; padding: 3rem; color: #94a3b8;">
                        <p style="margin-bottom: 0.5rem; font-weight: 500;">No professional references found</p>
                        <p style="font-size: 0.875rem;">Add professional references for this provider.</p>
                    </div>
                `}
            `, 'Add Reference')}

            <!-- Disclosures & Attestations Section -->
            ${(disclosures.sanctionsDisclosed || disclosures.malpracticeDisclosed || disclosures.felonyDisclosed || disclosures.disclosureNotes) ? `
                <div class="section-card" style="background: white; border-radius: 12px; border: 1px solid #e2e8f0; padding: 1.5rem; margin-bottom: 1.5rem;">
                    <h3 style="font-size: 1rem; font-weight: 600; color: #1e293b; margin-bottom: 1rem;">Disclosures & Attestations</h3>
                    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                        ${disclosures.sanctionsDisclosed ? `
                            <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; background: #fef2f2; border: 1px solid #fee2e2; border-radius: 6px;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #dc2626;">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                                <span style="font-size: 0.875rem; color: #991b1b;">Sanctions or disciplinary actions disclosed</span>
                            </div>
                        ` : ''}
                        ${disclosures.malpracticeDisclosed ? `
                            <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; background: #fef2f2; border: 1px solid #fee2e2; border-radius: 6px;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #dc2626;">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                                <span style="font-size: 0.875rem; color: #991b1b;">Malpractice claims disclosed</span>
                            </div>
                        ` : ''}
                        ${disclosures.felonyDisclosed ? `
                            <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; background: #fef2f2; border: 1px solid #fee2e2; border-radius: 6px;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #dc2626;">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                                <span style="font-size: 0.875rem; color: #991b1b;">Felony convictions disclosed</span>
                            </div>
                        ` : ''}
                        ${disclosures.disclosureNotes ? `
                            <div style="margin-top: 0.5rem;">
                                <div style="font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem;">Disclosure Details</div>
                                <div style="font-size: 0.875rem; color: #475569; padding: 0.75rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">${disclosures.disclosureNotes}</div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            ` : ''}

            <!-- CRITICAL: Archived Documents Section -->
            ${renderArchivedDocumentsSection(archivedLicenses, archivedDocuments)}
        </div>
    `;

    // Show detail view
    document.getElementById('providers-view').classList.remove('active');
    detailView.classList.add('active');
}

// Helper function to render expandable sections
function renderExpandableSection(sectionKey, title, count, content, actionButtonText) {
    const isExpanded = selectedProvider.expandedSections[sectionKey];

    return `
        <div style="background: white; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1rem;">
            <button
                onclick="toggleProviderSection('${sectionKey}')"
                style="width: 100%; padding: 1rem; display: flex; align-items: center; justify-between; background: none; border: none; cursor: pointer; transition: background 0.2s;"
                onmouseover="this.style.background='#f8fafc'"
                onmouseout="this.style.background='none'"
            >
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #475569;">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                    <h2 style="font-size: 1rem; font-weight: 600; color: #1e293b; margin: 0;">${title}${count > 0 ? ` (${count})` : ''}</h2>
                </div>
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    ${actionButtonText ? `
                        <button
                            onclick="event.stopPropagation(); alert('${actionButtonText} functionality coming soon')"
                            style="padding: 0.375rem 0.75rem; font-size: 0.875rem; font-weight: 500; color: #2563eb; background: none; border: none; border-radius: 6px; cursor: pointer;"
                            onmouseover="this.style.background='#eff6ff'"
                            onmouseout="this.style.background='none'"
                        >
                            ${actionButtonText}
                        </button>
                    ` : ''}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #94a3b8; transition: transform 0.2s; transform: rotate(${isExpanded ? '90' : '0'}deg);">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </div>
            </button>
            ${isExpanded ? `
                <div style="padding: 1rem; border-top: 1px solid #e2e8f0;">
                    ${content}
                </div>
            ` : ''}
        </div>
    `;
}

// Helper function to render license card
function renderLicenseCard(license, index, isArchived) {
    return `
        <div style="border-radius: 8px; padding: 1rem; margin-bottom: 0.75rem; border: 1px solid ${isArchived ? '#d1d5db' : '#e2e8f0'}; background: ${isArchived ? '#f3f4f6' : '#f8fafc'};">
            <div style="display: flex; align-items: start; justify-between; margin-bottom: 0.75rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                    <h4 style="font-size: 0.938rem; font-weight: 500; color: #1e293b; margin: 0;">${license.name}</h4>
                    <span style="padding: 0.125rem 0.5rem; font-size: 0.75rem; font-weight: 500; border-radius: 9999px; ${
                        isArchived ? 'background: #9ca3af; color: white;' :
                        license.status === 'active' ? 'background: #2563eb; color: white;' :
                        'background: #f59e0b; color: white;'
                    }">
                        ${isArchived ? 'archived' : license.status}
                    </span>
                    ${isArchived && license.archivedDate ? `
                        <span style="font-size: 0.75rem; color: #6b7280;">Archived: ${license.archivedDate}</span>
                    ` : ''}
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    ${!isArchived ? `
                        <button style="font-size: 0.875rem; color: #2563eb; background: none; border: none; cursor: pointer; font-weight: 500;" onmouseover="this.style.color='#1e40af'" onmouseout="this.style.color='#2563eb'">Edit</button>
                        <button onclick="archiveLicense('${selectedProvider.id}', ${index})" style="font-size: 0.875rem; color: #ea580c; background: none; border: none; cursor: pointer; font-weight: 500;" onmouseover="this.style.color='#c2410c'" onmouseout="this.style.color='#ea580c'">Archive</button>
                    ` : `
                        <button onclick="restoreLicense('${selectedProvider.id}', ${index})" style="font-size: 0.875rem; color: #2563eb; background: none; border: none; cursor: pointer; font-weight: 500;" onmouseover="this.style.color='#1e40af'" onmouseout="this.style.color='#2563eb'">Restore</button>
                    `}
                </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 0.75rem;">
                <div>
                    <span style="font-size: 0.875rem; color: #64748b;">License Number: </span>
                    <span style="font-size: 0.875rem; color: #1e293b; font-weight: 500;">${license.number}</span>
                </div>
                ${license.issueDate ? `
                <div>
                    <span style="font-size: 0.875rem; color: #64748b;">Issue Date: </span>
                    <span style="font-size: 0.875rem; color: #1e293b; font-weight: 500;">${license.issueDate}</span>
                </div>
                ` : ''}
            </div>
            <div style="margin-bottom: 0.75rem;">
                <span style="font-size: 0.875rem; color: #64748b;">Expiration: </span>
                <span style="font-size: 0.875rem; font-weight: 500; color: ${isArchived ? '#dc2626' : '#1e293b'};">
                    ${license.expiration}${isArchived ? ' (Expired)' : ''}
                </span>
            </div>
            ${license.documents && license.documents.length > 0 ? `
                <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid #e2e8f0;">
                    <div style="font-size: 0.875rem; color: #475569; font-weight: 500; margin-bottom: 0.5rem;">Associated Documents:</div>
                    ${license.documents.map(doc => `
                        <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; margin-bottom: 0.25rem;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #94a3b8;">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            <a href="#" style="color: #2563eb; text-decoration: none;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">${doc.name}</a>
                            <span style="color: #64748b;">• Expires: ${doc.expires}</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `;
}

// Helper function to render payer row
function renderPayerRow(payer, index) {
    return `
        <div style="display: flex; align-items: center; justify-between; padding: 0.75rem 0; border-bottom: 1px solid #f1f5f9;">
            <div style="display: flex; align-items: center; gap: 0.75rem; flex: 1;">
                <div style="width: 32px; height: 32px; background: #f1f5f9; border-radius: 6px; display: flex; align-items: center; justify-center; color: #64748b; font-weight: 500; font-size: 0.875rem;">
                    ${index}
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: 500; color: #1e293b; font-size: 0.938rem;">${payer.name}</div>
                    <div style="font-size: 0.813rem; color: #64748b;">${payer.npi}</div>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div style="font-size: 0.875rem;">
                    <span style="color: #64748b;">Expt:</span>
                    <span style="font-weight: 500; color: ${
                        payer.status === 'Med Exp' ? '#dc2626' :
                        payer.status === 'Expt Soon' ? '#ea580c' :
                        '#475569'
                    };">${payer.status}</span>
                </div>
                <span style="padding: 0.25rem 0.75rem; font-size: 0.75rem; font-weight: 500; border-radius: 9999px; ${
                    payer.expirationStatus === 'Upcoming' ? 'background: #d1fae5; color: #065f46;' :
                    payer.expirationStatus === 'Urgent' ? 'background: #fee2e2; color: #991b1b;' :
                    payer.expirationStatus === 'Warning' ? 'background: #fed7aa; color: #9a3412;' :
                    'background: #f1f5f9; color: #475569;'
                }">
                    ${payer.expirationStatus}
                </span>
                <button style="padding: 0.25rem 0.75rem; font-size: 0.75rem; font-weight: 500; color: #2563eb; border: 1px solid #2563eb; background: none; border-radius: 6px; cursor: pointer;" onmouseover="this.style.background='#eff6ff'" onmouseout="this.style.background='none'">
                    View Details
                </button>
            </div>
        </div>
    `;
}

// Helper function to render document row
function renderDocumentRow(doc) {
    return `
        <div style="display: flex; align-items: center; justify-between; padding: 0.75rem 0; border-bottom: 1px solid #f1f5f9;">
            <div style="display: flex; align-items: center; gap: 0.75rem; flex: 1;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #94a3b8;">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                <div style="flex: 1;">
                    <div style="font-weight: 500; color: #1e293b; font-size: 0.938rem;">${doc.name}</div>
                    <div style="font-size: 0.813rem; color: #64748b;">${doc.type}</div>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="text-align: right;">
                    <div style="font-size: 0.875rem; font-weight: 500; color: #475569;">Exp: ${doc.expiration}</div>
                    <div style="font-size: 0.75rem; color: #94a3b8;">${doc.uploaded}</div>
                </div>
                <span style="padding: 0.25rem 0.5rem; font-size: 0.75rem; font-weight: 500; border-radius: 9999px; ${
                    doc.status === 'Valid' ? 'background: #d1fae5; color: #065f46;' : 'background: #fee2e2; color: #991b1b;'
                }">
                    ${doc.status}
                </span>
                <div style="display: flex; align-items: center; gap: 0.25rem;">
                    <button style="padding: 0.25rem; background: none; border: none; border-radius: 4px; cursor: pointer;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='none'" title="View">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #64748b;">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                    <button style="padding: 0.25rem; background: none; border: none; border-radius: 4px; cursor: pointer;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='none'" title="Download">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #64748b;">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Helper function to render archived documents section
function renderArchivedDocumentsSection(archivedLicenses, archivedDocuments) {
    const totalArchived = archivedLicenses.length + archivedDocuments.length;
    const isExpanded = selectedProvider.expandedSections['archivedDocuments'];

    return `
        <div style="background: white; border-radius: 12px; border: 1px solid #fed7aa; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1rem;">
            <button
                onclick="toggleProviderSection('archivedDocuments')"
                style="width: 100%; padding: 1rem; display: flex; align-items: center; justify-between; background: none; border: none; cursor: pointer; transition: background 0.2s;"
                onmouseover="this.style.background='#ffedd5'"
                onmouseout="this.style.background='none'"
            >
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #ea580c;">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                        <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                    <h2 style="font-size: 1rem; font-weight: 600; color: #1e293b; margin: 0;">Archived Documents (${totalArchived})</h2>
                    <span style="font-size: 0.75rem; color: #ea580c; font-weight: 500;">• Documents are never deleted, only archived</span>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #94a3b8; transition: transform 0.2s; transform: rotate(${isExpanded ? '90' : '0'}deg);">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </button>
            ${isExpanded ? `
                <div style="padding: 1rem; border-top: 1px solid #fed7aa; background: #fff7ed;">
                    <!-- Info Banner -->
                    <div style="margin-bottom: 1rem; padding: 0.75rem; background: #fed7aa; border: 1px solid #fdba74; border-radius: 8px;">
                        <div style="display: flex; align-items: start; gap: 0.5rem;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #c2410c; flex-shrink: 0; margin-top: 2px;">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="16" x2="12" y2="12"></line>
                                <line x1="12" y1="8" x2="12.01" y2="8"></line>
                            </svg>
                            <div style="font-size: 0.875rem; color: #9a3412;">
                                <p style="font-weight: 500; margin-bottom: 0.25rem;">About Archived Documents</p>
                                <p style="margin: 0;">Documents are automatically moved here when they expire or are manually archived. Archived items are preserved permanently and can be restored at any time.</p>
                            </div>
                        </div>
                    </div>

                    ${archivedLicenses.length > 0 ? `
                        <div style="margin-bottom: 1.5rem;">
                            <h3 style="font-size: 0.875rem; font-weight: 600; color: #475569; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                </svg>
                                Archived Licenses
                            </h3>
                            ${archivedLicenses.map((license, idx) => renderLicenseCard(license, idx, true)).join('')}
                        </div>
                    ` : ''}

                    ${archivedDocuments.length > 0 ? `
                        <div>
                            <h3 style="font-size: 0.875rem; font-weight: 600; color: #475569; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                </svg>
                                Archived Credential Documents
                            </h3>
                            ${archivedDocuments.map(doc => renderArchivedDocumentRow(doc)).join('')}
                        </div>
                    ` : ''}

                    ${totalArchived === 0 ? `
                        <div style="text-align: center; padding: 2rem; color: #94a3b8;">
                            <p>No archived documents yet.</p>
                        </div>
                    ` : ''}
                </div>
            ` : ''}
        </div>
    `;
}

// Helper function to render archived document row
function renderArchivedDocumentRow(doc) {
    return `
        <div style="display: flex; align-items: center; justify-between; padding: 0.75rem; border-bottom: 1px solid #f1f5f9; background: #f9fafb; border-radius: 6px; margin-bottom: 0.5rem;">
            <div style="display: flex; align-items: center; gap: 0.75rem; flex: 1;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #94a3b8;">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                <div style="flex: 1;">
                    <div style="font-weight: 500; color: #1e293b; font-size: 0.938rem;">${doc.name}</div>
                    <div style="font-size: 0.813rem; color: #64748b;">${doc.type} • Archived: ${doc.archivedDate}</div>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="text-align: right;">
                    <div style="font-size: 0.875rem; font-weight: 500; color: #dc2626;">Expired: ${doc.expiration}</div>
                    <div style="font-size: 0.75rem; color: #94a3b8;">Originally uploaded: ${doc.uploaded}</div>
                </div>
                <span style="padding: 0.25rem 0.5rem; font-size: 0.75rem; font-weight: 500; border-radius: 9999px; background: #9ca3af; color: white;">
                    Archived
                </span>
                <div style="display: flex; align-items: center; gap: 0.25rem;">
                    <button style="padding: 0.25rem; background: none; border: none; border-radius: 4px; cursor: pointer;" onmouseover="this.style.background='#e5e7eb'" onmouseout="this.style.background='none'" title="View">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #64748b;">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                    <button style="padding: 0.25rem; background: none; border: none; border-radius: 4px; cursor: pointer;" onmouseover="this.style.background='#e5e7eb'" onmouseout="this.style.background='none'" title="Download">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #64748b;">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                    </button>
                    <button onclick="restoreDocument('${selectedProvider.id}', ${doc.id})" style="padding: 0.25rem; background: none; border: none; border-radius: 4px; cursor: pointer;" onmouseover="this.style.background='#dbeafe'" onmouseout="this.style.background='none'" title="Restore">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #2563eb; transform: rotate(180deg);">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Toggle provider section
function toggleProviderSection(sectionKey) {
    if (selectedProvider && selectedProvider.expandedSections) {
        selectedProvider.expandedSections[sectionKey] = !selectedProvider.expandedSections[sectionKey];
        viewProviderDetail(selectedProvider.id);
    }
}

// Archive license function
function archiveLicense(providerId, licenseIndex) {
    if (confirm('Are you sure you want to archive this license? It will be moved to archived documents and can be restored later.')) {
        const provider = providers.find(p => p.id === providerId);
        if (provider && provider.licenses && provider.licenses[licenseIndex]) {
            const license = provider.licenses[licenseIndex];
            license.archivedDate = new Date().toISOString().split('T')[0];

            if (!provider.archivedLicenses) {
                provider.archivedLicenses = [];
            }
            provider.archivedLicenses.push(license);
            provider.licenses.splice(licenseIndex, 1);

            saveProviders();
            viewProviderDetail(providerId);
        }
    }
}

// Restore license function
function restoreLicense(providerId, licenseIndex) {
    if (confirm('Are you sure you want to restore this license?')) {
        const provider = providers.find(p => p.id === providerId);
        if (provider && provider.archivedLicenses && provider.archivedLicenses[licenseIndex]) {
            const license = provider.archivedLicenses[licenseIndex];
            delete license.archivedDate;
            license.status = 'active';

            if (!provider.licenses) {
                provider.licenses = [];
            }
            provider.licenses.push(license);
            provider.archivedLicenses.splice(licenseIndex, 1);

            saveProviders();
            viewProviderDetail(providerId);
        }
    }
}

// Restore document function
function restoreDocument(providerId, documentId) {
    if (confirm('Are you sure you want to restore this document?')) {
        const provider = providers.find(p => p.id === providerId);
        if (provider && provider.archivedDocuments) {
            const docIndex = provider.archivedDocuments.findIndex(d => d.id === documentId);
            if (docIndex !== -1) {
                const document = provider.archivedDocuments[docIndex];
                delete document.archivedDate;
                document.status = 'Valid';

                if (!provider.documents) {
                    provider.documents = [];
                }
                provider.documents.push(document);
                provider.archivedDocuments.splice(docIndex, 1);

                saveProviders();
                viewProviderDetail(providerId);
            }
        }
    }
}

function closeProviderDetail() {
    document.getElementById('provider-detail-view').classList.remove('active');
    document.getElementById('providers-view').classList.add('active');
    selectedProvider = null;
}

// Provider License Management
function addProviderLicense() {
    const list = document.getElementById('provider-licenses-list');
    const id = Date.now();

    const licenseHtml = `
        <div id="license-${id}" style="padding: 1rem; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 0.75rem; background: #f8fafc;">
            <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 0.75rem;">
                <h4 style="font-size: 0.9375rem; font-weight: 600; color: #1e293b; margin: 0;">License #${providerLicenses.length + 1}</h4>
                <button type="button" onclick="removeProviderLicense(${id})" class="btn-danger btn-small" style="margin-left: auto;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    Remove
                </button>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                <div class="form-group">
                    <label style="font-size: 0.875rem; font-weight: 500; color: #64748b;">State</label>
                    <input type="text" class="license-state" data-id="${id}" placeholder="e.g., NY" maxlength="2" style="text-transform: uppercase; padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px;" />
                </div>
                <div class="form-group">
                    <label style="font-size: 0.875rem; font-weight: 500; color: #64748b;">License Number</label>
                    <input type="text" class="license-number" data-id="${id}" placeholder="License number" style="padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px;" />
                </div>
                <div class="form-group">
                    <label style="font-size: 0.875rem; font-weight: 500; color: #64748b;">Issue Date</label>
                    <input type="date" class="license-issue-date" data-id="${id}" style="padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px;" />
                </div>
                <div class="form-group">
                    <label style="font-size: 0.875rem; font-weight: 500; color: #64748b;">Expiration Date</label>
                    <input type="date" class="license-expiration-date" data-id="${id}" style="padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px;" />
                </div>
                <div class="form-group">
                    <label style="font-size: 0.875rem; font-weight: 500; color: #64748b;">Status</label>
                    <select class="license-status" data-id="${id}" style="padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px;">
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="expired">Expired</option>
                    </select>
                </div>
                <div class="form-group">
                    <label style="font-size: 0.875rem; font-weight: 500; color: #64748b;">Upload License Document</label>
                    <input type="file" class="license-document" data-id="${id}" accept=".pdf,.jpg,.jpeg,.png" style="padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.875rem;" />
                </div>
            </div>
        </div>
    `;

    if (providerLicenses.length === 0) {
        list.innerHTML = licenseHtml;
    } else {
        list.insertAdjacentHTML('beforeend', licenseHtml);
    }

    providerLicenses.push({ id, state: '', licenseNumber: '', issueDate: '', expirationDate: '', status: 'active', document: null });
}

function removeProviderLicense(id) {
    const element = document.getElementById(`license-${id}`);
    if (element) {
        element.remove();
    }
    providerLicenses = providerLicenses.filter(item => item.id !== id);

    if (providerLicenses.length === 0) {
        const list = document.getElementById('provider-licenses-list');
        list.innerHTML = `
            <p style="text-align: center; padding: 1.5rem; color: #94a3b8; font-size: 0.875rem; border: 1px dashed #e2e8f0; border-radius: 8px;">
                No licenses added. Click "Add License" to add state medical licenses.
            </p>
        `;
    }
}

function getProviderLicenses() {
    return providerLicenses.map(license => {
        const state = document.querySelector(`.license-state[data-id="${license.id}"]`)?.value || '';
        const licenseNumber = document.querySelector(`.license-number[data-id="${license.id}"]`)?.value || '';
        const issueDate = document.querySelector(`.license-issue-date[data-id="${license.id}"]`)?.value || '';
        const expirationDate = document.querySelector(`.license-expiration-date[data-id="${license.id}"]`)?.value || '';
        const status = document.querySelector(`.license-status[data-id="${license.id}"]`)?.value || 'active';
        const documentInput = document.querySelector(`.license-document[data-id="${license.id}"]`);
        const document = documentInput?.files?.[0]?.name || null;

        return {
            id: license.id,
            name: `State Medical License (${state})`,
            state,
            number: licenseNumber,
            issueDate,
            expiration: expirationDate,
            status,
            documents: document ? [{ name: document, expires: expirationDate }] : []
        };
    });
}

// Provider Location Management
function addProviderLocation() {
    const list = document.getElementById('provider-locations-list');
    const id = Date.now();

    // Get locations for current organization
    const orgLocations = currentOrganization ?
        locations.filter(loc => loc.organizationId === currentOrganization.id) :
        locations;

    if (orgLocations.length === 0) {
        alert('No locations found for this organization. Please add locations first.');
        return;
    }

    const locationHtml = `
        <div id="provider-location-${id}" style="padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 0.75rem; background: white; display: flex; gap: 0.75rem; align-items: center;">
            <select class="provider-location-select" data-id="${id}" style="flex: 1; padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px;">
                <option value="">Select Location</option>
                ${orgLocations.map(loc => `<option value="${loc.id}">${loc.name} - ${loc.city}, ${loc.state}</option>`).join('')}
            </select>
            <button type="button" onclick="removeProviderLocation(${id})" class="btn-danger btn-small">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
    `;

    if (providerLocations.length === 0) {
        list.innerHTML = locationHtml;
    } else {
        list.insertAdjacentHTML('beforeend', locationHtml);
    }

    providerLocations.push({ id, locationId: '' });
}

function removeProviderLocation(id) {
    const element = document.getElementById(`provider-location-${id}`);
    if (element) {
        element.remove();
    }
    providerLocations = providerLocations.filter(item => item.id !== id);

    if (providerLocations.length === 0) {
        const list = document.getElementById('provider-locations-list');
        list.innerHTML = `
            <p style="text-align: center; padding: 1.5rem; color: #94a3b8; font-size: 0.875rem; border: 1px dashed #e2e8f0; border-radius: 8px;">
                No practice locations assigned. Click "Add Location" to assign this provider to locations.
            </p>
        `;
    }
}

function getProviderLocations() {
    return providerLocations.map(loc => {
        const locationId = document.querySelector(`.provider-location-select[data-id="${loc.id}"]`)?.value || '';
        const location = locations.find(l => l.id === locationId);
        return {
            locationId,
            locationName: location?.name || '',
            isPrimary: false // Could add radio buttons to set primary location
        };
    }).filter(loc => loc.locationId); // Only return locations that were actually selected
}

// Hospital Affiliations Management
function addHospitalAffiliation() {
    const list = document.getElementById('hospital-affiliations-list');
    const id = Date.now();

    const affiliationHtml = `
        <div id="affiliation-${id}" style="padding: 1rem; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 0.75rem; background: #f8fafc;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                <h4 style="font-size: 0.9375rem; font-weight: 600; color: #1e293b; margin: 0;">Affiliation #${hospitalAffiliations.length + 1}</h4>
                <button type="button" onclick="removeHospitalAffiliation(${id})" class="btn-danger btn-small">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    Remove
                </button>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                <div class="form-group" style="grid-column: span 2;">
                    <label style="font-size: 0.875rem; font-weight: 500; color: #64748b;">Hospital Name</label>
                    <input type="text" class="affiliation-hospital" data-id="${id}" placeholder="e.g., Memorial Hospital" style="padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px;" />
                </div>
                <div class="form-group">
                    <label style="font-size: 0.875rem; font-weight: 500; color: #64748b;">Privilege Type</label>
                    <select class="affiliation-type" data-id="${id}" style="padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px;">
                        <option value="Admitting">Admitting Privileges</option>
                        <option value="Consulting">Consulting Privileges</option>
                        <option value="Courtesy">Courtesy Privileges</option>
                        <option value="Active Staff">Active Staff</option>
                    </select>
                </div>
                <div class="form-group">
                    <label style="font-size: 0.875rem; font-weight: 500; color: #64748b;">Department</label>
                    <input type="text" class="affiliation-department" data-id="${id}" placeholder="e.g., Cardiology" style="padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px;" />
                </div>
                <div class="form-group">
                    <label style="font-size: 0.875rem; font-weight: 500; color: #64748b;">Start Date</label>
                    <input type="date" class="affiliation-start" data-id="${id}" style="padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px;" />
                </div>
                <div class="form-group">
                    <label style="font-size: 0.875rem; font-weight: 500; color: #64748b;">Status</label>
                    <select class="affiliation-status" data-id="${id}" style="padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px;">
                        <option value="Active">Active</option>
                        <option value="Pending">Pending</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>
            </div>
        </div>
    `;

    if (hospitalAffiliations.length === 0) {
        list.innerHTML = affiliationHtml;
    } else {
        list.insertAdjacentHTML('beforeend', affiliationHtml);
    }

    hospitalAffiliations.push({ id });
}

function removeHospitalAffiliation(id) {
    document.getElementById(`affiliation-${id}`)?.remove();
    hospitalAffiliations = hospitalAffiliations.filter(item => item.id !== id);

    if (hospitalAffiliations.length === 0) {
        document.getElementById('hospital-affiliations-list').innerHTML = `
            <p style="text-align: center; padding: 1.5rem; color: #94a3b8; font-size: 0.875rem; border: 1px dashed #e2e8f0; border-radius: 8px;">
                No hospital affiliations added. Click "Add Affiliation" to track hospital privileges.
            </p>
        `;
    }
}

function getHospitalAffiliations() {
    return hospitalAffiliations.map(aff => ({
        hospitalName: document.querySelector(`.affiliation-hospital[data-id="${aff.id}"]`)?.value || '',
        privilegeType: document.querySelector(`.affiliation-type[data-id="${aff.id}"]`)?.value || 'Admitting',
        department: document.querySelector(`.affiliation-department[data-id="${aff.id}"]`)?.value || '',
        startDate: document.querySelector(`.affiliation-start[data-id="${aff.id}"]`)?.value || '',
        status: document.querySelector(`.affiliation-status[data-id="${aff.id}"]`)?.value || 'Active'
    })).filter(aff => aff.hospitalName);
}

// Credentialing Contacts Management
function addCredentialingContact() {
    const list = document.getElementById('credentialing-contacts-list');
    const id = Date.now();

    const contactHtml = `
        <div id="cred-contact-${id}" style="padding: 1rem; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 0.75rem; background: #f8fafc;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                <h4 style="font-size: 0.9375rem; font-weight: 600; color: #1e293b; margin: 0;">Contact #${credentialingContacts.length + 1}</h4>
                <button type="button" onclick="removeCredentialingContact(${id})" class="btn-danger btn-small">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    Remove
                </button>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                <div class="form-group">
                    <label style="font-size: 0.875rem; font-weight: 500; color: #64748b;">Organization</label>
                    <input type="text" class="contact-org" data-id="${id}" placeholder="e.g., State Medical Board" style="padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px;" />
                </div>
                <div class="form-group">
                    <label style="font-size: 0.875rem; font-weight: 500; color: #64748b;">Contact Name</label>
                    <input type="text" class="contact-name" data-id="${id}" placeholder="Contact person" style="padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px;" />
                </div>
                <div class="form-group">
                    <label style="font-size: 0.875rem; font-weight: 500; color: #64748b;">Phone</label>
                    <input type="tel" class="contact-phone" data-id="${id}" placeholder="Phone number" style="padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px;" />
                </div>
                <div class="form-group">
                    <label style="font-size: 0.875rem; font-weight: 500; color: #64748b;">Email</label>
                    <input type="email" class="contact-email" data-id="${id}" placeholder="Email address" style="padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px;" />
                </div>
            </div>
        </div>
    `;

    if (credentialingContacts.length === 0) {
        list.innerHTML = contactHtml;
    } else {
        list.insertAdjacentHTML('beforeend', contactHtml);
    }

    credentialingContacts.push({ id });
}

function removeCredentialingContact(id) {
    document.getElementById(`cred-contact-${id}`)?.remove();
    credentialingContacts = credentialingContacts.filter(item => item.id !== id);

    if (credentialingContacts.length === 0) {
        document.getElementById('credentialing-contacts-list').innerHTML = `
            <p style="text-align: center; padding: 1.5rem; color: #94a3b8; font-size: 0.875rem; border: 1px dashed #e2e8f0; border-radius: 8px;">
                No credentialing contacts added. Click "Add Contact" to add primary source verification contacts.
            </p>
        `;
    }
}

function getCredentialingContacts() {
    return credentialingContacts.map(contact => ({
        organization: document.querySelector(`.contact-org[data-id="${contact.id}"]`)?.value || '',
        contactName: document.querySelector(`.contact-name[data-id="${contact.id}"]`)?.value || '',
        phone: document.querySelector(`.contact-phone[data-id="${contact.id}"]`)?.value || '',
        email: document.querySelector(`.contact-email[data-id="${contact.id}"]`)?.value || ''
    })).filter(c => c.organization);
}

// Professional Liability Insurance Management
function addLiabilityInsurance() {
    const list = document.getElementById('liability-insurance-list');
    const id = Date.now();

    const policyHtml = `
        <div id="policy-${id}" style="padding: 1rem; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 0.75rem; background: #f8fafc;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                <h4 style="font-size: 0.9375rem; font-weight: 600; color: #1e293b; margin: 0;">Policy #${liabilityInsurancePolicies.length + 1}</h4>
                <button type="button" onclick="removeLiabilityInsurance(${id})" class="btn-danger btn-small">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    Remove
                </button>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                <div class="form-group">
                    <label style="font-size: 0.875rem; font-weight: 500; color: #64748b;">Insurance Carrier</label>
                    <input type="text" class="policy-carrier" data-id="${id}" placeholder="e.g., ABC Insurance Co." style="padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px;" />
                </div>
                <div class="form-group">
                    <label style="font-size: 0.875rem; font-weight: 500; color: #64748b;">Policy Number</label>
                    <input type="text" class="policy-number" data-id="${id}" placeholder="Policy #" style="padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px;" />
                </div>
                <div class="form-group">
                    <label style="font-size: 0.875rem; font-weight: 500; color: #64748b;">Coverage Amount</label>
                    <input type="text" class="policy-coverage" data-id="${id}" placeholder="e.g., $1M/$3M" style="padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px;" />
                </div>
                <div class="form-group">
                    <label style="font-size: 0.875rem; font-weight: 500; color: #64748b;">Policy Type</label>
                    <select class="policy-type" data-id="${id}" style="padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px;">
                        <option value="Claims-Made">Claims-Made</option>
                        <option value="Occurrence">Occurrence</option>
                    </select>
                </div>
                <div class="form-group">
                    <label style="font-size: 0.875rem; font-weight: 500; color: #64748b;">Effective Date</label>
                    <input type="date" class="policy-effective" data-id="${id}" style="padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px;" />
                </div>
                <div class="form-group">
                    <label style="font-size: 0.875rem; font-weight: 500; color: #64748b;">Expiration Date</label>
                    <input type="date" class="policy-expiration" data-id="${id}" style="padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px;" />
                </div>
            </div>
        </div>
    `;

    if (liabilityInsurancePolicies.length === 0) {
        list.innerHTML = policyHtml;
    } else {
        list.insertAdjacentHTML('beforeend', policyHtml);
    }

    liabilityInsurancePolicies.push({ id });
}

function removeLiabilityInsurance(id) {
    document.getElementById(`policy-${id}`)?.remove();
    liabilityInsurancePolicies = liabilityInsurancePolicies.filter(item => item.id !== id);

    if (liabilityInsurancePolicies.length === 0) {
        document.getElementById('liability-insurance-list').innerHTML = `
            <p style="text-align: center; padding: 1.5rem; color: #94a3b8; font-size: 0.875rem; border: 1px dashed #e2e8f0; border-radius: 8px;">
                No liability insurance policies added. Click "Add Policy" to track malpractice coverage.
            </p>
        `;
    }
}

function getLiabilityInsurance() {
    return liabilityInsurancePolicies.map(policy => ({
        carrier: document.querySelector(`.policy-carrier[data-id="${policy.id}"]`)?.value || '',
        policyNumber: document.querySelector(`.policy-number[data-id="${policy.id}"]`)?.value || '',
        coverageAmount: document.querySelector(`.policy-coverage[data-id="${policy.id}"]`)?.value || '',
        policyType: document.querySelector(`.policy-type[data-id="${policy.id}"]`)?.value || 'Claims-Made',
        effectiveDate: document.querySelector(`.policy-effective[data-id="${policy.id}"]`)?.value || '',
        expirationDate: document.querySelector(`.policy-expiration[data-id="${policy.id}"]`)?.value || ''
    })).filter(p => p.carrier);
}

// Professional References Management
function addProfessionalReference() {
    const list = document.getElementById('professional-references-list');
    const id = Date.now();

    const refHtml = `
        <div id="reference-${id}" style="padding: 1rem; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 0.75rem; background: #f8fafc;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                <h4 style="font-size: 0.9375rem; font-weight: 600; color: #1e293b; margin: 0;">Reference #${professionalReferences.length + 1}</h4>
                <button type="button" onclick="removeProfessionalReference(${id})" class="btn-danger btn-small">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    Remove
                </button>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                <div class="form-group">
                    <label style="font-size: 0.875rem; font-weight: 500; color: #64748b;">Name</label>
                    <input type="text" class="reference-name" data-id="${id}" placeholder="Reference name" style="padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px;" />
                </div>
                <div class="form-group">
                    <label style="font-size: 0.875rem; font-weight: 500; color: #64748b;">Title/Specialty</label>
                    <input type="text" class="reference-title" data-id="${id}" placeholder="e.g., Cardiologist" style="padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px;" />
                </div>
                <div class="form-group">
                    <label style="font-size: 0.875rem; font-weight: 500; color: #64748b;">Organization</label>
                    <input type="text" class="reference-org" data-id="${id}" placeholder="Hospital/Practice" style="padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px;" />
                </div>
                <div class="form-group">
                    <label style="font-size: 0.875rem; font-weight: 500; color: #64748b;">Relationship</label>
                    <input type="text" class="reference-relationship" data-id="${id}" placeholder="e.g., Colleague, Supervisor" style="padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px;" />
                </div>
                <div class="form-group">
                    <label style="font-size: 0.875rem; font-weight: 500; color: #64748b;">Phone</label>
                    <input type="tel" class="reference-phone" data-id="${id}" placeholder="Phone number" style="padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px;" />
                </div>
                <div class="form-group">
                    <label style="font-size: 0.875rem; font-weight: 500; color: #64748b;">Email</label>
                    <input type="email" class="reference-email" data-id="${id}" placeholder="Email address" style="padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px;" />
                </div>
            </div>
        </div>
    `;

    if (professionalReferences.length === 0) {
        list.innerHTML = refHtml;
    } else {
        list.insertAdjacentHTML('beforeend', refHtml);
    }

    professionalReferences.push({ id });
}

function removeProfessionalReference(id) {
    document.getElementById(`reference-${id}`)?.remove();
    professionalReferences = professionalReferences.filter(item => item.id !== id);

    if (professionalReferences.length === 0) {
        document.getElementById('professional-references-list').innerHTML = `
            <p style="text-align: center; padding: 1.5rem; color: #94a3b8; font-size: 0.875rem; border: 1px dashed #e2e8f0; border-radius: 8px;">
                No professional references added. Click "Add Reference" to add reference contacts.
            </p>
        `;
    }
}

function getProfessionalReferences() {
    return professionalReferences.map(ref => ({
        name: document.querySelector(`.reference-name[data-id="${ref.id}"]`)?.value || '',
        title: document.querySelector(`.reference-title[data-id="${ref.id}"]`)?.value || '',
        organization: document.querySelector(`.reference-org[data-id="${ref.id}"]`)?.value || '',
        relationship: document.querySelector(`.reference-relationship[data-id="${ref.id}"]`)?.value || '',
        phone: document.querySelector(`.reference-phone[data-id="${ref.id}"]`)?.value || '',
        email: document.querySelector(`.reference-email[data-id="${ref.id}"]`)?.value || ''
    })).filter(r => r.name);
}

function showProviderModal() {
    document.getElementById('provider-modal-title').textContent = 'Add Provider';
    document.getElementById('provider-form').reset();
    document.getElementById('provider-edit-id').value = '';

    // Reset licenses
    providerLicenses = [];
    const licenseList = document.getElementById('provider-licenses-list');
    licenseList.innerHTML = `
        <p style="text-align: center; padding: 1.5rem; color: #94a3b8; font-size: 0.875rem; border: 1px dashed #e2e8f0; border-radius: 8px;">
            No licenses added. Click "Add License" to add state medical licenses.
        </p>
    `;

    // Reset locations
    providerLocations = [];
    const locationsList = document.getElementById('provider-locations-list');
    locationsList.innerHTML = `
        <p style="text-align: center; padding: 1.5rem; color: #94a3b8; font-size: 0.875rem; border: 1px dashed #e2e8f0; border-radius: 8px;">
            No practice locations assigned. Click "Add Location" to assign this provider to locations.
        </p>
    `;

    // Reset hospital affiliations
    hospitalAffiliations = [];
    document.getElementById('hospital-affiliations-list').innerHTML = `
        <p style="text-align: center; padding: 1.5rem; color: #94a3b8; font-size: 0.875rem; border: 1px dashed #e2e8f0; border-radius: 8px;">
            No hospital affiliations added. Click "Add Affiliation" to track hospital privileges.
        </p>
    `;

    // Reset credentialing contacts
    credentialingContacts = [];
    document.getElementById('credentialing-contacts-list').innerHTML = `
        <p style="text-align: center; padding: 1.5rem; color: #94a3b8; font-size: 0.875rem; border: 1px dashed #e2e8f0; border-radius: 8px;">
            No credentialing contacts added. Click "Add Contact" to add primary source verification contacts.
        </p>
    `;

    // Reset liability insurance
    liabilityInsurancePolicies = [];
    document.getElementById('liability-insurance-list').innerHTML = `
        <p style="text-align: center; padding: 1.5rem; color: #94a3b8; font-size: 0.875rem; border: 1px dashed #e2e8f0; border-radius: 8px;">
            No liability insurance policies added. Click "Add Policy" to track malpractice coverage.
        </p>
    `;

    // Reset professional references
    professionalReferences = [];
    document.getElementById('professional-references-list').innerHTML = `
        <p style="text-align: center; padding: 1.5rem; color: #94a3b8; font-size: 0.875rem; border: 1px dashed #e2e8f0; border-radius: 8px;">
            No professional references added. Click "Add Reference" to add reference contacts.
        </p>
    `;

    document.getElementById('provider-modal').classList.add('active');
}

function closeProviderModal() {
    document.getElementById('provider-modal').classList.remove('active');
}

function saveProvider(event) {
    event.preventDefault();
    console.log('💾 ========== SAVE PROVIDER CALLED ==========');
    console.log('💾 Current Organization at time of save:', currentOrganization ? `${currentOrganization.name} (ID: ${currentOrganization.id})` : 'NULL - THIS IS A PROBLEM!');

    try {
        const id = document.getElementById('provider-edit-id').value;
        const firstName = document.getElementById('provider-first-name').value;
        const lastName = document.getElementById('provider-last-name').value;
        console.log('💾 Basic info collected:', firstName, lastName);

        const licenses = getProviderLicenses();
        console.log('Licenses:', licenses);

        const practiceLocations = getProviderLocations();
        console.log('Locations:', practiceLocations);

        const affiliations = getHospitalAffiliations();
        console.log('Affiliations:', affiliations);

        const contacts = getCredentialingContacts();
        console.log('Contacts:', contacts);

        const insurancePolicies = getLiabilityInsurance();
        console.log('Insurance:', insurancePolicies);

        const references = getProfessionalReferences();
        console.log('References:', references);

    const assignedOrgId = currentOrganization ? currentOrganization.id : null;
    console.log('💾 Assigning organizationId:', assignedOrgId);

    const providerData = {
        id: id || `PROV-${String(providers.length + 1).padStart(3, '0')}`,
        firstName: firstName,
        lastName: lastName,
        name: `Dr. ${firstName} ${lastName}`, // Keep for backwards compatibility
        npi: document.getElementById('provider-npi').value,
        specialty: document.getElementById('provider-specialty').value,
        email: document.getElementById('provider-email').value,
        phone: document.getElementById('provider-phone').value,
        status: document.getElementById('provider-status').value,
        organizationId: assignedOrgId,
        // Employment Information
        hireDate: document.getElementById('provider-hire-date').value,
        employmentStatus: document.getElementById('provider-employment-status').value,
        employmentNotes: document.getElementById('provider-employment-notes').value,
        // Licenses and Locations
        licenses: licenses,
        practiceLocations: practiceLocations,
        // Hospital Affiliations
        hospitalAffiliations: affiliations,
        // Credentialing Contacts
        credentialingContacts: contacts,
        // Professional Liability Insurance
        liabilityInsurance: insurancePolicies,
        // Professional References
        professionalReferences: references,
        // Disclosures
        disclosures: {
            sanctionsDisclosed: document.getElementById('provider-sanctions-disclosed').checked,
            malpracticeDisclosed: document.getElementById('provider-malpractice-disclosed').checked,
            felonyDisclosed: document.getElementById('provider-felony-disclosed').checked,
            disclosureNotes: document.getElementById('provider-disclosures-notes').value
        },
        // Legacy fields
        archivedLicenses: [],
        payerEnrollments: [],
        documents: [],
        archivedDocuments: []
    };

    if (id) {
        const index = providers.findIndex(p => p.id === id);
        if (index !== -1) {
            // Preserve existing data when editing
            const existingProvider = providers[index];
            providerData.organizationId = existingProvider.organizationId || providerData.organizationId;
            providerData.archivedLicenses = existingProvider.archivedLicenses || [];
            providerData.payerEnrollments = existingProvider.payerEnrollments || [];
            providerData.documents = existingProvider.documents || [];
            providerData.archivedDocuments = existingProvider.archivedDocuments || [];
            providers[index] = providerData;
            console.log('💾 Updated existing provider at index', index);
        }
    } else {
        providers.push(providerData);
        console.log('💾 Added new provider to array');
    }

        console.log('💾 Final provider data:', {
            name: providerData.name,
            id: providerData.id,
            organizationId: providerData.organizationId,
            licensesCount: providerData.licenses?.length || 0,
            locationsCount: providerData.practiceLocations?.length || 0
        });

        saveProviders();
        console.log('💾 Providers saved to localStorage');

        renderProviders();
        console.log('💾 Providers rendered');
        console.log('💾 ========== SAVE COMPLETE ==========');

        closeProviderModal();
        console.log('Modal closed, save complete!');

    } catch (error) {
        console.error('Error saving provider:', error);
        alert('Error saving provider: ' + error.message);
    }
}

function editProvider(id) {
    const provider = providers.find(p => p.id === id);
    if (!provider) return;

    document.getElementById('provider-modal-title').textContent = 'Edit Provider';
    document.getElementById('provider-edit-id').value = provider.id;

    // Handle both old (name) and new (firstName/lastName) data formats
    if (provider.firstName && provider.lastName) {
        document.getElementById('provider-first-name').value = provider.firstName;
        document.getElementById('provider-last-name').value = provider.lastName;
    } else if (provider.name) {
        // Split the old name format
        const nameParts = provider.name.split(' ').filter(part => part !== 'Dr.');
        document.getElementById('provider-first-name').value = nameParts[0] || '';
        document.getElementById('provider-last-name').value = nameParts.slice(1).join(' ') || '';
    }

    document.getElementById('provider-npi').value = provider.npi;
    document.getElementById('provider-specialty').value = provider.specialty;
    document.getElementById('provider-email').value = provider.email;
    document.getElementById('provider-phone').value = provider.phone;
    document.getElementById('provider-status').value = provider.status;

    // Populate licenses
    providerLicenses = [];
    const list = document.getElementById('provider-licenses-list');
    list.innerHTML = '';

    if (provider.licenses && provider.licenses.length > 0) {
        provider.licenses.forEach(license => {
            const licenseId = Date.now() + Math.random();
            providerLicenses.push({ id: licenseId });

            list.insertAdjacentHTML('beforeend', `
                <div id="license-${licenseId}" style="padding: 1rem; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 0.75rem; background: #f8fafc;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                        <h4 style="font-size: 0.9375rem; font-weight: 600; color: #1e293b; margin: 0;">License #${providerLicenses.length}</h4>
                        <button type="button" onclick="removeProviderLicense(${licenseId})" class="btn-danger btn-small">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                            Remove
                        </button>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                        <div class="form-group">
                            <label style="font-size: 0.875rem; font-weight: 500; color: #64748b;">State <span style="color: #ef4444;">*</span></label>
                            <input type="text" class="license-state" data-id="${licenseId}" value="${license.state || ''}" placeholder="e.g., NY" maxlength="2" style="text-transform: uppercase; padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px;" required />
                        </div>
                        <div class="form-group">
                            <label style="font-size: 0.875rem; font-weight: 500; color: #64748b;">License Number <span style="color: #ef4444;">*</span></label>
                            <input type="text" class="license-number" data-id="${licenseId}" value="${license.number || ''}" placeholder="License number" style="padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px;" required />
                        </div>
                        <div class="form-group">
                            <label style="font-size: 0.875rem; font-weight: 500; color: #64748b;">Issue Date</label>
                            <input type="date" class="license-issue-date" data-id="${licenseId}" value="${license.issueDate || ''}" style="padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px;" />
                        </div>
                        <div class="form-group">
                            <label style="font-size: 0.875rem; font-weight: 500; color: #64748b;">Expiration Date</label>
                            <input type="date" class="license-expiration-date" data-id="${licenseId}" value="${license.expiration || ''}" style="padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px;" />
                        </div>
                        <div class="form-group">
                            <label style="font-size: 0.875rem; font-weight: 500; color: #64748b;">Status</label>
                            <select class="license-status" data-id="${licenseId}" style="padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px;">
                                <option value="active" ${license.status === 'active' ? 'selected' : ''}>Active</option>
                                <option value="pending" ${license.status === 'pending' ? 'selected' : ''}>Pending</option>
                                <option value="expired" ${license.status === 'expired' ? 'selected' : ''}>Expired</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label style="font-size: 0.875rem; font-weight: 500; color: #64748b;">Upload License Document</label>
                            <input type="file" class="license-document" data-id="${licenseId}" accept=".pdf,.jpg,.jpeg,.png" style="padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.875rem;" />
                            ${license.documents && license.documents.length > 0 ? `<p style="font-size: 0.75rem; color: #64748b; margin-top: 0.25rem;">Current: ${license.documents[0].name}</p>` : ''}
                        </div>
                    </div>
                </div>
            `);
        });
    } else {
        list.innerHTML = `
            <p style="text-align: center; padding: 1.5rem; color: #94a3b8; font-size: 0.875rem; border: 1px dashed #e2e8f0; border-radius: 8px;">
                No licenses added. Click "Add License" to add state medical licenses.
            </p>
        `;
    }

    // Populate employment information
    document.getElementById('provider-hire-date').value = provider.hireDate || '';
    document.getElementById('provider-employment-status').value = provider.employmentStatus || 'Full-Time';
    document.getElementById('provider-employment-notes').value = provider.employmentNotes || '';

    // Populate practice locations
    providerLocations = [];
    const locationsList = document.getElementById('provider-locations-list');
    locationsList.innerHTML = '';

    if (provider.practiceLocations && provider.practiceLocations.length > 0) {
        const orgLocations = currentOrganization ?
            locations.filter(loc => loc.organizationId === currentOrganization.id) :
            locations;

        provider.practiceLocations.forEach(pracLoc => {
            const locId = Date.now() + Math.random();
            providerLocations.push({ id: locId, locationId: pracLoc.locationId });

            locationsList.insertAdjacentHTML('beforeend', `
                <div id="provider-location-${locId}" style="padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 0.75rem; background: white; display: flex; gap: 0.75rem; align-items: center;">
                    <select class="provider-location-select" data-id="${locId}" style="flex: 1; padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px;">
                        <option value="">Select Location</option>
                        ${orgLocations.map(loc => `<option value="${loc.id}" ${loc.id === pracLoc.locationId ? 'selected' : ''}>${loc.name} - ${loc.city}, ${loc.state}</option>`).join('')}
                    </select>
                    <button type="button" onclick="removeProviderLocation(${locId})" class="btn-danger btn-small">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            `);
        });
    } else {
        locationsList.innerHTML = `
            <p style="text-align: center; padding: 1.5rem; color: #94a3b8; font-size: 0.875rem; border: 1px dashed #e2e8f0; border-radius: 8px;">
                No practice locations assigned. Click "Add Location" to assign this provider to locations.
            </p>
        `;
    }

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

    console.log('💳 Rendering payers view...');
    console.log('   Current Organization:', currentOrganization ? `${currentOrganization.name} (ID: ${currentOrganization.id})` : 'None');

    // Filter payers by current organization
    const orgPayers = currentOrganization ?
        payers.filter(p => p.organizationId === currentOrganization.id) :
        payers;

    console.log('   Total payers in system:', payers.length);
    console.log('   Payers for current organization:', orgPayers.length);

    if (orgPayers.length === 0) {
        container.innerHTML = `
            <div class="coming-soon">
                ${currentOrganization ?
                    `No payers found for ${currentOrganization.name}. Click "Add Payer" to add insurance companies for this organization.` :
                    'No payers found. Click "Add Payer" to get started.'}
            </div>
        `;
        return;
    }

    container.innerHTML = orgPayers.map(payer => {
        // Filter contracts by current organization AND payer
        const payerContracts = currentOrganization ?
            contracts.filter(c =>
                c.payerId === payer.id &&
                c.status !== 'Archived' &&
                c.organizationId === currentOrganization.id
            ) :
            contracts.filter(c => c.payerId === payer.id && c.status !== 'Archived');

        return `
            <div class="payer-card" onclick="viewPayerDetail('${payer.id}')">
                <div class="card-header">
                    <span style="font-family: monospace; color: #64748b; font-size: 0.875rem;">${payer.id}</span>
                    <span class="status-badge status-${payer.status.toLowerCase()}">${payer.status}</span>
                </div>
                <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem;">${payer.name}</h3>
                <div style="background: #f1f5f9; padding: 0.375rem 0.75rem; border-radius: 6px; display: inline-block; font-size: 0.875rem; margin-bottom: 1rem;">
                    ${payer.type}
                </div>
                <div style="font-size: 0.875rem; color: #64748b; margin-bottom: 0.5rem;">
                    <div>Payer ID: <span style="font-weight: 500; color: #1e293b;">${payer.payerId}</span></div>
                    <div>📄 ${payerContracts.length} Contract${payerContracts.length !== 1 ? 's' : ''}${currentOrganization ? ` for ${currentOrganization.name}` : ''}</div>
                </div>
                <div style="display: flex; gap: 0.5rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e2e8f0;">
                    <button class="btn btn-primary btn-small" onclick="event.stopPropagation(); editPayer('${payer.id}')">Edit</button>
                    <button class="btn btn-secondary btn-small" onclick="event.stopPropagation(); showContractModal('${payer.id}')">Add Contract</button>
                    <button class="btn btn-danger btn-small" onclick="event.stopPropagation(); deletePayer('${payer.id}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');
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

    console.log('💳 ========== SAVE PAYER CALLED ==========');
    console.log('💳 Current Organization at time of save:', currentOrganization ? `${currentOrganization.name} (ID: ${currentOrganization.id})` : 'NULL - THIS IS A PROBLEM!');

    const id = document.getElementById('payer-edit-id').value;
    const assignedOrgId = currentOrganization ? currentOrganization.id : null;
    console.log('💳 Assigning organizationId:', assignedOrgId);

    const payerData = {
        id: id || `PAY-${String(payers.length + 1).padStart(3, '0')}`,
        organizationId: assignedOrgId,
        name: document.getElementById('payer-name').value,
        type: document.getElementById('payer-type').value,
        payerId: document.getElementById('payer-id').value,
        status: document.getElementById('payer-status').value
    };

    if (id) {
        const index = payers.findIndex(p => p.id === id);
        if (index !== -1) {
            // Preserve organizationId when editing
            const existingPayer = payers[index];
            payerData.organizationId = existingPayer.organizationId || payerData.organizationId;
            payers[index] = payerData;
            console.log('💳 Updated existing payer at index', index);
        }
    } else {
        payers.push(payerData);
        console.log('💳 Added new payer to array');
    }

    console.log('💳 Final payer data:', {
        id: payerData.id,
        name: payerData.name,
        organizationId: payerData.organizationId
    });

    savePayers();
    renderPayers();
    closePayerModal();
    console.log('💳 ========== SAVE COMPLETE ==========');
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

    console.log('📝 Rendering enrollments view...');
    console.log('   Current Organization:', currentOrganization ? `${currentOrganization.name} (ID: ${currentOrganization.id})` : 'None');
    console.log('   Total enrollments in database:', enrollments.length);

    // Filter enrollments by current organization (through provider)
    const orgEnrollments = currentOrganization ?
        enrollments.filter(enrollment => {
            const provider = providers.find(p => p.id === enrollment.providerId);
            return provider && provider.organizationId === currentOrganization.id;
        }) :
        enrollments;

    console.log('   Filtered enrollments for current org:', orgEnrollments.length);

    if (orgEnrollments.length === 0) {
        container.innerHTML = `
            <div class="coming-soon">
                ${currentOrganization ?
                    `No enrollments found for ${currentOrganization.name}. Enrollments will appear here when providers are enrolled with payers.` :
                    'No enrollments found.'}
            </div>
        `;
        return;
    }

    container.innerHTML = orgEnrollments.map(enrollment => {
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

    // Only show providers from current organization
    const orgProviders = currentOrganization ?
        providers.filter(p => p.organizationId === currentOrganization.id) :
        providers;

    // Log only if there's a potential issue
    if (orgProviders.length === 0 && currentOrganization) {
        console.warn(`⚠️ No providers found for ${currentOrganization.name}`);
    }

    providerSelect.innerHTML = '<option value="">Select Provider</option>' +
        orgProviders.map(p => {
            const name = `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.name || 'Unknown';
            return `<option value="${p.id}">${name}</option>`;
        }).join('');

    // Only show payers that have contracts with current organization
    const orgPayerIds = currentOrganization ?
        contracts.filter(c => c.organizationId === currentOrganization.id).map(c => c.payerId) :
        payers.map(p => p.id);

    const availablePayers = payers.filter(p => orgPayerIds.includes(p.id));

    if (availablePayers.length === 0 && currentOrganization) {
        payerSelect.innerHTML = '<option value="">No payer contracts found for this organization</option>';
        payerSelect.disabled = true;

        // Show warning message
        const warning = document.createElement('div');
        warning.style.cssText = 'background: #fef3c7; border: 1px solid #f59e0b; color: #92400e; padding: 1rem; border-radius: 8px; margin: 1rem 0;';
        warning.textContent = `No payer contracts found for ${currentOrganization.name}. Please add payer contracts in the Payer Contracts section before creating enrollments.`;

        const modal = document.getElementById('enrollment-modal');
        const form = document.getElementById('enrollment-form');
        const existingWarning = modal.querySelector('.enrollment-warning');
        if (existingWarning) existingWarning.remove();
        warning.className = 'enrollment-warning';
        form.insertBefore(warning, form.firstChild);
    } else {
        payerSelect.disabled = false;
        payerSelect.innerHTML = '<option value="">Select Payer</option>' +
            availablePayers.map(p => `<option value="${p.id}">${p.name}</option>`).join('');

        // Remove warning if it exists
        const existingWarning = document.getElementById('enrollment-modal').querySelector('.enrollment-warning');
        if (existingWarning) existingWarning.remove();
    }
}

function saveEnrollment(event) {
    event.preventDefault();

    const id = document.getElementById('enrollment-edit-id').value;
    const providerId = document.getElementById('enrollment-provider').value;
    const payerId = document.getElementById('enrollment-payer').value;

    // Validation: Check if provider belongs to current organization
    const provider = providers.find(p => p.id === providerId);
    if (!provider) {
        alert('Please select a valid provider');
        return;
    }

    if (currentOrganization && provider.organizationId !== currentOrganization.id) {
        alert(`This provider does not belong to ${currentOrganization.name}. Please select a provider from the current organization.`);
        return;
    }

    // Validation: Check if payer has a contract with current organization
    if (currentOrganization) {
        const hasContract = contracts.some(c =>
            c.payerId === payerId && c.organizationId === currentOrganization.id
        );

        if (!hasContract) {
            const payer = payers.find(p => p.id === payerId);
            const payerName = payer ? payer.name : 'this payer';
            alert(`${currentOrganization.name} does not have a contract with ${payerName}. Please add a payer contract in the Payer Contracts section before creating this enrollment.`);
            return;
        }
    }

    const enrollmentData = {
        id: id || `ENR-${String(enrollments.length + 1).padStart(3, '0')}`,
        providerId: providerId,
        payerId: payerId,
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

    console.log('📍 Rendering locations view...');
    console.log('   Current Organization:', currentOrganization ? `${currentOrganization.name} (ID: ${currentOrganization.id})` : 'None');
    console.log('   Total locations in system:', locations.length);

    // Filter locations by current organization and exclude archived ones
    const orgLocations = currentOrganization ?
        locations.filter(l => l.organizationId === currentOrganization.id && l.status !== 'Archived') :
        locations.filter(l => l.status !== 'Archived');

    console.log('   Locations for current organization:', orgLocations.length);

    // Apply search filter
    const searchTerm = document.getElementById('location-search')?.value.toLowerCase() || '';
    let filteredLocations = orgLocations;
    if (searchTerm) {
        filteredLocations = orgLocations.filter(location =>
            location.name.toLowerCase().includes(searchTerm) ||
            location.city.toLowerCase().includes(searchTerm) ||
            location.type.toLowerCase().includes(searchTerm) ||
            (location.npi && location.npi.includes(searchTerm))
        );
    }

    // Update count
    const countElement = document.getElementById('locations-count');
    if (countElement) {
        countElement.textContent = filteredLocations.length;
    }

    if (filteredLocations.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 3rem; color: #94a3b8;">
                    ${searchTerm ? 'No locations found matching your search.' :
                    currentOrganization ? `No locations found for ${currentOrganization.name}. Click "Add Location" to get started.` :
                    'No locations found. Click "Add Location" to get started.'}
                </td>
            </tr>
        `;
        return;
    }

    container.innerHTML = filteredLocations.map(location => `
        <tr>
            <td>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #94a3b8;">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span style="font-weight: 500; color: #1e293b;">${location.name}</span>
                </div>
            </td>
            <td>
                <span style="font-size: 0.875rem; color: #64748b;">${location.type}</span>
            </td>
            <td>
                <span style="font-size: 0.875rem; color: #1e293b;">${location.npi || '-'}</span>
            </td>
            <td>
                <span style="font-size: 0.875rem; color: #1e293b;">${location.taxId || '-'}</span>
            </td>
            <td>
                <span style="font-size: 0.875rem; color: #64748b;">${location.city}, ${location.state}</span>
            </td>
            <td>
                <span style="font-size: 0.875rem; color: #64748b;">${location.phone}</span>
            </td>
            <td>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-primary btn-small" onclick="editLocation('${location.id}')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="btn btn-danger btn-small" onclick="archiveLocation('${location.id}')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function filterLocations() {
    renderLocations();
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

    console.log('📍 ========== SAVE LOCATION CALLED ==========');
    console.log('📍 Current Organization at time of save:', currentOrganization ? `${currentOrganization.name} (ID: ${currentOrganization.id})` : 'NULL - THIS IS A PROBLEM!');

    const id = document.getElementById('location-edit-id').value;
    const assignedOrgId = currentOrganization ? currentOrganization.id : null;
    console.log('📍 Assigning organizationId:', assignedOrgId);

    const locationData = {
        id: id || `LOC-${String(locations.length + 1).padStart(3, '0')}`,
        organizationId: assignedOrgId,
        name: document.getElementById('location-name').value,
        type: document.getElementById('location-type').value,
        npi: document.getElementById('location-npi').value,
        taxId: document.getElementById('location-tax-id').value,
        address: document.getElementById('location-address').value,
        city: document.getElementById('location-city').value,
        state: document.getElementById('location-state').value.toUpperCase(),
        zipCode: document.getElementById('location-zip').value,
        phone: document.getElementById('location-phone').value,
        fax: document.getElementById('location-fax').value,
        email: document.getElementById('location-email').value,
        website: document.getElementById('location-website').value,
        status: 'Active'
    };

    if (id) {
        const index = locations.findIndex(l => l.id === id);
        if (index !== -1) {
            // Preserve organizationId when editing
            const existingLocation = locations[index];
            locationData.organizationId = existingLocation.organizationId || locationData.organizationId;
            locations[index] = locationData;
            console.log('📍 Updated existing location at index', index);
        }
    } else {
        locations.push(locationData);
        console.log('📍 Added new location to array');
    }

    console.log('📍 Location data:', locationData);
    console.log('📍 Total locations in system:', locations.length);
    console.log('📍 ========================================');

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
    document.getElementById('location-npi').value = location.npi || '';
    document.getElementById('location-tax-id').value = location.taxId || '';
    document.getElementById('location-address').value = location.address;
    document.getElementById('location-city').value = location.city;
    document.getElementById('location-state').value = location.state;
    document.getElementById('location-zip').value = location.zipCode || '';
    document.getElementById('location-phone').value = location.phone;
    document.getElementById('location-fax').value = location.fax || '';
    document.getElementById('location-email').value = location.email || '';
    document.getElementById('location-website').value = location.website || '';

    document.getElementById('location-modal').classList.add('active');
}

function archiveLocation(id) {
    if (confirm('Are you sure you want to archive this location? It will be moved to archived locations.')) {
        const location = locations.find(l => l.id === id);
        if (location) {
            location.status = 'Archived';
            location.archivedAt = new Date().toISOString().split('T')[0];
            saveLocations();
            renderLocations();
        }
    }
}

// Keep old function for backwards compatibility, but redirect to archive
function deleteLocation(id) {
    archiveLocation(id);
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
    const modals = ['provider-modal', 'payer-modal', 'enrollment-modal', 'location-modal', 'payer-contract-modal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (event.target === modal) {
            modal.classList.remove('active');
        }
    });
}

// ===== PAYER CONTRACTS =====
function loadContracts() {
    const storedContracts = localStorage.getItem('pvContracts');
    if (storedContracts) {
        contracts = JSON.parse(storedContracts);
    } else {
        // Sample contract data
        contracts = [
            {
                id: 'CONTRACT-001',
                organizationId: 'ORG-001',
                payerId: 'PAY-001',
                payerName: 'Blue Cross Blue Shield',
                contractName: 'PPO Network Agreement',
                identifiers: [
                    { type: 'Contract Number', value: 'BCBS-2024-001' },
                    { type: 'Group ID', value: 'GRP-12345' }
                ],
                contactName: 'Jane Smith',
                email: 'jane.smith@bcbs.com',
                phone: '(555) 123-4567',
                fax: '(555) 123-4568',
                streetAddress: '123 Insurance Ave',
                city: 'Chicago',
                state: 'IL',
                zipCode: '60601',
                effectiveDate: '2024-01-01',
                expirationDate: '2025-12-31',
                status: 'Active',
                website: 'https://www.bcbs.com',
                productLines: 'HMO, PPO, Medicare Advantage',
                feeScheduleUrl: 'https://www.bcbs.com/fee-schedule',
                documentUrl: 'https://docs.bcbs.com/contract-2024.pdf',
                notes: 'Annual contract with standard terms',
                createdAt: '2024-01-15'
            },
            {
                id: 'CONTRACT-002',
                organizationId: 'ORG-001',
                payerId: 'PAY-002',
                payerName: 'Aetna',
                contractName: 'HMO Agreement',
                identifiers: [
                    { type: 'Contract Number', value: 'AET-2024-001' },
                    { type: 'Network ID', value: 'NET-67890' }
                ],
                contactName: 'Robert Johnson',
                email: 'r.johnson@aetna.com',
                phone: '(555) 234-5678',
                fax: '(555) 234-5679',
                streetAddress: '456 Health Blvd',
                city: 'Hartford',
                state: 'CT',
                zipCode: '06103',
                effectiveDate: '2024-02-01',
                expirationDate: '2025-12-31',
                status: 'Active',
                website: 'https://www.aetna.com',
                productLines: 'HMO, PPO',
                feeScheduleUrl: 'https://www.aetna.com/fee-schedule',
                documentUrl: null,
                notes: 'Standard HMO network contract',
                createdAt: '2024-02-01'
            },
            {
                id: 'CONTRACT-003',
                organizationId: 'ORG-001',
                payerId: 'PAY-003',
                payerName: 'Medicare',
                contractName: 'Medicare Provider Agreement',
                identifiers: [
                    { type: 'PTAN', value: 'PTAN123456' }
                ],
                contactName: 'Medicare Admin',
                email: 'provider@medicare.gov',
                phone: '(555) 345-6789',
                fax: '(555) 345-6780',
                streetAddress: '789 Federal Plaza',
                city: 'Baltimore',
                state: 'MD',
                zipCode: '21244',
                effectiveDate: '2024-01-01',
                expirationDate: '2026-12-31',
                status: 'Active',
                website: 'https://www.medicare.gov',
                productLines: 'Medicare Part A, Part B',
                feeScheduleUrl: 'https://www.cms.gov/fee-schedule',
                documentUrl: null,
                notes: 'Federal Medicare agreement',
                createdAt: '2024-01-01'
            },
            {
                id: 'CONTRACT-004',
                organizationId: 'ORG-003',
                payerId: 'PAY-001',
                payerName: 'Blue Cross Blue Shield',
                contractName: 'PPO Network Agreement - Texas',
                identifiers: [
                    { type: 'Contract Number', value: 'BCBS-TX-2024-003' },
                    { type: 'Group ID', value: 'GRP-TX-78901' }
                ],
                contactName: 'Lisa Martinez',
                email: 'lisa.martinez@bcbstx.com',
                phone: '(555) 456-7890',
                fax: '(555) 456-7891',
                streetAddress: '1200 Insurance Way',
                city: 'Dallas',
                state: 'TX',
                zipCode: '75201',
                effectiveDate: '2024-03-01',
                expirationDate: '2025-12-31',
                status: 'Active',
                website: 'https://www.bcbstx.com',
                productLines: 'PPO, Medicare Advantage',
                feeScheduleUrl: 'https://www.bcbstx.com/fee-schedule',
                documentUrl: null,
                notes: 'Texas regional contract for Knopp Medical',
                createdAt: '2024-03-01'
            },
            {
                id: 'CONTRACT-005',
                organizationId: 'ORG-003',
                payerId: 'PAY-003',
                payerName: 'Medicare',
                contractName: 'Medicare Provider Agreement',
                identifiers: [
                    { type: 'PTAN', value: 'PTAN789012' }
                ],
                contactName: 'Medicare Admin',
                email: 'provider@medicare.gov',
                phone: '(555) 345-6789',
                fax: '(555) 345-6780',
                streetAddress: '789 Federal Plaza',
                city: 'Baltimore',
                state: 'MD',
                zipCode: '21244',
                effectiveDate: '2024-03-01',
                expirationDate: '2026-12-31',
                status: 'Active',
                website: 'https://www.medicare.gov',
                productLines: 'Medicare Part A, Part B',
                feeScheduleUrl: 'https://www.cms.gov/fee-schedule',
                documentUrl: null,
                notes: 'Federal Medicare agreement for Knopp Medical',
                createdAt: '2024-03-01'
            },
            {
                id: 'CONTRACT-006',
                organizationId: 'ORG-002',
                payerId: 'PAY-001',
                payerName: 'Blue Cross Blue Shield',
                contractName: 'PPO Network Agreement - California',
                identifiers: [
                    { type: 'Contract Number', value: 'BCBS-CA-2024-002' },
                    { type: 'Group ID', value: 'GRP-CA-45678' }
                ],
                contactName: 'David Kim',
                email: 'david.kim@bcbsca.com',
                phone: '(555) 567-8901',
                fax: '(555) 567-8902',
                streetAddress: '800 Medical Center Dr',
                city: 'Los Angeles',
                state: 'CA',
                zipCode: '90017',
                effectiveDate: '2024-02-01',
                expirationDate: '2025-12-31',
                status: 'Active',
                website: 'https://www.blueshieldca.com',
                productLines: 'PPO, HMO',
                feeScheduleUrl: 'https://www.blueshieldca.com/fee-schedule',
                documentUrl: null,
                notes: 'California regional contract for Coastal Medical',
                createdAt: '2024-02-01'
            }
        ];
        saveContracts();
    }
}

function saveContracts() {
    localStorage.setItem('pvContracts', JSON.stringify(contracts));
}

// Contract Identifiers Management
function addContractIdentifier() {
    const list = document.getElementById('contract-identifiers-list');
    const id = Date.now();

    const identifierHtml = `
        <div id="identifier-${id}" style="display: flex; gap: 0.75rem; align-items: start; margin-bottom: 0.75rem;">
            <input
                type="text"
                placeholder="Type (e.g., Contract Number)"
                class="identifier-type"
                data-id="${id}"
                style="flex: 1; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; outline: none; transition: all 0.2s;"
                onfocus="this.style.borderColor='#06b6d4'; this.style.boxShadow='0 0 0 3px rgba(6, 182, 212, 0.1)';"
                onblur="this.style.borderColor='#e2e8f0'; this.style.boxShadow='none';"
            />
            <input
                type="text"
                placeholder="Value"
                class="identifier-value"
                data-id="${id}"
                style="flex: 1; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; outline: none; transition: all 0.2s;"
                onfocus="this.style.borderColor='#06b6d4'; this.style.boxShadow='0 0 0 3px rgba(6, 182, 212, 0.1)';"
                onblur="this.style.borderColor='#e2e8f0'; this.style.boxShadow='none';"
            />
            <button
                type="button"
                onclick="removeContractIdentifier(${id})"
                class="btn-danger btn-small"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
    `;

    // If this is the first identifier, clear the "no identifiers" message
    if (contractIdentifiers.length === 0) {
        list.innerHTML = identifierHtml;
    } else {
        list.insertAdjacentHTML('beforeend', identifierHtml);
    }

    contractIdentifiers.push({ id, type: '', value: '' });
}

function removeContractIdentifier(id) {
    const element = document.getElementById(`identifier-${id}`);
    if (element) {
        element.remove();
    }
    contractIdentifiers = contractIdentifiers.filter(item => item.id !== id);

    // If no identifiers left, show empty message
    if (contractIdentifiers.length === 0) {
        const list = document.getElementById('contract-identifiers-list');
        list.innerHTML = `
            <p style="text-align: center; padding: 1.5rem; color: #94a3b8; font-size: 0.875rem; border: 1px dashed #e2e8f0; border-radius: 8px;">
                No identifiers added. Click "Add Identifier" to add contract numbers, group IDs, etc.
            </p>
        `;
    }
}

function getContractIdentifiers() {
    const types = document.querySelectorAll('.identifier-type');
    const values = document.querySelectorAll('.identifier-value');
    const identifiers = [];

    types.forEach((typeInput, index) => {
        if (typeInput.value.trim() || values[index].value.trim()) {
            identifiers.push({
                type: typeInput.value.trim(),
                value: values[index].value.trim()
            });
        }
    });

    return identifiers;
}

// Contract Modal Management
function showContractModal(payerId = null) {
    const modal = document.getElementById('payer-contract-modal');
    const form = document.getElementById('contract-form');

    form.reset();
    document.getElementById('contract-edit-id').value = '';
    document.getElementById('contract-modal-title').textContent = 'Add Payer Contract';

    // Reset identifiers
    contractIdentifiers = [];
    const list = document.getElementById('contract-identifiers-list');
    list.innerHTML = `
        <p style="text-align: center; padding: 1.5rem; color: #94a3b8; font-size: 0.875rem; border: 1px dashed #e2e8f0; border-radius: 8px;">
            No identifiers added. Click "Add Identifier" to add contract numbers, group IDs, etc.
        </p>
    `;

    // If payerId is provided, pre-fill payer information
    if (payerId) {
        const payer = payers.find(p => p.id === payerId);
        if (payer) {
            document.getElementById('contract-payer-id').value = payerId;
            document.getElementById('contract-payer-name').value = payer.name;
        }
    }

    modal.classList.add('active');
}

function closeContractModal() {
    document.getElementById('payer-contract-modal').classList.remove('active');
    contractIdentifiers = [];
}

function saveContract(event) {
    event.preventDefault();

    console.log('💼 ========== SAVE CONTRACT CALLED ==========');
    console.log('💼 Current Organization at time of save:', currentOrganization ? `${currentOrganization.name} (ID: ${currentOrganization.id})` : 'NULL - THIS IS A PROBLEM!');

    const id = document.getElementById('contract-edit-id').value;
    const identifiers = getContractIdentifiers();

    // Handle file upload
    const fileInput = document.getElementById('contract-document');
    let documentFile = null;
    if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB');
            return;
        }
        // In a real application, you would upload this to a server
        // For demo purposes, we'll just store the filename
        documentFile = file.name;
    }

    const assignedOrgId = currentOrganization ? currentOrganization.id : null;
    console.log('💼 Assigning organizationId:', assignedOrgId);

    const contractData = {
        id: id || `CONTRACT-${String(contracts.length + 1).padStart(3, '0')}`,
        organizationId: assignedOrgId,
        payerId: document.getElementById('contract-payer-id').value || null,
        payerName: document.getElementById('contract-payer-name').value,
        contractName: document.getElementById('contract-name').value,
        identifiers: identifiers,
        contactName: document.getElementById('contract-contact-name').value,
        email: document.getElementById('contract-email').value,
        phone: document.getElementById('contract-phone').value,
        fax: document.getElementById('contract-fax').value,
        streetAddress: document.getElementById('contract-address').value,
        city: document.getElementById('contract-city').value,
        state: document.getElementById('contract-state').value,
        zipCode: document.getElementById('contract-zip').value,
        effectiveDate: document.getElementById('contract-effective-date').value,
        expirationDate: document.getElementById('contract-expiration-date').value,
        status: document.getElementById('contract-status').value,
        website: document.getElementById('contract-website').value,
        productLines: document.getElementById('contract-product-lines').value,
        feeScheduleUrl: document.getElementById('contract-fee-schedule-url').value,
        documentFile: documentFile,
        documentUrl: document.getElementById('contract-document-url').value,
        notes: document.getElementById('contract-notes').value,
        createdAt: id ? contracts.find(c => c.id === id)?.createdAt : new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
    };

    if (id) {
        const index = contracts.findIndex(c => c.id === id);
        if (index !== -1) {
            // Preserve organizationId when editing
            const existingContract = contracts[index];
            contractData.organizationId = existingContract.organizationId || contractData.organizationId;
            contracts[index] = contractData;
            console.log('💼 Updated existing contract at index', index);
        }
    } else {
        contracts.push(contractData);
        console.log('💼 Added new contract to array');
    }

    console.log('💼 Final contract data:', {
        id: contractData.id,
        contractName: contractData.contractName,
        organizationId: contractData.organizationId,
        payerName: contractData.payerName
    });

    saveContracts();
    closeContractModal();

    // If viewing a payer detail, refresh that view
    if (selectedPayer) {
        viewPayerDetail(selectedPayer.id);
    } else {
        renderPayers();
    }
    console.log('💼 ========== SAVE COMPLETE ==========');
}

function editContract(contractId) {
    const contract = contracts.find(c => c.id === contractId);
    if (!contract) return;

    document.getElementById('contract-modal-title').textContent = 'Edit Payer Contract';
    document.getElementById('contract-edit-id').value = contract.id;
    document.getElementById('contract-payer-id').value = contract.payerId || '';
    document.getElementById('contract-payer-name').value = contract.payerName;
    document.getElementById('contract-name').value = contract.contractName;
    document.getElementById('contract-contact-name').value = contract.contactName || '';
    document.getElementById('contract-email').value = contract.email || '';
    document.getElementById('contract-phone').value = contract.phone || '';
    document.getElementById('contract-fax').value = contract.fax || '';
    document.getElementById('contract-address').value = contract.streetAddress || '';
    document.getElementById('contract-city').value = contract.city || '';
    document.getElementById('contract-state').value = contract.state || '';
    document.getElementById('contract-zip').value = contract.zipCode || '';
    document.getElementById('contract-effective-date').value = contract.effectiveDate || '';
    document.getElementById('contract-expiration-date').value = contract.expirationDate || '';
    document.getElementById('contract-status').value = contract.status;
    document.getElementById('contract-website').value = contract.website || '';
    document.getElementById('contract-product-lines').value = contract.productLines || '';
    document.getElementById('contract-fee-schedule-url').value = contract.feeScheduleUrl || '';
    document.getElementById('contract-document-url').value = contract.documentUrl || '';
    document.getElementById('contract-notes').value = contract.notes || '';

    // Populate identifiers
    contractIdentifiers = [];
    const list = document.getElementById('contract-identifiers-list');
    list.innerHTML = '';

    if (contract.identifiers && contract.identifiers.length > 0) {
        contract.identifiers.forEach(identifier => {
            const id = Date.now() + Math.random();
            contractIdentifiers.push({ id, type: identifier.type, value: identifier.value });

            list.insertAdjacentHTML('beforeend', `
                <div id="identifier-${id}" style="display: flex; gap: 0.75rem; align-items: start; margin-bottom: 0.75rem;">
                    <input
                        type="text"
                        placeholder="Type (e.g., Contract Number)"
                        class="identifier-type"
                        data-id="${id}"
                        value="${identifier.type}"
                        style="flex: 1; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px;"
                    />
                    <input
                        type="text"
                        placeholder="Value"
                        class="identifier-value"
                        data-id="${id}"
                        value="${identifier.value}"
                        style="flex: 1; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px;"
                    />
                    <button
                        type="button"
                        onclick="removeContractIdentifier(${id})"
                        class="btn-danger btn-small"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            `);
        });
    } else {
        list.innerHTML = `
            <p style="text-align: center; padding: 1.5rem; color: #94a3b8; font-size: 0.875rem; border: 1px dashed #e2e8f0; border-radius: 8px;">
                No identifiers added. Click "Add Identifier" to add contract numbers, group IDs, etc.
            </p>
        `;
    }

    document.getElementById('payer-contract-modal').classList.add('active');
}

function deleteContract(contractId) {
    if (confirm('Are you sure you want to archive this contract? It will be moved to archived contracts.')) {
        const contract = contracts.find(c => c.id === contractId);
        if (contract) {
            contract.status = 'Archived';
            contract.archivedAt = new Date().toISOString().split('T')[0];
            saveContracts();

            if (selectedPayer) {
                viewPayerDetail(selectedPayer.id);
            } else {
                renderPayers();
            }
        }
    }
}

// Payer Detail View
function viewPayerDetail(payerId) {
    selectedPayer = payers.find(p => p.id === payerId);
    if (!selectedPayer) return;

    console.log('💳 Viewing payer detail for:', selectedPayer.name);
    console.log('   Current Organization:', currentOrganization ? `${currentOrganization.name} (ID: ${currentOrganization.id})` : 'None');

    // Filter contracts by organization AND payer
    const payerContracts = currentOrganization ?
        contracts.filter(c =>
            c.payerId === payerId &&
            c.status !== 'Archived' &&
            c.organizationId === currentOrganization.id
        ) :
        contracts.filter(c => c.payerId === payerId && c.status !== 'Archived');

    console.log('   Contracts found for this organization:', payerContracts.length);

    const detailView = document.getElementById('payer-detail-view');

    detailView.innerHTML = `
        <div class="detail-header">
            <button class="back-btn" onclick="closePayerDetail()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Back to Payers
            </button>
        </div>
        <div class="detail-content">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem;">
                <div>
                    <h1 style="font-size: 1.75rem; font-weight: 700; margin-bottom: 0.25rem;">${selectedPayer.name}</h1>
                    <p style="color: #64748b; font-size: 1.125rem;">${selectedPayer.type}</p>
                </div>
                <span class="status-badge status-${selectedPayer.status.toLowerCase()}">
                    ${selectedPayer.status}
                </span>
            </div>

            <div class="info-grid">
                <div class="info-card">
                    <h3>Payer Information</h3>
                    <div class="info-field">
                        <div class="info-label">Payer ID</div>
                        <div class="info-value">${selectedPayer.payerId}</div>
                    </div>
                    <div class="info-field">
                        <div class="info-label">Type</div>
                        <div class="info-value">${selectedPayer.type}</div>
                    </div>
                    <div class="info-field">
                        <div class="info-label">Status</div>
                        <div class="info-value">${selectedPayer.status}</div>
                    </div>
                </div>
            </div>

            <!-- Contracts Section -->
            <div style="margin-top: 2rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h2 style="font-size: 1.5rem; font-weight: 600; color: #1e293b;">
                        Contracts (${payerContracts.length})
                    </h2>
                    <button class="btn btn-primary" onclick="showContractModal('${selectedPayer.id}')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add Contract
                    </button>
                </div>

                ${payerContracts.length === 0 ? `
                    <div class="coming-soon">
                        No contracts found. Click "Add Contract" to create your first payer contract.
                    </div>
                ` : `
                    <div class="providers-grid">
                        ${payerContracts.map(contract => `
                            <div class="provider-card">
                                <div style="margin-bottom: 1rem;">
                                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                                        <h3 style="font-size: 1.125rem; font-weight: 600; color: #1e293b;">${contract.contractName}</h3>
                                        <span class="status-badge status-${contract.status.toLowerCase()}">${contract.status}</span>
                                    </div>
                                    <p style="font-size: 0.875rem; color: #64748b;">${contract.payerName}</p>
                                </div>

                                ${contract.identifiers && contract.identifiers.length > 0 ? `
                                    <div style="margin-bottom: 0.75rem;">
                                        ${contract.identifiers.map(id => `
                                            <div style="font-size: 0.8125rem; color: #64748b; margin-bottom: 0.25rem;">
                                                <span style="font-weight: 500;">${id.type}:</span> ${id.value}
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : ''}

                                <div style="font-size: 0.875rem; color: #64748b; margin-bottom: 0.5rem;">
                                    ${contract.effectiveDate ? `<div>📅 Effective: ${contract.effectiveDate}</div>` : ''}
                                    ${contract.expirationDate ? `<div>⏰ Expires: ${contract.expirationDate}</div>` : ''}
                                    ${contract.productLines ? `<div>📦 ${contract.productLines}</div>` : ''}
                                </div>

                                <div style="display: flex; gap: 0.5rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e2e8f0;">
                                    <button class="btn btn-primary btn-small" onclick="editContract('${contract.id}')">Edit</button>
                                    <button class="btn btn-secondary btn-small" onclick="deleteContract('${contract.id}')">Archive</button>
                                    ${contract.documentUrl || contract.documentFile ? `
                                        <button class="btn btn-secondary btn-small" onclick="window.open('${contract.documentUrl}', '_blank')">View Doc</button>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        </div>
    `;

    // Show detail view
    document.getElementById('payers-view').classList.remove('active');
    detailView.classList.add('active');
}

function closePayerDetail() {
    document.getElementById('payer-detail-view').classList.remove('active');
    document.getElementById('payers-view').classList.add('active');
    selectedPayer = null;
}

// ===== EMAIL NOTIFICATIONS =====
function loadEmailNotifications() {
    const storedNotifications = localStorage.getItem('pvEmailNotifications');
    if (storedNotifications) {
        emailNotifications = JSON.parse(storedNotifications);
    } else {
        // Sample notification data with various statuses
        emailNotifications = [
            {
                id: 'NOTIF-001',
                providerName: 'Dr. Sarah Johnson',
                providerEmail: 'sarah.j@example.com',
                credentialType: 'State Medical License',
                daysUntilExpiration: 30,
                sentDateTime: '2024-11-08 09:15:00',
                status: 'Sent',
                errorMessage: null
            },
            {
                id: 'NOTIF-002',
                providerName: 'Dr. Michael Chen',
                providerEmail: 'michael.c@example.com',
                credentialType: 'DEA Certificate',
                daysUntilExpiration: 60,
                sentDateTime: '2024-11-08 09:20:00',
                status: 'Sent',
                errorMessage: null
            },
            {
                id: 'NOTIF-003',
                providerName: 'Dr. Emily Davis',
                providerEmail: null,
                credentialType: 'Board Certification',
                daysUntilExpiration: 15,
                sentDateTime: null,
                status: 'No Email',
                errorMessage: 'Provider email not on file'
            },
            {
                id: 'NOTIF-004',
                providerName: 'Dr. Robert Wilson',
                providerEmail: 'robert.w@invalid-domain.xyz',
                credentialType: 'Malpractice Insurance',
                daysUntilExpiration: 45,
                sentDateTime: '2024-11-08 09:25:00',
                status: 'Failed',
                errorMessage: 'SMTP Error: Invalid email address'
            },
            {
                id: 'NOTIF-005',
                providerName: 'Dr. Jennifer Martinez',
                providerEmail: 'jennifer.m@example.com',
                credentialType: 'CPR Certification',
                daysUntilExpiration: 20,
                sentDateTime: null,
                status: 'Pending',
                errorMessage: null
            },
            {
                id: 'NOTIF-006',
                providerName: 'Dr. David Lee',
                providerEmail: 'david.lee@example.com',
                credentialType: 'State Medical License',
                daysUntilExpiration: 25,
                sentDateTime: '2024-11-08 10:00:00',
                status: 'Sent',
                errorMessage: null
            },
            {
                id: 'NOTIF-007',
                providerName: 'Dr. Lisa Anderson',
                providerEmail: 'lisa.anderson@bounced.com',
                credentialType: 'DEA Certificate',
                daysUntilExpiration: 35,
                sentDateTime: '2024-11-08 10:05:00',
                status: 'Failed',
                errorMessage: 'Email bounced - mailbox full'
            },
            {
                id: 'NOTIF-008',
                providerName: 'Dr. James Thompson',
                providerEmail: 'james.t@example.com',
                credentialType: 'Malpractice Insurance',
                daysUntilExpiration: 10,
                sentDateTime: null,
                status: 'Pending',
                errorMessage: null
            },
            {
                id: 'NOTIF-009',
                providerName: 'Dr. Patricia Garcia',
                providerEmail: null,
                credentialType: 'Board Certification',
                daysUntilExpiration: 40,
                sentDateTime: null,
                status: 'No Email',
                errorMessage: 'Provider email not on file'
            },
            {
                id: 'NOTIF-010',
                providerName: 'Dr. Christopher Brown',
                providerEmail: 'christopher.b@example.com',
                credentialType: 'ACLS Certification',
                daysUntilExpiration: 55,
                sentDateTime: '2024-11-08 10:30:00',
                status: 'Sent',
                errorMessage: null
            }
        ];
        saveEmailNotifications();
    }
}

function saveEmailNotifications() {
    localStorage.setItem('pvEmailNotifications', JSON.stringify(emailNotifications));
}

function renderEmailNotifications() {
    updateNotificationStats();
    renderNotificationsTable();
}

function updateNotificationStats() {
    const total = emailNotifications.length;
    const sent = emailNotifications.filter(n => n.status === 'Sent').length;
    const pending = emailNotifications.filter(n => n.status === 'Pending').length;
    const failed = emailNotifications.filter(n => n.status === 'Failed').length;
    const noEmail = emailNotifications.filter(n => n.status === 'No Email').length;

    document.getElementById('total-notifications').textContent = total;
    document.getElementById('sent-notifications').textContent = sent;
    document.getElementById('pending-notifications').textContent = pending;
    document.getElementById('failed-notifications').textContent = failed;
    document.getElementById('noemail-notifications').textContent = noEmail;
}

function renderNotificationsTable() {
    const tbody = document.getElementById('notifications-tbody');
    if (!tbody) return;

    let filteredNotifications = emailNotifications;

    // Apply status filter
    if (currentNotificationFilter !== 'all') {
        filteredNotifications = emailNotifications.filter(n => n.status === currentNotificationFilter);
    }

    // Apply search filter
    const searchTerm = document.getElementById('notification-search')?.value.toLowerCase() || '';
    if (searchTerm) {
        filteredNotifications = filteredNotifications.filter(n =>
            n.providerName.toLowerCase().includes(searchTerm) ||
            (n.providerEmail && n.providerEmail.toLowerCase().includes(searchTerm))
        );
    }

    if (filteredNotifications.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 3rem; color: #94a3b8;">
                    No notifications found matching your criteria.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filteredNotifications.map(notification => {
        let statusBadgeClass = 'status-badge ';
        if (notification.status === 'Sent') {
            statusBadgeClass += 'status-active';
        } else if (notification.status === 'Pending') {
            statusBadgeClass += 'status-pending';
        } else if (notification.status === 'Failed') {
            statusBadgeClass += 'status-expired';
        } else if (notification.status === 'No Email') {
            statusBadgeClass += 'status-inactive';
        }

        return `
            <tr>
                <td>
                    <div style="font-weight: 500; color: #1e293b;">${notification.providerName}</div>
                </td>
                <td>
                    ${notification.providerEmail ?
                        `<span style="color: #64748b;">${notification.providerEmail}</span>` :
                        `<span style="color: #ef4444; font-style: italic;">No email on file</span>`
                    }
                </td>
                <td>${notification.credentialType}</td>
                <td>
                    <div style="font-weight: 500; color: ${notification.daysUntilExpiration <= 15 ? '#ef4444' : notification.daysUntilExpiration <= 30 ? '#f97316' : '#64748b'};">
                        ${notification.daysUntilExpiration} days
                    </div>
                </td>
                <td>
                    ${notification.sentDateTime ?
                        `<span style="font-size: 0.875rem; color: #64748b;">${notification.sentDateTime}</span>` :
                        `<span style="color: #94a3b8; font-style: italic;">Not sent</span>`
                    }
                </td>
                <td>
                    <span class="${statusBadgeClass}">${notification.status}</span>
                    ${notification.errorMessage ? `
                        <div style="font-size: 0.75rem; color: #ef4444; margin-top: 0.25rem;" title="${notification.errorMessage}">
                            ${notification.errorMessage.substring(0, 30)}${notification.errorMessage.length > 30 ? '...' : ''}
                        </div>
                    ` : ''}
                </td>
                <td>
                    <div style="display: flex; gap: 0.5rem;">
                        ${notification.status === 'Failed' || notification.status === 'Pending' ?
                            `<button class="btn btn-primary btn-small" onclick="retryNotification('${notification.id}')">Retry</button>` :
                            ''
                        }
                        <button class="btn btn-secondary btn-small" onclick="viewNotificationDetails('${notification.id}')">Details</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function filterNotifications() {
    renderNotificationsTable();
}

function filterNotificationsByStatus(status) {
    currentNotificationFilter = status;

    // Update active button
    document.querySelectorAll('#email-notifications-view .filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    renderNotificationsTable();
}

function runEmailCheck() {
    // Simulate running an email check by updating pending notifications
    const pendingNotifications = emailNotifications.filter(n => n.status === 'Pending');

    pendingNotifications.forEach(notification => {
        // Simulate sending - 80% success rate
        if (Math.random() > 0.2) {
            notification.status = 'Sent';
            notification.sentDateTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
        } else {
            notification.status = 'Failed';
            notification.errorMessage = 'SMTP connection timeout';
            notification.sentDateTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
        }
    });

    saveEmailNotifications();
    renderEmailNotifications();

    // Reset timer
    resetRefreshTimer();

    // Show feedback
    alert(`Email check complete! Processed ${pendingNotifications.length} pending notification(s).`);
}

function retryNotification(notificationId) {
    const notification = emailNotifications.find(n => n.id === notificationId);
    if (!notification) return;

    // Simulate retry - 70% success rate
    if (Math.random() > 0.3) {
        notification.status = 'Sent';
        notification.sentDateTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
        notification.errorMessage = null;
        alert('Email sent successfully!');
    } else {
        notification.status = 'Failed';
        notification.errorMessage = 'Retry failed - SMTP server unreachable';
        notification.sentDateTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
        alert('Retry failed. Please check email configuration.');
    }

    saveEmailNotifications();
    renderEmailNotifications();
}

function viewNotificationDetails(notificationId) {
    const notification = emailNotifications.find(n => n.id === notificationId);
    if (!notification) return;

    const details = `
Notification Details:
━━━━━━━━━━━━━━━━━━━━
Provider: ${notification.providerName}
Email: ${notification.providerEmail || 'Not on file'}
Credential: ${notification.credentialType}
Days Until Expiration: ${notification.daysUntilExpiration}
Status: ${notification.status}
Sent: ${notification.sentDateTime || 'Not sent'}
${notification.errorMessage ? `Error: ${notification.errorMessage}` : ''}
    `.trim();

    alert(details);
}

function exportNotificationsToCSV() {
    const headers = ['Provider Name', 'Email', 'Credential Type', 'Days Until Expiration', 'Sent Date/Time', 'Status', 'Error Message'];
    const rows = emailNotifications.map(n => [
        n.providerName,
        n.providerEmail || 'No email',
        n.credentialType,
        n.daysUntilExpiration,
        n.sentDateTime || 'Not sent',
        n.status,
        n.errorMessage || ''
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
        csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `email-notifications-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Auto-refresh timer
function startRefreshTimer() {
    // Clear any existing interval
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }

    refreshTimer = 20;
    updateTimerDisplay();

    refreshInterval = setInterval(() => {
        refreshTimer--;
        updateTimerDisplay();

        if (refreshTimer <= 0) {
            resetRefreshTimer();
            // Auto-refresh the data
            renderEmailNotifications();
        }
    }, 1000);
}

function resetRefreshTimer() {
    refreshTimer = 20;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const timerElement = document.getElementById('refresh-timer');
    if (timerElement) {
        timerElement.textContent = `${refreshTimer}s`;
    }
}

// Clean up timer when leaving the view
const originalShowView = showView;
showView = function(viewName) {
    // Clear refresh timer when leaving email notifications view
    if (viewName !== 'email-notifications' && refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
    originalShowView(viewName);
};

// ===== CLAIMS MANAGEMENT =====
function loadClaims() {
    const storedClaims = localStorage.getItem('pvClaims');
    if (storedClaims) {
        claims = JSON.parse(storedClaims);
    } else {
        // Sample claims data
        claims = [
            {
                id: 'CLM-2024-001',
                claimId: 'CLM-2024-001',
                providerId: 'PROV-001',
                organizationId: 'ORG-001',
                status: 'open',
                reserveAmount: 50000,
                settlementAmount: 0,
                incidentDate: '2024-01-15',
                description: 'Alleged surgical complication',
                notes: 'Investigation ongoing',
                createdAt: '2024-01-20'
            },
            {
                id: 'CLM-2024-002',
                claimId: 'CLM-2024-002',
                providerId: 'PROV-002',
                organizationId: 'ORG-001',
                status: 'pending',
                reserveAmount: 75000,
                settlementAmount: 0,
                incidentDate: '2024-02-10',
                description: 'Medication error claim',
                notes: 'Awaiting legal review',
                createdAt: '2024-02-15'
            },
            {
                id: 'CLM-2023-045',
                claimId: 'CLM-2023-045',
                providerId: 'PROV-004',
                organizationId: 'ORG-003',
                status: 'settled',
                reserveAmount: 100000,
                settlementAmount: 45000,
                incidentDate: '2023-11-05',
                description: 'Diagnostic delay claim',
                notes: 'Settled out of court',
                createdAt: '2023-11-10'
            }
        ];
        saveClaims();
    }
}

function saveClaims() {
    localStorage.setItem('pvClaims', JSON.stringify(claims));
}

function renderClaims() {
    console.log('📋 Rendering claims...');
    console.log('   Current Organization:', currentOrganization ? `${currentOrganization.name} (ID: ${currentOrganization.id})` : 'None');

    const claimsList = document.getElementById('claims-list');
    if (!claimsList) return;

    // Filter claims by current organization
    const orgClaims = currentOrganization ?
        claims.filter(c => c.organizationId === currentOrganization.id) :
        claims;

    console.log('   Claims in current org:', orgClaims.length);

    // Apply status filter
    const filteredClaims = currentClaimFilter === 'all' ?
        orgClaims :
        orgClaims.filter(c => c.status === currentClaimFilter);

    // Update count
    const countElement = document.getElementById('claims-count');
    if (countElement) {
        countElement.textContent = filteredClaims.length;
    }

    if (filteredClaims.length === 0) {
        claimsList.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem; color: #94a3b8;">
                    ${currentOrganization ?
                        `No claims found for ${currentOrganization.name}` :
                        'No claims found'}
                </td>
            </tr>
        `;
        return;
    }

    claimsList.innerHTML = filteredClaims.map(claim => {
        const provider = providers.find(p => p.id === claim.providerId);
        const providerName = provider ?
            `${provider.firstName || ''} ${provider.lastName || ''}`.trim() || provider.name || 'Unknown' :
            'Unknown Provider';

        const statusBadge = getClaimStatusBadge(claim.status);
        const reserveFormatted = claim.reserveAmount ? `$${claim.reserveAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '-';
        const settlementFormatted = claim.settlementAmount ? `$${claim.settlementAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '-';
        const incidentDate = claim.incidentDate ? new Date(claim.incidentDate).toLocaleDateString() : '-';

        return `
            <tr>
                <td style="font-weight: 600;">${claim.claimId}</td>
                <td>${providerName}</td>
                <td>${statusBadge}</td>
                <td>${reserveFormatted}</td>
                <td>${settlementFormatted}</td>
                <td>${incidentDate}</td>
                <td>
                    <button class="btn btn-secondary btn-small" onclick='editClaim(${JSON.stringify(claim)})'>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Edit
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function getClaimStatusBadge(status) {
    const badges = {
        'open': '<span class="badge" style="background: #fee2e2; color: #991b1b;">Open</span>',
        'pending': '<span class="badge" style="background: #fef3c7; color: #92400e;">Pending</span>',
        'settled': '<span class="badge" style="background: #d1fae5; color: #065f46;">Settled</span>',
        'closed': '<span class="badge" style="background: #e0e7ff; color: #3730a3;">Closed</span>'
    };
    return badges[status] || `<span class="badge">${status}</span>`;
}

function filterClaimsByStatus(status) {
    console.log('Filtering claims by status:', status);
    currentClaimFilter = status;

    // Update active filter button
    document.querySelectorAll('.filter-group .filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    renderClaims();
}

function filterClaims() {
    const searchTerm = document.getElementById('claim-search')?.value.toLowerCase() || '';
    const claimsList = document.getElementById('claims-list');
    if (!claimsList) return;

    const rows = claimsList.querySelectorAll('tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function showClaimModal() {
    console.log('Opening claim modal for new claim');

    // Reset form
    document.getElementById('claim-edit-id').value = '';
    document.getElementById('claim-id').value = '';
    document.getElementById('claim-id').disabled = false;
    document.getElementById('claim-provider').value = '';
    document.getElementById('claim-status').value = 'open';
    document.getElementById('claim-incident-date').value = '';
    document.getElementById('claim-reserve-amount').value = '';
    document.getElementById('claim-settlement-amount').value = '';
    document.getElementById('claim-description').value = '';
    document.getElementById('claim-notes').value = '';

    // Populate provider dropdown with current org's providers
    const providerSelect = document.getElementById('claim-provider');
    const orgProviders = currentOrganization ?
        providers.filter(p => p.organizationId === currentOrganization.id) :
        providers;

    providerSelect.innerHTML = '<option value="">Select Provider</option>' +
        orgProviders.map(p => {
            const name = `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.name || 'Unknown';
            return `<option value="${p.id}">${name}</option>`;
        }).join('');

    // Update modal title
    document.getElementById('claim-modal-title').textContent = 'Add Claim';

    // Show modal
    document.getElementById('claim-modal').style.display = 'flex';
}

function editClaim(claim) {
    console.log('Editing claim:', claim);

    // Populate form with claim data
    document.getElementById('claim-edit-id').value = claim.id;
    document.getElementById('claim-id').value = claim.claimId;
    document.getElementById('claim-id').disabled = true; // Don't allow changing claim ID
    document.getElementById('claim-provider').value = claim.providerId;
    document.getElementById('claim-status').value = claim.status;
    document.getElementById('claim-incident-date').value = claim.incidentDate || '';
    document.getElementById('claim-reserve-amount').value = claim.reserveAmount || '';
    document.getElementById('claim-settlement-amount').value = claim.settlementAmount || '';
    document.getElementById('claim-description').value = claim.description || '';
    document.getElementById('claim-notes').value = claim.notes || '';

    // Populate provider dropdown with current org's providers
    const providerSelect = document.getElementById('claim-provider');
    const orgProviders = currentOrganization ?
        providers.filter(p => p.organizationId === currentOrganization.id) :
        providers;

    providerSelect.innerHTML = '<option value="">Select Provider</option>' +
        orgProviders.map(p => {
            const name = `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.name || 'Unknown';
            return `<option value="${p.id}">${name}</option>`;
        }).join('');

    // Set selected provider
    document.getElementById('claim-provider').value = claim.providerId;

    // Update modal title
    document.getElementById('claim-modal-title').textContent = 'Edit Claim';

    // Show modal
    document.getElementById('claim-modal').style.display = 'flex';
}

function closeClaimModal() {
    document.getElementById('claim-modal').style.display = 'none';
}

function saveClaim(event) {
    event.preventDefault();

    const editId = document.getElementById('claim-edit-id').value;
    const claimId = document.getElementById('claim-id').value;
    const providerId = document.getElementById('claim-provider').value;
    const status = document.getElementById('claim-status').value;
    const incidentDate = document.getElementById('claim-incident-date').value;
    const reserveAmount = parseFloat(document.getElementById('claim-reserve-amount').value) || 0;
    const settlementAmount = parseFloat(document.getElementById('claim-settlement-amount').value) || 0;
    const description = document.getElementById('claim-description').value;
    const notes = document.getElementById('claim-notes').value;

    if (!currentOrganization) {
        alert('Please select an organization first');
        return;
    }

    if (editId) {
        // Update existing claim
        const claimIndex = claims.findIndex(c => c.id === editId);
        if (claimIndex !== -1) {
            claims[claimIndex] = {
                ...claims[claimIndex],
                providerId,
                status,
                incidentDate,
                reserveAmount,
                settlementAmount,
                description,
                notes
            };
            console.log('Updated claim:', claims[claimIndex]);
        }
    } else {
        // Create new claim
        const newClaim = {
            id: claimId,
            claimId,
            providerId,
            organizationId: currentOrganization.id,
            status,
            incidentDate,
            reserveAmount,
            settlementAmount,
            description,
            notes,
            createdAt: new Date().toISOString()
        };
        claims.push(newClaim);
        console.log('Created new claim:', newClaim);
    }

    saveClaims();
    closeClaimModal();
    renderClaims();

    // Update dashboard if visible
    const dashboardView = document.getElementById('dashboard-view');
    if (dashboardView && dashboardView.classList.contains('active')) {
        updateDashboard();
    }
}
