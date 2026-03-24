process.env.DB_URL ??= "postgresql://test:test@localhost:5432/testdb";
process.env.PORT ??= "3000";

process.env.SMTP_HOST ??= "localhost";
process.env.SMTP_PORT ??= "1025";
process.env.SMTP_USER ??= "test@example.com";
process.env.SMTP_PASS ??= "testpass";