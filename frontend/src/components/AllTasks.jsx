// src/components/AllTasks.jsx
import { useMemo, useState } from "react";
import { useTasks } from "../context/TaskContext";
import TaskCard from "./TaskCard";

export default function AllTasks() {
  const { tasks, loading } = useTasks();
  const [query, setQuery] = useState("");

  const { pending, completed } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? tasks.filter(t =>
          (t.title || "").toLowerCase().includes(q) ||
          (t.description || "").toLowerCase().includes(q)
        )
      : tasks;

    return {
      pending: filtered.filter(t => !t.completed),
      completed: filtered.filter(t => t.completed),
    };
  }, [tasks, query]);

  return (
    <div style={{ background: "#fff", padding: 16, borderRadius: 8, boxShadow: "0 2px 5px rgba(0,0,0,.1)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>All Tasks</h3>
        <input
          placeholder="Search tasks…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: 8, border: "1px solid #ddd", borderRadius: 6, width: 240 }}
        />
      </div>

      {loading && <p>Loading…</p>}

      {!loading && pending.length === 0 && completed.length === 0 && (
        <p style={{ color: "#777" }}>No tasks yet.</p>
      )}

      {pending.length > 0 && (
        <>
          <h4 style={{ margin: "8px 0" }}>Pending</h4>
          {pending.map(t => <TaskCard key={t._id} task={t} />)}
        </>
      )}

      {completed.length > 0 && (
        <>
          <h4 style={{ margin: "16px 0 8px" }}>Completed</h4>
          {completed.map(t => <TaskCard key={t._id} task={t} />)}
        </>
      )}
    </div>
  );
}
