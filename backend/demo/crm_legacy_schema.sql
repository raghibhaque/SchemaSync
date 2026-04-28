-- Legacy CRM schema — Salesforce-style export with abbreviated names, mixed conventions.
-- Represents a real-world inherited CRM database before any naming standards existed.

CREATE TABLE SF_CNTCT (
    cntct_id    INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    fnm         VARCHAR(80)  NOT NULL,
    lnm         VARCHAR(80)  NOT NULL,
    eml         VARCHAR(150) NOT NULL UNIQUE,
    ph          VARCHAR(40)  DEFAULT NULL,
    mbl         VARCHAR(40)  DEFAULT NULL,
    ttl         VARCHAR(100) DEFAULT NULL,
    dpt         VARCHAR(100) DEFAULT NULL,
    acct_id     INT          DEFAULT NULL,
    ownr_id     INT          DEFAULT NULL,
    is_del      TINYINT(1)   NOT NULL DEFAULT 0,
    cre_dt      DATETIME     NOT NULL,
    mod_dt      DATETIME     DEFAULT NULL,
    lst_act_dt  DATETIME     DEFAULT NULL,
    src         VARCHAR(50)  DEFAULT NULL,
    KEY idx_eml    (eml),
    KEY idx_acct   (acct_id),
    KEY idx_ownr   (ownr_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
