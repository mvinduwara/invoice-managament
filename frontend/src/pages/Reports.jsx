import { useState } from "react";

const monthlyData = [
  { month:"Jan", revenue:18400, expenses:7200, profit:11200 },
  { month:"Feb", revenue:22100, expenses:8100, profit:14000 },
  { month:"Mar", revenue:19500, expenses:7600, profit:11900 },
  { month:"Apr", revenue:27300, expenses:9500, profit:17800 },
  { month:"May", revenue:24800, expenses:8900, profit:15900 },
  { month:"Jun", revenue:31200, expenses:10200, profit:21000 },
];

const topClients = [
  { name:"Acme Corp",       invoices:12, paid:10, revenue:48500, pct:92 },
  { name:"TechFlow Ltd",    invoices:9,  paid:8,  revenue:36200, pct:85 },
  { name:"NovaBuild Inc",   invoices:7,  paid:7,  revenue:31800, pct:100 },
  { name:"Vertex Solutions",invoices:11, paid:9,  revenue:28400, pct:78 },
  { name:"Skyline Group",   invoices:6,  paid:4,  revenue:19700, pct:62 },
];

const invoiceSummary = [
  { label:"Total Invoices Issued", value:"55", delta:"+12%", up:true },
  { label:"Paid Invoices",         value:"43", delta:"+8%",  up:true },
  { label:"Overdue Invoices",      value:"7",  delta:"-3%",  up:false },
  { label:"Draft Invoices",        value:"5",  delta:"+2%",  up:true },
];

const RANGES = ["Last 6 Months","Last 3 Months","This Year","Custom"];

const max = Math.max(...monthlyData.map(d => d.revenue));

const fmt = (n) => `$${Number(n).toLocaleString("en-US")}`;

