import { useTasks } from "../context/TaskContext";
import { useCards } from "../context/CardContext";
import { format, formatDistanceToNow, isPast, parseISO } from 'date-fns';

export default function TaskDetailModal() {
  const {
    selectedTask, closeTaskModal,
    toggleSubTask, deleteTask, updateTask
  } = useTasks();

  const {
    setOccurrenceCompleted, toggleOccurrenceSub
  } = useCards();

  if (!selectedTask) return null;

  const isCardInstance = !!selectedTask.isCardInstance;

  let dueDateInfo = "No due date set";
  let dateColor = "#555";
  if (selectedTask.dueDate) {
    const date = parseISO(selectedTask.dueDate);
    if (isPast(date) && !selectedTask.completed) {
      dueDateInfo = `Overdue since ${format(date, 'MMM d')}`;
      dateColor = "#dc3545";
    } else {
      dueDateInfo = `Due ${formatDistanceToNow(date, { addSuffix: true })} (${format(date, 'MMM d, h:mm a')})`;
      dateColor = "#007bff";
    }
  }

  const handleToggleComplete = () => {
    if (isCardInstance) setOccurrenceCompleted(selectedTask._id, !selectedTask.completed);
    else updateTask(selectedTask._id, { completed: !selectedTask.completed });
  };

  const handleDelete = () => {
    if (isCardInstance) {
      alert("Card instances are generated from templates. Delete or change schedule in Manage Cards.");
    } else {
      if (window.confirm("Delete this task?")) deleteTask(selectedTask._id);
    }
  };

  const handleSubToggle = (subId, current) => {
    if (isCardInstance) toggleOccurrenceSub(selectedTask._id, subId);
    else toggleSubTask(selectedTask._id, subId, !current);
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
      }}
      onClick={closeTaskModal}
    >
      <div
        style={{
          background: 'white', padding: 25, borderRadius: 8,
          width: 600, maxWidth: '90%', boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
          maxHeight: '80vh', overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: 15, marginBottom: 15 }}>
          <h2 style={{ margin: 0, textDecoration: selectedTask.completed ? 'line-through' : 'none' }}>
            {selectedTask.title}
          </h2>
          <button style={{ background: 'transparent', border: 'none', fontSize: '1.5rem' }} onClick={closeTaskModal}>
            &times;
          </button>
        </div>

        <p style={{ color: dateColor, fontWeight: 'bold', fontStyle: 'italic' }}>{dueDateInfo}</p>
        {selectedTask.description && <p>{selectedTask.description}</p>}

        {selectedTask.subTasks?.length > 0 && (
          <div style={{ margin: "20px 0", paddingTop: 15 }}>
            <h4 style={{ margin: "0 0 10px 0" }}>Minor Tasks:</h4>
            <ul style={{ listStyle: "none", paddingLeft: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selectedTask.subTasks.map((sub) => (
                <li key={sub._id} style={{ textDecoration: sub.completed ? "line-through" : "none", color: sub.completed ? "#888" : "#000", background: '#f9f9f9', padding: '10px 12px', borderRadius: 4 }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input type="checkbox" checked={sub.completed} onChange={() => handleSubToggle(sub._id, sub.completed)} style={{ marginRight: 10, width: 16, height: 16 }} />
                    {sub.text}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ borderTop: '1px solid #eee', paddingTop: 20, marginTop: 20, display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={handleToggleComplete} style={{ background: selectedTask.completed ? "#ffc107" : "#28a745", color: "#fff", border: 'none', padding: '10px 15px', borderRadius: 5 }}>
            {selectedTask.completed ? "Mark as Incomplete" : "Mark as Done"}
          </button>
          <button onClick={handleDelete} style={{ background: "#dc3545", color: "#fff", border: 'none', padding: '10px 15px', borderRadius: 5 }}>
            {isCardInstance ? "Edit Card…" : "Delete Task"}
          </button>
        </div>
      </div>
    </div>
  );
}
