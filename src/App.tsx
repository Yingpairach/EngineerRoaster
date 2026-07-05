import { useMemo, useState } from 'react'
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Folder, LogOut, MapPin, Menu, Plus, Search, Settings, SlidersHorizontal, Users, UserRound, X } from 'lucide-react'
import { seedEngineers, seedProjects, makeSeedAssignments } from './data'
import type { Assignment, Engineer, Project, Session, ViewMode } from './types'

/* ---------- date helpers (local time, Asia/Bangkok safe) ---------- */
const pad = (n: number) => String(n).padStart(2, '0')
const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const parse = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }
const startOfWeek = (d: Date) => addDays(d, -((d.getDay() + 6) % 7)) // Monday
const DOW = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const todayStr = () => fmt(new Date())

/* ---------- persisted state ---------- */
function load<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) as T : fallback } catch { return fallback }
}
function persist<T>(key: string, value: T) { localStorage.setItem(key, JSON.stringify(value)) }

/* ---------- login ---------- */
function Login({ onLogin }: { onLogin: (s: Session) => void }) {
  const people: Session[] = [
    { userId: 'sara', name: 'Sara Rodriguez', initials: 'SR', role: 'Admin' },
    ...seedEngineers.map(e => ({ userId: e.id, name: e.name, initials: e.initials, role: 'Engineer' as const })),
  ]
  return <div className="login">
    <div className="login-card">
      <div className="brand dark"><div className="brandmark">R</div><span>Rosterly</span></div>
      <h1>Sign in</h1>
      <p>Choose your account to continue. Microsoft 365 single sign-on will replace this once the Azure AD backend is connected.</p>
      <div className="login-people">
        {people.map((p, i) => <button key={p.userId} onClick={() => onLogin(p)}>
          <span className={`avatar c${i % 6}`}>{p.initials}</span>
          <span className="login-text"><b>{p.name}</b><small>{p.role}</small></span>
          <ChevronRight size={16} />
        </button>)}
      </div>
    </div>
  </div>
}

/* ---------- sidebar ---------- */
function Sidebar({ active, setActive, onSignOut }: { active: string, setActive: (v: string) => void, onSignOut: () => void }) {
  const links = [
    ['Calendar', CalendarDays], ['My schedule', UserRound], ['Projects', Folder], ['Engineers', Users], ['Admin', Settings],
  ] as const
  return <aside className="sidebar">
    <div className="brand"><div className="brandmark">R</div><span>Rosterly</span></div>
    <nav>{links.map(([label, Icon]) => <button key={label} className={active === label ? 'active' : ''} onClick={() => setActive(label)}><Icon size={19} /><span>{label}</span></button>)}</nav>
    <div className="side-bottom">
      <div className="connected"><i /> <span>Microsoft 365 connected</span></div>
      <button><CircleHelp size={19} />Help & support</button>
      <button onClick={onSignOut}><LogOut size={19} />Sign out</button>
    </div>
  </aside>
}

