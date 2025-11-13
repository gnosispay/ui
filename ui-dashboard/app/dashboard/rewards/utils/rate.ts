export const calculateCashbackRate = (gnoBalance?: number) => {
  if (!gnoBalance) {
    return 0;
  }

  if (gnoBalance < 0.1) {
    return 0;
  } else if (gnoBalance <= 1) {
    // Interpolate between 1% and 2%
    return 1 + (2 - 1) * ((Number(gnoBalance) - 0.1) / (1 - 0.1));
  } else if (gnoBalance <= 10) {
    // Interpolate between 2% and 3%
    return 2 + (3 - 2) * ((Number(gnoBalance) - 1) / (10 - 1));
  } else if (gnoBalance <= 100) {
    // Interpolate between 3% and 4%
    return 3 + (4 - 3) * ((Number(gnoBalance) - 10) / (100 - 10));
  } else {
    // Above 100
    return 5;
  }
};
