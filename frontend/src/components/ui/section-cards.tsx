import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart3, Users2, CheckCircle2, Coins } from "lucide-react";

interface SectionCardsProps {
  childrenCount?: number;
  totalTasks?: number;
  pendingTasks?: number;
  totalCoinsGiven?: number;
}

export function SectionCards({ childrenCount = 0, totalTasks = 0, pendingTasks = 0, totalCoinsGiven = 0 }: SectionCardsProps) {
  const stats = [
    {
      title: "Total Tasks",
      value: totalTasks.toString(),
      icon: <BarChart3 className='w-4 h-4 text-blue-600' />,
      color: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-600",
    },
    {
      title: "Pending Tasks",
      value: pendingTasks.toString(),
      icon: <CheckCircle2 className='w-4 h-4 text-amber-600' />,
      color: "bg-amber-50",
      borderColor: "border-amber-200",
      textColor: "text-amber-600",
    },
    {
      title: "Total Children",
      value: childrenCount.toString(),
      icon: <Users2 className='w-4 h-4 text-pink-600' />,
      color: "bg-pink-50",
      borderColor: "border-pink-200",
      textColor: "text-pink-600",
    },
    {
      title: "Coins Given",
      value: totalCoinsGiven.toString(),
      icon: <Coins className='w-4 h-4 text-green-600' />,
      color: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-600",
    },
  ];

  return (
    <>
      {stats.map((stat, index) => (
        <Card key={index} className='bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-0 pt-3 gap-2'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0'>
            <CardTitle className='text-sm font-bold text-black'>{stat.title}</CardTitle>
            <div className={`rounded-lg ${stat.color} ${stat.borderColor} border p-1`}>{stat.icon}</div>
          </CardHeader>
          <CardContent className='p-0 pl-8 text-left'>
            <div className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</div>
            <p className='text-xs text-gray-500'>Last updated</p>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
