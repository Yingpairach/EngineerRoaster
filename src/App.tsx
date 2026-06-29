import { useMemo, useState } from 'react'
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Folder, LayoutDashboard, LogOut, Menu, Plus, Search, Settings, SlidersHorizontal, Users, UserRound, X } from 'lucide-react'
import { engineers, projects, seedAssignments } from './data'
import type { Assignment } from './types'

const days = [
  {key:'2026-06-01', dow:'MON', date:'01'},
  {key:'2026-06-02', dow:'TUE', date:'02'},
  {key:'2026-06-03', dow:'WED', date:'03'},
  {key:'2026-06-04', dow:'THU', date:'04'},
  {key:'2026-06-05', dow:'FRI', date:'05'},
]

function Sidebar({active, setActive}:{active:string,setActive:(v:string)=>void}) {
  const links = [
    ['Calendar',CalendarDays], ['My schedule',UserRound], ['Projects',Folder], ['Engineers',Users], ['Admin',Settings],
  ] as const
  return <aside className="sidebar">
    <div className="brand"><div className="brandmark">R</div><span>Rosterly</span></div>
    <nav>{links.map(([label,Icon])=><button key={label} className={active===label?'active':''} onClick={()=>setActive(label)}><Icon size={19}/><span>{label}</span></button>)}</nav>
    <div className="side-bottom">
      <div className="connected"><i/> <span>Microsoft 365 connected</span></div>
      <button><CircleHelp size={19}/>Help & support</button><button><LogOut size={19}/>Sign out</button>
    </div>
  </aside>
}

