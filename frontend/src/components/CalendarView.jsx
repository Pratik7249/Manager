// src/components/CalendarView.jsx
import { useState, useMemo } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useTasks } from "../context/TaskContext";
import { isSameDay, parseISO } from "date-fns";

// Small card with a mini month view and task dots
export default function CalendarView() {
  const [value, onChange] = useState(new Date());
  const { tasks, openTaskModal } = useTasks();

  // Build a quick lookup by day string for highlighting
  const dots = useMemo(() => {
    const map = new Map();
    tasks.forEach((t) => {
      if (!t.dueDate) return;
      const d = parseISO(t.dueDate);
      const key = d.toDateString();
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, [tasks]);

  return (
    <div
      style={{
        padding: 12,
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
      }}
    >
      <Calendar
        onChange={onChange}
        value={value}
        tileContent={({ date, view }) =>
          view === "month" && dots.has(date.toDateString()) ? (
            <div
              title={`${dots.get(date.toDateString())} task(s)`}
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#1976d2",
                margin: "4px auto 0",
              }}
            />
          ) : null
        }
        onClickDay={(day) => {
          // open the first task of that day (if any) in the modal
          const t = tasks.find((t) => t.dueDate && isSameDay(parseISO(t.dueDate), day));
          if (t) openTaskModal(t);
        }}
      />
    </div>
  );
}
