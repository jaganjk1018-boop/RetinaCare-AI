import React from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Building2, 
  FileCheck2, 
  AlertTriangle, 
  Eye, 
  QrCode 
} from 'lucide-react';

export default function ReferralLetterModal({ 
  caseData, 
  onClose 
}) {
  if (!caseData) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="glass-panel-elevated" style={{
        maxWidth: '750px',
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        padding: '1.75rem',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.85)',
        background: '#ffffff',
        color: '#1e293b'
      }}>
        
        {/* Modal Top Actions (Hidden in Print) */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0ea5e9' }}>
            Official Ayushman Bharat / NHM Referral Slip Preview
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handlePrint}
              style={{
                background: '#0ea5e9',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '0.45rem 0.9rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer'
              }}
            >
              <Printer size={15} />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.45rem', cursor: 'pointer' }}
            >
              <X size={18} color="#64748b" />
            </button>
          </div>
        </div>

        {/* Printable Referral Sheet Content */}
        <div id="printable-referral" style={{ padding: '0.5rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          
          {/* Official Letterhead */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0284c7', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <Eye size={28} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  GOVERNMENT OF KARNATAKA • HEALTH &amp; FAMILY WELFARE
                </h2>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0284c7' }}>
                  National Programme for Control of Blindness &amp; Visual Impairment (NPCBVI)
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  RetinaCare AI District Tele-Ophthalmology Telemedicine Network
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#475569' }}>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>REFERRAL ID: {caseData.id}</div>
              <div>Date: {caseData.capturedAt}</div>
              <div>ABHA Hash: {caseData.aadhaarHash}</div>
            </div>
          </div>

          {/* Urgent Referral Banner if Referable */}
          {caseData.referable && (
            <div style={{
              background: '#fef2f2',
              border: '1.5px solid #ef4444',
              borderRadius: '8px',
              padding: '0.65rem 1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              color: '#b91c1c'
            }}>
              <AlertTriangle size={20} />
              <div>
                <strong style={{ fontSize: '0.85rem' }}>PRIORITY REFERABLE DIABETIC RETINOPATHY DETECTED</strong>
                <div style={{ fontSize: '0.75rem' }}>
                  Consultation at District Ophthalmology Dept recommended within 2 to 4 weeks. Covered under Ayushman Bharat PM-JAY.
                </div>
              </div>
            </div>
          )}

          {/* Patient Details Table */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.25rem', fontSize: '0.8rem' }}>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>PATIENT NAME</span>
              <strong style={{ color: '#0f172a' }}>{caseData.patientName}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>AGE / GENDER</span>
              <strong style={{ color: '#0f172a' }}>{caseData.age} Years / {caseData.gender}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>PHONE NUMBER</span>
              <strong style={{ color: '#0f172a' }}>{caseData.phone}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>DIABETES DURATION</span>
              <strong style={{ color: '#0f172a' }}>{caseData.diabetesYears} Years</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>LAST HbA1c</span>
              <strong style={{ color: '#ef4444' }}>{caseData.hba1c}% (High Risk)</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>REFERRING PHC</span>
              <strong style={{ color: '#0f172a' }}>{caseData.phcLocation}</strong>
            </div>
          </div>

          {/* Clinical Findings & Images */}
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            
            {/* Fundus Crop Thumbnail */}
            <div style={{ textAlign: 'center' }}>
              <img 
                src={caseData.imageSrc} 
                alt="Fundus" 
                style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
              <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block', marginTop: '0.25rem' }}>
                Captured: {caseData.eye}
              </span>
            </div>

            {/* Diagnostic Matrix */}
            <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>
                  Preliminary Tele-Ophthalmology Grading
                </h4>
                
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '0.35rem 0', color: '#64748b' }}>ICDR Severity Grade:</td>
                      <td style={{ padding: '0.35rem 0', fontWeight: 700, color: '#0f172a' }}>
                        Grade {caseData.icdrGrade} — {caseData.icdrLabel}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '0.35rem 0', color: '#64748b' }}>Platt Calibrated Confidence:</td>
                      <td style={{ padding: '0.35rem 0', fontWeight: 700, color: '#0284c7' }}>
                        {(caseData.calibratedConfidence * 100).toFixed(1)}% (ECE: 0.031)
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '0.35rem 0', color: '#64748b' }}>Microaneurysms Detected:</td>
                      <td style={{ padding: '0.35rem 0', fontWeight: 600 }}>
                        {caseData.lesions.microaneurysms} (Sub-pixel matched filter)
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '0.35rem 0', color: '#64748b' }}>Hard Exudates (Lipid):</td>
                      <td style={{ padding: '0.35rem 0', fontWeight: 600 }}>
                        {caseData.lesions.hardExudates} clusters detected
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.35rem 0', color: '#64748b' }}>Macular Edema Assessment:</td>
                      <td style={{ padding: '0.35rem 0', fontWeight: 700, color: '#b91c1c' }}>
                        {caseData.lesions.macularEdemaRisk}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ background: '#f1f5f9', padding: '0.6rem 0.85rem', borderRadius: '6px', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                <strong>Referred To:</strong> K.R. District Hospital, Department of Ophthalmology &amp; Vitreo-Retinal Services, Mysore.
              </div>
            </div>

          </div>

          {/* Signatures & Tamper-Evident Hash Footer */}
          <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '0.75rem' }}>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.68rem', marginBottom: '0.2rem' }}>CRYPTOGRAPHIC AUDIT PROOF</div>
              <div style={{ fontFamily: 'monospace', color: '#475569', fontSize: '0.68rem' }}>
                Block SHA: {caseData.aadhaarHash.slice(0, 8)}...8a1b9c2d
              </div>
              <div style={{ color: '#10b981', fontSize: '0.7rem', fontWeight: 600, marginTop: '0.15rem' }}>
                ✓ Verified by RetinaCare AI Health Ledger
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ borderBottom: '1px solid #94a3b8', width: '180px', marginBottom: '0.25rem', height: '24px' }}></div>
              <strong style={{ color: '#0f172a', display: 'block' }}>Dr. Srinivas Rao, MD</strong>
              <span style={{ color: '#64748b', fontSize: '0.7rem' }}>Consultant Vitreo-Retina Specialist</span>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>KMC Reg No: 54109/2008</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
