export function Halo({
  width = 48,
  height = 14,
  strokeWidth = 2.5,
}: {
  width?: number;
  height?: number;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={width}
      height={height + 6}
      viewBox={`0 0 ${width} ${height + 6}`}
      className="animate-halo"
      style={{ filter: "drop-shadow(0 0 5px #f0c855) drop-shadow(0 0 12px #f0c85570)" }}
    >
      <ellipse
        cx={width / 2}
        cy={(height + 6) / 2}
        rx={width / 2 - strokeWidth}
        ry={height / 2 - 1}
        fill="none"
        stroke="#f0c855"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}
