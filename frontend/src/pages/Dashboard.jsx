// src/pages/Dashboard.jsx
import { useTasks } from "../context/TaskContext";
import Navbar from "../components/Navbar";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import CalendarView from "../components/CalendarView";
import Timeline from "../components/Timeline";
import UpcomingTasks from "../components/UpcomingTasks";
import TaskDetailModal from "../components/TaskDetailModal";
import AllTasks from "../components/AllTasks";

import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { set, parseISO } from "date-fns";

export default function Dashboard() {
  const { tasks, loading, updateTask } = useTasks();

  // Sensors so a simple click doesn’t start dragging
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  const scheduledTasks = tasks.filter(t => t.dueDate);
  const unscheduledTasks = tasks.filter(t => !t.dueDate);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = String(active.id);
    const overId = String(over.id);
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    if (overId === "unscheduled") {
      if (task.dueDate) updateTask(taskId, { dueDate: null });
    } else {
      const currentDay = task.dueDate ? parseISO(task.dueDate).toISOString().split("T")[0] : null;
      if (overId !== currentDay) {
        const overDay = parseISO(overId);
        const original = task.dueDate ? parseISO(task.dueDate) : new Date();
        const newDue = set(overDay, { hours: original.getHours(), minutes: original.getMinutes() });
        updateTask(taskId, { dueDate: newDue.toISOString() });
      }
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div>
        <Navbar />
        <main style={{ padding: 20, background: "#f4f7fa", minHeight: "calc(100vh - 60px)" }}>
          <div style={{ display: "flex", gap: 20, maxWidth: 1400, margin: "0 auto" }}>
            {/* Main column */}
            <div style={{ flex: 2.5, display: "flex", flexDirection: "column", gap: 20 }}>
              <h1>Task Manager 📝</h1>
              <TaskForm />

              {/* Week timeline (only scheduled tasks) */}
              <Timeline tasks={scheduledTasks} />

              {/* Unscheduled list */}
              <h3 style={{ marginTop: 0 }}>Unscheduled Tasks (Drag to timeline)</h3>
              {loading ? <p>Loading tasks...</p> : <TaskList tasks={unscheduledTasks} />}

              {/* NEW: All Tasks list */}
              <AllTasks />
            </div>

            {/* Right sidebar */}
            <aside style={{ flex: 1, paddingTop: "70px", display: "flex", flexDirection: "column", gap: 20 }}>
              <CalendarView />
              <UpcomingTasks />
            </aside>
          </div>
        </main>

        {/* Popup for details & minor tasks */}
        <TaskDetailModal />
      </div>
    </DndContext>
  );
}
