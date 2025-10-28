import { useDroppable } from "@dnd-kit/core";
import {
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  format,
  isSameDay,
  parseISO
} from "date-fns";
import { useState } from "react";
import DraggableTask from "./DraggableTask";

function DroppableDay({ day, tasks }) {
  // Local day id, avoids UTC day-shift bugs
  const droppableId = format(day, "yyyy-MM-dd");
  const { isOver, setNodeRef } = useDroppable({ id: droppableId });

  return (
    <div
      ref={setNodeRef}
      style={{
        border: isOver ? "2px dashed #1976d2" : "1px solid #eee",
        background: isOver ? "#eef6ff" : "#fcfcfc",
        padding: 10,
        minHeight: 200,
        display: "flex",
        flexDirection: "column",
        borderRadius: 8
      }}
    >
      <strong style={{ textAlign: "center" }}>{format(day, "EEE")}</strong>
      <p style={{ fontSize: "0.9em", color: "#777", margin: "4px 0 10px 0", textAlign: "center" }}>
        {format(day, "d")}
      </p>
      <div style={{ flex: 1 }}>
        {tasks.map((task) => (
          <DraggableTask key={task._id} task={task} />
        ))}
      </div>
    </div>
  );
}

export default function Timeline({ tasks }) {
  const [currentDate] = useState(new Date());
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  return (
    <div style={{ background: "#fff", padding: 15, borderRadius: 8, boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
        {daysInWeek.map((day) => {
          const tasksForDay = tasks.filter(
            (t) => t.dueDate && isSameDay(parseISO(t.dueDate), day)
          );
          return <DroppableDay key={day.getTime()} day={day} tasks={tasksForDay} />;
        })}
      </div>
    </div>
  );
}
