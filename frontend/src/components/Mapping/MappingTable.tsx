import type { ReconciliationResult } from '../../types'

interface Props {
  result: ReconciliationResult
}

export default function MappingTable({ result }: Props) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Mappings</h2>

      {result.table_mappings.length === 0 ? (
        <p className="text-slate-600">No mappings yet</p>
      ) : (
        <table className="w-full border-collapse">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-2 text-left font-semibold">Source Table</th>
              <th className="px-4 py-2 text-left font-semibold">Target Table</th>
              <th className="px-4 py-2 text-left font-semibold">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {result.table_mappings.map((m, i) => (
              <tr key={i} className="border-b border-slate-200 hover:bg-slate-50">
                <td className="px-4 py-2">{m.table_a.name}</td>
                <td className="px-4 py-2">{m.table_b.name}</td>
                <td className="px-4 py-2">{(m.confidence * 100).toFixed(0)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}