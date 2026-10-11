// Adapted from Saleor Dashboard hooks/useTooltipContainer.test.ts at
// 8b0e4c9875779dd5395c243f50ab31abb0616c84; BSD-3-Clause (see ../LICENSE).
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useHotkeys } from "react-hotkeys-hook";

import { CELL_TOOLTIP_SHOW_DELAY_MS, useTooltipContainer } from "../src/donor/components/Datagrid/hooks/useTooltipContainer";

// Check registration and callbacks without depending on browser key dispatch.
vi.mock("react-hotkeys-hook", () => ({ useHotkeys: vi.fn() }));
const lastHotkeyCall = () => {
  const { calls } = (useHotkeys as Mock).mock;

  return calls[calls.length - 1];
};

const bounds = { x: 0, y: 0, width: 10, height: 10 };

describe("useTooltipContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("delays the first cell tooltip until the show delay elapses", () => {
    // Arrange
    const { result } = renderHook(() => useTooltipContainer());

    // Act
    act(() => {
      result.current.scheduleTooltip("cell-a", bounds, [0, 0], "left");
    });

    // Assert
    expect(result.current.tooltip).toBeUndefined();

    act(() => {
      vi.advanceTimersByTime(CELL_TOOLTIP_SHOW_DELAY_MS);
    });

    expect(result.current.tooltip?.content).toBe("cell-a");
  });

  it("cancels a pending show when the pointer leaves before the delay", () => {
    // Arrange
    const { result } = renderHook(() => useTooltipContainer());

    // Act
    act(() => {
      result.current.scheduleTooltip("cell-a", bounds, [0, 0], "left");
      result.current.clearTooltip();
      vi.advanceTimersByTime(CELL_TOOLTIP_SHOW_DELAY_MS);
    });

    // Assert
    expect(result.current.tooltip).toBeUndefined();
  });

  it("updates immediately when a tooltip is already open", () => {
    // Arrange
    const { result } = renderHook(() => useTooltipContainer());

    act(() => {
      result.current.scheduleTooltip("cell-a", bounds, [0, 0], "left");
      vi.advanceTimersByTime(CELL_TOOLTIP_SHOW_DELAY_MS);
    });

    // Act
    act(() => {
      result.current.scheduleTooltip("cell-b", bounds, [0, 1], "left");
    });

    // Assert
    expect(result.current.tooltip?.content).toBe("cell-b");
    expect(result.current.tooltip?.location).toEqual([0, 1]);
  });

  it("shows header tooltips immediately via setTooltip", () => {
    // Arrange
    const { result } = renderHook(() => useTooltipContainer());

    // Act
    act(() => {
      result.current.setTooltip("header", bounds, [1, -1]);
    });

    // Assert
    expect(result.current.tooltip?.content).toBe("header");
  });

  it("dismisses an open tooltip on outside pointerdown", () => {
    // Arrange
    const { result } = renderHook(() => useTooltipContainer());

    act(() => {
      result.current.setTooltip("header", bounds, [1, -1]);
    });
    // Effect schedules listener on setTimeout(0) after open — flush that turn.
    act(() => {
      vi.runOnlyPendingTimers();
    });

    // Act
    act(() => {
      window.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    });

    // Assert
    expect(result.current.tooltip).toBeUndefined();
  });

  it("dismisses an open tooltip on Escape", () => {
    // Arrange
    const { result } = renderHook(() => useTooltipContainer());

    act(() => {
      result.current.setTooltip("header", bounds, [1, -1]);
    });

    // Act
    const [keys, onEscape, options] = lastHotkeyCall();

    act(() => {
      onEscape();
    });

    // Assert
    expect(keys).toBe("escape");
    expect(options).toEqual({ enabled: true, enableOnFormTags: true });
    expect(result.current.tooltip).toBeUndefined();
  });

  it("keeps the Escape hotkey disabled while no tooltip is open", () => {
    // Arrange & Act
    renderHook(() => useTooltipContainer());

    // Assert
    const [, , options] = lastHotkeyCall();

    expect(options).toEqual({ enabled: false, enableOnFormTags: true });
  });

  it("does not dismiss on the same turn as opening", () => {
    // Arrange
    const { result } = renderHook(() => useTooltipContainer());

    // Act — pointerdown before the deferred listener attaches
    act(() => {
      result.current.setTooltip("header", bounds, [1, -1]);
      window.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    });

    // Assert
    expect(result.current.tooltip?.content).toBe("header");
  });
});
