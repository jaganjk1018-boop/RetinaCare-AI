function enhancedImg = enhance_retina_image(img, retinaMask)
% ENHANCE_RETINA_IMAGE Applies CLAHE, illumination gradient correction, and bilateral denoising
% Optimized for low-cost portable fundus cameras used in rural primary health centers.
%
% Input:
%   img        - RGB retinal fundus image (uint8 or double)
%   retinaMask - (Optional) Logical mask of the circular retinal aperture
%
% Output:
%   enhancedImg - RGB enhanced image (uint8, normalized and contrast boosted)
%
% Toolboxes: Image Processing Toolbox

    if nargin < 2 || isempty(retinaMask)
        gray = rgb2gray(im2double(img));
        retinaMask = (gray > 0.08);
        retinaMask = imfill(retinaMask, 'holes');
        retinaMask = bwareaopen(retinaMask, 1000);
    end

    if isa(img, 'uint8')
        imgDouble = im2double(img);
    else
        imgDouble = img;
    end

    [H, W, ~] = size(imgDouble);

    %% 1. Color Space Transformation: Convert to CIE L*a*b*
    % Transforming to Lab allows enhancing luminance (L*) while preserving natural retinal hue
    labImg = rgb2lab(imgDouble);
    L_channel = labImg(:, :, 1) / 100.0; % Scale to [0, 1]

    %% 2. Background Illumination Normalization
    % Non-uniform illumination from portable camera LEDs causes bright center and dark periphery.
    % We estimate the low-frequency illumination profile via morphological opening.
    seRadius = max(15, round(min(H, W) / 20));
    seBackground = strel('disk', seRadius);
    
    % Masked background estimation
    bgLuminance = imopen(L_channel, seBackground);
    
    % Subtract illumination gradient and restore global mean
    meanL = mean(L_channel(retinaMask));
    normalizedL = L_channel - bgLuminance + mean(bgLuminance(retinaMask));
    normalizedL(~retinaMask) = 0;
    normalizedL = min(1.0, max(0.0, normalizedL));

    %% 3. Contrast-Limited Adaptive Histogram Equalization (CLAHE)
    % Local contrast enhancement reveals faint microaneurysms and deep intraretinal hemorrhages
    claheL = adapthisteq(normalizedL, ...
        'NumTiles', [8 8], ...
        'ClipLimit', 0.015, ...
        'Distribution', 'rayleigh');

    %% 4. Edge-Preserving Bilateral Denoising
    % Smooths camera CMOS sensor noise without blurring delicate retinal microvessels
    denoisedL = imbilatfilt(claheL, 0.08, 2.5);

    %% 5. Recombine Channels and Return Enhanced RGB
    labImg(:, :, 1) = denoisedL * 100.0;
    enhancedDouble = lab2rgb(labImg);
    
    % Clamp bounds to valid range
    enhancedDouble = min(1.0, max(0.0, enhancedDouble));
    
    % Enforce zero background outside circular retina aperture
    for c = 1:3
        channel = enhancedDouble(:,:,c);
        channel(~retinaMask) = 0;
        enhancedDouble(:,:,c) = channel;
    end

    enhancedImg = im2uint8(enhancedDouble);
end
