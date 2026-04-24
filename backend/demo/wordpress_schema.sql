-- WordPress Database Schema (simplified from actual WordPress schema)
-- Source: https://codex.wordpress.org/Database_Description

CREATE TABLE wp_users (
    ID BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_login VARCHAR(60) NOT NULL DEFAULT '',
    user_pass VARCHAR(255) NOT NULL DEFAULT '',
    user_nicename VARCHAR(50) NOT NULL DEFAULT '',
    user_email VARCHAR(100) NOT NULL DEFAULT '',
    user_url VARCHAR(100) NOT NULL DEFAULT '',
    user_registered DATETIME NOT NULL DEFAULT '0000-00-00 00:00:00',
    user_activation_key VARCHAR(255) NOT NULL DEFAULT '',
    user_status INT(11) NOT NULL DEFAULT 0,
    display_name VARCHAR(250) NOT NULL DEFAULT '',
    KEY user_login_key (user_login),
    KEY user_nicename (user_nicename),
    KEY user_email (user_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE wp_usermeta (
    umeta_id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT(20) UNSIGNED NOT NULL DEFAULT 0,
    meta_key VARCHAR(255) DEFAULT NULL,
    meta_value LONGTEXT DEFAULT NULL,
    KEY user_id (user_id),
    KEY meta_key (meta_key(191)),
    FOREIGN KEY (user_id) REFERENCES wp_users(ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE wp_posts (
    ID BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    post_author BIGINT(20) UNSIGNED NOT NULL DEFAULT 0,
    post_date DATETIME NOT NULL DEFAULT '0000-00-00 00:00:00',
    post_date_gmt DATETIME NOT NULL DEFAULT '0000-00-00 00:00:00',
    post_content LONGTEXT NOT NULL,
    post_title TEXT NOT NULL,
    post_excerpt TEXT NOT NULL,
    post_status VARCHAR(20) NOT NULL DEFAULT 'publish',
    comment_status VARCHAR(20) NOT NULL DEFAULT 'open',
    ping_status VARCHAR(20) NOT NULL DEFAULT 'open',
    post_password VARCHAR(255) NOT NULL DEFAULT '',
    post_name VARCHAR(200) NOT NULL DEFAULT '',
    to_ping TEXT NOT NULL,
    pinged TEXT NOT NULL,
    post_modified DATETIME NOT NULL DEFAULT '0000-00-00 00:00:00',
    post_modified_gmt DATETIME NOT NULL DEFAULT '0000-00-00 00:00:00',
    post_content_filtered LONGTEXT NOT NULL,
    post_parent BIGINT(20) UNSIGNED NOT NULL DEFAULT 0,
    guid VARCHAR(255) NOT NULL DEFAULT '',
    menu_order INT(11) NOT NULL DEFAULT 0,
    post_type VARCHAR(20) NOT NULL DEFAULT 'post',
    post_mime_type VARCHAR(100) NOT NULL DEFAULT '',
    comment_count BIGINT(20) NOT NULL DEFAULT 0,
    KEY post_name (post_name(191)),
    KEY type_status_date (post_type, post_status, post_date, ID),
    KEY post_parent (post_parent),
    KEY post_author (post_author),
    FOREIGN KEY (post_author) REFERENCES wp_users(ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE wp_postmeta (
    meta_id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT(20) UNSIGNED NOT NULL DEFAULT 0,
    meta_key VARCHAR(255) DEFAULT NULL,
    meta_value LONGTEXT DEFAULT NULL,
    KEY post_id (post_id),
    KEY meta_key (meta_key(191)),
    FOREIGN KEY (post_id) REFERENCES wp_posts(ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE wp_comments (
    comment_ID BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    comment_post_ID BIGINT(20) UNSIGNED NOT NULL DEFAULT 0,
    comment_author TEXT NOT NULL,
    comment_author_email VARCHAR(100) NOT NULL DEFAULT '',
    comment_author_url VARCHAR(200) NOT NULL DEFAULT '',
    comment_author_IP VARCHAR(100) NOT NULL DEFAULT '',
    comment_date DATETIME NOT NULL DEFAULT '0000-00-00 00:00:00',
    comment_date_gmt DATETIME NOT NULL DEFAULT '0000-00-00 00:00:00',
    comment_content TEXT NOT NULL,
    comment_karma INT(11) NOT NULL DEFAULT 0,
    comment_approved VARCHAR(20) NOT NULL DEFAULT '1',
    comment_agent VARCHAR(255) NOT NULL DEFAULT '',
    comment_type VARCHAR(20) NOT NULL DEFAULT 'comment',
    comment_parent BIGINT(20) UNSIGNED NOT NULL DEFAULT 0,
    user_id BIGINT(20) UNSIGNED NOT NULL DEFAULT 0,
    KEY comment_post_ID (comment_post_ID),
    KEY comment_approved_date_gmt (comment_approved, comment_date_gmt),
    KEY comment_date_gmt (comment_date_gmt),
    KEY comment_parent (comment_parent),
    KEY comment_author_email (comment_author_email(10)),
    FOREIGN KEY (comment_post_ID) REFERENCES wp_posts(ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE wp_commentmeta (
    meta_id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    comment_id BIGINT(20) UNSIGNED NOT NULL DEFAULT 0,
    meta_key VARCHAR(255) DEFAULT NULL,
    meta_value LONGTEXT DEFAULT NULL,
    KEY comment_id (comment_id),
    KEY meta_key (meta_key(191)),
    FOREIGN KEY (comment_id) REFERENCES wp_comments(comment_ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE wp_terms (
    term_id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL DEFAULT '',
    slug VARCHAR(200) NOT NULL DEFAULT '',
    term_group BIGINT(10) NOT NULL DEFAULT 0,
    KEY slug (slug(191)),
    KEY name (name(191))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE wp_term_taxonomy (
    term_taxonomy_id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    term_id BIGINT(20) UNSIGNED NOT NULL DEFAULT 0,
    taxonomy VARCHAR(32) NOT NULL DEFAULT '',
    description LONGTEXT NOT NULL,
    parent BIGINT(20) UNSIGNED NOT NULL DEFAULT 0,
    count BIGINT(20) NOT NULL DEFAULT 0,
    UNIQUE KEY term_id_taxonomy (term_id, taxonomy),
    KEY taxonomy (taxonomy),
    FOREIGN KEY (term_id) REFERENCES wp_terms(term_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8m