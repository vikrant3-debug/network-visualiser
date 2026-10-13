import React, { useState } from 'react';
import { AccessPoint, InterferenceEdge, WiFiChannel } from '../types';
import { getChannelByNumber } from '../constants/channels';
import { Radio, ShieldAlert, CheckCircle2, SplitSquareVertical } from 'lucide-react';

interface BeforeAfterComparisonProps {
  nodes: AccessPoint[];
  edges: InterferenceEdge[];
  availableChannels: WiFiChannel[];
  assignments: Record<string, number | null>;
  solutionFound: boolean;
}

export const BeforeAfterComparison: React.FC<BeforeAfterComparisonProps> = ({
  nodes,
  edges,
  availableChannels,
  assignments,
  solutionFound,
}) => {
  const [viewMode, setViewMode] = useState<'SPLIT' | 'BEFORE' | 'AFTER'>('SPLIT');

  // In the simulated "Before" state:
  // Every AP is assigned to standard default Channel 1, creating multiple co-channel interference conflicts!
  const defaultChannel = availableChannels[0] || { channelNumber: 1, label: 'Channel 1', color: '#DC2626' };

  // Calculate conflicts in Before state
  const beforeConflictsCount = edges.length; // because all APs are on Channel 1, every interference edge is a conflict!

  // Toggle button base + per-mode active styles
  const toggleBase: React.CSSProperties = {
    padding: '4px 10px',
    borderRadius: '6px',
    fontWeight: 600,
    fontSize: '11px',
    background: 'transparent',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
  };
  const toggleActive: Record<'SPLIT' | 'BEFORE' | 'AFTER', React.CSSProperties> = {
    SPLIT: { ...toggleBase, backgroundColor: '#2563eb', color: '#ffffff' },
    BEFORE: { ...toggleBase, backgroundColor: '#dc2626', color: '#ffffff' },
    AFTER: { ...toggleBase, backgroundColor: '#16a34a', color: '#ffffff' },
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '16px 20px',
        boxShadow: '0 2px 10px rgba(15,23,42,0.05)',
        marginTop: '0',
      }}
    >
      {/* Header: Title + Toggle Group */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '12px',
          gap: '8px',
          marginBottom: '12px',
        }}
      >
        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SplitSquareVertical size={16} color="#2563eb" />
          <h3 style={{ margin: 0, fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
            Network State Comparison: Uncoordinated vs. Backtracking
          </h3>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#f8fafc',
            padding: '4px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
          }}
        >
          <button onClick={() => setViewMode('SPLIT')} style={viewMode === 'SPLIT' ? toggleActive.SPLIT : toggleBase}>
            Side-by-Side
          </button>
          <button onClick={() => setViewMode('BEFORE')} style={viewMode === 'BEFORE' ? toggleActive.BEFORE : toggleBase}>
            Before (Clashing)
          </button>
          <button onClick={() => setViewMode('AFTER')} style={viewMode === 'AFTER' ? toggleActive.AFTER : toggleBase}>
            After (Optimized)
          </button>
        </div>
      </div>

      <p style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic', marginBottom: '12px', marginTop: 0 }}>
        * Note: The "Before" state is a simulated uncoordinated deployment (all Access Points defaulting to Channel 1),
        demonstrating real-world co-channel packet collisions without algorithmic graph coloring.
      </p>

      {/* Comparison Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: viewMode === 'SPLIT' ? '1fr 1fr' : '1fr',
          gap: '16px',
        }}
      >
        {/* BEFORE CARD */}
        {(viewMode === 'SPLIT' || viewMode === 'BEFORE') && (
          <div
            style={{
              borderRadius: '10px',
              border: '1px solid #fca5a5',
              backgroundColor: '#fff5f5',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #fca5a5',
                paddingBottom: '8px',
              }}
            >
              <span style={{ fontWeight: 700, color: '#dc2626', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldAlert size={15} color="#dc2626" />
                Before: Default Uncoordinated Configuration
              </span>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  fontSize: '10px',
                  fontWeight: 700,
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  border: '1px solid #fca5a5',
                  whiteSpace: 'nowrap',
                }}
              >
                {beforeConflictsCount} Severe Conflicts
              </span>
            </div>

            <p style={{ fontSize: '12px', color: '#334155', margin: 0 }}>
              All {nodes.length} Access Points operate on factory default{' '}
              <strong>{defaultChannel.label}</strong>. Adjacent APs transmit on identical frequencies, causing
              packet degradation, carrier sense backoffs, and high latency.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                AP Status:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                {nodes.map((node) => (
                  <div
                    key={`before-${node.id}`}
                    style={{
                      padding: '5px 8px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(255,255,255,0.8)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '11px',
                    }}
                  >
                    <span style={{ fontWeight: 700, color: '#1e293b' }}>{node.id}</span>
                    <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#dc2626' }}>
                      Ch {defaultChannel.channelNumber} (Clash)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                backgroundColor: 'rgba(220,38,38,0.08)',
                border: '1px solid #fca5a5',
                fontSize: '11px',
                color: '#dc2626',
              }}
            >
              Packet Collision Risk: <strong>CRITICAL</strong> • Throughput Penalty: <strong>~70%</strong>
            </div>
          </div>
        )}

        {/* AFTER CARD */}
        {(viewMode === 'SPLIT' || viewMode === 'AFTER') && (
          <div
            style={{
              borderRadius: '10px',
              border: '1px solid #86efac',
              backgroundColor: '#f0fdf4',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #86efac',
                paddingBottom: '8px',
                gap: '8px',
              }}
            >
              <span style={{ fontWeight: 700, color: '#16a34a', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={15} color="#16a34a" />
                After: Backtracking Graph Colored Allocation
              </span>
              <span
                style={
                  solutionFound
                    ? {
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        fontSize: '10px',
                        fontWeight: 700,
                        backgroundColor: '#dcfce7',
                        color: '#16a34a',
                        border: '1px solid #86efac',
                        whiteSpace: 'nowrap',
                      }
                    : {
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        fontSize: '10px',
                        fontWeight: 700,
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        border: '1px solid #fca5a5',
                        whiteSpace: 'nowrap',
                      }
                }
              >
                {solutionFound ? '0 Conflicts (Collision Free)' : 'No Valid Allocation'}
              </span>
            </div>

            <p style={{ fontSize: '12px', color: '#334155', margin: 0 }}>
              {solutionFound ? (
                <>
                  Backtracking successfully assigned mutually orthogonal channels to every interfering neighbor.
                  Co-channel interference is completely eliminated across the wireless topology.
                </>
              ) : (
                <>
                  Backtracking exhausted every channel combination without a conflict-free assignment. This
                  topology cannot be colored with only {availableChannels.length} available channels.
                </>
              )}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Allocated Frequencies:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                {nodes.map((node) => {
                  const chNum = assignments[node.id];
                  const meta = getChannelByNumber(chNum);
                  return (
                    <div
                      key={`after-${node.id}`}
                      style={{
                        padding: '5px 8px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(255,255,255,0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '11px',
                      }}
                    >
                      <span style={{ fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Radio size={11} color="#2563eb" />
                        {node.id}
                      </span>
                      {meta ? (
                        <span
                          style={{
                            backgroundColor: meta.color,
                            color: '#ffffff',
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          Ch {meta.channelNumber}
                        </span>
                      ) : (
                        <span style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace' }}>Unassigned</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div
              style={
                solutionFound
                  ? {
                      padding: '6px 10px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(22,163,74,0.08)',
                      border: '1px solid #86efac',
                      fontSize: '11px',
                      color: '#16a34a',
                    }
                  : {
                      padding: '6px 10px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(220,38,38,0.08)',
                      border: '1px solid #fca5a5',
                      fontSize: '11px',
                      color: '#dc2626',
                    }
              }
            >
              {solutionFound ? (
                <>
                  Co-Channel Interference: <strong>NONE</strong> • Spectral Efficiency: <strong>MAXIMAL</strong>
                </>
              ) : (
                <>
                  Allocation Failed: <strong>NO SOLUTION EXISTS</strong> for this topology with{' '}
                  <strong>{availableChannels.length} channels</strong>.
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
