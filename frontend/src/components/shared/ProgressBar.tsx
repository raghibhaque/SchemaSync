interface Props {
  value: number; // 0-100
  label?: string;
}

export default function ProgressBar({ value, label }: Props) {
  return (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between">
          <span className="text-sm font-medium text-slate-700">{label}</span>
          <span className="text-sm text-slate-500">{Math.round(value)}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}
