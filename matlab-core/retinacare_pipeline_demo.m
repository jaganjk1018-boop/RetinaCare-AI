% RETINACARE_PIPELINE_DEMO End-to-End Execution of the RetinaCare AI Clinical Core
% Demonstrates QA -> Segmentation -> Grading -> Grad-CAM -> Calibrated Report -> Benchmark Matrix.
% Designed for MathWorks Hackathons and Rural Screening Telemedicine Pilots in India.

clear; clc; close all;

fprintf('========================================================================\n');
fprintf('         RetinaCare AI: MATLAB Clinical AI Core Execution              \n');
fprintf('  Explainable, Field-Ready Diabetic Retinopathy Screening for Rural India \n');
fprintf('========================================================================\n\n');

% Add subdirectories to path
addpath(genpath(fullfile(pwd, 'matlab-core')));

%% 1. Load Sample Fundus Image
% Check for demo images in public/assets or create calibrated test image
assetDir = fullfile(pwd, 'public', 'assets');
sampleImagePath = fullfile(assetDir, 'moderate_dr_fundus.jpg');

if exist(sampleImagePath, 'file')
    fprintf('[Step 1/7] Loading clinical fundus image: %s\n', sampleImagePath);
    rawImg = imread(sampleImagePath);
else
    fprintf('[Step 1/7] Generating synthetic calibrated fundus image for demonstration...\n');
    % Create synthetic retina fundus test pattern
    [X, Y] = meshgrid(1:512, 1:512);
    retinaDist = sqrt((X - 256).^2 + (Y - 256).^2);
    retinaCircle = retinaDist <= 230;
    
    red = uint8(retinaCircle .* (180 + 30 * exp(-((X-256).^2 + (Y-256).^2)/10000)));
    green = uint8(retinaCircle .* (90 + 20 * exp(-((X-256).^2 + (Y-256).^2)/10000)));
    blue = uint8(retinaCircle .* 20);
    rawImg = cat(3, red, green, blue);
end

%% 2. Optical Image Quality Assessment (QA)
fprintf('[Step 2/7] Running real-time optical quality assessment (assess_image_quality.m)...\n');
[qaResult, feedback] = assess_image_quality(rawImg);

fprintf('  -> Focus Score:        %.1f/100 (%s)\n', qaResult.focusScore, ternary(qaResult.isBlurry, 'Blurry', 'Sharp'));
fprintf('  -> Illumination Score: %.1f/100\n', qaResult.illumScore);
fprintf('  -> Glare Artifact:     %.2f%% of retina\n', qaResult.glareRatio);
fprintf('  -> QA Verdict:         %s\n', upper(qaResult.status));
fprintf('  -> Guidance:           %s\n\n', feedback.actionableAdvice);

if strcmp(qaResult.status, 'reject')
    fprintf('(!) Image rejected at source. Guidance sent to PHC worker for immediate recapture.\n');
    return;
end

%% 3. Contrast & Illumination Enhancement
fprintf('[Step 3/7] Applying CLAHE and illumination gradient correction (enhance_retina_image.m)...\n');
enhancedImg = enhance_retina_image(rawImg);

%% 4. Multi-Structure Retinal Segmentation
fprintf('[Step 4/7] Segmenting retinal anatomical structures and microvascular lesions...\n');

% 4a. Optic Disc & Fovea Localization
fprintf('  -> Localizing Optic Disc and Foveal Avascular Zone (FAZ)...\n');
[odMask, odCenter, odRadius, foveaCoord] = localize_optic_disc_and_fovea(enhancedImg);
fprintf('     Optic Disc Centroid: [%.1f, %.1f], Radius: %d px\n', odCenter(1), odCenter(2), odRadius);
fprintf('     Fovea Coordinate:    [%.1f, %.1f]\n', foveaCoord(1), foveaCoord(2));

% 4b. Blood Vessel Segmentation via 2D Matched Filter
fprintf('  -> Segmenting vascular tree with 12-orientation matched filter...\n');
[vesselMask, vesselResponse] = segment_vessels(enhancedImg);

% 4c. Sub-Pixel Microaneurysm (MA) Detection
fprintf('  -> Detecting sub-pixel microaneurysms using morphological top-hat + PSF...\n');
[maMask, maCount, maCentroids] = detect_microaneurysms(enhancedImg, vesselMask, odMask);
fprintf('     Microaneurysms Detected: %d\n', maCount);

% 4d. Hard Exudate Segmentation & Macular Edema (CSME) Risk
fprintf('  -> Segmenting hard exudate lipid deposits in CIE L*a*b* space...\n');
[exudateMask, exudateCount, exudateAreaPct, csmeRisk] = segment_exudates(enhancedImg, odMask, foveaCoord, odRadius);
fprintf('     Exudate Clusters: %d | Area: %.3f%% | CSME Risk: %s\n', exudateCount, exudateAreaPct, csmeRisk);

% 4e. Hemorrhage Classification (Dot-Blot vs Flame)
fprintf('  -> Classifying intraretinal hemorrhages and verifying 4-2-1 rule...\n');
[hemMask, hemStats, quadrantCount] = classify_hemorrhages(enhancedImg, vesselMask, odMask);
fprintf('     Dot-Blot: %d | Flame: %d | Affected Quadrants: %d/4\n', hemStats.dotBlotCount, hemStats.flameCount, quadrantCount);

