<?php
// tests/categoriesTest.php
// 파일: api/categories.php 기능 검증 (카테고리별 반찬 조회)

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
function run_category_test_case($url, $category, $expected_status) {
    echo "Testing: $url (Category: $category)\n";

    $result = test_api_endpoint($url);
    $httpCode = $result['code'];
    $response = $result['response'];

    $passed = $httpCode === $expected_status;
    $status_msg = $passed ? "PASS" : "FAIL (Expected $expected_status, Got $httpCode)";

    echo "HTTP Status: $httpCode [$status_msg]\n";

    if ($passed && $expected_status === 200) {
        $data = json_decode($response, true);
        $rows = isset($data['data']) && is_array($data['data']) ? $data['data'] : [];
        $count = count($rows);
        echo "Result: Total Dishes Found: $count\n";

        if ($count > 0 && isset($rows[0]['dishType'])) {
            $is_category_match = ($rows[0]['dishType'] === $category);
            echo "Category Match Check: " . ($is_category_match ? "PASS" : "FAIL (Expected '{$category}', Got '{$rows[0]['dishType']}')") . "\n";
        }
    } elseif ($passed && $expected_status === 404) {
        echo "Result: Expected 404 (No dishes found or API Not Found).\n";
    } elseif (!$passed) {
        echo "Raw Response: " . substr($response, 0, 80) . "...\n";
    }

    echo str_repeat("-", 50) . "\n\n";
    return $passed;
}


// ----------------- 테스트 실행 -----------------

// 테스트 데이터에 따라 실제 존재하는 카테고리명을 사용해야 합니다.
// 여기서는 명세서에 제시된 예시 카테고리명을 가정합니다.
$existing_category = "나물/무침"; // 200 OK 예상
$non_existent_category = "해산물/구이"; // 404 Not Found 예상 (반찬 없음)
$encoded_category = urlencode("김치/젓갈"); // URL 인코딩 테스트 (200 OK 예상)

// 1. 존재하는 카테고리 조회 (정상 200)
run_category_test_case(
    "http://localhost:8000/api/categories/{$existing_category}/dishes",
    $existing_category,
    200
);

// 2. 존재하지 않는 카테고리 조회 (404 기대)
run_category_test_case(
    "http://localhost:8000/api/categories/{$non_existent_category}/dishes",
    $non_existent_category,
    404
);

// 3. URL 인코딩된 카테고리 조회 (정상 200)
run_category_test_case(
    "http://localhost:8000/api/categories/{$encoded_category}/dishes",
    urldecode($encoded_category),
    200
);

// 4. 잘못된 경로 (404 기대)
run_category_test_case(
    "http://localhost:8000/api/categories/invalid",
    "N/A",
    404
);

echo "Categories Tests finished.\n";