import ProgressBar from '../shared/ProgressBar'

interface Props {
  progress: number; // 0-100
  currentPhase: string;
  phaseDescription: string;
}

const PHASES = [
  { id: 'parsing', name: 'Parsing', description: 'Parsing schemas...' },
  { id: 'structural', name: 'Structural', description: 'Building structural fingerprints...' },
  { id: 'semantic', name: 'Semantic', description: 'Computing semantic similarity...' },
  { id: 'reconciliation', name: 'Reconciliation', description: 'Reconciling mappings...' },
  { id: 'conflicts', name: 'Conflicts', description: 'Detecting conflicts...' },
  { id: 'codegen', name: 'Generation', description: 'Generating migration scaffold...' },
]

export default function ProgressTracker({
  progress,
  currentPhase,
  phaseDescription,
}: Props) {
  const currentPhaseIndex = PHASES.findIndex((p) => p.id === currentPhase)
  const isComplete = progress >= 100

  return (
    <div className="space-y-8">
      {/* Main Progress Bar */}
      <div>
        <ProgressBar value={progress} label="Overall Progress" />
      </div>

      {/* Phase Info Card */}
      <div className="rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-slate-900">
            {isComplete ? '✓ Complete' : `${currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)}`}
          </h3>
          <span className="text-sm font-medium text-slate-600">{progress}%</span>
        </div>
        <p className="text-sm text-slate-600">{phaseDescription}</p>
      </div>

      {/* Phase Timeline */}
      <div className="space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Phases
        </div>

        <div className="space-y-2">
          {PHASES.map((phase, index) => {
            const isActive = phase.id === currentPhase
            const isComplete = index < currentPhaseIndex || (index === currentPhaseIndex && progress >= 100)
            

            return (
              <div key={phase.id} className="flex items-center gap-3">
                {/* Circle indicator */}
                <div
                  className={`relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-semibold text-sm transition-all duration-300 ${
                    isComplete
                      ? 'bg-green-500 text-white'
                      : isActive
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                        : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isComplete ? (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : isActive ? (
                    <div className="absolute h-8 w-8 rounded-full border-2 border-blue-500 animate-pulse" />
                  ) : null}
                  {!isComplete && !isActive && <span>{index + 1}</span>}
                </div>

                {/* Phase info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className={`font-medium transition-colors ${
                        isActive
                          ? 'text-blue-600'
                          : isComplete
                            ? 'text-green-600'
                            : 'text-slate-500'
                      }`}
                    >
                      {phase.name}
                    </p>
                    {isActive && (
                      <div className="flex gap-0.5">
                        <div className="h-1 w-1 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="h-1 w-1 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="h-1 w-1 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{phase.description}</p>
                </div>

                {/* Progress bar for active phase */}
                {isActive && (
                  <div className="h-1 w-12 flex-shrink-0 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                      style={{ width: `${((progress % 20) / 20) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Estimated time */}
      {!isComplete && (
        <div className="text-center text-sm text-slate-500">
          <p>Estimated time remaining: ~{Math.max(1, Math.ceil((100 - progress) / 20))} seconds</p>
        </div>
      )}
    </div>
  )
}
