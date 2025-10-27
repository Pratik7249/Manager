import { useTasks } from "../context/TaskContext";
import { useCards } from "../context/CardContext";
import Navbar from "../components/Navbar";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import CalendarView from "../components/CalendarView";
import Timeline from "../components/Timeline";
import UpcomingTasks from "../components/UpcomingTasks";
import TaskDetailModal from "../components/TaskDetailModal";

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
  const { instancesThisWeek, overrideOccurrenceDate } = useCards();

  // 🔐 Sensors: click = open, move a bit = drag
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }), // must move >= 6px
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }) // long-press 150ms
  );

  const scheduledTasks = tasks.filter(t => t.dueDate);
  const unscheduledTasks = tasks.filter(t => !t.dueDate);

  // Show both normal scheduled tasks and card instances on the timeline
  const combinedForTimeline = [...scheduledTasks, ...instancesThisWeek];

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const overId = String(over.id);
    const activeId = String(active.id);

    // If it's a normal task:
    const t = tasks.find(x => x._id === activeId);
    if (t) {
      if (overId === "unscheduled") {
        if (t.dueDate) updateTask(t._id, { dueDate: null });
      } else {
        const currentDay = t.dueDate ? parseISO(t.dueDate).toISOString().split("T")[0] : null;
        if (overId !== currentDay) {
          const overDay = parseISO(overId);
          const original = t.dueDate ? parseISO(t.dueDate) : new Date();
          const newDue = set(overDay, {
            hours: original.getHours(),
            minutes: original.getMinutes(),
          });
          updateTask(t._id, { dueDate: newDue.toISOString() });
        }
      }
      return;
    }

    // If it's a card instance:
    const inst = instancesThisWeek.find(x => x._id === activeId);
    if (inst && overId !== "unscheduled") {
      // override this single occurrence's date
      overrideOccurrenceDate(inst._id, overId);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div>
        <Navbar />
        <main style={{ padding: 20, background: "#f4f7fa", minHeight: 'calc(100vh - 60px)' }}>
          <div style={{ display: "flex", gap: 20, maxWidth: 1400, margin: '0 auto' }}>
            <div style={{ flex: 2.5, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h1>Task Manager 📝</h1>
              <TaskForm />

              {/* Timeline shows scheduled tasks + card instances */}
              <Timeline tasks={combinedForTimeline} />

              <h3 style={{ marginTop: 0 }}>Unscheduled Tasks (Drag to timeline)</h3>
              {loading ? <p>Loading tasks...</p> : <TaskList tasks={unscheduledTasks} />}
            </div>

            <aside style={{ flex: 1, paddingTop: "70px", display: 'flex', flexDirection: 'column', gap: 20 }}>
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
