/**
 * @syndeocare/analytics — Analytics & Tracking
 *
 * Unified analytics interface that can dispatch to
 * PostHog, Sentry, or custom backends.
 */

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
}

interface AnalyticsUser {
  id: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
}

class Analytics {
  private initialized = false;

  /**
   * Initialize analytics providers.
   * Call once at app startup.
   */
  init() {
    if (this.initialized) return;

    // PostHog
    const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
    if (posthogKey && typeof window !== "undefined") {
      // Dynamic import to keep bundle size down
      import("posthog-js")
        .then(({ default: posthog }) => {
          posthog.init(posthogKey, {
            api_host: "https://us.i.posthog.com",
            loaded: () => {
              console.log("[Analytics] PostHog initialized");
            },
          });
        })
        .catch(() => {
          console.warn("[Analytics] PostHog failed to load");
        });
    }

    this.initialized = true;
  }

  /**
   * Track a custom event.
   */
  track(event: string | AnalyticsEvent, properties?: Record<string, unknown>) {
    const name = typeof event === "string" ? event : event.name;
    const props =
      typeof event === "string" ? properties : event.properties;

    if (import.meta.env.DEV) {
      console.log(`[Analytics] Track: ${name}`, props);
    }

    // PostHog
    try {
      // @ts-ignore — dynamic import
      window.posthog?.capture(name, props);
    } catch {}
  }

  /**
   * Identify a user across sessions.
   */
  identify(user: AnalyticsUser) {
    if (import.meta.env.DEV) {
      console.log(`[Analytics] Identify: ${user.id}`);
    }

    try {
      // @ts-ignore
      window.posthog?.identify(user.id, {
        email: user.email,
        role: user.role,
      });
    } catch {}
  }

  /**
   * Reset identity (on sign out).
   */
  reset() {
    try {
      // @ts-ignore
      window.posthog?.reset();
    } catch {}
  }

  /**
   * Track page view.
   */
  page(path?: string) {
    this.track("$pageview", { path: path || window.location.pathname });
  }
}

export const analytics = new Analytics();
export default analytics;
