import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TooltipProps } from 'recharts';
import { Dumbbell } from 'lucide-react';
import type { WeeklyActivityPoint } from '@shared/types';
import { cn } from '@/lib/utils';

interface WeeklyActivityChartProps {
  data: WeeklyActivityPoint[];
}

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload as WeeklyActivityPoint;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
      <p className="mb-1 font-medium capitalize">{point.giornoLabel}</p>
      <p className="text-muted-foreground">
        Pasti: {point.pastiCompletati}/{point.pastiTotali}
      </p>
      <p className={cn('flex items-center gap-1', point.allenamenti > 0 ? 'text-primary' : 'text-muted-foreground')}>
        <Dumbbell className="h-3 w-3" /> {point.allenamenti > 0 ? 'Allenamento svolto' : 'Giorno di riposo'}
      </p>
    </div>
  );
}

export function WeeklyActivityChart({ data }: WeeklyActivityChartProps) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="giornoLabel" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            allowDecimals={false}
            domain={[0, (data[0]?.pastiTotali ?? 6) || 6]}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--secondary))' }} />
          <Bar dataKey="pastiCompletati" radius={[4, 4, 0, 0]} maxBarSize={36}>
            {data.map((point) => (
              <Cell
                key={point.data}
                fill={point.allenamenti > 0 ? 'hsl(var(--primary))' : 'hsl(var(--muted))'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-1 flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-primary" /> giorno con allenamento
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-muted" /> giorno di riposo
        </span>
        <span>(altezza barra = pasti completati)</span>
      </div>
    </div>
  );
}
