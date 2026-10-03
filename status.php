<?php
// Runs status.sh and returns its JSON output.

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://acce55.de');
header('Cache-Control: no-cache, no-store');

// Only answer requests addressed to acce55.de
$allowed = ['acce55.de', 'www.acce55.de'];
$host = $_SERVER['HTTP_HOST'] ?? '';
if (!in_array($host, $allowed)) {
    http_response_code(403);
    echo json_encode(['error' => 'forbidden']);
    exit;
}

$output = shell_exec('/var/www/html/status.sh 2>/dev/null');

if ($output === null || trim($output) === '') {
    http_response_code(500);
    echo json_encode(['error' => 'script failed']);
    exit;
}

echo $output;
