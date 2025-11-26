<?php
/**
 * Incidents Routes
 * API endpoints for incident management
 */

header("Content-Type: application/json; charset=UTF-8");

require_once '../config/database.php';
require_once '../models/Incident.php';
require_once '../utils/helpers.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    http_response_code(500);
    echo json_encode(["message" => "Database connection failed"]);
    exit();
}

$incident = new Incident($db);
$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            // Get single incident
            $incident->id = $_GET['id'];
            
            if ($incident->readOne()) {
                $incident_arr = array(
                    "id" => $incident->id,
                    "title" => $incident->title,
                    "description" => $incident->description,
                    "location" => $incident->location,
                    "latitude" => $incident->latitude,
                    "longitude" => $incident->longitude,
                    "status" => $incident->status,
                    "priority" => $incident->priority,
                    "reporter_name" => $incident->reporter_name,
                    "reporter_contact" => $incident->reporter_contact,
                    "incident_date" => $incident->incident_date,
                    "images" => $incident->images ? json_decode($incident->images) : [],
                    "assigned_catcher_id" => $incident->assigned_catcher_id,
                    "created_at" => $incident->created_at,
                    "updated_at" => $incident->updated_at
                );
                
                http_response_code(200);
                echo json_encode($incident_arr);
            } else {
                http_response_code(404);
                echo json_encode(["message" => "Incident not found"]);
            }
        } else {
            // Get all incidents with filters
            $filters = [
                'status' => $_GET['status'] ?? null,
                'priority' => $_GET['priority'] ?? null,
                'search' => $_GET['search'] ?? null
            ];
            
            $stmt = $incident->read($filters);
            $num = $stmt->rowCount();
            
            if ($num > 0) {
                $incidents_arr = array();
                $incidents_arr["records"] = array();
                $incidents_arr["total"] = $num;
                
                while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    extract($row);
                    
                    $incident_item = array(
                        "id" => $id,
                        "title" => $title,
                        "description" => $description,
                        "location" => $location,
                        "latitude" => $latitude,
                        "longitude" => $longitude,
                        "status" => $status,
                        "priority" => $priority,
                        "reporter_name" => $reporter_name,
                        "reporter_contact" => $reporter_contact,
                        "incident_date" => $incident_date,
                        "images" => $images ? json_decode($images) : [],
                        "assigned_catcher_id" => $assigned_catcher_id,
                        "catcher_team_name" => $catcher_team_name,
                        "catcher_leader" => $catcher_leader,
                        "created_at" => $created_at,
                        "updated_at" => $updated_at
                    );
                    
                    array_push($incidents_arr["records"], $incident_item);
                }
                
                http_response_code(200);
                echo json_encode($incidents_arr);
            } else {
                http_response_code(200);
                echo json_encode([
                    "records" => [],
                    "total" => 0,
                    "message" => "No incidents found"
                ]);
            }
        }
        break;
        
    case 'POST':
        // Create new incident
        $data = json_decode(file_get_contents("php://input"));
        
        if (!empty($data->title) && !empty($data->location)) {
            $incident->title = $data->title;
            $incident->description = $data->description ?? '';
            $incident->location = $data->location;
            $incident->latitude = $data->latitude ?? null;
            $incident->longitude = $data->longitude ?? null;
            $incident->status = $data->status ?? 'pending';
            $incident->priority = $data->priority ?? 'medium';
            $incident->reporter_name = $data->reporter_name ?? 'Anonymous';
            $incident->reporter_contact = $data->reporter_contact ?? '';
            $incident->incident_date = $data->incident_date ?? date('Y-m-d H:i:s');
            $incident->images = !empty($data->images) ? json_encode($data->images) : null;
            
            if ($incident->create()) {
                http_response_code(201);
                echo json_encode([
                    "message" => "Incident created successfully",
                    "id" => $incident->id
                ]);
            } else {
                http_response_code(503);
                echo json_encode(["message" => "Unable to create incident"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Unable to create incident. Required data is missing."]);
        }
        break;
        
    case 'PUT':
        // Update incident
        $data = json_decode(file_get_contents("php://input"));
        
        if (!empty($data->id)) {
            $incident->id = $data->id;
            $incident->title = $data->title;
            $incident->description = $data->description;
            $incident->location = $data->location;
            $incident->latitude = $data->latitude ?? null;
            $incident->longitude = $data->longitude ?? null;
            $incident->status = $data->status;
            $incident->priority = $data->priority;
            $incident->assigned_catcher_id = $data->assigned_catcher_id ?? null;
            
            if ($incident->update()) {
                http_response_code(200);
                echo json_encode(["message" => "Incident updated successfully"]);
            } else {
                http_response_code(503);
                echo json_encode(["message" => "Unable to update incident"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Unable to update incident. ID is required."]);
        }
        break;
        
    case 'DELETE':
        // Delete incident
        $data = json_decode(file_get_contents("php://input"));
        
        if (!empty($data->id)) {
            $incident->id = $data->id;
            
            if ($incident->delete()) {
                http_response_code(200);
                echo json_encode(["message" => "Incident deleted successfully"]);
            } else {
                http_response_code(503);
                echo json_encode(["message" => "Unable to delete incident"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Unable to delete incident. ID is required."]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed"]);
        break;
}
