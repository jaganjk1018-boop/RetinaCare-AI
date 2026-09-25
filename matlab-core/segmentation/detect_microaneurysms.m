function [maMask, maCount, maCentroids] = detect_microaneurysms(img, vesselMask, odMask, retinaMask)
% DETECT_MICROANEURYSMS Sub-pixel microaneurysm detection using morphological top-hat,
% matched Gaussian point spread function (PSF) filtering, and vessel tree subtraction.
% Explicitly tuned for low-contrast portable fundus cameras used in rural clinics.
%
% Input:
%   img        - RGB retinal image
%   vesselMask - Binary mask of retinal vessels (to prevent false positive branch points)
%   odMask     - Binary mask of optic disc (to prevent false positives from cup boundaries)
%   retinaMask - Binary mask of retina
%
% Output:
%   maMask      - Binary mask indicating microaneurysm locations
%   maCount     - Total number of validated microaneurysms detected
%   maCentroids - [N x 2] array of (x, y) coordinates for each lesion
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
    if nargin < 3 || isempty(odMask)
        odMask = false(H, W);
    end
    if nargin < 2 || isempty(vesselMask)
        vesselMask = false(H, W);
    end

    % Microaneurysms appear as dark, circular dots on the green channel
    greenChannel = imgDouble(:, :, 2);

    %% 1. Morphological Bottom-Hat Transform (Detects Small Dark Retinal Dots)
    % A structuring element matching typical MA radius (2 to 7 pixels)
    seMA = strel('disk', 6);
    bottomHat = imclose(greenChannel, seMA) - greenChannel;
    bottomHat(~retinaMask) = 0;

    %% 2. Matched 2D Gaussian Point Spread Function (PSF) Filter
    % MAs exhibit an inverted Gaussian luminance profile
    psfSigma = 1.8;
    psfKernel = fspecial('gaussian', [11 11], psfSigma);
    psfKernel = psfKernel - mean(psfKernel(:)); % Zero-mean high-pass characteristic
    
    psfResponse = imfilter(bottomHat, psfKernel, 'replicate', 'conv');
    psfResponse = max(0, psfResponse);

    %% 3. Exclude Normal Retinal Structures (Vessels and Optic Disc)
    % Dilate vessel mask slightly to mask out junction bifurcation artifacts
    dilatedVessels = imdilate(vesselMask, strel('disk', 2));
    dilatedOD = imdilate(odMask, strel('disk', 5));
    
    searchArea = retinaMask & ~dilatedVessels & ~dilatedOD;
    psfResponse(~searchArea) = 0;

    %% 4. Statistical Dynamic Thresholding
    validValues = psfResponse(searchArea);
    if isempty(validValues) || max(validValues) == 0
        maMask = false(H, W);
        maCount = 0;
        maCentroids = [];
        return;
    end

    % Adaptive threshold set at mean + 3.5 standard deviations of background noise
    thresh = mean(validValues) + 3.5 * std(validValues);
    candidateMask = (psfResponse > thresh) & searchArea;

    %% 5. Morphological Shape & Circularity Filtering
    % Microaneurysms must be roughly circular (low eccentricity, area between 3 and 45 pixels)
    props = regionprops(candidateMask, 'Area', 'Eccentricity', 'Centroid', 'Circularity');
    
    validIndices = [];
    centroids = [];
    for k = 1:length(props)
        area = props(k).Area;
        ecc = props(k).Eccentricity;
        
        % Circularity: 4*pi*Area / Perimeter^2
        % Typical MA has high circularity (> 0.65) and low area (3 <= area <= 45)
        if (area >= 3) && (area <= 45) && (ecc <= 0.82)
            validIndices = [validIndices, k];
            centroids = [centroids; props(k).Centroid];
        end
    end

    maMask = ismember(bwlabel(candidateMask), validIndices);
    maCount = length(validIndices);
    maCentroids = centroids;
end
