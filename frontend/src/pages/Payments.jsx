import { useState } from "react";

const payments = [
  { id: "PAY-001", invoice: "INV-2024-001", client: "Acme Corp", amount: 4500.0, method: "Bank Transfer", date: "2024-05-01", status: "Completed" },
  { id: "PAY-002", invoice: "INV-2024-002", client: "TechFlow Ltd", amount: 2200.5, method: "Credit Card", date: "2024-05-03", status: "Completed" },
  { id: "PAY-003", invoice: "INV-2024-003", client: "NovaBuild Inc", amount: 8750.0, method: "Bank Transfer", date: "2024-05-07", status: "Pending" },
  { id: "PAY-004", invoice: "INV-2024-004", client: "Skyline Group", amount: 1320.75, method: "PayPal", date: "2024-05-10", status: "Failed" },
  { id: "PAY-005", invoice: "INV-2024-005", client: "Vertex Solutions", amount: 5600.0, method: "Bank Transfer", date: "2024-05-12", status: "Completed" },
  { id: "PAY-006", invoice: "INV-2024-006", client: "BlueArc Digital", amount: 3100.0, method: "Credit Card", date: "2024-05-15", status: "Pending" },
  { id: "PAY-007", invoice: "INV-2024-007", client: "Orion Brands", amount: 9800.0, method: "Bank Transfer", date: "2024-05-18", status: "Completed" },
  { id: "PAY-008", invoice: "INV-2024-008", client: "PrimeLine Co", amount: 670.25, method: "PayPal", date: "2024-05-20", status: "Refunded" },
];

const statusConfig = {
  Completed: { bg: "rgba(16,185,129,0.12)", text: "#10B981", dot: "#10B981", border: "rgba(16,185,129,0.25)" },
  Pending:   { bg: "rgba(245,158,11,0.12)",  text: "#F59E0B", dot: "#F59E0B", border: "rgba(245,158,11,0.25)" },
  Failed:    { bg: "rgba(239,68,68,0.12)",   text: "#EF4444", dot: "#EF4444", border: "rgba(239,68,68,0.25)" },
  Refunded:  { bg: "rgba(139,92,246,0.12)",  text: "#8B5CF6", dot: "#8B5CF6", border: "rgba(139,92,246,0.25)" },
};

