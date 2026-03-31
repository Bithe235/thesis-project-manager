import { neon } from "@neondatabase/serverless";


const sql = neon(process.env.DATABASE_URL!);

// Auto-creates all tables on first call — idempotent
let initialized = false;
export async function initSchema() {
  if (initialized) return;
  // 1. Profiles table
  await sql`
    CREATE TABLE IF NOT EXISTS profiles (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // Provide initial default profile via seed
  await sql`
    INSERT INTO profiles (id, name, description)
    VALUES ('default', 'Default Workspace', 'The public, globally viewable set of resources.')
    ON CONFLICT (id) DO NOTHING
  `;

  // 2. Links table (Original)
  await sql`
    CREATE TABLE IF NOT EXISTS links (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title       TEXT NOT NULL,
      url         TEXT NOT NULL,
      purpose     TEXT NOT NULL,
      category    TEXT NOT NULL DEFAULT 'Other',
      tags        TEXT[] NOT NULL DEFAULT '{}',
      color       TEXT NOT NULL DEFAULT '#FFE135',
      author      TEXT NOT NULL DEFAULT 'Anonymous',
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  // Inject profile_id seamlessly for legacy links
  await sql`ALTER TABLE links ADD COLUMN IF NOT EXISTS profile_id TEXT NOT NULL DEFAULT 'default'`;

  // 3. Visitors table (Original)
  await sql`
    CREATE TABLE IF NOT EXISTS visitors (
      session_id  TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      last_seen   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      page        TEXT NOT NULL DEFAULT '/'
    )
  `;

  // 4. File metadata table (Original)
  await sql`
    CREATE TABLE IF NOT EXISTS file_metadata (
      key          TEXT PRIMARY KEY,
      type         TEXT NOT NULL DEFAULT 'Other',
      description  TEXT NOT NULL DEFAULT '',
      tags         TEXT[] NOT NULL DEFAULT '{}',
      uploaded_by  TEXT NOT NULL DEFAULT 'Anonymous',
      uploaded_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  // Inject profile_id seamlessly for legacy files
  await sql`ALTER TABLE file_metadata ADD COLUMN IF NOT EXISTS profile_id TEXT NOT NULL DEFAULT 'default'`;

  initialized = true;
}

export { sql };
