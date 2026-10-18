import { useId } from "react";
// LinearIsDead brand mark: the IsDead tombstone (shared silhouette with the other clones) in Linear purple. Original art.
// The X is cut out of the stone with a mask, so the mark sits on light and dark surfaces alike.
export const BRAND = { purple: "#5E6AD2" };
export function Mark({ size = 28, color = BRAND.purple }: { size?: number; color?: string }) {
  const id = useId().replace(/:/g, "");
  return <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" style={{ flex: "none" }}>
    <mask id={`ln-x-${id}`}>
      <rect width="32" height="32" fill="#fff" />
      <path d="M12.2 11.8l7.6 7.6M19.8 11.8l-7.6 7.6" stroke="#000" strokeWidth="2.6" strokeLinecap="round" fill="none" />
    </mask>
    <g fill={color} mask={`url(#ln-x-${id})`}><path d="M16 5.5a8 8 0 0 1 8 8V24H8V13.5a8 8 0 0 1 8-8z" /><rect x="5" y="23" width="22" height="4.5" rx="1.6" /></g>
  </svg>;
}
