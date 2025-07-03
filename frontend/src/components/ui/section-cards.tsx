import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart3, Users2, CheckCircle2 } from "lucide-react";

interface SectionCardsProps {
  childrenCount?: number;
  totalTasks?: number;
  pendingTasks?: number;
}

export function SectionCards({ childrenCount = 0, totalTasks = 0, pendingTasks = 0 }: SectionCardsProps) {
  const stats = [
    {
      title: "Total Tasks",
      value: totalTasks.toString(),
      icon: <BarChart3 className='w-6 h-6 text-blue-500' />,
      color: "bg-blue-50",
    },
    {
      title: "Pending Tasks",
      value: pendingTasks.toString(),
      icon: <CheckCircle2 className='w-6 h-6 text-yellow-500' />,
      color: "bg-yellow-50",
    },
    {
      title: "Total Children",
      value: childrenCount.toString(),
      icon: <Users2 className='w-6 h-6 text-pink-500' />,
      color: "bg-pink-50",
    },
  ];

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4 lg:px-6'>
      {stats.map((stat, index) => (
        <Card key={index} className='rounded-2xl shadow-md'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>{stat.title}</CardTitle>
            <div className={`p-2 rounded-full ${stat.color}`}>{stat.icon}</div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
