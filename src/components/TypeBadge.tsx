interface TypeBadgeProps {
  name: string;
  color: string;
}

export default function TypeBadge({ name, color }: TypeBadgeProps) {
  return (
    <span
      className="type-badge"
      style={{ backgroundColor: color }}
    >
      {name}
    </span>
  )
}