/* ---------- assignment drawer ---------- */
function AssignmentDrawer({ onClose, onSave, prefill, session, engineers, projects }: {
  onClose: () => void, onSave: (a: Assignment) => void, prefill: { date?: string, engineerId?: string },
  session: Session, engineers: Engineer[], projects: Project[]
}) {
  const isAdmin = session.role === 'Admin'
  const [engineerId, setEngineer] = useState(prefill.engineerId ?? (isAdmin ? engineers[0]?.id ?? '' : session.userId))
  const [projectId, setProject] = useState(projects[0]?.id ?? '')
  const [date, setDate] = useState(prefill.date ?? todayStr())
  const [start, setStart] = useState('09:00')
  const [end, setEnd] = useState('17:00')
  const [details, setDetails] = useState('')
  const [status, setStatus] = useState<'Confirmed' | 'Draft'>('Confirmed')
  const project = projects.find(p => p.id === projectId)
  const save = () => { onSave({ id: crypto.randomUUID(), engineerId, projectId, date, start, end, details: details || 'Project delivery work', status }); onClose() }
  return <aside className="drawer">
    <div className="drawer-head"><h2>Assign task</h2><button aria-label="Close" onClick={onClose}><X size={20} /></button></div>
    {!isAdmin && <p className="scope-note">You’re assigning a task to your own schedule.</p>}
    <label>Engineer<select value={engineerId} onChange={e => setEngineer(e.target.value)} disabled={!isAdmin}>{engineers.map(e => <option value={e.id} key={e.id}>{e.name}</option>)}</select></label>
    <label>Project<select value={projectId} onChange={e => setProject(e.target.value)}>{projects.map(p => <option value={p.id} key={p.id}>{p.name}</option>)}</select></label>
    {project && <p className="location-note"><MapPin size={13} /> {project.location}</p>}
    <label>Date<input type="date" value={date} onChange={e => setDate(e.target.value)} /></label>
    <div className="time-row"><label>Start time<input type="time" value={start} onChange={e => setStart(e.target.value)} /></label><label>End time<input type="time" value={end} onChange={e => setEnd(e.target.value)} /></label></div>
    <label>Task details<textarea value={details} onChange={e => setDetails(e.target.value)} placeholder="What will be delivered?" /></label>
    <label>Status<select value={status} onChange={e => setStatus(e.target.value as 'Confirmed' | 'Draft')}><option>Confirmed</option><option>Draft</option></select></label>
    <div className="drawer-actions"><button className="primary" onClick={save}>Save assignment</button><button onClick={onClose}>Cancel</button></div>
  </aside>
}

/* ---------- project drawer ---------- */
function ProjectDrawer({ onClose, onSave }: { onClose: () => void, onSave: (p: Project) => void }) {
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [color, setColor] = useState<Project['color']>('teal')
  const save = () => {
    if (!name.trim()) return
    onSave({ id: crypto.randomUUID(), name: name.trim(), location: location.trim() || '—', color })
    onClose()
  }
  return <aside className="drawer">
    <div className="drawer-head"><h2>New project</h2><button aria-label="Close" onClick={onClose}><X size={20} /></button></div>
    <label>Project name<input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Front-desk PMS rollout" autoFocus /></label>
    <label>Location / site<input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Riverside Grand Hotel, Bangkok" /></label>
    <label>Colour<select value={color} onChange={e => setColor(e.target.value as Project['color'])}><option value="teal">Teal</option><option value="blue">Blue</option><option value="amber">Amber</option><option value="slate">Slate</option></select></label>
    <div className="drawer-actions"><button className="primary" onClick={save} disabled={!name.trim()}>Create project</button><button onClick={onClose}>Cancel</button></div>
  </aside>
}

/* ---------- engineer drawer ---------- */
function EngineerDrawer({ onClose, onSave }: { onClose: () => void, onSave: (e: Engineer) => void }) {
  const [name, setName] = useState('')
  const [role, setRole] = useState('Software Engineer')
  const save = () => {
    if (!name.trim()) return
    const initials = name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()
    onSave({ id: crypto.randomUUID(), name: name.trim(), role, initials, status: 'Available' })
    onClose()
  }
  return <aside className="drawer">
    <div className="drawer-head"><h2>Add engineer</h2><button aria-label="Close" onClick={onClose}><X size={20} /></button></div>
    <label>Full name<input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Nok Suwan" autoFocus /></label>
    <label>Role<input value={role} onChange={e => setRole(e.target.value)} /></label>
    <div className="drawer-actions"><button className="primary" onClick={save} disabled={!name.trim()}>Add engineer</button><button onClick={onClose}>Cancel</button></div>
  </aside>
}

