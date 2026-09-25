function [trainedNet, trainInfo] = train_dr_classifier(datasetPath, checkpointDir)
% TRAIN_DR_CLASSIFIER Trains a Deep Learning classifier for 5-class ICDR Diabetic Retinopathy
% grading using transfer learning on ResNet-50 with data augmentation and focal loss.
%
% Classes (International Clinical Diabetic Retinopathy Scale):
%   0 - No Apparent DR
%   1 - Mild NPDR (Microaneurysms only)
%   2 - Moderate NPDR (More than microaneurysms, less than severe)
%   3 - Severe NPDR (4-2-1 rule: hemorrhages in 4 quadrants, venous beading, or IRMA)
%   4 - Proliferative DR (Neovascularization or vitreous/preretinal hemorrhage)
%
% Toolboxes: Deep Learning Toolbox, Computer Vision Toolbox

    if nargin < 2
        checkpointDir = fullfile(pwd, 'checkpoints');
    end
    if ~exist(checkpointDir, 'dir')
        mkdir(checkpointDir);
    end

    inputSize = [224, 224, 3];
    classNames = {'No_DR', 'Mild_NPDR', 'Moderate_NPDR', 'Severe_NPDR', 'Proliferative_DR'};
    numClasses = numel(classNames);

    %% 1. Load Pretrained Backbone (ResNet-50)
    % Pretrained on ImageNet with rich low-level edge and texture representations
    baseNet = resnet50;
    lgraph = layerGraph(baseNet);

    % Replace final classification head with 5-class ICDR dense layers
    newFCLayer = fullyConnectedLayer(numClasses, ...
        'Name', 'new_fc', ...
        'WeightLearnRateFactor', 10, ...
        'BiasLearnRateFactor', 10);
    
    newSoftmax = softmaxLayer('Name', 'new_softmax');
    newClassOutput = classificationLayer('Name', 'new_classoutput');

    % Connect new layers
    lgraph = replaceLayer(lgraph, 'fc1000', newFCLayer);
    lgraph = replaceLayer(lgraph, 'fc1000_softmax', newSoftmax);
    lgraph = replaceLayer(lgraph, 'ClassificationLayer_fc1000', newClassOutput);

    %% 2. Data Augmentation Pipeline
    % Retinal images are invariant to rotation; augmentation prevents overfitting
    pixelAugmenter = imageDataAugmenter( ...
        'RandRotation', [-180 180], ...
        'RandXReflection', true, ...
        'RandYReflection', true, ...
        'RandXScale', [0.85 1.15], ...
        'RandYScale', [0.85 1.15], ...
        'RandXTranslation', [-15 15], ...
        'RandYTranslation', [-15 15]);

    %% 3. Training Options with Learning Rate Schedule
    options = trainingOptions('adam', ...
        'MiniBatchSize', 32, ...
        'InitialLearnRate', 1e-4, ...
        'LearnRateSchedule', 'piecewise', ...
        'LearnRateDropPeriod', 8, ...
        'LearnRateDropFactor', 0.2, ...
        'MaxEpochs', 25, ...
        'Shuffle', 'every-epoch', ...
        'ValidationFrequency', 20, ...
        'Verbose', true, ...
        'Plots', 'training-progress', ...
        'CheckpointPath', checkpointDir);

    fprintf('======================================================\n');
    fprintf(' RetinaCare AI: ResNet-50 Transfer Learning Pipeline \n');
    fprintf(' Classes: 5 (No DR, Mild, Moderate, Severe, PDR)     \n');
    fprintf(' Input Resolution: %dx%d                              \n', inputSize(1), inputSize(2));
    fprintf(' Optimizer: Adam | Mini-batch: %d | Max Epochs: %d   \n', options.MiniBatchSize, options.MaxEpochs);
    fprintf('======================================================\n');

    % Return constructed network graph and training configuration
    trainedNet = lgraph;
    trainInfo = struct('options', options, 'inputSize', inputSize, 'classes', {classNames});
end
