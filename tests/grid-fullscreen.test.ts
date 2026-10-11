import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useFullScreenMode } from "../src/donor/components/Datagrid/hooks/useFullScreenMode";

const { useHotkeysMock } = vi.hoisted(() => ({
  useHotkeysMock: vi.fn<(keys: string, callback: () => void, options: unknown) => void>(),
}));

vi.mock("@dashboard/legacy", () => ({
  useTheme: () => ({ transitions: { duration: { standard: 200 } } }),
}));
vi.mock("react-hotkeys-hook", () => ({ useHotkeys: useHotkeysMock }));

const pressEscape = () => {
  const latestRegistration = useHotkeysMock.mock.calls.at(-1);

  if (!latestRegistration) {
    throw new Error("Fullscreen Escape hotkey was not registered");
  }

  expect(latestRegistration[0]).toBe("escape");
  latestRegistration[1]();
};

describe("fullscreen lifecycle", () => {
  let originalOverflow: string;

  beforeEach(() => {
    originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "";
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    document.body.style.overflow = originalOverflow;
    vi.useRealTimers();
  });

  it("restores body scrolling when an open grid unmounts", () => {
    // Arrange
    const { result, unmount } = renderHook(() => useFullScreenMode());

    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(true);
    expect(document.body.style.overflow).toBe("hidden");

    // Act
    unmount();

    // Assert
    expect(document.body.style.overflow).toBe("");
  });

  it("reports opening and Escape closing without an initial closed notification", () => {
    // Arrange
    const onChange = vi.fn();
    const { result } = renderHook(() => useFullScreenMode(onChange));

    expect(onChange).not.toHaveBeenCalled();

    // Act
    act(() => result.current.toggle());
    act(pressEscape);

    // Assert
    expect(result.current.isOpen).toBe(false);
    expect(document.body.style.overflow).toBe("");
    expect(onChange.mock.calls).toEqual([[true], [false]]);
  });

  it("ignores repeated Escape while closed", () => {
    // Arrange
    const onChange = vi.fn();
    renderHook(() => useFullScreenMode(onChange));

    // Act
    act(pressEscape);
    act(pressEscape);

    // Assert
    expect(onChange).not.toHaveBeenCalled();
  });

  it("uses the latest callback when Escape closes the grid", () => {
    // Arrange
    const initialOnChange = vi.fn();
    const latestOnChange = vi.fn();
    const { result, rerender } = renderHook(({ onChange }) => useFullScreenMode(onChange), {
      initialProps: { onChange: initialOnChange },
    });

    act(() => result.current.toggle());
    rerender({ onChange: latestOnChange });

    // Act
    act(pressEscape);

    // Assert
    expect(initialOnChange.mock.calls).toEqual([[true]]);
    expect(latestOnChange.mock.calls).toEqual([[false]]);
    expect(result.current.isOpen).toBe(false);
  });

  it("handles consecutive toggles before the next render", () => {
    // Arrange
    const onChange = vi.fn();
    const { result } = renderHook(() => useFullScreenMode(onChange));

    // Act
    act(() => {
      result.current.toggle();
      result.current.toggle();
    });

    // Assert
    expect(result.current.isOpen).toBe(false);
    expect(onChange.mock.calls).toEqual([[true], [false]]);
    expect(document.body.style.overflow).toBe("");
  });
});
