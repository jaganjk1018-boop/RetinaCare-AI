function [vesselMask, vesselResponse] = segment_vessels(img, retinaMask)
% SEGMENT_VESSELS Segments retinal vasculature using 2D multi-scale directional matched filters.
% Blood vessels have inverted Gaussian cross-profiles in the green channel.
%
% Input:
%   img            - RGB retinal image
%   retinaMask     - Logical mask of retinal area
%
% Output:
%   vesselMask     - Binary mask of segmented blood vessels
%   vesselResponse - Continuous maximum matched filter response map
%
% Toolboxes: Image Processing Toolbox

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

    % Retinal blood vessels appear darkest in the green channel
    greenChannel = imgDouble(:, :, 2);

    % Invert green channel so vessels become bright peaks on dark background
    invertedGreen = 1.0 - greenChannel;
    invertedGreen(~retinaMask) = 0;

    %% 1. Design 2D Matched Gaussian Filter Kernels (12 Orientations)
    % Gaussian matched filter profile: f(x, y) = -exp(-x^2 / (2 * sigma^2)) for |y| <= L/2
    sigma = 1.5; % Vessel half-width standard deviation
    L = 9;       % Vessel segment length
    kernelSize = 15;
    halfSize = floor(kernelSize / 2);
    [xGrid, yGrid] = meshgrid(-halfSize:halfSize, -halfSize:halfSize);

    numAngles = 12;
    angles = linspace(0, 180 - (180/numAngles), numAngles);
    vesselResponse = zeros(H, W);

    for i = 1:numAngles
        theta = deg2rad(angles(i));
        % Rotate coordinate system
        u = xGrid * cos(theta) + yGrid * sin(theta);
        v = -xGrid * sin(theta) + yGrid * cos(theta);
        
        % Matched filter definition (zero mean to eliminate background response)
        kernel = exp(-(u.^2) / (2 * sigma^2));
        kernel(abs(v) > (L / 2)) = 0;
        kernel = kernel - mean(kernel(:)); % Zero-mean normalization
        
        % Convolve inverted green channel with kernel
        response = imfilter(invertedGreen, kernel, 'replicate', 'conv');
        vesselResponse = max(vesselResponse, response);
    end

    vesselResponse(~retinaMask) = 0;

    %% 2. Adaptive Local Thresholding
    % Local threshold accommodates non-uniform retinal pigmentation
    localMean = imfilter(vesselResponse, fspecial('average', 31), 'replicate');
    vesselDiff = vesselResponse - localMean;
    
    thresh = 0.012;
    vesselMask = (vesselDiff > thresh) & retinaMask;

    %% 3. Morphological Cleaning
    % Remove isolated noise pixels smaller than realistic vessel segments
    vesselMask = bwareaopen(vesselMask, 25);
    vesselMask = imclose(vesselMask, strel('disk', 1));
end
