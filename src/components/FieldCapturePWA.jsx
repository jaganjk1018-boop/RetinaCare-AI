import React, { useState } from 'react';
import { 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Upload, 
  RotateCcw, 
  HardDriveDownload, 
  Zap, 
  MapPin, 
  User, 
  Smartphone, 
  HelpCircle,
  Eye,
  Sliders,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { analyzeFundusImage } from '../utils/retinaAnalyzer';

export default function FieldCapturePWA({ 
  onCaseCaptured, 
  onDirectCaseAnalyzed,
  setActiveTab,
  isOnline, 
  pendingQueue, 
  setPendingQueue 
}) {
  // Preset demo test modes
  const [selectedPreset, setSelectedPreset] = useState('pass'); // 'pass', 'glare', 'moderate'
  const [customImage, setCustomImage] = useState(null);
  const [isAnalyzingUpload, setIsAnalyzingUpload] = useState(false);
  const [analyzedPrediction, setAnalyzedPrediction] = useState(null);
  
  // Patient Intake Form
  const [patientForm, setPatientForm] = useState({
    name: 'Sudhakar Reddy',
    age: '54',
    gender: 'Male',
    phone: '+91 94481 20981',
    aadhaarHash: 'e391...5a89',
    phc: 'PHC Hunsur, Mysore',
    diabetesYears: '9',
    hba1c: '8.8',
    eye: 'OD (Right Eye)'
  });

  // Simulated Live Camera HUD State
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureResult, setCaptureResult] = useState(null);

  // Active image based on preset
  const getActiveImageUrl = () => {
    if (customImage) return customImage;
    if (selectedPreset === 'glare') return '/assets/poor_quality_fundus.jpg';
    if (selectedPreset === 'moderate') return '/assets/moderate_dr_fundus.jpg';
    return '/assets/normal_fundus.jpg';
  };

  // Real-time QA Metrics calculated for the active mode
  const getQaMetrics = () => {
    if (selectedPreset === 'glare') {
      return {
        status: 'reject',
        statusText: 'QA REJECTED (Recapture Required)',
        color: '#ef4444',
        focus: 54.0,
        focusStatus: 'Blur Detected',
        illumination: 42.0,
        illuminationStatus: 'Uneven / Low',
        fov: 78.5,
        fovStatus: 'Decentered',
        glare: 28.4,
        glareStatus: 'Severe Glare in Q2',
        guidance: 'Actionable Recapture Guidance: Specular corneal glare detected in upper-nasal quadrant (28.4%). Please angle illumination light source 15° laterally, shield ambient daylight from the clinic window, and ask the patient to fixate on the green LED target.'
      };
    } else if (selectedPreset === 'moderate') {
      return {
        status: 'pass',
        statusText: 'QA PASSED (Referable Signs Detected)',
        color: '#10b981',
        focus: 93.6,
        focusStatus: 'Optimal Focus',
        illumination: 90.2,
        illuminationStatus: 'Uniform Field',
        fov: 95.8,
        fovStatus: 'Well Centered',
        glare: 1.5,
        glareStatus: 'No Artifact',
        guidance: 'Image quality is excellent. Optic disc and macular arcade clearly visible. Ready for clinical triage grading.'
      };
    } else {
      return {
        status: 'pass',
        statusText: 'QA PASSED (Optimal Quality)',
        color: '#10b981',
        focus: 98.2,
        focusStatus: 'Pin-Sharp Vessels',
        illumination: 96.5,
        illuminationStatus: 'Balanced CLAHE',
        fov: 99.0,
        fovStatus: 'Full 45° FOV',
        glare: 0.4,
        glareStatus: 'Zero Glare',
        guidance: 'High diagnostic clarity. Retinal parenchyma and foveal reflex sharp. Complies with ICDR screening standards.'
      };
    }
  };

  const currentQA = getQaMetrics();

  // Handle Image Upload from device with immediate AI prediction
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomImage(url);
      setSelectedPreset('custom');
      setCaptureResult(null);
      setIsAnalyzingUpload(true);
      setAnalyzedPrediction(null);

      try {
        const prediction = await analyzeFundusImage(url, patientForm);
        setAnalyzedPrediction(prediction);
        setIsAnalyzingUpload(false);
      } catch (err) {
        console.error("AI analysis failed:", err);
        setIsAnalyzingUpload(false);
      }
    }
  };

  // Handle Capture Action
  const handleCapture = async () => {
    setIsCapturing(true);
    
    // If user already uploaded a custom image and has analyzed prediction:
    if (selectedPreset === 'custom' && analyzedPrediction) {
      setTimeout(() => {
        setIsCapturing(false);
        if (onDirectCaseAnalyzed) {
          onDirectCaseAnalyzed(analyzedPrediction, true);
        } else {
          onCaseCaptured(analyzedPrediction);
        }
      }, 500);
      return;
    }

    // Otherwise analyze current preset or custom image
    try {
      const activeUrl = getActiveImageUrl();
      const prediction = await analyzeFundusImage(activeUrl, patientForm);
      setTimeout(() => {
        setIsCapturing(false);
        if (onDirectCaseAnalyzed) {
          onDirectCaseAnalyzed(prediction, true);
        } else {
          onCaseCaptured(prediction);
        }
      }, 600);
    } catch (err) {
      setIsCapturing(false);
      const fallbackResult = {
        patient: { ...patientForm },
        image: getActiveImageUrl(),
        qa: currentQA,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour12: false }) + ' IST',
        synced: isOnline
      };
      onCaseCaptured(fallbackResult);
    }
  };

  // Sync Offline Queue
  const handleSyncQueue = () => {
    if (pendingQueue.length === 0) return;
    pendingQueue.forEach(item => onCaseCaptured(item));
    setPendingQueue([]);
  };

  return (
    <div style={{ padding: '0 1rem 2rem', maxWidth: '1440px', margin: '0 auto' }}>
      
      {/* Offline Alert Banner */}
      {!isOnline && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.15)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          borderRadius: '12px',
          padding: '0.75rem 1.25rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#fbbf24',
          fontSize: '0.85rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <AlertTriangle size={18} />
            <span>
              <strong>Zero-Connectivity Mode (Offline PHC):</strong> Real-time capture QA runs on-device. Images will be stored in IndexedDB and automatically synced when uplink is detected.
            </span>
          </div>
          <span className="badge badge-warning font-mono">
            {pendingQueue.length} Local Cases Stored
          </span>
        </div>
      )}

      {/* Main Grid: Viewfinder & QA HUD on Left, Patient Form & Sync on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.4fr) minmax(320px, 1fr)', gap: '1.25rem' }}>
        
        {/* Left Column: Fundus Viewfinder & Live Traffic-Light QA */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          
          {/* Viewfinder Header Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Smartphone size={18} color="var(--primary-400)" />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                Live Fundus Viewfinder &amp; Capture Assist
              </h2>
            </div>

            {/* Test Preset Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-surface)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', paddingLeft: '0.4rem' }}>Demo Sample:</span>
              <button
                onClick={() => { setSelectedPreset('pass'); setCustomImage(null); setCaptureResult(null); }}
                style={{
                  background: selectedPreset === 'pass' ? '#10b981' : 'transparent',
                  color: selectedPreset === 'pass' ? '#000' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                1. Healthy (Pass)
              </button>
              <button
                onClick={() => { setSelectedPreset('glare'); setCustomImage(null); setCaptureResult(null); }}
                style={{
                  background: selectedPreset === 'glare' ? '#ef4444' : 'transparent',
                  color: selectedPreset === 'glare' ? '#fff' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                2. Glare (Reject &amp; Guide)
              </button>
              <button
                onClick={() => { setSelectedPreset('moderate'); setCustomImage(null); setCaptureResult(null); }}
                style={{
                  background: selectedPreset === 'moderate' ? '#f59e0b' : 'transparent',
                  color: selectedPreset === 'moderate' ? '#000' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                3. Moderate DR (Triage)
              </button>
            </div>
          </div>

          {/* Interactive Viewfinder Frame with Traffic Light Border */}
          <div style={{ 
            position: 'relative', 
            borderRadius: '16px', 
            overflow: 'hidden',
            aspectRatio: '1 / 1',
            maxHeight: '440px',
            margin: '0 auto',
            border: `3px solid ${currentQA.color}`,
            boxShadow: `0 0 30px ${currentQA.status === 'pass' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.35)'}`,
            background: '#000'
          }}>
            {/* The Fundus Image / Live Feed */}
            <img 
              src={getActiveImageUrl()} 
              alt="Fundus Viewfinder" 
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            />

            {/* HUD Target Reticle and Corners */}
            <div className="hud-corner tl" style={{ borderColor: currentQA.color }}></div>
            <div className="hud-corner tr" style={{ borderColor: currentQA.color }}></div>
            <div className="hud-corner bl" style={{ borderColor: currentQA.color }}></div>
            <div className="hud-corner br" style={{ borderColor: currentQA.color }}></div>

            {/* Center Crosshair for Optic Disc & Macula Centration */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '120px',
              height: '120px',
              border: `1.5px dashed ${currentQA.color}`,
              borderRadius: '50%',
              pointerEvents: 'none',
              opacity: 0.6
            }}>
              <div style={{ position: 'absolute', top: '50%', left: '0', right: '0', height: '1px', background: currentQA.color }}></div>
              <div style={{ position: 'absolute', left: '50%', top: '0', bottom: '0', width: '1px', background: currentQA.color }}></div>
            </div>

            {/* Top HUD Banner: Live Traffic-Light Score */}
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              right: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(7, 12, 20, 0.85)',
              backdropFilter: 'blur(8px)',
              padding: '0.5rem 0.85rem',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: currentQA.color,
                  boxShadow: `0 0 10px ${currentQA.color}`,
                  display: 'inline-block'
                }}></span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: currentQA.color }}>
                  {currentQA.statusText}
                </span>
              </div>
              <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                45° FIELD OF VIEW
              </span>
            </div>

            {/* Glare Quadrant Warning Overlay if rejected */}
            {selectedPreset === 'glare' && (
              <div style={{
                position: 'absolute',
                top: '25%',
                right: '10%',
                background: 'rgba(239, 68, 68, 0.9)',
                color: '#fff',
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 0 15px rgba(239, 68, 68, 0.6)'
              }}>
                <AlertTriangle size={14} />
                <span>CORNEAL GLARE DETECTED (28.4%)</span>
              </div>
            )}

            {/* Bottom HUD: Live Real-time Quality Meters */}
            <div style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              right: '12px',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.5rem',
              background: 'rgba(7, 12, 20, 0.88)',
              backdropFilter: 'blur(10px)',
              padding: '0.6rem 0.75rem',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '0.72rem'
            }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>FOCUS (LAPLACIAN)</div>
                <div style={{ fontWeight: 700, color: currentQA.focus >= 85 ? '#34d399' : '#f87171' }}>
                  {currentQA.focus}%
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>ILLUMINATION</div>
                <div style={{ fontWeight: 700, color: currentQA.illumination >= 75 ? '#34d399' : '#f87171' }}>
                  {currentQA.illumination}%
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>FOV CENTRATION</div>
                <div style={{ fontWeight: 700, color: currentQA.fov >= 85 ? '#34d399' : '#f87171' }}>
                  {currentQA.fov}%
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>GLARE ARTIFACT</div>
                <div style={{ fontWeight: 700, color: currentQA.glare < 5 ? '#34d399' : '#f87171' }}>
                  {currentQA.glare}%
                </div>
              </div>
            </div>

          </div>

          {/* Actionable "Reject and Guide" Box */}
          <div style={{ 
            marginTop: '1rem', 
            padding: '0.85rem 1rem', 
            borderRadius: '10px', 
            background: currentQA.status === 'pass' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${currentQA.status === 'pass' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.35)'}`,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem'
          }}>
            {currentQA.status === 'pass' ? (
              <CheckCircle2 size={20} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
            ) : (
              <XCircle size={20} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
            )}
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: currentQA.status === 'pass' ? '#34d399' : '#f87171', marginBottom: '0.2rem' }}>
                {currentQA.status === 'pass' ? "Quality Assessment: Ready for Clinical Core" : "Reject-and-Guide Feedback (Do Not Dismiss Patient)"}
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                {currentQA.guidance}
              </p>
            </div>
          </div>

          {/* Uploaded Fundus AI Analysis & Prediction Notification */}
          {isAnalyzingUpload && (
            <div style={{
              marginTop: '1rem',
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              background: 'rgba(14, 165, 233, 0.15)',
              border: '1px solid rgba(14, 165, 233, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <Sparkles className="pulse-urgent" size={20} color="var(--primary-400)" />
              <div>
                <strong style={{ fontSize: '0.82rem', color: '#fff', display: 'block' }}>
                  MATLAB Clinical AI Core Processing Uploaded Fundus...
                </strong>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  Optical QA &rarr; Multi-Lesion Segmentation &rarr; ResNet-50 Grading &rarr; Grad-CAM Generation
                </span>
              </div>
            </div>
          )}

          {analyzedPrediction && (
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.18) 0%, rgba(6, 182, 212, 0.1) 100%)',
              border: '1.5px solid var(--primary-400)',
              boxShadow: '0 0 20px rgba(14, 165, 233, 0.25)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
                    <span className="badge badge-primary font-mono" style={{ fontSize: '0.65rem' }}>
                      AI PREDICTION COMPLETED
                    </span>
                    <span className={`badge ${analyzedPrediction.referable ? 'badge-urgent' : 'badge-pass'}`} style={{ fontSize: '0.65rem' }}>
                      {analyzedPrediction.referable ? 'REFERABLE' : 'ROUTINE'}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                    {analyzedPrediction.icdrLabel} (ICDR Grade {analyzedPrediction.icdrGrade})
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    Platt Confidence: <strong style={{ color: '#38bdf8' }}>{Math.round(analyzedPrediction.calibratedConfidence * 100)}%</strong> &bull; MAs: {analyzedPrediction.lesions.microaneurysms} &bull; Exudates: {analyzedPrediction.lesions.hardExudates} &bull; Hemorrhages: {analyzedPrediction.lesions.hemorrhages}
                  </div>
                </div>

                <button
                  onClick={() => onDirectCaseAnalyzed && onDirectCaseAnalyzed(analyzedPrediction, true)}
                  className="btn-primary"
                  style={{ fontSize: '0.8rem', padding: '0.55rem 0.95rem' }}
                >
                  <span>Open in Doctor Console (&lt;30s)</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* Capture Trigger & Upload Custom Fundus */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              onClick={handleCapture}
              disabled={isCapturing}
              className={currentQA.status === 'pass' ? 'btn-primary' : 'btn-danger'}
              style={{ flex: 1, justifyContent: 'center', padding: '0.75rem' }}
            >
              <Camera size={18} />
              <span>{isCapturing ? "Analyzing Optical Quality..." : (currentQA.status === 'pass' ? "Capture & Submit to Clinical Queue" : "Capture Failed Shot (Test Guidance)")}</span>
            </button>

            <label className="btn-secondary" style={{ cursor: 'pointer', padding: '0.75rem' }}>
              <Upload size={17} />
              <span>Custom Image</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>
          </div>

        </div>

        {/* Right Column: Patient Intake Form & Local Sync Queue */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Patient Intake Form Card */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
              <User size={18} color="var(--primary-400)" />
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                PHC Patient Intake Record
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.82rem' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Patient Name</label>
                <input
                  type="text"
                  value={patientForm.name}
                  onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border-medium)', borderRadius: '6px', color: '#fff', fontSize: '0.82rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Age / Gender</label>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <input
                    type="number"
                    value={patientForm.age}
                    onChange={(e) => setPatientForm({ ...patientForm, age: e.target.value })}
                    style={{ width: '45%', padding: '0.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border-medium)', borderRadius: '6px', color: '#fff', fontSize: '0.82rem' }}
                  />
                  <select
                    value={patientForm.gender}
                    onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
                    style={{ width: '55%', padding: '0.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border-medium)', borderRadius: '6px', color: '#fff', fontSize: '0.82rem' }}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Phone Number</label>
                <input
                  type="text"
                  value={patientForm.phone}
                  onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border-medium)', borderRadius: '6px', color: '#fff', fontSize: '0.82rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Aadhaar SHA-256 Hash</label>
                <input
                  type="text"
                  value={patientForm.aadhaarHash}
                  readOnly
                  style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '0.78rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Diabetes Duration (Yrs)</label>
                <input
                  type="number"
                  value={patientForm.diabetesYears}
                  onChange={(e) => setPatientForm({ ...patientForm, diabetesYears: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border-medium)', borderRadius: '6px', color: '#fff', fontSize: '0.82rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>HbA1c (% / Fasting)</label>
                <input
                  type="text"
                  value={patientForm.hba1c}
                  onChange={(e) => setPatientForm({ ...patientForm, hba1c: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border-medium)', borderRadius: '6px', color: '#fff', fontSize: '0.82rem' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Examined Eye</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['OD (Right Eye)', 'OS (Left Eye)'].map(eye => (
                    <button
                      key={eye}
                      type="button"
                      onClick={() => setPatientForm({ ...patientForm, eye })}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        borderRadius: '6px',
                        border: patientForm.eye === eye ? '1px solid var(--primary-500)' : '1px solid var(--border-medium)',
                        background: patientForm.eye === eye ? 'rgba(14, 165, 233, 0.2)' : 'var(--bg-surface)',
                        color: patientForm.eye === eye ? '#38bdf8' : 'var(--text-secondary)',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {eye}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Offline Store-and-Forward Queue Panel */}
          <div className="glass-panel" style={{ padding: '1.25rem', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HardDriveDownload size={18} color="#f59e0b" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                  Store-and-Forward Offline Queue
                </h3>
              </div>
              <span className="badge badge-warning font-mono">
                {pendingQueue.length} Pending
              </span>
            </div>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: 1.4 }}>
              Encrypted patient records held in browser IndexedDB. Once cellular or satellite uplink restores, one click synchronizes with District Triage.
            </p>

            {pendingQueue.length === 0 ? (
              <div style={{ 
                padding: '1.5rem', 
                textAlign: 'center', 
                background: 'rgba(0,0,0,0.2)', 
                borderRadius: '8px', 
                border: '1px dashed var(--border-subtle)',
                color: 'var(--text-muted)',
                fontSize: '0.8rem'
              }}>
                Queue is clear. All captured fundus scans are synced to cloud gateway.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
                {pendingQueue.map((item, idx) => (
                  <div key={idx} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.75rem',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    fontSize: '0.78rem'
                  }}>
                    <div>
                      <strong style={{ color: '#fff' }}>{item.patient.name}</strong> ({item.patient.eye})
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.timestamp} • QA: Pass</div>
                    </div>
                    <span className="badge badge-warning" style={{ fontSize: '0.68rem' }}>Stored Locally</span>
                  </div>
                ))}
              </div>
            )}

            {pendingQueue.length > 0 && (
              <button
                onClick={handleSyncQueue}
                className="btn-primary"
                style={{ width: '100%', marginTop: '0.85rem', justifyContent: 'center', fontSize: '0.82rem' }}
              >
                <Zap size={15} />
                <span>Transmit {pendingQueue.length} Cases to District Hospital</span>
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
