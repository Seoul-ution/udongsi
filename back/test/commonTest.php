<?php
// tests/test_common_api.php
// Usage: php tests/test_common_api.php

$BASE = isset($argv[1]) ? $argv[1] : 'http://localhost:8000'; // 또는 'http://localhost'

// 간단한 HTTP GET (cURL) 함수
function http_get($url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_HEADER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    $resp = curl_exec($ch);
    if ($resp === false) {
        $err = curl_error($ch);
        curl_close($ch);
        return array('ok' => false, 'error' => $err);
    }
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    $header = substr($resp, 0, $headerSize);
    $body = substr($resp, $headerSize);
    curl_close($ch);
    return array('ok' => true, 'status' => $status, 'header' => $header, 'body' => $body);
}

$tests = array(
    array('desc' => 'GET /api/common/markets', 'url' => $BASE . '/api/common/markets'),
    array('desc' => 'GET /api/common/stores', 'url' => $BASE . '/api/common/stores'),
    array('desc' => 'GET /api/common/stores?marketId=1', 'url' => $BASE . '/api/common/stores?marketId=1'),
    array('desc' => 'GET /api/common/search (no params)', 'url' => $BASE . '/api/common/search'),
    array('desc' => 'GET /api/common/search?keyword=고등어&page=1&size=5&sort=price,asc', 'url' => $BASE . '/api/common/search?keyword=%EA%B3%A0%EB%8A%A5%EC%96%B4&page=1&size=5&sort=price,asc'),
    array('desc' => 'GET /api/common/dish/1', 'url' => $BASE . '/api/common/dish/1'),
);

echo "Running " . count($tests) . " tests against base: {$BASE}\n\n";

foreach ($tests as $t) {
    echo "---- " . $t['desc'] . " ----\n";
    $res = http_get($t['url']);
    if (!$res['ok']) {
        echo "ERROR: cURL failed: " . $res['error'] . "\n\n";
        continue;
    }
    echo "HTTP/Status: " . $res['status'] . "\n";
    // try decode JSON body
    $body = $res['body'];
    $json = json_decode($body, true);
    if ($json === null) {
        echo "WARNING: response is not valid JSON. Body:\n";
        echo $body . "\n\n";
        continue;
    }
    // print brief summary
    if (isset($json['message'])) {
        echo "message: " . $json['message'] . "\n";
    }


    if (isset($json['data'])) {
        $data = $json['data'];

        if (is_array($data) && array_keys($data) === range(0, count($data) - 1)) {
            // 1. 데이터가 순차 배열(목록 조회)일 경우 (range 함수로 인덱스 키 확인)
            echo "data: type=array, count=" . count($data) . "\n";
            if (count($data) > 0) {
                // 첫 번째 요소가 배열인지 확인 후 키 출력
                $first = is_array($data[0]) ? $data[0] : null;
                if ($first !== null) {
                    echo " first item keys: " . implode(',', array_keys($first)) . "\n";
                }
            }
        } elseif (is_array($data)) {
            // 2. 데이터가 연관 배열/객체(단일 조회)일 경우
            echo "data: type=object (assoc array), count=" . count($data) . "\n";
            // 단일 객체의 키를 바로 출력
            echo " keys: " . implode(',', array_keys($data)) . "\n";
        } else {
            // 3. 기타 타입 (예: string, int)
            echo "data: type=" . gettype($data) . "\n";
        }
    } else {
        echo "note: 'data' 필드 없음\n";
    }
    // meta 출력(있으면)
    if (isset($json['meta'])) {
        echo "meta: " . json_encode($json['meta']) . "\n";
    }
    echo "\n";
}

echo "Tests finished.\n";
