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
        $stmt->bindValue(':userId', $userId, PDO::PARAM_INT);
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
    // Request Body 파싱 시 userId를 INT로 캐스팅
    $userId = isset($input['userId']) ? (int)$input['userId'] : null;
    $dishId = isset($input['dishId']) ? (int)$input['dishId'] : null;
    $quantity = isset($input['quantity']) ? (int)$input['quantity'] : null;

    if (empty($userId) || $dishId <= 0 || $quantity <= 0) {
        json_error('userId, dishId, and positive quantity are required.', 400);
    }

    $db = get_db();
    // 2. dishId 유효성 검사 (트랜잭션 시작 전에 수행)
    $stmtDish = $db->prepare("SELECT 1 FROM dish WHERE dish_id = :dishId");
    $stmtDish->bindValue(':dishId', $dishId, PDO::PARAM_INT);
    $stmtDish->execute();

    // Dish가 존재하지 않으면 (false 반환) 404 반환하고 함수 종료
    if (!$stmtDish->fetch()) {
        json_error('Dish Not Found.', 404); // <-- 404가 여기서 즉시 반환되어야 함
    }

    try {
        $db->beginTransaction(); // 이제 $db 객체를 사용할 수 있음

        // 3. 삽입 또는 업데이트 (UPSERT)
        // 3-A. 새로운 cart_item_id 결정 (PK 수동 할당)
        $next_id = null;
        // UPDATE 전에 새로운 ID를 준비할 필요는 없지만, INSERT를 위해 ID가 필요합니다.
        // 현재는 ON DUPLICATE KEY UPDATE 문을 사용하므로,
        // 기존 행이 있다면 삽입을 시도하지 않고 UPDATE만 합니다.
        // 하지만 새로운 행인 경우를 위해 next_id를 준비해야 합니다.

        // 현재 user_id와 dish_id 조합이 존재하는지 먼저 확인합니다.
        $stmt_check = $db->prepare("SELECT cart_item_id FROM cart_item WHERE user_id = :userId AND dish_id = :dishId");
        $stmt_check->bindValue(':userId', $userId, PDO::PARAM_INT); // 테스트 코드에 맞춰 INT로 바인딩
        $stmt_check->bindValue(':dishId', $dishId, PDO::PARAM_INT);
        $stmt_check->execute();
        $existing_cart_item_id = $stmt_check->fetchColumn();

        // 3-B. 새로운 ID가 필요하면 생성
        if (!$existing_cart_item_id) {
            $stmt_max_id = $db->query("SELECT MAX(cart_item_id) FROM cart_item");
            $max_id = $stmt_max_id->fetchColumn();
            $next_id = $max_id === false ? 1 : (int)$max_id + 1; // 테이블이 비었으면 1, 아니면 max+1
        }

        // 3-C. 쿼리 실행
        // 새로운 아이템인 경우: cart_item_id를 포함하여 삽입
        // 기존 아이템인 경우: cart_item_id를 사용하지 않고 UPDATE

        if ($existing_cart_item_id) {
            // UPDATE: 이미 존재하는 경우 (ON DUPLICATE KEY UPDATE와 동일한 효과를 냅니다)
            $sql = "UPDATE cart_item SET quantity = quantity + :quantity WHERE user_id = :userId AND dish_id = :dishId";
            $stmt = $db->prepare($sql);
            $stmt->bindValue(':userId', $userId, PDO::PARAM_INT);
            $stmt->bindValue(':dishId', $dishId, PDO::PARAM_INT);
            $stmt->bindValue(':quantity', $quantity, PDO::PARAM_INT);
        } else {
            // INSERT: 새로운 경우 (cart_item_id를 수동으로 지정)
            $sql = "INSERT INTO cart_item (cart_item_id, user_id, dish_id, quantity) VALUES (:cartItemId, :userId, :dishId, :quantity)";
            $stmt = $db->prepare($sql);
            $stmt->bindValue(':cartItemId', $next_id, PDO::PARAM_INT);
            $stmt->bindValue(':userId', $userId, PDO::PARAM_INT);
            $stmt->bindValue(':dishId', $dishId, PDO::PARAM_INT);
            $stmt->bindValue(':quantity', $quantity, PDO::PARAM_INT);
        }

        $stmt->execute();

        $db->commit();

        // ... (4. 응답을 위한 상세 정보 조회 로직은 그대로 유지)

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
    $userId = isset($_GET['userId']) ? (int)$_GET['userId'] : null;

    if ($userId <= 0) { // 0이나 null/빈 문자열을 모두 처리
        json_error('Invalid userId.', 400);
    }

    // 2. 장바구니 상세 정보 조회 (공통 함수 사용)
    $rows = get_cart_details($userId);

    if (empty($rows)) {
        json_error('Cart is empty.', 404); // 404 장바구니 비어 있음
    }

    json_ok($rows);
}