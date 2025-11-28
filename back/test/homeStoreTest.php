<?php
// tests/homeStoreTest.php
// 특정 가게 반찬 조회 테스트 (PHP 5.x 호환)

function test_store_dishes($marketId, $storeId) {
    $url = "http://localhost:8000/api/markets/{$marketId}/stores/{$storeId}/dishes";
    echo "Testing: $url\n";

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    echo "HTTP Status: $httpCode\n";

    $data = json_decode($response, true);
    if ($data === null) {
        echo "JSON Decode Error\n";
        echo "Raw Response: $response\n";
        return;
    }

    echo "Raw Response:\n$response\n\n";

    $storeData = isset($data['data']) ? $data['data'] : null;
    if (!$storeData || !is_array($storeData)) {
        echo "No data found.\n";
        return;
    }

    $storeName = isset($storeData['storeName']) ? $storeData['storeName'] : 'N/A';
    echo "Store Name: $storeName\n";

    $dishes = isset($storeData['dishes']) ? $storeData['dishes'] : array();
    if (empty($dishes)) {
        echo "No dishes found.\n";
    } else {
        echo "Dishes:\n";
        foreach ($dishes as $dish) {
            $dishName = isset($dish['dishName']) ? $dish['dishName'] : 'N/A';
            $price = isset($dish['price']) ? $dish['price'] : 0;
            $currentCount = isset($dish['currentCount']) ? $dish['currentCount'] : 0;
            $threshold = isset($dish['threshold']) ? $dish['threshold'] : 0;
            echo "- {$dishName} ({$price}원, count: {$currentCount}, threshold: {$threshold})\n";
        }
    }

    echo str_repeat("-", 50) . "\n\n";
}

// 테스트 실행
test_store_dishes(1, 1);

echo "Tests finished.\n";
