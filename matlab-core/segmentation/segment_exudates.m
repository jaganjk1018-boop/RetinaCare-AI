function [exudateMask, exudateClusterCount, exudateAreaPercent, csmeRisk] = segment_exudates(img, odMask, foveaCoord, odRadius, retinaMask)
% SEGMENT_EXUDATES Segments hard exudates (lipid deposits) in retinal fundus images
% using CIE L*a*b* color clustering and calculates Clinically Significant Macular Edema (CSME) risk.
%
% Input:
%   img         - RGB retinal image
%   odMask      - Binary mask of optic disc (excluded to prevent false positives)
%   foveaCoord  - [x, y] coordinates of fovea center
%   odRadius    - Optic disc radius (used as clinical distance unit: Disc Diameter)
%   retinaMask  - Binary mask of retinal field
%
% Output:
%   exudateMask         - Binary mask of segmented hard exudates
%   exudateClusterCount - Number of distinct exudate clusters
%   exudateAreaPercent  - Total exudate surface area as percentage of retina
%   csmeRisk            - 'High', 'Moderate', or 'None' according to ETDRS criteria
%
% Toolboxes: Image Processing Toolbox

    if isa(img, 'uint8')
        imgDouble = im2double(img);
    else
        imgDouble = img;
    end
    [H, W, ~] = size(imgDouble);

    if nargin < 5 || isempty(retinaMask)
        gray = rgb2gray(imgDouble);
        retinaMask = (gray > 0.08);
        retinaMask = imfill(retinaMask, 'holes');
    end

    %% 1. CIE L*a*b* Color Space Conversion
    % Hard exudates exhibit high luminance (L*) and high yellowness (positive b*)
    labImg = rgb2lab(imgDouble);
    L_chan = labImg(:, :, 1);
    b_chan = labImg(:, :, 3); % b* channel: yellow (+) to blue (-)

    % Search area excludes optic disc (dilated by 1.2x to catch border glare)
    dilatedOD = imdilate(odMask, strel('disk', round(odRadius * 0.3)));
    searchArea = retinaMask & ~dilatedOD;

    %% 2. High-Pass Contrast Filter on Luminance
    % Morphological top-hat highlights bright local lesions against retinal background
    seDisk = strel('disk', 15);
    topHatL = L_chan - imopen(L_chan, seDisk);
    topHatL(~searchArea) = 0;

    %% 3. Dual-Threshold Candidate Extraction (Brightness & Yellowness)
    validTopHat = topHatL(searchArea);
    validB = b_chan(searchArea);
    
    if isempty(validTopHat) || max(validTopHat) == 0
        exudateMask = false(H, W);
        exudateClusterCount = 0;
        exudateAreaPercent = 0.0;
        csmeRisk = 'None';
        return;
    end

    lThresh = mean(validTopHat) + 2.8 * std(validTopHat);
    bThresh = quantile(validB, 0.70); % Yellow chromaticity threshold

    candidateExudates = (topHatL > lThresh) & (b_chan > bThresh) & searchArea;

    %% 4. Morphological Post-Processing & Filtering
    % Exudates must have sharp borders and reasonable cluster size
    candidateExudates = bwareaopen(candidateExudates, 5); % Remove 1-4 pixel noise
    
    stats = regionprops(candidateExudates, 'Area', 'Centroid');
    exudateMask = candidateExudates;
    exudateClusterCount = length(stats);

    totalRetinaPixels = max(1, sum(retinaMask(:)));
    totalExudatePixels = sum(exudateMask(:));
    exudateAreaPercent = round((totalExudatePixels / totalRetinaPixels) * 100, 3);

    %% 5. Clinically Significant Macular Edema (CSME) Risk Assessment
    % ETDRS Clinical Criterion: Exudates within 1 Disc Diameter (2 * odRadius) of fovea
    % constitutes severe vision-threatening macular edema risk
    csmeRisk = 'None';
    if ~isempty(foveaCoord) && exudateClusterCount > 0
        minDistToFovea = Inf;
        for i = 1:length(stats)
            c = stats(i).Centroid;
            dist = sqrt((c(1) - foveaCoord(1))^2 + (c(2) - foveaCoord(2))^2);
            if dist < minDistToFovea
                minDistToFovea = dist;
            end
        end

        oneDiscDiameter = 2 * odRadius;
        halfDiscDiameter = odRadius;

        if minDistToFovea <= halfDiscDiameter
            csmeRisk = 'High (Exudates within 500µm / 0.5 DD of FAZ)';
        elseif minDistToFovea <= oneDiscDiameter
            csmeRisk = 'Moderate (Exudates within 1.0 DD of FAZ)';
        else
            csmeRisk = 'Low (Peripheral Exudates > 1.0 DD)';
        end
    end
end
