<?php
// api/cart.php
// 장바구니 관련 API
// - POST /api/cart/items (장바구니 담기)
// - GET /api/cart/items?userId=... (장바구니 목록 조회)

require_once __DIR__ . '/../db/db.php';

// JSON 응답 유틸리티 함수 (home.php 등에서 복사)
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

// ---------------- Path Parsing ----------------
// api.php에서 segments 배열을 받아서 사용한다고 가정

$method = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'GET';
$reqUri = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '/';
$parsedPath = parse_url($reqUri, PHP_URL_PATH);
$path = ($parsedPath !== null) ? $parsedPath : '/';
$pathWithoutApi = preg_replace('#^/api/?#', '', $path);
$pathWithoutApi = trim($pathWithoutApi, '/');

// segments 배열 생성 및 'cart' 제거
$segments = ($pathWithoutApi === '') ? [] : explode('/', $pathWithoutApi);
if (isset($segments[0]) && $segments[0] === 'cart') {
    array_shift($segments); // 'cart' 제거
} else {
    json_error('API Not Found', 404);
}

// ---------------- Routes ----------------

// POST /api/cart/items (4-2: 장바구니 담기)
if ($method === 'POST' && count($segments) === 1 && $segments[0] === 'items') {
    handle_post_cart_items();
}

// GET /api/cart/items?userId=... (5-1: 장바구니 목록 조회)
elseif ($method === 'GET' && count($segments) === 1 && $segments[0] === 'items') {
    handle_get_cart_items();
}

// 404
else {
    json_error('API Not Found', 404);
}

// ---------------- Handlers ----------------

/**
 * 장바구니에 담긴 반찬 목록과 현재 공구 상태를 조회하는 공통 쿼리 함수
 */
function get_cart_details($userId)
{
    if (empty($userId)) return [];

    $sql = "
        SELECT
            d.dish_id AS dishId,
            d.date,
            d.period,
            s.store_name AS storeName,
            d.dish_name AS dishName,
            d.category AS dishType,
            d.price,
            IFNULL(ci_count.currentCount, 0) AS currentCount,
            d.threshold,
            ci.quantity
        FROM cart_item ci
        INNER JOIN dish d ON ci.dish_id = d.dish_id
        INNER JOIN store s ON d.store_id = s.store_id
        LEFT JOIN (
            -- 전체 공구 인원 계산 (장바구니에 있는 모든 유저의 수량 합)
            SELECT dish_id, SUM(quantity) AS currentCount
            FROM cart_item
            GROUP BY dish_id
        ) ci_count ON d.dish_id = ci_count.dish_id
        WHERE ci.user_id = :userId
        ORDER BY d.date DESC, s.store_name ASC
    ";

    try {
        $db = get_db();
        $stmt = $db->prepare($sql);
        $stmt->bindValue(':userId', $userId, PDO::PARAM_STR);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        json_error('Server Error during lookup', 500);
    }
}


/**
 * POST /api/cart/items
 * 4-2. 반찬 장바구니 담기
 */
function handle_post_cart_items()
{
    // 1. Request Body 파싱
    $input = json_decode(file_get_contents('php://input'), true);
    $userId = isset($input['userId']) ? (string)$input['userId'] : null;
    $dishId = isset($input['dishId']) ? (int)$input['dishId'] : null;
    $quantity = isset($input['quantity']) ? (int)$input['quantity'] : null;

    if (empty($userId) || $dishId <= 0 || $quantity <= 0) {
        json_error('userId, dishId, and positive quantity are required.', 400);
    }

    $db = get_db();
    $db->beginTransaction();

    try {
        // 2. dishId 유효성 검사 (Dish가 존재하는지 확인)
        $stmtDish = $db->prepare("SELECT 1 FROM dish WHERE dish_id = :dishId");
        $stmtDish->bindValue(':dishId', $dishId, PDO::PARAM_INT);
        $stmtDish->execute();
        if (!$stmtDish->fetch()) {
            json_error('Dish Not Found.', 404);
        }

        // 3. 삽입 또는 업데이트 (UPSERT): user_id, dish_id가 UNIQUE이므로 INSERT OR UPDATE 사용
        // 현재 PDO는 ON DUPLICATE KEY UPDATE를 직접 지원하지 않으므로 SQL 쿼리 작성 필요 (MySQL 기준)
        $sql = "
            INSERT INTO cart_item (user_id, dish_id, quantity)
            VALUES (:userId, :dishId, :quantity)
            ON DUPLICATE KEY UPDATE
                quantity = quantity + :quantity;
        ";

        $stmt = $db->prepare($sql);
        $stmt->bindValue(':userId', $userId, PDO::PARAM_STR);
        $stmt->bindValue(':dishId', $dishId, PDO::PARAM_INT);
        $stmt->bindValue(':quantity', $quantity, PDO::PARAM_INT);
        $stmt->execute();

        $db->commit();

        // 4. 응답을 위한 상세 정보 조회 (담은 반찬 정보 + 현재 공구 인원)
        // quantity는 이미 쿼리에서 합산되었으므로, 해당 유저의 최종 quantity만 필요.
        $final_quantity_stmt = $db->prepare("SELECT quantity FROM cart_item WHERE user_id = :userId AND dish_id = :dishId");
        $final_quantity_stmt->bindValue(':userId', $userId, PDO::PARAM_STR);
        $final_quantity_stmt->bindValue(':dishId', $dishId, PDO::PARAM_INT);
        $final_quantity_stmt->execute();
        $final_quantity = $final_quantity_stmt->fetchColumn();

        // 공구 정보 조회 (handle_category_dishes의 쿼리를 재활용하거나 유사하게 작성)
        $details = get_cart_details($userId);
        $response_data = null;

        // 방금 담은 dish의 정보를 찾아서 응답 구조에 맞게 반환
        foreach ($details as $item) {
            if ((int)$item['dishId'] === $dishId) {
                // 최종 업데이트된 quantity로 덮어쓰기 (get_cart_details의 quantity는 이전 값일 수 있으므로)
                $item['quantity'] = (int)$final_quantity;
                $response_data = $item;
                break;
            }
        }

        if (!$response_data) {
            // 이럴 일은 거의 없지만, 담은 후 조회가 실패하면 404
            json_error('Item added but details not found.', 404);
        }

        json_ok($response_data);

    } catch (PDOException $e) {
        $db->rollBack();
        json_error('Database Error: ' . $e->getMessage(), 500);
    } catch (Exception $e) {
        $db->rollBack();
        json_error('Server Error', 500);
    }
}


/**
 * GET /api/cart/items?userId=...
 * 5-1. 담은 반찬 리스트 반환
 */
function handle_get_cart_items()
{
    // 1. Query Parameter 파싱
    $userId = isset($_GET['userId']) ? (string)$_GET['userId'] : null;

    if (empty($userId)) {
        json_error('userId is required.', 400); // 400 userId 없음
    }

    // 2. 장바구니 상세 정보 조회 (공통 함수 사용)
    $rows = get_cart_details($userId);

    if (empty($rows)) {
        json_error('Cart is empty.', 404); // 404 장바구니 비어 있음
    }

    json_ok($rows);
}