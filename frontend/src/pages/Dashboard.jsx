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
  useSensors
} from "@dnd-kit/core";
import { set, parseISO } from "date-fns";

export default function Dashboard() {
  const { tasks, loading, updateTask } = useTasks();

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  const scheduledTasks = tasks.filter((t) => t.dueDate);
  const unscheduledTasks = tasks.filter((t) => !t.dueDate);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = String(active.id);
    const overId = String(over.id); // "unscheduled" or "yyyy-MM-dd"
    const task = tasks.find((t) => t._id === taskId);
    if (!task) return;

    if (overId === "unscheduled") {
      if (task.dueDate) updateTask(taskId, { dueDate: null });
      return;
    }

    // Compare to current task day (UTC-safe)
    const currentDay = task.dueDate
      ? parseISO(task.dueDate).toISOString().slice(0, 10)
      : null;

    if (overId !== currentDay) {
      // Build a local date (avoid UTC shift)
      const overDayLocal = new Date(`${overId}T00:00:00`);
      const original = task.dueDate ? parseISO(task.dueDate) : new Date();
      const newDue = set(overDayLocal, {
        hours: original.getHours(),
        minutes: original.getMinutes()
      });
      updateTask(taskId, { dueDate: newDue.toISOString() });
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div>
        <Navbar />
        <main style={{ padding: 20, background: "#f4f7fa", minHeight: "calc(100vh - 60px)" }}>
          <div
            style={{
              maxWidth: 1400,
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "minmax(0,1fr) 360px",
              gap: 20
            }}
          >
            <section style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <h1 style={{ margin: "6px 0 0" }}>Task Manager 📝</h1>
              <TaskForm />
              <div>
                <h3 style={{ marginTop: 0 }}>This Week&apos;s Timeline</h3>
                <Timeline tasks={scheduledTasks} />
              </div>
              <div>
                <h3 style={{ marginTop: 0 }}>Unscheduled Tasks (Drag to timeline)</h3>
                {loading ? <p>Loading tasks...</p> : <TaskList tasks={unscheduledTasks} />}
              </div>
              <AllTasks />
            </section>

            <aside
              style={{
                position: "sticky",
                top: 84,
                alignSelf: "start",
                display: "flex",
                flexDirection: "column",
                gap: 20,
                maxHeight: "calc(100vh - 100px)",
                overflow: "auto"
              }}
            >
              <CalendarView />
              <UpcomingTasks />
            </aside>
          </div>
        </main>
        <TaskDetailModal />
      </div>
    </DndContext>
  );
}
