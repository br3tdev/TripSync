import { z } from "zod";

import db from "~/lib/db";
import { location } from "~/lib/db/schema";

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

  const [created] = await db.insert(location).values({
    ...result.data,
    slug: result.data.name.replaceAll(" ", "-").toLocaleLowerCase(),
    userId: event.context.user.id,
  }).returning();

  return created;
});
