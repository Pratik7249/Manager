import { useState, useMemo } from "react";
import { useTasks } from "../context/TaskContext";
import { format, formatDistanceToNow, isPast, parseISO } from "date-fns";

// --- helpers ---
function toDateInputValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d - tz).toISOString().slice(0, 10); // yyyy-MM-dd (local)
}

function mergeDateWithExistingTime(dateStr, existingIso) {
  if (!dateStr) return null;
  const base = existingIso ? new Date(existingIso) : new Date();
  const localMidnight = new Date(`${dateStr}T00:00:00`);
  localMidnight.setHours(base.getHours(), base.getMinutes(), 0, 0);
  return localMidnight.toISOString();
}

export default function TaskDetailModal() {
  const {
    selectedTask,
    closeTaskModal,
    toggleSubTask,
    deleteTask,
    updateTask
  } = useTasks();

  const [edit, setEdit] = useState(false);

  // Prepare editable state from selectedTask (only when it changes)
  const initial = useMemo(() => {
    if (!selectedTask) return null;
    return {
      title: selectedTask.title || "",
      description: selectedTask.description || "",
      dueDateStr: toDateInputValue(selectedTask.dueDate),
      recurrenceType: selectedTask?.recurrence?.type || "none",
      subTasks: (selectedTask.subTasks || []).map((s) => ({
        _id: s._id || `tmp_${Math.random().toString(36).slice(2, 9)}`,
        text: s.text || "",
        completed: !!s.completed
      }))
    };
  }, [selectedTask]);

  const [form, setForm] = useState(initial);
  // keep form in sync if the user opens another task without closing modal
  // (when selectedTask changes)
  if (selectedTask && (!form || form._stamp !== selectedTask._id)) {
    const fresh = {
      ...initial,
      _stamp: selectedTask._id
    };
    // eslint-disable-next-line react-hooks/rules-of-hooks
    setForm(fresh);
  }

  if (!selectedTask) return null;

  // --- derived display info (read-only view) ---
  let dueDateInfo = "No due date set";
  let dateColor = "#555";
  if (selectedTask.dueDate) {
    const date = parseISO(selectedTask.dueDate);
    if (isPast(date) && !selectedTask.completed) {
      dueDateInfo = `Overdue since ${format(date, "MMM d")}`;
      dateColor = "#dc3545";
    } else {
      dueDateInfo = `Due ${formatDistanceToNow(date, { addSuffix: true })} (${format(
        date,
        "MMM d, h:mm a"
      )})`;
      dateColor = "#007bff";
    }
  }

  // --- handlers ---
  const handleToggleComplete = () => {
    updateTask(selectedTask._id, { completed: !selectedTask.completed });
  };

  const handleDelete = () => {
    if (window.confirm("Delete this task?")) deleteTask(selectedTask._id);
  };

  const updateForm = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleSubToggle = (subId, current) => {
    if (edit) {
      // in edit mode we just update local state
      updateForm({
        subTasks: form.subTasks.map((s) =>
          s._id === subId ? { ...s, completed: !current } : s
        )
      });
    } else {
      // normal toggle persists via context
      toggleSubTask(selectedTask._id, subId, !current);
    }
  };

  const handleSubText = (subId, text) => {
    updateForm({
      subTasks: form.subTasks.map((s) => (s._id === subId ? { ...s, text } : s))
    });
  };

  const handleSubAdd = () => {
    const txt = prompt("Minor task text:");
    if (!txt) return;
    updateForm({
      subTasks: [
        ...form.subTasks,
        { _id: `tmp_${Math.random().toString(36).slice(2, 9)}`, text: txt, completed: false }
      ]
    });
  };

  const handleSubDelete = (subId) => {
    updateForm({ subTasks: form.subTasks.filter((s) => s._id !== subId) });
  };

  const handleSave = async () => {
    const payload = {
      title: form.title.trim() || "(Untitled)",
      description: form.description || "",
      dueDate: form.dueDateStr
        ? mergeDateWithExistingTime(form.dueDateStr, selectedTask.dueDate)
        : null,
      recurrence: { type: form.recurrenceType || "none" },
      subTasks: form.subTasks.map((s) => ({
        _id: s._id, // server can replace tmp ids; next fetch will sync
        text: s.text,
        completed: s.completed
      }))
    };
    await updateTask(selectedTask._id, payload);
    setEdit(false);
  };

  const handleCancel = () => {
    // reset edits
    setForm(initial);
    setEdit(false);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000
      }}
      onClick={closeTaskModal}
    >
      <div
        style={{
          background: "white",
          padding: 24,
          borderRadius: 10,
          width: 640,
          maxWidth: "94%",
          boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
          maxHeight: "86vh",
          overflowY: "auto"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #eee",
            paddingBottom: 12,
            marginBottom: 16
          }}
        >
          {edit ? (
            <input
              value={form.title}
              onChange={(e) => updateForm({ title: e.target.value })}
              placeholder="Task title"
              style={{
                flex: 1,
                fontSize: "1.25rem",
                fontWeight: 600,
                padding: "8px 10px",
                border: "1px solid #ddd",
                borderRadius: 6
              }}
            />
          ) : (
            <h2
              style={{
                margin: 0,
                textDecoration: selectedTask.completed ? "line-through" : "none"
              }}
            >
              {selectedTask.title}
            </h2>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            {!edit ? (
              <>
                <button
                  onClick={() => setEdit(true)}
                  style={{
                    background: "#1976d2",
                    color: "#fff",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: 6,
                    cursor: "pointer"
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={closeTaskModal}
                  style={{ background: "transparent", border: "none", fontSize: "1.5rem" }}
                  title="Close"
                >
                  &times;
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  style={{
                    background: "#2e7d32",
                    color: "#fff",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: 6,
                    cursor: "pointer"
                  }}
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  style={{
                    background: "#9e9e9e",
                    color: "#fff",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: 6,
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {/* due date / status */}
        {!edit ? (
          <p style={{ color: dateColor, fontWeight: "bold", fontStyle: "italic" }}>{dueDateInfo}</p>
        ) : (
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <input
              type="date"
              value={form.dueDateStr || ""}
              onChange={(e) => updateForm({ dueDateStr: e.target.value })}
              style={{ padding: 10, flex: "0 0 200px" }}
            />
            <select
              value={form.recurrenceType}
              onChange={(e) => updateForm({ recurrenceType: e.target.value })}
              style={{ padding: 10 }}
            >
              <option value="none">One-time Task</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        )}

        {/* description */}
        {!edit ? (
          selectedTask.description && <p style={{ whiteSpace: "pre-wrap" }}>{selectedTask.description}</p>
        ) : (
          <textarea
            value={form.description}
            onChange={(e) => updateForm({ description: e.target.value })}
            placeholder="Description..."
            rows={4}
            style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 6 }}
          />
        )}

        {/* subtasks */}
        {(selectedTask.subTasks?.length || edit || form?.subTasks?.length) ? (
          <div style={{ marginTop: 18 }}>
            <h4 style={{ margin: "0 0 10px 0" }}>Minor Tasks</h4>

            <ul
              style={{
                listStyle: "none",
                paddingLeft: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 8
              }}
            >
              {(edit ? form.subTasks : selectedTask.subTasks || []).map((sub) => (
                <li
                  key={sub._id}
                  style={{
                    background: "#f9f9f9",
                    padding: "10px 12px",
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    gap: 10
                  }}
                >
                  <input
                    type="checkbox"
                    checked={sub.completed}
                    onChange={() => handleSubToggle(sub._id, sub.completed)}
                    style={{ width: 16, height: 16 }}
                  />

                  {!edit ? (
                    <span
                      style={{
                        textDecoration: sub.completed ? "line-through" : "none",
                        color: sub.completed ? "#888" : "#000",
                        flex: 1
                      }}
                    >
                      {sub.text}
                    </span>
                  ) : (
                    <>
                      <input
                        value={sub.text}
                        onChange={(e) => handleSubText(sub._id, e.target.value)}
                        style={{ flex: 1, padding: "6px 8px", border: "1px solid #ddd", borderRadius: 6 }}
                      />
                      <button
                        onClick={() => handleSubDelete(sub._id)}
                        style={{
                          background: "#e53935",
                          color: "#fff",
                          border: "none",
                          padding: "6px 10px",
                          borderRadius: 6,
                          cursor: "pointer"
                        }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>

            {edit && (
              <div style={{ marginTop: 10 }}>
                <button
                  onClick={handleSubAdd}
                  style={{
                    background: "#1976d2",
                    color: "#fff",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: 6,
                    cursor: "pointer"
                  }}
                >
                  + Add minor task
                </button>
              </div>
            )}
          </div>
        ) : null}

        {/* footer actions */}
        {!edit && (
          <div
            style={{
              borderTop: "1px solid #eee",
              paddingTop: 16,
              marginTop: 20,
              display: "flex",
              justifyContent: "space-between"
            }}
          >
            <button
              onClick={handleToggleComplete}
              style={{
                background: selectedTask.completed ? "#ffc107" : "#28a745",
                color: "#fff",
                border: "none",
                padding: "10px 15px",
                borderRadius: 6,
                cursor: "pointer"
              }}
            >
              {selectedTask.completed ? "Mark as Incomplete" : "Mark as Done"}
            </button>

            <button
              onClick={handleDelete}
              style={{
                background: "#dc3545",
                color: "#fff",
                border: "none",
                padding: "10px 15px",
                borderRadius: 6,
                cursor: "pointer"
              }}
            >
              Delete Task
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
