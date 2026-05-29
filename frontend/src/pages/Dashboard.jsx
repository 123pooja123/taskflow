import { useEffect, useState, useCallback } from "react";
import { tasksAPI, aiAPI } from "../api";

const STAGES = ["Todo", "In Progress", "Done"];
const PRIORITIES = ["Low", "Medium", "High"];
const stageColor = { Todo:"#6366f1", "In Progress":"#f59e0b", Done:"#22c55e" };
const stageBg    = { Todo:"#eef2ff", "In Progress":"#fffbeb", Done:"#f0fdf4" };
const priColor   = { Low:"#22c55e", Medium:"#f59e0b", High:"#ef4444" };

const f = "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";

// ── tiny shared components ──────────────────────────────────

function Badge({ stage }) {
  return <span style={{ background:stageBg[stage], color:stageColor[stage], fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:20, border:`1px solid ${stageColor[stage]}22` }}>{stage}</span>;
}

function Dot({ priority }) {
  return <span style={{ width:8, height:8, borderRadius:"50%", background:priColor[priority], display:"inline-block", marginRight:5, verticalAlign:"middle" }} />;
}

function Spinner() {
  return <div style={{ display:"flex", justifyContent:"center", padding:"2rem" }}><div style={{ width:28, height:28, border:"2.5px solid #e5e7eb", borderTop:"2.5px solid #6366f1", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} /></div>;
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, padding:16 }} onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ background:"#fff", borderRadius:16, padding:"28px 28px 24px", width:"100%", maxWidth:460, boxShadow:"0 20px 60px rgba(0,0,0,0.18)", fontFamily:f }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
          <h2 style={{ margin:0, fontSize:17, fontWeight:600, color:"#111827" }}>{title}</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"#9ca3af", fontSize:22, lineHeight:1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── TaskForm ────────────────────────────────────────────────

