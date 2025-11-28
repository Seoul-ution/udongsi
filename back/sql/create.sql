-- DB 선택
USE udongsi;

-- create.sql
-- 1. market 테이블 (시장)

CREATE TABLE market (
                        market_id   INT PRIMARY KEY,
                        market_name VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 2. store 테이블 (가게)

CREATE TABLE store (
                       store_id    INT PRIMARY KEY,
                       store_name  VARCHAR(100) NOT NULL,
                       market_id   INT NOT NULL,
                       is_special  TINYINT(1) NOT NULL,   -- boolean

                       CONSTRAINT fk_store_market
                           FOREIGN KEY (market_id) REFERENCES market(market_id)
                               ON DELETE CASCADE
                               ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



-- 3. dish 테이블 (반찬)
CREATE TABLE dish (
                      dish_id     INT PRIMARY KEY,
                      dish_name   VARCHAR(100) NOT NULL,
                      store_id    INT NOT NULL,
                      category    VARCHAR(100) NOT NULL,  -- string
                      price       INT NOT NULL,
                      date        DATE NOT NULL,
                      period      VARCHAR(100) NOT NULL,  -- string
                      threshold   INT NOT NULL,

                      CONSTRAINT fk_dish_store
                          FOREIGN KEY (store_id) REFERENCES store(store_id)
                              ON DELETE CASCADE
                              ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



-- 4. cart_item 테이블 (장바구니)

CREATE TABLE cart_item (
                           cart_item_id  INT PRIMARY KEY,
                           user_id       INT NOT NULL,        -- 프론트에서 임의 생성
                           dish_id       INT NOT NULL,
                           quantity      INT NOT NULL,

                           CONSTRAINT fk_cart_item_dish
                               FOREIGN KEY (dish_id) REFERENCES dish(dish_id)
                                   ON DELETE CASCADE
                                   ON UPDATE CASCADE,

                           CONSTRAINT uq_cart_item_user_dish
                               UNIQUE (user_id, dish_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

