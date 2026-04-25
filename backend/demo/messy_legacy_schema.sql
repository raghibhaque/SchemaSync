-- Legacy e-commerce schema — abbreviated names, mixed case, inconsistent conventions.
-- Represents a real-world "inherited" database before any naming standards existed.

CREATE TABLE tbl_Usr (
    usr_id    INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    usr_nm    VARCHAR(100) NOT NULL,
    usr_email VARCHAR(150) NOT NULL UNIQUE,
    usr_pwd   VARCHAR(64)  NOT NULL,
    usr_stat  TINYINT(1)   NOT NULL DEFAULT 1,
    cre_dt    DATETIME     NOT NULL,
    upd_dt    DATETIME     DEFAULT NULL,
    lst_login DATETIME     DEFAULT NULL,
    KEY idx_email (usr_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- All-caps table, abbreviated column names
CREATE TABLE ORDERS (
    ord_id      INT           NOT NULL AUTO_INCREMENT PRIMARY KEY,
    cust_id     INT           NOT NULL,
    ord_dt      DATETIME      NOT NULL,
    ship_dt     DATETIME      DEFAULT NULL,
    tot_amt     DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    ord_stat    VARCHAR(30)   NOT NULL DEFAULT 'pending',
    pay_meth    VARCHAR(50)   DEFAULT NULL,
    shp_addr_id INT           DEFAULT NULL,
    KEY idx_cust (cust_id),
    FOREIGN KEY (cust_id) REFERENCES tbl_Usr(usr_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Mixed-case table, product domain with abbreviated names
CREATE TABLE PROD_CATALOG (
    prod_id   INT           NOT NULL AUTO_INCREMENT PRIMARY KEY,
    prod_nm   VARCHAR(200)  NOT NULL,
    prod_desc TEXT          DEFAULT NULL,
    unit_prc  DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    qty_stk   INT           NOT NULL DEFAULT 0,
    cat_id    INT           DEFAULT NULL,
    is_actv   TINYINT(1)    NOT NULL DEFAULT 1,
    cre_dt    DATETIME      NOT NULL,
    KEY idx_cat (cat_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Lowercase snake_case order line items
CREATE TABLE ord_items (
    item_id  INT           NOT NULL AUTO_INCREMENT PRIMARY KEY,
    ord_id   INT           NOT NULL,
    prod_id  INT           NOT NULL,
    qty_ord  INT           NOT NULL DEFAULT 1,
    unit_prc DECIMAL(10,2) NOT NULL,
    disc_pct DECIMAL(5,2)  NOT NULL DEFAULT 0.00,
    KEY idx_ord (ord_id),
    FOREIGN KEY (ord_id)  REFERENCES ORDERS(ord_id),
    FOREIGN KEY (prod_id) REFERENCES PROD_CATALOG(prod_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Single-word table, abbreviated columns
CREATE TABLE CAT (
    cat_id  INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    cat_nm  VARCHAR(100) NOT NULL,
    cat_desc TEXT        DEFAULT NULL,
    prnt_id INT          DEFAULT NULL,
    srt_ord INT          NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- All-caps, single-letter field abbreviations
CREATE TABLE ADDR (
    addr_id  INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    cust_id  INT          NOT NULL,
    addr_ln1 VARCHAR(200) NOT NULL,
    addr_ln2 VARCHAR(200) DEFAULT NULL,
    cty      VARCHAR(100) NOT NULL,
    st       VARCHAR(50)  DEFAULT NULL,
    zip      VARCHAR(20)  DEFAULT NULL,
    ctry     VARCHAR(50)  NOT NULL DEFAULT 'US',
    KEY idx_cust (cust_id),
    FOREIGN KEY (cust_id) REFERENCES tbl_Usr(usr_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Payment transactions — heavy abbreviation
CREATE TABLE PAY_TRANS (
    txn_id  INT           NOT NULL AUTO_INCREMENT PRIMARY KEY,
    ord_id  INT           NOT NULL,
    amt     DECIMAL(10,2) NOT NULL,
    pay_dt  DATETIME      NOT NULL,
    meth    VARCHAR(50)   NOT NULL,
    stat    VARCHAR(30)   NOT NULL DEFAULT 'pending',
    ref_num VARCHAR(100)  DEFAULT NULL,
    KEY idx_ord (ord_id),
    FOREIGN KEY (ord_id) REFERENCES ORDERS(ord_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- PascalCase table prefix, terse column names
CREATE TABLE tbl_Reviews (
    rev_id  INT         NOT NULL AUTO_INCREMENT PRIMARY KEY,
    prod_id INT         NOT NULL,
    usr_id  INT         NOT NULL,
    rtng    TINYINT     NOT NULL DEFAULT 5,
    cmt     TEXT        DEFAULT NULL,
    rev_dt  DATETIME    NOT NULL,
    KEY idx_prod (prod_id),
    KEY idx_usr  (usr_id),
    FOREIGN KEY (prod_id) REFERENCES PROD_CATALOG(prod_id),
    FOREIGN KEY (usr_id)  REFERENCES tbl_Usr(usr_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
