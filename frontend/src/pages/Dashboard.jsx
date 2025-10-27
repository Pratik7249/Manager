// src/pages/Dashboard.jsx
import { useTasks } from "../context/TaskContext";
import Navbar from "../components/Navbar";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import CalendarView from "../components/CalendarView";
import Timeline from "../components/Timeline";
import UpcomingTasks from "../components/UpcomingTasks"; // Make sure .jsx is removed
import TaskDetailModal from "../components/TaskDetailModal";

// --- NEW DND IMPORTS ---
import { DndContext, closestCenter } from "@dnd-kit/core";
import { set, parseISO } from "date-fns";
// --- END DND IMPORTS ---

export default function Dashboard() {
  const { tasks, loading, updateTask } = useTasks(); // Get updateTask

  // Filter tasks:
  // 'scheduledTasks' have a due date, 'unscheduledTasks' do not.
  const scheduledTasks = tasks.filter(t => t.dueDate);
  const unscheduledTasks = tasks.filter(t => !t.dueDate);

  // --- NEW DND HANDLER ---
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) return; // Dropped nowhere

    const taskId = active.id;
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    // The 'over' ID will be EITHER a date string (from Timeline)
    // OR the string "unscheduled" (from TaskList)
    const overId = String(over.id); // Ensure it's a string

    if (overId === "unscheduled") {
      // --- Dropped onto the Unscheduled List ---
      if (task.dueDate) { // Only update if it had a due date
        console.log(`Unscheduling task '${task.title}'`);
        updateTask(taskId, { dueDate: null });
      }
    } else {
      // --- Dropped onto the Timeline (a day) ---
      // 'overId' is a date string like "2025-10-25"
      const taskCurrentDayString = task.dueDate ? parseISO(task.dueDate).toISOString().split('T')[0] : null;

      // Only update if it's a new day
      if (overId !== taskCurrentDayString) {
        const overDay = parseISO(overId);
        
        // Create a new due date based on the day we dropped onto.
        const originalDueDate = task.dueDate ? parseISO(task.dueDate) : new Date();
        const newDueDate = set(overDay, {
          hours: originalDueDate.getHours(),
          minutes: originalDueDate.getMinutes(),
        });

        console.log(`Scheduling task '${task.title}' for ${newDueDate.toISOString()}`);
        updateTask(taskId, { dueDate: newDueDate.toISOString() });
      }
    }
  };
  // --- END DND HANDLER ---

  return (
    // Wrap the entire app in the DndContext
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div>
        <Navbar />
        {/* Sidebar is gone, layout is simplified */}
        <main style={{ padding: 20, background: "#f4f7fa" }}>
          <div style={{ display: "flex", gap: 20, maxWidth: 1400, margin: '0 auto' }}>
            
            {/* Main Task Column (70%) */}
            <div style={{ flex: 2.5, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h1>Task Manager 📝</h1>
              <TaskForm />
              
              {/* The Timeline will ONLY show scheduled tasks */}
              <Timeline tasks={scheduledTasks} /> 
              
              {/* The TaskList will ONLY show unscheduled tasks */}
              <h3 style={{ marginTop: 0 }}>Unscheduled Tasks (Drag to timeline)</h3>
              {loading ? (
                <p>Loading tasks...</p>
              ) : (
                <TaskList tasks={unscheduledTasks} />
              )}
            </div>

            {/* Right Sidebar (30%) */}
            <aside style={{ flex: 1, paddingTop: "70px", display: 'flex', flexDirection: 'column', gap: 20 }}>
              <CalendarView />
              {/* Add our new "Upcoming" widget here */}
              <UpcomingTasks /> {/* No 'tasks' prop needed, it gets from context */}
            </aside>
            
          </div>
        </main>

        {/* The Modal lives here, outside the layout */}
        <TaskDetailModal />
      </div>
    </DndContext>
  );
}