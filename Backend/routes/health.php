<?php
/**
 * Health Check Endpoint
 * Tests database connectivity and returns system status
 */

header('Content-Type: application/json');
require_once '../config/database.php';

// Create database instance
$database = new Database();
$db = $database->getConnection();

$response = [
    'timestamp' => date('Y-m-d H:i:s'),
    'api_status' => 'online'
];

// Test database connection
if ($db) {
    try {
        // Test query to verify database is accessible
        $query = "SELECT DATABASE() as db_name, VERSION() as db_version";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $response['database'] = [
            'status' => 'connected',
            'name' => $result['db_name'],
            'version' => $result['db_version'],
            'host' => '127.0.0.1'
        ];
        
        http_response_code(200);
    } catch(PDOException $e) {
        $response['database'] = [
            'status' => 'error',
            'message' => 'Database query failed'
        ];
        http_response_code(500);
    }
} else {
    $response['database'] = [
        'status' => 'disconnected',
        'message' => 'Failed to connect to database'
    ];
    http_response_code(500);
}

echo json_encode($response, JSON_PRETTY_PRINT);
?>
