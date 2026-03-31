"use client";
import { useState, useRef } from "react";

function formatMoneyM(n, currency = "USD") {
  const v = Number(n || 0);
  return `${currency === "USD" ? "$" : "₹"}${Math.round(v)}${currency === "USD" ? "M" : "Cr"}`;
}

export default function NetWorthGrowthTimeline({
  title = "Net Worth Growth Timeline",
  seriesA,
  seriesB,
  maxY = 800,
  height = 350,
  currency = "USD",
}) {
  const wrapRef = useRef(null);
  const [hover, setHover] = useState(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const margin = { top: 24, right: 40, bottom: 40, left: 60 };
  const width = 1000; // viewBox width; container is responsive

  const years = (seriesA.points || []).map((p) => p.year).filter(y => y != null && !isNaN(y));
  const xScale = (year) => {
    const idx = years.indexOf(year);
    const step = (width - margin.left - margin.right) / Math.max(years.length - 1, 1);
    return margin.left + idx * step;
  };
  const yScale = (v) => {
    const value = Number(v) || 0; // Ensure value is a number
    const clamped = Math.max(0, Math.min(maxY, value));
    const h = height - margin.top - margin.bottom;
    return margin.top + (h - (clamped / maxY) * h);
  };

  const toPath = (pts) =>
    pts
      .filter(p => p.year != null && p.value != null && !isNaN(Number(p.value))) // Filter out invalid data points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${xScale(p.year)} ${yScale(p.value)}`)
      .join(" ");

  const gridYTicks = [0, maxY * 0.25, maxY * 0.5, maxY * 0.75, maxY];
  const onMove = (e) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const rx = ((e.clientX - rect.left) / rect.width) * width;
    const xs = years.map((y) => xScale(y));
    let nearest = 0;
    let min = Infinity;
    xs.forEach((x, i) => {
      const d = Math.abs(rx - x);
      if (d < min) {
        min = d;
        nearest = i;
      }
    });
    setHover(nearest);
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };
  const onLeave = () => setHover(null);
  const getValueForYear = (points, year) => {
    const p = (points || []).find((pt) => pt.year === year);
    return p ? p.value : null;
  };

  return (
    <section className="lg:px-8 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white text-xl mb-6">{title}</h3>
          <div className="relative" ref={wrapRef} onMouseMove={onMove} onMouseLeave={onLeave}>
            <svg
              className="w-full h-[350px]"
              viewBox={`0 0 ${width} ${height}`}
              preserveAspectRatio="none">
              <rect
                x="0"
                y="0"
                width={width}
                height={height}
                rx="12"
                fill="#0f172a"
              />
              <rect
                x={margin.left}
                y={margin.top}
                width={width - margin.left - margin.right}
                height={height - margin.top - margin.bottom}
                rx="6"
                fill="#1e293b"
              />

              {gridYTicks.map((t) => (
                <g key={`gy-${t}`}>
                  <line
                    x1={margin.left}
                    x2={width - margin.right}
                    y1={yScale(t)}
                    y2={yScale(t)}
                    stroke="#334155"
                    strokeDasharray="3 3"
                    opacity="0.5" />
                  <text
                    x={margin.left - 12}
                    y={yScale(t)}
                    fill="#94a3b8"
                    fontSize="11"
                    textAnchor="end"
                    dominantBaseline="middle"
                  >
                    {formatMoneyM(t, currency)}
                  </text>
                </g>
              ))}
              {years.map((y, i) => (
                <line
                  key={`gx-${y}`}
                  x1={xScale(y)}
                  x2={xScale(y)}
                  y1={margin.top}
                  y2={height - margin.bottom}
                  stroke="#334155"
                  strokeDasharray="3 3"
                  opacity="0.5"
                />
              ))}
              {/* Static highlight line removed */}

              {/* Axes */}
              <line
                x1={margin.left}
                y1={yScale(0)}
                x2={width - margin.right}
                y2={yScale(0)}
                stroke="#475569"
                strokeWidth="1.5"
              />
              <line
                x1={margin.left}
                y1={margin.top}
                x2={margin.left}
                y2={height - margin.bottom}
                stroke="#475569"
                strokeWidth="1.5"
              />
              
              {/* Year labels below X-axis */}
              {years.map((y) => (
                <text
                  key={`xl-${y}`}
                  x={xScale(y)}
                  y={height - margin.bottom + 20}
                  fill="#94a3b8"
                  fontSize="11"
                  textAnchor="middle"
                >
                  {y}
                </text>
              ))}

              {/* Hover vertical guide */}
              {hover != null && (
                <line
                  x1={xScale(years[hover])}
                  x2={xScale(years[hover])}
                  y1={margin.top}
                  y2={height - margin.bottom}
                  stroke="#64748b"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
              )}

              {/* Series A line */}
              <path d={toPath(seriesA.points)} fill="none" stroke={seriesA.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
              {(seriesA.points || []).filter(p => p.year != null && p.value != null && !isNaN(Number(p.value))).map((p, i) => (
                <g key={`a-${i}`}>
                  {hover != null && years[hover] === p.year ? (
                    <circle cx={xScale(p.year)} cy={yScale(Number(p.value))} r="6" fill="none" stroke="#e5e7eb" strokeWidth="2" />
                  ) : null}
                  <circle cx={xScale(p.year)} cy={yScale(Number(p.value))} r="4" fill={seriesA.color} stroke={seriesA.color} strokeWidth="2" />
                </g>
              ))}

              {/* Series B line */}
              <path d={toPath(seriesB.points)} fill="none" stroke={seriesB.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
              {(seriesB.points || []).filter(p => p.year != null && p.value != null && !isNaN(Number(p.value))).map((p, i) => (
                <g key={`b-${i}`}>
                  {hover != null && years[hover] === p.year ? (
                    <circle cx={xScale(p.year)} cy={yScale(Number(p.value))} r="6" fill="none" stroke="#e5e7eb" strokeWidth="2" />
                  ) : null}
                  <circle cx={xScale(p.year)} cy={yScale(Number(p.value))} r="4" fill={seriesB.color} stroke={seriesB.color} strokeWidth="2" />
                </g>
              ))}
            </svg>

            <div className="flex items-center justify-center gap-6 mt-3 text-sm">
              <div className="flex items-center gap-2 text-[#ef4444]">
                <span className="inline-block w-3 h-3 rounded-full bg-[#ef4444]" />
                <span>{seriesA.name}</span>
              </div>
              <div className="flex items-center gap-2 text-[#3b82f6]">
                <span className="inline-block w-3 h-3 rounded-full bg-[#3b82f6]" />
                <span>{seriesB.name}</span>
              </div>
            </div>
            {hover != null && (
              <div
                className="pointer-events-none absolute"
                style={{
                  left: Math.max(8, Math.min(pos.x + 8, (wrapRef.current?.clientWidth || 0) - 120)),
                  top: Math.max(8, Math.min(pos.y - 40, (wrapRef.current?.clientHeight || 0) - 60)),
                }}
              >
                <div className="px-3 py-2 rounded-lg border text-white shadow" style={{ backgroundColor: "rgb(31,41,55)", borderColor: "rgb(55,65,81)" }}>
                  <p className="m-0 text-sm font-semibold">{years[hover]}</p>
                  <div className="mt-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: seriesA.color }} />
                      <span className="opacity-80">{formatMoneyM(getValueForYear(seriesA.points, years[hover]) || 0, currency)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: seriesB.color }} />
                      <span className="opacity-80">{formatMoneyM(getValueForYear(seriesB.points, years[hover]) || 0, currency)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

