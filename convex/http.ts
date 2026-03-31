// convex/http.ts — Convex Auth HTTP routes removed.
// Clerk handles all auth callbacks on its own hosted infrastructure.
// If you need custom HTTP routes in the future, re-add them here using httpRouter() from "convex/server".
import { httpRouter } from "convex/server";

const http = httpRouter();

export default http;
