import {
  MINES_MULTIPLIERS_MATRIX,
  getMinesMultiplierValue,
} from "@/config/stakeMultipliers";

export const MINES_MULTIPLIERS_MAP = MINES_MULTIPLIERS_MATRIX;

export function getMinesMultiplier(mines: number, gemsOpened: number): number {
  return getMinesMultiplierValue(mines, gemsOpened);
}

export function getMinesMultipliersList(mines: number): number[] {
  return MINES_MULTIPLIERS_MATRIX[mines] || [];
}

export default MINES_MULTIPLIERS_MAP;
