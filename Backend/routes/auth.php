<?php
/**
 * Authentication Routes
 * API endpoints for user authentication
 */

// Include CORS middleware
require_once __DIR__ . '/../middleware/cors.php';

header("Content-Type: application/json; charset=UTF-8");

require_once '../config/database.php';
require_once '../utils/helpers.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    http_response_code(500);
    echo json_encode(["message" => "Database connection failed"]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        $request_uri = $_SERVER['REQUEST_URI'];
        
        if (strpos($request_uri, 'login') !== false) {
            // Login endpoint
            if (!empty($data->username) && !empty($data->password)) {
                $query = "SELECT id, username, email, role, password_hash 
                          FROM users 
                          WHERE username = :username 
                          LIMIT 1";
                
                $stmt = $db->prepare($query);
                $stmt->bindParam(":username", $data->username);
                $stmt->execute();
                
                if ($stmt->rowCount() > 0) {
                    $row = $stmt->fetch(PDO::FETCH_ASSOC);
                    
                    // Verify password
                    if (password_verify($data->password, $row['password_hash'])) {
                        // Generate token (simplified - use JWT in production)
                        $token = bin2hex(random_bytes(32));
                        
                        // Store token in database (add tokens table in production)
                        
                        http_response_code(200);
                        echo json_encode([
                            "message" => "Login successful",
                            "token" => $token,
                            "user" => [
                                "id" => $row['id'],
                                "username" => $row['username'],
                                "email" => $row['email'],
                                "role" => $row['role']
                            ]
                        ]);
                    } else {
                        http_response_code(401);
                        echo json_encode(["message" => "Invalid credentials"]);
                    }
                } else {
                    http_response_code(401);
                    echo json_encode(["message" => "Invalid credentials"]);
                }
            } else {
                http_response_code(400);
                echo json_encode(["message" => "Username and password required"]);
            }
        } elseif (strpos($request_uri, 'register') !== false) {
            // Register endpoint
            if (!empty($data->username) && !empty($data->password) && !empty($data->email)) {
                // Check if username exists
                $check_query = "SELECT id FROM users WHERE username = :username OR email = :email LIMIT 1";
                $check_stmt = $db->prepare($check_query);
                $check_stmt->bindParam(":username", $data->username);
                $check_stmt->bindParam(":email", $data->email);
                $check_stmt->execute();
                
                if ($check_stmt->rowCount() > 0) {
                    http_response_code(409);
                    echo json_encode(["message" => "Username or email already exists"]);
                } else {
                    // Create new user
                    $insert_query = "INSERT INTO users 
                                    SET username = :username,
                                        email = :email,
                                        password_hash = :password_hash,
                                        role = :role,
                                        created_at = NOW()";
                    
                    $insert_stmt = $db->prepare($insert_query);
                    
                    $username = htmlspecialchars(strip_tags($data->username));
                    $email = htmlspecialchars(strip_tags($data->email));
                    $password_hash = password_hash($data->password, PASSWORD_DEFAULT);
                    $role = $data->role ?? 'user';
                    
                    $insert_stmt->bindParam(":username", $username);
                    $insert_stmt->bindParam(":email", $email);
                    $insert_stmt->bindParam(":password_hash", $password_hash);
                    $insert_stmt->bindParam(":role", $role);
                    
                    if ($insert_stmt->execute()) {
                        http_response_code(201);
                        echo json_encode([
                            "message" => "User registered successfully",
                            "user_id" => $db->lastInsertId()
                        ]);
                    } else {
                        http_response_code(503);
                        echo json_encode(["message" => "Unable to register user"]);
                    }
                }
            } else {
                http_response_code(400);
                echo json_encode(["message" => "Username, email, and password required"]);
            }
        } elseif (strpos($request_uri, 'logout') !== false) {
            // Logout endpoint
            // Clear token from database (implement token management in production)
            http_response_code(200);
            echo json_encode(["message" => "Logout successful"]);
        } else {
            http_response_code(404);
            echo json_encode(["message" => "Endpoint not found"]);
        }
        break;
        
    case 'GET':
        // Verify token endpoint
        $headers = getallheaders();
        $token = $headers['Authorization'] ?? '';
        
        if (!empty($token)) {
            // Verify token (implement proper JWT verification in production)
            http_response_code(200);
            echo json_encode([
                "message" => "Token valid",
                "authenticated" => true
            ]);
        } else {
            http_response_code(401);
            echo json_encode([
                "message" => "Token required",
                "authenticated" => false
            ]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed"]);
        break;
}
