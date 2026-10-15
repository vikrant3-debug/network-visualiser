import React, { useEffect, useRef } from 'react';
import cytoscape, { Core } from 'cytoscape';
import { AccessPoint, InterferenceEdge, AlgorithmStep, WiFiChannel } from '../types';
import { getChannelByNumber } from '../constants/channels';
import { Wifi, Plus, Minus, Maximize2 } from 'lucide-react';

interface NetworkGraphProps {
  nodes: AccessPoint[];
  edges: InterferenceEdge[];
  currentStep: AlgorithmStep | null;
  currentAssignments: Record<string, number | null>;
  activeVertexId: string | null;
  conflictingEdgeId: string | null;
  conflictingVertexId: string | null;
  isSolution: boolean;
  availableChannels: WiFiChannel[];
  presetId: string | null;
  onNodeMove?: (id: string, x: number, y: number) => void;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  nodes,
  edges,
  currentStep,
  currentAssignments,
  activeVertexId,
  conflictingEdgeId,
  conflictingVertexId,
  isSolution,
  availableChannels,
  presetId,
  onNodeMove,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [viewportVersion, setViewportVersion] = React.useState(0);

  // Initialize Cytoscape
  useEffect(() => {
    if (!containerRef.current) return;

    const elements: cytoscape.ElementDefinition[] = [];

    nodes.forEach((node) => {
      elements.push({
        group: 'nodes',
        data: {
          id: node.id,
          label: node.id,
          channelNumber: null,
          channelBg: '#f1f5f9',
          channelBorder: '#94a3b8',
        },
        position: { x: node.x, y: node.y },
      });
    });

    edges.forEach((edge) => {
      elements.push({
        group: 'edges',
        data: {
          id: edge.id,
          source: edge.source,
          target: edge.target,
        },
      });
    });

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-image': `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><line x1="20" y1="22" x2="14" y2="8" stroke="#475569" stroke-width="3" stroke-linecap="round"/><line x1="32" y1="22" x2="32" y2="6" stroke="#475569" stroke-width="3" stroke-linecap="round"/><line x1="44" y1="22" x2="50" y2="8" stroke="#475569" stroke-width="3" stroke-linecap="round"/><rect x="10" y="22" width="44" height="22" rx="5" fill="#1e293b"/><circle cx="20" cy="33" r="3" fill="#10b981"/><circle cx="30" cy="33" r="3" fill="#f59e0b"/><circle cx="40" cy="33" r="3" fill="#3b82f6"/><path d="M47,29 Q50,26 53,29" stroke="#ffffff" stroke-width="1.5" fill="none" stroke-linecap="round"/><rect x="24" y="44" width="16" height="4" rx="2" fill="#334155"/><rect x="20" y="48" width="24" height="3" rx="2" fill="#475569"/></svg>')}`,
            'background-fit': 'contain',
            'background-clip': 'none',
            'background-opacity': 1,
            'background-color': 'data(channelBg)',
            'border-width': '2.5px',
            'border-color': 'data(channelBorder)',
            width: '72px',
            height: '72px',
            label: 'data(label)',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'text-margin-y': 6,
            'font-size': '11px',
            'font-weight': 'bold',
            'font-family': 'Inter, system-ui, sans-serif',
            color: '#0f172a',
            'transition-property': 'background-color, border-color, border-width, width, height',
            'transition-duration': 0.2,
          },
        },
        {
          selector: 'node.active-node',
          style: {
            'border-width': '4.5px',
            'border-color': '#f59e0b',
            width: '70px',
            height: '70px',
          },
        },
        {
          selector: 'node.conflict-node',
          style: {
            'border-width': '4.5px',
            'border-color': '#ef4444',
            'background-color': '#fee2e2',
          },
        },
        {
          selector: 'edge',
          style: {
            width: 2,
            'line-color': '#334155',
            'curve-style': 'straight',
            opacity: 0.95,
            'transition-property': 'line-color, width, opacity',
            'transition-duration': 0.2,
          },
        },
        {
          selector: 'edge.conflict-edge',
          style: {
            'line-color': '#ef4444',
            width: 4.5,
            opacity: 1,
            'z-index': 99,
          },
        },
        {
          selector: 'edge.safe-edge',
          style: {
            'line-color': '#10b981',
            width: 2.5,
            opacity: 0.85,
          },
        },
      ],
      layout: {
        name: 'preset',
      },
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false,
    });

    cy.fit(undefined, 35);

    cy.on('dragfree', 'node', (evt) => {
      const node = evt.target;
      const pos = node.position();
      if (onNodeMove) {
        onNodeMove(node.id(), Math.round(pos.x), Math.round(pos.y));
      }
    });

    cyRef.current = cy;

    cy.on('viewport', () => {
      // Trigger React re-render to recompute ripple positions
      setViewportVersion((v) => v + 1);
    });

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [nodes.length, edges.length]);

  // Update Cytoscape visuals
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.batch(() => {
      nodes.forEach((node) => {
        const cyNode = cy.getElementById(node.id);
        if (!cyNode || cyNode.length === 0) return;

        const assignedChannelNum = currentAssignments[node.id];
        const channelMeta = getChannelByNumber(assignedChannelNum);

        const isCurrent = activeVertexId === node.id;
        const isConflict =
          conflictingVertexId === node.id ||
          (isCurrent && currentStep?.type === 'CONFLICT_DETECTED');

        let bg = '#f8fafc';
        let border = '#cbd5e1';

        // Predefined pastel palette matching reference screenshot
        const defaultPalette: Record<string, { bg: string; border: string }> = {
          AP1: { bg: '#fca5a5', border: '#ef4444' }, // Red
          AP2: { bg: '#93c5fd', border: '#2563eb' }, // Blue
          AP3: { bg: '#86efac', border: '#10b981' }, // Green
          AP4: { bg: '#d8b4fe', border: '#a855f7' }, // Purple
          AP5: { bg: '#f472b6', border: '#ec4899' }, // Magenta
          AP6: { bg: '#fde047', border: '#eab308' }, // Yellow
        };

        if (assignedChannelNum !== null && assignedChannelNum !== undefined && channelMeta) {
          bg = channelMeta.lightColor;
          border = channelMeta.color;
        } else if (isCurrent && currentStep?.tryingChannel) {
          const testMeta = getChannelByNumber(currentStep.tryingChannel);
          if (testMeta) {
            bg = testMeta.lightColor;
            border = testMeta.color;
          }
        } else if (defaultPalette[node.id]) {
          bg = defaultPalette[node.id].bg;
          border = defaultPalette[node.id].border;
        }

        cyNode.data('channelBg', bg);
        cyNode.data('channelBorder', border);

        cyNode.removeClass('active-node conflict-node');
        if (isConflict) {
          cyNode.addClass('conflict-node');
        } else if (isCurrent) {
          cyNode.addClass('active-node');
        }
      });

      edges.forEach((edge) => {
        const cyEdge = cy.getElementById(edge.id);
        if (!cyEdge || cyEdge.length === 0) return;

        cyEdge.removeClass('conflict-edge safe-edge');

        const isConflictEdge =
          conflictingEdgeId === edge.id ||
          (currentStep?.conflictingEdgeId &&
            (currentStep.conflictingEdgeId === edge.id ||
              currentStep.conflictingEdgeId === `${edge.target}-${edge.source}`));

        if (isConflictEdge) {
          cyEdge.addClass('conflict-edge');
        } else if (isSolution) {
          cyEdge.addClass('safe-edge');
        }
      });
    });
  }, [
    nodes,
    edges,
    currentStep,
    currentAssignments,
    activeVertexId,
    conflictingEdgeId,
    conflictingVertexId,
    isSolution,
  ]);

  // Ripple overlay: animate signal waves on assigned nodes
  useEffect(() => {
    const cy = cyRef.current;
    const overlay = overlayRef.current;
    if (!cy || !overlay) return;

    // Clear previous ripples
    overlay.innerHTML = '';

    const rippleDuration = isSolution ? '2.5s' : '1.8s';

    let rippleIndex = 0;
    nodes.forEach((node) => {
      const assignedChannel = currentAssignments[node.id];
      if (assignedChannel === null || assignedChannel === undefined) return;

      const channelMeta = getChannelByNumber(assignedChannel);
      if (!channelMeta) return;

      const cyNode = cy.getElementById(node.id);
      if (!cyNode || cyNode.length === 0) return;

      const pos = cyNode.renderedPosition();
      if (!pos) return;

      const rippleColor = isSolution ? '#10b981' : channelMeta.color;

      const rippleDiv = document.createElement('div');
      rippleDiv.style.cssText = `
        position: absolute;
        left: ${pos.x - 36}px;
        top: ${pos.y - 36}px;
        width: 72px;
        height: 72px;
        border-radius: 50%;
        border: 3px solid ${rippleColor};
        opacity: 0.6;
        pointer-events: none;
        animation: wifi-ripple ${rippleDuration} ease-out infinite;
        animation-delay: ${rippleIndex * 0.25}s;
      `;
      overlay.appendChild(rippleDiv);
      rippleIndex++;
    });
  }, [currentAssignments, nodes, isSolution, viewportVersion]);

  const handleZoomIn = () => {
    if (cyRef.current) cyRef.current.zoom(cyRef.current.zoom() * 1.2);
  };

  const handleZoomOut = () => {
    if (cyRef.current) cyRef.current.zoom(cyRef.current.zoom() * 0.8);
  };

  const handleFit = () => {
    if (cyRef.current) cyRef.current.fit(undefined, 35);
  };

  const floorPlanLabels: Record<string, string[]> = {
    'small-office': ['LOBBY / RECEPTION', 'CONFERENCE ROOM', 'WEST OFFICE', 'EAST OFFICE', 'BREAKOUT ZONE', 'SERVER / STORAGE'],
    'college-floor': ['DAA LAB', 'LECTURE HALL', 'WEST LECTURE', 'EAST LECTURE', 'LIBRARY', 'ROBOTICS LAB'],
    'dense-network': ['ZONE A', 'ZONE B', 'ZONE C', 'ZONE D', 'ZONE E', 'ZONE F'],
  };

  const labels = floorPlanLabels[presetId ?? ''] ?? ['AREA 1', 'AREA 2', 'AREA 3', 'AREA 4', 'AREA 5', 'AREA 6'];

  return (
    <div className="app-card" style={{ height: '100%' }}>
      {/* Top Header */}
      <div className="graph-header-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Wifi size={16} color="#2563eb" />
          <h2 className="card-header-title">Wi-Fi Network — Floor Plan Topology</h2>
        </div>

        {/* Legend */}
        <div className="graph-legend">
          {availableChannels.map((ch) => (
            <div key={ch.id} className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: ch.color }} />
              <span>{ch.label}</span>
            </div>
          ))}
        </div>
      </div>

      <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
        📍 Floor Plan View — Router icons show real AP placement. Edges indicate co-channel interference zones.
      </p>

      {/* Interactive Cytoscape Canvas */}
      <div className="graph-canvas-box" style={{ position: 'relative' }}>
        {/* Static Floor Plan Background */}
        <svg
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
          viewBox="0 0 520 360"
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer building boundary */}
          <rect x="20" y="20" width="480" height="320" rx="6" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2.5" />

          {/* Room fills */}
          <rect x="25" y="25" width="225" height="150" rx="4" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="1" />
          <rect x="265" y="25" width="230" height="150" rx="4" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="1" />
          <rect x="25" y="185" width="225" height="75" rx="4" fill="#fefce8" stroke="#fde68a" strokeWidth="1" />
          <rect x="265" y="185" width="230" height="75" rx="4" fill="#fdf4ff" stroke="#e9d5ff" strokeWidth="1" />
          <rect x="25" y="265" width="225" height="75" rx="4" fill="#fff7ed" stroke="#fed7aa" strokeWidth="1" />
          <rect x="265" y="265" width="230" height="75" rx="4" fill="#f0f9ff" stroke="#bae6fd" strokeWidth="1" />

          {/* Corridor lines */}
          <line x1="20" y1="180" x2="500" y2="180" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="6,4" />
          <line x1="260" y1="20" x2="260" y2="340" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="6,4" />

          {/* Door arcs */}
          <path d="M230,170 Q240,180 230,190" stroke="#94a3b8" fill="none" strokeWidth="1" />
          <path d="M270,170 Q260,180 270,190" stroke="#94a3b8" fill="none" strokeWidth="1" />

          {/* Room labels */}
          <text x="80" y="42" fontSize="9" fill="#94a3b8" fontFamily="monospace">{labels[0]}</text>
          <text x="305" y="42" fontSize="9" fill="#94a3b8" fontFamily="monospace">{labels[1]}</text>
          <text x="60" y="200" fontSize="9" fill="#94a3b8" fontFamily="monospace">{labels[2]}</text>
          <text x="310" y="200" fontSize="9" fill="#94a3b8" fontFamily="monospace">{labels[3]}</text>
          <text x="60" y="280" fontSize="9" fill="#94a3b8" fontFamily="monospace">{labels[4]}</text>
          <text x="290" y="280" fontSize="9" fill="#94a3b8" fontFamily="monospace">{labels[5]}</text>

          {/* Floor plan title and north indicator */}
          <text x="28" y="15" fontSize="8" fill="#94a3b8" fontFamily="monospace">
            {presetId === 'college-floor' ? 'COLLEGE BUILDING — WIFI DEPLOYMENT'
             : presetId === 'dense-network' ? 'CONFERENCE CENTER — WIFI DEPLOYMENT'
             : 'OFFICE FLOOR PLAN — WIFI DEPLOYMENT'}
          </text>
          <text x="488" y="35" fontSize="9" fill="#94a3b8" fontFamily="monospace">N↑</text>
        </svg>

        {/* Floating Zoom Controls */}
        <div className="graph-zoom-controls">
          <button onClick={handleZoomIn} className="zoom-btn" title="Zoom In">
            <Plus size={14} />
          </button>
          <button onClick={handleZoomOut} className="zoom-btn" title="Zoom Out">
            <Minus size={14} />
          </button>
          <button onClick={handleFit} className="zoom-btn" title="Fit to Center">
            <Maximize2 size={14} />
          </button>
        </div>

        {/* Canvas DOM Element */}
        <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '380px', position: 'relative', zIndex: 1 }} />

        {/* Signal Wave Ripple Overlay */}
        <div
          ref={overlayRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 2,
            overflow: 'hidden',
          }}
        />
      </div>
    </div>
  );
};