const methodIcon = {
  "Bank Transfer": (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  "Credit Card": (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  "PayPal": (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/>
    </svg>
  ),
};

const FILTERS = ["All", "Completed", "Pending", "Failed", "Refunded"];

export default function Payments() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ invoice: "", client: "", amount: "", method: "Bank Transfer", date: "" });

  const filtered = payments.filter((p) => {
    const matchFilter = activeFilter === "All" || p.status === activeFilter;
    const matchSearch =
      p.client.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.invoice.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalReceived = payments.filter(p => p.status === "Completed").reduce((s, p) => s + p.amount, 0);
  const totalPending  = payments.filter(p => p.status === "Pending").reduce((s, p) => s + p.amount, 0);
  const totalFailed   = payments.filter(p => p.status === "Failed").reduce((s, p) => s + p.amount, 0);

  const fmt = (n) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        .pay-root { min-height:100vh; background:#080C14; font-family:'DM Sans',sans-serif; color:#E2E8F0; padding:32px 40px; box-sizing:border-box; }
        .pay-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:40px; }
        .pay-title { font-family:'DM Serif Display',serif; font-size:38px; color:#F8FAFC; line-height:1.1; letter-spacing:-0.5px; }
        .pay-title span { color:#D4A853; font-style:italic; }
        .pay-subtitle { color:#64748B; font-size:14px; margin-top:6px; font-weight:300; letter-spacing:0.3px; }

        .btn-new { background:linear-gradient(135deg,#D4A853,#B8892F); border:none; color:#0A0E17; font-family:'DM Sans',sans-serif; font-weight:600; font-size:13px; padding:11px 22px; border-radius:10px; cursor:pointer; display:flex; align-items:center; gap:8px; letter-spacing:0.3px; transition:all 0.2s; box-shadow:0 4px 20px rgba(212,168,83,0.3); }
        .btn-new:hover { transform:translateY(-1px); box-shadow:0 8px 28px rgba(212,168,83,0.4); }

        .stats-row { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; margin-bottom:32px; }
        .stat-card { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:16px; padding:24px 26px; position:relative; overflow:hidden; transition:border-color 0.2s; }
        .stat-card:hover { border-color:rgba(212,168,83,0.25); }
        .stat-card::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:var(--accent); }
        .stat-label { font-size:11px; font-weight:500; text-transform:uppercase; letter-spacing:1.5px; color:#475569; margin-bottom:12px; }
        .stat-value { font-family:'DM Serif Display',serif; font-size:30px; color:#F8FAFC; letter-spacing:-0.5px; }
        .stat-sub { font-size:12px; color:#475569; margin-top:6px; font-weight:300; }

        .toolbar { display:flex; align-items:center; gap:14px; margin-bottom:24px; }
        .search-wrap { position:relative; flex:1; max-width:360px; }
        .search-icon { position:absolute; left:14px; top:50%; transform:translateY(-50%); color:#475569; pointer-events:none; }
        .search-input { width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px 10px 40px; color:#E2E8F0; font-family:'DM Sans',sans-serif; font-size:13.5px; outline:none; transition:all 0.2s; box-sizing:border-box; }
        .search-input::placeholder { color:#475569; }
        .search-input:focus { border-color:rgba(212,168,83,0.4); background:rgba(255,255,255,0.06); }

        .filter-tabs { display:flex; gap:6px; flex-wrap:wrap; }
        .filter-tab { padding:8px 16px; border-radius:8px; font-size:12.5px; font-weight:500; cursor:pointer; border:1px solid transparent; transition:all 0.18s; background:transparent; font-family:'DM Sans',sans-serif; color:#64748B; }
        .filter-tab.active { background:rgba(212,168,83,0.12); border-color:rgba(212,168,83,0.35); color:#D4A853; }
        .filter-tab:hover:not(.active) { background:rgba(255,255,255,0.04); color:#94A3B8; }

        .table-wrap { background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.07); border-radius:16px; overflow:hidden; }
        table { width:100%; border-collapse:collapse; }
        thead { background:rgba(0,0,0,0.25); }
        th { padding:13px 20px; text-align:left; font-size:11px; font-weight:500; text-transform:uppercase; letter-spacing:1.2px; color:#475569; white-space:nowrap; }
        td { padding:16px 20px; font-size:13.5px; border-top:1px solid rgba(255,255,255,0.045); vertical-align:middle; }
        tr:hover td { background:rgba(212,168,83,0.025); }

        .pay-id { font-family:'DM Serif Display',serif; color:#94A3B8; font-size:13px; }
        .inv-badge { background:rgba(99,102,241,0.12); border:1px solid rgba(99,102,241,0.2); color:#818CF8; font-size:11.5px; padding:3px 9px; border-radius:5px; font-weight:500; }
        .client-name { font-weight:500; color:#E2E8F0; }
        .amount-val { font-family:'DM Serif Display',serif; color:#F8FAFC; font-size:15px; }
        .method-cell { display:flex; align-items:center; gap:7px; color:#94A3B8; font-size:13px; }

        .status-pill { display:inline-flex; align-items:center; gap:6px; padding:4px 11px; border-radius:20px; font-size:11.5px; font-weight:500; border:1px solid; }
        .status-dot { width:6px; height:6px; border-radius:50%; }

        .action-btn { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); border-radius:7px; width:32px; height:32px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#64748B; transition:all 0.15s; }
        .action-btn:hover { background:rgba(212,168,83,0.1); border-color:rgba(212,168,83,0.3); color:#D4A853; }

        .empty-state { text-align:center; padding:60px 20px; color:#475569; }
        .empty-state p { font-size:14px; margin-top:8px; }

        /* Modal */
        .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.75); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; z-index:1000; animation:fadeIn 0.2s; }
        @keyframes fadeIn { from{opacity:0}to{opacity:1} }
        .modal { background:#0F1623; border:1px solid rgba(255,255,255,0.1); border-radius:20px; width:100%; max-width:480px; padding:36px; box-shadow:0 40px 80px rgba(0,0,0,0.6); animation:slideUp 0.25s; }
        @keyframes slideUp { from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1} }
        .modal-title { font-family:'DM Serif Display',serif; font-size:26px; color:#F8FAFC; margin-bottom:6px; }
        .modal-sub { color:#64748B; font-size:13px; margin-bottom:28px; }
        .form-row { margin-bottom:18px; }
        .form-label { display:block; font-size:11.5px; font-weight:500; text-transform:uppercase; letter-spacing:1px; color:#64748B; margin-bottom:7px; }
        .form-input, .form-select { width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:11px 14px; color:#E2E8F0; font-family:'DM Sans',sans-serif; font-size:13.5px; outline:none; transition:border-color 0.2s; box-sizing:border-box; }
        .form-input::placeholder { color:#475569; }
        .form-input:focus, .form-select:focus { border-color:rgba(212,168,83,0.5); }
        .form-select { appearance:none; cursor:pointer; }
        .form-select option { background:#0F1623; }
        .modal-footer { display:flex; gap:12px; margin-top:28px; }
        .btn-cancel { flex:1; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.09); color:#94A3B8; border-radius:10px; padding:12px; font-family:'DM Sans',sans-serif; font-size:13.5px; cursor:pointer; transition:all 0.15s; }
        .btn-cancel:hover { background:rgba(255,255,255,0.07); }
        .btn-submit { flex:2; background:linear-gradient(135deg,#D4A853,#B8892F); border:none; color:#0A0E17; border-radius:10px; padding:12px; font-family:'DM Sans',sans-serif; font-size:13.5px; font-weight:600; cursor:pointer; transition:all 0.2s; }
        .btn-submit:hover { box-shadow:0 6px 20px rgba(212,168,83,0.35); }

        .divider-line { height:1px; background:rgba(255,255,255,0.07); margin:6px 0 24px; }
      `}</style>

      <div className="pay-root">
        {/* Header */}
        <div className="pay-header">
          <div>
            <div className="pay-title">Payment <span>Transactions</span></div>
            <div className="pay-subtitle">Track and manage all incoming payment records</div>
          </div>
          <button className="btn-new" onClick={() => setShowModal(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Record Payment
          </button>
        </div>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card" style={{ "--accent": "linear-gradient(90deg,#10B981,transparent)" }}>
            <div className="stat-label">Total Received</div>
            <div className="stat-value">{fmt(totalReceived)}</div>
            <div className="stat-sub">{payments.filter(p=>p.status==="Completed").length} completed transactions</div>
          </div>
          <div className="stat-card" style={{ "--accent": "linear-gradient(90deg,#F59E0B,transparent)" }}>
            <div className="stat-label">Awaiting Payment</div>
            <div className="stat-value">{fmt(totalPending)}</div>
            <div className="stat-sub">{payments.filter(p=>p.status==="Pending").length} pending transactions</div>
          </div>
          <div className="stat-card" style={{ "--accent": "linear-gradient(90deg,#EF4444,transparent)" }}>
            <div className="stat-label">Failed / Refunded</div>
            <div className="stat-value">{fmt(totalFailed)}</div>
            <div className="stat-sub">{payments.filter(p=>p.status==="Failed"||p.status==="Refunded").length} flagged transactions</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-wrap">
            <span className="search-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input className="search-input" placeholder="Search by client, ID, or invoice..." value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <div className="filter-tabs">
            {FILTERS.map(f => (
              <button key={f} className={`filter-tab${activeFilter===f?" active":""}`} onClick={()=>setActiveFilter(f)}>{f}</button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Invoice</th>
                <th>Client</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="8">
                  <div className="empty-state">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <p>No payments match your search.</p>
                  </div>
                </td></tr>
              ) : (
                filtered.map(p => {
                  const s = statusConfig[p.status];
                  return (
                    <tr key={p.id}>
                      <td><span className="pay-id">{p.id}</span></td>
                      <td><span className="inv-badge">{p.invoice}</span></td>
                      <td><span className="client-name">{p.client}</span></td>
                      <td><span className="amount-val">{fmt(p.amount)}</span></td>
                      <td>
                        <span className="method-cell">
                          {methodIcon[p.method]}
                          {p.method}
                        </span>
                      </td>
                      <td style={{color:"#64748B",fontSize:"13px"}}>{p.date}</td>
                      <td>
                        <span className="status-pill" style={{ background:s.bg, color:s.text, borderColor:s.border }}>
                          <span className="status-dot" style={{background:s.dot}}></span>
                          {p.status}
                        </span>
                      </td>
                      <td>
                        <div style={{display:"flex",gap:"6px"}}>
                          <button className="action-btn" title="View">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          </button>
                          <button className="action-btn" title="Edit">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <div className="modal">
            <div className="modal-title">Record Payment</div>
            <div className="modal-sub">Add a new payment transaction to the ledger</div>
            <div className="divider-line" />
            <div className="form-row">
              <label className="form-label">Invoice Number</label>
              <input className="form-input" placeholder="INV-2024-009" value={form.invoice} onChange={e=>setForm({...form,invoice:e.target.value})} />
            </div>
            <div className="form-row">
              <label className="form-label">Client Name</label>
              <input className="form-input" placeholder="Client company name" value={form.client} onChange={e=>setForm({...form,client:e.target.value})} />
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
              <div className="form-row">
                <label className="form-label">Amount (USD)</label>
                <input className="form-input" type="number" placeholder="0.00" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} />
              </div>
              <div className="form-row">
                <label className="form-label">Date</label>
                <input className="form-input" type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} />
              </div>
            </div>
            <div className="form-row">
              <label className="form-label">Payment Method</label>
              <select className="form-select" value={form.method} onChange={e=>setForm({...form,method:e.target.value})}>
                <option>Bank Transfer</option>
                <option>Credit Card</option>
                <option>PayPal</option>
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={()=>setShowModal(false)}>Cancel</button>
              <button className="btn-submit" onClick={()=>setShowModal(false)}>Save Transaction</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}