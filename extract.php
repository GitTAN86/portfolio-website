<?php
/**
 * Deployment Unzipper for Namecheap/cPanel
 * This script extracts deploy.zip and then deletes itself and the zip.
 */

// --- SECURITY CHECK ---
// You can add a password check here if you want:
// if ($_GET['key'] !== 'YOUR_SECRET_KEY') die('Unauthorized');

$zipFile = '../bahmannoushabadi.me/Auto_Agent/my_portfolio_project/deploy.zip';
$extractTo = '../bahmannoushabadi.me/Auto_Agent/my_portfolio_project/';

if (!file_exists($zipFile)) {
    die("Error: $zipFile not found.");
}

$zip = new ZipArchive;
if ($zip->open($zipFile) === TRUE) {
    $zip->extractTo($extractTo);
    $zip->close();
    
    // Cleanup
    unlink($zipFile);
    
    echo "Success: Deployment extracted successfully.";
    
    // Self-destruct for security
    // unlink(__FILE__); 
} else {
    echo "Error: Failed to open $zipFile.";
}
?>
