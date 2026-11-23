import { eq } from 'drizzle-orm';
import { db } from './index.ts';
import { users } from './schema.ts';

const DEFAULT_ADMIN_EMAIL = 'jamshid.mahmudov29091990@gmail.com';

export function isAdminEmail(email: string): boolean {
  const configuredAdmin = (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL)
    .trim()
    .toLowerCase();
  return email.trim().toLowerCase() === configuredAdmin;
}

export async function getOrCreateUser(
  uid: string,
  email: string,
  displayName = ''
) {
  try {
    const role = isAdminEmail(email) ? 'admin' : 'viewer';
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        displayName,
        role,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          displayName,
          role,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database query failed in getOrCreateUser:', error);
    throw new Error('Failed to synchronize user account.', { cause: error });
  }
}

export async function getUserByUid(uid: string) {
  try {
    const rows = await db.select().from(users).where(eq(users.uid, uid));
    return rows[0] ?? null;
  } catch (error) {
    console.error('Database query failed in getUserByUid:', error);
    throw new Error('Failed to fetch user profile.', { cause: error });
  }
}
