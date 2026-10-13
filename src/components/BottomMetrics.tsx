import React from 'react';
import { BarChart2, CheckCircle } from 'lucide-react';
import { AccessPoint } from '../types';
import { getChannelByNumber } from '../constants/channels';

interface BottomMetricsProps {
  nodes: AccessPoint[];
  currentAssignments: Record<string, number | null>;
}

export const BottomMetrics: React.FC<BottomMetricsProps> = ({
  nodes,
  currentAssignments,
}) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
      {/* 1. Final Channel Allocation (Left) */}
      <div className="app-card">
        <div className="card-title-row">
          <CheckCircle size={16} color="#16a34a" />
          <h2 className="card-header-title">Final Channel Allocation</h2>
        </div>

        <div className="allocation-pills-grid">
          {nodes.map((node) => {
            const assignedChNum = currentAssignments[node.id] ?? null;
            const meta = getChannelByNumber(assignedChNum);

            const displayCh = meta ? meta.label : 'Unassigned';
            const displayBg = meta ? meta.lightColor : '#f1f5f9';
            const displayText = meta ? meta.color : '#64748b';

            return (
              <div
                key={node.id}
                className="alloc-pill"
                style={{ backgroundColor: displayBg }}
              >
                <span className="alloc-ap-label" style={{ color: displayText }}>
                  {node.id}
                </span>
                <span className="alloc-ch-label" style={{ color: displayText }}>
                  {displayCh}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Algorithm Complexity (Right) */}
      <div className="app-card">
        <div className="card-title-row">
          <BarChart2 size={16} color="#2563eb" />
          <h2 className="card-header-title">Algorithm Complexity</h2>
        </div>

        <div className="complexity-body">
          <div>
            <strong>Time Complexity:</strong> <span className="complexity-formula">O(mⁿ)</span> <span style={{ color: '#64748b' }}>(worst case)</span>
          </div>
          <div>
            <strong>Space Complexity:</strong> <span className="complexity-formula">O(n)</span> <span style={{ color: '#64748b' }}>(recursion depth)</span>
          </div>
          <div className="complexity-legend">
            Where:<br />
            n = number of Access Points (vertices)<br />
            m = number of available channels (colors)
          </div>
        </div>
      </div>
    </div>
  );
};
