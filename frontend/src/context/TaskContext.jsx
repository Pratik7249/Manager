// src/context/TaskContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
// We don't need API or useAuth for this frontend-only fix
// import API from "../api/axios"; 
// import { useAuth } from "./AuthContext";

const TaskContext = createContext();

// A helper function to generate random IDs
const_generateId = () => `local_${Math.random().toString(36).substring(2, 11)}`;

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false); // Set to false, we aren't fetching
  // const { user } = useAuth(); // Not needed for now

  // --- NEW MODAL STATE ---
  const [selectedTask, setSelectedTask] = useState(null);

  // We comment out the 'useEffect' that fetches tasks
  /*
  useEffect(() => {
    if (user) {
      fetchTasks();
    } else {
      setTasks([]);
      setLoading(false);
    }
  }, [user]);
  */

  // We comment out fetchTasks
  // const fetchTasks = async () => { ... };


  // --- UPDATED 'addTask' ---
  const addTask = async (taskData) => {
    // This function no longer calls an API.
    // It creates a new task locally with a temporary ID.
    try {
      const newTask = {
        ...taskData,
        _id: _generateId(), // Give it a unique local ID
        subTasks: taskData.subTasks.map(sub => ({ ...sub, _id: _generateId() })), // Give subtasks IDs
        completed: false,
      };
      setTasks((prev) => [newTask, ...prev]);
    } catch (err) {
      console.error("Failed to add task locally", err);
    }
  };

  // --- UPDATED 'updateTask' ---
  const updateTask = async (id, updates) => {
    // This is the main fix. We update the state directly.
    // 'updates' is an object like { dueDate: "..." }
    try {
      let updatedTask = null;
      setTasks((prev) =>
        prev.map((t) => {
          if (t._id === id) {
            updatedTask = { ...t, ...updates }; // Merge old task with new 'updates'
            return updatedTask;
          }
          return t;
        })
      );

      // If the updated task is in the modal, update the modal too
      if (selectedTask && selectedTask._id === id && updatedTask) {
        setSelectedTask(updatedTask);
      }
    } catch (err) {
      console.error("Failed to update task locally", err);
    }
  };

  // --- UPDATED 'deleteTask' ---
  const deleteTask = async (id) => {
    try {
      setTasks((prev) => prev.filter((t) => t._id !== id));
      if (selectedTask && selectedTask._id === id) {
        setSelectedTask(null);
      }
    } catch (err) {
      console.error("Failed to delete task locally", err);
    }
  };

  // --- UPDATED 'toggleSubTask' ---
  const toggleSubTask = async (taskId, subTaskId, completed) => {
    try {
      let updatedTask = null;
      setTasks((prev) =>
        prev.map((t) => {
          if (t._id === taskId) {
            // Go deeper to update the specific subtask
            const newSubTasks = t.subTasks.map(sub =>
              sub._id === subTaskId ? { ...sub, completed } : sub
            );
            updatedTask = { ...t, subTasks: newSubTasks };
            return updatedTask;
          }
          return t;
        })
      );

      if (selectedTask && selectedTask._id === taskId && updatedTask) {
        setSelectedTask(updatedTask);
      }
    } catch (err) {
      console.error("Failed to toggle subtask locally", err);
    }
  };

  // --- Modal Functions (no change) ---
  const openTaskModal = (task) => {
    const freshTask = tasks.find(t => t._id === task._id);
    setSelectedTask(freshTask || task);
  };

  const closeTaskModal = () => {
    setSelectedTask(null);
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        // fetchTasks, // We don't expose this for now
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