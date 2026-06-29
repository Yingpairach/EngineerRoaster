import type { Assignment, Engineer, Project } from './types'

export const engineers: Engineer[] = [
  { id:'alex', name:'Alex Chen', role:'Software Engineer', initials:'AC', status:'Available' },
  { id:'brooke', name:'Brooke Taylor', role:'Backend Engineer', initials:'BT', status:'Available' },
  { id:'carlos', name:'Carlos Mendez', role:'DevOps Engineer', initials:'CM', status:'Partial day' },
  { id:'diana', name:'Diana Lee', role:'QA Engineer', initials:'DL', status:'Available' },
  { id:'ethan', name:'Ethan Johnson', role:'Frontend Engineer', initials:'EJ', status:'Available' },
  { id:'fatima', name:'Fatima Ali', role:'Data Engineer', initials:'FA', status:'Available' },
]

export const projects: Project[] = [
  { id:'checkout', name:'Checkout Redesign', color:'teal' },
  { id:'gateway', name:'API Gateway', color:'blue' },
  { id:'infra', name:'Infra Migration', color:'teal' },
  { id:'mobile', name:'Mobile App QA', color:'blue' },
  { id:'web', name:'Web UI Revamp', color:'teal' },
  { id:'data', name:'Data Pipeline', color:'blue' },
  { id:'platform', name:'Platform Refactor', color:'amber' },
]

const weekdays = ['2026-06-01','2026-06-02','2026-06-03','2026-06-04','2026-06-05']
const primary: Record<string,string> = { alex:'checkout', brooke:'gateway', carlos:'infra', diana:'mobile', ethan:'web', fatima:'data' }
export const seedAssignments: Assignment[] = engineers.flatMap((e) => weekdays.map((date, i) => ({
  id:`${e.id}-${date}`, engineerId:e.id,
  projectId: e.id === 'alex' && i === 3 ? 'platform' : primary[e.id],
  date, start: e.id === 'carlos' && (i === 0 || i === 4) ? '09:00' : '09:00',
  end: e.id === 'carlos' && (i === 0 || i === 4) ? '12:00' : '17:00',
  details:'Delivery work and project collaboration', status:'Confirmed' as const
})))
