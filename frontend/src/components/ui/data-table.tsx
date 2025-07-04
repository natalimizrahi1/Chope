import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";

type TableRow = {
  id: number;
  taskId: string;
  header: string;
  description: string;
  type: string;
  status: string;
  target: string;
  limit: string;
  reviewer: string;
};

interface Props {
  data: TableRow[];
  onApproveTask: (taskId: string) => void;
  onReloadTasks: () => void;
  onViewDetails: (taskId: string) => void;
}

export function DataTable({ data, onApproveTask, onReloadTasks, onViewDetails }: Props) {
  return (
    <div className='overflow-x-auto'>
      <table className='w-full text-sm'>
        <thead>
          <tr className='border-b border-gray-200'>
            <th className='p-4 text-left font-semibold text-gray-900 bg-gray-50 rounded-tl-lg'>Task</th>
            <th className='p-4 text-left font-semibold text-gray-900 bg-gray-50'>Category</th>
            <th className='p-4 text-left font-semibold text-gray-900 bg-gray-50'>Reward</th>
            <th className='p-4 text-left font-semibold text-gray-900 bg-gray-50'>Child</th>
            <th className='p-4 text-left font-semibold text-gray-900 bg-gray-50'>Status</th>
            <th className='p-4 text-left font-semibold text-gray-900 bg-gray-50'>Date</th>
            <th className='p-4 text-right font-semibold text-gray-900 bg-gray-50 rounded-tr-lg'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={row.taskId} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index === data.length - 1 ? "rounded-b-lg" : ""}`}>
              <td className='p-4 font-medium text-gray-900 text-left'>{row.header}</td>
              <td className='p-4'>
                <span className='px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700'>{row.type}</span>
              </td>
              <td className='p-4 font-medium text-gray-900'>{row.target} coins</td>
              <td className='p-4 text-gray-600'>{row.limit}</td>
              <td className='p-4'>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${row.status === "Approved" ? "bg-green-100 text-green-700" : row.status === "Completed" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-700"}`}>{row.status}</span>
              </td>
              <td className='p-2 text-gray-600'>{row.reviewer}</td>
              <td className='p-0 text-right space-x-2'>
                {row.status === "Completed" && (
                  <Button size='icon' onClick={() => onApproveTask(row.taskId)} className='bg-green-600 hover:bg-green-700 text-white p-0 w-7 h-7'>
                    <CheckIcon className='w-4 h-4' />
                  </Button>
                )}
                <Button size='sm' variant='outline' onClick={() => onViewDetails(row.taskId)} className='border-gray-300 hover:bg-gray-50'>
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
