import type { AnalyticsPoint } from "@/lib/types";

export function BarChart({
  points,
  height = 180,
  showClicks = true,
  compact = false,
}: {
  points: AnalyticsPoint[];
  height?: number;
  showClicks?: boolean;
  compact?: boolean;
}) {
  const max = Math.max(...points.map((point) => point.views), ...points.map((point) => point.clicks), 1);

  return (
    <div>
      <div className="flex items-end gap-1.5 sm:gap-2" style={{ height }}>
        {points.map((point) => {
          const viewsH = Math.max((point.views / max) * 100, point.views > 0 ? 3 : 0);
          const clicksH = Math.max((point.clicks / max) * 100, point.clicks > 0 ? 2 : 0);
          return (
            <div key={point.date} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
              <div className="flex h-full w-full items-end justify-center gap-[3px]">
                <div
                  className="w-full max-w-[16px] rounded-t-md bg-grape/85 transition-all hover:bg-grape"
                  style={{ height: `${viewsH}%` }}
                  title={`${point.views} views on ${point.date}`}
                />
                {showClicks ? (
                  <div
                    className="w-full max-w-[16px] rounded-t-md bg-chartreuse transition-all hover:brightness-95"
                    style={{ height: `${clicksH}%` }}
                    title={`${point.clicks} clicks on ${point.date}`}
                  />
                ) : null}
              </div>
              {!compact ? <span className="text-[9.5px] font-medium text-shade/55">{point.label}</span> : null}
            </div>
          );
        })}
      </div>
      {showClicks ? (
        <div className="mt-3 flex items-center justify-center gap-5 text-[10.5px] font-medium text-shade/60">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-grape" /> Views
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-chartreuse" /> Clicks
          </span>
        </div>
      ) : null}
    </div>
  );
}
