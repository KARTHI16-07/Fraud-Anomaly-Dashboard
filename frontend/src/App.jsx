import { useEffect, useMemo, useState } from 'react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { api } from './services/api.js';

const money = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0);
const prettyDate = (value) => new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

function App() {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ total: 0, normal: 0, suspicious: 0, suspiciousPercentage: 0 });
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  async function refresh() {
    setLoading(true);
    setError('');
    try {
      const [rows, summary, chart] = await Promise.all([api.getTransactions(), api.getDashboardStats(), api.getActivity()]);
      setTransactions(rows); setStats(summary); setActivity(chart);
    } catch (problem) {
      setError(problem.message || 'Unable to load transactions. Please try again.');
    } finally { setLoading(false); }
  }

  useEffect(() => { refresh(); }, []);

  const filtered = useMemo(() => transactions.filter((row) => {
    const matchesSearch = row.transactionId.toLowerCase().includes(query.trim().toLowerCase());
    return matchesSearch && (filter === 'ALL' || row.status === filter);
  }), [transactions, query, filter]);
  const mixData = [{ name: 'Normal', value: stats.normal, color: '#20846b' }, { name: 'Suspicious', value: stats.suspicious, color: '#c87919' }];

  async function addTransaction(event) {
    event.preventDefault(); setSaving(true); setFormError('');
    const data = new FormData(event.currentTarget);
    const payload = Object.fromEntries(data.entries());
    payload.amount = Number(payload.amount); payload.accountAge = Number(payload.accountAge); payload.transactionFrequency = Number(payload.transactionFrequency);
    try {
      const created = await api.createTransaction(payload);
      setShowForm(false); event.currentTarget.reset(); await refresh(); setSelected(created);
    } catch (problem) { setFormError(problem.message); }
    finally { setSaving(false); }
  }

  async function removeTransaction(event, id) {
    event.stopPropagation();
    if (!window.confirm('Delete this transaction?')) return;
    try { await api.deleteTransaction(id); if (selected?.id === id) setSelected(null); await refresh(); }
    catch (problem) { setError(problem.message); }
  }

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#top" aria-label="Fraud and Anomaly Detection home"><span className="brand-mark">F</span><span>Signal<span className="brand-light">Watch</span></span></a>
      <nav><a className="active" href="#dashboard">Dashboard</a><a href="#transactions">Transactions</a></nav>
      <button className="button button-primary top-action" onClick={() => { setFormError(''); setShowForm(true); }}>+ New transaction</button>
    </header>

    <main id="top" className="content">
      <section className="page-heading" id="dashboard">
        <div><div className="eyebrow">OVERVIEW <span className="live-dot" /> LIVE MONITORING</div><h1>Transaction monitoring</h1><p>A clear view of activity patterns that may need a closer look.</p></div>
        <div className="updated"><span className="status-dot" /> Monitoring active</div>
      </section>

      {error && <div className="alert" role="alert">{error}<button onClick={refresh}>Try again</button></div>}
      <section className="stat-grid" aria-label="Transaction summary">
        <StatCard label="Total transactions" value={stats.total.toLocaleString()} sub="Across all activity" icon="↗" tone="blue" />
        <StatCard label="Normal patterns" value={stats.normal.toLocaleString()} sub="Within expected range" icon="✓" tone="green" />
        <StatCard label="Flagged for review" value={stats.suspicious.toLocaleString()} sub="Unusual patterns detected" icon="!" tone="amber" />
        <StatCard label="Flagged rate" value={`${stats.suspiciousPercentage}%`} sub="Of all transactions" icon="◌" tone="purple" />
      </section>

      <section className="chart-grid">
        <article className="panel activity-panel"><div className="panel-heading"><div><h2>Transaction activity</h2><p>Daily volume over the last 7 days</p></div><span className="chart-key"><i /> Transactions</span></div>
          <div className="chart-wrap">{loading ? <Loading /> : <ResponsiveContainer width="100%" height="100%"><AreaChart data={activity} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}><defs><linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4569d4" stopOpacity={0.15} /><stop offset="95%" stopColor="#4569d4" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#edf0f5" vertical={false} /><XAxis dataKey="date" tickFormatter={(d) => new Date(`${d}T00:00:00`).toLocaleDateString('en', { weekday: 'short' })} axisLine={false} tickLine={false} tick={{ fill: '#9299a7', fontSize: 12 }} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#9299a7', fontSize: 12 }} /><Tooltip labelFormatter={(d) => prettyDate(`${d}T00:00:00`)} /><Area type="monotone" dataKey="total" name="Transactions" stroke="#4569d4" strokeWidth={2.5} fill="url(#activityFill)" /></AreaChart></ResponsiveContainer>}</div>
        </article>
        <article className="panel mix-panel"><div className="panel-heading"><div><h2>Pattern review</h2><p>Normal and flagged activity</p></div><span className="period-label">ALL TIME</span></div>
          <div className="mix-content"><div className="donut"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={mixData} dataKey="value" nameKey="name" innerRadius="70%" outerRadius="92%" paddingAngle={3} stroke="none">{mixData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer><div className="donut-center"><strong>{stats.total.toLocaleString()}</strong><span>Total</span></div></div><div className="legend-list"><Legend color="#20846b" label="Normal" value={stats.normal} /><Legend color="#c87919" label="Flagged" value={stats.suspicious} /></div></div>
          <div className="review-note"><span>i</span> Flags indicate unusual patterns, not confirmed fraud.</div>
        </article>
      </section>

      <section className="panel table-panel" id="transactions"><div className="table-top"><div><h2>Recent transactions</h2><p>Review transaction details and model signals</p></div><button className="button button-secondary" onClick={() => setShowForm(true)}>+ Add transaction</button></div>
        <div className="toolbar"><label className="search"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search transaction ID" aria-label="Search by transaction ID" /><kbd>⌘ K</kbd></label><div className="filters" role="group" aria-label="Filter transactions"><button className={filter === 'ALL' ? 'chosen' : ''} onClick={() => setFilter('ALL')}>All <span>{stats.total}</span></button><button className={filter === 'NORMAL' ? 'chosen' : ''} onClick={() => setFilter('NORMAL')}>Normal</button><button className={filter === 'SUSPICIOUS' ? 'chosen' : ''} onClick={() => setFilter('SUSPICIOUS')}>Flagged</button></div></div>
        <div className="table-scroll"><table><thead><tr><th>TRANSACTION</th><th>AMOUNT</th><th>TYPE</th><th>LOCATION</th><th>DATE</th><th>STATUS</th><th>SCORE</th><th></th></tr></thead><tbody>
          {loading ? <tr><td colSpan="8" className="table-message">Loading transactions…</td></tr> : filtered.length === 0 ? <tr><td colSpan="8" className="table-message">{transactions.length === 0 ? 'No transactions available.' : filter === 'SUSPICIOUS' ? 'No suspicious transactions found.' : 'No matching transactions found.'}</td></tr> : filtered.slice(0, 50).map((row) => <tr key={row.id} onClick={() => setSelected(row)} tabIndex="0" onKeyDown={(e) => e.key === 'Enter' && setSelected(row)}><td><span className="transaction-id">{row.transactionId}</span><span className="row-sub">ID #{row.id}</span></td><td className="amount">{money(row.amount)}</td><td>{row.transactionType}</td><td>{row.location}</td><td>{prettyDate(row.timestamp)}</td><td><Status status={row.status} /></td><td className={`score ${row.status === 'SUSPICIOUS' ? 'score-alert' : ''}`}>{Number(row.anomalyScore).toFixed(3)}</td><td><button className="row-menu" onClick={(e) => removeTransaction(e, row.id)} aria-label={`Delete ${row.transactionId}`} title="Delete transaction">×</button></td></tr>)}
        </tbody></table></div><div className="table-footer">Showing <strong>{Math.min(filtered.length, 50)}</strong> of <strong>{filtered.length}</strong> transactions <span>Scores are model signals only</span></div>
      </section>
      <footer className="footer"><span>SignalWatch <span className="footer-sep">·</span> Transaction anomaly demo</span><span>Suspicious activity is not necessarily fraudulent.</span></footer>
    </main>

    {selected && <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && setSelected(null)}><section className="modal detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-title"><div className="modal-header"><div><span className="eyebrow">TRANSACTION DETAILS</span><h2 id="detail-title">{selected.transactionId}</h2></div><button className="close" onClick={() => setSelected(null)} aria-label="Close">×</button></div><div className="detail-amount">{money(selected.amount)} <Status status={selected.status} /></div><div className="detail-grid"><Detail label="Transaction type" value={selected.transactionType} /><Detail label="Location" value={selected.location} /><Detail label="Date" value={prettyDate(selected.timestamp)} /><Detail label="Account age" value={`${selected.accountAge} days`} /><Detail label="Transactions today" value={selected.transactionFrequency} /><Detail label="Anomaly score" value={Number(selected.anomalyScore).toFixed(4)} /></div>{selected.status === 'SUSPICIOUS' && <div className="why-flagged"><h3>Why was this flagged?</h3><p>The model found this combination of amount, account age, and transaction frequency unusual compared with its sample patterns. This is a signal for review, not a finding of fraud.</p></div>}<p className="detail-disclaimer">Isolation Forest scores describe unusual patterns. They do not determine intent or confirm fraud.</p></section></div>}

    {showForm && <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && setShowForm(false)}><section className="modal form-modal" role="dialog" aria-modal="true" aria-labelledby="form-title"><div className="modal-header"><div><span className="eyebrow">NEW ACTIVITY</span><h2 id="form-title">Add a transaction</h2></div><button className="close" onClick={() => setShowForm(false)} aria-label="Close">×</button></div><p className="form-intro">The model will check the transaction pattern before it is saved.</p><form onSubmit={addTransaction}><div className="form-grid"><FormField label="Transaction ID" name="transactionId" placeholder="TXN1001" required maxLength="40" /><FormField label="Amount (₹)" name="amount" type="number" min="1" placeholder="8500" required /><label className="field"><span>Type</span><select name="transactionType" required><option value="TRANSFER">Transfer</option><option value="PAYMENT">Payment</option><option value="WITHDRAWAL">Withdrawal</option><option value="PURCHASE">Purchase</option></select></label><FormField label="Location" name="location" placeholder="Chennai" required /><FormField label="Account age (days)" name="accountAge" type="number" min="0" placeholder="120" required /><FormField label="Transactions today" name="transactionFrequency" type="number" min="0" placeholder="4" required /></div>{formError && <div className="form-error" role="alert">{formError}</div>}<div className="modal-actions"><button type="button" className="button button-secondary" onClick={() => setShowForm(false)}>Cancel</button><button disabled={saving} className="button button-primary">{saving ? 'Checking pattern…' : 'Check & save'}</button></div></form></section></div>}
  </div>;
}

function StatCard({ label, value, sub, icon, tone }) { return <article className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-sub">{sub}</div></article>; }
function Status({ status }) { const flagged = status === 'SUSPICIOUS'; return <span className={`badge ${flagged ? 'badge-alert' : 'badge-normal'}`}><i />{flagged ? 'Flagged' : 'Normal'}</span>; }
function Legend({ color, label, value }) { return <div className="legend-item"><span className="legend-dot" style={{ background: color }} />{label}<strong>{value.toLocaleString()}</strong></div>; }
function Detail({ label, value }) { return <div className="detail-item"><span>{label}</span><strong>{value}</strong></div>; }
function Loading() { return <div className="chart-loading">Loading dashboard…</div>; }
function FormField({ label, name, type = 'text', ...props }) { return <label className="field"><span>{label}</span><input name={name} type={type} {...props} /></label>; }

export default App;
