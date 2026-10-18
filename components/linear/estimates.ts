import type { Workspace } from "@/lib/linear/model";
/** Estimate choices for the workspace's scale (Settings › Teams › Estimates). Stored as points either way. */
export type EstimateScale = "fibonacci" | "linear" | "exponential" | "tshirt";
const SCALES: Record<EstimateScale, [number, string][]> = {
  fibonacci: [[1, "1 point"], [2, "2 points"], [3, "3 points"], [5, "5 points"], [8, "8 points"]],
  linear: [[1, "1 point"], [2, "2 points"], [3, "3 points"], [4, "4 points"], [5, "5 points"]],
  exponential: [[1, "1 point"], [2, "2 points"], [4, "4 points"], [8, "8 points"], [16, "16 points"]],
  tshirt: [[1, "XS"], [2, "S"], [3, "M"], [5, "L"], [8, "XL"]],
};
export const ESTIMATES = (ws: Pick<Workspace, "estimateScale">) => SCALES[ws.estimateScale ?? "fibonacci"];
export const estimateLabel = (ws: Pick<Workspace, "estimateScale">, n: number) => ESTIMATES(ws).find(([v]) => v === n)?.[1] ?? `${n} points`;