export default function Reports() {
  const [range, setRange] = useState("Last 6 Months");
  const [chartType, setChartType] = useState("Revenue");

  const chartKey = chartType === "Revenue" ? "revenue" : chartType === "Expenses" ? "expenses" : "profit";
  const chartColor = chartType === "Revenue" ? "#D4A853" : chartType === "Expenses" ? "#EF4444" : "#10B981";

  const chartMax = Math.max(...monthlyData.map(d => d[chartKey]));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        .rep-root { min-height:100vh; background:#080C14; font-family:'DM Sans',sans-serif; color:#E2E8F0; padding:32px 40px; box-sizing:border-box; }

        .rep-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:40px; }
        .rep-title { font-family:'DM Serif Display',serif; font-size:38px; color:#F8FAFC; line-height:1.1; letter-spacing:-0.5px; }
        .rep-title span { color:#D4A853; font-style:italic; }
        .rep-subtitle { color:#64748B; font-size:14px; margin-top:6px; font-weight:300; }

        .header-actions { display:flex; gap:10px; align-items:center; }
        .range-select { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.09); border-radius:9px; padding:9px 14px; color:#94A3B8; font-family:'DM Sans',sans-serif; font-size:13px; outline:none; cursor:pointer; }
        .range-select option { background:#0F1623; }
        .export-btn { display:flex; align-items:center; gap:7px; background:linear-gradient(135deg,#D4A853,#B8892F); border:none; color:#0A0E17; font-family:'DM Sans',sans-serif; font-weight:600; font-size:13px; padding:10px 20px; border-radius:9px; cursor:pointer; transition:all 0.2s; }
        .export-btn:hover { box-shadow:0 6px 22px rgba(212,168,83,0.35); transform:translateY(-1px); }

        /* KPI row */
        .kpi-row { display:grid; grid-template-columns:repeat(4,1fr); gap:18px; margin-bottom:30px; }
        .kpi-card { background:rgba(255,255,255,0.025); border:1px solid rgba(255,255,255,0.07); border-radius:14px; padding:22px 24px; transition:border-color 0.2s; }
        .kpi-card:hover { border-color:rgba(212,168,83,0.2); }
        .kpi-label { font-size:11px; text-transform:uppercase; letter-spacing:1.4px; color:#475569; margin-bottom:10px; font-weight:500; }
        .kpi-value { font-family:'DM Serif Display',serif; font-size:32px; color:#F8FAFC; line-height:1; }
        .kpi-delta { display:inline-flex; align-items:center; gap:4px; font-size:12px; margin-top:8px; padding:3px 8px; border-radius:5px; font-weight:500; }
        .kpi-up   { background:rgba(16,185,129,0.1);  color:#10B981; }
        .kpi-down { background:rgba(239,68,68,0.1);   color:#EF4444; }

        /* Revenue summary cards */
        .rev-row { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; margin-bottom:30px; }
        .rev-card { border-radius:14px; padding:24px; position:relative; overflow:hidden; }
        .rev-card-label { font-size:11px; text-transform:uppercase; letter-spacing:1.3px; margin-bottom:10px; font-weight:500; opacity:0.75; }
        .rev-card-value { font-family:'DM Serif Display',serif; font-size:28px; line-height:1.1; }
        .rev-card-sub { font-size:12px; margin-top:6px; opacity:0.6; }

        /* Chart section */
        .section-card { background:rgba(255,255,255,0.025); border:1px solid rgba(255,255,255,0.07); border-radius:16px; padding:28px 30px; margin-bottom:26px; }
        .section-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:28px; }
        .section-title { font-family:'DM Serif Display',serif; font-size:22px; color:#F8FAFC; }
        .section-sub { font-size:13px; color:#475569; margin-top:3px; }

        .chart-toggle { display:flex; background:rgba(0,0,0,0.3); border-radius:9px; padding:3px; gap:2px; }
        .chart-tab { padding:7px 16px; border-radius:7px; font-size:12.5px; font-weight:500; cursor:pointer; border:none; background:transparent; font-family:'DM Sans',sans-serif; color:#64748B; transition:all 0.18s; }
        .chart-tab.active { background:rgba(212,168,83,0.15); color:#D4A853; }

        /* Bar Chart */
        .bar-chart { display:flex; align-items:flex-end; gap:12px; height:200px; padding-bottom:30px; position:relative; }
        .bar-chart::after { content:''; position:absolute; bottom:30px; left:0; right:0; height:1px; background:rgba(255,255,255,0.06); }
        .bar-wrap { flex:1; display:flex; flex-direction:column; align-items:center; gap:8px; height:100%; justify-content:flex-end; }
        .bar { width:100%; border-radius:6px 6px 0 0; transition:all 0.4s cubic-bezier(0.34,1.56,0.64,1); position:relative; min-height:4px; cursor:pointer; }
        .bar:hover { filter:brightness(1.2); }
        .bar-tooltip { position:absolute; top:-34px; left:50%; transform:translateX(-50%); background:#1E293B; border:1px solid rgba(255,255,255,0.1); border-radius:6px; padding:4px 10px; font-size:11.5px; color:#E2E8F0; white-space:nowrap; opacity:0; pointer-events:none; transition:opacity 0.15s; }
        .bar:hover .bar-tooltip { opacity:1; }
        .bar-month { font-size:11.5px; color:#475569; font-weight:500; }

        /* Grid lines */
        .chart-area { position:relative; }
        .grid-lines { position:absolute; inset:0; pointer-events:none; }

        /* Top clients table */
        .client-table { width:100%; border-collapse:collapse; }
        .client-table th { padding:10px 16px; text-align:left; font-size:11px; font-weight:500; text-transform:uppercase; letter-spacing:1.2px; color:#334155; }
        .client-table td { padding:14px 16px; font-size:13.5px; border-top:1px solid rgba(255,255,255,0.04); }
        .client-row:hover td { background:rgba(212,168,83,0.025); }
        .client-name-cell { font-weight:500; color:#E2E8F0; }
        .progress-wrap { display:flex; align-items:center; gap:10px; }
        .progress-bar-bg { flex:1; height:5px; background:rgba(255,255,255,0.07); border-radius:3px; overflow:hidden; }
        .progress-bar-fill { height:100%; border-radius:3px; background:linear-gradient(90deg,#D4A853,#F0C678); transition:width 0.6s ease; }
        .pct-label { font-size:12px; color:#94A3B8; min-width:32px; text-align:right; font-weight:500; }

        /* Two col layout */
        .two-col { display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-bottom:26px; }

        /* Donut */
        .donut-wrap { display:flex; align-items:center; justify-content:center; gap:36px; }
        .donut-legend { display:flex; flex-direction:column; gap:14px; }
        .legend-row { display:flex; align-items:center; gap:10px; font-size:13px; color:#94A3B8; }
        .legend-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
        .legend-val { font-family:'DM Serif Display',serif; font-size:16px; color:#E2E8F0; margin-left:auto; padding-left:16px; }
      `}</style>

      <div className="rep-root">
        {/* Header */}
        <div className="rep-header">
          <div>
            <div className="rep-title">Financial <span>Reports</span></div>
            <div className="rep-subtitle">Analytics overview for your invoice and payment activity</div>
          </div>
          <div className="header-actions">
            <select className="range-select" value={range} onChange={e=>setRange(e.target.value)}>
              {RANGES.map(r=><option key={r}>{r}</option>)}
            </select>
            <button className="export-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export PDF
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="kpi-row">
          {invoiceSummary.map((k,i)=>(
            <div className="kpi-card" key={i}>
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-value">{k.value}</div>
              <span className={`kpi-delta ${k.up?"kpi-up":"kpi-down"}`}>
                {k.up
                  ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>
                  : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                }
                {k.delta} vs last period
              </span>
            </div>
          ))}
        </div>

        {/* Revenue Summary */}
        <div className="rev-row">
          <div className="rev-card" style={{background:"linear-gradient(135deg,rgba(212,168,83,0.12),rgba(212,168,83,0.04))",border:"1px solid rgba(212,168,83,0.2)"}}>
            <div className="rev-card-label" style={{color:"#D4A853"}}>Total Revenue</div>
            <div className="rev-card-value" style={{color:"#F8FAFC"}}>{fmt(143300)}</div>
            <div className="rev-card-sub" style={{color:"#94A3B8"}}>Across all 6 months</div>
          </div>
          <div className="rev-card" style={{background:"linear-gradient(135deg,rgba(239,68,68,0.1),rgba(239,68,68,0.03))",border:"1px solid rgba(239,68,68,0.18)"}}>
            <div className="rev-card-label" style={{color:"#EF4444"}}>Total Expenses</div>
            <div className="rev-card-value" style={{color:"#F8FAFC"}}>{fmt(51500)}</div>
            <div className="rev-card-sub" style={{color:"#94A3B8"}}>Operational costs tracked</div>
          </div>
          <div className="rev-card" style={{background:"linear-gradient(135deg,rgba(16,185,129,0.1),rgba(16,185,129,0.03))",border:"1px solid rgba(16,185,129,0.18)"}}>
            <div className="rev-card-label" style={{color:"#10B981"}}>Net Profit</div>
            <div className="rev-card-value" style={{color:"#F8FAFC"}}>{fmt(91800)}</div>
            <div className="rev-card-sub" style={{color:"#94A3B8"}}>64.1% profit margin</div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="section-card">
          <div className="section-head">
            <div>
              <div className="section-title">Monthly Performance</div>
              <div className="section-sub">Breakdown by revenue, expenses, and net profit</div>
            </div>
            <div className="chart-toggle">
              {["Revenue","Expenses","Profit"].map(t=>(
                <button key={t} className={`chart-tab${chartType===t?" active":""}`} onClick={()=>setChartType(t)}>{t}</button>
              ))}
            </div>
          </div>
          <div className="bar-chart">
            {monthlyData.map((d,i)=>{
              const heightPct = (d[chartKey]/chartMax)*100;
              return (
                <div className="bar-wrap" key={i}>
                  <div
                    className="bar"
                    style={{
                      height:`${heightPct}%`,
                      background:`linear-gradient(180deg, ${chartColor}, ${chartColor}88)`,
                      boxShadow:`0 0 20px ${chartColor}33`
                    }}
                  >
                    <div className="bar-tooltip">{fmt(d[chartKey])}</div>
                  </div>
                  <span className="bar-month">{d.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Two column: Donut + Top Clients */}
        <div className="two-col">
          {/* Status Breakdown */}
          <div className="section-card" style={{margin:0}}>
            <div className="section-head" style={{marginBottom:"20px"}}>
              <div>
                <div className="section-title">Payment Status</div>
                <div className="section-sub">Distribution across all invoices</div>
              </div>
            </div>
            <div className="donut-wrap">
              <svg width="140" height="140" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="20"/>
                <circle cx="70" cy="70" r="52" fill="none" stroke="#10B981" strokeWidth="20"
                  strokeDasharray={`${0.78*326} ${326}`} strokeDashoffset="-82" strokeLinecap="round"/>
                <circle cx="70" cy="70" r="52" fill="none" stroke="#F59E0B" strokeWidth="20"
                  strokeDasharray={`${0.13*326} ${326}`} strokeDashoffset={`${-(0.78*326)-82}`} strokeLinecap="round"/>
                <circle cx="70" cy="70" r="52" fill="none" stroke="#EF4444" strokeWidth="20"
                  strokeDasharray={`${0.05*326} ${326}`} strokeDashoffset={`${-(0.91*326)-82}`} strokeLinecap="round"/>
                <circle cx="70" cy="70" r="52" fill="none" stroke="#8B5CF6" strokeWidth="20"
                  strokeDasharray={`${0.04*326} ${326}`} strokeDashoffset={`${-(0.96*326)-82}`} strokeLinecap="round"/>
                <text x="70" y="66" textAnchor="middle" fill="#F8FAFC" fontSize="20" fontFamily="DM Serif Display, serif">78%</text>
                <text x="70" y="82" textAnchor="middle" fill="#64748B" fontSize="10" fontFamily="DM Sans, sans-serif">Paid</text>
              </svg>
              <div className="donut-legend">
                {[
                  {label:"Completed", val:"43", color:"#10B981"},
                  {label:"Pending",   val:"7",  color:"#F59E0B"},
                  {label:"Failed",    val:"3",  color:"#EF4444"},
                  {label:"Refunded",  val:"2",  color:"#8B5CF6"},
                ].map((l,i)=>(
                  <div className="legend-row" key={i}>
                    <span className="legend-dot" style={{background:l.color}}></span>
                    {l.label}
                    <span className="legend-val">{l.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Clients */}
          <div className="section-card" style={{margin:0}}>
            <div className="section-head" style={{marginBottom:"16px"}}>
              <div>
                <div className="section-title">Top Clients</div>
                <div className="section-sub">Ranked by total revenue generated</div>
              </div>
            </div>
            <table className="client-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Revenue</th>
                  <th>Collection Rate</th>
                </tr>
              </thead>
              <tbody>
                {topClients.map((c,i)=>(
                  <tr className="client-row" key={i}>
                    <td>
                      <div className="client-name-cell">{c.name}</div>
                      <div style={{fontSize:"11.5px",color:"#475569",marginTop:"2px"}}>{c.invoices} invoices</div>
                    </td>
                    <td>
                      <span style={{fontFamily:"'DM Serif Display',serif",color:"#F8FAFC",fontSize:"14px"}}>{fmt(c.revenue)}</span>
                    </td>
                    <td>
                      <div className="progress-wrap">
                        <div className="progress-bar-bg">
                          <div className="progress-bar-fill" style={{width:`${c.pct}%`}}></div>
                        </div>
                        <span className="pct-label">{c.pct}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}