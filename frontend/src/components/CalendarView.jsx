import { useState, useMemo } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useTasks } from '../context/TaskContext';
import { useCards } from '../context/CardContext';
import { isSameDay, startOfMonth, endOfMonth } from 'date-fns';

export default function CalendarView() {
  const [value, onChange] = useState(new Date());
  const { tasks } = useTasks();
  const { getInstancesForRange } = useCards();

  const monthInstances = useMemo(() => {
    const start = startOfMonth(value);
    const end = endOfMonth(value);
    return getInstancesForRange(start, end);
  }, [value, getInstancesForRange]);

  function tileClassName({ date, view }) {
    if (view !== 'month') return undefined;
    const hasTask = tasks.some(t => t.dueDate && isSameDay(new Date(t.dueDate), date));
    const hasCard = monthInstances.some(i => i.dueDate && isSameDay(new Date(i.dueDate), date));
    return hasTask || hasCard ? 'day-with-task' : undefined;
  }

  return (
    <div style={{ padding: 10, background: "#fff", borderRadius: 8, boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
      <Calendar onChange={onChange} value={value} tileClassName={tileClassName} />
    </div>
  );
}
