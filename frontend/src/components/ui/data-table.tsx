import { Button } from "@/components/ui/button";

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
    <div className='overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white/80 backdrop-blur p-4 mx-4 lg:mx-6'>
      <table className='min-w-full text-sm'>
        <thead>
          <tr className='text-left bg-[#fbbdcb]/30 text-[#23326a]'>
            <th className='p-3 font-semibold'>Task</th>
            <th className='p-3 font-semibold'>Description</th>
            <th className='p-3 font-semibold'>Category</th>
            <th className='p-3 font-semibold'>Reward</th>
            <th className='p-3 font-semibold'>Child</th>
            <th className='p-3 font-semibold'>Status</th>
            <th className='p-3 font-semibold'>Date</th>
            <th className='p-3 font-semibold text-right'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.taskId} className='border-b last:border-b-0 hover:bg-[#fcf7f9]'>
              <td className='p-3'>{row.header}</td>
              <td className='p-3'>{row.description}</td>
              <td className='p-3'>{row.type}</td>
              <td className='p-3'>{row.target}</td>
              <td className='p-3'>{row.limit}</td>
              <td className='p-3'>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === "Approved" ? "bg-green-100 text-green-700" : row.status === "Completed" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"}`}>{row.status}</span>
              </td>
              <td className='p-3'>{row.reviewer}</td>
              <td className='p-3 text-right space-x-1'>
                {row.status === "Completed" && (
                  <Button size='sm' variant='default' onClick={() => onApproveTask(row.taskId)}>
                    Approve
                  </Button>
                )}
                <Button size='sm' variant='ghost' onClick={() => onViewDetails(row.taskId)}>
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
