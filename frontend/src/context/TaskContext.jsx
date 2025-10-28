// src/context/TaskContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import API from "../api/axios";

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => { fetchTasks(); }, []);

  async function fetchTasks() {
    try {
      const { data } = await API.get("/tasks");
      setTasks(Array.isArray(data) ? data : data?.tasks || []);
    } catch (e) {
      console.error("Failed to fetch tasks", e);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }

  // ---- helpers
  function mergeUpdate(id, updates) {
    setTasks((prev) =>
      prev.map((t) => (t._id === id ? { ...t, ...updates } : t))
    );
    if (selectedTask && selectedTask._id === id) {
      setSelectedTask((prev) => ({ ...prev, ...updates }));
    }
  }

  // ---- CRUD
  async function addTask(task) {
    const tmpId = `tmp_${Math.random().toString(36).slice(2, 9)}`;
    const local = {
      ...task,
      _id: tmpId,
      completed: false,
      subTasks: (task.subTasks || []).map((s) => ({
        ...s,
        _id: `tmp_${Math.random().toString(36).slice(2, 9)}`
      }))
    };
    setTasks((p) => [local, ...p]);

    try {
      const { data } = await API.post("/tasks", task);
      setTasks((p) => p.map((t) => (t._id === tmpId ? data : t)));
    } catch (e) {
      console.error("Failed to create task", e);
      setTasks((p) => p.filter((t) => t._id !== tmpId));
    }
  }

  async function updateTask(id, updates) {
    // optimistic
    mergeUpdate(id, updates);

    // preferred
    const attempts = [
      () => API.patch(`/tasks/${id}`, updates),
      () => API.put(`/tasks/${id}`, updates),
      () => API.patch(`/task/${id}`, updates),
      () => API.put(`/task/${id}`, updates),
      () => API.patch(`/tasks/update/${id}`, updates)
    ];

    for (const tryCall of attempts) {
      try {
        await tryCall();
        return; // success
      } catch (e) {
        if (e?.response?.status && e.response.status !== 404) {
          // other server error — stop trying
          console.error("Update failed:", e.response.status, e.response.data);
          await fetchTasks(); // rollback to server truth
          return;
        }
        // else 404: try next form
      }
    }

    // all failed
    console.error("All update endpoints failed, rolling back.");
    await fetchTasks();
  }

  async function deleteTask(id) {
    const prev = tasks;
    setTasks(prev.filter((t) => t._id !== id));
    try {
      await API.delete(`/tasks/${id}`);
    } catch (e) {
      console.error("Failed to delete task", e);
      setTasks(prev); // rollback
    }
  }

  function toggleSubTask(taskId, subTaskId, completed) {
    const t = tasks.find((x) => x._id === taskId);
    if (!t) return;
    const subTasks = (t.subTasks || []).map((s) =>
      s._id === subTaskId ? { ...s, completed } : s
    );
    updateTask(taskId, { subTasks });
  }

  function openTaskModal(task) {
    const fresh = tasks.find((t) => t._id === task._id);
    setSelectedTask(fresh || task);
  }
  function closeTaskModal() {
    setSelectedTask(null);
  }

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        addTask,
        updateTask,
        deleteTask,
        toggleSubTask,
        selectedTask,
        openTaskModal,
        closeTaskModal
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => useContext(TaskContext);
