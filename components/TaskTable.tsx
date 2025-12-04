import React from 'react';
import { Plus, Trash2, CheckCircle2, Circle, Clock } from 'lucide-react';
import { Task } from '../types';

interface TaskTableProps {
  tasks: Task[];
  onChange: (tasks: Task[]) => void;
  onGenerateAI?: () => void;
  isGenerating?: boolean;
}

export const TaskTable: React.FC<TaskTableProps> = ({ tasks, onChange, onGenerateAI, isGenerating }) => {
  const addTask = () => {
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: '',
      owner: '',
      status: 'Pending',
      dueDate: new Date().toISOString().split('T')[0],
    };
    onChange([...tasks, newTask]);
  };

  const updateTask = (id: string, field: keyof Task, value: string) => {
    onChange(tasks.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const removeTask = (id: string) => {
    onChange(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-700">Related Tasks</label>
        <div className="flex space-x-2">
          {onGenerateAI && (
            <button
              type="button"
              onClick={onGenerateAI}
              disabled={isGenerating}
              className="text-xs flex items-center px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:opacity-50"
            >
              {isGenerating ? 'Thinking...' : '✨ Suggest Tasks'}
            </button>
          )}
          <button
            type="button"
            onClick={addTask}
            className="text-xs flex items-center px-2 py-1 bg-slate-100 text-slate-700 rounded hover:bg-slate-200"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Manually
          </button>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="text-sm text-slate-400 italic text-center py-4 border-2 border-dashed border-slate-200 rounded-lg">
          No tasks added yet.
        </div>
      ) : (
        <div className="overflow-hidden border border-slate-200 rounded-lg">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase w-1/2">Task</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase">Owner</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase">Due</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td className="px-3 py-2">
                    <select
                      value={task.status}
                      onChange={(e) => updateTask(task.id, 'status', e.target.value)}
                      className="text-xs border-none bg-transparent focus:ring-0 cursor-pointer font-medium"
                      style={{
                        color: task.status === 'Completed' ? '#16a34a' : task.status === 'In Progress' ? '#ca8a04' : '#64748b'
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={task.title}
                      onChange={(e) => updateTask(task.id, 'title', e.target.value)}
                      placeholder="Task description"
                      className="w-full text-sm border-0 border-b border-transparent focus:border-indigo-500 focus:ring-0 px-0 py-1"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={task.owner}
                      onChange={(e) => updateTask(task.id, 'owner', e.target.value)}
                      placeholder="Unassigned"
                      className="w-full text-sm bg-slate-50 rounded px-2 py-1"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="date"
                      value={task.dueDate}
                      onChange={(e) => updateTask(task.id, 'dueDate', e.target.value)}
                      className="text-xs text-slate-600 border-none focus:ring-0"
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => removeTask(task.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};