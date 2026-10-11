// @ts-strict-ignore
import throttle from "lodash/throttle";
import { useEffect, useState } from "react";

export const useScrollRight = () => {
  const [scrolledToRight, setScrolledToRight] = useState(false);
  const scroller: HTMLDivElement | null = document.querySelector(".dvn-scroller");
  const scrollerInner: HTMLDivElement | null = document.querySelector(".dvn-scroll-inner");

  useEffect(() => {
    if (!(scroller && scrollerInner)) {
      return;
    }

    const handler = throttle(() => {
      const isScrolledToRight =
        scroller.scrollWidth - scroller.clientWidth - scroller.scrollLeft < 2;

      setScrolledToRight(previous =>
        previous === isScrolledToRight ? previous : isScrolledToRight,
      );
    }, 100);

    scroller.addEventListener("scroll", handler);

    return () => { scroller.removeEventListener("scroll", handler); handler.cancel(); };
  }, [scroller, scrollerInner]);

  return { scrolledToRight, scroller };
};
