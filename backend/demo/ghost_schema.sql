-- Ghost CMS Database Schema (simplified from actual Ghost schema)
-- Source: https://github.com/TryGhost/Ghost

CREATE TABLE users (
    id VARCHAR(24) NOT NULL PRIMARY KEY,
    name VARCHAR(191) NOT NULL,
    slug VARCHAR(191) NOT NULL UNIQUE,
    password VARCHAR(60) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    profile_image VARCHAR(2000) DEFAULT NULL,
    cover_image VARCHAR(2000) DEFAULT NULL,
    bio TEXT DEFAULT NULL,
    website VARCHAR(2000) DEFAULT NULL,
    location TEXT DEFAULT NULL,
    accessibility TEXT DEFAULT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    locale VARCHAR(6) DEFAULT NULL,
    visibility VARCHAR(50) NOT NULL DEFAULT 'public',
    meta_title VARCHAR(2000) DEFAULT NULL,
    meta_description VARCHAR(2000) DEFAULT NULL,
    last_seen DATETIME DEFAULT NULL,
    created_at DATETIME NOT NULL,
    created_by VARCHAR(24) NOT NULL,
    updated_at DATETIME DEFAULT NULL,
    updated_by VARCHAR(24) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE posts (
    id VARCHAR(24) NOT NULL PRIMARY KEY,
    uuid VARCHAR(36) NOT NULL UNIQUE,
    title VARCHAR(2000) NOT NULL,
    slug VARCHAR(191) NOT NULL UNIQUE,
    mobiledoc TEXT DEFAULT NULL,
    html TEXT DEFAULT NULL,
    plaintext TEXT DEFAULT NULL,
    feature_image VARCHAR(2000) DEFAULT NULL,
    featured TINYINT(1) NOT NULL DEFAULT 0,
    type VARCHAR(50) NOT NULL DEFAULT 'post',
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    locale VARCHAR(6) DEFAULT NULL,
    visibility VARCHAR(50) NOT NULL DEFAULT 'public',
    author_id VARCHAR(24) NOT NULL,
    meta_title VARCHAR(2000) DEFAULT NULL,
    meta_description VARCHAR(2000) DEFAULT NULL,
    custom_excerpt VARCHAR(2000) DEFAULT NULL,
    og_image VARCHAR(2000) DEFAULT NULL,
    og_title VARCHAR(300) DEFAULT NULL,
    og_description VARCHAR(500) DEFAULT NULL,
    twitter_image VARCHAR(2000) DEFAULT NULL,
    twitter_title VARCHAR(300) DEFAULT NULL,
    twitter_description VARCHAR(500) DEFAULT NULL,
    published_at DATETIME DEFAULT NULL,
    created_at DATETIME NOT NULL,
    created_by VARCHAR(24) NOT NULL,
    updated_at DATETIME DEFAULT NULL,
    updated_by VARCHAR(24) DEFAULT NULL,
    FOREIGN KEY (author_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE tags (
    id VARCHAR(24) NOT NULL PRIMARY KEY,
    name VARCHAR(191) NOT NULL,
    slug VARCHAR(191) NOT NULL UNIQUE,
    description TEXT DEFAULT NULL,
    feature_image VARCHAR(2000) DEFAULT NULL,
    visibility VARCHAR(50) NOT NULL DEFAULT 'public',
    meta_title VARCHAR(2000) DEFAULT NULL,
    meta_description VARCHAR(2000) DEFAULT NULL,
    og_image VARCHAR(2000) DEFAULT NULL,
    og_title VARCHAR(300) DEFAULT NULL,
    og_description VARCHAR(500) DEFAULT NULL,
    created_at DATETIME NOT NULL,
    created_by VARCHAR(24) NOT NULL,
    updated_at DATETIME DEFAULT NULL,
    updated_by VARCHAR(24) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE posts_tags (
    id VARCHAR(24) NOT NULL PRIMARY KEY,
    post_id VARCHAR(24) NOT NULL,
    tag_id VARCHAR(24) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (tag_id) REFERENCES tags(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE roles (
    id VARCHAR(24) NOT NULL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(2000) DEFAULT NULL,
    created_at DATETIME NOT NULL,
    created_by VARCHAR(24) NOT NULL,
    updated_at DATETIME DEFAULT NULL,
    updated_by VARCHAR(24) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE roles_users (
    id VARCHAR(24) NOT NULL PRIMARY KEY,
    role_id VARCHAR(24) NOT NULL,
    user_id VARCHAR(24) NOT NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE settings (
    id VARCHAR(24) NOT NULL PRIMARY KEY,
    `group` VARCHAR(50) NOT NULL DEFAULT 'site',
    `key` VARCHAR(191) NOT NULL UNIQUE,
    value TEXT DEFAULT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'string',
    created_at DATETIME NOT NULL,
    created_by VARCHAR(24) NOT NULL,
    updated_at DATETIME DEFAULT NULL,
    updated_by VARCHAR(24) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE members (
    id VARCHAR(24) NOT NULL PRIMARY KEY,
    uuid VARCHAR(36) NOT NULL UNIQUE,
    email VARCHAR(191) NOT NULL UNIQUE,
    name VARCHAR(191) DEFAULT NULL,
    note TEXT DEFAULT NULL,
    geolocation VARCHAR(2000) DEFAULT NULL,
    subscribed TINYINT(1) NOT NULL DEFAULT 1,
    email_count INT NOT NULL DEFAULT 0,
    email_opened_count INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL,
    updated_at DATETIME DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE newsletters (
    id VARCHAR(24) NOT NULL PRIMARY KEY,
    uuid VARCHAR(36) NOT NULL UNIQUE,
    name VARCHAR(191) NOT NULL,
    description VARCHAR(2000) DEFAULT NULL,
    slug VARCHAR(191) NOT NULL UNIQUE,
    sender_name VARCHAR(191) DEFAULT NULL,
    sender_email VARCHAR(191) DEFAULT NULL,
    sender_reply_to VARCHAR(50) NOT NULL DEFAULT 'newsletter',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    visibility VARCHAR(50) NOT NULL DEFAULT 'members',
    subscribe_on_signup TINYINT(1) NOT NULL DEFAULT 1,
    sort_order INT NOT NULL DEFAULT 0,
    body_font_category VARCHAR(50) NOT NULL DEFAULT 'sans_serif',
    title_font_category VARCHAR(50) NOT NULL DEFAULT 'sans_serif',
    show_header_icon TINYINT(1) NOT NULL DEFAULT 1,
    show_header_title TINYINT(1) NOT NULL DEFAULT 1,
    show_badge TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL,
    updated_at DATETIME DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE comments (
    id VARCHAR(24) NOT NULL PRIMARY KEY,
    post_id VARCHAR(24) NOT NULL,
    member_id VARCHAR(24) DEFAULT NULL,
    parent_id VARCHAR(24) DEFAULT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'published',
    html TEXT DEFAULT NULL,
    edited_at DATETIME DEFAULT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME DEFAULT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (member_id) REFERENCES members(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE integrations (
    id VARCHAR(24) NOT NULL PRIMARY KEY,
    type VARCHAR(50) NOT NULL DEFAULT 'custom',
    name VARCHAR(191) NOT NULL,
    slug VARCHAR(191) NOT NULL UNIQUE,
    icon_image VARCHAR(2000) DEFAULT NULL,
    description VA