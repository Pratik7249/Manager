import { useDraggable } from "@dnd-kit/core";
import { useTasks } from "../context/TaskContext";

export default function DraggableTask({ task }) {
  const { openTaskModal } = useTasks();
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: task._id });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 100 }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        padding: '8px 12px',
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: 5,
        marginBottom: 8,
        fontSize: '0.9em',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        userSelect: 'none',
        touchAction: 'none',    // better touch behaviour
        willChange: 'transform' // smoother drag
      }}
      {...attributes}
      {...listeners}
      onClick={() => openTaskModal(task)}  // click = open popup
    >
      {task.title}
    </div>
  );
}
