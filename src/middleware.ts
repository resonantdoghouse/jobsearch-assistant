export { auth as middleware } from "./auth";

export const config = {
  matcher: [
    "/resume-review",
    "/cover-letter",
    "/resumes",
    "/analyses",
    "/dashboard",
    "/api/analyze-resume",
    "/api/generate-cover-letter",
    "/api/rewrite-resume",
  ],
};
