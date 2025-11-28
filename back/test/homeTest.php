<?php
// tests/home_test.php
// home.php 테스트 스크립트 (PHP 5.x 호환)

function test_api($url)
{
    echo "Testing: $url\n";

    // cURL 초기화
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);           // 10초 타임아웃
    curl_setopt($ch, CURLOPT_FAILONERROR, false);    // HTTP 오류도 응답 받기

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    if ($response === false) {
        echo "cURL Error: " . curl_error($ch) . "\n";
    } else {
        $data = json_decode($response, true);
        echo "HTTP Status: $httpCode\n";
        if ($data === null) {
            echo "JSON Decode Error\n";
            echo "Raw response: $response\n";
        } else {
            echo "Response:\n";
            echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
        }
    }

    curl_close($ch);
    echo str_repeat("-", 50) . "\n\n";
}

// ---------------- API 테스트 ----------------

// 1️⃣ 특가 상품 조회 (marketId 지정)
test_api("http://localhost:8000/api/home/special?marketId=1");

// 1️⃣ 특가 상품 조회 (marketId 미지정)
test_api("http://localhost:8000/api/home/special");

// 2️⃣ 특정 시장 가게 리스트 조회
test_api("http://localhost:8000/api/markets/1/stores");

// 3️⃣ 가게별 반찬 조회
test_api("http://localhost:8000/api/markets/1/stores/1/dishes");

echo "Tests finished.\n";
