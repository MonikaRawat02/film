"use client";
import { useRef, useState } from "react";
import { ChartColumn } from "lucide-react";

function HBarChart({ title, color = "#ef4444", data = [], maxX = 400 }) {
  const margin = { top: 16, right: 24, bottom: 28, left: 90 };
  const row = 52;
  const gap = 10;
  const h = margin.top + margin.bottom + data.length * row + (data.length - 1) * gap;
  const w = 500;
  const wrapRef = useRef(null);
  const [hover, setHover] = useState(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const x = (v) => {
    const val = Math.max(0, Math.min(maxX, Number(v || 0)));
    return (val / maxX) * (w - margin.left - margin.right);
  };
  const ticks = [0, maxX * 0.25, maxX * 0.5, maxX * 0.75, maxX];
  const onMove = (e) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const ry = e.clientY - rect.top - margin.top;
    let idx = -1;
    data.forEach((_, i) => {
      const y0 = i * (row + gap);
      const y1 = y0 + row;
      if (ry >= y0 && ry <= y1) idx = i;
    });
    setHover(idx >= 0 ? idx : null);
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };
  const onLeave = () => setHover(null);

  return (
    <div className="relative" ref={wrapRef} onMouseMove={onMove} onMouseLeave={onLeave}>
      {title ? <h4 className="text-white mb-4">{title}</h4> : null}
      <div>
        <svg className="w-full" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
          <rect x="0" y="0" width={w} height={h} rx="12" fill="rgba(2,6,23,0.4)" />
          <rect
            x={margin.left}
            y={margin.top}
            width={w - margin.left - margin.right}
            height={h - margin.top - margin.bottom}
            rx="8"
            fill="rgba(2,6,23,0.6)"
          />
          {/* hover row highlight behind bars (full row width) */}
          {hover != null && (
            <rect
              x={margin.left}
              y={margin.top + hover * (row + gap)}
              width={w - margin.left - margin.right}
              height={row}
              fill="rgba(229,231,235,0.85)"
            />
          )}
          {/* vertical grid */}
          {ticks.map((t, i) => (
            <line
              key={i}
              x1={margin.left + x(t)}
              x2={margin.left + x(t)}
              y1={margin.top}
              y2={h - margin.bottom}
              stroke="#374151"
              strokeDasharray="3 3"
              opacity="0.6"
            />
          ))}
          {/* horizontal grid per category */}
          {data.map((d, i) => {
            const yCenter = margin.top + i * (row + gap) + row;
            return (
              <line
                key={`hg-${i}`}
                x1={margin.left}
                x2={w - margin.right}
                y1={yCenter}
                y2={yCenter}
                stroke="#374151"
                strokeDasharray="3 3"
                opacity="0.6"
              />
            );
          })}
          {/* left vertical axis */}
          <line
            x1={margin.left}
            x2={margin.left}
            y1={margin.top}
            y2={h - margin.bottom}
            stroke="#9ca3af"
            opacity="0.5"
          />
          {ticks.map((t, i) => (
            <text
              key={`tx-${i}`}
              x={margin.left + x(t)}
              y={h - 8}
              fill="#9ca3af"
              fontSize="12"
              textAnchor="middle"
            >
              {Math.round(t)}
            </text>
          ))}
          <line
            x1={margin.left}
            x2={w - margin.right}
            y1={h - margin.bottom}
            y2={h - margin.bottom}
            stroke="#9ca3af"
            opacity="0.5"
          />
          {data.map((d, i) => {
            const y = margin.top + i * (row + gap);
            const bw = x(d.value);
            return (
              <g key={i}>
                <text
                  x={margin.left - 10}
                  y={y + row / 2}
                  fill="#ffffff"
                  fontSize="12"
                  textAnchor="end"
                  dominantBaseline="middle"
                >
                  {d.label}
                </text>
                {(() => {
                  const r = 10;
                  const rr = Math.min(r, row / 2, Math.max(0, (bw - 1) / 2));
                  const x0 = margin.left;
                  const y0 = y;
                  const x1 = x0 + bw;
                  const y1 = y0 + row;
                  // If very small width, fall back to square rect
                  if (bw <= 2) {
                    return (
                      <rect
                        x={x0}
                        y={y0}
                        width={Math.max(0, bw)}
                        height={row}
                        fill={color}
                        opacity="0.9"
                      />
                    );
                  }
                  // Path with only right corners rounded
                  const dPath = [
                    `M ${x0} ${y0}`,
                    `L ${x1 - rr} ${y0}`,
                    `Q ${x1} ${y0} ${x1} ${y0 + rr}`,
                    `L ${x1} ${y1 - rr}`,
                    `Q ${x1} ${y1} ${x1 - rr} ${y1}`,
                    `L ${x0} ${y1}`,
                    "Z",
                  ].join(" ");
                  return <path d={dPath} fill={color} opacity="0.9" />;
                })()}
              </g>
            );
          })}
        </svg>
        {hover != null && (
          <div
            className="pointer-events-none absolute"
            style={{
              left: Math.max(8, Math.min(pos.x + 8, (wrapRef.current?.clientWidth || 0) - 160)),
              top: Math.max(8, Math.min(pos.y - 40, (wrapRef.current?.clientHeight || 0) - 60)),
            }}
          >
            <div
              className="px-3 py-2 rounded-lg border text-white shadow"
              style={{ backgroundColor: "rgb(31,41,55)", borderColor: "rgb(55,65,81)" }}
            >
              <p className="m-0 text-sm font-semibold">{data[hover]?.label}</p>
              <div className="mt-1 text-xs">
                <span className="opacity-80">
                  {`$${Math.round((data[hover]?.value || 0))}M`}{" "}
                  (<span>{Math.round(((data[hover]?.value || 0) / maxX) * 100)}%</span>)
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function IncomeSourceAnalysis({
  a = { name: "Shah Rukh Khan", data: [] },
  b = { name: "Tom Cruise", data: [] },
}) {
  const aData =
    a.data.length > 0
      ? a.data
      : [
          { label: "Films", value: 300 },
          { label: "Endorsements", value: 200 },
          { label: "Businesses", value: 150 },
          { label: "Investments", value: 80 },
        ];
  const bData =
    b.data.length > 0
      ? b.data
      : [
          { label: "Films", value: 400 },
          { label: "Endorsements", value: 80 },
          { label: "Businesses", value: 90 },
          { label: "Investments", value: 50 },
        ];
  const maxX = Math.max(
    ...[...aData, ...bData].map((d) => Number(d.value || 0)),
    400
  );
  return (
    <section className="lg:px-8 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <ChartColumn className="w-6 h-6 text-[#3B82F6]" />
          <h2 className="text-3xl">Income Source Analysis</h2>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white text-xl mb-6">Income Source Breakdown</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-white mb-4">{a.name}</h4>
              <HBarChart title="" color="#ef4444" data={aData} maxX={maxX} />
            </div>
            <div>
              <h4 className="text-white mb-4">{b.name}</h4>
              <HBarChart title="" color="#3b82f6" data={bData} maxX={maxX} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
