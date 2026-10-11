// Adapted from Saleor Dashboard components/TooltipContainer.test.ts at
// 8b0e4c9875779dd5395c243f50ab31abb0616c84; BSD-3-Clause (see ../LICENSE).
import { describe, expect, it } from "vitest";
import { getTooltipAnchor } from "../src/donor/components/Datagrid/components/TooltipContainer";

describe("getTooltipAnchor", () => {
  const bounds = { x: 100, y: 200, width: 40, height: 20 };

  it("anchors left-side tooltips to the cell's left edge", () => {
    // Arrange / Act
    const anchor = getTooltipAnchor(bounds, "left");

    // Assert
    expect(anchor).toEqual({ left: 100, top: 210 });
  });

  it("anchors right-side tooltips to the cell's right edge", () => {
    // Arrange / Act
    const anchor = getTooltipAnchor(bounds, "right");

    // Assert
    expect(anchor).toEqual({ left: 140, top: 210 });
  });

  it("anchors top-side tooltips to the cell's top center", () => {
    // Arrange / Act
    const anchor = getTooltipAnchor(bounds, "top");

    // Assert
    expect(anchor).toEqual({ left: 120, top: 200 });
  });
});
