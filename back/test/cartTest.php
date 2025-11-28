<?php
// tests/cartTest.php
// 파일: api/cart.php 기능 검증 (장바구니 담기/조회)

// ----------------- 테스트 유틸리티 -----------------

/**
 * 특정 URL에 HTTP 요청을 보내고 결과를 반환합니다.
 */
function test_api_endpoint($url, $method = 'GET', $data = null) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Content-Length: ' . strlen(json_encode($data))
        ]);
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return ['code' => $httpCode, 'response' => $response];
}

/**
 * 테스트 케이스 실행 및 결과 출력
 */
function run_cart_test_case($url, $method, $description, $expected_status, $data = null) {
    echo "Testing: $method $url ($description)\n";

    $result = test_api_endpoint($url, $method, $data);
    $httpCode = $result['code'];
    $response = $result['response'];

    $passed = $httpCode === $expected_status;
    $status_msg = $passed ? "PASS" : "FAIL (Expected $expected_status, Got $httpCode)";

    echo "HTTP Status: $httpCode [$status_msg]\n";

    if ($passed && $expected_status === 200) {
        $data = json_decode($response, true);
        $resultData = isset($data['data']) ? $data['data'] : null;

        if ($method === 'POST') {
            // POST (4-2) 응답 검증
            $q = isset($resultData['quantity']) ? $resultData['quantity'] : 'N/A';
            $dId = isset($resultData['dishId']) ? $resultData['dishId'] : 'N/A';
            echo "Result: Dish $dId added/updated. New Quantity: $q\n";
            return $resultData; // POST 성공 시 데이터를 반환하여 다음 테스트에 활용
        } else {
            // GET (5-1) 응답 검증
            $count = is_array($resultData) ? count($resultData) : 0;
            $total_q = array_sum(array_column($resultData, 'quantity'));
            echo "Result: Total Items: $count, Total Quantity: $total_q\n";
        }
    } elseif (!$passed) {
        echo "Raw Response: " . substr($response, 0, 100) . "...\n";
    }

    echo str_repeat("-", 50) . "\n\n";
    return null;
}


// ----------------- 테스트 실행 -----------------

// 고정된 테스트 사용자 및 반찬 ID를 사용 (DB에 존재한다고 가정)
$TEST_USER_ID = rand(100000, 999999); // 6자리 임의 정수 ID 사용

$DISH_ID_A = 1; // 반찬 1
$DISH_ID_B = 2; // 반찬 2
$BASE_URL = "http://localhost:8000/api/cart/items";


echo "Starting Cart Tests for User: $TEST_USER_ID\n";
echo str_repeat("=", 50) . "\n";


// 1. (POST) 첫 번째 반찬 담기 (Dish A, Quantity 3)
$data_post_1 = [
    'userId' => $TEST_USER_ID,
    'dishId' => $DISH_ID_A,
    'quantity' => 3
];
$dish_a_details = run_cart_test_case(
    $BASE_URL, 'POST', "POST 1: Add Dish $DISH_ID_A (Q=3)", 200, $data_post_1
);


// 2. (GET) 장바구니 목록 조회 (1개 항목 확인)
run_cart_test_case(
    $BASE_URL . "?userId=$TEST_USER_ID", 'GET', "GET 1: Check 1 item (Q=3)", 200
);


// 3. (POST) 두 번째 반찬 담기 (Dish B, Quantity 5)
$data_post_2 = [
    'userId' => $TEST_USER_ID,
    'dishId' => $DISH_ID_B,
    'quantity' => 5
];
run_cart_test_case(
    $BASE_URL, 'POST', "POST 2: Add Dish $DISH_ID_B (Q=5)", 200, $data_post_2
);


// 4. (POST) 첫 번째 반찬 수량 업데이트 (Dish A, Quantity +2. 총 Q=5가 되어야 함)
$data_post_3 = [
    'userId' => $TEST_USER_ID,
    'dishId' => $DISH_ID_A,
    'quantity' => 2 // quantity는 기존 수량에 더해짐 (UPSERT 로직)
];
run_cart_test_case(
    $BASE_URL, 'POST', "POST 3: Update Dish $DISH_ID_A (Q=3+2)", 200, $data_post_3
);


// 5. (GET) 장바구니 목록 최종 확인 (2개 항목, 총 Q=10 확인)
run_cart_test_case(
    $BASE_URL . "?userId=$TEST_USER_ID", 'GET', "GET 2: Check 2 items (Total Q=10)", 200
);


// 6. (GET) 장바구니 비어있는 유저 조회 (404 기대)
run_cart_test_case(
    $BASE_URL . "?userId=non-existent-user-1234", 'GET', "GET 3: Empty Cart Check", 404
);


// 7. (POST) 유효하지 않은 반찬 ID 담기 (404 기대)
run_cart_test_case(
    $BASE_URL, 'POST', "POST 4: Non-existent Dish", 404, ['userId' => $TEST_USER_ID, 'dishId' => 9999, 'quantity' => 1]
);

echo "Cart Tests finished.\n";