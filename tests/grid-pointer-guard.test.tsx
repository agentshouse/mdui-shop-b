// Adapted from Saleor Dashboard hooks/usePointerDragClickGuard.test.tsx at
// 8b0e4c9875779dd5395c243f50ab31abb0616c84; BSD-3-Clause (see ../LICENSE).
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import { type MouseEventHandler, type PointerEventHandler, type ReactElement } from "react";

import { usePointerDragClickGuard } from "../src/donor/components/Datagrid/hooks/usePointerDragClickGuard";

interface GuardHarnessProps {
  onCellClick?: () => void;
  onClick: () => void;
  onDrag: () => void;
}

const GuardHarness = ({ onCellClick, onClick, onDrag }: GuardHarnessProps): ReactElement => {
  const {
    onClickCapture,
    onPointerCancelCapture,
    onPointerDownCapture,
    onPointerMoveCapture,
    onPointerUpCapture,
    shouldSuppressClick,
  } = usePointerDragClickGuard(onDrag);
  const handleClick: MouseEventHandler<HTMLDivElement> = () => onClick();
  const handlePointerUp: PointerEventHandler<HTMLDivElement> = () => {
    if (onCellClick && !shouldSuppressClick()) {
      onCellClick();
    }
  };

  return (
    <div
      data-testid="drag-target"
      onClick={handleClick}
      onClickCapture={onClickCapture}
      onPointerCancelCapture={onPointerCancelCapture}
      onPointerDownCapture={onPointerDownCapture}
      onPointerMoveCapture={onPointerMoveCapture}
      onPointerUp={handlePointerUp}
      onPointerUpCapture={onPointerUpCapture}
    />
  );
};

const dispatchPointerEvent = (
  target: Element,
  type: "pointercancel" | "pointerdown" | "pointermove" | "pointerup",
  {
    pointerId,
    clientX = 0,
    clientY = 0,
  }: { pointerId: number; clientX?: number; clientY?: number },
): void => {
  const event = new Event(type, { bubbles: true, cancelable: true });

  Object.defineProperties(event, {
    clientX: { value: clientX },
    clientY: { value: clientY },
    isPrimary: { value: true },
    pointerId: { value: pointerId },
  });
  fireEvent(target, event);
};

describe("usePointerDragClickGuard", () => {
  it("allows a tap to click", () => {
    // Arrange
    const onClick = vi.fn();
    const target = render(<GuardHarness onClick={onClick} onDrag={vi.fn()} />).getByTestId(
      "drag-target",
    );

    // Act
    dispatchPointerEvent(target, "pointerdown", { pointerId: 1, clientX: 20, clientY: 30 });
    dispatchPointerEvent(target, "pointerup", { pointerId: 1, clientX: 20, clientY: 30 });
    fireEvent.click(target);

    // Assert
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("suppresses the click generated after dragging", () => {
    // Arrange
    const onClick = vi.fn();
    const onDrag = vi.fn();
    const target = render(<GuardHarness onClick={onClick} onDrag={onDrag} />).getByTestId(
      "drag-target",
    );

    // Act
    dispatchPointerEvent(target, "pointerdown", { pointerId: 1, clientX: 20, clientY: 30 });
    dispatchPointerEvent(target, "pointermove", { pointerId: 1, clientX: 20, clientY: 37 });
    dispatchPointerEvent(target, "pointerup", { pointerId: 1, clientX: 20, clientY: 37 });
    fireEvent.click(target);

    // Assert
    expect(onDrag).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("suppresses Glide cell activation on pointerup after dragging", () => {
    // Arrange
    const onCellClick = vi.fn();
    const target = render(
      <GuardHarness onCellClick={onCellClick} onClick={vi.fn()} onDrag={vi.fn()} />,
    ).getByTestId("drag-target");

    // Act
    dispatchPointerEvent(target, "pointerdown", { pointerId: 1, clientX: 20, clientY: 30 });
    dispatchPointerEvent(target, "pointermove", { pointerId: 1, clientX: 27, clientY: 30 });
    dispatchPointerEvent(target, "pointerup", { pointerId: 1, clientX: 27, clientY: 30 });

    // Assert
    expect(onCellClick).not.toHaveBeenCalled();
  });

  it("treats a cancelled pointer gesture as scrolling", () => {
    // Arrange
    const onClick = vi.fn();
    const onDrag = vi.fn();
    const target = render(<GuardHarness onClick={onClick} onDrag={onDrag} />).getByTestId(
      "drag-target",
    );

    // Act
    dispatchPointerEvent(target, "pointerdown", { pointerId: 1, clientX: 20, clientY: 30 });
    dispatchPointerEvent(target, "pointercancel", { pointerId: 1 });
    fireEvent.click(target);

    // Assert
    expect(onDrag).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("suppresses both Glide cell activation and the following native click", () => {
    // Arrange
    const onCellClick = vi.fn();
    const onClick = vi.fn();
    const target = render(
      <GuardHarness onCellClick={onCellClick} onClick={onClick} onDrag={vi.fn()} />,
    ).getByTestId("drag-target");

    // Act
    dispatchPointerEvent(target, "pointerdown", { pointerId: 1, clientX: 20, clientY: 30 });
    dispatchPointerEvent(target, "pointermove", { pointerId: 1, clientX: 20, clientY: 37 });
    dispatchPointerEvent(target, "pointerup", { pointerId: 1, clientX: 20, clientY: 37 });
    fireEvent.click(target);

    // Assert
    expect(onCellClick).not.toHaveBeenCalled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("allows a tap after a completed drag gesture", () => {
    // Arrange
    const onClick = vi.fn();
    const target = render(<GuardHarness onClick={onClick} onDrag={vi.fn()} />).getByTestId(
      "drag-target",
    );

    // Act
    dispatchPointerEvent(target, "pointerdown", { pointerId: 1, clientX: 20, clientY: 30 });
    dispatchPointerEvent(target, "pointermove", { pointerId: 1, clientX: 20, clientY: 37 });
    dispatchPointerEvent(target, "pointerup", { pointerId: 1, clientX: 20, clientY: 37 });
    fireEvent.click(target);
    dispatchPointerEvent(target, "pointerdown", { pointerId: 2, clientX: 20, clientY: 30 });
    dispatchPointerEvent(target, "pointerup", { pointerId: 2, clientX: 20, clientY: 30 });
    fireEvent.click(target);

    // Assert
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
