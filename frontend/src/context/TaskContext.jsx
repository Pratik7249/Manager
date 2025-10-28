// src/context/TaskContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import API from "../api/axios";
import { useAuth } from "./AuthContext";

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [selectedTask, setSelectedTask] = useState(null);

  // === Fetch all tasks when user is ready ===
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setTasks([]);
      return;
    }
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      // Expecting backend GET /api/tasks -> [ {...task} ]
      const { data } = await API.get("/tasks");
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch tasks:", err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (taskData) => {
    try {
      // default: ensure subtasks have ids client-side if backend doesn’t add
      const payload = {
        ...taskData,
        subTasks: (taskData.subTasks || []).map(s => ({ ...s })),
      };
      // POST /api/tasks -> created task
      const { data } = await API.post("/tasks", payload);
      setTasks(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error("Failed to add task:", err?.response?.data || err.message);
    }
  };

  const updateTask = async (id, updates) => {
    try {
      // PATCH /api/tasks/:id -> updated task
      const { data } = await API.patch(`/tasks/${id}`, updates);
      setTasks(prev => prev.map(t => (t._id === id ? data : t)));
      if (selectedTask && selectedTask._id === id) setSelectedTask(data);
      return data;
    } catch (err) {
      console.error("Failed to update task:", err?.response?.data || err.message);
    }
  };

  const deleteTask = async (id) => {
    try {
      // DELETE /api/tasks/:id
      await API.delete(`/tasks/${id}`);
      setTasks(prev => prev.filter(t => t._id !== id));
      if (selectedTask && selectedTask._id === id) setSelectedTask(null);
    } catch (err) {
      console.error("Failed to delete task:", err?.response?.data || err.message);
    }
  };

  // Toggle a single subtask’s completed state.
  // Works even if your backend doesn’t have a dedicated subtasks route:
  // we PATCH the entire subTasks array on the task.
  const toggleSubTask = async (taskId, subTaskId, completed) => {
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    const newSubTasks = (task.subTasks || []).map(s =>
      String(s._id) === String(subTaskId) ? { ...s, completed } : s
    );

    return updateTask(taskId, { subTasks: newSubTasks });
  };

  // Modal helpers
  const openTaskModal = (task) => {
    const fresh = tasks.find(t => t._id === task._id);
    setSelectedTask(fresh || task);
  };
  const closeTaskModal = () => setSelectedTask(null);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        fetchTasks,
        addTask,
        updateTask,
        deleteTask,
        toggleSubTask,
        selectedTask,
        openTaskModal,
        closeTaskModal,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => useContext(TaskContext);
