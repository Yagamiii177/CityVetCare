<?php
/**
 * Catchers Routes
 * API endpoints for catcher team and schedule management
 */

// Include CORS middleware
require_once __DIR__ . '/../middleware/cors.php';

header("Content-Type: application/json; charset=UTF-8");

require_once '../config/database.php';
require_once '../models/CatcherTeam.php';
require_once '../models/Schedule.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    http_response_code(500);
    echo json_encode(["message" => "Database connection failed"]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];

// Determine if this is a team or schedule request
$is_schedule = strpos($request_uri, 'schedules') !== false;

if ($is_schedule) {
    // Handle Schedule endpoints
    $schedule = new Schedule($db);
    
    switch($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                // Get single schedule
                $schedule->id = $_GET['id'];
                
                if ($schedule->readOne()) {
                    $schedule_arr = array(
                        "id" => $schedule->id,
                        "catcher_team_id" => $schedule->catcher_team_id,
                        "incident_id" => $schedule->incident_id,
                        "scheduled_date" => $schedule->scheduled_date,
                        "scheduled_time" => $schedule->scheduled_time,
                        "end_time" => $schedule->end_time,
                        "status" => $schedule->status,
                        "notes" => $schedule->notes,
                        "created_at" => $schedule->created_at,
                        "updated_at" => $schedule->updated_at
                    );
                    
                    http_response_code(200);
                    echo json_encode($schedule_arr);
                } else {
                    http_response_code(404);
                    echo json_encode(["message" => "Schedule not found"]);
                }
            } else {
                // Get all schedules with filters
                $filters = [
                    'catcher_team_id' => $_GET['catcher_team_id'] ?? null,
                    'status' => $_GET['status'] ?? null,
                    'date' => $_GET['date'] ?? null
                ];
                
                $stmt = $schedule->read($filters);
                $num = $stmt->rowCount();
                
                if ($num > 0) {
                    $schedules_arr = array();
                    $schedules_arr["records"] = array();
                    $schedules_arr["total"] = $num;
                    
                    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                        $schedule_item = array(
                            "id" => $row['id'],
                            "catcher_team_id" => $row['catcher_team_id'],
                            "team_name" => $row['team_name'],
                            "leader_name" => $row['leader_name'],
                            "contact_number" => $row['contact_number'],
                            "incident_id" => $row['incident_id'],
                            "incident_title" => $row['incident_title'],
                            "incident_location" => $row['incident_location'],
                            "scheduled_date" => $row['scheduled_date'],
                            "scheduled_time" => $row['scheduled_time'],
                            "end_time" => $row['end_time'],
                            "status" => $row['status'],
                            "notes" => $row['notes'],
                            "created_at" => $row['created_at'],
                            "updated_at" => $row['updated_at']
                        );
                        
                        array_push($schedules_arr["records"], $schedule_item);
                    }
                    
                    http_response_code(200);
                    echo json_encode($schedules_arr);
                } else {
                    http_response_code(200);
                    echo json_encode([
                        "records" => [],
                        "total" => 0,
                        "message" => "No schedules found"
                    ]);
                }
            }
            break;
            
        case 'POST':
            // Create new schedule
            $data = json_decode(file_get_contents("php://input"));
            
            if (!empty($data->catcher_team_id) && !empty($data->scheduled_date)) {
                $schedule->catcher_team_id = $data->catcher_team_id;
                $schedule->incident_id = $data->incident_id ?? null;
                $schedule->scheduled_date = $data->scheduled_date;
                $schedule->scheduled_time = $data->scheduled_time;
                $schedule->end_time = $data->end_time ?? null;
                $schedule->status = $data->status ?? 'scheduled';
                $schedule->notes = $data->notes ?? '';
                
                if ($schedule->create()) {
                    http_response_code(201);
                    echo json_encode([
                        "message" => "Schedule created successfully",
                        "id" => $schedule->id
                    ]);
                } else {
                    http_response_code(503);
                    echo json_encode(["message" => "Unable to create schedule"]);
                }
            } else {
                http_response_code(400);
                echo json_encode(["message" => "Required data is missing"]);
            }
            break;
            
        case 'PUT':
            // Update schedule
            $data = json_decode(file_get_contents("php://input"));
            
            if (!empty($data->id)) {
                $schedule->id = $data->id;
                $schedule->catcher_team_id = $data->catcher_team_id;
                $schedule->incident_id = $data->incident_id;
                $schedule->scheduled_date = $data->scheduled_date;
                $schedule->scheduled_time = $data->scheduled_time;
                $schedule->end_time = $data->end_time;
                $schedule->status = $data->status;
                $schedule->notes = $data->notes;
                
                if ($schedule->update()) {
                    http_response_code(200);
                    echo json_encode(["message" => "Schedule updated successfully"]);
                } else {
                    http_response_code(503);
                    echo json_encode(["message" => "Unable to update schedule"]);
                }
            } else {
                http_response_code(400);
                echo json_encode(["message" => "ID is required"]);
            }
            break;
            
        case 'DELETE':
            // Delete schedule
            $data = json_decode(file_get_contents("php://input"));
            
            if (!empty($data->id)) {
                $schedule->id = $data->id;
                
                if ($schedule->delete()) {
                    http_response_code(200);
                    echo json_encode(["message" => "Schedule deleted successfully"]);
                } else {
                    http_response_code(503);
                    echo json_encode(["message" => "Unable to delete schedule"]);
                }
            } else {
                http_response_code(400);
                echo json_encode(["message" => "ID is required"]);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(["message" => "Method not allowed"]);
            break;
    }
} else {
    // Handle Catcher Team endpoints
    $catcherTeam = new CatcherTeam($db);
    
    switch($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                // Get single team
                $catcherTeam->id = $_GET['id'];
                
                if ($catcherTeam->readOne()) {
                    $team_arr = array(
                        "id" => $catcherTeam->id,
                        "team_name" => $catcherTeam->team_name,
                        "leader_name" => $catcherTeam->leader_name,
                        "contact_number" => $catcherTeam->contact_number,
                        "email" => $catcherTeam->email,
                        "status" => $catcherTeam->status,
                        "members_count" => $catcherTeam->members_count,
                        "created_at" => $catcherTeam->created_at,
                        "updated_at" => $catcherTeam->updated_at
                    );
                    
                    http_response_code(200);
                    echo json_encode($team_arr);
                } else {
                    http_response_code(404);
                    echo json_encode(["message" => "Team not found"]);
                }
            } else {
                // Get all teams
                $filters = [
                    'status' => $_GET['status'] ?? null
                ];
                
                $stmt = $catcherTeam->read($filters);
                $num = $stmt->rowCount();
                
                if ($num > 0) {
                    $teams_arr = array();
                    $teams_arr["records"] = array();
                    $teams_arr["total"] = $num;
                    
                    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                        $team_item = array(
                            "id" => $row['id'],
                            "team_name" => $row['team_name'],
                            "leader_name" => $row['leader_name'],
                            "contact_number" => $row['contact_number'],
                            "email" => $row['email'],
                            "status" => $row['status'],
                            "members_count" => $row['members_count'],
                            "active_incidents" => $row['active_incidents'],
                            "created_at" => $row['created_at'],
                            "updated_at" => $row['updated_at']
                        );
                        
                        array_push($teams_arr["records"], $team_item);
                    }
                    
                    http_response_code(200);
                    echo json_encode($teams_arr);
                } else {
                    http_response_code(200);
                    echo json_encode([
                        "records" => [],
                        "total" => 0,
                        "message" => "No teams found"
                    ]);
                }
            }
            break;
            
        case 'POST':
            // Create new team
            $data = json_decode(file_get_contents("php://input"));
            
            if (!empty($data->team_name) && !empty($data->leader_name)) {
                $catcherTeam->team_name = $data->team_name;
                $catcherTeam->leader_name = $data->leader_name;
                $catcherTeam->contact_number = $data->contact_number;
                $catcherTeam->email = $data->email ?? '';
                $catcherTeam->status = $data->status ?? 'active';
                $catcherTeam->members_count = $data->members_count ?? 1;
                
                if ($catcherTeam->create()) {
                    http_response_code(201);
                    echo json_encode([
                        "message" => "Team created successfully",
                        "id" => $catcherTeam->id
                    ]);
                } else {
                    http_response_code(503);
                    echo json_encode(["message" => "Unable to create team"]);
                }
            } else {
                http_response_code(400);
                echo json_encode(["message" => "Required data is missing"]);
            }
            break;
            
        case 'PUT':
            // Update team
            $data = json_decode(file_get_contents("php://input"));
            
            if (!empty($data->id)) {
                $catcherTeam->id = $data->id;
                $catcherTeam->team_name = $data->team_name;
                $catcherTeam->leader_name = $data->leader_name;
                $catcherTeam->contact_number = $data->contact_number;
                $catcherTeam->email = $data->email;
                $catcherTeam->status = $data->status;
                $catcherTeam->members_count = $data->members_count;
                
                if ($catcherTeam->update()) {
                    http_response_code(200);
                    echo json_encode(["message" => "Team updated successfully"]);
                } else {
                    http_response_code(503);
                    echo json_encode(["message" => "Unable to update team"]);
                }
            } else {
                http_response_code(400);
                echo json_encode(["message" => "ID is required"]);
            }
            break;
            
        case 'DELETE':
            // Delete team
            $data = json_decode(file_get_contents("php://input"));
            
            if (!empty($data->id)) {
                $catcherTeam->id = $data->id;
                
                if ($catcherTeam->delete()) {
                    http_response_code(200);
                    echo json_encode(["message" => "Team deleted successfully"]);
                } else {
                    http_response_code(503);
                    echo json_encode(["message" => "Unable to delete team"]);
                }
            } else {
                http_response_code(400);
                echo json_encode(["message" => "ID is required"]);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(["message" => "Method not allowed"]);
            break;
    }
}
