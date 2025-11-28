<?php
// api/home.php
// 홈 화면 관련 API
// - GET /api/home/special?marketId=...

require_once __DIR__ . '/../db/db.php';

/**
 * JSON 성공 응답
 */
function json_ok($data, $extra = null)
{
    http_response_code(200);
    $out = array('message' => 'OK', 'data' => $data);
    if ($extra !== null && is_array($extra)) {
        foreach ($extra as $k => $v) {
            $out[$k] = $v;
        }
    }
    echo json_encode($out, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * JSON 오류 응답
 */
function json_error($msg, $code)
{
    http_response_code($code);
    echo json_encode(array('message' => $msg), JSON_UNESCAPED_UNICODE);
    exit;
}

// 요청 메서드/경로
$method = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'GET';
$reqUri = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '/';
$parsedPath = parse_url($reqUri, PHP_URL_PATH);
$path = ($parsedPath !== null) ? $parsedPath : '/';
$pathWithoutApi = preg_replace('#^/api/?#', '', $path);
$pathWithoutApi = trim($pathWithoutApi, '/');

// --- 💡추가된 정제 로직 ---
// 연속된 슬래시를 하나의 슬래시로 대체
$pathWithoutApi = preg_replace('#/+#', '/', $pathWithoutApi);
// 최종적으로 다시 양쪽 슬래시 제거 (이전 trim이 실패할 경우 대비)
$pathWithoutApi = trim($pathWithoutApi, '/');
// -----------------------

$segments = ($pathWithoutApi === '') ? [] : explode('/', $pathWithoutApi);

// --- 디버깅 코드 시작 ---
error_log("Path: " . $pathWithoutApi);
error_log("Segments Count: " . count($segments));
error_log("Segments: " . print_r($segments, true));
// --- 디버깅 코드 끝 ---
// ---------------- Routes ----------------
if ($method !== 'GET') {
    json_error('Method Not Allowed', 405);
}

// 1️⃣ 특가 상품 조회 (2 segments)
if (count($segments) === 2 && $segments[0] === 'home' && $segments[1] === 'special') {
    handle_home_special();
}

// 404
else {
    json_error('API Not Found', 404);
}
// ---------------- Handlers ----------------

/**
 * GET /api/home/special?marketId=...
 * 특가 상품 조회
 */
function handle_home_special()
{
    $marketId = isset($_GET['marketId']) ? (int)$_GET['marketId'] : null;

    $sql = "
        SELECT
            d.dish_id AS dishId,
            d.date,
            d.period,
            s.store_name AS storeName,
            d.dish_name AS dishName,
            d.price
        FROM dish d
        INNER JOIN store s ON d.store_id = s.store_id
        WHERE s.is_special = 1
    ";
    if ($marketId !== null && $marketId > 0) {
        $sql .= " AND s.market_id = :marketId";
    }
    $sql .= " ORDER BY d.date ASC, d.store_id ASC, d.dish_id ASC";

    try {
        $db = get_db();
        $stmt = $db->prepare($sql);
        if ($marketId !== null && $marketId > 0) {
            $stmt->bindValue(':marketId', $marketId, PDO::PARAM_INT);
        }
        $stmt->execute();
        $rows = $stmt->fetchAll();
        json_ok($rows);
    } catch (Exception $e) {
        json_error('Server Error', 500);
    }
}
