export type Engineer = { id: string; name: string; role: string; initials: string; status: 'Available' | 'Partial day' | 'Out of office' }
export type Project = { id: string; name: string; location: string; color: 'teal' | 'blue' | 'amber' | 'slate' }
export type Assignment = { id: string; engineerId: string; projectId: string; date: string; start: string; end: string; details: string; status: 'Confirmed' | 'Draft' }
export type ViewMode = 'day' | 'week' | 'month'
export type Session = { userId: string; name: string; initials: string; role: 'Admin' | 'Engineer' }
