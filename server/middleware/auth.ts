import { auth } from "~/lib/auth";

export default defineEventHandler(async (event) => {
  if (event.path.startsWith("/dashboard")) {
    const session = auth.api.getSession({
      headers: event.headers,
    });
    if (!session) {
      await sendRedirect(event, "/", 302);
    }
  }
});
