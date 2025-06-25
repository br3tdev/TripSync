import { auth } from "~/lib/auth";

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({
      headers: event.headers,
    });

    // eslint-disable-next-line no-console
    console.log("Session:", session);

    // eslint-disable-next-line no-console
    console.log("Path:", event.path);

    if (event.path.startsWith("/dashboard")) {
      if (!session?.user) {
        await sendRedirect(event, "/", 302);
      }
    }
});
