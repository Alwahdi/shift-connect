/**
 * Edge Function Shared: Standard Responses
 *
 * Consistent JSON response helpers for edge functions.
 */
import { corsHeaders } from "./cors.ts";

const jsonHeaders = {
  ...corsHeaders,
  "Content-Type": "application/json",
};

export function success(data: unknown, status = 200): Response {
  return new Response(
    JSON.stringify({ success: true, data }),
    { status, headers: jsonHeaders }
  );
}

export function error(message: string, status = 400): Response {
  return new Response(
    JSON.stringify({ success: false, error: message }),
    { status, headers: jsonHeaders }
  );
}

export function unauthorized(message = "Unauthorized"): Response {
  return error(message, 401);
}

export function forbidden(message = "Forbidden"): Response {
  return error(message, 403);
}

export function notFound(message = "Not found"): Response {
  return error(message, 404);
}

export function serverError(message = "Internal server error"): Response {
  return error(message, 500);
}
