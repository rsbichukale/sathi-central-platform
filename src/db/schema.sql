-- Central Platform Database Schema
-- Optimized for PostgreSQL

-- 1. Clients & API Keys Table
CREATE TABLE IF NOT EXISTS clients (
    id VARCHAR(36) PRIMARY KEY,
    client_id VARCHAR(50) UNIQUE NOT NULL,
    client_secret_hash VARCHAR(255) NOT NULL,
    api_key VARCHAR(100) UNIQUE NOT NULL,
    api_key_status VARCHAR(20) DEFAULT 'ACTIVE',
    firm_name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(100),
    mobile_no VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(100),
    gstin VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    auto_sync_farmers INTEGER DEFAULT 1,
    auto_sync_dealers INTEGER DEFAULT 1,
    sync_interval_mins INTEGER DEFAULT 15,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Machine Bindings Table
CREATE TABLE IF NOT EXISTS machine_bindings (
    id VARCHAR(36) PRIMARY KEY,
    client_id VARCHAR(36) REFERENCES clients(id) ON DELETE CASCADE,
    request_code VARCHAR(50) UNIQUE NOT NULL,
    hardware_mac_address VARCHAR(100),
    tally_serial_number VARCHAR(50),
    tally_company_guid VARCHAR(100),
    last_seen_ip VARCHAR(50),
    last_heartbeat_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Subscriptions & Licenses Table
CREATE TABLE IF NOT EXISTS subscriptions (
    id VARCHAR(36) PRIMARY KEY,
    client_id VARCHAR(36) REFERENCES clients(id) ON DELETE CASCADE,
    activation_key VARCHAR(50) UNIQUE NOT NULL,
    plan_type VARCHAR(50) DEFAULT 'ANNUAL_PRO',
    status VARCHAR(20) DEFAULT 'ACTIVE',
    starts_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    max_machines INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Central Shared Farmer Registry
CREATE TABLE IF NOT EXISTS shared_farmer_registry (
    id VARCHAR(36) PRIMARY KEY,
    global_farmer_id VARCHAR(50) UNIQUE,
    farmer_name VARCHAR(150) NOT NULL,
    mobile_no VARCHAR(15) NOT NULL,
    village_name VARCHAR(100),
    block_name VARCHAR(100),
    district_name VARCHAR(100),
    state_name VARCHAR(100),
    pincode VARCHAR(10),
    contributed_by_client VARCHAR(36) REFERENCES clients(id) ON DELETE SET NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Central Shared Dealer Registry
CREATE TABLE IF NOT EXISTS shared_dealer_registry (
    id VARCHAR(36) PRIMARY KEY,
    gstin VARCHAR(20) UNIQUE,
    dealer_name VARCHAR(150) NOT NULL,
    firm_name VARCHAR(200),
    mobile_no VARCHAR(15),
    city_village VARCHAR(100),
    district_name VARCHAR(100),
    state_name VARCHAR(100),
    contributed_by_client VARCHAR(36) REFERENCES clients(id) ON DELETE SET NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Razorpay Payment History Table
CREATE TABLE IF NOT EXISTS payment_history (
    id VARCHAR(36) PRIMARY KEY,
    client_id VARCHAR(36) REFERENCES clients(id) ON DELETE CASCADE,
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100) UNIQUE,
    razorpay_signature VARCHAR(255),
    amount INTEGER NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(30) DEFAULT 'CAPTURED',
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Inquiries / Lead Submissions Table
CREATE TABLE IF NOT EXISTS inquiries (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    mobile VARCHAR(15) NOT NULL,
    email VARCHAR(100),
    service VARCHAR(200) DEFAULT 'General Inquiry',
    message TEXT,
    status VARCHAR(20) DEFAULT 'NEW',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Central System Audit Logs Table
CREATE TABLE IF NOT EXISTS system_logs (
    id VARCHAR(36) PRIMARY KEY,
    level VARCHAR(10) DEFAULT 'INFO',         -- INFO, WARN, ERROR, SECURITY
    category VARCHAR(50) NOT NULL,            -- AUTH, REGISTRATION, PAYMENT, LICENSE, SYNC, EMAIL, ADMIN
    event_action VARCHAR(100) NOT NULL,        -- e.g., 'COMPANY_REGISTERED', 'PAYMENT_VERIFIED', 'LICENSE_REVOKED'
    client_id VARCHAR(36),
    request_code VARCHAR(50),
    ip_address VARCHAR(50),
    details TEXT,                              -- JSON payload or summary
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Email Dispatch & Notification History Logs Table
CREATE TABLE IF NOT EXISTS email_logs (
    id VARCHAR(36) PRIMARY KEY,
    recipient_email VARCHAR(150) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    template_type VARCHAR(50) NOT NULL,        -- ACTIVATION_KEY, SALES_INQUIRY, EXPIRY_WARNING, PASSWORD_OTP, STATUS_CHANGE, TEST_EMAIL
    status VARCHAR(20) DEFAULT 'SENT',         -- SENT, FAILED, DEV_MODE
    message_id VARCHAR(150),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Admin Users Table (Multi-User Admin Management)
CREATE TABLE IF NOT EXISTS admin_users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'ADMIN',          -- SUPER_ADMIN, ADMIN, VIEWER
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. System Settings Table (Dynamic Configuration)
CREATE TABLE IF NOT EXISTS system_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
