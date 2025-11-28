<?php
// public/index.php

// CORS 허용 (필수)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");
// JSON 응답 기본
header("Content-Type: application/json");

// 프리플라이트 OPTIONS 요청 처리
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// REQUEST_URI 가져오기 (PHP 5.x 호환)
$reqUri = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '/';

// parse_url 처리
$parsedPath = parse_url($reqUri, PHP_URL_PATH);
$path = ($parsedPath !== null) ? $parsedPath : '/';

// "/api/" 라우팅
if (strpos($path, '/api/') === 0 || $path === '/api') {
    require_once __DIR__ . '/../api/api.php';
    exit;
}

// 그 외는 404
http_response_code(404);
echo json_encode(['error' => 'Not Found']);
