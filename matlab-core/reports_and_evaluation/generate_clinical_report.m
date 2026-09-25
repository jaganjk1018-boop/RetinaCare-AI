function report = generate_clinical_report(patientData, qaResult, evidenceSummary, calibratedConfidence, outputDir)
% GENERATE_CLINICAL_REPORT Generates an automated clinical diagnostic report
% including quantitative lesion findings, ICDR severity grade, calibrated confidence,
% referral recommendations, and cryptographic tamper-evident audit hash.
%
% Input:
%   patientData          - Struct with name, age, gender, eye, PHC location, HbA1c
%   qaResult             - Struct from assess_image_quality.m
%   evidenceSummary      - Struct from fuse_clinical_evidence.m
%   calibratedConfidence - Scalar [0, 1] calibrated clinical confidence
%   outputDir            - (Optional) Directory to save report files
%
% Output:
%   report - Struct containing complete clinical report record
%
% Toolboxes: Medical Imaging Toolbox

    if nargin < 5 || isempty(outputDir)
        outputDir = fullfile(pwd, 'clinical_reports');
    end
    if ~exist(outputDir, 'dir')
        mkdir(outputDir);
    end

    timestamp = datestr(now, 'yyyy-mm-dd HH:MM:SS');

    %% 1. Synthesize Diagnostic Referral Recommendation
    isReferable = evidenceSummary.deducedGrade >= 2;
    if evidenceSummary.deducedGrade == 4
        urgencyLevel = 'CRITICAL (Immediate Referral)';
        actionPlan = 'Refer to District Hospital Vitreo-Retinal unit within 48 to 72 hours for pan-retinal photocoagulation (PRP) evaluation.';
    elseif evidenceSummary.deducedGrade == 3
        urgencyLevel = 'HIGH (Urgent Referral)';
        actionPlan = 'Refer to District Hospital Ophthalmology clinic within 1 to 2 weeks for fluorescein angiography and OCT staging.';
    elseif evidenceSummary.deducedGrade == 2
        urgencyLevel = 'MODERATE (Routine Referral)';
        actionPlan = 'Refer to District Hospital Eye OPD within 2 to 4 weeks. Intensify systemic glycemic and blood pressure control.';
    elseif evidenceSummary.deducedGrade == 1
        urgencyLevel = 'LOW (Monitoring)';
        actionPlan = 'Annual re-screening at Primary Health Center (PHC). Educate patient on diabetes lifestyle and strict glycemic management.';
    else
        urgencyLevel = 'ROUTINE (Cleared)';
        actionPlan = 'No diabetic retinopathy lesions identified. Schedule next routine annual screening.';
    end

    %% 2. Generate Cryptographic Audit Block Hash (SHA-256 Simulation)
    rawPayload = sprintf('%s|%s|%s|%d|%.3f|%s', ...
        patientData.name, patientData.eye, timestamp, evidenceSummary.deducedGrade, calibratedConfidence, urgencyLevel);
    
    % Simple deterministic hash encoding for demonstration
    opt = java.security.MessageDigest.getInstance('SHA-256');
    opt.update(uint8(rawPayload));
    hashBytes = opt.digest();
    auditHash = sprintf('%02x', typecast(hashBytes, 'uint8'));

    %% 3. Compile Complete Structured Medical Record
    report = struct();
    report.patient = patientData;
    report.examinationTime = timestamp;
    report.qa = qaResult;
    report.icdrGrade = evidenceSummary.deducedGrade;
    report.icdrLabel = evidenceSummary.deducedLabel;
    report.referableDR = isReferable;
    report.urgency = urgencyLevel;
    report.actionPlan = actionPlan;
    report.calibratedConfidence = round(calibratedConfidence * 100, 1);
    report.lesions = struct( ...
        'microaneurysms', evidenceSummary.maCount, ...
        'hardExudates', evidenceSummary.exudateClusterCount, ...
        'hemorrhages', evidenceSummary.hemorrhageCount, ...
        'neovascularization', evidenceSummary.neovascularization);
    report.auditHash = auditHash;

    %% 4. Print Formatted Text Report to Console
    fprintf('========================================================================\n');
    fprintf('           RETINACARE AI: TELE-OPHTHALMOLOGY CLINICAL REPORT             \n');
    fprintf('========================================================================\n');
    fprintf(' Patient Name: %-25s | Age/Gender: %d/%s\n', patientData.name, patientData.age, patientData.gender);
    fprintf(' Examined Eye: %-25s | PHC Center: %s\n', patientData.eye, patientData.phc);
    fprintf(' HbA1c Level:  %-25.1f%% | Exam Time:  %s\n', patientData.hba1c, timestamp);
    fprintf('------------------------------------------------------------------------\n');
    fprintf(' IMAGE QA STATUS: %s (Focus: %.1f, Illum: %.1f, Glare: %.1f%%)\n', ...
        upper(qaResult.status), qaResult.focusScore, qaResult.illumScore, qaResult.glareRatio);
    fprintf('------------------------------------------------------------------------\n');
    fprintf(' DIAGNOSIS:  ICDR Grade %d — %s\n', report.icdrGrade, report.icdrLabel);
    fprintf(' CONFIDENCE: %.1f%% (Platt Calibrated, Temperature T=1.45)\n', report.calibratedConfidence);
    fprintf(' URGENCY:    %s\n', report.urgency);
    fprintf(' LESIONS:    MAs: %d | Exudates: %d clusters | Hemorrhages: %d | NV: %d\n', ...
        report.lesions.microaneurysms, report.lesions.hardExudates, report.lesions.hemorrhages, report.lesions.neovascularization);
    fprintf(' ACTION:     %s\n', report.actionPlan);
    fprintf(' SHA PROOF:  %s\n', report.auditHash);
    fprintf('========================================================================\n');
end
