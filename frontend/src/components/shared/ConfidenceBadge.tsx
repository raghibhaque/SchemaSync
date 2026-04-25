interface Props {
  level: 'HIGH' | 'MEDIUM' | 'LOW';
  value?: number; // Optional confidence score to display
}

export default function ConfidenceBadge({ level, value }: Props) {
  const colorMap = {
    HIGH: 'bg-green-100 text-green-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    LOW: 'bg-red-100 text-red-800',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${colorMap[level]}`}
    >
      {level}
      {value !== undefined && ` (${(value * 100).toFixed(0)}%)`}
    </span>
  )
}
