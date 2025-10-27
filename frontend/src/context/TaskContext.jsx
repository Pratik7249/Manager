import { createContext, useContext, useState } from "react";

const TaskContext = createContext();
const genId = () => `local_${Math.random().toString(36).substring(2, 11)}`;

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const addTask = async (taskData) => {
    try {
      const newTask = {
        ...taskData,
        _id: genId(),
        subTasks: (taskData.subTasks || []).map(sub => ({ ...sub, _id: genId() })),
        completed: false,
      };
      setTasks((prev) => [newTask, ...prev]);
    } catch (err) {
      console.error("Failed to add task locally", err);
    }
  };

  const updateTask = async (id, updates) => {
    try {
      let updatedTask = null;
      setTasks((prev) =>
        prev.map((t) => {
          if (t._id === id) {
            updatedTask = { ...t, ...updates };
            return updatedTask;
          }
          return t;
        })
      );
      if (selectedTask && selectedTask._id === id && updatedTask) {
        setSelectedTask(updatedTask);
      }
    } catch (err) {
      console.error("Failed to update task locally", err);
    }
  };

  const deleteTask = async (id) => {
    try {
      setTasks((prev) => prev.filter((t) => t._id !== id));
      if (selectedTask && selectedTask._id === id) setSelectedTask(null);
    } catch (err) {
      console.error("Failed to delete task locally", err);
    }
  };

  const toggleSubTask = async (taskId, subTaskId, completed) => {
    try {
      let updatedTask = null;
      setTasks((prev) =>
        prev.map((t) => {
          if (t._id === taskId) {
            const newSubTasks = (t.subTasks || []).map(sub =>
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

  const openTaskModal = (task) => {
    setSelectedTask(task); // can be a normal task or a card instance
  };
  const closeTaskModal = () => setSelectedTask(null);

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
