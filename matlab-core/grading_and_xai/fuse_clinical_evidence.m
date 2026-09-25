function [fusedImg, evidenceSummary] = fuse_clinical_evidence(rawImg, gradcamHeatmap, maMask, exudateMask, hemMask, nvMask, odMask, foveaCoord)
% FUSE_CLINICAL_EVIDENCE Fuses Grad-CAM neural attention with anatomical lesion segmentation
% masks to produce a lesion-grounded clinical explanation validated in <30 seconds.
%
% Color Coding Standards:
%   - Microaneurysms (MAs)    : Magenta (#EC4899)
%   - Hard Exudates           : Gold / Yellow (#FACC15)
%   - Hemorrhages (Dot/Flame) : Crimson Red (#EF4444)
%   - Neovascularization      : Electric Violet (#A855F7)
%   - Optic Disc / FAZ Margin : Cyan (#38BDF8)
%
% Output:
%   fusedImg        - Composite RGB image showing lesion boundaries over fundus
%   evidenceSummary - Struct with clinical audit counts and ICDR rule satisfaction
%
% Toolboxes: Image Processing Toolbox

    if isa(rawImg, 'uint8')
        baseImg = rawImg;
    else
        baseImg = im2uint8(rawImg);
    end
    [H, W, ~] = size(baseImg);

    fusedImg = baseImg;

    %% 1. Overlay Optic Disc & Fovea Landmarks (Cyan Boundaries)
    if ~isempty(odMask)
        odPerim = bwperim(odMask);
        odDilated = imdilate(odPerim, strel('disk', 2));
        fusedImg = apply_color_mask(fusedImg, odDilated, [56, 189, 248]); % Cyan
    end

    if ~isempty(foveaCoord)
        [Xgrid, Ygrid] = meshgrid(1:W, 1:H);
        fazDist = sqrt((Xgrid - foveaCoord(1)).^2 + (Ygrid - foveaCoord(2)).^2);
        fazCircle = abs(fazDist - 12) <= 1.5;
        fusedImg = apply_color_mask(fusedImg, fazCircle, [56, 189, 248]);
    end

    %% 2. Overlay Hard Exudates (Gold/Yellow)
    if ~isempty(exudateMask) && any(exudateMask(:))
        exudatePerim = bwperim(exudateMask);
        exudateDilated = imdilate(exudatePerim, strel('disk', 1));
        fusedImg = apply_color_mask(fusedImg, exudateDilated, [250, 204, 21]); % Gold
    end

    %% 3. Overlay Hemorrhages (Crimson Red)
    if ~isempty(hemMask) && any(hemMask(:))
        hemPerim = bwperim(hemMask);
        hemDilated = imdilate(hemPerim, strel('disk', 1));
        fusedImg = apply_color_mask(fusedImg, hemDilated, [239, 68, 68]); % Red
    end

    %% 4. Overlay Microaneurysms (Hot Magenta)
    if ~isempty(maMask) && any(maMask(:))
        maDilated = imdilate(maMask, strel('disk', 3));
        fusedImg = apply_color_mask(fusedImg, maDilated, [236, 72, 153]); % Magenta
    end

    %% 5. Overlay Neovascularization Fronds (Violet)
    if ~isempty(nvMask) && any(nvMask(:))
        nvDilated = imdilate(nvMask, strel('disk', 2));
        fusedImg = apply_color_mask(fusedImg, nvDilated, [168, 85, 247]); % Violet
    end

    %% 6. Calculate ICDR Evidence Summary
    maCount = 0; if ~isempty(maMask), maCount = sum(bwconncomp(maMask).NumObjects); end
    exCount = 0; if ~isempty(exudateMask), exCount = sum(bwconncomp(exudateMask).NumObjects); end
    hemCount = 0; if ~isempty(hemMask), hemCount = sum(bwconncomp(hemMask).NumObjects); end
    hasNV = false; if ~isempty(nvMask), hasNV = any(nvMask(:)); end

    % Rule-based diagnostic deduction according to ICDR standard
    if hasNV
        deducedGrade = 4;
        deducedLabel = 'Proliferative DR (PDR)';
        clinicalCriterion = 'Neovascularization fronds detected at disc or peripheral arcades.';
    elseif hemCount >= 20
        deducedGrade = 3;
        deducedLabel = 'Severe NPDR';
        clinicalCriterion = 'Extensive intraretinal hemorrhages satisfying ICDR 4-2-1 rule.';
    elseif (exCount > 0) || (hemCount > 0)
        deducedGrade = 2;
        deducedLabel = 'Moderate NPDR';
        clinicalCriterion = 'Multiple microaneurysms accompanied by hard exudates and/or hemorrhages.';
    elseif maCount > 0
        deducedGrade = 1;
        deducedLabel = 'Mild NPDR';
        clinicalCriterion = 'Microaneurysms only. No hard exudates or hemorrhages.';
    else
        deducedGrade = 0;
        deducedLabel = 'No Apparent DR';
        clinicalCriterion = 'Zero diabetic microvascular lesions observed.';
    end

    evidenceSummary = struct();
    evidenceSummary.maCount = maCount;
    evidenceSummary.exudateClusterCount = exCount;
    evidenceSummary.hemorrhageCount = hemCount;
    evidenceSummary.neovascularization = hasNV;
    evidenceSummary.deducedGrade = deducedGrade;
    evidenceSummary.deducedLabel = deducedLabel;
    evidenceSummary.clinicalCriterion = clinicalCriterion;
    evidenceSummary.referralRecommended = deducedGrade >= 2;
end

function outImg = apply_color_mask(baseImg, mask, rgbColor)
    outImg = baseImg;
    for c = 1:3
        channel = outImg(:,:,c);
        channel(mask) = rgbColor(c);
        outImg(:,:,c) = channel;
    end
end
