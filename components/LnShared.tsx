import Link from "next/link";
import "./lnhome.css";
import { Mark } from "./Mark";

export const LnMark = ({ s = 20 }: { s?: number }) => <Mark size={s} />;

export function LnCta({ top }: { top: number }) {
  return <>
    <h2 className="cta" style={{ top }}>Built for the future.<br />Free today.</h2>
    <div className="ctb" style={{ top: top + 187 }}><Link href="/app" className="a" data-cta="footer_get_started">Get started</Link><Link href="/contact">Contact us</Link></div>
  </>;
}
