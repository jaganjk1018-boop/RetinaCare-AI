function [isPDR, nvdDetected, nveDetected, nvMask] = detect_neovascularization(vesselMask, odMask, odCenter, odRadius, retinaMask)
% DETECT_NEOVASCULARIZATION Detects retinal neovascularization (hallmark of Proliferative DR)
% by analyzing abnormal capillary network density and tortuosity near the optic disc (NVD)
% and along retinal vascular arcades (NVE).
%
% Input:
%   vesselMask - Binary mask of segmented blood vessels
%   odMask     - Binary mask of optic disc
%   odCenter   - [x, y] coordinates of optic disc center
%   odRadius   - Radius of optic disc
%   retinaMask - Binary mask of retinal field
%
% Output:
%   isPDR       - Boolean flag (true indicates Grade 4 Proliferative DR)
%   nvdDetected - Boolean flag for Neovascularization at the Disc
%   nveDetected - Boolean flag for Neovascularization Elsewhere
%   nvMask      - Binary mask highlighting suspicious neovascular fronds
%
% Toolboxes: Image Processing Toolbox

    [H, W] = size(vesselMask);

    %% 1. Skeletonize Vessel Tree & Extract Branch Points
    % Normal mature vessels have sparse branch points; neovascularization creates
    % dense, tangled, hyper-branched capillary networks.
    vesselSkeleton = bwskel(vesselMask);
    branchPoints = bwmorph(vesselSkeleton, 'branchpoints');

    %% 2. Peri-Papillary Analysis for Neovascularization at the Disc (NVD)
    % NVD occurs within 1 disc diameter (2 * odRadius) of the optic disc margin
    [Xgrid, Ygrid] = meshgrid(1:W, 1:H);
    odDistances = sqrt((Xgrid - odCenter(1)).^2 + (Ygrid - odCenter(2)).^2);
    
    nvdZone = (odDistances <= (2.0 * odRadius)) & retinaMask;
    
    % Measure vessel density and branch point concentration in NVD zone
    vesselPixelsInNvd = sum(vesselMask(:) & nvdZone(:));
    totalZonePixels = max(1, sum(nvdZone(:)));
    nvdVesselDensity = vesselPixelsInNvd / totalZonePixels;
    
    branchesInNvd = sum(branchPoints(:) & nvdZone(:));
    
    % Clinical threshold: abnormally high branching (> 18 branches inside NVD zone)
    % indicates fronds of neovascularization
    nvdDetected = (branchesInNvd >= 18) && (nvdVesselDensity > 0.16);

    %% 3. Neovascularization Elsewhere (NVE) Analysis
    % Look for localized clusters of high capillary tortuosity outside the optic disc
    outsideDiscZone = retinaMask & ~nvdZone;
    
    % Local branch point density filter
    branchDensityMap = imfilter(double(branchPoints & outsideDiscZone), fspecial('disk', 20), 'replicate');
    nveClusters = (branchDensityMap > 0.015) & outsideDiscZone;
    nveClusters = bwareaopen(nveClusters, 100);

    nveDetected = any(nveClusters(:));

    %% 4. Combine and Return Final PDR Determination
    isPDR = nvdDetected || nveDetected;
    
    nvMask = false(H, W);
    if nvdDetected
        nvMask = nvMask | (vesselMask & nvdZone);
    end
    if nveDetected
        nvMask = nvMask | nveClusters;
    end
end
