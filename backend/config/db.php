<?php
// backend/config/db.php

class Database {
    private $host = "localhost";
    private $db_name = "medicare_db";
    private $username = "root";
    private $password = "";
    public $conn;

    // Production credentials (uncomment when deploying)
    // private $host = "localhost";
    // private $db_name = "yourcpanel_medicare_db";
    // private $username = "yourcpanel_medicareuser";
    // private $password = "your_production_password";
    // public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->exec("set names utf8");
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }
        return $this->conn;
    }
}
?>
