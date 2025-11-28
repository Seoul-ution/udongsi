<?php
// tests/test_markets_api.php
// Usage: php tests/test_markets_api.php [base_url]

$BASE = isset($argv[1]) ? $argv[1] : 'http://localhost:8000';

// 간단한 HTTP GET (cURL)
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
    array('desc' => 'GET /api/markets', 'url' => $BASE . '/api/markets'),
    array('desc' => 'GET /api/markets?address=서울시중구', 'url' => $BASE . '/api/markets?address=%EC%84%9C%EC%9A%B8%EC%8B%9C%EC%A4%91%EA%B5%AC'),
    array('desc' => 'GET /api/markets/1', 'url' => $BASE . '/api/markets/1'),
    array('desc' => 'GET /api/markets/1/stores', 'url' => $BASE . '/api/markets/1/stores'),
    array('desc' => 'GET /api/markets/1/stores?isSpecial=1', 'url' => $BASE . '/api/markets/1/stores?isSpecial=1'),
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
    $body = $res['body'];
    $json = json_decode($body, true);
    if ($json === null) {
        echo "WARNING: response is not valid JSON. Body:\n";
        echo $body . "\n\n";
        continue;
    }
    if (isset($json['message'])) {
        echo "message: " . $json['message'] . "\n";
    }
    if (isset($json['data'])) {
        if (is_array($json['data'])) {

            // 리스트(array of arrays) 인지, 단일 객체인지 판별
            $isList = array_keys($json['data']) === range(0, count($json['data']) - 1);

            if ($isList) {
                echo "data: type=list, count=" . count($json['data']) . "\n";
                if (count($json['data']) > 0 && is_array($json['data'][0])) {
                    echo " first item keys: " . implode(',', array_keys($json['data'][0])) . "\n";
                }
            } else {
                echo "data: type=object\n";
                echo " keys: " . implode(',', array_keys($json['data'])) . "\n";
            }
        }

    } else {
        echo "note: 'data' 필드 없음\n";
    }
    if (isset($json['note'])) {
        echo "note: " . $json['note'] . "\n";
    }
    echo "\n";
}

echo "Tests finished.\n";
