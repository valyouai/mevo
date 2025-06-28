# Security Implementation Guide

## Row-Level Security (RLS) with Application-Level Protection

This project uses a **dual-layer security approach**:

---

### 1. Database-Level Security

* **RLS Policies**: enforced with PostgreSQL Row-Level Security (`PERMISSIVE` by default)
* **Behavior**:
  * Requires `app.current_user_id` session variable
  * Denies access if the variable is missing or does not match
  * Defaults to deny on missing `app.current_user_id`
* **Implementation**:
  ```sql
  CREATE POLICY transcripts_user_access ON transcripts
    FOR SELECT
    USING (user_id = current_setting('app.current_user_id', true)::uuid);
  ```
* **Session Variable**: set using the `withTransaction` wrapper
  ```ts
  await client.query(
    `SELECT set_config('app.current_user_id', $1, true)`,
    [userIdToSet]
  );
  ```

---

### 2. Application-Level Security

* **Explicit Filtering**: all queries must explicitly filter on `user_id`
  ```ts
  const { rows } = await client.query({
    text: `SELECT * FROM transcripts WHERE id = $1 AND user_id = $2`,
    values: [id, userId]
  });
  ```
* **Middleware**: user ID must be injected on every authenticated request (`x-test-user-id` header in tests)

---

## 2025-06-28 Security Hardening

* Enforced `withTransaction` on all routes
* Standardized API error responses
* Closed direct `pool.query` bypass
* Added consistent RLS error handling
* Passed full RLS test coverage

---

## Development Guidelines

**For All Data Access**
✅ Always use `withTransaction`
✅ Always include `user_id` filters
✅ Never use raw `pool.query` for sensitive data
✅ Add RLS policies for all new tables

**Testing Requirements**
✅ Unauthorized user → expect 404
✅ Missing/invalid user → expect 401
✅ Test user isolation with multiple user IDs
✅ Validate RLS failures
✅ Reference: [Postgres RLS Docs](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

**Best Practices**
✅ Treat RLS as a **safety net**, not the primary guard
✅ Keep security consistent across all routes
✅ Document exceptions
✅ Perform security code reviews
✅ Walk new developers through this guide

**New Table Checklist**

* [ ] `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
* [ ] Define SELECT / INSERT / UPDATE / DELETE policies
* [ ] Seed test user data
* [ ] Test user separation
* [ ] Add RLS enforcement tests
