import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AP1_ITEMS = [
  'AP1 form completed and signed',
  'Official copies of title register obtained',
  'Transfer deed (TR1) executed',
  'SDLT return submitted (or exemption confirmed)',
  'Stamp duty payment made',
  'Land Registry fee calculated and ready',
  'Mortgage deed discharged (if applicable)',
  'ID verification for all parties completed',
  'Outstanding requisitions resolved',
  'AP1 submitted to Land Registry',
];

type Task = {
  id: string;
  label: string;
  completed: boolean;
};

export default function AP1Checklist({ matterId }: { matterId: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadTasks() {
    if (!matterId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('matter_id', matterId)
        .order('created_at');

      if (error) throw error;

      // If no tasks exist, create them
      if (!data || data.length === 0) {
        const newTasks = AP1_ITEMS.map(label => ({
          matter_id: matterId,
          label,
          completed: false,
        }));

        const { data: inserted, error: insertError } = await supabase
          .from('tasks')
          .insert(newTasks)
          .select();

        if (insertError) throw insertError;
        setTasks(inserted || []);
      } else {
        setTasks(data);
      }
    } catch (err: any) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleTask(taskId: string, completed: boolean) {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, completed } : t
      ));
    } catch (err: any) {
      console.error('Failed to update task:', err);
    }
  }

  useEffect(() => {
    loadTasks();
  }, [matterId]);

  const doneCount = tasks.filter(t => t.completed).length;

  if (loading) {
    return (
      <div className="card">
        <h2>AP1 Readiness Checklist</h2>
        <div style={{ fontSize: 14, color: '#666' }}>Loading…</div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center">
        <h2>AP1 Readiness Checklist</h2>
        <span className="text-muted">{doneCount} / {AP1_ITEMS.length}</span>
      </div>
      <ul className="checklist mt-2">
        {tasks.map((task) => (
          <li key={task.id} className={task.completed ? 'done' : ''}>
            <input
              type="checkbox"
              id={`ap1-${task.id}`}
              checked={task.completed}
              onChange={(e) => toggleTask(task.id, e.target.checked)}
            />
            <label htmlFor={`ap1-${task.id}`}>{task.label}</label>
          </li>
        ))}
      </ul>
    </div>
  );
}
