import React, { useMemo, useEffect, useRef } from 'react';
import { TreeNodeData, AlgorithmStep } from '../types';
import { getChannelByNumber } from '../constants/channels';
import { GitBranch, Check, X, CornerDownLeft, Sparkles, Compass } from 'lucide-react';

interface SearchTreeVisualizerProps {
  treeNodes: Record<string, TreeNodeData>;
  rootId: string | null;
  currentStep: AlgorithmStep | null;
  isSolution: boolean;
}

export const SearchTreeVisualizer: React.FC<SearchTreeVisualizerProps> = ({
  treeNodes,
  rootId,
  currentStep,
  isSolution,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeNodeRef = useRef<HTMLDivElement>(null);

  // Compute active branch path from root to current node
  const activePath = useMemo(() => {
    const path = new Set<string>();
    if (!currentStep) return path;

    let curr: string | null = currentStep.treeNodeId;
    while (curr && treeNodes[curr]) {
      path.add(curr);
      curr = treeNodes[curr].parentId;
    }
    return path;
  }, [currentStep, treeNodes]);

  // Compute final solution branch path
  const solutionPath = useMemo(() => {
    const path = new Set<string>();
    if (!isSolution || !currentStep) return path;

    let curr: string | null = currentStep.treeNodeId;
    while (curr && treeNodes[curr]) {
      path.add(curr);
      curr = treeNodes[curr].parentId;
    }
    return path;
  }, [isSolution, currentStep, treeNodes]);

  // Auto-scroll to active node
  useEffect(() => {
    if (activeNodeRef.current && containerRef.current) {
      activeNodeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [currentStep?.treeNodeId]);

  // Recursive tree node renderer
  const renderSubtree = (nodeId: string, level: number = 0): React.ReactNode => {
    const node = treeNodes[nodeId];
    if (!node) return null;

    if (currentStep && node.stepIndex > currentStep.stepNumber && nodeId !== 'root') {
      return null;
    }

    const isCurrent = currentStep?.treeNodeId === nodeId;
    const isSolutionNode = isSolution && solutionPath.has(nodeId);
    const channelMeta = getChannelByNumber(node.channelNumber);

    if (nodeId === 'root') {
      return (
        <div key={nodeId} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Root Node */}
          <div
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              backgroundColor: '#e0e7ff',
              border: '2px solid #6366f1',
              fontSize: '12px',
              fontWeight: 700,
              color: '#1e1b4b',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '16px',
            }}
          >
            <Compass size={16} color="#6366f1" />
            <span>Root: State Space Start</span>
          </div>

          {/* Children container */}
          {node.children.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '20px',
                paddingTop: '8px',
                borderTop: '2px solid #e2e8f0',
                width: '100%',
              }}
            >
              {node.children.map((childId) => renderSubtree(childId, level + 1))}
            </div>
          )}
        </div>
      );
    }

    // Base node box style
    let nodeStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '6px 10px',
      borderRadius: '8px',
      border: '1px solid #cbd5e1',
      backgroundColor: '#f8fafc',
      color: '#1e293b',
      fontSize: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      minWidth: '90px',
      transition: 'all 0.2s',
    };
    let statusBadge: React.ReactNode = null;

    if (node.status === 'conflict') {
      nodeStyle = {
        ...nodeStyle,
        border: '2px solid #ef4444',
        backgroundColor: '#fef2f2',
        color: '#7f1d1d',
      };
      statusBadge = (
        <span style={{ fontSize: '10px', fontWeight: 700, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '3px' }}>
          <X size={12} color="#ef4444" style={{ flexShrink: 0 }} />
          Conflict
        </span>
      );
    } else if (node.status === 'backtracked') {
      nodeStyle = {
        ...nodeStyle,
        border: '2px solid #f59e0b',
        backgroundColor: '#fffbeb',
        color: '#78350f',
      };
      statusBadge = (
        <span style={{ fontSize: '10px', fontWeight: 700, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '3px' }}>
          <CornerDownLeft size={12} color="#f59e0b" style={{ flexShrink: 0 }} />
          Backtrack
        </span>
      );
    } else if (node.status === 'solution' || isSolutionNode) {
      nodeStyle = {
        ...nodeStyle,
        border: '2px solid #10b981',
        backgroundColor: '#f0fdf4',
        color: '#064e3b',
        boxShadow: '0 0 12px rgba(16,185,129,0.3)',
      };
      statusBadge = (
        <span style={{ fontSize: '10px', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px' }}>
          <Sparkles size={12} color="#10b981" style={{ flexShrink: 0 }} />
          Valid Sol
        </span>
      );
    } else if (node.status === 'safe') {
      nodeStyle = {
        ...nodeStyle,
        border: '2px solid #3b82f6',
        backgroundColor: '#eff6ff',
        color: '#1e3a8a',
      };
      statusBadge = (
        <span style={{ fontSize: '10px', fontWeight: 700, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '3px' }}>
          <Check size={12} color="#3b82f6" style={{ flexShrink: 0 }} />
          Safe
        </span>
      );
    }

    // Apply active/selected ring highlight
    if (isCurrent) {
      nodeStyle = {
        ...nodeStyle,
        outline: '2px solid #f59e0b',
        outlineOffset: '2px',
        transform: 'scale(1.05)',
        zIndex: 20,
      };
    }

    return (
      <div
        key={nodeId}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', margin: '4px 0' }}
      >
        {/* Node Box */}
        <div ref={isCurrent ? activeNodeRef : null} style={nodeStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                display: 'inline-block',
                flexShrink: 0,
                backgroundColor: channelMeta?.color || '#38bdf8',
              }}
            />
            <span>
              {node.vertexId} = Ch {node.channelNumber}
            </span>
          </div>

          <div
            style={{
              marginTop: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              fontSize: '10px',
              gap: '4px',
            }}
          >
            {statusBadge}
            {node.conflictingWith && (
              <span style={{ fontSize: '9px', color: '#ef4444', fontFamily: 'monospace' }}>
                w/ {node.conflictingWith}
              </span>
            )}
          </div>
        </div>

        {/* Children Subtrees */}
        {node.children.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '10px',
              paddingTop: '10px',
              borderTop: '2px solid #e2e8f0',
              marginTop: '8px',
            }}
          >
            {node.children.map((childId) => renderSubtree(childId, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const totalExplored = Object.keys(treeNodes).length - 1;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(15,23,42,0.05)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          fontSize: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <GitBranch size={16} color="#10b981" />
          <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '13.5px' }}>
            State-Space Search Tree Visualization
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#64748b' }}>
          <span>
            Decisions: <strong style={{ color: '#0f172a' }}>{totalExplored}</strong>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#10b981', fontWeight: 600 }}>
            <Check size={12} color="#10b981" /> Safe
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#ef4444', fontWeight: 600 }}>
            <X size={12} color="#ef4444" /> Clash
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#f59e0b', fontWeight: 600 }}>
            <CornerDownLeft size={12} color="#f59e0b" /> Backtrack
          </span>
        </div>
      </div>

      {/* Graphical Tree Display */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          overflowX: 'auto',
          overflowY: 'auto',
          padding: '12px',
          backgroundColor: '#fafbfc',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          minHeight: '175px',
        }}
      >
        {rootId && treeNodes[rootId] ? (
          <div
            style={{
              minWidth: 'max-content',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '8px 0',
            }}
          >
            {renderSubtree(rootId)}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0', fontSize: '12px' }}>
            Press [Start] or [Step] to begin exploring the decision tree.
          </div>
        )}
      </div>
    </div>
  );
};
