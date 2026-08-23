CREATE TABLE users (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(254) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  phone VARCHAR(30) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE addresses (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  label VARCHAR(80) NOT NULL,
  address VARCHAR(255) NOT NULL,
  city VARCHAR(80) NOT NULL,
  postal_code VARCHAR(20) NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_addresses_user (user_id)
);

CREATE TABLE brands (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(140) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  logo_url VARCHAR(2048) NULL,
  banner_url VARCHAR(2048) NULL,
  accent_color VARCHAR(20) NULL,
  status ENUM('active', 'draft') NOT NULL DEFAULT 'draft',
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_brands_public (status, display_order)
);

CREATE TABLE subcategories (
  id CHAR(36) PRIMARY KEY,
  brand_id CHAR(36) NOT NULL,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(140) NOT NULL,
  description TEXT NOT NULL,
  image_url VARCHAR(2048) NULL,
  status ENUM('active', 'draft') NOT NULL DEFAULT 'draft',
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_subcategories_brand FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE,
  UNIQUE KEY uq_subcategory_brand_slug (brand_id, slug),
  INDEX idx_subcategories_public (brand_id, status, display_order)
);

CREATE TABLE products (
  id CHAR(36) PRIMARY KEY,
  brand_id CHAR(36) NOT NULL,
  subcategory_id CHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  category VARCHAR(80) NOT NULL,
  price DECIMAL(10,3) NOT NULL,
  promo_price DECIMAL(10,3) NULL,
  sku VARCHAR(100) NOT NULL UNIQUE,
  stock INT UNSIGNED NOT NULL DEFAULT 0,
  is_new BOOLEAN NOT NULL DEFAULT FALSE,
  is_promo BOOLEAN NOT NULL DEFAULT FALSE,
  is_best_seller BOOLEAN NOT NULL DEFAULT FALSE,
  badge VARCHAR(80) NULL,
  images JSON NOT NULL,
  short_description TEXT NOT NULL,
  description TEXT NOT NULL,
  features JSON NOT NULL,
  sizes JSON NULL,
  colors JSON NULL,
  dimensions VARCHAR(100) NULL,
  weight VARCHAR(100) NULL,
  material VARCHAR(255) NULL,
  action_type ENUM('buy_online', 'rare_call', 'rare_chat', 'rare_both') NOT NULL DEFAULT 'buy_online',
  custom_phone VARCHAR(30) NULL,
  custom_whatsapp VARCHAR(30) NULL,
  rare_note TEXT NULL,
  status ENUM('published', 'draft') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_brand FOREIGN KEY (brand_id) REFERENCES brands(id),
  CONSTRAINT fk_products_subcategory FOREIGN KEY (subcategory_id) REFERENCES subcategories(id),
  INDEX idx_products_public (status, created_at),
  INDEX idx_products_brand (brand_id, status),
  INDEX idx_products_subcategory (subcategory_id, status)
);

CREATE TABLE reviews (
  id CHAR(36) PRIMARY KEY,
  product_id CHAR(36) NOT NULL,
  user_id CHAR(36) NULL,
  customer_name VARCHAR(160) NOT NULL,
  customer_email VARCHAR(254) NOT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  comment TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_review_rating CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_reviews_product (product_id, status, created_at)
);

CREATE TABLE orders (
  id CHAR(36) PRIMARY KEY,
  order_number VARCHAR(40) NOT NULL UNIQUE,
  user_id CHAR(36) NOT NULL,
  customer_json JSON NOT NULL,
  items_json JSON NOT NULL,
  subtotal DECIMAL(10,3) NOT NULL,
  shipping_fee DECIMAL(10,3) NOT NULL,
  total DECIMAL(10,3) NOT NULL,
  payment_method ENUM('cod', 'card', 'pickup') NOT NULL,
  status ENUM('pending', 'preparing', 'processing', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_orders_user (user_id, created_at),
  INDEX idx_orders_admin (status, created_at)
);
