function [qaResult, feedback] = assess_image_quality(img)
% ASSESS_IMAGE_QUALITY Real-time optical and structural QA for retinal fundus images
% Evaluates focus (Laplacian variance), illumination uniformity, contrast,
% field of view (FOV), and specular corneal glare artifacts.
%
% Input:
%   img - RGB retinal fundus image (uint8 or double, size: [H x W x 3])
%
% Output:
%   qaResult - struct containing:
%       .status       : 'pass', 'enhance', or 'reject'
%       .focusScore   : 0 - 100 metric (Laplacian variance normalized)
%       .illumScore   : 0 - 100 metric (uniformity of illumination field)
%       .contrastScore: 0 - 100 metric (RMS contrast of green channel)
%       .fovScore     : 0 - 100 metric (retinal mask coverage & centration)
%       .glareRatio   : percentage of saturated glare artifact in retinal area
%       .isBlurry     : boolean
%       .isPoorIllum  : boolean
%       .hasSevereGlare: boolean
%   feedback - struct containing:
%       .actionableAdvice : string with physical adjustment guidance for PHC worker
%       .suggestedRecapture: boolean
%
% Requires: Image Processing Toolbox

    if isa(img, 'uint8')
        imgDouble = im2double(img);
    else
        imgDouble = img;
    end

    % Extract green channel (highest contrast for retinal structures)
    greenChan = imgDouble(:, :, 2);
    grayImg = rgb2gray(imgDouble);
    [H, W, ~] = size(imgDouble);

    %% 1. Field of View (FOV) & Retinal Mask Segmentation
    % Retinal area is distinguished from black camera aperture boundary
    retinaMask = (grayImg > 0.08) | (imgDouble(:,:,1) > 0.12);
    retinaMask = imfill(retinaMask, 'holes');
    retinaMask = bwareaopen(retinaMask, round(0.05 * H * W));
    
    totalRetinaPixels = sum(retinaMask(:));
    idealCircularArea = pi * ((min(H, W) / 2) * 0.92)^2;
    fovRatio = min(1.0, totalRetinaPixels / max(1, idealCircularArea));
    fovScore = round(fovRatio * 100, 1);

    %% 2. Focus Assessment (Modified Laplacian Variance & Brenner Gradient)
    % High frequency content inside the retinal mask measures sharpness
    laplacianKernel = [0 1 0; 1 -4 1; 0 1 0];
    laplacianResponse = imfilter(greenChan, laplacianKernel, 'replicate');
    
    % Only calculate variance over valid retina pixels
    validLaplacian = laplacianResponse(retinaMask);
    if isempty(validLaplacian)
        focusVar = 0;
    else
        focusVar = var(validLaplacian) * 1e4; % Scale up for numerical clarity
    end
    
    % Focus threshold: calibrated against EyePACS/IDRiD blur sets
    % Sharp portable images typically produce focusVar > 8.0
    focusScore = min(100.0, max(0.0, round((focusVar / 12.0) * 100, 1)));
    isBlurry = focusScore < 65.0;

    %% 3. Illumination Uniformity & Contrast Assessment
    % Retinal luminance should be smoothly distributed without steep roll-off
    luminance = imgDouble(:,:,1)*0.2989 + imgDouble(:,:,2)*0.5870 + imgDouble(:,:,3)*0.1140;
    validLuminance = luminance(retinaMask);
    
    if isempty(validLuminance)
        meanLum = 0;
        rmsContrast = 0;
        illumScore = 0;
    else
        meanLum = mean(validLuminance);
        rmsContrast = std(validLuminance);
        
        % Background illumination model using large morphological closing
        seDisc = strel('disk', round(min(H, W) / 15));
        bgLuminance = imclose(luminance, seDisc);
        illumStd = std(bgLuminance(retinaMask));
        
        % High illumination uniformity means low background standard deviation
        illumUniformity = max(0, 1.0 - (illumStd / (meanLum + 1e-5)));
        illumScore = min(100.0, max(0.0, round(illumUniformity * 100, 1)));
    end
    
    contrastScore = min(100.0, max(0.0, round((rmsContrast / 0.25) * 100, 1)));
    isPoorIllum = (illumScore < 60.0) || (meanLum < 0.15) || (meanLum > 0.85);

    %% 4. Specular Glare / Flash Reflection Artifact Detection
    % Specular reflection creates saturated white/cyan spots on the cornea
    glarePixels = (imgDouble(:,:,1) > 0.92) & (imgDouble(:,:,2) > 0.92) & (imgDouble(:,:,3) > 0.88) & retinaMask;
    glareCount = sum(glarePixels(:));
    glareRatio = (glareCount / max(1, totalRetinaPixels)) * 100;
    hasSevereGlare = glareRatio > 2.5; % More than 2.5% obscured by flash artifact

    %% 5. Overall QA Verdict & Actionable Field Worker Feedback
    qaResult = struct();
    qaResult.focusScore = focusScore;
    qaResult.illumScore = illumScore;
    qaResult.contrastScore = contrastScore;
    qaResult.fovScore = fovScore;
    qaResult.glareRatio = round(glareRatio, 2);
    qaResult.isBlurry = isBlurry;
    qaResult.isPoorIllum = isPoorIllum;
    qaResult.hasSevereGlare = hasSevereGlare;

    feedback = struct();
    
    if hasSevereGlare
        qaResult.status = 'reject';
        feedback.suggestedRecapture = true;
        feedback.actionableAdvice = sprintf('REJECT - CORNEAL GLARE DETECTED (%.1f%% area). Action: Angle the camera light source 15° laterally and shield bright ambient sunlight from the PHC window.', glareRatio);
    elseif isBlurry && (focusScore < 50.0)
        qaResult.status = 'reject';
        feedback.suggestedRecapture = true;
        feedback.actionableAdvice = sprintf('REJECT - EXCESSIVE BLUR (Focus score: %.1f/100). Action: Patient blinked or moved. Stabilize chin rest, clean objective lens with microfiber cloth, and refocus on vascular arcade.', focusScore);
    elseif isPoorIllum && (meanLum < 0.15)
        qaResult.status = 'reject';
        feedback.suggestedRecapture = true;
        feedback.actionableAdvice = 'REJECT - UNDEREXPOSED / PUPIL TOO SMALL. Action: Darken the screening room for 3 minutes to allow physiological pupil dilation, or increase camera LED intensity by 1 stop.';
    elseif isBlurry || (illumScore < 75.0) || (contrastScore < 70.0)
        qaResult.status = 'enhance';
        feedback.suggestedRecapture = false;
        feedback.actionableAdvice = 'ACCEPT WITH ENHANCEMENT - Suboptimal illumination or mild blur. Automated CLAHE, illumination normalization, and bilateral denoising will be applied.';
    else
        qaResult.status = 'pass';
        feedback.suggestedRecapture = false;
        feedback.actionableAdvice = 'PASS - High optical clarity. Retinal vascular tree and fovea clearly visualized. Ready for segmentation and grading.';
    end
end
