interface Breakpoints {
  isMobile: boolean;
  isMedium: boolean;
  isLarge: boolean;
  isXLarge: boolean;
  isMediumAndUp: boolean;
  isMediumAndDown: boolean;
  isLargeAndUp: boolean;
  isLargeAndDown: boolean;
}

export function useBreakpoints() {
  const breakpoints = {
    isMobile: false,
    isMedium: false,
    isLarge: false,
    isXLarge: false,
    isMediumAndUp: false,
    isMediumAndDown: false,
    isLargeAndUp: false,
    isLargeAndDown: false,
  };

  const updateBreakpoints = () => {
    const width = window.innerWidth;
    breakpoints.isMobile = width < 600;
    breakpoints.isMedium = width >= 600 && width < 960;
    breakpoints.isLarge = width >= 960 && width < 1280;
    breakpoints.isXLarge = width >= 1280;

    breakpoints.isMediumAndUp = width >= 600;
    breakpoints.isMediumAndDown = width < 1280;
    breakpoints.isLargeAndUp = width >= 960;
    breakpoints.isLargeAndDown = width < 1280;
  };

  updateBreakpoints();

  return breakpoints;
}
