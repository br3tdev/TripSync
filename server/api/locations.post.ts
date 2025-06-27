import { and, eq } from "drizzle-orm";
import { customAlphabet } from "nanoid";
import slugify from "slug";
import { z } from "zod";

import db from "~/lib/db";
import { location } from "~/lib/db/schema";

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxy", 5);

const locationSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional().nullable(),
  lat: z.number().min(-90).max(90),
  long: z.number().min(-180).max(180),
});

export default defineEventHandler(async (event) => {
  if (!event.context.user) {
    return sendError(event, createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    }));
  }

  const result = await readValidatedBody(event, locationSchema.safeParse);

  if (!result.success) {
    const statusMessage = result
      .error
      .issues
      .map(issue => `${issue.path.join("")}: ${issue.message}`)
      .join("; ");

    const data = result
      .error
      .issues
      .reduce((errors, issue) => {
        errors[issue.path.join("")] = issue.message;

        return errors;
      }, {} as Record<string, string>);

    return sendError(event, createError({
      statusCode: 422,
      statusMessage,
      data,
    }));
  }

  const existingLocation = await db.query.location.findFirst({
    where:
      and(
        eq(location.name, result.data.name),
        eq(location.userId, event.context.user.id),
      ),
  });

  if (existingLocation) {
    return sendError(event, createError({
      statusCode: 409,
      statusMessage: "A location with that name already exists!",
    }));
  }

  let slug = slugify(result.data.name);
  let slugExists = !!(await db.query.location.findFirst({
    where: eq(location.slug, slug),
  }));

  while (slugExists) {
    const id = nanoid();
    const idSlug = `${slug}-${id}`;
    slugExists = !!(await db.query.location.findFirst({
      where: eq(location.slug, idSlug),
    }));
    if (!slugExists) {
      slug = idSlug;
    }
  }

  try {
    const [created] = await db.insert(location).values({
      ...result.data,
      slug,
      userId: event.context.user.id,
    }).returning();

    return created;
  }
  catch (error) {
    console.error(error);
    throw error;
  }
});
