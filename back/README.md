
# 백엔드 API 설명 (Back-End)
## 1. 프로젝트 구조
```text
   back/
   │
   ├── api.php            # API 요청 라우팅 엔트리 포인트
   ├── common.php         # 공통 함수 및 핸들러
   ├── home.php           # Home 관련 API
   ├── markets.php        # Markets 관련 API
   ├── categories.php     # Categories 관련 API
   ├── cart.php           # Cart 관련 API
   └── tests/             # 테스트 스크립트
```

- api.php에서 각 리소스(Home, Markets, Categories, Cart) 요청을 위임

- common.php에 공통 API 핸들러와 응답 유틸리티(json_ok, json_error) 포함

## 2. 주요 API 엔드포인트
###   Home

- GET /api/home/special
    홈 특화 데이터를 조회합니다.

**예제**
```bash
curl -X GET http://localhost:8000/back/api.php/home/special
```

### Markets

- GET /api/markets/{marketId}/stores/{storeId}/dishes
    특정 가게의 반찬 목록을 조회합니다.

**예제**
```bash
curl -X GET http://localhost:8000/back/api.php/markets/1/stores/2/dishes
```

### Categories

- GET /api/categories/{category}/dishes
    카테고리별 반찬 목록을 조회합니다.
    슬래시(/) 포함 카테고리명도 정상 처리됩니다.

**예제**
```bash
curl -X GET http://localhost:8000/back/api.php/categories/나물%2F무침/dishes
```

### Cart

- POST /api/cart/items
    장바구니에 아이템을 추가합니다.

**예제**
```bash
curl -X POST http://localhost:8000/back/api.php/cart/items \
-H "Content-Type: application/json" \
-d '{"user_id": 1, "dish_id": 5, "quantity": 2}'
```

- GET /api/cart/items
    특정 사용자의 장바구니 내역을 조회합니다.

**예제**
```bash
curl -X GET http://localhost:8000/back/api.php/cart/items?user_id=1
```

- 존재하지 않는 dishId 요청 시 404 Not Found 반환

## 3. 개발 및 테스트

- **테스트 스크립트**: tests/ 폴더

  - homeTest.php, marketsTest.php, categoriesTest.php, cartTest.php

- 테스트로 UPSERT, 조회, 에러 핸들링 등 핵심 로직 검증 가능
- 테스트 실행 예제:
```bash
php tests/homeTest.php
php tests/marketsTest.php
php tests/categoriesTest.php
php tests/cartTest.php
```

## 4. DB 및 제약 사항

- cart 테이블의 user_id, cart_item_id는 INT 타입, 수동 Primary Key 할당 필요

- API 구현 시 DB 일관성을 고려하여 코드 작성

- 존재하지 않는 dishId 요청 시 서버 오류 대신 404 반환

## 5. 공통 처리

- 공통 응답은 json_ok, json_error 함수를 사용하여 통일

- /api/common/dish/{id} 등 공통 API 핸들러 제공
