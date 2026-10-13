import React from 'react';
import { AlgorithmStep, AlgorithmStateStatus } from '../types';
import { Radio, Share2, Palette, FastForward, AlertTriangle, RotateCcw, CheckCircle, BarChart3 } from 'lucide-react';

interface LiveStatisticsProps {
  apCount: number;
  edgeCount: number;
  channelsAvailable: number;
  currentStep: AlgorithmStep | null;
  status: AlgorithmStateStatus;
}

export const LiveStatistics: React.FC<LiveStatisticsProps> = ({
  apCount,
  edgeCount,
  channelsAvailable,
  currentStep,
  status,
}) => {
  const stepsCount = currentStep?.stats.steps || 0;
  const conflictsCount = currentStep?.stats.conflicts || 0;
  const backtracksCount = currentStep?.stats.backtracks || 0;
  const channelsUsed = currentStep?.stats.channelsUsed || 0;

  let statusText = 'Ready';
  let statusBadgeColor: React.CSSProperties = {
    backgroundColor: '#f1f5f9',
    color: '#475569',
    borderColor: '#cbd5e1',
  };

  if (status === 'RUNNING') {
    statusText = 'Executing Backtracking';
    statusBadgeColor = { backgroundColor: '#dbeafe', color: '#1e40af', borderColor: '#93c5fd' };
  } else if (status === 'PAUSED') {
    statusText = 'Paused';
    statusBadgeColor = { backgroundColor: '#fef3c7', color: '#92400e', borderColor: '#fcd34d' };
  } else if (status === 'SOLUTION_FOUND') {
    statusText = 'Solution Found';
    statusBadgeColor = { backgroundColor: '#d1fae5', color: '#065f46', borderColor: '#6ee7b7' };
  } else if (status === 'NO_SOLUTION') {
    statusText = 'No Solution Possible';
    statusBadgeColor = { backgroundColor: '#fee2e2', color: '#991b1b', borderColor: '#fca5a5' };
  }

  const statusBadgeStyle: React.CSSProperties = {
    padding: '3px 12px',
    borderRadius: '9999px',
    fontSize: '11px',
    fontWeight: 700,
    border: '1px solid',
    ...statusBadgeColor,
  };

  const statItems = [
    {
      label: 'Access Points (V)',
      value: apCount,
      icon: <Radio size={13} color="#0284c7" />,
      valueColor: '#0f172a',
    },
    {
      label: 'Interference Links (E)',
      value: edgeCount,
      icon: <Share2 size={13} color="#4f46e5" />,
      valueColor: '#0f172a',
    },
    {
      label: 'Channels Available (C)',
      value: channelsAvailable,
      icon: <Palette size={13} color="#059669" />,
      valueColor: '#0f172a',
    },
    {
      label: 'Steps Executed',
      value: stepsCount,
      icon: <FastForward size={13} color="#2563eb" />,
      valueColor: '#2563eb',
    },
    {
      label: 'Conflicts Detected',
      value: conflictsCount,
      icon: <AlertTriangle size={13} color="#dc2626" />,
      valueColor: conflictsCount > 0 ? '#dc2626' : '#0f172a',
    },
    {
      label: 'Backtracks',
      value: backtracksCount,
      icon: <RotateCcw size={13} color="#d97706" />,
      valueColor: backtracksCount > 0 ? '#d97706' : '#0f172a',
    },
    {
      label: 'Channels Used',
      value: `${channelsUsed} / ${channelsAvailable}`,
      icon: <CheckCircle size={13} color="#0d9488" />,
      valueColor: '#0d9488',
    },
  ];

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '14px',
        boxShadow: '0 2px 10px rgba(15,23,42,0.05)',
      }}
    >
      {/* Header: Title + Status Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f1f5f9',
          paddingBottom: '10px',
          marginBottom: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={16} color="#2563eb" />
          <h3 style={{ margin: 0, fontWeight: 700, color: '#0f172a', fontSize: '13.5px' }}>
            Live Computational Statistics
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#64748b' }}>Status:</span>
          <span style={statusBadgeStyle}>{statusText}</span>
        </div>
      </div>

      {/* 7-Tile Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
        {statItems.map((item, idx) => (
          <div
            key={idx}
            style={{
              padding: '10px',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                color: '#64748b',
                fontSize: '10px',
                fontWeight: 600,
                textTransform: 'uppercase',
                marginBottom: '6px',
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
            <div style={{ fontWeight: 800, fontSize: '18px', fontFamily: 'monospace', color: item.valueColor }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
