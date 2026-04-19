import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { CHART_COLORS } from '@wellink/ui';

type RoasDatum = {
  name: string;
  value: number;
  color: string;
};

type ROASChartProps = {
  data: RoasDatum[];
};

export default function ROASChart({ data }: ROASChartProps) {
  return (
    <div role="img" aria-label="ROAS 비교 차트" style={{ width: '100%', height: '100%' }}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_COLORS.grid} />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fontWeight: 700, fill: CHART_COLORS.axisLabel }}
          dy={10}
        />
        <YAxis hide />
        <Tooltip
          cursor={{ fill: 'transparent' }}
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg bg-slate-900 p-2 text-xs font-bold text-white shadow-xl">
                  {`${payload[0].value}%`}
                </div>
              );
            }
            return null;
          }}
        />
        <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={60}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
    </div>
  );
}
