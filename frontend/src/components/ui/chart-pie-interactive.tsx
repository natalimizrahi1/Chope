import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

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
    <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-4'>
      <div className='flex flex-col items-center justify-between mb-4'>
        <h3 className='text-sm font-bold text-gray-900'>{title}</h3>
        <p className='text-sm text-gray-600'>{description}</p>
      </div>
      <div className='flex flex-row items-center justify-center gap-8'>
        {/* Compact Legend */}
        <div className='min-w-[90px] text-left'>
          {data.map((item, index) => (
            <div key={index} className='flex items-center gap-2 mb-1'>
              <div className='w-3 h-3 rounded-full' style={{ backgroundColor: item.color }} />
              <p className='text-xs font-medium text-gray-900 truncate'>{item.name}</p>
              <p className='text-xs text-gray-600'>{item.value}</p>
            </div>
          ))}
        </div>
        {/* Pie Chart */}
        <div className='h-[150px] w-[140px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <PieChart>
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  fontSize: "12px",
                }}
              />
              <Pie data={data} dataKey='value' nameKey='name' outerRadius={60} innerRadius={30} paddingAngle={2}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
