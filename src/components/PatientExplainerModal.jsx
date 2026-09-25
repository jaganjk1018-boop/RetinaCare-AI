import React, { useState } from 'react';
import { 
  X, 
  Volume2, 
  Languages, 
  Heart, 
  Printer, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';
import { PATIENT_EXPLANATIONS } from '../data/mockData';

export default function PatientExplainerModal({ 
  caseData, 
  onClose 
}) {
  const [selectedLang, setSelectedLang] = useState('hi'); // Default to Hindi for rural India demo
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!caseData) return null;

  const content = PATIENT_EXPLANATIONS[selectedLang] || PATIENT_EXPLANATIONS.en;
  const isReferable = caseData.referable;

  // Web Speech API Voice synthesis
  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      const textToSpeak = `${content.greeting}. ${isReferable ? content.summaryReferable : content.summaryGrade0}. ${content.actionTitle}. ${content.actionStep1}. ${content.actionStep2}.`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      
      // Match voice language
      const langCodes = { en: 'en-IN', hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN', bn: 'bn-IN' };
      utterance.lang = langCodes[selectedLang] || 'en-IN';
      utterance.rate = 0.9;

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech not supported in this browser.");
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="glass-panel-elevated" style={{
        maxWidth: '680px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '1.5rem',
        borderRadius: '16px',
        border: '1px solid var(--border-accent)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #ec4899, #f43f5e)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <Heart size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                "Explain Like I'm the Patient" Summary
              </h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Plain-Language, Multilingual Clinical Breakdown (Ayushman Bharat / Bhashini Ready)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Language Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {Object.entries(PATIENT_EXPLANATIONS).map(([code, item]) => (
            <button
              key={code}
              onClick={() => { setSelectedLang(code); if (isSpeaking) window.speechSynthesis.cancel(); setIsSpeaking(false); }}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: selectedLang === code ? '1px solid var(--primary-400)' : '1px solid var(--border-subtle)',
                background: selectedLang === code ? 'rgba(14, 165, 233, 0.2)' : 'var(--bg-surface)',
                color: selectedLang === code ? '#38bdf8' : 'var(--text-secondary)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {item.language}
            </button>
          ))}
        </div>

        {/* Patient Report Card in Selected Language */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderRadius: '12px',
          padding: '1.25rem',
          marginBottom: '1.25rem'
        }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Patient: <strong style={{ color: '#fff' }}>{caseData.patientName}</strong> ({caseData.age}y, {caseData.gender})
            </span>
            <span className={`badge ${isReferable ? 'badge-urgent' : 'badge-pass'}`}>
              {isReferable ? 'Consultation Needed' : 'Healthy Checkup'}
            </span>
          </div>

          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
            {content.title}
          </h4>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
            <strong>{content.greeting}</strong> {isReferable ? content.summaryReferable : content.summaryGrade0}
          </p>

          {/* Action Steps */}
          <div style={{
            background: 'rgba(7, 12, 20, 0.6)',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1rem'
          }}>
            <strong style={{ fontSize: '0.85rem', color: '#38bdf8', display: 'block', marginBottom: '0.5rem' }}>
              {content.actionTitle}
            </strong>
            <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.82rem', color: 'var(--text-primary)' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ color: '#fbbf24', fontWeight: 700 }}>1.</span>
                <span>{content.actionStep1}</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ color: '#fbbf24', fontWeight: 700 }}>2.</span>
                <span>{content.actionStep2}</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ color: '#fbbf24', fontWeight: 700 }}>3.</span>
                <span>{content.actionStep3}</span>
              </li>
            </ul>
          </div>

          {/* Calming Clinical Note */}
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem' }}>
            ❤️ {content.note}
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <button
            onClick={handleSpeak}
            className="btn-secondary"
            style={{ fontSize: '0.82rem' }}
          >
            <Volume2 size={16} color="var(--primary-400)" />
            <span>{isSpeaking ? "Stop Reading Aloud" : `Listen Aloud in ${content.language.split(' ')[0]}`}</span>
          </button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => window.print()}
              className="btn-secondary"
              style={{ fontSize: '0.82rem' }}
            >
              <Printer size={15} />
              <span>Print Patient Leaflet</span>
            </button>
            <button
              onClick={onClose}
              className="btn-primary"
              style={{ fontSize: '0.82rem' }}
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
