import { useState } from "react";
import Navbar from "../components/Navbar";
import { useCards } from "../context/CardContext";

const week = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function ManageCards() {
  const { cards, addCard, updateCard, deleteCard } = useCards();

  const [form, setForm] = useState({
    title: "",
    type: "todo",
    description: "",
    subText: "",
    subTasks: [],
    color: "#fff",
    schedule: { mode: "everyday", weekdays: [], startDate: "", endDate: "" }
  });

  const addSub = () => {
    if (!form.subText.trim()) return;
    setForm(f => ({ ...f, subTasks: [...f.subTasks, { text: f.subText }], subText: "" }));
  };

  const submit = (e) => {
    e.preventDefault();
    addCard({
      title: form.title,
      type: form.type,
      description: form.description,
      subTasks: form.subTasks,
      color: form.color,
      schedule: form.schedule
    });
    setForm({
      title: "",
      type: "todo",
      description: "",
      subText: "",
      subTasks: [],
      color: "#fff",
      schedule: { mode: "everyday", weekdays: [], startDate: "", endDate: "" }
    });
  };

  const toggleWeekday = (d) => {
    setForm(f => {
      const exists = f.schedule.weekdays?.includes(d);
      const weekdays = exists ? f.schedule.weekdays.filter(x => x !== d) : [...(f.schedule.weekdays||[]), d];
      return { ...f, schedule: { ...f.schedule, weekdays } };
    });
  };

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: "24px auto", display: "grid", gridTemplateColumns: "420px 1fr", gap: 24 }}>
        <form onSubmit={submit} style={{ background: "#fff", padding: 16, borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
          <h3 style={{ marginTop: 0 }}>Create a Card</h3>
          <label>Title</label>
          <input value={form.title} onChange={e=>setForm(f=>({ ...f, title: e.target.value }))} style={{ width: "100%", padding: 10, marginBottom: 8 }} />
          <label>Type</label>
          <select value={form.type} onChange={e=>setForm(f=>({ ...f, type: e.target.value }))} style={{ width:"100%", padding:10, marginBottom:8 }}>
            <option value="todo">To-do</option>
            <option value="note">Note</option>
          </select>
          <label>Description</label>
          <textarea value={form.description} onChange={e=>setForm(f=>({ ...f, description: e.target.value }))} style={{ width: "100%", padding: 10, minHeight: 70, marginBottom: 8 }} />
          <label>Minor tasks</label>
          <div style={{ display:"flex", gap:8 }}>
            <input value={form.subText} onChange={e=>setForm(f=>({ ...f, subText: e.target.value }))} placeholder="Add a minor task..." style={{ flex:1, padding:10 }} />
            <button type="button" onClick={addSub}>Add</button>
          </div>
          <ul style={{ listStyle:"none", paddingLeft:0, margin:"6px 0 12px" }}>
            {form.subTasks.map((s,i)=><li key={i}>- {s.text}</li>)}
          </ul>

          <fieldset style={{ border:"1px solid #eee", borderRadius:8, padding:10, margin:"12px 0" }}>
            <legend>Schedule</legend>
            <select value={form.schedule.mode} onChange={e=>setForm(f=>({ ...f, schedule:{ ...f.schedule, mode: e.target.value } }))} style={{ width:"100%", padding:10, marginBottom:8 }}>
              <option value="everyday">Every day (forever)</option>
              <option value="weekdays">Specific weekdays</option>
              <option value="range">Date range (N days)</option>
            </select>

            {form.schedule.mode === "weekdays" && (
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:8 }}>
                {week.map((w,idx)=>(
                  <label key={idx} style={{ border:"1px solid #ddd", borderRadius:6, padding:"6px 10px", background: form.schedule.weekdays?.includes(idx) ? "#dfe9ff" : "#fff" }}>
                    <input type="checkbox" checked={form.schedule.weekdays?.includes(idx) || false} onChange={()=>toggleWeekday(idx)} style={{ marginRight:6 }} />
                    {w}
                  </label>
                ))}
              </div>
            )}

            {form.schedule.mode === "range" && (
              <div style={{ display:"flex", gap:10 }}>
                <input type="date" value={form.schedule.startDate || ""} onChange={e=>setForm(f=>({ ...f, schedule:{ ...f.schedule, startDate: e.target.value } }))} style={{ padding:10, flex:1 }} />
                <input type="date" value={form.schedule.endDate || ""} onChange={e=>setForm(f=>({ ...f, schedule:{ ...f.schedule, endDate: e.target.value } }))} style={{ padding:10, flex:1 }} />
              </div>
            )}
          </fieldset>

          <button type="submit" style={{ width:"100%", padding:12, background:"#222", color:"#fff", border:"none", borderRadius:8 }}>Save Card</button>
        </form>

        <div>
          <h3 style={{ marginTop: 0 }}>Your Cards</h3>
          {cards.length === 0 && <p>No cards yet. Create your Gym cards: e.g. Mon: Chest, Tue: Back…</p>}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:12 }}>
            {cards.map(c=>(
              <div key={c._id} style={{ background:"#fff", padding:14, borderRadius:10, boxShadow:"0 2px 6px rgba(0,0,0,0.06)" }}>
                <h4 style={{ marginTop:0 }}>{c.title} {c.type === "note" ? "🗒️" : "✅"}</h4>
                <p style={{ marginTop:4, color:"#666" }}>{c.description || "—"}</p>
                <p style={{ fontSize:12, color:"#999" }}>
                  {c.schedule.mode === "everyday" && "Every day"}
                  {c.schedule.mode === "weekdays" && `Weekdays: ${c.schedule.weekdays?.map(i=>week[i]).join(", ") || "—"}`}
                  {c.schedule.mode === "range" && `From ${c.schedule.startDate} to ${c.schedule.endDate}`}
                </p>
                {c.subTasks?.length > 0 && (
                  <ul style={{ fontSize:13, color:"#444" }}>
                    {c.subTasks.map(s=> <li key={s._id}>{s.text}</li>)}
                  </ul>
                )}
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={()=>deleteCard(c._id)} style={{ background:"#dc3545", color:"#fff", border:"none", padding:"6px 10px", borderRadius:6 }}>Delete</button>
                  {/* Simple inline rename example */}
                  <button onClick={()=>{
                    const title = prompt("Rename card", c.title);
                    if (title) updateCard(c._id, { title });
                  }}>Rename</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