function AssignmentDrawer({onClose,onSave,currentUser,isAdmin}:{onClose:()=>void,onSave:(a:Assignment)=>void,currentUser:string,isAdmin:boolean}) {
  const [engineerId,setEngineer] = useState(isAdmin ? 'alex' : currentUser)
  const [projectId,setProject] = useState('checkout')
  const [date,setDate] = useState('2026-06-04')
  const [start,setStart] = useState('13:00')
  const [end,setEnd] = useState('17:00')
  const [details,setDetails] = useState('')
  const save=()=>{ onSave({id:crypto.randomUUID(),engineerId,projectId,date,start,end,details:details||'Project delivery work',status:'Confirmed'}); onClose() }
  return <aside className="drawer">
    <div className="drawer-head"><h2>Assign task</h2><button aria-label="Close" onClick={onClose}><X size={20}/></button></div>
    {!isAdmin && <p className="scope-note">You’re assigning a task to your own schedule.</p>}
    <label>Engineer<select value={engineerId} onChange={e=>setEngineer(e.target.value)} disabled={!isAdmin}>{engineers.map(e=><option value={e.id} key={e.id}>{e.name}</option>)}</select></label>
    <label>Project<select value={projectId} onChange={e=>setProject(e.target.value)}>{projects.map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</select></label>
    <label>Date<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label>
    <div className="time-row"><label>Start time<input type="time" value={start} onChange={e=>setStart(e.target.value)}/></label><label>End time<input type="time" value={end} onChange={e=>setEnd(e.target.value)}/></label></div>
    <label>Task details<textarea value={details} onChange={e=>setDetails(e.target.value)} placeholder="What will be delivered?"/></label>
    <label>Status<select><option>Confirmed</option><option>Draft</option></select></label>
    <div className="drawer-actions"><button className="primary" onClick={save}>Save assignment</button><button onClick={onClose}>Cancel</button></div>
  </aside>
}

export default function App(){
  const [active,setActive]=useState('Calendar')
  const [drawer,setDrawer]=useState(false)
  const [assignments,setAssignments]=useState<Assignment[]>(()=>{try{return JSON.parse(localStorage.getItem('rosterly.assignments')||'null')||seedAssignments}catch{return seedAssignments}})
  const [search,setSearch]=useState('')
  const [projectFilter,setProjectFilter]=useState('all')
  const [isAdmin,setAdmin]=useState(true)
  const currentUser='alex'
  const visibleEngineers=useMemo(()=>engineers.filter(e=>e.name.toLowerCase().includes(search.toLowerCase()) && (active!=='My schedule'||e.id===currentUser)),[search,active])
  const save=(a:Assignment)=>{const next=[...assignments.filter(x=>!(x.engineerId===a.engineerId&&x.date===a.date&&x.start===a.start)),a];setAssignments(next);localStorage.setItem('rosterly.assignments',JSON.stringify(next))}
  const title = active==='My schedule'?'My schedule':active==='Admin'?'Access & people':'Engineering roster'
  return <div className="app">
    <Sidebar active={active} setActive={setActive}/>
    <main className="main">
      <header><button className="mobile-menu"><Menu/></button><div><h1>{title}</h1><p>Plan the week. Keep every engineer in sync.</p></div>
        <div className="header-actions">
          <div className="sync"><i/> O365 connected</div>
          <button className="profile" onClick={()=>setAdmin(!isAdmin)}><span className="avatar small">SR</span><span><b>Sara Rodriguez</b><small>{isAdmin?'Administrator':'Engineer view'}</small></span><ChevronDown size={16}/></button>
        </div>
      </header>
      {active==='Admin' ? <section className="admin-page">
        <div className="section-title"><div><h2>People & access</h2><p>Manage who can sign in and assign work.</p></div><button className="primary"><Plus size={17}/> Add engineer</button></div>
        <div className="access-table"><div className="table-head"><span>Employee</span><span>Role</span><span>Self assign</span><span>Status</span></div>
        {engineers.map((e,i)=><div className="access-row" key={e.id}><span className="person"><span className={`avatar c${i}`}>{e.initials}</span><span><b>{e.name}</b><small>{e.name.toLowerCase().replace(' ',' .')}@contoso.com</small></span></span><select defaultValue={i===0?'Admin':'Engineer'}><option>Admin</option><option>Engineer</option></select><label className="switch"><input type="checkbox" defaultChecked/><span/></label><span className="status-active"><i/> Active</span></div>)}</div>
      </section> : <section className="calendar-page">
        <div className="toolbar">
          <div className="date-nav"><button><ChevronLeft size={18}/></button><button className="today">Today</button><button><ChevronRight size={18}/></button><strong>June 2026 <ChevronDown size={16}/></strong></div>
          <div className="tools"><div className="search"><Search size={17}/><input placeholder="Search engineers" value={search} onChange={e=>setSearch(e.target.value)}/></div>
          <select value={projectFilter} onChange={e=>setProjectFilter(e.target.value)} aria-label="Project filter"><option value="all">All projects</option>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
          <button><SlidersHorizontal size={17}/> Filters</button><button className="primary" onClick={()=>setDrawer(true)}><Plus size={18}/> Assign task</button></div>
        </div>
        <div className="calendar-wrap">
          <div className="calendar-head"><div className="engineer-label">ENGINEERS <span>{visibleEngineers.length}</span></div>{days.map(d=><div key={d.key} className={d.key==='2026-06-04'?'today-col':''}><b>{d.dow}</b><span>{d.date}</span></div>)}</div>
          <div className="calendar-body">
          {visibleEngineers.map((eng,i)=><div className="calendar-row" key={eng.id}>
            <div className="engineer"><span className={`avatar c${i}`}>{eng.initials}</span><span className="eng-text"><b>{eng.name}</b><small>{eng.role}</small><em className={eng.status==='Partial day'?'partial':''}><i/> {eng.status}</em></span></div>
            {days.map(day=>{const a=assignments.find(x=>x.engineerId===eng.id&&x.date===day.key&&(projectFilter==='all'||x.projectId===projectFilter)); const p=projects.find(x=>x.id===a?.projectId);return <div className="day-cell" key={day.key} onClick={()=>setDrawer(true)}>{a&&p?<div className={`assignment ${p.color}`}><b>{p.name}</b><span>{a.start} — {a.end}</span><small>{a.details}</small></div>:<button className="add-cell"><Plus size={15}/> Available</button>}</div>})}
          </div>)}
          </div>
        </div>
        <footer><span>Showing {visibleEngineers.length} of {engineers.length} engineers</span><span>All times in Asia/Bangkok (GMT+7) · Synced just now</span></footer>
      </section>}
    </main>
    {drawer&&<AssignmentDrawer onClose={()=>setDrawer(false)} onSave={save} currentUser={currentUser} isAdmin={isAdmin}/>}
  </div>
}
