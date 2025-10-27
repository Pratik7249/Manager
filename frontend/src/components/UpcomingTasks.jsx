import { useTasks } from '../context/TaskContext';
import { formatDistanceToNow, parseISO } from 'date-fns';

export default function UpcomingTasks() {
  const { tasks, openTaskModal } = useTasks();

  const upcoming = tasks
    .filter(t => !t.completed && t.dueDate)
    .sort((a, b) => parseISO(a.dueDate) - parseISO(b.dueDate));

  return (
    <div style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
      <h3 style={{ marginTop: 0 }}>Upcoming Deadlines</h3>
      {upcoming.length === 0 ? (
        <p style={{ fontSize: '0.9em', color: '#777' }}>No upcoming deadlines!</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {upcoming.slice(0, 7).map(task => (
            <li key={task._id} style={{ fontSize: '0.95em', borderBottom: '1px solid #eee', paddingBottom: 8, cursor: 'pointer' }}
                onClick={() => openTaskModal(task)}>
              <strong style={{ color: '#333' }}>{task.title}</strong>
              <p style={{ margin: '4px 0 0 0', color: '#dc3545', fontWeight: 'bold' }}>
                {formatDistanceToNow(parseISO(task.dueDate), { addSuffix: true })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
