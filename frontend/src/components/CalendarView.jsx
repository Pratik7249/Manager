// src/components/CalendarView.jsx
import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Import default styling
import { useTasks } from '../context/TaskContext';
import { isSameDay, parseISO } from 'date-fns';

export default function CalendarView() {
  const [value, onChange] = useState(new Date());
  const { tasks } = useTasks();

  // This function adds a class to days that have tasks
  function tileClassName({ date, view }) {
    // Add class only in month view
    if (view === 'month') {
      // Check if any task is due on this date
      const hasTask = tasks.some(task => 
        task.dueDate && isSameDay(parseISO(task.dueDate), date)
      );
      if (hasTask) {
        return 'day-with-task'; // You can style .day-with-task in App.css
      }
    }
  }

  return (
    <div style={{ padding: 10, background: "#fff", borderRadius: 8, boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
      <Calendar
        onChange={onChange}
        value={value}
        tileClassName={tileClassName}
      />
    </div>
  );
}

// --- Add this to src/App.css (or index.css) ---
/*
.day-with-task {
  background-color: #f0e68c; 
  border-radius: 50%;
}
*/