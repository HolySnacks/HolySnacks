import { Halo } from "./Halo";

export function HolyLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const textSize = size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-xl";
  const hw = size === "lg" ? 64 : size === "sm" ? 40 : 50;
  return (
    <div className="flex flex-col items-start gap-0.5">
      <div className="ml-1">
        <Halo width={hw} height={size === "lg" ? 16 : 12} strokeWidth={size === "lg" ? 3 : 2} />
      </div>
      <span className={`${textSize} font-bold tracking-tight leading-none`}>
        <span className="bg-gradient-to-r from-[#f0c855] via-[#fde68a] to-[#f0c855] bg-clip-text text-transparent">
          Holy
        </span>
        <span className="text-white">Snacks</span>
      </span>
    </div>
  );
}
