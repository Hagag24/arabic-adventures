import { cookies } from "next/headers";
import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";

const COOKIE_NAME = "player_session_token";
const SESSION_MAX_AGE = 60 * 60 * 24 * 365; // 1 year in seconds

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

export async function ensurePlayerSession(): Promise<{ sessionId: string }> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (token) {
    const hashed = hashToken(token);
    const session = await prisma.playerSession.findUnique({
      where: { publicTokenHash: hashed },
    });

    if (session) {
      // Safely update lastSeenAt
      await prisma.playerSession.update({
        where: { id: session.id },
        data: { lastSeenAt: new Date() },
      });
      return { sessionId: session.id };
    }
  }

  // Generate new token (32 bytes)
  const newToken = crypto.randomBytes(32).toString("hex");
  const newHash = hashToken(newToken);

  const newSession = await prisma.playerSession.create({
    data: {
      publicTokenHash: newHash,
    },
  });

  const isProduction = process.env.NODE_ENV === "production";

  cookieStore.set(COOKIE_NAME, newToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: isProduction,
    maxAge: SESSION_MAX_AGE,
  });

  return { sessionId: newSession.id };
}

export async function getPlayerSessionId(): Promise<string | null> {
  const token = await getSessionToken();
  if (!token) return null;
  const hashed = hashToken(token);
  const session = await prisma.playerSession.findUnique({
    where: { publicTokenHash: hashed },
  });
  return session ? session.id : null;
}
