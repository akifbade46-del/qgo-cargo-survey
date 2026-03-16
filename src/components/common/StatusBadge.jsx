const MAP = {
  pending:     { cls: 'badge-pending',   label: 'Pending' },
  assigned:    { cls: 'badge-assigned',  label: 'Assigned' },
  in_progress: { cls: 'bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full', label: 'In Progress' },
  surveyed:    { cls: 'bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full', label: 'Surveyed' },
  completed:   { cls: 'badge-completed', label: 'Completed' },
  cancelled:   { cls: 'badge-cancelled', label: 'Cancelled' },
}

export default function StatusBadge({ status }) {
  const s = MAP[status] ?? { cls: 'badge-pending', label: status }
  return <span className={s.cls}>{s.label}</span>
}
