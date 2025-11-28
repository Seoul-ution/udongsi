<?php
// db/db.php

$config = require __DIR__ . '/../config/config.php';

/**
 * 해커톤용 초간단 DB 헬퍼 (MySQL)
 * - get_db() 호출 시 PDO 인스턴스 리턴
 * - static으로 한 번만 생성 → 재사용
 */

function get_db()
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $config = require __DIR__ . '/../config/config.php';

    try {
        // MySQL용 DSN
        $dsn = 'mysql:host=' . $config['host'] .
            ';port=' . $config['port'] .
            ';dbname=' . $config['dbname'] .
            ';charset=utf8mb4';

        $pdo = new PDO(
            $dsn,
            $config['user'],
            $config['password'],
            array(
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            )
        );
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(array('error' => 'DB connection failed'));
        exit;
    }

    return $pdo;
}
