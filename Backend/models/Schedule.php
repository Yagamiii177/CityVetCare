<?php
/**
 * Schedule Model
 * Handles catcher schedule operations
 */

class Schedule {
    private $conn;
    private $table_name = "schedules";

    // Schedule properties
    public $id;
    public $catcher_team_id;
    public $incident_id;
    public $scheduled_date;
    public $scheduled_time;
    public $end_time;
    public $status;
    public $notes;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Get all schedules with optional filters
     */
    public function read($filters = []) {
        $query = "SELECT s.*, 
                         c.team_name,
                         c.leader_name,
                         c.contact_number,
                         i.title as incident_title,
                         i.location as incident_location
                  FROM " . $this->table_name . " s
                  INNER JOIN catcher_teams c ON s.catcher_team_id = c.id
                  LEFT JOIN incidents i ON s.incident_id = i.id
                  WHERE 1=1";

        if (!empty($filters['catcher_team_id'])) {
            $query .= " AND s.catcher_team_id = :catcher_team_id";
        }
        if (!empty($filters['status'])) {
            $query .= " AND s.status = :status";
        }
        if (!empty($filters['date'])) {
            $query .= " AND DATE(s.scheduled_date) = :date";
        }

        $query .= " ORDER BY s.scheduled_date ASC, s.scheduled_time ASC";

        $stmt = $this->conn->prepare($query);

        if (!empty($filters['catcher_team_id'])) {
            $stmt->bindParam(":catcher_team_id", $filters['catcher_team_id']);
        }
        if (!empty($filters['status'])) {
            $stmt->bindParam(":status", $filters['status']);
        }
        if (!empty($filters['date'])) {
            $stmt->bindParam(":date", $filters['date']);
        }

        $stmt->execute();
        return $stmt;
    }

    /**
     * Get single schedule by ID
     */
    public function readOne() {
        $query = "SELECT s.*, 
                         c.team_name,
                         c.leader_name,
                         c.contact_number,
                         i.title as incident_title,
                         i.location as incident_location,
                         i.description as incident_description
                  FROM " . $this->table_name . " s
                  INNER JOIN catcher_teams c ON s.catcher_team_id = c.id
                  LEFT JOIN incidents i ON s.incident_id = i.id
                  WHERE s.id = :id
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $this->catcher_team_id = $row['catcher_team_id'];
            $this->incident_id = $row['incident_id'];
            $this->scheduled_date = $row['scheduled_date'];
            $this->scheduled_time = $row['scheduled_time'];
            $this->end_time = $row['end_time'];
            $this->status = $row['status'];
            $this->notes = $row['notes'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            return true;
        }

        return false;
    }

    /**
     * Create new schedule
     */
    public function create() {
        $query = "INSERT INTO " . $this->table_name . "
                  SET catcher_team_id = :catcher_team_id,
                      incident_id = :incident_id,
                      scheduled_date = :scheduled_date,
                      scheduled_time = :scheduled_time,
                      end_time = :end_time,
                      status = :status,
                      notes = :notes,
                      created_at = NOW()";

        $stmt = $this->conn->prepare($query);

        // Sanitize
        $this->notes = htmlspecialchars(strip_tags($this->notes));

        // Bind values
        $stmt->bindParam(":catcher_team_id", $this->catcher_team_id);
        $stmt->bindParam(":incident_id", $this->incident_id);
        $stmt->bindParam(":scheduled_date", $this->scheduled_date);
        $stmt->bindParam(":scheduled_time", $this->scheduled_time);
        $stmt->bindParam(":end_time", $this->end_time);
        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":notes", $this->notes);

        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }

        return false;
    }

    /**
     * Update schedule
     */
    public function update() {
        $query = "UPDATE " . $this->table_name . "
                  SET catcher_team_id = :catcher_team_id,
                      incident_id = :incident_id,
                      scheduled_date = :scheduled_date,
                      scheduled_time = :scheduled_time,
                      end_time = :end_time,
                      status = :status,
                      notes = :notes,
                      updated_at = NOW()
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        // Sanitize
        $this->notes = htmlspecialchars(strip_tags($this->notes));

        // Bind values
        $stmt->bindParam(":catcher_team_id", $this->catcher_team_id);
        $stmt->bindParam(":incident_id", $this->incident_id);
        $stmt->bindParam(":scheduled_date", $this->scheduled_date);
        $stmt->bindParam(":scheduled_time", $this->scheduled_time);
        $stmt->bindParam(":end_time", $this->end_time);
        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":notes", $this->notes);
        $stmt->bindParam(":id", $this->id);

        if ($stmt->execute()) {
            return true;
        }

        return false;
    }

    /**
     * Delete schedule
     */
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);

        if ($stmt->execute()) {
            return true;
        }

        return false;
    }

    /**
     * Get schedules for today
     */
    public function getTodaySchedules() {
        $query = "SELECT s.*, 
                         c.team_name,
                         c.leader_name,
                         i.title as incident_title,
                         i.location as incident_location
                  FROM " . $this->table_name . " s
                  INNER JOIN catcher_teams c ON s.catcher_team_id = c.id
                  LEFT JOIN incidents i ON s.incident_id = i.id
                  WHERE DATE(s.scheduled_date) = CURDATE()
                  ORDER BY s.scheduled_time ASC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt;
    }
}