function TaskForm({ task, onSave, onClose, saving }) {
  const [form, setForm] = useState({ title:task?.title||"", description:task?.description||"", priority:task?.priority||"Medium", stage:task?.stage||"Todo" });
  const set = (k,v) => setForm(f => ({...f,[k]:v}));
  const iStyle = { width:"100%", padding:"10px 14px", border:"1.5px solid #e5e7eb", borderRadius:10, fontSize:14, outline:"none", marginBottom:14, fontFamily:f, boxSizing:"border-box" };

  return (
    <form onSubmit={e => { e.preventDefault(); if(form.title.trim()) onSave(form); }}>
      <input value={form.title} onChange={e=>set("title",e.target.value)} required placeholder="Task title" style={iStyle} onFocus={e=>e.target.style.borderColor="#6366f1"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
      <textarea value={form.description} onChange={e=>set("description",e.target.value)} placeholder="Description (optional)" rows={2} style={{...iStyle,resize:"vertical",lineHeight:1.5}} onFocus={e=>e.target.style.borderColor="#6366f1"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
        {[["Priority","priority",PRIORITIES],["Stage","stage",STAGES]].map(([label,key,opts]) => (
          <div key={key}>
            <label style={{ fontSize:12, fontWeight:500, color:"#6b7280", display:"block", marginBottom:6 }}>{label}</label>
            <select value={form[key]} onChange={e=>set(key,e.target.value)} style={{...iStyle,marginBottom:0,cursor:"pointer"}}>
              {opts.map(o=><option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", gap:10 }}>
        <button type="button" onClick={onClose} style={{ flex:1, padding:10, background:"#f9fafb", border:"1.5px solid #e5e7eb", borderRadius:10, cursor:"pointer", fontSize:14, fontFamily:f, color:"#374151" }}>Cancel</button>
        <button type="submit" disabled={saving} style={{ flex:2, padding:10, background:saving?"#a5b4fc":"#6366f1", color:"#fff", border:"none", borderRadius:10, cursor:saving?"not-allowed":"pointer", fontSize:14, fontWeight:600, fontFamily:f }}>
          {saving ? "Saving..." : task ? "Save Changes" : "Create Task"}
        </button>
      </div>
    </form>
  );
}

// ── TaskCard ────────────────────────────────────────────────

function TaskCard({ task, onEdit, onDelete, onStage }) {
  const [busy, setBusy] = useState(false);
  const fmt = iso => new Date(iso).toLocaleDateString("en-IN",{day:"numeric",month:"short"});

  const del = async () => { setBusy(true); await onDelete(task.id); setBusy(false); };

  return (
    <div style={{ background:"#fff", border:"1.5px solid #f0f0f0", borderRadius:14, padding:"16px 18px", opacity:busy?0.5:1, transition:"box-shadow 0.2s,transform 0.2s" }}
      onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 4px 20px rgba(0,0,0,0.08)";e.currentTarget.style.transform="translateY(-1px)"}}
      onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="none"}}>
      <div style={{ display:"flex", justifyContent:"space-between", gap:8, marginBottom:10 }}>
        <div style={{ flex:1 }}>
          <p style={{ margin:"0 0 4px", fontWeight:600, fontSize:14, color:"#111827", lineHeight:1.4 }}>{task.title}</p>
          {task.description && <p style={{ margin:0, fontSize:12, color:"#9ca3af", lineHeight:1.5 }}>{task.description}</p>}
        </div>
        <div style={{ display:"flex", gap:4, flexShrink:0 }}>
          <button onClick={()=>onEdit(task)} style={{ background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:7, padding:"4px 10px", cursor:"pointer", fontSize:12, color:"#6b7280", fontFamily:f }}>Edit</button>
          <button onClick={del} disabled={busy} style={{ background:"#fff5f5", border:"1px solid #fecaca", borderRadius:7, padding:"4px 10px", cursor:"pointer", fontSize:12, color:"#ef4444", fontFamily:f }}>Del</button>
        </div>
      </div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <Badge stage={task.stage} />
          <span style={{ fontSize:11, color:"#9ca3af" }}><Dot priority={task.priority}/>{task.priority}</span>
        </div>
        <div style={{ display:"flex", gap:4 }}>
          {STAGES.filter(s=>s!==task.stage).map(s=>(
            <button key={s} onClick={()=>onStage(task.id,s)} style={{ background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:6, padding:"3px 8px", cursor:"pointer", fontSize:11, color:"#6b7280", fontFamily:f }}>→ {s}</button>
          ))}
        </div>
      </div>
      <p style={{ margin:"10px 0 0", fontSize:11, color:"#d1d5db" }}>{fmt(task.createdAt)}</p>
    </div>
  );
}

// ── AI Modal ────────────────────────────────────────────────

function AIModal({ onClose, onAdd }) {
  const [goal, setGoal] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const run = async () => {
    if (!goal.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const tasks = await aiAPI.breakdown(goal);
      setResult(tasks);
    } catch { setError("Could not generate tasks. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <Modal title="✨ AI Task Breakdown" onClose={onClose}>
      <input value={goal} onChange={e=>setGoal(e.target.value)} placeholder="e.g. Launch a portfolio website"
        style={{ width:"100%", padding:"10px 14px", border:"1.5px solid #e5e7eb", borderRadius:10, fontSize:14, outline:"none", fontFamily:f, boxSizing:"border-box", marginBottom:12 }}
        onFocus={e=>e.target.style.borderColor="#6366f1"} onBlur={e=>e.target.style.borderColor="#e5e7eb"}
        onKeyDown={e=>e.key==="Enter"&&run()} />
      <button onClick={run} disabled={loading||!goal.trim()} style={{ width:"100%", padding:10, background:loading?"#a5b4fc":"#6366f1", color:"#fff", border:"none", borderRadius:10, cursor:loading?"not-allowed":"pointer", fontSize:14, fontWeight:600, fontFamily:f, marginBottom:14 }}>
        {loading ? "Thinking..." : "Break it down →"}
      </button>
      {error && <p style={{ color:"#ef4444", fontSize:13, background:"#fef2f2", padding:"8px 12px", borderRadius:8, marginBottom:12 }}>{error}</p>}
      {loading && <div style={{ display:"flex", justifyContent:"center", padding:"1rem" }}><div style={{ width:24, height:24, border:"2px solid #e5e7eb", borderTop:"2px solid #6366f1", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/></div>}
      {result && (
        <div>
          <p style={{ fontSize:12, color:"#6b7280", marginBottom:8 }}>Click any task to add it:</p>
          {result.map((t,i) => (
            <div key={i} onClick={()=>onAdd(t)} style={{ border:"1.5px solid #e0e7ff", borderRadius:10, padding:"10px 14px", marginBottom:8, cursor:"pointer", background:"#fafafa", transition:"all 0.15s" }}
              onMouseEnter={e=>{e.currentTarget.style.background="#eef2ff";e.currentTarget.style.borderColor="#6366f1"}}
              onMouseLeave={e=>{e.currentTarget.style.background="#fafafa";e.currentTarget.style.borderColor="#e0e7ff"}}>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <p style={{ margin:"0 0 3px", fontWeight:600, fontSize:13, color:"#111827" }}>{t.title}</p>
                <span style={{ fontSize:11, color:priColor[t.priority], fontWeight:600, marginLeft:8 }}>{t.priority}</span>
              </div>
              <p style={{ margin:0, fontSize:12, color:"#9ca3af" }}>{t.description}</p>
            </div>
          ))}
          <button onClick={()=>{result.forEach(t=>onAdd(t));onClose();}} style={{ width:"100%", marginTop:8, padding:9, background:"#f0fdf4", border:"1.5px solid #bbf7d0", borderRadius:10, cursor:"pointer", fontSize:13, fontWeight:600, color:"#16a34a", fontFamily:f }}>
            Add all tasks
          </button>
        </div>
      )}
    </Modal>
  );
}

// ── Dashboard (main) ────────────────────────────────────────

export default function Dashboard({ user, onLogout }) {
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [modal, setModal]     = useState(null);
  const [editTask, setEdit]   = useState(null);
  const [filter, setFilter]   = useState("All");
  const [search, setSearch]   = useState("");
  const [saving, setSaving]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setTasks(await tasksAPI.getAll()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (data) => {
    setSaving(true);
    try { const t = await tasksAPI.create(data); setTasks(prev => [t,...prev]); setModal(null); }
    catch (e) { alert(e.message); }
    finally { setSaving(false); }
  };

  const handleUpdate = async (data) => {
    setSaving(true);
    try { const t = await tasksAPI.update(editTask.id, data); setTasks(prev => prev.map(x => x.id===editTask.id ? t : x)); setModal(null); setEdit(null); }
    catch (e) { alert(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await tasksAPI.delete(id); setTasks(prev => prev.filter(t => t.id !== id)); }
    catch (e) { alert(e.message); }
  };

  const handleStage = async (id, stage) => {
    try { const t = await tasksAPI.update(id,{stage}); setTasks(prev => prev.map(x => x.id===id ? t : x)); }
    catch (e) { alert(e.message); }
  };

  const handleAIAdd = async (t) => {
    try { const task = await tasksAPI.create(t); setTasks(prev => [task,...prev]); }
    catch {}
  };

  const counts = { All:tasks.length, ...Object.fromEntries(STAGES.map(s=>[s,tasks.filter(t=>t.stage===s).length])) };
  const doneP  = tasks.length ? Math.round((counts.Done/tasks.length)*100) : 0;
  const shown  = tasks.filter(t => (filter==="All"||t.stage===filter) && (!search||t.title.toLowerCase().includes(search.toLowerCase())||(t.description||"").toLowerCase().includes(search.toLowerCase())));

  return (
    <div style={{ minHeight:"100vh", background:"#f9fafb", fontFamily:f }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} *{box-sizing:border-box} input,select,textarea,button{font-family:inherit}`}</style>

      {/* Header */}
      <div style={{ background:"#fff", borderBottom:"1px solid #f0f0f0", padding:"0 24px", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ maxWidth:900, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", height:58 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:32, height:32, background:"#6366f1", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700 }}>✓</div>
            <span style={{ fontWeight:700, fontSize:17, color:"#111827", letterSpacing:"-0.02em" }}>TaskFlow</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:13, color:"#9ca3af" }}>Hi, {user.name.split(" ")[0]}</span>
            <button onClick={onLogout} style={{ background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:8, padding:"6px 14px", cursor:"pointer", fontSize:13, color:"#6b7280" }}>Sign Out</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:900, margin:"0 auto", padding:"24px 24px 60px" }}>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:12, marginBottom:20 }}>
          {[["Total Tasks",counts.All],["In Progress",counts["In Progress"]],["Completed",counts.Done],["Progress",`${doneP}%`]].map(([l,v])=>(
            <div key={l} style={{ background:"#fff", border:"1.5px solid #f0f0f0", borderRadius:14, padding:"16px 18px" }}>
              <p style={{ margin:"0 0 6px", fontSize:12, color:"#9ca3af", fontWeight:500 }}>{l}</p>
              <p style={{ margin:0, fontSize:22, fontWeight:700, color:"#111827" }}>{v}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        {tasks.length > 0 && (
          <div style={{ background:"#fff", border:"1.5px solid #f0f0f0", borderRadius:14, padding:"14px 18px", marginBottom:20 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
              <span style={{ fontSize:13, fontWeight:500, color:"#374151" }}>Overall Progress</span>
              <span style={{ fontSize:13, color:"#6b7280" }}>{counts.Done} of {tasks.length} done</span>
            </div>
            <div style={{ background:"#f3f4f6", borderRadius:99, height:8, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${doneP}%`, background:"linear-gradient(90deg,#6366f1,#8b5cf6)", borderRadius:99, transition:"width 0.5s ease" }} />
            </div>
          </div>
        )}

        {/* Controls */}
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:20, alignItems:"center" }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search tasks..."
            style={{ flex:"1 1 200px", padding:"9px 14px", border:"1.5px solid #e5e7eb", borderRadius:10, fontSize:14, outline:"none", background:"#fff" }}
            onFocus={e=>e.target.style.borderColor="#6366f1"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
          <div style={{ display:"flex", gap:4, background:"#f3f4f6", borderRadius:10, padding:3 }}>
            {["All",...STAGES].map(s=>(
              <button key={s} onClick={()=>setFilter(s)} style={{ padding:"6px 12px", border:"none", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:600, background:filter===s?"#fff":"transparent", color:filter===s?"#111827":"#6b7280", boxShadow:filter===s?"0 1px 3px rgba(0,0,0,0.1)":"none", transition:"all 0.15s", whiteSpace:"nowrap" }}>
                {s} ({counts[s]??0})
              </button>
            ))}
          </div>
          <button onClick={()=>setModal("ai")} style={{ padding:"9px 16px", background:"#f5f3ff", border:"1.5px solid #e0e7ff", borderRadius:10, cursor:"pointer", fontSize:13, fontWeight:600, color:"#6366f1" }}>✨ AI Breakdown</button>
          <button onClick={()=>setModal("create")} style={{ padding:"9px 18px", background:"#6366f1", color:"#fff", border:"none", borderRadius:10, cursor:"pointer", fontSize:13, fontWeight:600 }}>+ New Task</button>
        </div>

        {/* Error */}
        {error && <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:12, padding:"12px 16px", marginBottom:16, color:"#ef4444", fontSize:13 }}>⚠ {error} — is the backend running?</div>}

        {/* Tasks */}
        {loading ? <Spinner /> : shown.length===0 ? (
          <div style={{ textAlign:"center", padding:"60px 20px", color:"#9ca3af" }}>
            <p style={{ fontSize:32, margin:"0 0 12px" }}>📭</p>
            <p style={{ margin:0, fontWeight:600, color:"#374151" }}>{search||filter!=="All"?"No matching tasks":"No tasks yet"}</p>
            <p style={{ margin:"6px 0 0", fontSize:13 }}>{search||filter!=="All"?"Try adjusting your filters":"Create your first task above"}</p>
          </div>
        ) : (
          <div style={{ display:"grid", gap:10 }}>
            {shown.map(task=>(
              <TaskCard key={task.id} task={task}
                onEdit={t=>{setEdit(t);setModal("edit");}}
                onDelete={handleDelete}
                onStage={handleStage} />
            ))}
          </div>
        )}
      </div>

      {modal==="create" && <Modal title="New Task" onClose={()=>setModal(null)}><TaskForm onSave={handleCreate} onClose={()=>setModal(null)} saving={saving}/></Modal>}
      {modal==="edit" && editTask && <Modal title="Edit Task" onClose={()=>{setModal(null);setEdit(null);}}><TaskForm task={editTask} onSave={handleUpdate} onClose={()=>{setModal(null);setEdit(null);}} saving={saving}/></Modal>}
      {modal==="ai" && <AIModal onClose={()=>setModal(null)} onAdd={handleAIAdd}/>}
    </div>
  );
}
