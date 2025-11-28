<?php
// api/markets.php
// - GET /api/markets
// - GET /api/markets?address=...   (주소 기반 근처 시장 리스트 요청 — 서버에서 거리 계산 불가, 그대로 반환)
// - GET /api/markets/{marketId}
// - GET /api/markets/{marketId}/stores

require_once __DIR__ . '/../db/db.php';

function json_ok($data, $extra = null)
{
    http_response_code(200);
    $out = array('message' => 'OK', 'data' => $data);
    if ($extra !== null && is_array($extra)) {
        foreach ($extra as $k => $v) {
            $out[$k] = $v;
        }
    }
    echo json_encode($out);
    exit;
}

function json_error($msg, $code)
{
    http_response_code($code);
    echo json_encode(array('message' => $msg));
    exit;
}

// Parse request path/segments (safe parsing in case api.php didn't)
$method = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'GET';
$reqUri = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '/';
$parsedPath = parse_url($reqUri, PHP_URL_PATH);
$path = ($parsedPath !== null) ? $parsedPath : '/';
$pathWithoutApi = preg_replace('#^/api/?#', '', $path);
$pathWithoutApi = trim($pathWithoutApi, '/');
$segments = ($pathWithoutApi === '') ? array() : explode('/', $pathWithoutApi);

// Expect first segment 'markets'
if (isset($segments[0]) && $segments[0] === 'markets') {
    array_shift($segments);
} else {
    json_error('API Not Found', 404);
}

// Only support GET for these endpoints
if ($method !== 'GET') {
    json_error('Method Not Allowed', 405);
}

// Routes:
// - GET /api/markets            -> handle_markets()
// - GET /api/markets/{id}/stores/{id}/dishes -> handle_store_dishes($id, $id) // ✨ 추가
// - GET /api/markets/{id}       -> handle_market_detail($id)
// - GET /api/markets/{id}/stores -> handle_market_stores($id)

// 1. 가게별 반찬 조회: /api/markets/{marketId}/stores/{storeId}/dishes (4 segments)
if (count($segments) === 4
    && isset($segments[0]) && is_numeric($segments[0]) // marketId
    && isset($segments[1]) && $segments[1] === 'stores'
    && isset($segments[2]) && is_numeric($segments[2]) // storeId
    && isset($segments[3]) && $segments[3] === 'dishes') {

    $marketId = (int)$segments[0];
    $storeId = (int)$segments[2];
    handle_store_dishes($marketId, $storeId);
}

// 2. 시장 가게 리스트 조회 및 시장 상세 조회 (기존 로직):
//    이 로직은 4 세그먼트 요청을 건너뛰었으므로 안전합니다.
elseif (count($segments) === 0) {
    handle_markets();
}
elseif (isset($segments[0]) && is_numeric($segments[0])) {
    $marketId = (int)$segments[0];
    if (isset($segments[1]) && $segments[1] === 'stores') {
        // [수정된 부분]: 정확히 2 세그먼트인 경우만 처리하여 오버매칭 방지 (markets/id/stores)
        if (count($segments) === 2) {
            handle_market_stores($marketId);
        }
    } else {
        // 1 세그먼트인 경우: /api/markets/{marketId}
        if (count($segments) === 1) {
            handle_market_detail($marketId);
        }
    }
}

// Not found
json_error('API Not Found', 404);


/** ---------- Handlers ---------- **/

/**
 * GET /api/markets
 * optional query param: address (string) — if present, returns same markets list (server-side geocoding not implemented)
 */
/**
 * GET /api/markets
 * 현재: 거리 계산 없이 모든 시장 리스트 반환
 * 추후: 주소(address) 파라미터로 근처 시장 필터/정렬 로직 추가 예정
 */
function handle_markets()
{
    // (프론트에서 address를 보내더라도 현재는 사용하지 않음)
    // $address = isset($_GET['address']) ? trim($_GET['address']) : '';

    $sql = "SELECT market_id AS marketId, market_name AS marketName FROM market ORDER BY market_id ASC";

    try {
        $db = get_db();
        $stmt = $db->query($sql);
        $rows = $stmt->fetchAll();

        // 단순한 리스트만 반환. 추후 proximity(거리) 기반 필터/정렬 추가 예정.
        json_ok($rows, array('note' => 'Returned all markets. Nearby-market filtering not implemented yet.'));
    } catch (Exception $e) {
        json_error('Server Error', 500);
    }
}


