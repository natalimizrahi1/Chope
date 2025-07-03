"use client";

import * as React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { CheckCircle, Clock, XCircle } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];

export const description = "An interactive pie chart with padding angle";

// Sample data - this will be replaced with real data from props
const defaultData = [
  { name: "Tasks Sent", value: 0, color: "#3B82F6" },
  { name: "Pending Approval", value: 0, color: "#FFBB28" },
  { name: "Approved Tasks", value: 0, color: "#00C49F" },
];

const defaultRightData = [
  { name: "Coins Given by Parent", value: 0, color: "#FFD700" },
  { name: "Total Children Coins", value: 0, color: "#4ECDC4" },
];

interface ChartPieInteractiveProps {
  data?: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  rightData?: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  title?: string;
  description?: string;
  rightTitle?: string;
  rightDescription?: string;
}

export function ChartPieInteractive({ data = defaultData, rightData = defaultRightData, title = "Task Distribution", description = "Overview of task completion status", rightTitle = "Coins Overview", rightDescription = "Overview of coins earned and spent" }: ChartPieInteractiveProps) {
  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Left Chart */}
          <div className='flex flex-col items-center'>
            <h4 className='font-semibold text-lg mb-4'>{title}</h4>
            <div className='h-[300px] w-full flex items-center justify-center'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie data={data} cx='50%' cy='50%' innerRadius={60} outerRadius={80} fill='#8884d8' paddingAngle={5} dataKey='value'>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Chart */}
          <div className='flex flex-col items-center'>
            <h4 className='font-semibold text-lg mb-4'>{rightTitle}</h4>
            <div className='h-[300px] w-full flex items-center justify-center'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie data={rightData} cx='50%' cy='50%' innerRadius={60} outerRadius={80} fill='#8884d8' paddingAngle={5} dataKey='value'>
                    {rightData.map((entry, index) => (
                      <Cell key={`cell-right-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Legends positioned below charts */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6'>
          {/* Left Chart Legend */}
          <div className='flex justify-center'>
            <div className='space-y-2 w-full max-w-xs'>
              {data.map((item, index) => {
                // Get icon based on task type
                const getIcon = (name: string) => {
                  if (name.includes("Tasks Sent")) return <div className='w-4 h-4 text-blue-600'>📤</div>;
                  if (name.includes("Pending")) return <Clock className='w-4 h-4 text-yellow-600' />;
                  if (name.includes("Approved")) return <CheckCircle className='w-4 h-4 text-green-600' />;
                  return <div className='w-4 h-4 rounded-full' style={{ backgroundColor: item.color }} />;
                };

                return (
                  <div key={index} className='flex items-center gap-3 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors'>
                    <div className='w-3 h-3 rounded-full border border-white shadow-sm' style={{ backgroundColor: item.color }} />
                    <div className='flex-1 flex items-center gap-2'>
                      {getIcon(item.name)}
                      <div>
                        <div className='font-medium text-xs'>{item.name}</div>
                        <div className='text-xs text-muted-foreground'>
                          {item.value} ({((item.value / data.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1)}%)
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Chart Legend */}
          <div className='flex justify-center'>
            <div className='space-y-2 w-full max-w-xs'>
              {rightData.map((item, index) => {
                // Get icon based on coin type
                const getIcon = (name: string) => {
                  if (name.includes("Given by Parent")) return <div className='w-4 h-4 text-yellow-600'>🎁</div>;
                  if (name.includes("Children Coins")) return <div className='w-4 h-4 text-green-600'>👶</div>;
                  return <div className='w-4 h-4 rounded-full' style={{ backgroundColor: item.color }} />;
                };

                return (
                  <div key={index} className='flex items-center gap-3 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors'>
                    <div className='w-3 h-3 rounded-full border border-white shadow-sm' style={{ backgroundColor: item.color }} />
                    <div className='flex-1 flex items-center gap-2'>
                      {getIcon(item.name)}
                      <div>
                        <div className='font-medium text-xs'>{item.name}</div>
                        <div className='text-xs text-muted-foreground'>
                          {item.value} coins ({((item.value / rightData.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1)}%)
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
