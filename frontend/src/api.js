let csrfPromise;
export function clearCsrf() {
  csrfPromise = null;
}
async function token() {
  if (!csrfPromise)
    csrfPromise = fetch("/api/auth/csrf", { credentials: "same-origin" })
      .then(async (r) => {
        if (!r.ok) throw new Error("Cannot establish a secure session.");
        return r.json();
      })
      .catch((e) => {
        csrfPromise = null;
        throw e;
      });
  return csrfPromise;
}
export async function request(path, options = {}) {
  let response;
  try {
    const headers = { "Content-Type": "application/json", ...options.headers };
    if (
      !["GET", "HEAD", "OPTIONS"].includes(
        (options.method || "GET").toUpperCase(),
      )
    ) {
      const csrf = await token();
      headers[csrf.headerName] = csrf.token;
    }
    response = await fetch("/api" + path, {
      ...options,
      credentials: "same-origin",
      headers,
    });
  } catch {
    throw new Error(
      "Cannot reach the backend. Start Spring Boot on port 8080 and try again.",
    );
  }
  const payload =
    response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 403) clearCsrf();
    if (
      response.status === 401 &&
      path !== "/auth/login" &&
      path !== "/auth/me"
    )
      window.dispatchEvent(new Event("peopleflow:expired"));
    const error = new Error(
      payload?.message || `Request failed (${response.status}).`,
    );
    error.fields = payload?.errors || {};
    error.status = response.status;
    throw error;
  }
  return payload;
}
