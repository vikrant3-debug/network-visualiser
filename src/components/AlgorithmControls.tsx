import React from 'react';
import { Play, Pause, StepForward, RotateCcw, Dices, Gauge } from 'lucide-react';
import { AlgorithmStateStatus } from '../types';

interface AlgorithmControlsProps {
  status: AlgorithmStateStatus;
  currentStepIndex: number;
  totalSteps: number;
  speed: number; // ms per step
  onStart: () => void;
  onPause: () => void;
  onStep: () => void;
  onReset: () => void;
  onGenerateNew: () => void;
  onChangeSpeed: (speedMs: number) => void;
  onSeekStep: (stepNumber: number) => void;
}

export const AlgorithmControls: React.FC<AlgorithmControlsProps> = ({
  status,
  currentStepIndex,
  totalSteps,
  speed,
  onStart,
  onPause,
  onStep,
  onReset,
  onGenerateNew,
  onChangeSpeed,
  onSeekStep,
}) => {
  const isRunning = status === 'RUNNING';
  const isFinished = status === 'SOLUTION_FOUND' || status === 'NO_SOLUTION';

  const startPauseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    color: '#ffffff',
    fontWeight: 700,
    fontSize: '12px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
  };
  const stepResetStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    fontWeight: 600,
    fontSize: '12px',
    borderRadius: '8px',
    cursor: 'pointer',
  };
  const disabledStyle: React.CSSProperties = { opacity: 0.5, cursor: 'not-allowed' };

  const speedBtnBase: React.CSSProperties = {
    padding: '3px 8px',
    borderRadius: '5px',
    fontSize: '11px',
    fontWeight: 700,
    cursor: 'pointer',
  };
  const speedBtnInactive: React.CSSProperties = {
    ...speedBtnBase,
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    color: '#334155',
  };
  const speedBtnActive: React.CSSProperties = {
    ...speedBtnBase,
    backgroundColor: '#2563eb',
    border: '1px solid #2563eb',
    color: '#ffffff',
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '12px 16px',
        boxShadow: '0 2px 10px rgba(15,23,42,0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      {/* Primary Buttons Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
        {/* Execution Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Start / Pause */}
          {isRunning ? (
            <button onClick={onPause} style={{ ...startPauseStyle, backgroundColor: '#d97706' }}>
              <Pause size={16} color="#ffffff" />
              Pause
            </button>
          ) : (
            <button
              onClick={onStart}
              disabled={isFinished && currentStepIndex >= totalSteps}
              style={{
                ...startPauseStyle,
                backgroundColor: '#16a34a',
                ...(isFinished && currentStepIndex >= totalSteps ? disabledStyle : {}),
              }}
            >
              <Play size={16} color="#ffffff" fill="#ffffff" />
              {currentStepIndex > 0 && !isFinished ? 'Resume' : 'Start'}
            </button>
          )}

          {/* Step Button */}
          <button
            onClick={onStep}
            disabled={isRunning || (isFinished && currentStepIndex >= totalSteps)}
            style={{
              ...stepResetStyle,
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              ...(isRunning || (isFinished && currentStepIndex >= totalSteps) ? disabledStyle : {}),
            }}
            title="Execute exactly one recursive backtracking step"
          >
            <StepForward size={16} color="#ffffff" />
            Step
          </button>

          {/* Reset Button */}
          <button
            onClick={onReset}
            style={{
              ...stepResetStyle,
              backgroundColor: '#ffffff',
              color: '#334155',
              border: '1px solid #e2e8f0',
            }}
            title="Reset to uncolored graph and clear trace"
          >
            <RotateCcw size={16} color="#64748b" />
            Reset
          </button>

          {/* Generate New Network */}
          <button
            onClick={onGenerateNew}
            disabled={isRunning}
            style={{
              ...stepResetStyle,
              backgroundColor: '#ffffff',
              color: '#334155',
              border: '1px solid #e2e8f0',
              ...(isRunning ? disabledStyle : {}),
            }}
          >
            <Dices size={16} color="#7c3aed" />
            Generate New Network
          </button>
        </div>

        {/* Speed Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#f8fafc',
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            fontSize: '12px',
          }}
        >
          <Gauge size={14} color="#64748b" />
          <span style={{ color: '#64748b', fontWeight: 600 }}>Speed:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button onClick={() => onChangeSpeed(1000)} style={speed === 1000 ? speedBtnActive : speedBtnInactive}>
              Slow
            </button>
            <button onClick={() => onChangeSpeed(450)} style={speed === 450 ? speedBtnActive : speedBtnInactive}>
              Normal
            </button>
            <button onClick={() => onChangeSpeed(120)} style={speed === 120 ? speedBtnActive : speedBtnInactive}>
              Fast
            </button>
            <button onClick={() => onChangeSpeed(10)} style={speed === 10 ? speedBtnActive : speedBtnInactive}>
              Instant
            </button>
          </div>
        </div>
      </div>

      {/* Step Scrubber / Progress Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
        <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 600, color: '#64748b', whiteSpace: 'nowrap' }}>
          Step {currentStepIndex} / {totalSteps}
        </span>
        <input
          type="range"
          min="0"
          max={totalSteps}
          value={currentStepIndex}
          disabled={isRunning}
          onChange={(e) => onSeekStep(Number(e.target.value))}
          style={{
            flex: 1,
            accentColor: '#2563eb',
            height: '4px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            ...(isRunning ? { opacity: 0.5 } : {}),
          }}
        />
        <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#94a3b8', whiteSpace: 'nowrap' }}>
          {totalSteps > 0 ? Math.round((currentStepIndex / totalSteps) * 100) : 0}%
        </span>
      </div>
    </div>
  );
};
