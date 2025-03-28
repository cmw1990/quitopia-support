import React from "react";
import { cn } from "../../lib/utils";
import { Card, CardContent } from "./card";
import { DonutChart } from "./donut-chart";
import { motion } from "framer-motion";

interface SavingsCalculatorProps {
  quitDate: Date | null;
  costPerPack: number;
  packsPerDay: number;
  savings: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
    total: number;
  };
  className?: string;
}

export const SavingsCalculator = ({
  quitDate,
  costPerPack,
  packsPerDay,
  savings,
  className,
}: SavingsCalculatorProps) => {
  const daysSince = quitDate
    ? Math.floor((new Date().getTime() - quitDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const savingsItems = [
    { label: "Daily", amount: savings.daily, color: "bg-blue-100 text-blue-800" },
    { label: "Weekly", amount: savings.weekly, color: "bg-teal-100 text-teal-800" },
    { label: "Monthly", amount: savings.monthly, color: "bg-indigo-100 text-indigo-800" },
    { label: "Yearly", amount: savings.yearly, color: "bg-violet-100 text-violet-800" },
  ];

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-4">
        <div className="flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-1">Money Saved</h3>
            <p className="text-xs text-gray-500">
              Based on {formatCurrency(costPerPack)} per pack, {packsPerDay} pack(s) per day
            </p>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-gray-500">Total Saved</p>
              <p className="text-2xl font-semibold text-green-600">{formatCurrency(savings.total)}</p>
            </div>
            <DonutChart 
              value={savings.total} 
              maxValue={savings.yearly} 
              size={80} 
              strokeWidth={8} 
              gradientStart="#22c55e"
              gradientEnd="#15803d"
              centerText={`${daysSince}d`}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {savingsItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <div className="rounded-md p-2" style={{ background: item.color.split(' ')[0] }}>
                  <p className="text-xs font-medium mb-1" style={{ color: item.color.split(' ')[1] }}>
                    {item.label}
                  </p>
                  <p className="text-sm font-semibold" style={{ color: item.color.split(' ')[1] }}>
                    {formatCurrency(item.amount)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 