// API Base URL
const API_BASE = '/api';

// Global state
let currentUser = null;
let authToken = localStorage.getItem('authToken');

// DOM Elements
const loginContainer = document.getElementById('login-container');
const registerContainer = document.getElementById('register-container');
const dashboardContainer = document.getElementById('dashboard-container');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegisterBtn = document.getElementById('show-register');
const showLoginBtn = document.getElementById('show-login');
const logoutBtn = document.getElementById('logout-btn');
const welcomeUser = document.getElementById('welcome-user');
const userRole = document.getElementById('user-role');

// Enhanced fetch debugging
const originalFetch = window.fetch;
window.fetch = async function(...args) {
    console.log('🔵 Fetch Request:', args[0], args[1]?.method || 'GET');
    if (args[1]?.headers?.Authorization) {
        console.log('   Auth Token:', args[1].headers.Authorization.substring(0, 20) + '...');
    }
    
    try {
        const response = await originalFetch(...args);
        console.log('🟢 Fetch Response:', response.status, response.statusText, response.url);
        return response;
    } catch (error) {
        console.error('🔴 Fetch Error:', error);
        throw error;
    }
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

function initializeApp() {
    if (authToken) {
        console.log('Token found, verifying...');
        verifyTokenAndLoadDashboard();
    } else {
        console.log('No token found, showing login');
        showLogin();
    }
}

function setupEventListeners() {
    // Auth forms
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    showRegisterBtn.addEventListener('click', showRegister);
    showLoginBtn.addEventListener('click', showLogin);
    logoutBtn.addEventListener('click', handleLogout);
    
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            loadSection(section);
        });
    });
}

// Authentication functions
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Show role confirmation
            const role = data.data.user.role;
            const roleDisplay = document.getElementById('detected-role');
            const roleDisplayContainer = document.getElementById('role-display');
            
            roleDisplay.textContent = `${role.charAt(0).toUpperCase() + role.slice(1)}`;
            roleDisplayContainer.style.display = 'block';
            
            // Ask for confirmation
            const confirmLogin = confirm(`You are logging in as ${role}. Continue?`);
            
            if (confirmLogin) {
                authToken = data.data.token;
                localStorage.setItem('authToken', authToken);
                currentUser = data.data.user;
                showDashboard();
            }
        } else {
            showAlert(data.message, 'danger');
        }
    } catch (error) {
        console.error('Login error:', error);
        showAlert('Login failed. Please try again.', 'danger');
    }
}
// Show lawyer fields when lawyer role is selected
document.getElementById('reg-role').addEventListener('change', function() {
    const lawyerFields = document.getElementById('lawyer-fields');
    lawyerFields.style.display = this.value === 'lawyer' ? 'block' : 'none';
});

// Role-based UI management
function updateUIForRole(role) {
    // Show/hide elements based on role
    document.querySelectorAll('.client-only, .lawyer-only, .admin-only').forEach(el => {
        el.style.display = 'none';
    });
    
    document.querySelectorAll(`.${role}-only`).forEach(el => {
        el.style.display = 'block';
    });
    
    // Update role display
    document.getElementById('user-role').textContent = `${role.charAt(0).toUpperCase() + role.slice(1)} Dashboard`;
    document.getElementById('user-role-badge').textContent = role.charAt(0).toUpperCase() + role.slice(1);
    
    // Update navigation highlights
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Default to dashboard for all roles
    document.querySelector('.nav-link[data-section="dashboard"]').classList.add('active');
    loadSection('dashboard');
}


// Enhanced registration handler
async function handleRegister(e) {
    e.preventDefault();
    
    const formData = {
        firstName: document.getElementById('reg-firstName').value,
        lastName: document.getElementById('reg-lastName').value,
        email: document.getElementById('reg-email').value,
        password: document.getElementById('reg-password').value,
        role: document.getElementById('reg-role').value,
        phone: document.getElementById('reg-phone').value,
        address: document.getElementById('reg-address').value
    };
    
    // Add lawyer-specific fields if applicable
    if (formData.role === 'lawyer') {
        formData.barNumber = document.getElementById('reg-barNumber').value;
        formData.specialization = document.getElementById('reg-specialization').value;
    }
    
    // Validation
    if (!formData.role) {
        showAlert('Please select a role', 'danger');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('Registration successful! Please login.', 'success');
            showLogin();
            registerForm.reset();
            // Hide lawyer fields
            document.getElementById('lawyer-fields').style.display = 'none';
        } else {
            showAlert(data.message, 'danger');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showAlert('Registration failed. Please try again.', 'danger');
    }
}

