interface StatBarProps {
  label: string;
  value: number;
  color: string;
  max?: number;
}

// Barre visuelle simple pour comparer une statistique à une valeur maximale.
export default function StatBar({ label, value, color, max = 150 }: StatBarProps) {
  // La largeur est plafonnée à 100% pour éviter un débordement visuel.
  const percentage = Math.min((value / max) * 100, 100)

  return (
    <div className="stat-bar">
      <div className="stat-bar__header">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="stat-bar__track">
        <div className="stat-bar__fill" style={{ width: `${percentage}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}
