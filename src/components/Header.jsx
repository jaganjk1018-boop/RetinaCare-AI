import React from 'react';
import { 
  Eye, 
  Camera, 
  Stethoscope, 
  Sliders, 
  ShieldCheck, 
  Wifi, 
  WifiOff, 
  Activity, 
  Clock, 
  Cpu, 
  FileCheck2 
} from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  isOnline, 
  setIsOnline, 
  pendingSyncCount 
}) {
  return (
    <header className="glass-panel-elevated" style={{ 
      margin: '0.75rem 1rem', 
      padding: '0.85rem 1.5rem',
      position: 'sticky',
      top: '0.75rem',
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Brand & Subtitle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ 
            width: '42px', 
            height: '42px', 
            borderRadius: '12px', 
            background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 50%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(14, 165, 233, 0.45)'
          }}>
            <Eye size={24} color="#ffffff" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                RetinaCare <span style={{ color: '#38bdf8' }}>AI</span>
              </h1>
              <span className="badge badge-primary font-mono" style={{ fontSize: '0.7rem' }}>
                MATLAB v2.4 CORE
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Explainable, Field-Ready DR Screening Operating System • Rural India Edition
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(7, 12, 20, 0.6)', padding: '0.3rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setActiveTab('capture')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.5rem 0.95rem',
              borderRadius: '9px',
              border: 'none',
              background: activeTab === 'capture' ? 'var(--primary-500)' : 'transparent',
              color: activeTab === 'capture' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: activeTab === 'capture' ? 600 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Camera size={16} />
            <span>Field Capture PWA</span>
            {pendingSyncCount > 0 && (
              <span style={{ 
                background: '#f59e0b', 
                color: '#000', 
                fontSize: '0.65rem', 
                padding: '0.1rem 0.4rem', 
                borderRadius: '99px',
                fontWeight: 700 
              }}>
                {pendingSyncCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('review')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.5rem 0.95rem',
              borderRadius: '9px',
              border: 'none',
              background: activeTab === 'review' ? 'var(--primary-500)' : 'transparent',
              color: activeTab === 'review' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: activeTab === 'review' ? 600 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Stethoscope size={16} />
            <span>Doctor Console (&lt;30s)</span>
          </button>

          <button
            onClick={() => setActiveTab('simulink')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.5rem 0.95rem',
              borderRadius: '9px',
              border: 'none',
              background: activeTab === 'simulink' ? 'var(--primary-500)' : 'transparent',
              color: activeTab === 'simulink' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: activeTab === 'simulink' ? 600 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Sliders size={16} />
            <span>Simulink Planner</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.5rem 0.95rem',
              borderRadius: '9px',
              border: 'none',
              background: activeTab === 'audit' ? 'var(--primary-500)' : 'transparent',
              color: activeTab === 'audit' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: activeTab === 'audit' ? 600 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <ShieldCheck size={16} />
            <span>Audit &amp; Rigor</span>
          </button>
        </nav>

        {/* Connectivity Toggle & Live Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <button
            onClick={() => setIsOnline(!isOnline)}
            title={isOnline ? "Simulate Offline Mode (Zero Internet PHC)" : "Simulate Online Connectivity"}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              border: isOnline ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(245, 158, 11, 0.5)',
              background: isOnline ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.15)',
              color: isOnline ? '#34d399' : '#fbbf24',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
              transition: 'all 0.2s ease'
            }}
          >
            {isOnline ? <Wifi size={15} /> : <WifiOff size={15} />}
            <span>{isOnline ? "Online (PHC Uplink)" : "Offline (Store-Forward)"}</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '0.75rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }}></span>
            <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              GPU: 410ms
            </span>
          </div>
        </div>

      </div>

      {/* District Live Telemetry Bar */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginTop: '0.65rem', 
        paddingTop: '0.65rem', 
        borderTop: '1px solid var(--border-subtle)',
        fontSize: '0.75rem',
        color: 'var(--text-secondary)',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Activity size={13} color="var(--primary-400)" />
            <span>District: <strong style={{ color: '#fff' }}>Mysore Rural</strong></span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <FileCheck2 size={13} color="#34d399" />
            <span>Screened Today: <strong style={{ color: '#34d399' }}>148</strong></span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Clock size={13} color="#fbbf24" />
            <span>Avg Review Time: <strong style={{ color: '#fbbf24' }}>21.4s</strong> (Target &lt;30s)</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="badge badge-pass" style={{ fontSize: '0.68rem' }}>
            IDRiD Sensitivity: 92.4%
          </span>
          <span className="badge badge-primary" style={{ fontSize: '0.68rem' }}>
            Simulink Backlog: 0 cases
          </span>
        </div>
      </div>
    </header>
  );
}
