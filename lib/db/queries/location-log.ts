import { and, eq } from "drizzle-orm";

import type { InsertLocationLog } from "../schema";

import db from "..";
import { locationLog } from "../schema";

export async function findLocationLog(
  id: number,
  userId: number,
) {
  const foundLog = await db.query.locationLog.findFirst({
    where: and(
      eq(locationLog.id, id),
      eq(locationLog.userId, userId),
    ),
  });

  return foundLog;
}

export async function updateLocationLog(id: number, updatable: InsertLocationLog, userId: number) {
  const [updated] = await db.update(locationLog).set({
    ...updatable,
  }).where(
    and(
      eq(locationLog.id, id),
      eq(locationLog.userId, userId),
    ),
  ).returning();

  return updated;
}

export async function deleteLocationLog(
  id: number,
  userId: number,
) {
  const [deleted] = await db.delete(locationLog).where(
    and(
      eq(locationLog.id, id),
      eq(locationLog.userId, userId),
    ),
  ).returning();

  return deleted;
}

export async function insertLocationLog(
  locationId: number,
  insertable: InsertLocationLog,
  userId: number,
) {
  const [inserted] = await db.insert(locationLog).values({
    ...insertable,
    locationId,
    userId,
  }).returning();

  return inserted;
}
