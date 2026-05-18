// Smooth over `import "server-only"` so server modules can be imported
// directly in Vitest's Node environment without next.js's bundler magic.
// (Vitest doesn't go through Next's loader.)
import { vi } from "vitest";

vi.mock("server-only", () => ({}));
