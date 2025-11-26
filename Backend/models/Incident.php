<?php
/**
 * Incident Model
 * Handles incident report operations
 */

class Incident {
    private $conn;
    private $table_name = "incidents";

    // Incident properties
    public $id;
    public $title;
    public $description;
    public $location;
    public $latitude;
    public $longitude;
    public $status;
    public $priority;
    public $reporter_name;
    public $reporter_contact;
    public $incident_date;
    public $images;
    public $assigned_catcher_id;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Get all incidents with optional filters
     */
    public function read($filters = []) {
        $query = "SELECT i.*, 
                         c.team_name as catcher_team_name,
                         c.leader_name as catcher_leader
                  FROM " . $this->table_name . " i
                  LEFT JOIN catcher_teams c ON i.assigned_catcher_id = c.id
                  WHERE 1=1";

        if (!empty($filters['status'])) {
            $query .= " AND i.status = :status";
        }
        if (!empty($filters['priority'])) {
            $query .= " AND i.priority = :priority";
        }
        if (!empty($filters['search'])) {
            $query .= " AND (i.title LIKE :search OR i.description LIKE :search OR i.location LIKE :search)";
        }

        $query .= " ORDER BY i.created_at DESC";

        $stmt = $this->conn->prepare($query);

        if (!empty($filters['status'])) {
            $stmt->bindParam(":status", $filters['status']);
        }
        if (!empty($filters['priority'])) {
            $stmt->bindParam(":priority", $filters['priority']);
        }
        if (!empty($filters['search'])) {
            $searchTerm = "%" . $filters['search'] . "%";
            $stmt->bindParam(":search", $searchTerm);
        }

        $stmt->execute();
        return $stmt;
    }

    /**
     * Get single incident by ID
     */
    public function readOne() {
        $query = "SELECT i.*, 
                         c.team_name as catcher_team_name,
                         c.leader_name as catcher_leader,
                         c.contact_number as catcher_contact
                  FROM " . $this->table_name . " i
                  LEFT JOIN catcher_teams c ON i.assigned_catcher_id = c.id
                  WHERE i.id = :id
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $this->title = $row['title'];
            $this->description = $row['description'];
            $this->location = $row['location'];
            $this->latitude = $row['latitude'];
            $this->longitude = $row['longitude'];
            $this->status = $row['status'];
            $this->priority = $row['priority'];
            $this->reporter_name = $row['reporter_name'];
            $this->reporter_contact = $row['reporter_contact'];
            $this->incident_date = $row['incident_date'];
            $this->images = $row['images'];
            $this->assigned_catcher_id = $row['assigned_catcher_id'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            return true;
        }

        return false;
    }

    /**
     * Create new incident
     */
    public function create() {
        $query = "INSERT INTO " . $this->table_name . "
                  SET title = :title,
                      description = :description,
                      location = :location,
                      latitude = :latitude,
                      longitude = :longitude,
                      status = :status,
                      priority = :priority,
                      reporter_name = :reporter_name,
                      reporter_contact = :reporter_contact,
                      incident_date = :incident_date,
                      images = :images,
                      created_at = NOW()";

        $stmt = $this->conn->prepare($query);

        // Sanitize
        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->location = htmlspecialchars(strip_tags($this->location));
        $this->reporter_name = htmlspecialchars(strip_tags($this->reporter_name));
        $this->reporter_contact = htmlspecialchars(strip_tags($this->reporter_contact));

        // Bind values
        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":location", $this->location);
        $stmt->bindParam(":latitude", $this->latitude);
        $stmt->bindParam(":longitude", $this->longitude);
        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":priority", $this->priority);
        $stmt->bindParam(":reporter_name", $this->reporter_name);
        $stmt->bindParam(":reporter_contact", $this->reporter_contact);
        $stmt->bindParam(":incident_date", $this->incident_date);
        $stmt->bindParam(":images", $this->images);

        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }

        return false;
    }

    /**
     * Update incident
     */
    public function update() {
        $query = "UPDATE " . $this->table_name . "
                  SET title = :title,
                      description = :description,
                      location = :location,
                      latitude = :latitude,
                      longitude = :longitude,
                      status = :status,
                      priority = :priority,
                      assigned_catcher_id = :assigned_catcher_id,
                      updated_at = NOW()
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        // Sanitize
        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->location = htmlspecialchars(strip_tags($this->location));

        // Bind values
        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":location", $this->location);
        $stmt->bindParam(":latitude", $this->latitude);
        $stmt->bindParam(":longitude", $this->longitude);
        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":priority", $this->priority);
        $stmt->bindParam(":assigned_catcher_id", $this->assigned_catcher_id);
        $stmt->bindParam(":id", $this->id);

        if ($stmt->execute()) {
            return true;
        }

        return false;
    }

    /**
     * Delete incident
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
     * Get incidents count by status
     */
    public function getCountByStatus() {
        $query = "SELECT status, COUNT(*) as count
                  FROM " . $this->table_name . "
                  GROUP BY status";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt;
    }
}
