// src/components/TaskForm.jsx
import { useState } from "react";
import { useTasks } from "../context/TaskContext";

export default function TaskForm() {
  const { addTask } = useTasks(); // Get the addTask function from context

  // State for all our new fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [recurrence, setRecurrence] = useState("none");
  const [subTaskText, setSubTaskText] = useState("");
  const [subTasks, setSubTasks] = useState([]);

  const handleAddSubtask = (e) => {
    e.preventDefault(); // Prevent form submission
    if (!subTaskText.trim()) return;
    // We create a subtask object (this must match your backend model)
    const newSubTask = { text: subTaskText, completed: false };
    setSubTasks([...subTasks, newSubTask]);
    setSubTaskText(""); // Clear the input
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Create the full task object
    const newTask = {
      title,
      description,
      dueDate: dueDate || null, // Send null if empty
      recurrence: { type: recurrence }, // Send as an object
      subTasks, // Send the array of subtasks
    };

    addTask(newTask);

    // Reset the form
    setTitle("");
    setDescription("");
    setDueDate("");
    setRecurrence("none");
    setSubTasks([]);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 20, background: "#f9f9f9", padding: 15, borderRadius: 8 }}>
      <input
        placeholder="Task title (e.g., 'Weekly Project Sync')"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ padding: 10, marginBottom: 10, width: "100%", boxSizing: "border-box" }}
      />
      <textarea
        placeholder="Description..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ padding: 10, marginBottom: 10, width: "100%", minHeight: 80, boxSizing: "border-box" }}
      />
      
      {/* --- New Fields --- */}
      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          style={{ padding: 10, flex: 1 }}
        />
        <select value={recurrence} onChange={(e) => setRecurrence(e.target.value)} style={{ padding: 10, flex: 1 }}>
          <option value="none">One-time Task</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      {/* --- Subtask Input --- */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            placeholder="Add a minor task..."
            value={subTaskText}
            onChange={(e) => setSubTaskText(e.target.value)}
            style={{ padding: 10, flex: 1 }}
          />
          <button onClick={handleAddSubtask} style={{ padding: "0 15px" }}>Add</button>
        </div>
        <ul style={{ listStyle: "none", paddingLeft: 0, margin: "5px 0 0 0" }}>
          {subTasks.map((sub, index) => (
            <li key={index} style={{ fontSize: "0.9em" }}>- {sub.text}</li>
          ))}
        </ul>
      </div>
      {/* --- End Subtask Input --- */}

      <button type="submit" style={{ background: "#007bff", color: "#fff", border: "none", padding: "12px 20px", borderRadius: 5, width: "100%" }}>
        Add Main Task
      </button>
    </form>
  );
}