<?php
// tests/marketsTest.php
// 파일: api/markets.php 기능 검증

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
function run_market_test_case($url, $description, $expected_status = 200) {
    echo "Testing: $url ($description)\n";

    $result = test_api_endpoint($url);
    $httpCode = $result['code'];
    $response = $result['response'];

    $passed = $httpCode === $expected_status;
    $status_msg = $passed ? "PASS" : "FAIL (Expected $expected_status, Got $httpCode)";

    echo "HTTP Status: $httpCode [$status_msg]\n";

    if ($passed && $expected_status === 200) {
        $data = json_decode($response, true);
        $resultData = isset($data['data']) ? $data['data'] : null;

        if (isset($resultData['dishes'])) {
            // 4. 가게별 반찬 조회 결과
            echo "Result: Dishes Found (Store: " . $resultData['storeName'] . ", Count: " . count($resultData['dishes']) . ")\n";
        } elseif (is_array($resultData) && isset($resultData[0]['storeName'])) {
            // 3. 가게 리스트 조회 결과
            echo "Result: Store List Found (Count: " . count($resultData) . ")\n";
        } elseif (isset($resultData['marketName']) && !is_array($resultData['marketName'])) {
            // 2. 시장 상세 조회 결과
            echo "Result: Market Detail Found (Market ID: " . $resultData['marketId'] . ")\n";
        } elseif (is_array($resultData) && isset($resultData[0]['marketName'])) {
            // 1. 시장 목록 조회 결과
            echo "Result: Market List Found (Count: " . count($resultData) . ")\n";
        } else {
            echo "Result: Data structure uncertain or empty.\n";
        }
    } elseif (!$passed) {
        // 오류 응답 출력 (디버깅 용도)
        echo "Raw Response: " . substr($response, 0, 80) . "...\n";
    }

    echo str_repeat("-", 50) . "\n\n";
    return $passed;
}


// ----------------- 테스트 실행 -----------------

// 1. 시장 목록 조회 (GET /api/markets)
run_market_test_case(
    "http://localhost:8000/api/markets",
    "Market List (handle_markets)"
);

// 2. 특정 시장 상세 조회 (GET /api/markets/{marketId})
run_market_test_case(
    "http://localhost:8000/api/markets/1",
    "Market Detail (handle_market_detail)"
);

// 3. 특정 시장 가게 리스트 조회 (GET /api/markets/{marketId}/stores)
run_market_test_case(
    "http://localhost:8000/api/markets/1/stores",
    "Store List (handle_market_stores)"
);

// 4. 가게별 반찬 조회 (GET /api/markets/{marketId}/stores/{storeId}/dishes) - 이전 오류 경로
run_market_test_case(
    "http://localhost:8000/api/markets/1/stores/1/dishes",
    "Store Dishes (handle_store_dishes)"
);

// 5. 유효하지 않은 ID 테스트 (400 기대)
run_market_test_case(
    "http://localhost:8000/api/markets/0",
    "Invalid Market ID",
    400
);

// 6. 존재하지 않는 경로 테스트 (404 기대)
run_market_test_case(
    "http://localhost:8000/api/markets/1/products",
    "Non-existent path",
    404
);

echo "Markets Tests finished.\n";