<?php
/**
 * CatcherTeam Model
 * Handles catcher team operations
 */

class CatcherTeam {
    private $conn;
    private $table_name = "catcher_teams";

    // Team properties
    public $id;
    public $team_name;
    public $leader_name;
    public $contact_number;
    public $email;
    public $status;
    public $members_count;
    public $assigned_incidents;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Get all catcher teams
     */
    public function read($filters = []) {
        $query = "SELECT ct.*,
                         COUNT(DISTINCT i.id) as active_incidents
                  FROM " . $this->table_name . " ct
                  LEFT JOIN incidents i ON ct.id = i.assigned_catcher_id 
                      AND i.status IN ('pending', 'in_progress')
                  WHERE 1=1";

        if (!empty($filters['status'])) {
            $query .= " AND ct.status = :status";
        }

        $query .= " GROUP BY ct.id ORDER BY ct.team_name ASC";

        $stmt = $this->conn->prepare($query);

        if (!empty($filters['status'])) {
            $stmt->bindParam(":status", $filters['status']);
        }

        $stmt->execute();
        return $stmt;
    }

    /**
     * Get single team by ID
     */
    public function readOne() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = :id LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $this->team_name = $row['team_name'];
            $this->leader_name = $row['leader_name'];
            $this->contact_number = $row['contact_number'];
            $this->email = $row['email'];
            $this->status = $row['status'];
            $this->members_count = $row['members_count'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            return true;
        }

        return false;
    }

    /**
     * Create new catcher team
     */
    public function create() {
        $query = "INSERT INTO " . $this->table_name . "
                  SET team_name = :team_name,
                      leader_name = :leader_name,
                      contact_number = :contact_number,
                      email = :email,
                      status = :status,
                      members_count = :members_count,
                      created_at = NOW()";

        $stmt = $this->conn->prepare($query);

        // Sanitize
        $this->team_name = htmlspecialchars(strip_tags($this->team_name));
        $this->leader_name = htmlspecialchars(strip_tags($this->leader_name));
        $this->contact_number = htmlspecialchars(strip_tags($this->contact_number));
        $this->email = htmlspecialchars(strip_tags($this->email));

        // Bind values
        $stmt->bindParam(":team_name", $this->team_name);
        $stmt->bindParam(":leader_name", $this->leader_name);
        $stmt->bindParam(":contact_number", $this->contact_number);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":members_count", $this->members_count);

        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }

        return false;
    }

    /**
     * Update catcher team
     */
    public function update() {
        $query = "UPDATE " . $this->table_name . "
                  SET team_name = :team_name,
                      leader_name = :leader_name,
                      contact_number = :contact_number,
                      email = :email,
                      status = :status,
                      members_count = :members_count,
                      updated_at = NOW()
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        // Sanitize
        $this->team_name = htmlspecialchars(strip_tags($this->team_name));
        $this->leader_name = htmlspecialchars(strip_tags($this->leader_name));
        $this->contact_number = htmlspecialchars(strip_tags($this->contact_number));
        $this->email = htmlspecialchars(strip_tags($this->email));

        // Bind values
        $stmt->bindParam(":team_name", $this->team_name);
        $stmt->bindParam(":leader_name", $this->leader_name);
        $stmt->bindParam(":contact_number", $this->contact_number);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":members_count", $this->members_count);
        $stmt->bindParam(":id", $this->id);

        if ($stmt->execute()) {
            return true;
        }

        return false;
    }

    /**
     * Delete catcher team
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
}
