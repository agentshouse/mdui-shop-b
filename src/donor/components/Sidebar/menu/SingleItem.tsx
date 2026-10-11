import { Box, List, sprinkles } from "@saleor/macaw-ui-next";
import { Link } from "react-router-dom";

import { useLocation } from "react-router-dom";
import { MenuItemLabel } from "./MenuItemLabel";
import { type SidebarMenuItem } from "./types";

interface Props {
  menuItem: SidebarMenuItem;
}

export const SingleItem = ({ menuItem }: Props) => {
  const {pathname}=useLocation(); const active=pathname===menuItem.url || Boolean(menuItem.url && pathname.startsWith(menuItem.url+"/"));
  const handleMenuItemClick = () => {
    if (menuItem.onClick) {
      menuItem.onClick();
    }
  };

  return (
    <List.Item
      borderRadius={3}
      paddingX={2}
      active={active}
      onClick={handleMenuItemClick}
      data-test-id={`menu-item-label-${menuItem.id}`}
      position="relative"
      // Hover/focus root for adornments that reveal themselves on the row (e.g. unpin).
      className="sidebar-single-item"
    >
      <Link
        to={menuItem.url || ""}
        replace={active}
        className={sprinkles({
          display: "block",
          width: "100%",
        })}
      >
        <Box
          paddingY={1.5}
          gap={menuItem.labelStyle === "settings" ? 1.5 : 3}
          display="flex"
          alignItems="center"
        >
          {menuItem.icon}
          <MenuItemLabel menuItem={menuItem} />
        </Box>
      </Link>
      {menuItem.endAdornment && (
        <Box position="absolute" right={2} zIndex={"3"}>
          {menuItem.endAdornment}
        </Box>
      )}
    </List.Item>
  );
};
