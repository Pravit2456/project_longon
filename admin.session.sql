CREATE TABLE admin_session (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL,
    session_token TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);
