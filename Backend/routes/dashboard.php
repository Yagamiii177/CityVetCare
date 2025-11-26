<?php
/**
 * Dashboard Routes
 * API endpoints for dashboard statistics
 */

header("Content-Type: application/json; charset=UTF-8");

require_once '../config/database.php';
require_once '../models/Incident.php';
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

if ($method === 'GET') {
    $incident = new Incident($db);
    $catcherTeam = new CatcherTeam($db);
    $schedule = new Schedule($db);
    
    // Get incident counts by status
    $incident_stats = [];
    $stmt = $incident->getCountByStatus();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $incident_stats[$row['status']] = (int)$row['count'];
    }
    
    // Get total incidents
    $total_incidents_stmt = $incident->read([]);
    $total_incidents = $total_incidents_stmt->rowCount();
    
    // Get active catcher teams
    $active_teams_stmt = $catcherTeam->read(['status' => 'active']);
    $active_teams = $active_teams_stmt->rowCount();
    
    // Get today's schedules
    $today_schedules_stmt = $schedule->getTodaySchedules();
    $today_schedules = [];
    while ($row = $today_schedules_stmt->fetch(PDO::FETCH_ASSOC)) {
        $today_schedules[] = [
            'id' => $row['id'],
            'team_name' => $row['team_name'],
            'incident_title' => $row['incident_title'],
            'incident_location' => $row['incident_location'],
            'scheduled_time' => $row['scheduled_time'],
            'status' => $row['status']
        ];
    }
    
    // Get recent incidents (last 5)
    $recent_incidents_stmt = $incident->read([]);
    $recent_incidents = [];
    $count = 0;
    while (($row = $recent_incidents_stmt->fetch(PDO::FETCH_ASSOC)) && $count < 5) {
        $recent_incidents[] = [
            'id' => $row['id'],
            'title' => $row['title'],
            'location' => $row['location'],
            'status' => $row['status'],
            'priority' => $row['priority'],
            'created_at' => $row['created_at']
        ];
        $count++;
    }
    
    // Compile dashboard data
    $dashboard_data = [
        'summary' => [
            'total_incidents' => $total_incidents,
            'pending_incidents' => $incident_stats['pending'] ?? 0,
            'in_progress_incidents' => $incident_stats['in_progress'] ?? 0,
            'resolved_incidents' => $incident_stats['resolved'] ?? 0,
            'active_teams' => $active_teams
        ],
        'incident_stats' => $incident_stats,
        'today_schedules' => $today_schedules,
        'recent_incidents' => $recent_incidents
    ];
    
    http_response_code(200);
    echo json_encode($dashboard_data);
} else {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed"]);
}
