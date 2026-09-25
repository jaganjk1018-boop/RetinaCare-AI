function [odMask, odCenter, odRadius, foveaCoord] = localize_optic_disc_and_fovea(img, retinaMask)
% LOCALIZE_OPTIC_DISC_AND_FOVEA Localizes the optic nerve head (optic disc)
% and foveal avascular zone (FAZ) using luminance clustering and anatomical priors.
%
% Input:
%   img        - RGB retinal fundus image (uint8 or double)
%   retinaMask - (Optional) Binary mask of retina area
%
% Output:
%   odMask     - Logical mask of segmented optic disc
%   odCenter   - [x, y] coordinates of optic disc centroid
%   odRadius   - Estimated radius of optic disc in pixels
%   foveaCoord - [x, y] coordinates of foveal center
%
% Toolboxes: Image Processing Toolbox, Computer Vision Toolbox

    if isa(img, 'uint8')
        imgDouble = im2double(img);
    else
        imgDouble = img;
    end
    [H, W, ~] = size(imgDouble);

    if nargin < 2 || isempty(retinaMask)
        gray = rgb2gray(imgDouble);
        retinaMask = (gray > 0.08);
        retinaMask = imfill(retinaMask, 'holes');
        retinaMask = bwareaopen(retinaMask, 1000);
    end

    %% 1. Optic Disc Candidate Detection via Red & Green Luminance
    % The optic disc is characterized by high intensity in both red and green channels
    redChannel = imgDouble(:, :, 1);
    greenChannel = imgDouble(:, :, 2);
    discCandidateMetric = (redChannel .* 0.6 + greenChannel .* 0.4);
    discCandidateMetric(~retinaMask) = 0;

    % Morphological filtering to eliminate small bright exudates
    approxDiscRadius = round(min(H, W) / 16);
    seDisc = strel('disk', approxDiscRadius);
    filteredBright = imopen(discCandidateMetric, seDisc);

    % Find top 1% brightest region
    intensityThresh = quantile(filteredBright(retinaMask), 0.99);
    brightBlob = filteredBright >= intensityThresh;
    brightBlob = imclose(brightBlob, strel('disk', round(approxDiscRadius / 2)));
    brightBlob = imfill(brightBlob, 'holes');

    %% 2. Connected Component Analysis for Optic Disc
    stats = regionprops(brightBlob, 'Area', 'Centroid', 'Eccentricity', 'EquivDiameter');
    if isempty(stats)
        % Fallback: Center of brightest region
        [~, maxIdx] = max(filteredBright(:));
        [cy, cx] = ind2sub([H, W], maxIdx);
        odCenter = [cx, cy];
        odRadius = approxDiscRadius;
    else
        % Choose component closest to circular (lowest eccentricity) and largest area
        scores = [stats.Area] ./ (1 + [stats.Eccentricity] * 2);
        [~, bestIdx] = max(scores);
        odCenter = stats(bestIdx).Centroid;
        odRadius = round(stats(bestIdx).EquivDiameter / 2);
    end

    % Construct binary circular mask for optic disc
    [Xgrid, Ygrid] = meshgrid(1:W, 1:H);
    odDistances = sqrt((Xgrid - odCenter(1)).^2 + (Ygrid - odCenter(2)).^2);
    odMask = (odDistances <= odRadius) & retinaMask;

    %% 3. Fovea Localization using Anatomical Prior
    % Anatomical constant: The fovea is located approximately 2.5 optic disc diameters
    % (approx 5 * odRadius) temporal to the optic disc and slightly inferior (0.3 disc diameters down).
    % Determine if OD is in nasal side (left or right half of retina):
    retinaProps = regionprops(retinaMask, 'Centroid');
    retinaCenter = retinaProps(1).Centroid;
    
    if odCenter(1) < retinaCenter(1)
        % Optic disc is on the left -> This is a Left Eye (OS). Fovea is to the right (temporal).
        foveaX = odCenter(1) + (4.8 * odRadius);
    else
        % Optic disc is on the right -> This is a Right Eye (OD). Fovea is to the left (temporal).
        foveaX = odCenter(1) - (4.8 * odRadius);
    end
    
    % Fovea is slightly lower (inferior) than the optic disc horizontal meridian
    foveaY = odCenter(2) + (0.35 * odRadius);

    % Refine fovea location by finding the darkest local minimum in the green channel
    searchRadius = round(odRadius * 0.8);
    searchXmin = max(1, round(foveaX - searchRadius));
    searchXmax = min(W, round(foveaX + searchRadius));
    searchYmin = max(1, round(foveaY - searchRadius));
    searchYmax = min(H, round(foveaY + searchRadius));

    macularRegion = greenChannel(searchYmin:searchYmax, searchXmin:searchXmax);
    if ~isempty(macularRegion)
        % Gaussian smooth to suppress noise
        smoothMacula = imgaussfilt(macularRegion, 2.0);
        [~, minIdx] = min(smoothMacula(:));
        [relY, relX] = ind2sub(size(smoothMacula), minIdx);
        foveaCoord = [searchXmin + relX - 1, searchYmin + relY - 1];
    else
        foveaCoord = [round(foveaX), round(foveaY)];
    end
end
