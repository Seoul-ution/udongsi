<?php
// tests/homeTest.php
// 파일: api/home.php 기능 검증 (특가 상품 조회)

// ----------------- 테스트 유틸리티 -----------------

/**
 * 특정 URL에 HTTP GET 요청을 보내고 결과를 반환합니다.
 */
function test_api_endpoint($url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return ['code' => $httpCode, 'response' => $response];
}

/**
 * 테스트 케이스 실행 및 결과 출력
 */
function run_home_test_case($url, $expected_status, $description) {
    echo "Testing: $url ($description)\n";

    $result = test_api_endpoint($url);
    $httpCode = $result['code'];
    $response = $result['response'];

    $passed = $httpCode === $expected_status;
    $status_msg = $passed ? "PASS" : "FAIL (Expected $expected_status, Got $httpCode)";

    echo "HTTP Status: $httpCode [$status_msg]\n";

    if ($passed && $expected_status === 200) {
        $data = json_decode($response, true);
        $count = isset($data['data']) && is_array($data['data']) ? count($data['data']) : 0;
        $message = isset($data['message']) ? $data['message'] : 'N/A';
        echo "Details: Message=$message, Total items found=$count\n";
    } elseif (!$passed) {
        // 오류 응답 출력 (디버깅 용도)
        echo "Raw Response: " . substr($response, 0, 80) . "...\n";
    }

    echo str_repeat("-", 50) . "\n\n";
    return $passed;
}


// ----------------- 테스트 실행 -----------------

// 1. **성공 케이스**: 특가 상품 조회 (marketId 포함)
run_home_test_case(
    "http://localhost:8000/api/home/special?marketId=1",
    200,
    "GET /api/home/special (Valid Request)"
);

// 2. **성공 케이스**: 특가 상품 조회 (marketId 미포함)
run_home_test_case(
    "http://localhost:8000/api/home/special",
    200,
    "GET /api/home/special (No marketId)"
);

// 3. **실패 케이스**: markets 경로 (markets.php로 이관됨)
run_home_test_case(
    "http://localhost:8000/api/markets/1/stores",
    404,
    "GET /api/markets/1/stores (Expected 404 from home.php)"
);

// 4. **실패 케이스**: dishes 경로 (markets.php로 이관됨)
run_home_test_case(
    "http://localhost:8000/api/markets/1/stores/1/dishes",
    404,
    "GET /api/markets/1/stores/1/dishes (Expected 404 from home.php)"
);

echo "Home Tests finished.\n";