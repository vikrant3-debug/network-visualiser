import React from 'react';
import { Wifi, Home, Code, Grid, Eye, Info } from 'lucide-react';

interface HeaderProps {
  onNavClick?: (target: string) => void;
  healthScore: number;      // 0 to 100
  apCount: number;
  edgeCount: number;
  statusLabel: string;      // 'IDLE' | 'RUNNING' | 'SOLUTION_FOUND' | 'NO_SOLUTION'
}

export const Header: React.FC<HeaderProps> = ({
  onNavClick,
  healthScore,
  apCount,
  edgeCount,
  statusLabel,
}) => {
  return (
    <header className="app-header">
      <div className="header-inner">
        {/* Left Branding */}
        <div className="brand-wrapper">
          <div className="brand-icon-circle">
            <Wifi size={20} />
          </div>
          <div>
            <div className="brand-title">Virtual Wi-Fi Channel Allocation Model</div>
            <div className="brand-subrow">
              <span className="brand-subtitle">Graph Coloring with Backtracking</span>
              <span className="brand-badge">DAA Algorithm Visualization</span>
            </div>
          </div>
        </div>

        {/* Right Navigation */}
        <nav className="header-nav">
          <button
            onClick={() => onNavClick?.('home')}
            className="nav-btn nav-btn-active"
          >
            <Home size={14} />
            <span>Home</span>
          </button>
          <button
            onClick={() => onNavClick?.('algorithm')}
            className="nav-btn"
          >
            <Code size={14} />
            <span>Algorithm</span>
          </button>
          <button
            onClick={() => onNavClick?.('examples')}
            className="nav-btn"
          >
            <Grid size={14} />
            <span>Examples</span>
          </button>
          <button
            onClick={() => onNavClick?.('visualization')}
            className="nav-btn"
          >
            <Eye size={14} />
            <span>Visualization</span>
          </button>
          <button
            onClick={() => onNavClick?.('about')}
            className="nav-btn"
          >
            <Info size={14} />
            <span>About</span>
          </button>
        </nav>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          marginLeft: '24px',
          paddingLeft: '24px',
          borderLeft: '1px solid #30363d',
        }}>
          {/* 3 quick stat chips */}
          <div style={{ display: 'flex', gap: '12px', fontSize: '11px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: '16px', color: '#58a6ff', fontFamily: 'monospace' }}>{apCount}</div>
              <div style={{ color: '#8b949e' }}>APs</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: '16px', color: '#f78166', fontFamily: 'monospace' }}>{edgeCount}</div>
              <div style={{ color: '#8b949e' }}>Links</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: '16px', fontFamily: 'monospace', color: healthScore === 100 ? '#3fb950' : healthScore > 0 ? '#d29922' : '#8b949e' }}>
                {healthScore}%
              </div>
              <div style={{ color: '#8b949e' }}>Health</div>
            </div>
          </div>

          {/* Health bar */}
          <div style={{ width: '120px' }}>
            <div style={{ fontSize: '10px', color: '#8b949e', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Network Health</span>
              <span style={{ color: healthScore === 100 ? '#3fb950' : '#d29922' }}>{statusLabel === 'SOLUTION_FOUND' ? 'OPTIMAL' : statusLabel === 'NO_SOLUTION' ? 'FAILED' : statusLabel === 'RUNNING' ? 'COMPUTING' : 'IDLE'}</span>
            </div>
            <div style={{ height: '6px', backgroundColor: '#21262d', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${healthScore}%`,
                borderRadius: '9999px',
                backgroundColor: healthScore === 100 ? '#3fb950' : healthScore > 50 ? '#d29922' : '#f78166',
                transition: 'width 0.4s ease, background-color 0.4s ease',
              }} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
