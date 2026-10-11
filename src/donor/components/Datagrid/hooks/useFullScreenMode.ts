import { useEffect, useRef, useState } from "react";

import { useDelayedState } from "./useDelayedState";
import { usePressEscKey } from "./usePressEscKey";

interface UseFullScreenMode {
  isOpen: boolean;
  isAnimationOpenFinished: boolean;
  toggle: () => void;
}

export const useFullScreenMode = (onChange?: (isOpen: boolean) => void): UseFullScreenMode => {
  const [open, setOpen] = useState(false);
  const { delayedState: delayedOpen } = useDelayedState(!open);
  const openRef = useRef(open);
  const onChangeRef = useRef(onChange);

  useEffect(
    function syncFullscreenRefs() {
      openRef.current = open;
      onChangeRef.current = onChange;
    },
    [onChange, open],
  );

  usePressEscKey(() => {
    if (!openRef.current) {
      return;
    }

    openRef.current = false;
    setOpen(false);
    onChangeRef.current?.(false);
  });

  const toggle = () => {
    const next = !openRef.current;

    openRef.current = next;
    setOpen(next);
    onChangeRef.current?.(next);
  };

  useEffect(
    function lockBodyScrollWhileFullscreen() {
      if (!open) return;
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = previous; };
    },
    [open],
  );

  return {
    isOpen: open,
    isAnimationOpenFinished: !delayedOpen,
    toggle,
  };
};
