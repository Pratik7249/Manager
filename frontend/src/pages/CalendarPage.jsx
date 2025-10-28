// src/pages/CalendarPage.jsx
import { useMemo, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { useTasks } from "../context/TaskContext";
import { parseISO, isValid } from "date-fns";
import { Box, Paper } from "@mui/material";

export default function CalendarPage() {
  const { tasks, openTaskModal } = useTasks();
  const calendarRef = useRef(null);

  const events = useMemo(() => {
    return tasks
      .filter(t => !!t.dueDate)
      .map(t => {
        const d = parseISO(t.dueDate);
        if (!isValid(d)) return null;
        return {
          id: t._id,
          title: t.title || "(Untitled)",
          start: d.toISOString(),
          allDay: true,
          backgroundColor: t.completed ? "#9CCC65" : "#42A5F5",
          borderColor: t.completed ? "#7CB342" : "#1E88E5",
          extendedProps: { task: t }
        };
      })
      .filter(Boolean);
  }, [tasks]);

  const handleEventClick = (info) => {
    const t = info.event.extendedProps?.task;
    if (t) openTaskModal(t);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={1} sx={{ p: 1 }}>
        <div style={{ height: "calc(100vh - 112px)" }}>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek"
            }}
            height="100%"
            events={events}
            eventClick={handleEventClick}
            selectable
            dayMaxEvents
            firstDay={1}
          />
        </div>
      </Paper>
    </Box>
  );
}
