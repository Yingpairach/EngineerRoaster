import type { Assignment, Engineer, Project } from './types'

export const seedEngineers: Engineer[] = [
  { id:'alex', name:'Alex Chen', role:'Software Engineer', initials:'AC', status:'Available' },
  { id:'brooke', name:'Brooke Taylor', role:'Backend Engineer', initials:'BT', status:'Available' },
  { id:'carlos', name:'Carlos Mendez', role:'DevOps Engineer', initials:'CM', status:'Partial day' },
  { id:'diana', name:'Diana Lee', role:'QA Engineer', initials:'DL', status:'Available' },
  { id:'ethan', name:'Ethan Johnson', role:'Frontend Engineer', initials:'EJ', status:'Available' },
  { id:'fatima', name:'Fatima Ali', role:'Data Engineer', initials:'FA', status:'Available' },
]

export const seedProjects: Project[] = [
  { id:'checkout', name:'Checkout Redesign', location:'Riverside Grand Hotel, Bangkok', color:'teal' },
  { id:'gateway', name:'API Gateway', location:'Head Office, Sathorn', color:'blue' },
  { id:'infra', name:'Infra Migration', location:'Seaside Resort, Phuket', color:'teal' },
  { id:'mobile', name:'Mobile App QA', location:'City Suites, Sukhumvit', color:'blue' },
  { id:'web', name:'Web UI Revamp', location:'Head Office, Sathorn', color:'teal' },
  { id:'data', name:'Data Pipeline', location:'Hillside Villas, Chiang Mai', color:'blue' },
  { id:'platform', name:'Platform Refactor', location:'Head Office, Sathorn', color:'amber' },
]

const pad = (n: number) => String(n).padStart(2, '0')
const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

// Seed the Monday–Friday of the current week so the calendar has data on first load
export function makeSeedAssignments(): Assignment[] {
  const monday = new Date()
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
  const weekdays = [0, 1, 2, 3, 4].map(i => { const d = new Date(monday); d.setDate(monday.getDate() + i); return fmt(d) })
  const primary: Record<string, string> = { alex:'checkout', brooke:'gateway', carlos:'infra', diana:'mobile', ethan:'web', fatima:'data' }
  return seedEngineers.flatMap((e) => weekdays.map((date, i) => ({
    id: `${e.id}-${date}`,
    engineerId: e.id,
    projectId: e.id === 'alex' && i === 3 ? 'platform' : primary[e.id],
    date,
    start: '09:00',
    end: e.id === 'carlos' && (i === 0 || i === 4) ? '12:00' : '17:00',
    details: 'Delivery work and project collaboration',
    status: 'Confirmed' as const,
  })))
}