/* ---------- main app ---------- */
export default function App() {
  const [session, setSession] = useState<Session | null>(() => load<Session | null>('rosterly.session', null))
  const [active, setActive] = useState('Calendar')
  const [engineers, setEngineers] = useState<Engineer[]>(() => load('rosterly.engineers.v1', seedEngineers))
  const [projects, setProjects] = useState<Project[]>(() => load('rosterly.projects.v1', seedProjects))
  const [assignments, setAssignments] = useState<Assignment[]>(() => load('rosterly.assignments.v2', makeSeedAssignments()))
  const [view, setView] = useState<ViewMode>('week')
  const [anchor, setAnchor] = useState<string>(todayStr())
  const [drawer, setDrawer] = useState<null | { kind: 'assignment', date?: string, engineerId?: string } | { kind: 'project' } | { kind: 'engineer' }>(null)
  const [search, setSearch] = useState('')
  const [projectFilter, setProjectFilter] = useState('all')

  const isAdmin = session?.role === 'Admin'
  const anchorDate = parse(anchor)

  const visibleEngineers = useMemo(() => engineers.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) && (active !== 'My schedule' || e.id === session?.userId)
  ), [engineers, search, active, session])

  const saveAssignment = (a: Assignment) => {
    const next = [...assignments.filter(x => !(x.engineerId === a.engineerId && x.date === a.date && x.start === a.start)), a]
    setAssignments(next); persist('rosterly.assignments.v2', next)
  }
  const saveProject = (p: Project) => { const next = [...projects, p]; setProjects(next); persist('rosterly.projects.v1', next) }
  const saveEngineer = (e: Engineer) => { const next = [...engineers, e]; setEngineers(next); persist('rosterly.engineers.v1', next) }
  const signOut = () => { localStorage.removeItem('rosterly.session'); setSession(null); setActive('Calendar') }
  const signIn = (s: Session) => { persist('rosterly.session', s); setSession(s) }

  if (!session) return <Login onLogin={signIn} />

  /* ----- calendar navigation ----- */
  const step = (dir: -1 | 1) => {
    if (view === 'day') setAnchor(fmt(addDays(anchorDate, dir)))
    else if (view === 'week') setAnchor(fmt(addDays(anchorDate, dir * 7)))
    else { const d = new Date(anchorDate); d.setMonth(d.getMonth() + dir, 1); setAnchor(fmt(d)) }
  }
  const days = view === 'day'
    ? [anchorDate]
    : view === 'week'
      ? [0, 1, 2, 3, 4, 5, 6].map(i => addDays(startOfWeek(anchorDate), i))
      : []
  const rangeLabel = view === 'month'
    ? `${MONTHS[anchorDate.getMonth()]} ${anchorDate.getFullYear()}`
    : view === 'day'
      ? `${DOW[(anchorDate.getDay() + 6) % 7]} ${anchorDate.getDate()} ${MONTHS[anchorDate.getMonth()]} ${anchorDate.getFullYear()}`
      : `${days[0].getDate()} ${MONTHS[days[0].getMonth()].slice(0, 3)} – ${days[6].getDate()} ${MONTHS[days[6].getMonth()].slice(0, 3)} ${days[6].getFullYear()}`

  const cellAssignments = (engineerId: string, date: string) =>
    assignments.filter(x => x.engineerId === engineerId && x.date === date && (projectFilter === 'all' || x.projectId === projectFilter))

  /* ----- month grid ----- */
  const monthCells = useMemo(() => {
    if (view !== 'month') return []
    const first = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1)
    const start = startOfWeek(first)
    return [...Array(42)].map((_, i) => addDays(start, i))
  }, [view, anchor])

  const title = active === 'My schedule' ? 'My schedule' : active === 'Admin' ? 'Access & people' : active === 'Projects' ? 'Projects' : active === 'Engineers' ? 'Engineers' : 'Engineering roster'

  return <div className="app">
    <Sidebar active={active} setActive={setActive} onSignOut={signOut} />
    <main className="main">
      <header><button className="mobile-menu"><Menu /></button><div><h1>{title}</h1><p>Plan the week. Keep every engineer in sync.</p></div>
        <div className="header-actions">
          <div className="sync"><i /> O365 connected</div>
          <div className="profile"><span className="avatar small">{session.initials}</span><span><b>{session.name}</b><small>{session.role === 'Admin' ? 'Administrator' : 'Engineer view'}</small></span></div>
        </div>
      </header>

      {active === 'Admin' && <section className="admin-page">
        <div className="section-title"><div><h2>People & access</h2><p>Manage who can sign in and assign work.</p></div><button className="primary" onClick={() => setDrawer({ kind: 'engineer' })}><Plus size={17} /> Add engineer</button></div>
        <div className="access-table"><div className="table-head"><span>Employee</span><span>Role</span><span>Self assign</span><span>Status</span></div>
          {engineers.map((e, i) => <div className="access-row" key={e.id}><span className="person"><span className={`avatar c${i % 6}`}>{e.initials}</span><span><b>{e.name}</b><small>{e.name.toLowerCase().split(/\s+/).join('.')}@contoso.com</small></span></span><select defaultValue={i === 0 ? 'Admin' : 'Engineer'}><option>Admin</option><option>Engineer</option></select><label className="switch"><input type="checkbox" defaultChecked /><span /></label><span className="status-active"><i /> Active</span></div>)}</div>
      </section>}

      {active === 'Projects' && <section className="admin-page">
        <div className="section-title"><div><h2>Projects</h2><p>Every project with its work site. Assignments link back here.</p></div><button className="primary" onClick={() => setDrawer({ kind: 'project' })}><Plus size={17} /> New project</button></div>
        <div className="project-grid">
          {projects.map(p => {
            const count = assignments.filter(a => a.projectId === p.id).length
            return <div className={`project-card ${p.color}`} key={p.id}>
              <b>{p.name}</b>
              <span className="project-loc"><MapPin size={13} /> {p.location}</span>
              <small>{count} assignment{count === 1 ? '' : 's'}</small>
            </div>
          })}
        </div>
      </section>}

      {active === 'Engineers' && <section className="admin-page">
        <div className="section-title"><div><h2>Engineers</h2><p>The delivery team roster.</p></div>{isAdmin && <button className="primary" onClick={() => setDrawer({ kind: 'engineer' })}><Plus size={17} /> Add engineer</button>}</div>
        <div className="access-table"><div className="table-head"><span>Engineer</span><span>Role</span><span>Status</span><span>This week</span></div>
          {engineers.map((e, i) => {
            const wk = [0, 1, 2, 3, 4, 5, 6].map(n => fmt(addDays(startOfWeek(new Date()), n)))
            const count = assignments.filter(a => a.engineerId === e.id && wk.includes(a.date)).length
            return <div className="access-row" key={e.id}><span className="person"><span className={`avatar c${i % 6}`}>{e.initials}</span><span><b>{e.name}</b><small>{e.role}</small></span></span><span>{e.role}</span><span className="status-active"><i /> {e.status}</span><span>{count} task{count === 1 ? '' : 's'}</span></div>
          })}</div>
      </section>}

      {(active === 'Calendar' || active === 'My schedule') && <section className="calendar-page">
        <div className="toolbar">
          <div className="date-nav">
            <button aria-label="Previous" onClick={() => step(-1)}><ChevronLeft size={18} /></button>
            <button className="today" onClick={() => setAnchor(todayStr())}>Today</button>
            <button aria-label="Next" onClick={() => step(1)}><ChevronRight size={18} /></button>
            <strong>{rangeLabel}</strong>
            <input type="date" className="date-jump" value={anchor} onChange={e => e.target.value && setAnchor(e.target.value)} aria-label="Jump to date" />
          </div>
          <div className="tools">
            <div className="view-switch" role="tablist">
              {(['day', 'week', 'month'] as ViewMode[]).map(v => <button key={v} className={view === v ? 'active' : ''} onClick={() => setView(v)}>{v[0].toUpperCase() + v.slice(1)}</button>)}
            </div>
            <div className="search"><Search size={17} /><input placeholder="Search engineers" value={search} onChange={e => setSearch(e.target.value)} /></div>
            <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)} aria-label="Project filter"><option value="all">All projects</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
            <button className="primary" onClick={() => setDrawer({ kind: 'assignment' })}><Plus size={18} /> Assign task</button>
          </div>
        </div>

        {view !== 'month' && <div className="calendar-wrap">
          <div className="calendar-head" style={{ gridTemplateColumns: `180px repeat(${days.length}, minmax(${view === 'day' ? 300 : 130}px,1fr))` }}>
            <div className="engineer-label">ENGINEERS <span>{visibleEngineers.length}</span></div>
            {days.map(d => <div key={fmt(d)} className={fmt(d) === todayStr() ? 'today-col' : ''}><b>{DOW[(d.getDay() + 6) % 7]}</b><span>{pad(d.getDate())}</span></div>)}
          </div>
          <div className="calendar-body">
            {visibleEngineers.map((eng, i) => <div className="calendar-row" key={eng.id} style={{ gridTemplateColumns: `180px repeat(${days.length}, minmax(${view === 'day' ? 300 : 130}px,1fr))` }}>
              <div className="engineer"><span className={`avatar c${i % 6}`}>{eng.initials}</span><span className="eng-text"><b>{eng.name}</b><small>{eng.role}</small><em className={eng.status === 'Partial day' ? 'partial' : ''}><i /> {eng.status}</em></span></div>
              {days.map(d => {
                const key = fmt(d)
                const cell = cellAssignments(eng.id, key)
                return <div className={`day-cell${key === todayStr() ? ' today-col' : ''}`} key={key} onClick={() => setDrawer({ kind: 'assignment', date: key, engineerId: eng.id })}>
                  {cell.length ? cell.map(a => {
                    const p = projects.find(x => x.id === a.projectId)
                    return <div className={`assignment ${p?.color ?? 'slate'}${a.status === 'Draft' ? ' draft' : ''}`} key={a.id}>
                      <b>{p?.name ?? 'Project'}</b>
                      {p?.location && <span className="loc"><MapPin size={10} /> {p.location}</span>}
                      <span>{a.start} — {a.end}</span>
                      <small>{a.details}</small>
                    </div>
                  }) : <button className="add-cell"><Plus size={15} /> Available</button>}
                </div>
              })}
            </div>)}
          </div>
        </div>}

        {view === 'month' && <div className="month-wrap">
          <div className="month-head">{DOW.map(d => <span key={d}>{d}</span>)}</div>
          <div className="month-grid">
            {monthCells.map(d => {
              const key = fmt(d)
              const inMonth = d.getMonth() === anchorDate.getMonth()
              const dayAssignments = assignments.filter(a => a.date === key && (projectFilter === 'all' || a.projectId === projectFilter) && visibleEngineers.some(e => e.id === a.engineerId))
              return <div key={key} className={`month-cell${inMonth ? '' : ' faded'}${key === todayStr() ? ' today-col' : ''}`} onClick={() => { setAnchor(key); setView('day') }}>
                <span className="month-date">{d.getDate()}</span>
                {dayAssignments.slice(0, 3).map(a => {
                  const p = projects.find(x => x.id === a.projectId)
                  const e = engineers.find(x => x.id === a.engineerId)
                  return <span key={a.id} className={`chip ${p?.color ?? 'slate'}`}>{e?.initials} · {p?.name}</span>
                })}
                {dayAssignments.length > 3 && <span className="chip more">+{dayAssignments.length - 3} more</span>}
              </div>
            })}
          </div>
        </div>}

        <footer><span>Showing {visibleEngineers.length} of {engineers.length} engineers</span><span>All times in Asia/Bangkok (GMT+7) · Synced just now</span></footer>
      </section>}
    </main>

    {drawer?.kind === 'assignment' && <AssignmentDrawer onClose={() => setDrawer(null)} onSave={saveAssignment} prefill={{ date: drawer.date, engineerId: drawer.engineerId }} session={session} engineers={engineers} projects={projects} />}
    {drawer?.kind === 'project' && <ProjectDrawer onClose={() => setDrawer(null)} onSave={saveProject} />}
    {drawer?.kind === 'engineer' && <EngineerDrawer onClose={() => setDrawer(null)} onSave={saveEngineer} />}
  </div>
}
