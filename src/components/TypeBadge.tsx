interface TypeBadgeProps {
  name: string;
  color: string;
}

// Petit badge coloré réutilisé partout où l'on doit représenter un type.
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
