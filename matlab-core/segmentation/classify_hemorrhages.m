function [hemorrhageMask, hemStats, quadrantCount] = classify_hemorrhages(img, vesselMask, odMask, retinaMask)
% CLASSIFY_HEMORRHAGES Detects intraretinal hemorrhages, separates dot-blot from
% flame-shaped hemorrhages, and tallies quadrant distribution according to the ICDR 4-2-1 rule.
%
% Input:
%   img        - RGB retinal image
%   vesselMask - Binary mask of blood vessels (subtracted to isolate extravasated blood)
%   odMask     - Binary mask of optic disc
%   retinaMask - Binary mask of retina area
%
% Output:
%   hemorrhageMask - Binary mask of detected hemorrhages
%   hemStats       - Struct with counts of dot-blot vs flame hemorrhages
%   quadrantCount  - Number of retinal quadrants (0 to 4) exhibiting hemorrhages (4-2-1 rule)
%
% Toolboxes: Image Processing Toolbox

    if isa(img, 'uint8')
        imgDouble = im2double(img);
    else
        imgDouble = img;
    end
    [H, W, ~] = size(imgDouble);

    if nargin < 4 || isempty(retinaMask)
        gray = rgb2gray(imgDouble);
        retinaMask = (gray > 0.08);
        retinaMask = imfill(retinaMask, 'holes');
    end

    greenChannel = imgDouble(:, :, 2);
    redChannel = imgDouble(:, :, 1);

    % Exclude vessel tree (dilated by 1 pixel) and optic disc
    dilatedVessels = imdilate(vesselMask, strel('disk', 1));
    searchArea = retinaMask & ~dilatedVessels & ~odMask;

    %% 1. Morphological Contrast Filtering for Dark Lesions
    % Hemorrhages are larger than microaneurysms (area > 40 pixels) and dark in green
    seClose = strel('disk', 18);
    darkEnhance = imclose(greenChannel, seClose) - greenChannel;
    darkEnhance(~searchArea) = 0;

    %% 2. Color Ratio Verification (Red/Green Ratio)
    % True blood hemorrhages have high red-to-green reflectance ratio
    rgRatio = redChannel ./ (greenChannel + 1e-4);
    
    validDark = darkEnhance(searchArea);
    if isempty(validDark) || max(validDark) == 0
        hemorrhageMask = false(H, W);
        hemStats = struct('dotBlotCount', 0, 'flameCount', 0, 'totalArea', 0);
        quadrantCount = 0;
        return;
    end

    darkThresh = mean(validDark) + 2.5 * std(validDark);
    rawCandidates = (darkEnhance > darkThresh) & (rgRatio > 1.35) & searchArea;

    % Area filtering: hemorrhages must have area >= 30 pixels (smaller are MAs)
    rawCandidates = bwareaopen(rawCandidates, 30);

    %% 3. Morphological Classification: Dot-Blot vs Flame-Shaped
    props = regionprops(rawCandidates, 'Area', 'Eccentricity', 'MajorAxisLength', 'MinorAxisLength', 'Centroid');
    
    dotBlotMask = false(H, W);
    flameMask = false(H, W);
    labeledCandidates = bwlabel(rawCandidates);

    dotBlotCount = 0;
    flameCount = 0;

    for i = 1:length(props)
        % Flame-shaped hemorrhages follow nerve fiber layer: high eccentricity (> 0.85)
        % Dot-blot hemorrhages are in deep retina: compact, round (eccentricity <= 0.85)
        if props(i).Eccentricity > 0.85 && (props(i).MajorAxisLength / max(1, props(i).MinorAxisLength)) > 2.2
            flameCount = flameCount + 1;
            flameMask = flameMask | (labeledCandidates == i);
        else
            dotBlotCount = dotBlotCount + 1;
            dotBlotMask = dotBlotMask | (labeledCandidates == i);
        end
    end

    hemorrhageMask = dotBlotMask | flameMask;
    hemStats = struct();
    hemStats.dotBlotCount = dotBlotCount;
    hemStats.flameCount = flameCount;
    hemStats.totalAreaPixels = sum(hemorrhageMask(:));

    %% 4. Retinal Quadrant Distribution (4-2-1 ICDR Rule)
    % Divide retina into 4 quadrants relative to retina center
    retinaCenter = [W / 2, H / 2];
    quadrants = false(1, 4); % [Superior-Temporal, Superior-Nasal, Inferior-Temporal, Inferior-Nasal]

    for i = 1:length(props)
        cx = props(i).Centroid(1);
        cy = props(i).Centroid(2);
        
        if cx >= retinaCenter(1) && cy < retinaCenter(2)
            quadrants(1) = true;
        elseif cx < retinaCenter(1) && cy < retinaCenter(2)
            quadrants(2) = true;
        elseif cx >= retinaCenter(1) && cy >= retinaCenter(2)
            quadrants(3) = true;
        else
            quadrants(4) = true;
        end
    end

    quadrantCount = sum(quadrants);
end
