import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface IncomeChartProps {
  incomeA: number;
  incomeB: number;
  percentageA: number;
  percentageB: number;
}

const COLORS = ['#3b82f6', '#ec4899']; // Azul para A, Rosa para B

export const IncomeChart: React.FC<IncomeChartProps> = ({ incomeA, incomeB, percentageA, percentageB }) => {
  const data = [
    { name: 'Pessoa A', value: incomeA, percent: percentageA },
    { name: 'Pessoa B', value: incomeB, percent: percentageB },
  ];

  if (incomeA <= 0 && incomeB <= 0) {
    return (
      <div className="h-64 w-full flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
        <p className="text-slate-400 text-sm font-