async function verifyTokenAndLoadDashboard() {
    try {
        console.log('Verifying token...');
        const response = await fetch(`${API_BASE}/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        console.log('Token verification response:', data);
        
        if (data.success) {
            currentUser = data.data.user;
            showDashboard();
        } else {
            console.log('Token invalid, clearing storage');
            localStorage.removeItem('authToken');
            authToken = null;
            showLogin();
        }
    } catch (error) {
        console.error('Token verification error:', error);
        localStorage.removeItem('authToken');
        authToken = null;
        showLogin();
    }
}

// Real-time notification system
function setupNotifications() {
    // Check for new notifications every 30 seconds
    setInterval(async () => {
        if (authToken && currentUser) {
            try {
                const response = await fetch(`${API_BASE}/notifications/unread`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.data.length > 0) {
                        // Show notifications
                        data.data.forEach(notification => {
                            showAlert(notification.message, 'info');
                        });
                        
                        // Update notification badge
                        updateNotificationBadge(data.data.length);
                    }
                }
            } catch (error) {
                console.error('Error checking notifications:', error);
            }
        }
    }, 30000);
}

// Update notification badge
function updateNotificationBadge(count) {
    let badge = document.getElementById('notification-badge');
    if (!badge) {
        // Create badge if it doesn't exist
        const bellIcon = document.querySelector('a[data-section="notifications"]');
        badge = document.createElement('span');
        badge.id = 'notification-badge';
        badge.className = 'position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger';
        bellIcon.appendChild(badge);
    }
    
    badge.textContent = count;
    badge.style.display = count > 0 ? 'block' : 'none';
}

// Initialize real-time updates when dashboard loads
function initRealTimeUpdates() {
    setupNotifications();
    
    // Refresh dashboard data every minute
    setInterval(() => {
        if (currentSection === 'dashboard') {
            loadDashboardData();
        }
    }, 60000);
}

// Call this after successful login
function showDashboard() {
    loginContainer.classList.add('d-none');
    registerContainer.classList.add('d-none');
    dashboardContainer.classList.remove('d-none');
    
    // Update UI with user info
    welcomeUser.textContent = `Welcome, ${currentUser.firstName} ${currentUser.lastName}`;
    
    // Update UI based on role
    updateUIForRole(currentUser.role);
    
    // Load dashboard data
    loadDashboardData();
    
    // Initialize real-time updates
    initRealTimeUpdates();
}

async function loadDashboardData() {
    try {
        console.log('Loading dashboard data for:', currentUser.role);
        
        // Load stats
        const statsResponse = await fetch(`${API_BASE}/dashboard/stats`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            console.log('Dashboard stats:', statsData);
            
            if (statsData.success) {
                // Update stats based on role
                document.getElementById('total-cases').textContent = statsData.data.totalCases || 0;
                document.getElementById('upcoming-hearings').textContent = statsData.data.upcomingHearings || 0;
                document.getElementById('pending-tasks').textContent = statsData.data.pendingTasks || 0;
                document.getElementById('new-documents').textContent = statsData.data.newDocuments || 0;
                
                // Add role-specific stats
                if (currentUser.role === 'lawyer') {
                    document.getElementById('active-cases').textContent = statsData.data.activeCases || 0;
                    document.getElementById('closed-cases').textContent = statsData.data.closedCases || 0;
                }
            }
        }
        
        // Load recent items based on role
        if (currentUser.role === 'client') {
            await loadClientRecentItems();
        } else if (currentUser.role === 'lawyer') {
            await loadLawyerRecentItems();
        } else {
            await loadAdminRecentItems();
        }
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

async function loadClientRecentItems() {
    // Load client-specific recent items
    const casesResponse = await fetch(`${API_BASE}/cases/my-cases?limit=5`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (casesResponse.ok) {
        const casesData = await casesResponse.json();
        if (casesData.success) {
            displayRecentCases(casesData.data, 'recent-cases-list');
        }
    }
}

async function loadLawyerRecentItems() {
    // Load lawyer-specific recent items
    const [casesResponse, hearingsResponse] = await Promise.all([
        fetch(`${API_BASE}/cases/assigned-cases?limit=5`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        }),
        fetch(`${API_BASE}/hearings/upcoming?limit=5`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        })
    ]);
    
    if (casesResponse.ok) {
        const casesData = await casesResponse.json();
        if (casesData.success) {
            displayRecentCases(casesData.data, 'recent-cases-list');
        }
    }
    
    if (hearingsResponse.ok) {
        const hearingsData = await hearingsResponse.json();
        if (hearingsData.success) {
            displayRecentHearings(hearingsData.data, 'recent-hearings-list');
        }
    }
}

function handleLogout() {
    console.log('Logging out');
    localStorage.removeItem('authToken');
    authToken = null;
    currentUser = null;
    showLogin();
}

// UI functions
function showLogin() {
    loginContainer.classList.remove('d-none');
    registerContainer.classList.add('d-none');
    dashboardContainer.classList.add('d-none');
}

function showRegister() {
    loginContainer.classList.add('d-none');
    registerContainer.classList.remove('d-none');
    dashboardContainer.classList.add('d-none');
}

function showDashboard() {
    loginContainer.classList.add('d-none');
    registerContainer.classList.add('d-none');
    dashboardContainer.classList.remove('d-none');
    
    // Update UI with user info
    welcomeUser.textContent = `Welcome, ${currentUser.firstName} ${currentUser.lastName}`;
    userRole.textContent = `${currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)} Dashboard`;
    
    // Show/hide role-specific menu items
    document.querySelectorAll('.client-only').forEach(el => {
        el.style.display = currentUser.role === 'client' ? 'block' : 'none';
    });
    
    document.querySelectorAll('.lawyer-only').forEach(el => {
        el.style.display = currentUser.role === 'lawyer' ? 'block' : 'none';
    });
    
    // Load dashboard data
    loadDashboardData();
}

function showAlert(message, type) {
    // Remove any existing alerts
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    // Get or create alert container
    let alertContainer = document.getElementById('global-alert-container');
    if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.id = 'global-alert-container';
        alertContainer.style = 'position: fixed; top: 80px; right: 20px; z-index: 9999; width: 300px;';
        document.body.appendChild(alertContainer);
    }
    
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Add alert to container
    alertContainer.appendChild(alert);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
}

// Section loading functions
function loadSection(section) {
    console.log('Loading section:', section);
    
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(el => {
        el.classList.add('d-none');
    });
    
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to current nav link
    const currentLink = document.querySelector(`.nav-link[data-section="${section}"]`);
    if (currentLink) {
        currentLink.classList.add('active');
    }
    
    // Show selected section
    const sectionElement = document.getElementById(`${section}-section`);
    if (sectionElement) {
        sectionElement.classList.remove('d-none');
        loadSectionContent(section);
    }
}

async function loadSectionContent(section) {
    console.log('Loading content for section:', section);
    
    switch(section) {
        case 'dashboard':
            await loadDashboardData();
            break;
        case 'my-cases':
            await loadMyCases();
            break;
        case 'assigned-cases':
            await loadAssignedCases();
            break;
        case 'all-cases':
            await loadAllCases();
            break;
        case 'hearings':
            await loadHearings();
            break;
        case 'documents':
            await loadDocuments();
            break;
        case 'new-case':
            await loadNewCaseForm();
            break;
        case 'notifications':
            await loadNotifications();
            break;
        case 'profile':
            await loadProfile();
            break;
    }
}

// Function to load role-specific dashboard content
async function loadRoleSpecificDashboard() {
    const dashboardContent = document.getElementById('dashboard-content');
    const dashboardTitle = document.getElementById('dashboard-title');
    
    // Clear previous content
    dashboardContent.innerHTML = '';
    
    // Show loading state
    dashboardContent.innerHTML = `
        <div class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading dashboard...</p>
        </div>
    `;
    
    try {
        // Load role-specific dashboard data
        const response = await fetch(`${API_BASE}/dashboard/role-specific`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.success) {
                // Update dashboard title
                dashboardTitle.textContent = `${currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)} Dashboard`;
                
                // Load role-specific dashboard content
                if (currentUser.role === 'client') {
                    loadClientDashboard(data.data, dashboardContent);
                } else if (currentUser.role === 'lawyer') {
                    loadLawyerDashboard(data.data, dashboardContent);
                } else if (currentUser.role === 'admin') {
                    loadAdminDashboard(data.data, dashboardContent);
                }
            }
        }
    } catch (error) {
        console.error('Error loading role-specific dashboard:', error);
        dashboardContent.innerHTML = `
            <div class="alert alert-danger">
                Error loading dashboard. Please try again.
            </div>
        `;
    }
}

// Client dashboard loader
function loadClientDashboard(data, container) {
    container.innerHTML = `
        <div class="row g-4 mb-4">
            <div class="col-md-3">
                <div class="stat-card bg-primary text-white">
                    <div class="stat-card-header">
                        <div class="stat-icon bg-white text-primary">
                            <i class="bi bi-folder"></i>
                        </div>
                    </div>
                    <div class="stat-card-body">
                        <h3 class="stat-number">${data.totalCases || 0}</h3>
                        <p class="stat-title">My Cases</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card bg-success text-white">
                    <div class="stat-card-header">
                        <div class="stat-icon bg-white text-success">
                            <i class="bi bi-calendar-event"></i>
                        </div>
                    </div>
                    <div class="stat-card-body">
                        <h3 class="stat-number">${data.upcomingHearings || 0}</h3>
                        <p class="stat-title">Upcoming Hearings</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card bg-warning text-white">
                    <div class="stat-card-header">
                        <div class="stat-icon bg-white text-warning">
                            <i class="bi bi-chat-dots"></i>
                        </div>
                    </div>
                    <div class="stat-card-body">
                        <h3 class="stat-number">${data.unreadMessages || 0}</h3>
                        <p class="stat-title">Unread Messages</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card bg-info text-white">
                    <div class="stat-card-header">
                        <div class="stat-icon bg-white text-info">
                            <i class="bi bi-file-earmark"></i>
                        </div>
                    </div>
                    <div class="stat-card-body">
                        <h3 class="stat-number">${data.newDocuments || 0}</h3>
                        <p class="stat-title">New Documents</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row g-4">
            <div class="col-md-6">
                <div class="content-card">
                    <div class="card-header">
                        <i class="bi bi-calendar-event"></i>
                        Recent Hearings
                    </div>
                    <div class="card-body">
                        ${data.recentHearings && data.recentHearings.length > 0 ? 
                            data.recentHearings.map(hearing => `
                                <div class="list-group-item">
                                    <div class="d-flex w-100 justify-content-between">
                                        <h6 class="mb-1">${hearing.title}</h6>
                                        <small>${new Date(hearing.hearingDate).toLocaleDateString()}</small>
                                    </div>
                                    <p class="mb-1">${hearing.caseTitle} - ${hearing.location || 'No location'}</p>
                                </div>
                            `).join('') : 
                            '<p class="text-center text-muted">No upcoming hearings</p>'
                        }
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="content-card">
                    <div class="card-header">
                        <i class="bi bi-folder"></i>
                        My Recent Cases
                    </div>
                    <div class="card-body">
                        ${data.recentCases && data.recentCases.length > 0 ? 
                            data.recentCases.map(caseItem => `
                                <div class="list-group-item">
                                    <div class="d-flex w-100 justify-content-between">
                                        <h6 class="mb-1">${caseItem.title}</h6>
                                        <span class="badge bg-${getStatusBadgeColor(caseItem.status)}">${caseItem.status}</span>
                                    </div>
                                    <p class="mb-1">${caseItem.caseNumber} - ${caseItem.caseType}</p>
                                    <small>Assigned to: ${caseItem.assignedLawyer || 'Not assigned'}</small>
                                </div>
                            `).join('') : 
                            '<p class="text-center text-muted">No cases found</p>'
                        }
                    </div>
                </div>
            </div>
        </div>
        
        <div class="mt-4">
            <div class="content-card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0"><i class="bi bi-lightning"></i> Quick Actions</h5>
                </div>
                <div class="card-body">
                    <div class="d-grid gap-2 d-md-flex">
                        <button class="btn btn-primary me-md-2" onclick="loadSection('new-case')">
                            <i class="bi bi-plus-circle me-1"></i> Create New Case
                        </button>
                        <button class="btn btn-outline-primary me-md-2" onclick="loadSection('documents')">
                            <i class="bi bi-upload me-1"></i> Upload Document
                        </button>
                        <button class="btn btn-outline-secondary" onclick="loadSection('hearings')">
                            <i class="bi bi-calendar-plus me-1"></i> Schedule Hearing
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Lawyer dashboard loader
function loadLawyerDashboard(data, container) {
    container.innerHTML = `
        <div class="row g-4 mb-4">
            <div class="col-md-3">
                <div class="stat-card bg-primary text-white">
                    <div class="stat-card-header">
                        <div class="stat-icon bg-white text-primary">
                            <i class="bi bi-briefcase"></i>
                        </div>
                    </div>
                    <div class="stat-card-body">
                        <h3 class="stat-number">${data.assignedCases || 0}</h3>
                        <p class="stat-title">Assigned Cases</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card bg-success text-white">
                    <div class="stat-card-header">
                        <div class="stat-icon bg-white text-success">
                            <i class="bi bi-calendar-event"></i>
                        </div>
                    </div>
                    <div class="stat-card-body">
                        <h3 class="stat-number">${data.upcomingHearings || 0}</h3>
                        <p class="stat-title">Upcoming Hearings</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card bg-warning text-white">
                    <div class="stat-card-header">
                        <div class="stat-icon bg-white text-warning">
                            <i class="bi bi-list-task"></i>
                        </div>
                    </div>
                    <div class="stat-card-body">
                        <h3 class="stat-number">${data.pendingTasks || 0}</h3>
                        <p class="stat-title">Pending Tasks</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card bg-info text-white">
                    <div class="stat-card-header">
                        <div class="stat-icon bg-white text-info">
                            <i class="bi bi-chat-dots"></i>
                        </div>
                    </div>
                    <div class="stat-card-body">
                        <h3 class="stat-number">${data.clientMessages || 0}</h3>
                        <p class="stat-title">Client Messages</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row g-4">
            <div class="col-md-6">
                <div class="content-card">
                    <div class="card-header">
                        <i class="bi bi-calendar-event"></i>
                        Today's Hearings
                    </div>
                    <div class="card-body">
                        ${data.todayHearings && data.todayHearings.length > 0 ? 
                            data.todayHearings.map(hearing => `
                                <div class="list-group-item">
                                    <div class="d-flex w-100 justify-content-between">
                                        <h6 class="mb-1">${hearing.title}</h6>
                                        <small>${new Date(hearing.hearingDate).toLocaleTimeString()}</small>
                                    </div>
                                    <p class="mb-1">${hearing.caseTitle} - ${hearing.location || 'No location'}</p>
                                    <small class="text-muted">Client: ${hearing.clientName}</small>
                                </div>
                            `).join('') : 
                            '<p class="text-center text-muted">No hearings today</p>'
                        }
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="content-card">
                    <div class="card-header">
                        <i class="bi bi-folder"></i>
                        Recent Case Assignments
                    </div>
                    <div class="card-body">
                        ${data.recentCases && data.recentCases.length > 0 ? 
                            data.recentCases.map(caseItem => `
                                <div class="list-group-item">
                                    <div class="d-flex w-100 justify-content-between">
                                        <h6 class="mb-1">${caseItem.title}</h6>
                                        <span class="badge bg-${getStatusBadgeColor(caseItem.status)}">${caseItem.status}</span>
                                    </div>
                                    <p class="mb-1">${caseItem.caseNumber} - ${caseItem.caseType}</p>
                                    <small class="text-muted">Client: ${caseItem.clientName}</small>
                                    <div class="mt-2">
                                        <span class="badge bg-${caseItem.priority === 'high' ? 'danger' : caseItem.priority === 'medium' ? 'warning' : 'secondary'}">
                                            Priority: ${caseItem.priority}
                                        </span>
                                    </div>
                                </div>
                            `).join('') : 
                            '<p class="text-center text-muted">No recent case assignments</p>'
                        }
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row g-4 mt-2">
            <div class="col-md-6">
                <div class="content-card">
                    <div class="card-header">
                        <i class="bi bi-list-task"></i>
                        Urgent Tasks
                    </div>
                    <div class="card-body">
                        ${data.urgentTasks && data.urgentTasks.length > 0 ? 
                            data.urgentTasks.map(task => `
                                <div class="list-group-item">
                                    <div class="d-flex w-100 justify-content-between">
                                        <h6 class="mb-1">${task.title}</h6>
                                        <small>Due: ${new Date(task.dueDate).toLocaleDateString()}</small>
                                    </div>
                                    <p class="mb-1">${task.description}</p>
                                    <span class="badge bg-${task.priority === 'high' ? 'danger' : 'warning'}">
                                        ${task.priority} priority
                                    </span>
                                </div>
                            `).join('') : 
                            '<p class="text-center text-muted">No urgent tasks</p>'
                        }
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="content-card">
                    <div class="card-header">
                        <i class="bi bi-clock-history"></i>
                        Recent Activities
                    </div>
                    <div class="card-body">
                        ${data.recentActivities && data.recentActivities.length > 0 ? 
                            data.recentActivities.map(activity => `
                                <div class="list-group-item">
                                    <div class="d-flex w-100 justify-content-between">
                                        <h6 class="mb-1">${activity.type}</h6>
                                        <small>${new Date(activity.timestamp).toLocaleDateString()}</small>
                                    </div>
                                    <p class="mb-1">${activity.description}</p>
                                    <small class="text-muted">Case: ${activity.caseTitle}</small>
                                </div>
                            `).join('') : 
                            '<p class="text-center text-muted">No recent activities</p>'
                        }
                    </div>
                </div>
            </div>
        </div>
        
        <div class="mt-4">
            <div class="content-card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0"><i class="bi bi-lightning"></i> Quick Actions</h5>
                </div>
                <div class="card-body">
                    <div class="d-grid gap-2 d-md-flex">
                        <button class="btn btn-primary me-md-2" onclick="loadSection('assigned-cases')">
                            <i class="bi bi-briefcase me-1"></i> View Cases
                        </button>
                        <button class="btn btn-success me-md-2" onclick="loadSection('manage-hearings')">
                            <i class="bi bi-calendar-check me-1"></i> Manage Hearings
                        </button>
                        <button class="btn btn-info me-md-2" onclick="loadSection('documents')">
                            <i class="bi bi-file-earmark me-1"></i> Review Documents
                        </button>
                        <button class="btn btn-warning" onclick="loadSection('tasks')">
                            <i class="bi bi-list-task me-1"></i> View Tasks
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}


// Admin dashboard loader
function loadAdminDashboard(data, container) {
    container.innerHTML = `
        <div class="row g-4 mb-4">
            <div class="col-md-3">
                <div class="stat-card bg-primary text-white">
                    <div class="stat-card-header">
                        <div class="stat-icon bg-white text-primary">
                            <i class="bi bi-people"></i>
                        </div>
                    </div>
                    <div class="stat-card-body">
                        <h3 class="stat-number">${data.totalUsers || 0}</h3>
                        <p class="stat-title">Total Users</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card bg-success text-white">
                    <div class="stat-card-header">
                        <div class="stat-icon bg-white text-success">
                            <i class="bi bi-folder"></i>
                        </div>
                    </div>
                    <div class="stat-card-body">
                        <h3 class="stat-number">${data.totalCases || 0}</h3>
                        <p class="stat-title">Total Cases</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card bg-warning text-white">
                    <div class="stat-card-header">
                        <div class="stat-icon bg-white text-warning">
                            <i class="bi bi-building"></i>
                        </div>
                    </div>
                    <div class="stat-card-body">
                        <h3 class="stat-number">${data.activeLawyers || 0}</h3>
                        <p class="stat-title">Active Lawyers</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card bg-info text-white">
                    <div class="stat-card-header">
                        <div class="stat-icon bg-white text-info">
                            <i class="bi bi-graph-up"></i>
                        </div>
                    </div>
                    <div class="stat-card-body">
                        <h3 class="stat-number">${data.monthlyGrowth || 0}%</h3>
                        <p class="stat-title">Monthly Growth</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row g-4">
            <div class="col-md-6">
                <div class="content-card">
                    <div class="card-header">
                        <i class="bi bi-activity"></i>
                        System Overview
                    </div>
                    <div class="card-body">
                        <div class="row text-center">
                            <div class="col-md-4">
                                <h4>${data.clientsCount || 0}</h4>
                                <p class="text-muted">Clients</p>
                            </div>
                            <div class="col-md-4">
                                <h4>${data.lawyersCount || 0}</h4>
                                <p class="text-muted">Lawyers</p>
                            </div>
                            <div class="col-md-4">
                                <h4>${data.adminsCount || 0}</h4>
                                <p class="text-muted">Admins</p>
                            </div>
                        </div>
                        <hr>
                        <div class="row text-center">
                            <div class="col-md-6">
                                <h4>${data.openCases || 0}</h4>
                                <p class="text-muted">Open Cases</p>
                            </div>
                            <div class="col-md-6">
                                <h4>${data.closedCases || 0}</h4>
                                <p class="text-muted">Closed Cases</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="content-card">
                    <div class="card-header">
                        <i class="bi bi-exclamation-triangle"></i>
                        Requires Attention
                    </div>
                    <div class="card-body">
                        ${data.attentionItems && data.attentionItems.length > 0 ? 
                            data.attentionItems.map(item => `
                                <div class="list-group-item">
                                    <div class="d-flex w-100 justify-content-between">
                                        <h6 class="mb-1 text-${item.priority === 'high' ? 'danger' : 'warning'}">
                                            ${item.title}
                                        </h6>
                                        <span class="badge bg-${item.priority === 'high' ? 'danger' : 'warning'}">
                                            ${item.priority}
                                        </span>
                                    </div>
                                    <p class="mb-1">${item.description}</p>
                                    <small class="text-muted">${item.timestamp}</small>
                                </div>
                            `).join('') : 
                            '<p class="text-center text-muted">No items requiring attention</p>'
                        }
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row g-4 mt-2">
            <div class="col-md-6">
                <div class="content-card">
                    <div class="card-header">
                        <i class="bi bi-graph-up"></i>
                        Recent System Activity
                    </div>
                    <div class="card-body">
                        ${data.systemActivities && data.systemActivities.length > 0 ? 
                            data.systemActivities.map(activity => `
                                <div class="list-group-item">
                                    <div class="d-flex w-100 justify-content-between">
                                        <h6 class="mb-1">${activity.type}</h6>
                                        <small>${new Date(activity.timestamp).toLocaleDateString()}</small>
                                    </div>
                                    <p class="mb-1">${activity.description}</p>
                                    <small class="text-muted">By: ${activity.user}</small>
                                </div>
                            `).join('') : 
                            '<p class="text-center text-muted">No recent system activities</p>'
                        }
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="content-card">
                    <div class="card-header">
                        <i class="bi bi-clock-history"></i>
                        Recent User Registrations
                    </div>
                    <div class="card-body">
                        ${data.recentRegistrations && data.recentRegistrations.length > 0 ? 
                            data.recentRegistrations.map(user => `
                                <div class="list-group-item">
                                    <div class="d-flex w-100 justify-content-between">
                                        <h6 class="mb-1">${user.name}</h6>
                                        <span class="badge bg-${user.role === 'admin' ? 'danger' : user.role === 'lawyer' ? 'info' : 'secondary'}">
                                            ${user.role}
                                        </span>
                                    </div>
                                    <p class="mb-1">${user.email}</p>
                                    <small class="text-muted">Registered: ${new Date(user.registrationDate).toLocaleDateString()}</small>
                                </div>
                            `).join('') : 
                            '<p class="text-center text-muted">No recent registrations</p>'
                        }
                    </div>
                </div>
            </div>
        </div>
        
        <div class="mt-4">
            <div class="content-card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0"><i class="bi bi-lightning"></i> Admin Quick Actions</h5>
                </div>
                <div class="card-body">
                    <div class="d-grid gap-2 d-md-flex">
                        <button class="btn btn-primary me-md-2" onclick="loadSection('user-management')">
                            <i class="bi bi-people me-1"></i> Manage Users
                        </button>
                        <button class="btn btn-success me-md-2" onclick="loadSection('all-cases')">
                            <i class="bi bi-folder me-1"></i> View All Cases
                        </button>
                        <button class="btn btn-info me-md-2" onclick="loadSection('system-settings')">
                            <i class="bi bi-gear me-1"></i> System Settings
                        </button>
                        <button class="btn btn-warning" onclick="loadSection('reports')">
                            <i class="bi bi-graph-up me-1"></i> Generate Reports
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Similar functions would be needed for loadLawyerDashboard() and loadAdminDashboard()

async function loadDashboardData() {
    try {
        console.log('Loading dashboard data...');
        
        // Load stats
        const statsResponse = await fetch(`${API_BASE}/dashboard/stats`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            console.log('Dashboard stats:', statsData);
            
            if (statsData.success) {
                document.getElementById('total-cases').textContent = statsData.data.totalCases || 0;
                document.getElementById('upcoming-hearings').textContent = statsData.data.upcomingHearings || 0;
                document.getElementById('pending-tasks').textContent = statsData.data.pendingTasks || 0;
                document.getElementById('new-documents').textContent = statsData.data.newDocuments || 0;
            }
        }
        
        // Load recent hearings
        const hearingsResponse = await fetch(`${API_BASE}/hearings?limit=5`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (hearingsResponse.ok) {
            const hearingsData = await hearingsResponse.json();
            const hearingsList = document.getElementById('recent-hearings-list');
            
            if (hearingsData.success && hearingsData.data.length > 0) {
                hearingsList.innerHTML = hearingsData.data.map(hearing => `
                    <div class="list-group-item">
                        <div class="d-flex w-100 justify-content-between">
                            <h6 class="mb-1">${hearing.title}</h6>
                            <small>${new Date(hearing.hearingDate).toLocaleDateString()}</small>
                        </div>
                        <p class="mb-1">${hearing.case?.title || 'No case title'} - ${hearing.location || 'No location'}</p>
                    </div>
                `).join('');
            } else {
                hearingsList.innerHTML = '<p class="text-center text-muted">No upcoming hearings</p>';
            }
        }
        
        // Load recent cases
        const casesEndpoint = currentUser.role === 'client' ? '/cases/my-cases' : '/cases';
        const casesResponse = await fetch(`${API_BASE}${casesEndpoint}?limit=5`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (casesResponse.ok) {
            const casesData = await casesResponse.json();
            const casesList = document.getElementById('recent-cases-list');
            
            if (casesData.success && casesData.data.length > 0) {
                casesList.innerHTML = casesData.data.map(caseItem => `
                    <div class="list-group-item">
                        <div class="d-flex w-100 justify-content-between">
                            <h6 class="mb-1">${caseItem.title}</h6>
                            <span class="badge bg-${getStatusBadgeColor(caseItem.status)}">${caseItem.status?.replace('_', ' ') || 'unknown'}</span>
                        </div>
                        <p class="mb-1">${caseItem.caseNumber || 'No case number'} - ${caseItem.caseType || 'No type'}</p>
                    </div>
                `).join('');
            } else {
                casesList.innerHTML = '<p class="text-center text-muted">No recent cases</p>';
            }
        }
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

function getStatusBadgeColor(status) {
    switch(status) {
        case 'open': return 'primary';
        case 'in_progress': return 'info';
        case 'closed': return 'success';
        case 'dismissed': return 'secondary';
        default: return 'light';
    }
}

// Placeholder functions for other sections
// Placeholder functions for other sections
async function loadMyCases() {
    document.getElementById('my-cases-section').innerHTML = `
        <h2 class="mb-4">My Cases</h2>
        <div class="text-center">
            <p>Loading cases...</p>
        </div>
    `;
    
    try {
        const response = await fetch(`${API_BASE}/cases/my-cases`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('My cases response:', data);
            
            if (data.success) {
                // Implement case display logic here
                const casesContainer = document.getElementById('my-cases-section');
                casesContainer.innerHTML = `
                    <h2 class="mb-4">My Cases</h2>
                    <div class="table-responsive">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Case Number</th>
                                    <th>Title</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Filing Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.data.map(caseItem => `
                                    <tr>
                                        <td>${caseItem.caseNumber || 'N/A'}</td>
                                        <td>${caseItem.title}</td>
                                        <td>${caseItem.caseType || 'N/A'}</td>
                                        <td><span class="badge bg-${getStatusBadgeColor(caseItem.status)}">${caseItem.status || 'N/A'}</span></td>
                                        <td>${caseItem.filingDate ? new Date(caseItem.filingDate).toLocaleDateString() : 'N/A'}</td>
                                        <td>
                                            <button class="btn btn-sm btn-primary view-case" data-id="${caseItem.id}">View</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
                
                // Add event listeners to view buttons
                document.querySelectorAll('.view-case').forEach(button => {
                    button.addEventListener('click', function() {
                        const caseId = this.getAttribute('data-id');
                        viewCaseDetails(caseId);
                    });
                });
                
            } else {
                document.getElementById('my-cases-section').innerHTML = `
                    <h2 class="mb-4">My Cases</h2>
                    <div class="alert alert-warning">
                        ${data.message || 'No cases found.'}
                    </div>
                `;
            }
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error loading my cases:', error);
        document.getElementById('my-cases-section').innerHTML = `
            <h2 class="mb-4">My Cases</h2>
            <div class="alert alert-danger">
                Error loading cases: ${error.message}
            </div>
        `;
    }
}


// Add this helper function if you don't have it already
function getStatusBadgeColor(status) {
    switch(status) {
        case 'open': return 'primary';
        case 'in_progress': return 'info';
        case 'closed': return 'success';
        case 'dismissed': return 'secondary';
        default: return 'light';
    }
}

// Add this function to handle case details viewing
async function viewCaseDetails(caseId) {
    try {
        const response = await fetch(`${API_BASE}/cases/${caseId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                // Show case details in a modal or dedicated page
                console.log('Case details:', data.data);
                // Implement case details display logic here
            }
        }
    } catch (error) {
        console.error('Error loading case details:', error);
        showAlert('Error loading case details', 'danger');
    }
}
async function loadAssignedCases() {
    document.getElementById('assigned-cases-section').innerHTML = `
        <h2 class="mb-4">Assigned Cases</h2>
        <div class="text-center">
            <p>Loading assigned cases...</p>
        </div>
    `;
}

async function loadAllCases() {
    document.getElementById('all-cases-section').innerHTML = `
        <h2 class="mb-4">All Cases</h2>
        <div class="text-center">
            <p>Loading all cases...</p>
        </div>
    `;
}

async function loadHearings() {
    document.getElementById('hearings-section').innerHTML = `
        <h2 class="mb-4">Hearings</h2>
        <div class="text-center">
            <p>Loading hearings...</p>
        </div>
    `;
}

async function loadDocuments() {
    document.getElementById('documents-section').innerHTML = `
        <h2 class="mb-4">Documents</h2>
        <div class="text-center">
            <p>Loading documents...</p>
        </div>
    `;
}

async function loadNewCaseForm() {
    document.getElementById('new-case-section').innerHTML = `
        <h2 class="mb-4">Create New Case</h2>
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-body">
                        <form id="new-case-form">
                            <div class="mb-3">
                                <label for="case-title" class="form-label">Case Title</label>
                                <input type="text" class="form-control" id="case-title" required>
                            </div>
                            <div class="mb-3">
                                <label for="case-type" class="form-label">Case Type</label>
                                <select class="form-select" id="case-type" required>
                                    <option value="">Select case type</option>
                                    <option value="criminal">Criminal Case</option>
                                    <option value="civil">Civil Case</option>
                                    <option value="family">Family Law Case</option>
                                    <option value="corporate">Corporate Case</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="case-description" class="form-label">Description</label>
                                <textarea class="form-control" id="case-description" rows="4" required></textarea>
                            </div>
                            <div class="mb-3">
                                <label for="filing-date" class="form-label">Filing Date</label>
                                <input type="date" class="form-control" id="filing-date" required>
                            </div>
                            <div class="mb-3">
                                <label for="court" class="form-label">Court</label>
                                <input type="text" class="form-control" id="court">
                            </div>
                            <button type="submit" class="btn btn-primary">Create Case</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add form submission handler with enhanced error handling
    document.getElementById('new-case-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const caseData = {
            title: document.getElementById('case-title').value,
            caseType: document.getElementById('case-type').value,
            description: document.getElementById('case-description').value,
            filingDate: document.getElementById('filing-date').value,
            court: document.getElementById('court').value
        };
        
        try {
            console.log('Creating case with data:', caseData);
            
            const response = await fetch(`${API_BASE}/cases`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(caseData)
            });
            
            console.log('Case creation response status:', response.status);
            
            // Handle non-JSON responses
            const responseText = await response.text();
            console.log('Raw response:', responseText);
            
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('Failed to parse JSON response:', parseError);
                showAlert('Server returned invalid response. Please check console for details.', 'danger');
                return;
            }
            
            if (data.success) {
                showAlert('Case created successfully!', 'success');
                this.reset();
                loadSection('my-cases');
            } else {
                console.error('Server error response:', data);
                showAlert(data.message || 'Error creating case. Please check console.', 'danger');
            }
        } catch (error) {
            console.error('Network error creating case:', error);
            showAlert('Network error. Please check console and try again.', 'danger');
        }
    });
}

async function loadNotifications() {
    document.getElementById('notifications-section').innerHTML = `
        <h2 class="mb-4">Notifications</h2>
        <div class="text-center">
            <p>Loading notifications...</p>
        </div>
    `;
}

async function loadProfile() {
    document.getElementById('profile-section').innerHTML = `
        <h2 class="mb-4">My Profile</h2>
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-body">
                        <form id="profile-form">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="profile-firstName" class="form-label">First Name</label>
                                        <input type="text" class="form-control" id="profile-firstName" value="${currentUser.firstName}" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="profile-lastName" class="form-label">Last Name</label>
                                        <input type="text" class="form-control" id="profile-lastName" value="${currentUser.lastName}" required>
                                    </div>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="profile-email" class="form-label">Email address</label>
                                <input type="email" class="form-control" id="profile-email" value="${currentUser.email}" disabled>
                                <div class="form-text">Email cannot be changed</div>
                            </div>
                            <div class="mb-3">
                                <label for="profile-phone" class="form-label">Phone Number</label>
                                <input type="tel" class="form-control" id="profile-phone" value="${currentUser.phone || ''}">
                            </div>
                            <div class="mb-3">
                                <label for="profile-address" class="form-label">Address</label>
                                <textarea class="form-control" id="profile-address" rows="2">${currentUser.address || ''}</textarea>
                            </div>
                            <button type="submit" class="btn btn-primary">Update Profile</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('profile-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const profileData = {
            firstName: document.getElementById('profile-firstName').value,
            lastName: document.getElementById('profile-lastName').value,
            phone: document.getElementById('profile-phone').value,
            address: document.getElementById('profile-address').value
        };
        
        try {
            const response = await fetch(`${API_BASE}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(profileData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                showAlert('Profile updated successfully!', 'success');
                currentUser = data.data.user;
                welcomeUser.textContent = `Welcome, ${currentUser.firstName} ${currentUser.lastName}`;
            } else {
                showAlert(data.message, 'danger');
            }
        } catch (error) {
            showAlert('Error updating profile. Please try again.', 'danger');
        }
    });
}