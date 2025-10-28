import { useTasks } from '../context/TaskContext';
import { useCards } from '../context/CardContext';
import { addDays, formatDistanceToNow, parseISO } from 'date-fns';

export default function UpcomingTasks() {
  const { tasks, openTaskModal } = useTasks();
  const cardsCtx = useCards?.();
  const getInstancesForRange = cardsCtx?.getInstancesForRange;

  const start = new Date();
  const end = addDays(start, 30);
  const cardInst = typeof getInstancesForRange === "function"
    ? getInstancesForRange(start, end)
    : [];

  const upcoming = [
    ...tasks.filter(t => !t.completed && t.dueDate),
    ...cardInst.filter(i => !i.completed && i.dueDate)
  ].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  return (
    <div style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
      <h3 style={{ marginTop: 0 }}>Upcoming Deadlines</h3>
      {upcoming.length === 0 ? (
        <p style={{ fontSize: '0.9em', color: '#777' }}>No upcoming deadlines!</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {upcoming.slice(0, 10).map(item => (
            <li
              key={item._id}
              style={{ fontSize: '0.95em', borderBottom: '1px solid #eee', paddingBottom: 8, cursor: 'pointer' }}
              onClick={() => openTaskModal(item)}
            >
              <strong style={{ color: '#333' }}>{item.title}</strong>
              <p style={{ margin: '4px 0 0 0', color: '#dc3545', fontWeight: 'bold' }}>
                {formatDistanceToNow(parseISO(item.dueDate), { addSuffix: true })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
