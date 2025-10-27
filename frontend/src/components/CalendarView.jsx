import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useTasks } from '../context/TaskContext';
import { isSameDay, parseISO } from 'date-fns';

export default function CalendarView() {
  const [value, onChange] = useState(new Date());
  const { tasks } = useTasks();

  function tileClassName({ date, view }) {
    if (view === 'month') {
      const hasTask = tasks.some(
        (t) => t.dueDate && isSameDay(parseISO(t.dueDate), date)
      );
      if (hasTask) return 'day-with-task';
    }
    return undefined;
  }

  return (
    <div style={{ padding: 10, background: "#fff", borderRadius: 8, boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
      <Calendar value={value} onChange={onChange} tileClassName={tileClassName} />
    </div>
  );
}
