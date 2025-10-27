import { useTasks } from "../context/TaskContext";
import { formatDistanceToNow, isPast, parseISO } from 'date-fns';

export default function TaskCard({ task }) {
  const { updateTask, deleteTask, toggleSubTask } = useTasks();

  const handleToggle = () => updateTask(task._id, { completed: !task.completed });
  const handleDelete = () => deleteTask(task._id);
  const handleSubtaskToggle = (subTaskId, currentCompleted) =>
    toggleSubTask(task._id, subTaskId, !currentCompleted);

  let dueDateInfo = null;
  if (task.dueDate) {
    const date = parseISO(task.dueDate);
    if (isPast(date) && !task.completed) {
      dueDateInfo = <p style={{ color: "red", margin: "5px 0" }}>Overdue</p>;
    } else if (!task.completed) {
      dueDateInfo = <p style={{ color: "#555", margin: "5px 0" }}>
        Due {formatDistanceToNow(date, { addSuffix: true })}
      </p>;
    }
  }

  return (
    <div style={{ border: "1px solid #ccc", borderRadius: 8, padding: 15, marginBottom: 10, backgroundColor: task.completed ? "#e9fde9" : "#fff" }}>
      <h3 style={{ marginTop: 0, textDecoration: task.completed ? "line-through" : "none" }}>{task.title}</h3>
      <p>{task.description}</p>
      {dueDateInfo}

      {task.subTasks?.length > 0 && (
        <div style={{ margin: "15px 0", borderTop: "1px solid #eee", paddingTop: 10 }}>
          <h5 style={{ margin: "0 0 5px 0" }}>Minor Tasks:</h5>
          <ul style={{ listStyle: "none", paddingLeft: 0, margin: 0 }}>
            {task.subTasks.map((sub) => (
              <li key={sub._id} style={{ textDecoration: sub.completed ? "line-through" : "none", color: sub.completed ? "#888" : "#000" }}>
                <input
                  type="checkbox"
                  checked={sub.completed}
                  onChange={() => handleSubtaskToggle(sub._id, sub.completed)}
                  style={{ marginRight: 8 }}
                />
                {sub.text}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button onClick={handleToggle} style={{ background: task.completed ? "#ffc107" : "#28a745", color: "#fff", border: "none", padding: "8px 12px", borderRadius: 5 }}>
        {task.completed ? "Mark as Incomplete" : "Mark as Done"}
      </button>
      <button onClick={handleDelete} style={{ background: "#dc3545", color: "#fff", border: "none", padding: "8px 12px", borderRadius: 5, marginLeft: 10 }}>
        Delete
      </button>
    </div>
  );
}
