import { type Theme } from "@glideapps/glide-data-grid";
import { makeStyles } from "@dashboard/legacy";
import { useTheme, vars } from "@saleor/macaw-ui-next";
import { useMemo } from "react";

import { rightColumnBoxShadow } from "./ColumnPicker/utils";
import { DEFAULT_ROW_MARKER_WIDTH } from "./const";

export const cellHeight = 40;
// Width for a single action button container (column picker, single row action)
export const singleActionWidth = cellHeight;
// Default width for the row action bar (can be overridden via Datagrid prop)
export const rowActionBarWidth = singleActionWidth;

const useStyles = makeStyles<{
  actionButtonPosition?: "left" | "right";
  showMetadataButton?: boolean;
  rowMarkerWidth?: number;
  rowActionWidth?: number;
  headerHeight?: number;
}>(
  () => {
    const rowActionSelected = {
      background: "transparent",
      color: vars.colors.border.default1,
    };

    return {
      actionBtnBar: {
        position: "absolute",
        // The same marker/action widths passed to Glide bound this overlay.
        // Its containing block is editorContainer, not the outer card.
        left: props => props.rowMarkerWidth ?? DEFAULT_ROW_MARKER_WIDTH,
        right: props => props.rowActionWidth ?? rowActionBarWidth,
        top: 1,
        zIndex: 1,
        background: vars.colors.background.default1,
        borderRadius: 0,
        width: "auto",
        margin: 0,
        boxSizing: "border-box",
        height: props => props.headerHeight ?? cellHeight,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: vars.spacing[1.5],
      },
      columnPicker: {
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        height: cellHeight,
        width: "100%",
      },
      columnPickerBackground: {
        background: vars.colors.background.default1,
      },
      ghostIcon: {
        color: vars.colors.text.default1,
        // Fixed size with 6px smaller than cell for visual padding
        width: cellHeight - 8,
        height: cellHeight - 8,
        padding: 0,
        margin: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
      portal: {
        "& input::-webkit-outer-spin-button, input::-webkit-inner-spin-button": {
          appearance: "none",
          margin: 0,
        },
        "& input[type=number]": {
          appearance: "textfield",
        },
        "& .clip-region": {
          border: `1px solid ${vars.colors.border.accent1}`,
          display: "flex",
          alignItems: "stretch",
        },
        "& .gdg-growing-entry": {
          flex: 1,
          marginTop: 0,
        },
        "& .gdg-style": {
          background: vars.colors.background.default1,
          border: "none",
          // Setting these with !important because we never intend to style
          // this particular element, like, never ever
          boxShadow: "none !important",
          padding: "0 !important",
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "stretch",
        },
        "& input:not([class*='MuiInputBase']), & textarea": {
          appearance: "none",
          background: "none",
          border: "none",
          fontSize: vars.fontSize[3],
          letterSpacing: vars.letterSpacing[3],
          lineHeight: vars.lineHeight[3],
          fontWeight: vars.fontWeight.regular,
          padding: vars.spacing[1],
          outline: 0,
        },
        "& input[type='number']:not([class*='MuiInputBase'])": {
          textAlign: "right",
          width: "100%",
          height: "100%",
          boxSizing: "border-box",
          paddingTop: 0,
          paddingBottom: 0,
          lineHeight: "normal",
        },
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 2,
      },
      datagrid: {
        "& .dvn-scroller": {
          overscrollBehaviorX: "none",
          overflowY: "hidden",
        },
        borderRadius: 0,
        boxSizing: "content-box",
        width: "100%",
        paddingBottom: "1px",
      },
      rowActionBar: {
        height: "100%",
        width: rowActionBarWidth,
      },
      rowActionvBarWithItems: {},
      rowActionBarScrolledToRight: {
        borderLeftColor: vars.colors.border.default1,
      },
      rowAction: {
        "&:hover, $rowActionSelected": {
          rowActionSelected,
        },
        "&:not(:last-child)": {
          marginBottom: -1,
        },
        borderTop: `1px solid ${vars.colors.border.default1}`,
        borderBottom: `1px solid ${vars.colors.border.default1}`,
        borderLeft: `1px solid ${vars.colors.border.default1}`,
        borderRight: "none",
        color: vars.colors.text.default1,
        display: "grid",
        gridTemplateColumns: props => (props.showMetadataButton ? "1fr auto 1fr" : "1fr"),
        alignItems: "center",
        justifyItems: "center",
        height: `calc(${cellHeight}px - 1px)`,
        background: vars.colors.background.default1,
        boxShadow: rightColumnBoxShadow,
      },
      rowColumnGroup: {
        height: `calc(${cellHeight}px - 1px)`,
      },
      rowActionScrolledToRight: {
        borderLeftColor: vars.colors.border.default1,
      },
      editorContainer: {
        position: "relative",
        height: "100%",
      },
      rowAnchor: {
        position: "fixed",
        display: "block",
        top: -1000,
        left: -1000,
        // Vertical pans must reach the page; the wheel listener forwards axes
        // the grid can actually scroll.
        touchAction: "pan-y",
      },
      rowActionBarShadow: {
        height: "100%",
        width: 1,
        position: "absolute",
        zIndex: -1,
        transition: "box-shadow .2s ease-in-out",
        boxShadow: "-1px 0px 12px transparent",
      },
      rowActionBarShadowActive: {
        boxShadow: "none",
      },
      rowActionSelected,
    };
  },
  { name: "Datagrid" },
);

export const useFullScreenStyles = makeStyles<ReturnType<typeof useStyles>>(
  () => ({
    fullScreenContainer: props => ({
      [`& .${props.editorContainer}`]: {
        height: "100%",
        display: "flex",
        flexDirection: "column",
      },
      [`& .${props.datagrid}`]: {
        height: "100%",
        "& .dvn-scroller": {
          overflowY: "scroll",
        },
      },
    }),
  }),
  { name: "Datagrid-fullscreen" },
);

export function useDatagridTheme(readonly?: boolean, hasHeaderClickable?: boolean) {
  const { themeValues } = useTheme();
  const datagridTheme = useMemo(
    (): Partial<Theme> => ({
      // Accent colors for checkboxes and selection highlighting
      // accentColor: used for checkbox fill when cell has focus
      // accentLight: background overlay for focused/selected cells
      accentColor: themeValues.colors.background.accent1,
      accentLight: "#f7f8fa", // Neutral gray for focus highlight
      accentFg: "#ffffff", // Checkmark color (contrasts with accentColor)
      bgCell: "#ffffff",
      bgHeader: "#ffffff",
      bgHeaderHasFocus: "transparent",
      bgHeaderHovered: "transparent",
      bgBubbleSelected: "#ffffff",
      borderColor: themeValues.colors.border.default1,
      fontFamily: "system-ui, sans-serif",
      baseFontStyle: `${themeValues.fontWeight.regular} ${themeValues.fontSize[3]}`,
      headerFontStyle: `${themeValues.fontWeight.medium} ${themeValues.fontSize[2]}`,
      editorFontSize: themeValues.fontSize[3],
      textMedium: "#172b3a",
      textGroupHeader: "#172b3a",
      textBubble: "#172b3a",
      textDark: "#172b3a",
      textLight: "#52616d",
      textHeader: "#172b3a",
      textHeaderSelected: "#172b3a",
      fgIconHeader: "#172b3a",
      cellHorizontalPadding: 8,
      cellVerticalPadding: 8,
      lineHeight: 20,
    }),
    [themeValues, hasHeaderClickable],
  );
  const readonlyDatagridTheme = useMemo(
    (): Partial<Theme> => ({
      ...datagridTheme,
      // In readonly mode, keep checkboxes visible but use muted colors
      accentColor: "#52616d",
      accentLight: "#f7f8fa",
    }),
    [themeValues, datagridTheme],
  );

  return readonly ? readonlyDatagridTheme : datagridTheme;
}

export default useStyles;
