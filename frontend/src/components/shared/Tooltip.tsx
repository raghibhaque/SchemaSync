import { ReactNode, useState } from 'react'

interface Props {
  children: ReactNode;
  content: ReactNode;
}

export default function Tooltip({ children, content }: Props) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        {children}
      </div>

      {visible && (
        <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 transform">
          <div className="rounded-lg bg-slate-900 px-3 py-2 text-xs text-white shadow-lg whitespace-nowrap">
            {content}
            <div className="absolute top-full left-1/2 -translate-x-1/2 transform border-4 border-transparent border-t-slate-900" />
          </div>
        </div>
      )}
    </div>
  )
}
