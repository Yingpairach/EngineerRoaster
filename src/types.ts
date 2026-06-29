export type Engineer = { id: string; name: string; role: string; initials: string; status: 'Available' | 'Partial day' | 'Out of office' }
export type Project = { id: string; name: string; color: 'teal' | 'blue' | 'amber' | 'slate' }
export type Assignment = { id: string; engineerId: string; projectId: string; date: string; start: string; end: string; details: string; status: 'Confirmed' | 'Draft' }
