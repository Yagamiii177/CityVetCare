<?php
// Update database with new status options
try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=cityvetcare_db', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $sql = "ALTER TABLE incidents 
            MODIFY COLUMN status ENUM('pending', 'verified', 'in_progress', 'resolved', 'rejected', 'cancelled') 
            DEFAULT 'pending'";
    
    $pdo->exec($sql);
    echo "✓ Database updated successfully!\n";
    echo "✓ Added 'verified' and 'rejected' status options to incidents table.\n";
} catch (Exception $e) {
    echo "✗ Error updating database: " . $e->getMessage() . "\n";
}
