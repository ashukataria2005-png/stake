import {
  STAKE_MINES_MULTIPLIERS,
  MINES_MULTIPLIERS_MATRIX,
  getMinesMultiplierValue,
} from "@/config/stakeMultipliers";

export { STAKE_MINES_MULTIPLIERS };
export const MINES_MULTIPLIERS_MAP = MINES_MULTIPLIERS_MATRIX;

export function getMinesMultiplier(mines: number, gemsOpened: number): number {
  if (gemsOpened <= 0) return 1.0;
  if (STAKE_MINES_MULTIPLIERS[mines]?.[gemsOpened]) {
    return STAKE_MINES_MULTIPLIERS[mines][gemsOpened];
  }
  return getMinesMultiplierValue(mines, gemsOpened);
}

export function getMinesMultipliersList(mines: number): number[] {
  return MINES_MULTIPLIERS_MATRIX[mines] || [];
}

export default MINES_MULTIPLIERS_MAP;

