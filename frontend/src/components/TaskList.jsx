// src/components/TaskList.jsx
import DraggableTask from "./DraggableTask";
import { useDroppable } from "@dnd-kit/core";

export default function TaskList({ tasks }) { // Receives unscheduled tasks
  const { setNodeRef, isOver } = useDroppable({
    id: 'unscheduled', // This is the ID for the "Unscheduled" drop zone
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        padding: 15,
        background: isOver ? '#ffebeb' : '#fff',
        border: isOver ? '2px dashed #dc3545' : '1px solid #eee',
        borderRadius: 8,
        minHeight: 200,
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
      }}
    >
      {tasks.length === 0 && (
        <p style={{ color: '#777', textAlign: 'center' }}>
          No unscheduled tasks. Drag tasks from the timeline here to unschedule them.
        </p>
      )}
      {tasks.map((task) => (
        // Use DraggableTask instead of TaskCard
        <DraggableTask key={task._id} task={task} />
      ))}
    </div>
  );
}