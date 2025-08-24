-- Create database
CREATE DATABASE IF NOT EXISTS legal_case_management;
USE legal_case_management;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'lawyer', 'client') NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    isActive BOOLEAN DEFAULT TRUE,
    lastLogin DATETIME,
    profileImage VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Admins
CREATE TABLE admins (
    id INT PRIMARY KEY,
    adminLevel ENUM('super', 'regular') DEFAULT 'regular',
    permissions TEXT,
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

-- Lawyers
CREATE TABLE lawyers (
    id INT PRIMARY KEY,
    barNumber VARCHAR(50) UNIQUE NOT NULL,
    specialization VARCHAR(100),
    yearsOfExperience INT,
    hourlyRate DECIMAL(10,2),
    barAssociation VARCHAR(100),
    licenseDate DATE,
    isVerified BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

-- Clients
CREATE TABLE clients (
    id INT PRIMARY KEY,
    dateOfBirth DATE,
    emergencyContact VARCHAR(100),
    emergencyPhone VARCHAR(20),
    companyName VARCHAR(100),
    clientType ENUM('individual', 'corporate') DEFAULT 'individual',
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

-- Cases
CREATE TABLE cases (
    id INT PRIMARY KEY AUTO_INCREMENT,
    caseNumber VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    caseType ENUM('criminal', 'civil', 'family', 'corporate', 'personal_injury', 'divorce', 'other') NOT NULL,
    status ENUM('open', 'in_progress', 'closed', 'dismissed') DEFAULT 'open',
    filingDate DATE NOT NULL,
    court VARCHAR(100),
    judge VARCHAR(100),
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    clientId INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE
);

-- Case-lawyer assignments
CREATE TABLE case_lawyer_assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    caseId INT NOT NULL,
    lawyerId INT NOT NULL,
    assignmentDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role ENUM('lead', 'associate', 'support') DEFAULT 'associate',
    notes TEXT,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (caseId) REFERENCES cases(id) ON DELETE CASCADE,
    FOREIGN KEY (lawyerId) REFERENCES lawyers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_case_lawyer (caseId, lawyerId)
);

-- Case status history
CREATE TABLE case_status_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    caseId INT NOT NULL,
    status ENUM('open', 'in_progress', 'closed', 'dismissed') NOT NULL,
    changedBy INT NOT NULL,
    changeDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (caseId) REFERENCES cases(id) ON DELETE CASCADE,
    FOREIGN KEY (changedBy) REFERENCES users(id) ON DELETE CASCADE
);

-- Communications
CREATE TABLE communications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    caseId INT NOT NULL,
    fromUserId INT NOT NULL,
    toUserId INT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    communicationType ENUM('email', 'letter', 'phone', 'meeting', 'other') DEFAULT 'email',
    dateSent TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    isRead BOOLEAN DEFAULT FALSE,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (caseId) REFERENCES cases(id) ON DELETE CASCADE,
    FOREIGN KEY (fromUserId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (toUserId) REFERENCES users(id) ON DELETE CASCADE
);

-- Documents
CREATE TABLE documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    caseId INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    fileName VARCHAR(255) NOT NULL,
    filePath VARCHAR(500) NOT NULL,
    fileSize INT,
    fileType VARCHAR(50),
    uploadedBy INT NOT NULL,
    uploadDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    category ENUM('pleading', 'evidence', 'motion', 'order', 'brief', 'contract', 'other') DEFAULT 'other',
    version INT DEFAULT 1,
    isLatest BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (caseId) REFERENCES cases(id) ON DELETE CASCADE,
    FOREIGN KEY (uploadedBy) REFERENCES users(id) ON DELETE CASCADE
);

-- Hearings
CREATE TABLE hearings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    caseId INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    hearingDate DATETIME NOT NULL,
    location VARCHAR(255),
    purpose TEXT,
    outcome TEXT,
    status ENUM('scheduled', 'completed', 'cancelled', 'postponed') DEFAULT 'scheduled',
    duration INT,
    judge VARCHAR(100),
    opposingCounsel VARCHAR(100),
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (caseId) REFERENCES cases(id) ON DELETE CASCADE
);

-- Invoices
CREATE TABLE invoices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    caseId INT NOT NULL,
    clientId INT NOT NULL,
    invoiceNumber VARCHAR(50) UNIQUE NOT NULL,
    issueDate DATE NOT NULL,
    dueDate DATE NOT NULL,
    status ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled') DEFAULT 'draft',
    totalAmount DECIMAL(10,2) NOT NULL DEFAULT 0,
    taxAmount DECIMAL(10,2) DEFAULT 0,
    discountAmount DECIMAL(10,2) DEFAULT 0,
    finalAmount DECIMAL(10,2) NOT NULL DEFAULT 0,
    notes TEXT,
    terms TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (caseId) REFERENCES cases(id) ON DELETE CASCADE,
    FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE
);

-- Tasks
CREATE TABLE tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    caseId INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assignedTo INT NOT NULL,
    dueDate DATETIME,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    completedDate DATETIME,
    estimatedHours FLOAT,
    actualHours FLOAT,
    tags VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (caseId) REFERENCES cases(id) ON DELETE CASCADE,
    FOREIGN KEY (assignedTo) REFERENCES users(id) ON DELETE CASCADE
);

-- Time entries
CREATE TABLE time_entries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    caseId INT NOT NULL,
    lawyerId INT NOT NULL,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    hours FLOAT NOT NULL,
    rate DECIMAL(10,2) NOT NULL,
    totalAmount DECIMAL(10,2) NOT NULL,
    taskType ENUM('research', 'drafting', 'meeting', 'court', 'communication', 'other') DEFAULT 'other',
    isBilled BOOLEAN DEFAULT FALSE,
    invoiceId INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (caseId) REFERENCES cases(id) ON DELETE CASCADE,
    FOREIGN KEY (lawyerId) REFERENCES lawyers(id) ON DELETE CASCADE,
    FOREIGN KEY (invoiceId) REFERENCES invoices(id) ON DELETE SET NULL
);

-- Payments
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    invoiceId INT NOT NULL,
    paymentDate DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    paymentMethod ENUM('credit_card', 'debit_card', 'bank_transfer', 'check', 'cash', 'other') DEFAULT 'bank_transfer',
    referenceNumber VARCHAR(100),
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    notes TEXT,
    processedBy INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (invoiceId) REFERENCES invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (processedBy) REFERENCES users(id) ON DELETE SET NULL
);

-- Default admin
INSERT INTO users (firstName, lastName, email, password, role, isActive) 
VALUES ('System', 'Admin', 'admin@legalcase.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', TRUE);

INSERT INTO admins (id, adminLevel, permissions) 
VALUES (LAST_INSERT_ID(), 'super', 'all');
