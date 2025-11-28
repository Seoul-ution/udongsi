<?php
// api/categories.php
// 카테고리 관련 API: GET /api/categories/{category}/dishes

require_once __DIR__ . '/../db/db.php';

// api.php에서 정의되지 않았을 수 있으므로 재정의 (구조상 중복될 수 있음)
function json_ok($data, $extra = null)
{
    http_response_code(200);
    $out = array('message' => 'OK', 'data' => $data);
    if ($extra !== null && is_array($extra)) {
        foreach ($extra as $k => $v) {
            $out[$k] = $v;
        }
    }
    // JSON_UNESCAPED_UNICODE 플래그 사용
    echo json_encode($out, JSON_UNESCAPED_UNICODE);
    exit;
}

function json_error($msg, $code)
{
    http_response_code($code);
    echo json_encode(array('message' => $msg), JSON_UNESCAPED_UNICODE);
    exit;
}

// ---------------- Path Parsing ----------------
// api.php에서 segments 배열을 받아서 사용한다고 가정하지만,
// categories.php 파일 자체의 독립적인 테스트/실행을 위해 파싱 로직을 포함합니다.

$method = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'GET';
$reqUri = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '/';
$parsedPath = parse_url($reqUri, PHP_URL_PATH);
$path = ($parsedPath !== null) ? $parsedPath : '/';
$pathWithoutApi = preg_replace('#^/api/?#', '', $path);
$pathWithoutApi = trim($pathWithoutApi, '/');

// segments 배열 생성 및 첫 번째 리소스 ('categories') 제거
$segments = ($pathWithoutApi === '') ? [] : explode('/', $pathWithoutApi);
if (isset($segments[0]) && $segments[0] === 'categories') {
    array_shift($segments); // 'categories' 제거
} else {
    json_error('API Not Found', 404);
}

// ---------------- Routes ----------------

if ($method !== 'GET') {
    json_error('Method Not Allowed', 405);
}

// 3-1 카테고리별 반찬 리스트 조회: /api/categories/{category}/dishes
if (count($segments) === 2
    && isset($segments[0])
    && isset($segments[1]) && $segments[1] === 'dishes') {

    $category = urldecode($segments[0]); // 카테고리명은 URL 인코딩될 수 있음
    handle_category_dishes($category);
}

// 404
else {
    json_error('API Not Found', 404);
}

// ---------------- Handler ----------------

/**
 * GET /api/categories/{category}/dishes
 * 특정 카테고리의 반찬 리스트 조회
 */
function handle_category_dishes($category)
{
    if (empty($category)) {
        json_error('Category is required', 400);
    }

    // SQL: dish, store, cart_item을 조인하여 필요한 모든 정보 조회
    $sql = "
        SELECT
            d.dish_id AS dishId,
            s.store_id AS storeId,
            s.store_name AS storeName,
            d.date,
            d.period,
            d.dish_name AS dishName,
            d.category AS dishType,
            d.price,
            IFNULL(ci_count.currentCount, 0) AS currentCount,
            d.threshold
        FROM dish d
        INNER JOIN store s ON d.store_id = s.store_id
        LEFT JOIN (
            -- 공구 현재 인원 계산
            SELECT dish_id, SUM(quantity) AS currentCount
            FROM cart_item
            GROUP BY dish_id
        ) ci_count ON d.dish_id = ci_count.dish_id
        WHERE d.category = :category
        ORDER BY d.date DESC, d.dish_id ASC
    ";

    try {
        $db = get_db();
        $stmt = $db->prepare($sql);
        $stmt->bindValue(':category', $category, PDO::PARAM_STR);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($rows)) {
            // 명세서에 따라 해당 카테고리에 반찬이 없으면 404 반환
            json_error('No dishes found for this category', 404);
        }

        json_ok($rows);
    } catch (Exception $e) {
        // 실제 운영 환경에서는 $e를 기록해야 함
        json_error('Server Error', 500);
    }
}