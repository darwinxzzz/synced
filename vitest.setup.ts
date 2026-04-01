import "@testing-library/jest-dom";
import { vi } from "vitest";

// Stub browser APIs not available in jsdom
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
