"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export interface StudyChartPoint {
  date: string; // dd/MM
  minutes: number;
}

export function StudyChart({ data }: { data: StudyChartPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Minutos Estudados (últimos 7 dias)</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#adc6ff" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#adc6ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3449" vertical={false} />
            <XAxis dataKey="date" stroke="#c2c6d6" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#c2c6d6" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                background: "#171f33",
                border: "1px solid #424754",
                borderRadius: 8,
                color: "#dbe2fd",
              }}
            />
            <Area type="monotone" dataKey="minutes" stroke="#adc6ff" fill="url(#xpGradient)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
