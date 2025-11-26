<?php
/**
 * Backend API Entry Point
 * Main router for CityVetCare API
 */

// Enable error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include CORS middleware
require_once 'middleware/cors.php';

// Set content type
header("Content-Type: application/json; charset=UTF-8");

// Get request URI and method
$request_uri = $_SERVER['REQUEST_URI'];
$request_method = $_SERVER['REQUEST_METHOD'];

// Parse the request URI
// Remove query string and trim slashes
$uri_parts = explode('?', $request_uri);
$path = trim($uri_parts[0], '/');

// Remove 'index.php' from path if present
$path = str_replace('index.php/', '', $path);
$path = str_replace('index.php', '', $path);
$path = trim($path, '/');

// Route the request
try {
    if (empty($path) || $path === 'index.php') {
        // API root - show available endpoints
        http_response_code(200);
        echo json_encode([
            "message" => "CityVetCare API",
            "version" => "1.0.0",
            "endpoints" => [
                "/api/incidents" => "Incident management",
                "/api/catchers" => "Catcher team management",
                "/api/schedules" => "Schedule management",
                "/api/dashboard" => "Dashboard statistics",
                "/api/auth/login" => "User authentication",
                "/api/auth/register" => "User registration"
            ],
            "documentation" => "Available endpoints listed above"
        ]);
    } elseif (preg_match('#^api/incidents#', $path)) {
        require_once 'routes/incidents.php';
    } elseif (preg_match('#^api/catchers#', $path)) {
        require_once 'routes/catchers.php';
    } elseif (preg_match('#^api/schedules#', $path)) {
        require_once 'routes/catchers.php'; // Schedules are handled in catchers.php
    } elseif (preg_match('#^api/dashboard#', $path)) {
        require_once 'routes/dashboard.php';
    } elseif (preg_match('#^api/auth#', $path)) {
        require_once 'routes/auth.php';
    } else {
        http_response_code(404);
        echo json_encode([
            "error" => true,
            "message" => "Endpoint not found",
            "path" => $path
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "error" => true,
        "message" => "Internal server error",
        "details" => $e->getMessage()
    ]);
}
