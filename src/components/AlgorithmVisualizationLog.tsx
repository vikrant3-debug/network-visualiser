import React, { useEffect, useRef } from 'react';
import { Code2 } from 'lucide-react';
import { AlgorithmStep } from '../types';

interface AlgorithmVisualizationLogProps {
  steps: AlgorithmStep[];
  currentStepIndex: number;
  isRunning: boolean;
  isSolution: boolean;
  isFailure: boolean;
  isIdle: boolean;
}

export const AlgorithmVisualizationLog: React.FC<AlgorithmVisualizationLogProps> = ({
  steps,
  currentStepIndex,
  isRunning,
  isSolution,
  isFailure,
  isIdle,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [currentStepIndex]);

  // Show only the steps executed so far; nothing before start
  const visibleSteps = isIdle ? [] : steps.slice(0, currentStepIndex + 1);

  let statusLabel = 'Running';
  if (!isRunning && isSolution) statusLabel = 'Completed';
  else if (!isRunning && isFailure) statusLabel = 'No Solution';
  else if (!isRunning && currentStepIndex === 0) statusLabel = 'Ready';
  else if (!isRunning && currentStepIndex > 0) statusLabel = 'Paused';

  // Status badge colors (inline, per state)
  const badgeBase: React.CSSProperties = {
    padding: '2px 8px',
    borderRadius: '9999px',
    fontSize: '11px',
    fontWeight: 700,
    border: '1px solid',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  };
  const badgeStyles: Record<string, React.CSSProperties> = {
    Ready: { backgroundColor: '#f1f5f9', color: '#475569', borderColor: '#cbd5e1' },
    Running: { backgroundColor: '#d1fae5', color: '#065f46', borderColor: '#a7f3d0' },
    Completed: { backgroundColor: '#d1fae5', color: '#065f46', borderColor: '#a7f3d0' },
    'No Solution': { backgroundColor: '#fee2e2', color: '#991b1b', borderColor: '#fecaca' },
    Paused: { backgroundColor: '#fef3c7', color: '#92400e', borderColor: '#fcd34d' },
  };
  const badgeStyle: React.CSSProperties = { ...badgeBase, ...(badgeStyles[statusLabel] ?? badgeStyles.Running) };
  const dotColor =
    statusLabel === 'Ready'
      ? '#94a3b8'
      : statusLabel === 'No Solution'
        ? '#dc2626'
        : statusLabel === 'Paused'
          ? '#d97706'
          : '#10b981';

  return (
    <div className="app-card" style={{ height: '100%', backgroundColor: '#0d1117', border: '1px solid #30363d' }}>
      {/* Header */}
      <div className="log-header-row" style={{ backgroundColor: '#161b22', borderBottom: '1px solid #30363d' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Code2 size={16} color="#3fb950" />
          <h2 className="card-header-title" style={{ color: '#3fb950', fontFamily: 'monospace' }}>
            &gt;_ Algorithm Trace Log
          </h2>
        </div>

        <span style={badgeStyle}>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: dotColor,
              display: 'inline-block',
            }}
          />
          <span>{statusLabel}</span>
        </span>
      </div>

      {/* Log list */}
      <div ref={containerRef} className="log-scroll-area" style={{ backgroundColor: '#0d1117' }}>
        {visibleSteps.length === 0 && (
          <div
            style={{ textAlign: 'center', color: '#3fb950', padding: '40px 16px', fontSize: '12px', lineHeight: 1.6, fontFamily: 'monospace' }}
          >
            <div style={{ fontSize: '20px', marginBottom: '8px', color: '#3fb950' }}>█</div>
            <span>Awaiting command...<br/>Run <strong style={{ color: '#58a6ff' }}>START</strong> or <strong style={{ color: '#58a6ff' }}>STEP</strong> to execute.</span>
          </div>
        )}
        {visibleSteps.map((step, idx) => {
          const stepNum = idx + 1;
          const timestamp = `${(idx * 0.1).toFixed(1)}s`;
          const isConflict = step.type === 'CONFLICT_DETECTED';
          const isAssigned = step.type === 'SAFE_ASSIGNMENT' || step.type === 'SUCCESS';

          let rowClass = 'log-item-row';

          if (isConflict) {
            rowClass = 'log-item-row log-item-conflict';
          }

          return (
            <div
              key={`log-${stepNum}`}
              className={rowClass}
              style={{
                backgroundColor: isConflict ? 'rgba(248,81,73,0.08)' : 'transparent',
                borderLeft: isConflict ? '3px solid #f85149' : isAssigned ? '3px solid #3fb950' : '3px solid #30363d',
                fontFamily: 'monospace',
                fontSize: '11px',
                padding: '5px 10px',
                margin: '2px 0',
                borderRadius: '3px',
              }}
            >
              <div className="log-item-left">
                <span style={{
                  minWidth: '20px',
                  height: '20px',
                  borderRadius: '3px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  backgroundColor: isConflict ? '#6e1a1a' : isAssigned ? '#1a4731' : '#1c2128',
                  color: isConflict ? '#f85149' : isAssigned ? '#3fb950' : '#8b949e',
                  flexShrink: 0,
                  marginRight: '8px',
                }}>
                  {String(stepNum).padStart(2, '0')}
                </span>
                <span style={{ fontSize: '11px', lineHeight: 1.4, color: isConflict ? '#f85149' : isAssigned ? '#3fb950' : '#8b949e', fontFamily: 'monospace' }}>
                  {isConflict ? '⚡ ' : isAssigned ? '✓  ' : '→  '}{step.description || `Step ${stepNum}: Processing candidate`}
                </span>
              </div>
              <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#484f58', whiteSpace: 'nowrap', marginLeft: 'auto' }}>{timestamp}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
