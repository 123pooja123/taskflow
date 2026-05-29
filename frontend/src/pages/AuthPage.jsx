import { useState } from "react";
import { authAPI } from "../api";

const s = {
  page: { minHeight:"100vh", background:"linear-gradient(135deg,#f5f3ff,#ede9fe,#e0e7ff)", display:"flex", alignItems:"center", justifyContent:"center", padding:16, fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" },
  card: { background:"#fff", borderRadius:20, padding:"28px 28px 24px", width:"100%", maxWidth:380, boxShadow:"0 4px 24px rgba(0,0,0,0.08)" },
  logo: { textAlign:"center", marginBottom:32 },
  logoBox: { width:52, height:52, background:"#6366f1", borderRadius:14, display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:24, marginBottom:14 },
  h1: { margin:"0 0 6px", fontSize:26, fontWeight:700, color:"#111827", letterSpacing:"-0.02em" },
  sub: { margin:0, color:"#6b7280", fontSize:14 },
  tabs: { display:"flex", gap:4, marginBottom:24, background:"#f3f4f6", borderRadius:10, padding:4 },
  input: { width:"100%", padding:"10px 14px", border:"1.5px solid #e5e7eb", borderRadius:10, fontSize:14, outline:"none", marginBottom:14, fontFamily:"inherit", boxSizing:"border-box" },
  btn: { width:"100%", padding:11, background:"#6366f1", color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"inherit" },
  err: { color:"#ef4444", fontSize:13, background:"#fef2f2", padding:"8px 12px", borderRadius:8, border:"1px solid #fecaca", marginBottom:14 },
  hint: { textAlign:"center", fontSize:12, color:"#9ca3af", marginTop:16, marginBottom:0 }
};

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name:"", email:"demo@example.com", password:"demo123" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const user = mode === "login"
        ? await authAPI.login(form.email, form.password)
        : await authAPI.register(form.name, form.email, form.password);
      onAuth(user);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const tabStyle = (m) => ({
    flex:1, padding:"8px 0", border:"none", cursor:"pointer", borderRadius:8,
    fontSize:13, fontWeight:600, fontFamily:"inherit", transition:"all 0.15s",
    background: mode===m ? "#fff" : "transparent",
    color: mode===m ? "#111827" : "#6b7280",
    boxShadow: mode===m ? "0 1px 4px rgba(0,0,0,0.1)" : "none"
  });

  return (
    <div style={s.page}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width:"100%", maxWidth:380 }}>
        <div style={s.logo}>
          <div style={s.logoBox}>✓</div>
          <h1 style={s.h1}>TaskFlow</h1>
          <p style={s.sub}>Manage your work, simply.</p>
        </div>
        <div style={s.card}>
          <div style={s.tabs}>
            <button style={tabStyle("login")} onClick={() => { setMode("login"); setError(""); }}>Sign In</button>
            <button style={tabStyle("register")} onClick={() => { setMode("register"); setError(""); }}>Create Account</button>
          </div>
          <form onSubmit={submit}>
            {mode === "register" && (
              <input value={form.name} onChange={e => set("name", e.target.value)} required
                placeholder="Full name" style={s.input}
                onFocus={e => e.target.style.borderColor="#6366f1"}
                onBlur={e => e.target.style.borderColor="#e5e7eb"} />
            )}
            <input type="email" value={form.email} onChange={e => set("email", e.target.value)} required
              placeholder="Email" style={s.input}
              onFocus={e => e.target.style.borderColor="#6366f1"}
              onBlur={e => e.target.style.borderColor="#e5e7eb"} />
            <input type="password" value={form.password} onChange={e => set("password", e.target.value)} required
              placeholder="Password" style={{ ...s.input, marginBottom:20 }}
              onFocus={e => e.target.style.borderColor="#6366f1"}
              onBlur={e => e.target.style.borderColor="#e5e7eb"} />
            {error && <p style={s.err}>{error}</p>}
            <button type="submit" disabled={loading} style={{ ...s.btn, background: loading ? "#a5b4fc" : "#6366f1", cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Please wait..." : mode === "login" ? "Sign In →" : "Create Account →"}
            </button>
          </form>
          {mode === "login" && <p style={s.hint}>Demo: demo@example.com / demo123</p>}
        </div>
      </div>
    </div>
  );
}
