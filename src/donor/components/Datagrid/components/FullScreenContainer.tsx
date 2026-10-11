// @ts-strict-ignore
import { useTheme } from "@dashboard/legacy";
import { type CSSProperties, type FC, type PropsWithChildren, useEffect, useRef } from "react";
import ReactDOM from "react-dom";

import { useDelayedState } from "../hooks/useDelayedState";

const modalRoot = document.getElementById("modal-root") || document.createElement("div");
const useEase = (duration: number) => {
  const { transitions } = useTheme();
  const { easeIn, easeOut } = transitions.easing;
  const options = { duration, delay: 0 };
  const transitionIn = transitions.create("all", {
    ...options,
    easing: easeIn,
  });
  const transitionOut = transitions.create("all", {
    ...options,
    easing: easeOut,
  });

  return { transitionIn, transitionOut };
};
const useAnimationStyles = (isOpen: boolean, duration: number): CSSProperties => {
  const { transitionIn, transitionOut } = useEase(duration);
  const initialStyles: CSSProperties = {
    opacity: 0,
    position: "fixed",
    inset: 0,
    zIndex: -1,
    pointerEvents: "none",
  };
  const openStyles: CSSProperties = {
    transition: transitionIn,
    opacity: 1,
    zIndex: 1,
    pointerEvents: "auto",
  };
  const closedStyles = {
    transition: transitionOut,
    opacity: 0,
  };

  return {
    ...initialStyles,
    ...(isOpen ? openStyles : closedStyles),
  };
};

type FullScreenContainerProps = FC<
  PropsWithChildren<{
    open?: boolean;
    className?: string;
  }>
>;

const Portal: FullScreenContainerProps = ({ className, children, open = false }) => {
  const { delayedState: delayedOpen, duration } = useDelayedState(open);
  const styles = useAnimationStyles(open, duration);
  const element = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const first = element.current?.querySelector<HTMLElement>('[aria-label="Exit fullscreen"]');
    (first ?? element.current)?.focus({preventScroll: true});
    return () => {
      if (previous?.isConnected) previous.focus({preventScroll: true});
    };
  }, [open]);
  // A closed, empty fixed portal must never remain above the ordinary grid.
  // Keep the fade-out inert, then remove the portal entirely.
  if (!open && !delayedOpen) return null;

  return ReactDOM.createPortal(
    <div ref={element} className={className} style={styles}
      role={open ? "dialog" : undefined} aria-modal={open || undefined}
      aria-label={open ? "Fullscreen table" : undefined} aria-hidden={!open}
      tabIndex={-1} {...(!open ? {inert: ""} : {})}
      onKeyDown={event => {
        if (!open || event.key !== "Tab") return;
        const nodes = Array.from(element.current?.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])') ?? []);
        const first = nodes[0], last = nodes[nodes.length - 1];
        if (!first) {event.preventDefault();element.current?.focus();}
        else if (event.shiftKey && (document.activeElement === first || document.activeElement === element.current)) {event.preventDefault();last.focus();}
        else if (!event.shiftKey && document.activeElement === last) {event.preventDefault();first.focus();}
      }}>
      {children}
    </div>,
    modalRoot,
  );
};

export const FullScreenContainer: FullScreenContainerProps = ({ children, open = false, ...rest }) => (
  <>
    <Portal {...rest} open={open}>{children}</Portal>
    <div style={{visibility: open ? "hidden" : undefined}} aria-hidden={open || undefined} {...(open ? {inert: ""} : {})}>{children}</div>
  </>
);