% 4f. Neovascularization Detection (Proliferative DR)
fprintf('  -> Analyzing capillary branching density for neovascularization...\n');
[isPDR, nvdDetected, nveDetected, nvMask] = detect_neovascularization(vesselMask, odMask, odCenter, odRadius);
fprintf('     NVD: %s | NVE: %s | PDR Flag: %s\n\n', ternary(nvdDetected, 'YES', 'NO'), ternary(nveDetected, 'YES', 'NO'), ternary(isPDR, 'YES', 'NO'));

%% 5. Explainable AI: Grad-CAM & Lesion-Grounded Fusion
fprintf('[Step 5/7] Generating Grad-CAM activation map and lesion evidence fusion...\n');
% Simulate network for Grad-CAM generation
[gradcamMap, gradcamOverlay] = generate_gradcam([], enhancedImg, 3);

% Fuse anatomical segmentations with Grad-CAM
[fusedEvidenceImg, evidenceSummary] = fuse_clinical_evidence( ...
    rawImg, gradcamMap, maMask, exudateMask, hemMask, nvMask, odMask, foveaCoord);

fprintf('     ICDR Grade Deduced: %d (%s)\n', evidenceSummary.deducedGrade, evidenceSummary.deducedLabel);
fprintf('     Referral Recommendation: %s\n\n', ternary(evidenceSummary.referralRecommended, 'REFERABLE', 'ROUTINE'));

%% 6. Confidence Calibration & Automated Clinical Report
fprintf('[Step 6/7] Applying Platt temperature scaling and generating clinical report...\n');
rawConfidence = 0.942;
temperature = 1.45;
[calibratedConf, ece] = calibrate_probabilities([2.1, 1.2, 4.8, 1.5, 0.4], 3, temperature);
calibratedConfidenceScalar = calibratedConf(3);

patientProfile = struct( ...
    'name', 'Kamala Devi', ...
    'age', 58, ...
    'gender', 'Female', ...
    'eye', 'OD (Right Eye)', ...
    'phc', 'PHC Heggadadevankote, Mysore Rural', ...
    'hba1c', 9.4);

report = generate_clinical_report(patientProfile, qaResult, evidenceSummary, calibratedConfidenceScalar);

%% 7. Multi-Dataset Benchmark Validation
fprintf('\n[Step 7/7] Running multi-benchmark evaluation (IDRiD, APTOS 2019, EyePACS)...\n');
benchmarkResults = evaluate_pipeline_benchmarks();

%% 8. Graphical Display: 6-Panel Comprehensive Diagnostic Dashboard
fig = figure('Name', 'RetinaCare AI - Diagnostic Verification Dashboard', 'NumberTitle', 'off', 'Position', [80, 80, 1200, 720]);

% Panel 1: Raw Image & QA Result
subplot(2, 3, 1);
imshow(rawImg);
title(sprintf('1. Input Fundus | QA: %s (Focus: %.1f)', upper(qaResult.status), qaResult.focusScore), 'FontWeight', 'bold');

% Panel 2: Enhanced Image (CLAHE)
subplot(2, 3, 2);
imshow(enhancedImg);
title('2. Enhanced Image (CLAHE + Illum Normalization)', 'FontWeight', 'bold');

% Panel 3: Vessel & Optic Disc / Fovea Localization
subplot(2, 3, 3);
imshow(vesselMask);
hold on;
plot(odCenter(1), odCenter(2), 'c+', 'MarkerSize', 12, 'LineWidth', 2);
viscircles(odCenter, odRadius, 'Color', 'c', 'LineWidth', 1.5);
plot(foveaCoord(1), foveaCoord(2), 'm*', 'MarkerSize', 10, 'LineWidth', 2);
title('3. Vessels, Optic Disc (Cyan) & FAZ (Magenta)', 'FontWeight', 'bold');
hold off;

% Panel 4: Lesion Segmentation Map
subplot(2, 3, 4);
imshow(zeros(size(rawImg, 1), size(rawImg, 2)));
hold on;
[exY, exX] = find(exudateMask); plot(exX, exY, 'y.', 'MarkerSize', 4);
[hemY, hemX] = find(hemMask); plot(hemX, hemY, 'r.', 'MarkerSize', 4);
if ~isempty(maCentroids), plot(maCentroids(:,1), maCentroids(:,2), 'm.', 'MarkerSize', 8); end
title(sprintf('4. Lesions (MAs:%d, Exudates:%d, Hem:%d)', maCount, exudateCount, hemStats.dotBlotCount + hemStats.flameCount), 'FontWeight', 'bold');
hold off;

% Panel 5: Grad-CAM Neural Attention Map
subplot(2, 3, 5);
imshow(gradcamOverlay);
title('5. Grad-CAM Neural Class Activation', 'FontWeight', 'bold');

% Panel 6: Fused Evidence for <30s Clinician Review
subplot(2, 3, 6);
imshow(fusedEvidenceImg);
title(sprintf('6. Fused Evidence | Grade %d (%s)', evidenceSummary.deducedGrade, evidenceSummary.deducedLabel), 'Color', [0.8 0.1 0.1], 'FontWeight', 'bold');

fprintf('\n>>> Pipeline Execution Complete. Diagnostic Dashboard Rendered Successfully. <<<\n');

function out = ternary(condition, valTrue, valFalse)
    if condition, out = valTrue; else, out = valFalse; end
end
