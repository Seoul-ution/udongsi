<?php
// api/common.php
// - GET /api/common/search
// - GET /api/common/dish/{id}
// - GET /api/common/stores
// - GET /api/common/markets

require_once __DIR__ . '/../db/db.php';

function json_ok($data, $extra = null)
{
    http_response_code(200);
    $out = array('message' => 'OK', 'data' => $data);
    if ($extra !== null) {
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

// 요청 처리 (api.php에서 라우팅이 안됐을 경우를 대비해 안전하게 파싱)
$method = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'GET';
$reqUri = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '/';
$parsedPath = parse_url($reqUri, PHP_URL_PATH);
$path = ($parsedPath !== null) ? $parsedPath : '/';
$pathWithoutApi = preg_replace('#^/api/?#', '', $path);
$pathWithoutApi = trim($pathWithoutApi, '/');
$segments = ($pathWithoutApi === '') ? array() : explode('/', $pathWithoutApi);

// 기대: first segment 'common'
if (isset($segments[0]) && $segments[0] === 'common') {
    array_shift($segments); // remove 'common'
} else {
    json_error('API Not Found', 404);
}

// 라우팅 분기 (GET만 지원)
if ($method !== 'GET') {
    json_error('Method Not Allowed', 405);
}

// 1) GET /api/common/search
if (isset($segments[0]) && $segments[0] === 'search') {
    handle_search();
}

// 2) GET /api/common/dish/{id}
if (isset($segments[0]) && $segments[0] === 'dish' && isset($segments[1]) && is_numeric($segments[1])) {
    handle_dish_detail((int)$segments[1]);
}

// 3) GET /api/common/stores
if (isset($segments[0]) && $segments[0] === 'stores') {
    handle_stores();
}

// 4) GET /api/common/markets
if (isset($segments[0]) && $segments[0] === 'markets') {
    handle_markets();
}

// Not found
json_error('API Not Found', 404);


/** ---------- Handlers ---------- **/

/**
 * handle_search
 * GET /api/common/search?keyword=&marketId=&category=&page=&size=&sort=
 */
function handle_search()
{
    $keyword = isset($_GET['keyword']) ? trim($_GET['keyword']) : '';
    $marketId = isset($_GET['marketId']) && $_GET['marketId'] !== '' ? (int)$_GET['marketId'] : null;
    $category = isset($_GET['category']) ? trim($_GET['category']) : '';
    $page = isset($_GET['page']) && (int)$_GET['page'] > 0 ? (int)$_GET['page'] : 1;
    $size = isset($_GET['size']) && (int)$_GET['size'] > 0 ? (int)$_GET['size'] : 10;
    $sort = isset($_GET['sort']) ? trim($_GET['sort']) : '';

    // 정렬 허용 매핑 (클라이언트 키 -> DB 컬럼)
    $map = array(
        'price' => 'd.price',
        'date' => 'd.date',
        'dishName' => 'd.dish_name',
        'currentCount' => 'ci.currentCount'
    );
    $orderBy = 'd.dish_id DESC';
    if ($sort !== '') {
        $parts = explode(',', $sort);
        $col = isset($parts[0]) ? trim($parts[0]) : '';
        $dir = (isset($parts[1]) && strtolower($parts[1]) === 'desc') ? 'DESC' : 'ASC';
        if (isset($map[$col])) {
            $orderBy = $map[$col] . ' ' . $dir;
        }
    }

    $offset = ($page - 1) * $size;

    $sql = "
        SELECT
            d.dish_id AS dishId,
            DATE_FORMAT(d.date, '%Y-%m-%d') AS date,
            d.period AS period,
            s.store_name AS storeName,
            d.dish_name AS dishName,
            d.price AS price,
            IFNULL(ci.currentCount, 0) AS currentCount,
            d.threshold AS threshold
        FROM dish d
        INNER JOIN store s ON d.store_id = s.store_id
        LEFT JOIN (
            SELECT dish_id, SUM(quantity) AS currentCount
            FROM cart_item
            GROUP BY dish_id
        ) ci ON d.dish_id = ci.dish_id
    ";

    $where = array();
    $params = array();

    if ($keyword !== '') {
        $where[] = "(d.dish_name LIKE :kw OR s.store_name LIKE :kw)";
        $params[':kw'] = '%' . $keyword . '%';
    }
    if ($marketId !== null) {
        $where[] = "s.market_id = :marketId";
        $params[':marketId'] = $marketId;
    }
    if ($category !== '') {
        $where[] = "d.category = :category";
        $params[':category'] = $category;
    }

    if (count($where) > 0) {
        $sql .= " WHERE " . implode(" AND ", $where);
    }

    // 총합 카운트
    $countSql = "SELECT COUNT(*) AS cnt FROM (" . $sql . ") t";

    // 정렬 + 페이징
    $sql .= " ORDER BY " . $orderBy . " LIMIT :limit OFFSET :offset";

    try {
        $db = get_db();

        // count
        $stmtCnt = $db->prepare($countSql);
        foreach ($params as $k => $v) {
            $stmtCnt->bindValue($k, $v);
        }
        $stmtCnt->execute();
        $rowCnt = $stmtCnt->fetch();
        $total = isset($rowCnt['cnt']) ? (int)$rowCnt['cnt'] : 0;

        // main
        $stmt = $db->prepare($sql);
        foreach ($params as $k => $v) {
            $stmt->bindValue($k, $v);
        }
        $stmt->bindValue(':limit', (int)$size, PDO::PARAM_INT);
        $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
        $stmt->execute();
        $items = $stmt->fetchAll();

        $meta = array(
            'page' => $page,
            'size' => $size,
            'total' => $total,
            'pages' => ($size > 0) ? ceil($total / $size) : 0
        );

        // 응답
        http_response_code(200);
        echo json_encode(array('message' => 'OK', 'data' => $items, 'meta' => $meta));
        exit;
    } catch (Exception $e) {
        json_error('Server Error', 500);
    }
}

/**
 * handle_dish_detail
 * GET /api/common/dish/{id}
 */
function handle_dish_detail($dishId)
{
    if (!is_numeric($dishId) || $dishId <= 0) {
        json_error('Invalid dishId', 400);
    }

    $sql = "
        SELECT
            d.dish_id AS dishId,
            DATE_FORMAT(d.date, '%Y-%m-%d') AS date,
            d.period AS period,
            s.store_name AS storeName,
            d.dish_name AS dishName,
            d.category AS category,
            d.price AS price,
            IFNULL(ci.currentCount, 0) AS currentCount,
            d.threshold AS threshold
        FROM dish d
        INNER JOIN store s ON d.store_id = s.store_id
        LEFT JOIN (
            SELECT dish_id, SUM(quantity) AS currentCount
            FROM cart_item
            GROUP BY dish_id
        ) ci ON d.dish_id = ci.dish_id
        WHERE d.dish_id = :dishId
        LIMIT 1
    ";

    try {
        $db = get_db();
        $stmt = $db->prepare($sql);
        $stmt->bindValue(':dishId', (int)$dishId, PDO::PARAM_INT);
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
 * handle_stores
 * GET /api/common/stores
 * optional query: ?marketId=1
 */
function handle_stores()
{
    $marketId = isset($_GET['marketId']) && $_GET['marketId'] !== '' ? (int)$_GET['marketId'] : null;

    $sql = "SELECT store_id AS storeId, store_name AS storeName, market_id AS marketId, is_special AS isSpecial FROM store";
    $params = array();
    if ($marketId !== null) {
        $sql .= " WHERE market_id = :marketId";
        $params[':marketId'] = $marketId;
    }
    $sql .= " ORDER BY store_name ASC";

    try {
        $db = get_db();
        $stmt = $db->prepare($sql);
        if (isset($params[':marketId'])) {
            $stmt->bindValue(':marketId', $params[':marketId'], PDO::PARAM_INT);
        }
        $stmt->execute();
        $rows = $stmt->fetchAll();
        json_ok($rows);
    } catch (Exception $e) {
        json_error('Server Error', 500);
    }
}

/**
 * handle_markets
 * GET /api/common/markets
 */
function handle_markets()
{
    $sql = "SELECT market_id AS marketId, market_name AS marketName FROM market ORDER BY market_id ASC";
    try {
        $db = get_db();
        $stmt = $db->query($sql);
        $rows = $stmt->fetchAll();
        json_ok($rows);
    } catch (Exception $e) {
        json_error('Server Error', 500);
    }
}
