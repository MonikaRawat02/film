"use client";
import { useState, useRef } from "react";

function formatMoneyM(n) {
  const v = Number(n || 0);
  return `$${Math.round(v)}M`;
}

export default function NetWorthGrowthTimeline({
  title = "Net Worth Growth Timeline",
  seriesA = {
    name: "Shah Rukh Khan",
    color: "#ef4444",
    points: [
      { year: 2010, value: 200 },
      { year: 2014, value: 400 },
      { year: 2018, value: 600 },
      { year: 2022, value: 680 },
      { year: 2026, value: 720 },
    ],
  },
  seriesB = {
    name: "Tom Cruise",
    color: "#3b82f6",
    points: [
      { year: 2010, value: 250 },
      { year: 2014, value: 380 },
      { year: 2018, value: 500 },
      { year: 2022, value: 570 },
      { year: 2026, value: 610 },
    ],
  },
  maxY = 800,
  height = 350,
  highlightYear = 2022,
}) {
  const wrapRef = useRef(null);
  const [hover, setHover] = useState(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const margin = { top: 24, right: 28, bottom: 40, left: 52 };
  const width = 1000; // viewBox width; container is responsive

  const years = (seriesA.points || []).map((p) => p.year);
  const xScale = (year) => {
    const idx = years.indexOf(year);
    const step = (width - margin.left - margin.right) / Math.max(years.length - 1, 1);
    return margin.left + idx * step;
  };
  const yScale = (v) => {
    const clamped = Math.max(0, Math.min(maxY, v));
    const h = height - margin.top - margin.bottom;
    return margin.top + (h - (clamped / maxY) * h);
  };

  const toPath = (pts) =>
    pts
      .map((p, i) => `${i === 0 ? "M" : "L"} ${xScale(p.year)} ${yScale(p.value)}`)
      .join(" ");

  const gridYTicks = [0, 200, 400, 600, 800];
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
              preserveAspectRatio="none"
            >
              <rect
                x="0"
                y="0"
                width={width}
                height={height}
                rx="12"
                fill="rgba(2,6,23,0.4)"
              />
              <rect
                x={margin.left}
                y={margin.top}
                width={width - margin.left - margin.right}
                height={height - margin.top - margin.bottom}
                rx="6"
                fill="rgba(59,130,246,0.08)"
              />

              {gridYTicks.map((t) => (
                <line
                  key={`gy-${t}`}
                  x1={margin.left}
                  x2={width - margin.right}
                  y1={yScale(t)}
                  y2={yScale(t)}
                  stroke="#374151"
                  strokeDasharray="3 3"
                  opacity="0.6"
                />
              ))}
              {years.map((y, i) => (
                <line
                  key={`gx-${y}`}
                  x1={xScale(y)}
                  x2={xScale(y)}
                  y1={margin.top}
                  y2={height - margin.bottom}
                  stroke="#374151"
                  strokeDasharray="3 3"
                  opacity="0.6"
                />
              ))}
              {/* Static highlight line removed */}

              <line
                x1={margin.left}
                y1={yScale(0)}
                x2={width - margin.right}
                y2={yScale(0)}
                stroke="#9ca3af"
                opacity="0.5"
              />
              <line
                x1={margin.left}
                y1={margin.top}
                x2={margin.left}
                y2={height - margin.bottom}
                stroke="#9ca3af"
                opacity="0.5"
              />

              {gridYTicks.map((t) => (
                <text
                  key={`yl-${t}`}
                  x={margin.left - 10}
                  y={yScale(t)}
                  fill="#9ca3af"
                  fontSize="12"
                  textAnchor="end"
                  dominantBaseline="middle"
                >
                  {formatMoneyM(t)}
                </text>
              ))}

              {years.map((y) => (
                <text
                  key={`xl-${y}`}
                  x={xScale(y)}
                  y={height - margin.bottom + 18}
                  fill="#9ca3af"
                  fontSize="12"
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
                  stroke="#9ca3af"
                  opacity="0.8"
                />
              )}

              <path d={toPath(seriesA.points)} fill="none" stroke={seriesA.color} strokeWidth="2.5" />
              {seriesA.points.map((p, i) => (
                <g key={`a-${i}`}>
                  {hover != null && years[hover] === p.year ? (
                    <circle cx={xScale(p.year)} cy={yScale(p.value)} r="6" fill="none" stroke="#e5e7eb" strokeWidth="2" />
                  ) : null}
                  <circle cx={xScale(p.year)} cy={yScale(p.value)} r="4" fill={seriesA.color}>
                  <title>
                    {seriesA.name} • {p.year} • {formatMoneyM(p.value)}
                  </title>
                  </circle>
                </g>
              ))}

              <path d={toPath(seriesB.points)} fill="none" stroke={seriesB.color} strokeWidth="2.5" />
              {seriesB.points.map((p, i) => (
                <g key={`b-${i}`}>
                  {hover != null && years[hover] === p.year ? (
                    <circle cx={xScale(p.year)} cy={yScale(p.value)} r="6" fill="none" stroke="#e5e7eb" strokeWidth="2" />
                  ) : null}
                  <circle cx={xScale(p.year)} cy={yScale(p.value)} r="4" fill={seriesB.color}>
                    <title>
                      {seriesB.name} • {p.year} • {formatMoneyM(p.value)}
                    </title>
                  </circle>
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
                      <span className="opacity-80">{formatMoneyM(getValueForYear(seriesA.points, years[hover]))}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: seriesB.color }} />
                      <span className="opacity-80">{formatMoneyM(getValueForYear(seriesB.points, years[hover]))}</span>
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

