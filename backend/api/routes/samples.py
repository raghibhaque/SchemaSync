"""Sample schema endpoint — pre-built schemas by domain."""

from fastapi import APIRouter
from pydantic import BaseModel

from backend.api.errors import ErrorCode, ErrorResponse, api_error

router = APIRouter(prefix="/samples", tags=["samples"])

_ERR = {
    404: {"model": ErrorResponse, "description": "Domain not found"},
    422: {"model": ErrorResponse, "description": "Request validation failed"},
}

# ── Sample schemas ────────────────────────────────────────────────────────────

_SAMPLES: dict[str, dict] = {
    "ecommerce": {
        "description": "E-commerce platform: users, products, orders, payments",
        "schemas": {
            "v1_legacy": """
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock_qty INT DEFAULT 0,
    category_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
""",
            "v2_modern": """
CREATE TABLE accounts (
    account_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    display_name VARCHAR(100) NOT NULL,
    email_address VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);
CREATE TABLE product_catalog (
    product_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_name VARCHAR(255) NOT NULL,
    list_price DECIMAL(12,2) NOT NULL,
    sale_price DECIMAL(12,2),
    inventory_count INT DEFAULT 0,
    category_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
CREATE TABLE purchase_orders (
    order_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    account_id BIGINT NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    order_status VARCHAR(30) DEFAULT 'pending',
    placed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(account_id)
);
CREATE TABLE order_line_items (
    line_item_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    qty INT NOT NULL,
    price_at_purchase DECIMAL(12,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES purchase_orders(order_id),
    FOREIGN KEY (product_id) REFERENCES product_catalog(product_id)
);
""",
        },
    },

    "blog": {
        "description": "Blog platform: posts, authors, comments, tags",
        "schemas": {
            "simple": """
CREATE TABLE authors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    body TEXT NOT NULL,
    author_id INT NOT NULL,
    published_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'draft',
    FOREIGN KEY (author_id) REFERENCES authors(id)
);
CREATE TABLE comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    author_name VARCHAR(100),
    body TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id)
);
CREATE TABLE tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE
);
CREATE TABLE post_tags (
    post_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (post_id, tag_id),
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (tag_id) REFERENCES tags(id)
);
""",
            "headless_cms": """
CREATE TABLE content_creators (
    creator_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(200) NOT NULL,
    email_address VARCHAR(255) NOT NULL UNIQUE,
    biography TEXT,
    avatar_url VARCHAR(500),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE articles (
    article_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    headline VARCHAR(500) NOT NULL,
    url_slug VARCHAR(500) NOT NULL UNIQUE,
    content_body TEXT NOT NULL,
    creator_id BIGINT NOT NULL,
    published_timestamp TIMESTAMP,
    publication_status VARCHAR(30) DEFAULT 'draft',
    view_count INT DEFAULT 0,
    FOREIGN KEY (creator_id) REFERENCES content_creators(creator_id)
);
CREATE TABLE article_comments (
    comment_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    article_id BIGINT NOT NULL,
    commenter_name VARCHAR(200),
    comment_text TEXT NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_approved BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (article_id) REFERENCES articles(article_id)
);
CREATE TABLE taxonomies (
    taxonomy_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tag_label VARCHAR(100) NOT NULL UNIQUE,
    tag_slug VARCHAR(100) NOT NULL UNIQUE
);
CREATE TABLE article_taxonomies (
    article_id BIGINT NOT NULL,
    taxonomy_id BIGINT NOT NULL,
    PRIMARY KEY (article_id, taxonomy_id),
    FOREIGN KEY (article_id) REFERENCES articles(article_id),
    FOREIGN KEY (taxonomy_id) REFERENCES taxonomies(taxonomy_id)
);
""",
        },
    },

    "crm": {
        "description": "CRM: contacts, companies, deals, activities",
        "schemas": {
            "basic": """
CREATE TABLE companies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255),
    industry VARCHAR(100),
    employee_count INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE contacts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    company_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);
CREATE TABLE deals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    value DECIMAL(15,2),
    stage VARCHAR(50) DEFAULT 'prospecting',
    contact_id INT,
    closed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contact_id) REFERENCES contacts(id)
);
CREATE TABLE activities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    deal_id INT,
    contact_id INT,
    activity_type VARCHAR(50),
    notes TEXT,
    occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (deal_id) REFERENCES deals(id),
    FOREIGN KEY (contact_id) REFERENCES contacts(id)
);
""",
            "enterprise": """
CREATE TABLE organizations (
    org_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    organization_name VARCHAR(500) NOT NULL,
    website_domain VARCHAR(255),
    industry_sector VARCHAR(200),
    headcount INT,
    annual_revenue DECIMAL(20,2),
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE people (
    person_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    given_name VARCHAR(200),
    family_name VARCHAR(200),
    email_address VARCHAR(255) UNIQUE,
    phone_number VARCHAR(100),
    org_id BIGINT,
    job_title VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES organizations(org_id)
);
CREATE TABLE opportunities (
    opportunity_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    opportunity_name VARCHAR(500) NOT NULL,
    deal_amount DECIMAL(20,2),
    pipeline_stage VARCHAR(100) DEFAULT 'prospecting',
    person_id BIGINT,
    expected_close_date DATE,
    closed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (person_id) REFERENCES people(person_id)
);
CREATE TABLE engagement_log (
    log_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    opportunity_id BIGINT,
    person_id BIGINT,
    engagement_type VARCHAR(100),
    engagement_notes TEXT,
    engaged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (opportunity_id) REFERENCES opportunities(opportunity_id),
    FOREIGN KEY (person_id) REFERENCES people(person_id)
);
""",
        },
    },

    "saas": {
        "description": "SaaS platform: tenants, users, subscriptions, usage",
        "schemas": {
            "multi_tenant": """
CREATE TABLE tenants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    plan VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tenant_id INT NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'member',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);
CREATE TABLE subscriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tenant_id INT NOT NULL,
    plan VARCHAR(50) NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);
CREATE TABLE usage_events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tenant_id INT NOT NULL,
    user_id INT,
    event_type VARCHAR(100) NOT NULL,
    event_data JSON,
    occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
""",
        },
    },
}


class SchemaVariant(BaseModel):
    variant_name: str
    sql: str


class SampleDomain(BaseModel):
    domain: str
    description: str
    variants: list[SchemaVariant]


class SampleListResponse(BaseModel):
    domains: list[str]
    total: int


@router.get("/", response_model=SampleListResponse)
async def list_domains():
    return SampleListResponse(
        domains=sorted(_SAMPLES.keys()),
        total=len(_SAMPLES),
    )


@router.get("/{domain}", response_model=SampleDomain, responses=_ERR)
async def get_domain_schemas(domain: str):
    entry = _SAMPLES.get(domain)
    if not entry:
        api_error(
            404, ErrorCode.NOT_FOUND,
            f"Domain '{domain}' not found",
        )
    return SampleDomain(
        domain=domain,
        description=entry["description"],
        variants=[
            SchemaVariant(variant_name=k, sql=v.strip())
            for k, v in entry["schemas"].items()
        ],
    )
