-- 1. 테이블의 모든 데이터를 삭제합니다.
-- TRUNCATE TABLE이 DELETE FROM 보다 빠르지만, FK(외래 키) 제약 조건 때문에
-- DELETE FROM을 사용하거나, TRUNCATE TABLE을 사용하기 전에 FK 체크를 해제해야 할 수 있습니다.
-- 여기서는 안전하게 DELETE FROM을 사용합니다.
DELETE FROM cart_item;


-- 2. 초기 dummy.sql과 동일한 북마크(장바구니) 데이터를 삽입합니다.
INSERT INTO cart_item (cart_item_id, user_id, dish_id, quantity) VALUES
                                                                     (1, 1, 1, 2),
                                                                     (2, 1, 3, 1),
                                                                     (3, 1, 5, 1);