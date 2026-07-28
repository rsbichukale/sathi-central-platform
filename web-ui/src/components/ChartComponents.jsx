import React, { useRef, useEffect } from 'react';

/**
 * DonutChart — License status distribution
 * Pure SVG ring chart with animated segments
 */
export function DonutChart({ data = [], size = 200, strokeWidth = 28 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const center = size / 2;

  let cumulativePercent = 0;

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
        {data.map((segment, i) => {
          const percent = segment.value / total;
          const dashArray = `${circumference * percent} ${circumference * (1 - percent)}`;
          const dashOffset = -circumference * cumulativePercent;
          cumulativePercent += percent;

          return (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${center} ${center})`}
              style={{ transition: 'stroke-dasharray 0.8s ease, stroke-dashoffset 0.8s ease' }}
            />
          );
        })}
      </svg>
      {/* Center label */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        textAlign: 'center', lineHeight: 1.2
      }}>
        <div style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a' }}>{total}</div>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Total</div>
      </div>
    </div>
  );
}

/**
 * DonutLegend — Legend items for DonutChart
 */
export function DonutLegend({ data = [] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: d.color, flexShrink: 0 }} />
          <span style={{ color: '#475569', fontWeight: 600 }}>{d.label}</span>
          <span style={{ fontWeight: 800, color: '#0f172a' }}>{d.value}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * BarChart — Monthly registration/revenue trend
 * Pure SVG vertical bar chart with animated bars
 */
export function BarChart({ data = [], height = 180, barColor = '#059669', label = 'Count', formatValue }) {
  if (!data.length) return <div style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>No data available</div>;

  const maxVal = Math.max(...data.map(d => d.value), 1);
  const barWidth = Math.min(36, Math.max(14, (600 / data.length) - 8));
  const chartWidth = data.length * (barWidth + 8) + 40;
  const fmt = formatValue || (v => v);

  return (
    <div style={{ overflowX: 'auto', paddingBottom: '8px' }}>
      <svg width={Math.max(chartWidth, 300)} height={height + 40} style={{ display: 'block', margin: '0 auto' }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
          <line
            key={i}
            x1="30" y1={height - height * pct + 10}
            x2={chartWidth} y2={height - height * pct + 10}
            stroke="#f1f5f9" strokeWidth="1"
          />
        ))}
        {/* Bars */}
        {data.map((d, i) => {
          const barHeight = (d.value / maxVal) * (height - 20);
          const x = 40 + i * (barWidth + 8);
          const y = height - barHeight + 10;
          return (
            <g key={i}>
              <rect
                x={x} y={y}
                width={barWidth}
                height={barHeight}
                rx="4"
                fill={d.color || barColor}
                opacity="0.85"
                style={{ transition: 'height 0.6s ease, y 0.6s ease' }}
              >
                <title>{d.label}: {fmt(d.value)}</title>
              </rect>
              {/* Value label on top */}
              {d.value > 0 && (
                <text
                  x={x + barWidth / 2} y={y - 6}
                  textAnchor="middle"
                  style={{ fontSize: '10px', fontWeight: 700, fill: '#475569' }}
                >
                  {fmt(d.value)}
                </text>
              )}
              {/* Month label */}
              <text
                x={x + barWidth / 2} y={height + 26}
                textAnchor="middle"
                style={{ fontSize: '10px', fontWeight: 600, fill: '#94a3b8' }}
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/**
 * SparkLine — Minimal trend line for inline stat display
 * Pure Canvas sparkline
 */
export function SparkLine({ data = [], width = 120, height = 36, color = '#059669' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    const step = width / (data.length - 1 || 1);
    const padding = 4;
    const chartH = height - padding * 2;

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, color + '33');
    gradient.addColorStop(1, color + '05');

    // Draw filled area
    ctx.beginPath();
    ctx.moveTo(0, height);
    data.forEach((v, i) => {
      const x = i * step;
      const y = padding + chartH - ((v - min) / range) * chartH;
      if (i === 0) ctx.lineTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw line
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = i * step;
      const y = padding + chartH - ((v - min) / range) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();

    // End dot
    const lastX = (data.length - 1) * step;
    const lastY = padding + chartH - ((data[data.length - 1] - min) / range) * chartH;
    ctx.beginPath();
    ctx.arc(lastX, lastY, 3, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
  }, [data, width, height, color]);

  return <canvas ref={canvasRef} style={{ width, height, display: 'block' }} />;
}

/**
 * ActivityHeatmap — 7-day activity grid
 */
export function ActivityHeatmap({ data = [], color = '#059669' }) {
  if (!data.length) return null;
  const max = Math.max(...data.map(d => d.value), 1);

  return (
    <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', justifyContent: 'center' }}>
      {data.map((d, i) => {
        const intensity = d.value / max;
        const bg = intensity === 0
          ? '#f1f5f9'
          : `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, ${0.15 + intensity * 0.85})`;
        return (
          <div
            key={i}
            title={`${d.label}: ${d.value} events`}
            style={{
              width: '28px', height: '28px', borderRadius: '5px', background: bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '9px', fontWeight: 700, color: intensity > 0.5 ? '#fff' : '#94a3b8',
              cursor: 'default', transition: 'transform 0.15s',
            }}
            onMouseEnter={e => e.target.style.transform = 'scale(1.15)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
          >
            {d.shortLabel || ''}
          </div>
        );
      })}
    </div>
  );
}

/**
 * MiniStatCard — Small stat with sparkline
 */
export function MiniStatCard({ icon, label, value, trend = [], trendColor, suffix = '' }) {
  return (
    <div className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
          {icon} {label}
        </div>
        <div style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
          {value}{suffix && <span style={{ fontSize: '14px', fontWeight: 700, color: '#94a3b8' }}> {suffix}</span>}
        </div>
      </div>
      {trend.length > 1 && (
        <SparkLine data={trend} color={trendColor || '#059669'} />
      )}
    </div>
  );
}
