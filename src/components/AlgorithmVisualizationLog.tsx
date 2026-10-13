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
  };
  const badgeStyle: React.CSSProperties = { ...badgeBase, ...(badgeStyles[statusLabel] ?? badgeStyles.Running) };
  const dotColor =
    statusLabel === 'Ready' ? '#94a3b8' : statusLabel === 'No Solution' ? '#dc2626' : '#10b981';

  return (
    <div className="app-card" style={{ height: '100%' }}>
      {/* Header */}
      <div className="log-header-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Code2 size={16} color="#2563eb" />
          <h2 className="card-header-title">Algorithm Visualization</h2>
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
      <div ref={containerRef} className="log-scroll-area">
        {visibleSteps.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              color: '#94a3b8',
              padding: '40px 16px',
              fontSize: '12px',
              lineHeight: 1.6,
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
            Press <strong>Start</strong> or <strong>Step by Step</strong>
            <br />
            to begin algorithm visualization.
          </div>
        )}
        {visibleSteps.map((step, idx) => {
          const stepNum = idx + 1;
          const timestamp = `${(idx * 0.1).toFixed(1)}s`;
          const isConflict = step.type === 'CONFLICT_DETECTED';
          const isAssigned = step.type === 'SAFE_ASSIGNMENT' || step.type === 'SUCCESS';

          let circleClass = 'step-circle-blue';
          let rowClass = 'log-item-row';

          if (isConflict) {
            circleClass = 'step-circle-red';
            rowClass = 'log-item-row log-item-conflict';
          } else if (isAssigned) {
            circleClass = 'step-circle-green';
          }

          return (
            <div key={`log-${stepNum}`} className={rowClass}>
              <div className="log-item-left">
                <span className={`log-step-circle ${circleClass}`}>
                  {stepNum}
                </span>
                <span style={{ fontSize: '11.5px', lineHeight: 1.25 }}>
                  {step.description || `Step ${stepNum}: Processing candidate`}
                </span>
              </div>
              <span className="log-time-text">{timestamp}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
