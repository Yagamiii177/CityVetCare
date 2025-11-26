<?php
/**
 * Helper Functions
 * Utility functions for the backend API
 */

/**
 * Send JSON response
 */
function sendJsonResponse($data, $status_code = 200) {
    http_response_code($status_code);
    echo json_encode($data);
    exit();
}

/**
 * Send error response
 */
function sendErrorResponse($message, $status_code = 400) {
    http_response_code($status_code);
    echo json_encode(["error" => true, "message" => $message]);
    exit();
}

/**
 * Validate required fields
 */
function validateRequiredFields($data, $required_fields) {
    $missing_fields = [];
    
    foreach ($required_fields as $field) {
        if (empty($data->$field)) {
            $missing_fields[] = $field;
        }
    }
    
    if (!empty($missing_fields)) {
        return [
            'valid' => false,
            'message' => 'Missing required fields: ' . implode(', ', $missing_fields)
        ];
    }
    
    return ['valid' => true];
}

/**
 * Sanitize input string
 */
function sanitizeString($str) {
    return htmlspecialchars(strip_tags(trim($str)));
}

/**
 * Generate random token
 */
function generateToken($length = 32) {
    return bin2hex(random_bytes($length));
}

/**
 * Verify authorization token
 */
function verifyToken($token) {
    // Implement JWT verification in production
    // This is a simplified version
    return !empty($token);
}

/**
 * Get authorization token from headers
 */
function getAuthToken() {
    $headers = getallheaders();
    $auth_header = $headers['Authorization'] ?? '';
    
    if (preg_match('/Bearer\s+(.*)$/i', $auth_header, $matches)) {
        return $matches[1];
    }
    
    return null;
}

/**
 * Check if user is authenticated
 */
function requireAuth() {
    $token = getAuthToken();
    
    if (!verifyToken($token)) {
        sendErrorResponse('Authentication required', 401);
    }
    
    return $token;
}

/**
 * Upload file handler
 */
function handleFileUpload($file, $upload_dir = '../uploads/', $allowed_types = ['jpg', 'jpeg', 'png', 'gif']) {
    if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
        return ['success' => false, 'message' => 'File upload error'];
    }
    
    $file_extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    
    if (!in_array($file_extension, $allowed_types)) {
        return ['success' => false, 'message' => 'Invalid file type'];
    }
    
    $new_filename = uniqid() . '_' . time() . '.' . $file_extension;
    $upload_path = $upload_dir . $new_filename;
    
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }
    
    if (move_uploaded_file($file['tmp_name'], $upload_path)) {
        return [
            'success' => true,
            'filename' => $new_filename,
            'path' => $upload_path
        ];
    }
    
    return ['success' => false, 'message' => 'Failed to move uploaded file'];
}

/**
 * Format date for database
 */
function formatDateForDb($date_string) {
    try {
        $date = new DateTime($date_string);
        return $date->format('Y-m-d H:i:s');
    } catch (Exception $e) {
        return date('Y-m-d H:i:s');
    }
}

/**
 * Paginate results
 */
function paginate($query, $page = 1, $per_page = 10) {
    $offset = ($page - 1) * $per_page;
    $query .= " LIMIT $per_page OFFSET $offset";
    return $query;
}

/**
 * Log error to file
 */
function logError($message, $file = '../logs/error.log') {
    $log_dir = dirname($file);
    if (!is_dir($log_dir)) {
        mkdir($log_dir, 0755, true);
    }
    
    $timestamp = date('Y-m-d H:i:s');
    $log_message = "[$timestamp] $message" . PHP_EOL;
    error_log($log_message, 3, $file);
}

/**
 * Validate email
 */
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Validate phone number
 */
function validatePhone($phone) {
    // Basic Philippine phone number validation
    return preg_match('/^(\+63|0)?9\d{9}$/', $phone);
}
