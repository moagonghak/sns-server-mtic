drop database sns_db;
create database sns_db DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci;
use sns_db; 

CREATE TABLE media_comments (
    comment_id BIGINT(20) AUTO_INCREMENT PRIMARY KEY,
    media_type TINYINT UNSIGNED NOT NULL,
    media_id INT NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    grade FLOAT,
    comment TEXT,
    register_time VARCHAR(255) NOT NULL,
    modify_time VARCHAR(255),
    likes INT DEFAULT 0,
    dislikes INT DEFAULT 0,
    comment_type INT DEFAULT 0,
    comment_level TINYINT UNSIGNED DEFAULT 0,
    report_count INT UNSIGNED DEFAULT 0,
    origin_comment_id BIGINT(20),
    reply_count INT UNSIGNED DEFAULT 0,
    deleted TINYINT UNSIGNED DEFAULT 0,
    INDEX idx_media_type_id (media_type, media_id),
    INDEX idx_user_id (user_id)
);

CREATE TABLE comment_reactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    comment_id BIGINT(20) NOT NULL,
    is_like BOOLEAN NOT NULL,
    UNIQUE KEY (user_id, comment_id),
    INDEX idx_user_id (user_id),
    FOREIGN KEY (comment_id) REFERENCES media_comments (comment_id) ON DELETE CASCADE
);

CREATE TABLE media_tickets (
    ticket_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    media_type TINYINT UNSIGNED NOT NULL,
    media_id INT NOT NULL,
    ticket_image_path VARCHAR(255) NOT NULL,
    watched_time VARCHAR(255),
    update_time VARCHAR(255),
    INDEX idx_user_id (user_id)
);

CREATE TABLE media_favorites (
    user_id VARCHAR(255) NOT NULL,
    media_type TINYINT UNSIGNED NOT NULL,
    media_id INT NOT NULL,
    update_time VARCHAR(255),
    PRIMARY KEY (user_id, media_type, media_id),
    INDEX idx_user_id (user_id)
);

CREATE TABLE users (
    user_id VARCHAR(255) PRIMARY KEY,
    platform TINYINT UNSIGNED NOT NULL,
    display_name VARCHAR(30) NOT NULL,
    email VARCHAR(40) NOT NULL,
    signup_time VARCHAR(255),
    last_signin_time VARCHAR(255),
    attendance_count INT DEFAULT 1,
    deleted TINYINT UNSIGNED DEFAULT 0,
    INDEX idx_user_id (user_id)
);

CREATE TABLE ocr (
    year_month_id INT PRIMARY KEY,
    ocr_count INT UNSIGNED DEFAULT 0,
    INDEX idx_year_month_id (year_month_id)
);

CREATE TABLE ocr_usage (
    user_id VARCHAR(255) NOT NULL,
    used_date VARCHAR(255) NOT NULL,
    ocr_result BOOLEAN NOT NULL,
    ocr_uid VARCHAR(255) NOT NULL,
    INDEX idx_user_id (user_id)
);

CREATE TABLE comment_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    comment_id BIGINT(20) NOT NULL,
    report_type INT NOT NULL,
    UNIQUE KEY (user_id, comment_id),
    INDEX idx_user_id (user_id),
    FOREIGN KEY (comment_id) REFERENCES media_comments (comment_id) ON DELETE CASCADE
);