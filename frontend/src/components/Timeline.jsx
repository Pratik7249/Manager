import { useDroppable } from "@dnd-kit/core";
import { eachDayOfInterval, startOfWeek, endOfWeek, format, isSameDay, parseISO } from 'date-fns';
import { useState } from 'react';
import DraggableTask from './DraggableTask';

function DroppableDay({ day, tasks }) {
  const { isOver, setNodeRef } = useDroppable({
    id: day.toISOString().split('T')[0],
  });

  const style = {
    border: isOver ? '2px dashed #007bff' : '1px solid #eee',
    background: isOver ? '#eef' : '#fcfcfc',
    padding: 10,
    minHeight: 200,
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <div ref={setNodeRef} style={style}>
      <strong style={{ textAlign: 'center' }}>{format(day, 'EEE')}</strong>
      <p style={{ fontSize: '0.9em', color: '#777', margin: '4px 0 10px 0', textAlign: 'center' }}>{format(day, 'd')}</p>
      <div style={{ flex: 1 }}>
        {tasks.map(task => (
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
    <div style={{ background: '#fff', padding: 15, borderRadius: 8, boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
      <h3 style={{ marginTop: 0 }}>This Week's Timeline</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
        {daysInWeek.map(day => {
          const tasksForDay = tasks.filter(task =>
            task.dueDate && isSameDay(parseISO(task.dueDate), day)
          );
          return (
            <DroppableDay key={day.toISOString()} day={day} tasks={tasksForDay} />
          );
        })}
      </div>
    </div>
  );
}
