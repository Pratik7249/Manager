import { createContext, useContext, useMemo, useState } from "react";
import { addDays, eachDayOfInterval, endOfWeek, isWithinInterval, parseISO, startOfWeek } from "date-fns";

const CardContext = createContext();

const genId = () => `card_${Math.random().toString(36).slice(2, 10)}`;

export function CardProvider({ children }) {
  const [cards, setCards] = useState([]);
  // Per-occurrence user state (completion + subtask toggles), and date overrides
  const [occurrenceState, setOccurrenceState] = useState({}); // {occId:{completed, sub:{subId:true/false}}}
  const [dateOverrides, setDateOverrides] = useState({}); // {occId:'YYYY-MM-DD'}

  const addCard = (card) => {
    const c = {
      _id: genId(),
      title: card.title?.trim() || "Untitled Card",
      type: card.type || "todo", // 'todo' | 'note'
      description: card.description || "",
      color: card.color || "#fff",
      subTasks: (card.subTasks || []).map(s => ({ _id: genId(), text: s.text, completed: false })),
      schedule: card.schedule || { mode: "everyday" } // modes: 'everyday' | 'weekdays' | 'range'
    };
    setCards(prev => [c, ...prev]);
  };

  const updateCard = (id, updates) => {
    setCards(prev => prev.map(c => (c._id === id ? { ...c, ...updates } : c)));
  };

  const deleteCard = (id) => {
    setCards(prev => prev.filter(c => c._id !== id));
    // clean derived states for its occurrences
    setOccurrenceState(prev => {
      const n = { ...prev };
      Object.keys(n).forEach(k => { if (k.startsWith(`occ_${id}_`)) delete n[k]; });
      return n;
    });
    setDateOverrides(prev => {
      const n = { ...prev };
      Object.keys(n).forEach(k => { if (k.startsWith(`occ_${id}_`)) delete n[k]; });
      return n;
    });
  };

  // Build occurrences (instances) for a date range
  const getInstancesForRange = (start, end) => {
    const days = eachDayOfInterval({ start, end });
    const out = [];
    for (const card of cards) {
      for (const day of days) {
        const dow = day.getDay(); // 0..6
        const dateStr = day.toISOString().split("T")[0];

        let include = false;
        const sch = card.schedule || { mode: "everyday" };

        if (sch.mode === "everyday") include = true;
        else if (sch.mode === "weekdays" && Array.isArray(sch.weekdays))
          include = sch.weekdays.includes(dow);
        else if (sch.mode === "range" && sch.startDate && sch.endDate) {
          const s = parseISO(sch.startDate);
          const e = parseISO(sch.endDate);
          include = isWithinInterval(day, { start: s, end: e });
        }

        if (include) {
          const occId = `occ_${card._id}_${dateStr}`;
          const overrideDate = dateOverrides[occId];
          const finalDateStr = overrideDate || dateStr;

          const subWithUserState = card.subTasks.map(s => {
            const user = occurrenceState[occId]?.sub?.[s._id];
            return { ...s, completed: !!user };
          });

          out.push({
            _id: occId,
            isCardInstance: true,
            cardId: card._id,
            title: `[Card] ${card.title}`,
            type: card.type,
            description: card.description,
            subTasks: subWithUserState,
            completed: !!occurrenceState[occId]?.completed,
            dueDate: finalDateStr
          });
        }
      }
    }
    return out;
  };

  // Occurrence operations
  const setOccurrenceCompleted = (occId, completed) => {
    setOccurrenceState(prev => ({
      ...prev,
      [occId]: { ...(prev[occId] || {}), completed }
    }));
  };

  const toggleOccurrenceSub = (occId, subId) => {
    setOccurrenceState(prev => {
      const p = prev[occId] || {};
      const sub = { ...(p.sub || {}) };
      sub[subId] = !sub[subId];
      return { ...prev, [occId]: { ...p, sub } };
    });
  };

  const overrideOccurrenceDate = (occId, ymd) => {
    setDateOverrides(prev => ({ ...prev, [occId]: ymd }));
  };

  // Convenience for “this week” in consumers
  const instancesThisWeek = useMemo(() => {
    const now = new Date();
    const start = startOfWeek(now, { weekStartsOn: 1 });
    const end = endOfWeek(now, { weekStartsOn: 1 });
    return getInstancesForRange(start, end);
  }, [cards, occurrenceState, dateOverrides]);

  return (
    <CardContext.Provider value={{
      cards,
      addCard,
      updateCard,
      deleteCard,
      getInstancesForRange,
      instancesThisWeek,
      setOccurrenceCompleted,
      toggleOccurrenceSub,
      overrideOccurrenceDate
    }}>
      {children}
    </CardContext.Provider>
  );
}

export const useCards = () => useContext(CardContext);
