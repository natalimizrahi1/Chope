import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface Props {
  data: ChartData[];
  rightData?: ChartData[];
  title: string;
  description: string;
  rightTitle?: string;
  rightDescription?: string;
}

export function ChartPieInteractive({ data, rightData, title, description, rightTitle, rightDescription }: Props) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
      <Card className='rounded-2xl shadow-md'>
        <CardHeader>
          <CardTitle className='text-lg font-semibold'>{title}</CardTitle>
          <p className='text-sm text-gray-500'>{description}</p>
        </CardHeader>
        <CardContent className='h-[300px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <PieChart>
              <Tooltip />
              <Pie data={data} dataKey='value' nameKey='name' outerRadius={80} innerRadius={40} paddingAngle={5}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {rightData && (
        <Card className='rounded-2xl shadow-md'>
          <CardHeader>
            <CardTitle className='text-lg font-semibold'>{rightTitle}</CardTitle>
            <p className='text-sm text-gray-500'>{rightDescription}</p>
          </CardHeader>
          <CardContent className='h-[300px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                <Tooltip />
                <Pie data={rightData} dataKey='value' nameKey='name' outerRadius={80} innerRadius={40} paddingAngle={5}>
                  {rightData.map((entry, index) => (
                    <Cell key={`cell-right-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
