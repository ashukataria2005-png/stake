/**
 * STAKE MINES EDITABLE MULTIPLIERS REGISTRY
 * Easily edit multipliers per mine count (1 to 24).
 */

export const MINES_MULTIPLIERS_MAP: Record<number, number[]> = {
  // 1 Mine (Screenshot 38-43)
  1: [
    1.01, 1.05, 1.10, 1.15, 1.21, 1.28, 1.35, 1.43, 1.52, 1.62,
    1.73, 1.87, 2.02, 2.20, 2.43, 2.69, 3.03, 3.46, 4.04, 4.85,
    6.06, 8.08, 12.13, 24.25
  ],

  // 2 Mines (23 gems max) - customizable
  2: [
    1.08, 1.17, 1.29, 1.41, 1.56, 1.74, 1.94, 2.18,
    2.48, 2.83, 3.26, 3.81, 4.5, 5.4, 6.6, 8.25,
    10.61, 14.14, 19.8, 29.7, 49.5, 99, 297
  ],

  // 3 Mines (22 gems max) - customizable
  3: [
    1.13, 1.29, 1.48, 1.71, 2, 2.35, 2.79, 3.35,
    4.07, 5, 6.26, 7.96, 10.35, 13.8, 18.98, 27.11,
    40.66, 65.06, 113.85, 227.7, 569.25, 2277
  ],

  // 4 Mines (21 gems max) - customizable
  4: [
    1.18, 1.41, 1.71, 2.09, 2.58, 3.23, 4.09, 5.26,
    6.88, 9.17, 12.51, 17.52, 25.3, 37.95, 59.64, 99.39,
    178.91, 357.81, 834.9, 2504.7, 12523.5
  ],

  // 5 Mines (20 gems max) - customizable
  5: [
    1.24, 1.56, 2, 2.58, 3.39, 4.52, 6.14, 8.5,
    12.04, 17.52, 26.27, 40.87, 66.41, 113.85, 208.72, 417.45,
    939.26, 2504.7, 8766.45, 52598.7
  ],

  // 6 Mines (19 gems max) - customizable
  6: [
    1.3, 1.74, 2.35, 3.23, 4.52, 6.46, 9.44, 14.17,
    21.89, 35.03, 58.38, 102.17, 189.75, 379.5, 834.9, 2087.25,
    6261.75, 25047, 175329
  ],

  // 7 Mines (18 gems max) - customizable
  7: [
    1.38, 1.94, 2.79, 4.09, 6.14, 9.44, 14.95, 24.47,
    41.6, 73.95, 138.66, 277.33, 600.88, 1442.1, 3965.78, 13219.25,
    59486.63, 475893
  ],

  // 8 Mines (17 gems max) - customizable
  8: [
    1.46, 2.18, 3.35, 5.26, 8.5, 14.17, 24.47, 44.05,
    83.2, 166.4, 356.56, 831.98, 2163.15, 6489.45, 23794.65, 118973.25,
    1070759.25
  ],

  // 9 Mines (16 gems max) - customizable
  9: [
    1.55, 2.48, 4.07, 6.88, 12.04, 21.89, 41.6, 83.2,
    176.8, 404.1, 1010.26, 2828.73, 9193.39, 36773.55, 202254.52, 2022545.25
  ],

  // 10 Mines (15 gems max) - customizable
  10: [
    1.65, 2.83, 5, 9.17, 17.52, 35.03, 73.95, 166.4,
    404.1, 1077.61, 3232.84, 11314.94, 49031.4, 294188.4, 3236072.4
  ],

  // 11 Mines (14 gems max) - customizable
  11: [
    1.77, 3.26, 6.26, 12.51, 26.27, 58.38, 138.66, 356.56,
    1010.26, 3232.84, 12123.15, 56574.69, 367735.5, 4412826
  ],

  // 12 Mines (13 gems max) - customizable
  12: [
    1.9, 3.81, 7.96, 17.52, 40.87, 102.17, 277.33, 831.98,
    2828.73, 11314.94, 56574.69, 396022.85, 5148297
  ],

  // 13 Mines (12 gems max) - customizable
  13: [
    2.06, 4.5, 10.35, 25.3, 66.41, 189.75, 600.88, 2163.15,
    9193.39, 49031.4, 367735.5, 5148297
  ],

  // 14 Mines (11 gems max) - customizable
  14: [
    2.25, 5.4, 13.8, 37.95, 113.85, 379.5, 1442.1, 6489.45,
    36773.55, 294188.4, 4412826
  ],

  // 15 Mines (10 gems max) - customizable
  15: [
    2.48, 6.6, 18.97, 59.64, 208.72, 834.9, 3965.77, 23794.65,
    202254.52, 3236072.4
  ],

  // 16 Mines (9 gems max) - customizable
  16: [
    2.75, 8.25, 27.11, 99.39, 417.45, 2087.25, 13219.25, 118973.25,
    2022545.25
  ],

  // 17 Mines (8 gems max) - customizable
  17: [
    3.09, 10.61, 40.66, 178.91, 939.26, 6261.75, 59486.63, 1070759.25
  ],

  // 18 Mines (7 gems max) - customizable
  18: [
    3.54, 14.14, 65.06, 357.81, 2504.7, 25047, 475893
  ],

  // 19 Mines (6 gems max) - customizable
  19: [
    4.13, 19.8, 113.85, 834.9, 8766.45, 175329
  ],

  // 20 Mines (5 gems max) - customizable
  20: [
    4.95, 29.7, 227.7, 2504.7, 52598.7
  ],

  // 21 Mines (4 gems max) - customizable
  21: [
    6.19, 49.5, 569.25, 12523.5
  ],

  // 22 Mines (3 gems max) - customizable
  22: [
    8.25, 99, 2277
  ],

  // 23 Mines (2 gems max) - customizable
  23: [
    12.38, 297
  ],

  // 24 Mines (1 gems max) - customizable
  24: [
    24.75
  ],

};

/**
 * Calculates or retrieves the multiplier for a given mine count and opened gems.
 */
export function getMinesMultiplier(minesCount: number, revealedGemsCount: number): number {
  if (revealedGemsCount <= 0) return 1.0;
  const customList = MINES_MULTIPLIERS_MAP[minesCount];
  if (customList && customList[revealedGemsCount - 1] !== undefined) {
    return customList[revealedGemsCount - 1];
  }

  // Mathematical fallback: 0.975 (2.50% House Edge) * product((25 - i) / (25 - mines - i))
  let mult = 0.975;
  for (let i = 0; i < revealedGemsCount; i++) {
    mult *= (25 - i) / (25 - minesCount - i);
  }
  return parseFloat(mult.toFixed(2));
}

export function getMinesMultipliersList(minesCount: number): number[] {
  const customList = MINES_MULTIPLIERS_MAP[minesCount];
  if (customList && customList.length > 0) {
    return customList;
  }
  const totalGems = 25 - minesCount;
  const list: number[] = [];
  for (let k = 1; k <= totalGems; k++) {
    list.push(getMinesMultiplier(minesCount, k));
  }
  return list;
}
