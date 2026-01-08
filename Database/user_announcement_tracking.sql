-- User Announcement Tracking Table
-- Tracks which announcements users have read, hidden, or archived

CREATE TABLE IF NOT EXISTS user_announcement_interaction (
    interaction_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    announcement_id INT NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    is_hidden TINYINT(1) DEFAULT 0,
    read_at TIMESTAMP NULL,
    hidden_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign keys
    CONSTRAINT fk_user_announcement_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_user_announcement FOREIGN KEY (announcement_id) REFERENCES announcement(announcement_id) ON DELETE CASCADE,
    
    -- Ensure one record per user per announcement
    UNIQUE KEY unique_user_announcement (user_id, announcement_id),
    
    -- Indexes for fast queries
    INDEX idx_user_read (user_id, is_read),
    INDEX idx_user_hidden (user_id, is_hidden),
    INDEX idx_announcement_read (announcement_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