/**
 * GET /api/markets/{marketId}
 * Return basic market info and store count
 */
function handle_market_detail($marketId)
{
    if (!is_numeric($marketId) || $marketId <= 0) {
        json_error('Invalid marketId', 400);
    }

    $sql = "
        SELECT
            m.market_id AS marketId,
            m.market_name AS marketName,
            IFNULL(s.storeCount, 0) AS storeCount
        FROM market m
        LEFT JOIN (
            SELECT market_id, COUNT(*) AS storeCount
            FROM store
            GROUP BY market_id
        ) s ON m.market_id = s.market_id
        WHERE m.market_id = :marketId
        LIMIT 1
    ";

    try {
        $db = get_db();
        $stmt = $db->prepare($sql);
        $stmt->bindValue(':marketId', (int)$marketId, PDO::PARAM_INT);
        $stmt->execute();
        $row = $stmt->fetch();

        if (!$row) {
            json_error('Not Found', 404);
        }

        json_ok($row);
    } catch (Exception $e) {
        json_error('Server Error', 500);
    }
}

/**
 * GET /api/markets/{marketId}/stores
 * Return stores in a market
 * Optional query params:
 *    - isSpecial=1|0  (filter by special flag)
 */
function handle_market_stores($marketId)
{
    if (!is_numeric($marketId) || $marketId <= 0) {
        json_error('Invalid marketId', 400);
    }

    $isSpecial = null;
    if (isset($_GET['isSpecial']) && ($_GET['isSpecial'] === '0' || $_GET['isSpecial'] === '1')) {
        $isSpecial = (int) $_GET['isSpecial'];
    }

    $sql = "SELECT store_id AS storeId, store_name AS storeName, market_id AS marketId, is_special AS isSpecial FROM store WHERE market_id = :marketId";
    if ($isSpecial !== null) {
        $sql .= " AND is_special = :isSpecial";
    }
    $sql .= " ORDER BY store_name ASC";

    try {
        $db = get_db();
        $stmt = $db->prepare($sql);
        $stmt->bindValue(':marketId', (int)$marketId, PDO::PARAM_INT);
        if ($isSpecial !== null) {
            $stmt->bindValue(':isSpecial', $isSpecial, PDO::PARAM_INT);
        }
        $stmt->execute();
        $rows = $stmt->fetchAll();

        json_ok($rows);
    } catch (Exception $e) {
        json_error('Server Error', 500);
    }
}


/**
 * GET /api/markets/{marketId}/stores/{storeId}/dishes
 * 가게별 반찬 조회 (home.php에서 이관됨)
 */
function handle_store_dishes($marketId, $storeId)
{
    if ($marketId <= 0 || $storeId <= 0) json_error('Invalid IDs', 400);

    $db = get_db();

    // store 정보
    $stmtStore = $db->prepare("SELECT store_id AS storeId, store_name AS storeName FROM store WHERE store_id = :storeId AND market_id = :marketId");
    $stmtStore->bindValue(':storeId', $storeId, PDO::PARAM_INT);
    $stmtStore->bindValue(':marketId', $marketId, PDO::PARAM_INT);
    $stmtStore->execute();
    $storeRow = $stmtStore->fetch(PDO::FETCH_ASSOC);

    if (!$storeRow) json_error('Store Not Found', 404);

    // dish 정보
    $stmtDishes = $db->prepare("
        SELECT
            d.dish_id AS dishId,
            d.date,
            d.period,
            d.dish_name AS dishName,
            d.price,
            IFNULL(ci_count.currentCount, 0) AS currentCount,
            d.threshold
        FROM dish d
        LEFT JOIN (
            SELECT dish_id, COUNT(*) AS currentCount
            FROM cart_item
            GROUP BY dish_id
        ) ci_count ON d.dish_id = ci_count.dish_id
        WHERE d.store_id = :storeId
        ORDER BY d.dish_id ASC
    ");
    $stmtDishes->bindValue(':storeId', $storeId, PDO::PARAM_INT);
    $stmtDishes->execute();
    $dishes = $stmtDishes->fetchAll(PDO::FETCH_ASSOC);

    $result = [
        'storeId' => (int)$storeRow['storeId'],
        'storeName' => $storeRow['storeName'],
        'dishes' => $dishes ?: []
    ];

    json_ok($result);
}
