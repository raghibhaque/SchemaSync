-- Modern e-commerce schema — verbose names, consistent snake_case, BIGINT keys.
-- The reconciler must bridge the gap from the legacy abbreviated schema above.

CREATE TABLE accounts (
    account_id     BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    username       VARCHAR(100) NOT NULL UNIQUE,
    email_address  VARCHAR(150) NOT NULL UNIQUE,
    password_hash  VARCHAR(255) NOT NULL,
    account_status VARCHAR(20)  NOT NULL DEFAULT 'active',
    created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP    DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    last_login_at  TIMESTAMP    DEFAULT NULL,
    KEY idx_email    (email_address),
    KEY idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE purchase_orders (
    order_id            BIGINT        NOT NULL AUTO_INCREMENT PRIMARY KEY,
    customer_id         BIGINT        NOT NULL,
    order_date          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    shipped_date        TIMESTAMP     DEFAULT NULL,
    total_amount        DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    order_status        VARCHAR(30)   NOT NULL DEFAULT 'pending',
    payment_method      VARCHAR(50)   DEFAULT NULL,
    shipping_address_id BIGINT        DEFAULT NULL,
    KEY idx_customer (customer_id),
    KEY idx_status   (order_status),
    FOREIGN KEY (customer_id) REFERENCES accounts(account_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE product_catalog (
    product_id          BIGINT        NOT NULL AUTO_INCREMENT PRIMARY KEY,
    product_name        VARCHAR(200)  NOT NULL,
    product_description TEXT          DEFAULT NULL,
    unit_price          DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    stock_quantity      INT           NOT NULL DEFAULT 0,
    category_id         BIGINT        DEFAULT NULL,
    is_active           BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_category (category_id),
    KEY idx_active   (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE order_line_items (
    line_item_id        BIGINT        NOT NULL AUTO_INCREMENT PRIMARY KEY,
    order_id            BIGINT        NOT NULL,
    product_id          BIGINT        NOT NULL,
    quantity            INT           NOT NULL DEFAULT 1,
    unit_price          DECIMAL(12,2) NOT NULL,
    discount_percentage DECIMAL(5,2)  NOT NULL DEFAULT 0.00,
    subtotal            DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    KEY idx_order (order_id),
    FOREIGN KEY (order_id)   REFERENCES purchase_orders(order_id),
    FOREIGN KEY (product_id) REFERENCES product_catalog(product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE product_categories (
    category_id        BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    category_name      VARCHAR(100) NOT NULL,
    description        TEXT         DEFAULT NULL,
    parent_category_id BIGINT       DEFAULT NULL,
    sort_order         INT          NOT NULL DEFAULT 0,
    is_active          BOOLEAN      NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE customer_addresses (
    address_id   BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    account_id   BIGINT       NOT NULL,
    street_line1 VARCHAR(200) NOT NULL,
    street_line2 VARCHAR(200) DEFAULT NULL,
    city         VARCHAR(100) NOT NULL,
    state_code   VARCHAR(50)  DEFAULT NULL,
    postal_code  VARCHAR(20)  DEFAULT NULL,
    country_code VARCHAR(50)  NOT NULL DEFAULT 'US',
    is_default   BOOLEAN      NOT NULL DEFAULT FALSE,
    KEY idx_account (account_id),
    FOREIGN KEY (account_id) REFERENCES accounts(account_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE payment_transactions (
    transaction_id     BIGINT        NOT NULL AUTO_INCREMENT PRIMARY KEY,
    order_id           BIGINT        NOT NULL,
    amount             DECIMAL(12,2) NOT NULL,
    payment_date       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    payment_method     VARCHAR(50)   NOT NULL,
    transaction_status VARCHAR(30)   NOT NULL DEFAULT 'pending',
    reference_number   VARCHAR(100)  DEFAULT NULL,
    KEY idx_order (order_id),
    FOREIGN KEY (order_id) REFERENCES purchase_orders(order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE product_reviews (
    review_id     BIGINT    NOT NULL AUTO_INCREMENT PRIMARY KEY,
    product_id    BIGINT    NOT NULL,
    account_id    BIGINT    NOT NULL,
    rating        TINYINT   NOT NULL DEFAULT 5,
    review_text   TEXT      DEFAULT NULL,
    review_date   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_verified   BOOLEAN   NOT NULL DEFAULT FALSE,
    helpful_votes INT       NOT NULL DEFAULT 0,
    KEY idx_product (product_id),
    KEY idx_account (account_id),
    FOREIGN KEY (product_id) REFERENCES product_catalog(product_id),
    FOREIGN KEY (account_id) REFERENCES accounts(account_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
