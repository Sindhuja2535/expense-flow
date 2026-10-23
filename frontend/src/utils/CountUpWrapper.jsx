import { useRef } from "react";
import { useCountUp } from "react-countup";

export default function CountUp({ end, duration = 2, decimals = 0, separator = ",", prefix = "", suffix = "" }) {
  const ref = useRef(null);
  useCountUp({
    ref,
    end,
    duration,
    decimals,
    separator,
    prefix,
    suffix,
    startOnMount: true,
  });
  return <span ref={ref} />;
}
