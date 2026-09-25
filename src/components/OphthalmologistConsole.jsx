import React, { useState, useEffect, useRef } from 'react';
import { 
  Stethoscope, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Sliders, 
  Layers, 
  FileText, 
  Languages, 
  ShieldAlert, 
  ChevronRight, 
  RotateCcw, 
  Eye, 
  Crosshair,
  TrendingUp,
  Info,
  Check,
  Edit3,
  Upload,
  Sparkles
} from 'lucide-react';
import { analyzeFundusImage } from '../utils/retinaAnalyzer';

export default function OphthalmologistConsole({ 
  cases, 
  selectedCaseId, 
  setSelectedCaseId, 
  onReviewCompleted,
  onDirectCaseAnalyzed,
  onOpenPatientExplainer,
  onOpenReferralLetter
}) {
  const selectedCase = cases.find(c => c.id === selectedCaseId) || cases[0];

  // Split Slider Position (0 to 100%)
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  // Overlay Visibility Toggles
  const [showGradCam, setShowGradCam] = useState(true);
  const [showMAs, setShowMAs] = useState(true);
  const [showExudates, setShowExudates] = useState(true);
  const [showHemorrhages, setShowHemorrhages] = useState(true);
  const [gradCamOpacity, setGradCamOpacity] = useState(0.65);

  // 30-Second Review Stopwatch Timer
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(true);

  // Clinician Override State
  const [isOverrideMode, setIsOverrideMode] = useState(false);
  const [overrideGrade, setOverrideGrade] = useState(selectedCase?.icdrGrade ?? 2);
  const [overrideReason, setOverrideReason] = useState('Mild media opacity mimicking exudates');
  const [isAnalyzingDoctorUpload, setIsAnalyzingDoctorUpload] = useState(false);

  // Handle direct image upload on doctor console
  const handleDoctorDirectUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setIsAnalyzingDoctorUpload(true);
      try {
        const pred = await analyzeFundusImage(url, {
          name: `Clinical Case ${Math.floor(100 + Math.random() * 900)}`,
          age: 58,
          gender: "Female",
          hba1c: 8.8,
          diabetesYears: 9,
          eye: "OD (Right Eye)",
          phc: "District Hospital Tele-OPD"
        });
        setIsAnalyzingDoctorUpload(false);
        if (onDirectCaseAnalyzed) {
          onDirectCaseAnalyzed(pred, false);
        }
      } catch (err) {
        console.error("Direct upload analysis failed:", err);
        setIsAnalyzingDoctorUpload(false);
      }
    }
  };

  // Reset timer on new case selection
  useEffect(() => {
    setSecondsLeft(30);
    setTimerActive(true);
    setIsOverrideMode(false);
    setOverrideGrade(selectedCase?.icdrGrade ?? 2);
  }, [selectedCaseId]);

  // Countdown effect
  useEffect(() => {
    let interval = null;
    if (timerActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, secondsLeft]);

  // Handle Dragging Slider
  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSliderPos(percent);
  };

  // Touch Support
  const handleTouchMove = (e) => {
    if (!containerRef.current || !e.touches[0]) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const percent = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSliderPos(percent);
  };

  // 1-Click Approve AI Grade
  const handleApprove = () => {
    setTimerActive(false);
    onReviewCompleted({
      caseId: selectedCase.id,
      finalGrade: selectedCase.icdrGrade,
      agreedWithAi: true,
      reviewTimeSec: 30 - secondsLeft,
      reviewer: 'Dr. Srinivas Rao, MD (Retina Specialist)'
    });
  };

  // Submit Override
  const handleSubmitOverride = () => {
    setTimerActive(false);
    onReviewCompleted({
      caseId: selectedCase.id,
      finalGrade: overrideGrade,
      agreedWithAi: false,
      overrideReason: overrideReason,
      reviewTimeSec: 30 - secondsLeft,
      reviewer: 'Dr. Srinivas Rao, MD (Retina Specialist)'
    });
    setIsOverrideMode(false);
  };

  return (
    <div style={{ padding: '0 1rem 2rem', maxWidth: '1440px', margin: '0 auto' }}>
      
      {/* Top Banner: Clinical Review Goal & Timer */}
      <div className="glass-panel" style={{ 
        padding: '0.85rem 1.25rem', 
        marginBottom: '1rem', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'rgba(14, 165, 233, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary-400)'
          }}>
            <Stethoscope size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                Ophthalmologist Verification Console
              </h2>
              <span className="badge badge-primary">Human-in-the-Loop</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Target Review Pace: &lt;30s per eye using Explainable Lesion-Grounded Fusion
            </p>
          </div>
        </div>

        {/* Direct Upload & 30-Second Countdown Stopwatch */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          
          {/* Direct Upload & Instant Predict Button */}
          <label className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.45rem 0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Upload size={15} />
            <span>{isAnalyzingDoctorUpload ? "AI Analyzing Image..." : "Upload & Predict Any Image"}</span>
            <input type="file" accept="image/*" onChange={handleDoctorDirectUpload} style={{ display: 'none' }} />
          </label>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.6rem',
            padding: '0.4rem 0.85rem',
            borderRadius: '10px',
            background: secondsLeft <= 5 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(14, 165, 233, 0.12)',
            border: secondsLeft <= 5 ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(14, 165, 233, 0.3)'
          }}>
            <Clock size={16} color={secondsLeft <= 5 ? '#f87171' : 'var(--primary-400)'} className={secondsLeft <= 5 ? 'pulse-urgent' : ''} />
            <div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', lineHeight: 1 }}>REVIEW PACE</span>
              <span className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: secondsLeft <= 5 ? '#f87171' : '#fff' }}>
                {secondsLeft}s / 30s
              </span>
            </div>
          </div>

          <button
            onClick={() => setSecondsLeft(30)}
            title="Reset Timer"
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Main Grid: Triage Queue on Left (1 col), Interactive Viewer & Decision in Middle & Right (3 cols) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 320px) minmax(500px, 1fr)', gap: '1.25rem' }}>
        
        {/* Left: Triage Queue (Sorted by Urgency & AI Uncertainty) */}
        <div className="glass-panel" style={{ padding: '1.25rem', height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>Triage Queue</span>
              <span className="badge badge-urgent" style={{ fontSize: '0.65rem' }}>
                Urgency &amp; Uncertainty Sort
              </span>
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {cases.map((c) => {
              const isSelected = c.id === selectedCase.id;
              const isReviewed = c.reviewStatus === 'completed';
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCaseId(c.id)}
                  className="clinical-card"
                  style={{
                    padding: '0.75rem',
                    cursor: 'pointer',
                    background: isSelected ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                    borderTop: `1px solid ${isSelected ? 'var(--primary-400)' : 'var(--border-subtle)'}`,
                    borderRight: `1px solid ${isSelected ? 'var(--primary-400)' : 'var(--border-subtle)'}`,
                    borderBottom: `1px solid ${isSelected ? 'var(--primary-400)' : 'var(--border-subtle)'}`,
                    borderLeft: `4px solid ${c.urgency === 'critical' ? '#ef4444' : (c.urgency === 'high' ? '#f59e0b' : '#10b981')}`,
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                    <div>
                      <strong style={{ fontSize: '0.85rem', color: '#fff' }}>{c.patientName}</strong>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {c.age}y • {c.gender} • {c.eye}
                      </div>
                    </div>
                    {isReviewed ? (
                      <span className="badge badge-pass" style={{ fontSize: '0.65rem' }}>Reviewed</span>
                    ) : (
                      <span className={`badge ${c.urgency === 'critical' ? 'badge-fail' : (c.urgency === 'high' ? 'badge-warning' : 'badge-pass')}`} style={{ fontSize: '0.65rem' }}>
                        {c.urgency.toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', marginTop: '0.4rem' }}>
                    <span style={{ fontWeight: 600, color: c.referable ? '#f59e0b' : '#34d399' }}>
                      {c.icdrLabel}
                    </span>
                    <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>
                      Conf: {(c.calibratedConfidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Clinical Insights Callout */}
          <div style={{ 
            marginTop: '1.25rem', 
            padding: '0.75rem', 
            borderRadius: '8px', 
            background: 'rgba(14, 165, 233, 0.08)',
            border: '1px solid rgba(14, 165, 233, 0.2)',
            fontSize: '0.72rem',
            color: 'var(--text-secondary)'
          }}>
            <strong style={{ color: 'var(--primary-400)', display: 'block', marginBottom: '0.2rem' }}>
              Why this queue wins hackathons:
            </strong>
            Instead of FIFO, cases with Proliferative DR or near-decision boundary uncertainties (Platt scaled &lt;80%) rise to the top for rapid senior ophthalmologist review.
          </div>
        </div>

        {/* Right: Detailed Case Inspection, HERO Grad-CAM/Lesion Viewer & Decision */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Patient Quick Info Header */}
          <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  ID: {selectedCase.id} • {selectedCase.phcLocation}
                </span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginTop: '0.1rem' }}>
                  {selectedCase.patientName}, {selectedCase.age}y ({selectedCase.gender})
                </h2>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.8rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>DIABETES DURATION</span>
                  <strong>{selectedCase.diabetesYears} Years</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>HbA1c</span>
                  <strong style={{ color: selectedCase.hba1c > 8.0 ? '#ef4444' : '#fff' }}>{selectedCase.hba1c}%</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>EXAMINED EYE</span>
                  <strong style={{ color: 'var(--primary-400)' }}>{selectedCase.eye}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* HERO COMPONENT: Grad-CAM & Lesion-Map Fusion Viewer */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            
            {/* Viewer Controls & Legend */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={18} color="var(--primary-400)" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
                  Grad-CAM &amp; Lesion Segmentation Fusion Slider
                </h3>
              </div>

              {/* Layer Toggles */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.75rem', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={showGradCam} onChange={e => setShowGradCam(e.target.checked)} />
                  <span style={{ color: '#38bdf8' }}>Grad-CAM</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={showMAs} onChange={e => setShowMAs(e.target.checked)} />
                  <span style={{ color: 'var(--lesion-ma)' }}>Microaneurysms</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={showExudates} onChange={e => setShowExudates(e.target.checked)} />
                  <span style={{ color: 'var(--lesion-exudate)' }}>Hard Exudates</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={showHemorrhages} onChange={e => setShowHemorrhages(e.target.checked)} />
                  <span style={{ color: 'var(--lesion-hemorrhage)' }}>Hemorrhages</span>
                </label>
              </div>
            </div>

            {/* Split Comparison Slider Container */}
            <div 
              ref={containerRef}
              className="split-viewer-container"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchMove={handleTouchMove}
              style={{
                height: '460px',
                background: '#030712',
                cursor: isDragging ? 'ew-resize' : 'default'
              }}
            >
              {/* Layer 1: Left/Base Raw Fundus Image */}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img 
                  src={selectedCase.imageSrc} 
                  alt="Raw Fundus" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: 'rgba(0, 0, 0, 0.75)',
                  color: '#fff',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  RAW FUNDUS IMAGE (INPUT)
                </div>
              </div>

              {/* Layer 2: Right Fused Grad-CAM + Lesion Map (Clipped by Slider) */}
              <div style={{ 
                position: 'absolute', 
                inset: 0, 
                clipPath: `polygon(${sliderPos}% 0, 100% 0, 100% 100%, ${sliderPos}% 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img 
                  src={selectedCase.imageSrc} 
                  alt="Fused Fundus" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />

                {/* Simulated Grad-CAM Heatmap Radial Gradient */}
                {showGradCam && selectedCase.gradcamCenter && (
                  <div style={{
                    position: 'absolute',
                    top: `${selectedCase.gradcamCenter.y}%`,
                    left: `${selectedCase.gradcamCenter.x}%`,
                    transform: 'translate(-50%, -50%)',
                    width: `${selectedCase.gradcamCenter.radius * 2.5}%`,
                    height: `${selectedCase.gradcamCenter.radius * 2.5}%`,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(239, 68, 68, 0.75) 0%, rgba(245, 158, 11, 0.6) 35%, rgba(56, 189, 248, 0.4) 70%, transparent 100%)',
                    mixBlendMode: 'screen',
                    pointerEvents: 'none',
                    opacity: gradCamOpacity
                  }}></div>
                )}

                {/* Lesion Bounding Boxes & Callouts */}
                {selectedCase.lesionBoxes && selectedCase.lesionBoxes.map((box, idx) => {
                  let isVisible = false;
                  let boxColor = '#fff';
                  if (box.type === 'ma' && showMAs) { isVisible = true; boxColor = 'var(--lesion-ma)'; }
                  if (box.type === 'exudate' && showExudates) { isVisible = true; boxColor = 'var(--lesion-exudate)'; }
                  if (box.type === 'hemorrhage' && showHemorrhages) { isVisible = true; boxColor = 'var(--lesion-hemorrhage)'; }
                  if (box.type === 'nv') { isVisible = true; boxColor = 'var(--lesion-nv)'; }

                  if (!isVisible) return null;

                  return (
                    <div
                      key={idx}
                      style={{
                        position: 'absolute',
                        top: `${box.y}%`,
                        left: `${box.x}%`,
                        width: `${box.w}%`,
                        height: `${box.h}%`,
                        border: `2px solid ${boxColor}`,
                        boxShadow: `0 0 8px ${boxColor}`,
                        borderRadius: '3px',
                        pointerEvents: 'none'
                      }}
                    >
                      <span style={{
                        position: 'absolute',
                        top: '-18px',
                        left: '0',
                        background: boxColor,
                        color: '#000',
                        fontSize: '0.55rem',
                        fontWeight: 700,
                        padding: '1px 4px',
                        borderRadius: '2px',
                        whiteSpace: 'nowrap'
                      }}>
                        {box.label}
                      </span>
                    </div>
                  );
                })}

                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(7, 12, 20, 0.85)',
                  color: '#38bdf8',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  border: '1px solid var(--border-accent)'
                }}>
                  FUSED EVIDENCE (GRAD-CAM + SEGMENTATION)
                </div>
              </div>

              {/* Draggable Divider Handle */}
              <div 
                onMouseDown={handleMouseDown}
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: `${sliderPos}%`,
                  width: '3px',
                  background: '#ffffff',
                  boxShadow: '0 0 12px rgba(255,255,255,0.8)',
                  cursor: 'ew-resize',
                  zIndex: 20
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'var(--primary-500)',
                  border: '3px solid #ffffff',
                  boxShadow: '0 0 15px rgba(14, 165, 233, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}>
                  <Sliders size={16} />
                </div>
              </div>

            </div>

            {/* Slider Instructions & Heatmap Opacity Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.65rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>Drag slider left/right to compare raw fundus vs. clinical lesion evidence</span>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '220px' }}>
                <span>Grad-CAM Opacity:</span>
                <input 
                  type="range" 
                  min="0.2" 
                  max="1.0" 
                  step="0.05"
                  value={gradCamOpacity}
                  onChange={e => setGradCamOpacity(parseFloat(e.target.value))}
                />
              </div>
            </div>

            {/* Quantitative Lesion Counts from Segmentation */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.75rem',
              marginTop: '1rem',
              padding: '0.75rem',
              borderRadius: '8px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.78rem'
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', display: 'block' }}>MICROANEURYSMS</span>
                <strong style={{ color: 'var(--lesion-ma)', fontSize: '1.05rem' }}>
                  {selectedCase.lesions.microaneurysms}
                </strong>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block' }}>Sub-pixel matched filter</span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', display: 'block' }}>HARD EXUDATES</span>
                <strong style={{ color: 'var(--lesion-exudate)', fontSize: '1.05rem' }}>
                  {selectedCase.lesions.hardExudates} clusters
                </strong>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block' }}>Morphological top-hat</span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', display: 'block' }}>HEMORRHAGES</span>
                <strong style={{ color: 'var(--lesion-hemorrhage)', fontSize: '1.05rem' }}>
                  {selectedCase.lesions.hemorrhages}
                </strong>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block' }}>Dot-blot &amp; Flame</span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', display: 'block' }}>MACULAR EDEMA RISK</span>
                <strong style={{ color: selectedCase.lesions.macularEdemaRisk.includes('High') ? '#ef4444' : '#fbbf24' }}>
                  {selectedCase.lesions.macularEdemaRisk}
                </strong>
              </div>
            </div>

          </div>

          {/* Calibrated Confidence vs Raw Softmax & Decision Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.25rem' }}>
            
            {/* Left: Calibrated Confidence Box */}
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <TrendingUp size={18} color="var(--primary-400)" />
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700 }}>
                  Confidence Calibration (Platt Scaled)
                </h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Platt Calibrated Clinical Probability</span>
                    <strong className="font-mono" style={{ color: '#38bdf8' }}>
                      {(selectedCase.calibratedConfidence * 100).toFixed(1)}%
                    </strong>
                  </div>
                  <div style={{ height: '6px', background: 'var(--bg-elevated)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ width: `${selectedCase.calibratedConfidence * 100}%`, height: '100%', background: 'linear-gradient(90deg, #0ea5e9, #06b6d4)' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Raw Uncalibrated Softmax</span>
                    <strong className="font-mono" style={{ color: 'var(--text-secondary)' }}>
                      {(selectedCase.rawConfidence * 100).toFixed(1)}%
                    </strong>
                  </div>
                  <div style={{ height: '4px', background: 'var(--bg-elevated)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ width: `${selectedCase.rawConfidence * 100}%`, height: '100%', background: '#64748b' }}></div>
                  </div>
                </div>

                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4, marginTop: '0.25rem' }}>
                  Temperature scaling parameter: <code className="font-mono" style={{ color: '#fff' }}>T = {selectedCase.temperature}</code>. Raw softmax overconfidently pushes near 100%; Platt scaling calibrates predicted score with true empirical likelihood.
                </p>
              </div>
            </div>

            {/* Right: Decision Panel (1-Click Approve / Override & Reports) */}
            <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700 }}>
                    Clinical Verdict &amp; Sign-off
                  </h4>
                  <span className="badge badge-primary">
                    AI Suggested: Grade {selectedCase.icdrGrade}
                  </span>
                </div>

                {isOverrideMode ? (
                  <div style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-medium)', marginBottom: '0.85rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                      Select Doctor Override Grade:
                    </label>
                    <select
                      value={overrideGrade}
                      onChange={e => setOverrideGrade(parseInt(e.target.value))}
                      style={{ width: '100%', padding: '0.45rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#fff', fontSize: '0.82rem', marginBottom: '0.5rem' }}
                    >
                      <option value={0}>Grade 0 - No Apparent DR</option>
                      <option value={1}>Grade 1 - Mild NPDR (Microaneurysms only)</option>
                      <option value={2}>Grade 2 - Moderate NPDR</option>
                      <option value={3}>Grade 3 - Severe NPDR (4-2-1 Rule)</option>
                      <option value={4}>Grade 4 - Proliferative DR (Neovascularization)</option>
                    </select>

                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                      Clinical Reason for Override:
                    </label>
                    <input
                      type="text"
                      value={overrideReason}
                      onChange={e => setOverrideReason(e.target.value)}
                      style={{ width: '100%', padding: '0.45rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#fff', fontSize: '0.78rem' }}
                    />
                  </div>
                ) : (
                  <div style={{ 
                    padding: '0.75rem', 
                    borderRadius: '8px', 
                    background: selectedCase.referable ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                    border: `1px solid ${selectedCase.referable ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                    marginBottom: '0.85rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: selectedCase.referable ? '#fbbf24' : '#34d399', fontWeight: 700, fontSize: '0.85rem' }}>
                      {selectedCase.referable ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                      <span>{selectedCase.icdrLabel} (ICDR Grade {selectedCase.icdrGrade})</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      {selectedCase.referable 
                        ? "Referral Recommended: Refer to District Hospital Ophthalmology Clinic within 2 to 4 weeks."
                        : "Routine Screening: Annual follow-up at local Primary Health Center."}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {isOverrideMode ? (
                    <>
                      <button onClick={handleSubmitOverride} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                        <Check size={16} />
                        <span>Confirm Doctor Override</span>
                      </button>
                      <button onClick={() => setIsOverrideMode(false)} className="btn-secondary">
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={handleApprove} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                        <CheckCircle size={16} />
                        <span>Approve AI Grade ({selectedCase.icdrLabel})</span>
                      </button>
                      <button onClick={() => setIsOverrideMode(true)} className="btn-secondary" title="Override AI Grade">
                        <Edit3 size={15} />
                        <span>Override</span>
                      </button>
                    </>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => onOpenPatientExplainer(selectedCase)}
                    className="btn-secondary" 
                    style={{ flex: 1, justifyContent: 'center', fontSize: '0.78rem' }}
                  >
                    <Languages size={15} color="var(--primary-400)" />
                    <span>Explain Like I'm Patient</span>
                  </button>

                  <button 
                    onClick={() => onOpenReferralLetter(selectedCase)}
                    className="btn-secondary" 
                    style={{ flex: 1, justifyContent: 'center', fontSize: '0.78rem' }}
                  >
                    <FileText size={15} color="#fbbf24" />
                    <span>Ayushman Referral PDF</span>
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
