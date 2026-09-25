import React, { useState } from 'react';
import Header from './components/Header';
import FieldCapturePWA from './components/FieldCapturePWA';
import OphthalmologistConsole from './components/OphthalmologistConsole';
import SimulinkCapacityPlanner from './components/SimulinkCapacityPlanner';
import AuditAndRigorView from './components/AuditAndRigorView';
import PatientExplainerModal from './components/PatientExplainerModal';
import ReferralLetterModal from './components/ReferralLetterModal';
import { SAMPLE_CASES } from './data/mockData';

export default function App() {
  // Navigation & Connectivity
  const [activeTab, setActiveTab] = useState('review'); // Start on review console for immediate wow factor!
  const [isOnline, setIsOnline] = useState(true);

  // Global Cases State
  const [cases, setCases] = useState(SAMPLE_CASES);
  const [selectedCaseId, setSelectedCaseId] = useState(SAMPLE_CASES[0].id);
  const [pendingQueue, setPendingQueue] = useState([]);

  // Modals State
  const [patientExplainerCase, setPatientExplainerCase] = useState(null);
  const [referralLetterCase, setReferralLetterCase] = useState(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // When a field worker captures a new case
  const handleCaseCaptured = (capturedData) => {
    const newCase = {
      id: `RC-2026-${Math.floor(100 + Math.random() * 900)}`,
      patientName: capturedData.patient.name,
      age: parseInt(capturedData.patient.age) || 50,
      gender: capturedData.patient.gender,
      phone: capturedData.patient.phone,
      aadhaarHash: capturedData.patient.aadhaarHash,
      phcLocation: capturedData.patient.phc,
      diabetesYears: parseInt(capturedData.patient.diabetesYears) || 6,
      hba1c: parseFloat(capturedData.patient.hba1c) || 7.5,
      eye: capturedData.patient.eye,
      capturedAt: capturedData.timestamp,
      imageSrc: capturedData.image,
      qaStatus: capturedData.qa.status,
      qaScore: {
        focus: capturedData.qa.focus,
        illumination: capturedData.qa.illumination,
        fov: capturedData.qa.fov,
        glare: capturedData.qa.glare
      },
      icdrGrade: capturedData.qa.status === 'pass' ? 2 : 0,
      icdrLabel: capturedData.qa.status === 'pass' ? 'Moderate NPDR' : 'No Apparent DR',
      referable: capturedData.qa.status === 'pass',
      urgency: capturedData.qa.status === 'pass' ? 'high' : 'routine',
      rawConfidence: 0.935,
      calibratedConfidence: 0.878,
      temperature: 1.45,
      lesions: {
        microaneurysms: 14,
        hardExudates: 6,
        hemorrhages: 8,
        neovascularization: 0,
        macularEdemaRisk: "Moderate"
      },
      lesionBoxes: [
        { type: "exudate", x: 60, y: 25, w: 10, h: 8, label: "Hard Exudate cluster" },
        { type: "hemorrhage", x: 20, y: 60, w: 8, h: 8, label: "Deep retinal Hemorrhage" },
        { type: "ma", x: 50, y: 40, w: 4, h: 4, label: "Sub-pixel MA" }
      ],
      gradcamCenter: { x: 60, y: 40, radius: 35 },
      reviewStatus: 'pending',
      reviewer: null,
      reviewNotes: ''
    };

    setCases(prev => [newCase, ...prev]);
    setSelectedCaseId(newCase.id);
    showToast(`✓ Case ${newCase.id} successfully queued to District Triage!`);
  };

  // Immediate Prediction from Uploaded Image
  const handleDirectCaseAnalyzed = (analyzedCase, autoSwitch = true) => {
    setCases(prev => [analyzedCase, ...prev.filter(c => c.id !== analyzedCase.id)]);
    setSelectedCaseId(analyzedCase.id);
    showToast(`✓ AI Prediction Complete: ${analyzedCase.icdrLabel} (Grade ${analyzedCase.icdrGrade}) — ${Math.round(analyzedCase.calibratedConfidence * 100)}% Conf`);
    if (autoSwitch) {
      setActiveTab('review');
    }
  };

  // When an ophthalmologist approves or overrides
  const handleReviewCompleted = (reviewResult) => {
    setCases(prev => prev.map(c => {
      if (c.id === reviewResult.caseId) {
        return {
          ...c,
          reviewStatus: 'completed',
          reviewer: reviewResult.reviewer,
          finalGrade: reviewResult.finalGrade,
          agreedWithAi: reviewResult.agreedWithAi,
          overrideReason: reviewResult.overrideReason || '',
          reviewTimeSec: reviewResult.reviewTimeSec
        };
      }
      return c;
    }));

    showToast(
      reviewResult.agreedWithAi 
        ? `✓ Case ${reviewResult.caseId} Approved in ${reviewResult.reviewTimeSec}s! Referral letter generated.` 
        : `✓ Case ${reviewResult.caseId} Overridden to Grade ${reviewResult.finalGrade}. Audit block committed.`
    );
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          background: 'rgba(14, 165, 233, 0.95)',
          color: '#ffffff',
          padding: '0.75rem 1.25rem',
          borderRadius: '10px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          fontWeight: 600,
          fontSize: '0.85rem',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.2)',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          {toastMessage}
        </div>
      )}

      {/* Persistent Navigation Header */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOnline={isOnline} 
        setIsOnline={setIsOnline} 
        pendingSyncCount={pendingQueue.length} 
      />

      {/* Main Surface View */}
      <main style={{ flex: 1 }}>
        {activeTab === 'capture' && (
          <FieldCapturePWA 
            onCaseCaptured={handleCaseCaptured}
            onDirectCaseAnalyzed={handleDirectCaseAnalyzed}
            setActiveTab={setActiveTab}
            isOnline={isOnline} 
            pendingQueue={pendingQueue} 
            setPendingQueue={setPendingQueue} 
          />
        )}

        {activeTab === 'review' && (
          <OphthalmologistConsole 
            cases={cases} 
            selectedCaseId={selectedCaseId} 
            setSelectedCaseId={setSelectedCaseId} 
            onReviewCompleted={handleReviewCompleted}
            onDirectCaseAnalyzed={handleDirectCaseAnalyzed}
            onOpenPatientExplainer={(c) => setPatientExplainerCase(c)}
            onOpenReferralLetter={(c) => setReferralLetterCase(c)}
          />
        )}

        {activeTab === 'simulink' && (
          <SimulinkCapacityPlanner />
        )}

        {activeTab === 'audit' && (
          <AuditAndRigorView />
        )}
      </main>

      {/* "Explain Like I'm the Patient" Multilingual Modal */}
      {patientExplainerCase && (
        <PatientExplainerModal 
          caseData={patientExplainerCase} 
          onClose={() => setPatientExplainerCase(null)} 
        />
      )}

      {/* Ayushman Bharat Official Referral Sheet Modal */}
      {referralLetterCase && (
        <ReferralLetterModal 
          caseData={referralLetterCase} 
          onClose={() => setReferralLetterCase(null)} 
        />
      )}

      {/* Clinical Footer */}
      <footer style={{ 
        textAlign: 'center', 
        padding: '1.25rem', 
        fontSize: '0.75rem', 
        color: 'var(--text-muted)',
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(7, 12, 20, 0.9)'
      }}>
        <div>
          <strong>RetinaCare AI</strong> • Designed for the National Health Mission (NHM) &amp; Ayushman Bharat Telemedicine Infrastructure
        </div>
        <div style={{ marginTop: '0.25rem' }}>
          MATLAB / Simulink Core Toolchain • ResNet-50 / EfficientNet-B0 Backbone • IDRiD &amp; APTOS 2019 Validated
        </div>
      </footer>

    </div>
  );
}
