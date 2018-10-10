<?php
    $methodType = $_SERVER['REQUEST_METHOD'];
    $data = array("status" => "fail", "msg" => "On $methodType");

    $servername = "localhost";
    $dblogin = "foodcrus_taylor";
    $password = "group26publishedmilk";
    $dbname = "foodcrus_scores";

    if ($methodType === 'POST') {

        if(isset($_SERVER['HTTP_X_REQUESTED_WITH'])
            && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
            if(isset($_POST["username"]) && !empty($_POST["username"])
                && isset($_POST["score"])){

                $username = $_POST["username"];
                $score = $_POST["score"];
                
                $trimmed = trim($username);
              
                $data = array("msg" => "Thank you $trimmed, your score of $score has been submitted!",
                    "username" => "$trimmed", "score" => "$score");
                
                $lower = strtolower($trimmed);
                                
                if($lower == "bruce link" || $lower == "bruce" || $lower == "brucelink") {
                    $data["msg"] = $data["msg"] . "\nJust like in life and Java, food waste is cumulative.";
                }
              
                try {
                
                    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $dblogin, $password);
                    
                    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                    
                    $sql = "INSERT INTO level1 (username, score) VALUES ('$trimmed','$score') ON DUPLICATE KEY UPDATE score = GREATEST(score, VALUES(score))";
                    
                    $statement = $conn->prepare($sql);
                    $statement->execute();
                    
                } catch(PDOException $e) {
                    $data = array("error", $e->getMessage());
                }

            } else {
                $data = array("msg" => "Either username or score were not filled out correctly.");
            }



        } else {
            // not AJAX
            $data = array("msg" => "Has to be an AJAX call.");
        }


    } else {
        // simple error message, only taking POST requests
        $data = array("msg" => "Error: only POST allowed.");
    }

    echo json_encode($data, JSON_FORCE_OBJECT);

?>
