"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatLabel } from "@/lib/utils";

interface TagChartProps {
  data: Record<string, number>;
  title?: string;
  colors?: string[];
}

const DEFAULT_COLORS = ["#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe"];

export function TagChart({
  data,
  title = "ATC Tags Distribution",
  colors = DEFAULT_COLORS,
}: TagChartProps) {
  const chartData = Object.entries(data)
    .map(([key, value]) => ({
      name: formatLabel(key),
      count: value,
    }))
    .sort((a, b) => b.count - a.count);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const total = chartData.reduce((sum, item) => sum + item.count, 0);
      const percentage = ((payload[0].value / total) * 100).toFixed(1);
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">
            {payload[0].payload.name}
          </p>
          <p className="text-sm text-blue-600">
            Contacts:{" "}
            <span className="font-bold">
              {payload[0].value.toLocaleString()}
            </span>
          </p>
          <p className="text-xs text-gray-500">{percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                angle={-30}
                textAnchor="end"
                height={100}
                interval={0}
                tickMargin={8}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="count"
                radius={[8, 8, 0, 0]}
                animationBegin={0}
                animationDuration={1000}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
