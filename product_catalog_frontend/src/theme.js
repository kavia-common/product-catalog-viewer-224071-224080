//
// Ocean Professional theme tokens and helpers
//

export const theme = {
  name: "Ocean Professional",
  colors: {
    primary: "#2563EB", // blue-600
    secondary: "#F59E0B", // amber-500
    success: "#10B981",
    error: "#EF4444",
    background: "#f9fafb",
    surface: "#ffffff",
    text: "#111827",
    subtle: "#6B7280",
    border: "#E5E7EB",
    shadow: "0 10px 15px -3px rgba(0,0,0,0.1),0 4px 6px -2px rgba(0,0,0,0.05)",
  },
  radius: {
    sm: "6px",
    md: "10px",
    lg: "14px",
  },
  spacing: (n) => `${4 * n}px`,
  transition: "all 200ms ease",
};

// PUBLIC_INTERFACE
export function applyCssVars() {
  /** Apply CSS variables to document root from theme */
  const root = document.documentElement;
  const c = theme.colors;
  root.style.setProperty("--ocn-primary", c.primary);
  root.style.setProperty("--ocn-secondary", c.secondary);
  root.style.setProperty("--ocn-success", c.success);
  root.style.setProperty("--ocn-error", c.error);
  root.style.setProperty("--ocn-bg", c.background);
  root.style.setProperty("--ocn-surface", c.surface);
  root.style.setProperty("--ocn-text", c.text);
  root.style.setProperty("--ocn-subtle", c.subtle);
  root.style.setProperty("--ocn-border", c.border);
  root.style.setProperty("--ocn-shadow", c.shadow);
  root.style.setProperty("--ocn-radius-sm", theme.radius.sm);
  root.style.setProperty("--ocn-radius-md", theme.radius.md);
  root.style.setProperty("--ocn-radius-lg", theme.radius.lg);
  root.style.setProperty("--ocn-transition", theme.transition);
}
