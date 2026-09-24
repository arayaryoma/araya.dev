/**
 * Loaded synchronously in <head> so the stored scheme is applied before the
 * first paint. Mirrors the inline script in blog.araya.dev's Layout.astro and
 * shares its localStorage key, so the blog and the editor agree on the theme.
 */
const STORAGE_KEY = "preferred-color-scheme";
try {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "dark" || stored === "light") {
    document.documentElement.setAttribute("data-color-scheme", stored);
  }
} catch {
  // Storage can be unavailable (private mode, blocked cookies); the OS
  // preference then decides, which is the right fallback anyway.
}
