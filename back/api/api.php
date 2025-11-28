<?php
// api/api.php

require_once __DIR__ . '/../db/db.php';

// HTTP 메서드
$method = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'GET';

// 요청 URI에서 path만 추출 (쿼리스트링 제거)
$reqUri = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '/';
$parsedPath = parse_url($reqUri, PHP_URL_PATH);
$path = ($parsedPath !== null) ? $parsedPath : '/';

// /api 뒤 경로만 추출
// 예) /api/common/search -> common/search
$pathWithoutApi = preg_replace('#^/api/?#', '', $path);
$pathWithoutApi = trim($pathWithoutApi, '/'); // "common/search", "markets", "home/special" ...

// 세그먼트 분리
$segments = ($pathWithoutApi === '') ? array() : explode('/', $pathWithoutApi);
$resource = isset($segments[0]) ? $segments[0] : '';   // common, markets, home, categories, cart...
$id       = isset($segments[1]) ? $segments[1] : null;

// 공통 컨텍스트
$apiContext = array(
    'method'   => $method,
    'resource' => $resource,
    'id'       => $id,
    'segments' => $segments,
);

// 공통·검색 관련 (/api/common/...)
if ($resource === 'common') {
    require __DIR__ . '/common.php';
    exit;
}

// 시장 목록 관련 (/api/markets ...)
if ($resource === 'markets') {
    require __DIR__ . '/markets.php';
    exit;
}

// 홈 화면 관련 (/api/home/...)
if ($resource === 'home') {
    require __DIR__ . '/home.php';
    exit;
}

// 카테고리 관련 (/api/categories/...)
if ($resource === 'categories') {
    require __DIR__ . '/categories.php';
    exit;
}

// 장바구니 관련 (/api/cart/...)
if ($resource === 'cart') {
    require __DIR__ . '/cart.php';
    exit;
}

// /api 또는 /api/ 로만 들어오면 간단한 정보 리턴
if ($resource === '') {
    http_response_code(200);
    echo json_encode(array(
        'message'   => 'This is an API root',
        'resources' => array('common', 'markets', 'home', 'categories', 'cart'),
    ));
    exit;
}

// 나머지는 전부 404
http_response_code(404);
echo json_encode(array('error' => 'API Not Found'));
