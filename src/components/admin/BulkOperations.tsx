'use client';

import { useState, useEffect } from 'react';
import {
    UserGroupIcon,
    PlusIcon,
    MinusIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { Button, Loading } from '@/components/ui';
import { MultiSelect } from '@/components/ui/MultiSelect';
import {
    BulkTagOperation,
    BulkOperationPreview,
    BulkOperationResult,
    MultiSelectOption
} from '@/types/admin/relationship';
import { AdminToolListItem } from '@/types/admin/tool';
import { TagDTO } from '@/types/tools/tool';
import { classNames } from '@/utils';

interface BulkOperationsProps {
    selectedTools: AdminToolListItem[];
    availableTags: TagDTO[];
    onOperationComplete: () => void;
    onClose: () => void;
}

type OperationStep = 'select' | 'preview' | 'confirm' | 'executing' | 'results';

export function BulkOperations({
    selectedTools,
    availableTags,
    onOperationComplete,
    onClose
}: BulkOperationsProps) {
    const [step, setStep] = useState<OperationStep>('select');
    const [operationType, setOperationType] = useState<'assign' | 'remove'>('assign');
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
    const [preview, setPreview] = useState<BulkOperationPreview | null>(null);
    const [result, setResult] = useState<BulkOperationResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Convert data to MultiSelect options
    const tagOptions: MultiSelectOption[] = availableTags.map(tag => ({
        id: tag.id,
        label: tag.name,
        description: tag.description || undefined,
        color: tag.color || undefined,
        isActive: true
    }));

    const toolCount = selectedTools.length;
    const selectedTagCount = selectedTagIds.length;

    useEffect(() => {
        setError(null);
    }, [step, operationType, selectedTagIds]);

    const handlePreviewOperation = async () => {
        if (selectedTagIds.length === 0) {
            setError('Please select at least one tag');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const operation: BulkTagOperation = {
                type: operationType,
                toolIds: selectedTools.map(t => t.id),
                tagIds: selectedTagIds,
                requiresConfirmation: false,
                estimatedChanges: toolCount * selectedTagCount
            };

            const response = await fetch('/api/admin/relationships/preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ operation })
            });

            if (!response.ok) {
                throw new Error('Failed to preview operation');
            }

            const previewData: BulkOperationPreview = await response.json();
            setPreview(previewData);
            setStep('preview');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to preview operation');
        } finally {
            setIsLoading(false);
        }
    };

    const handleExecuteOperation = async () => {
        if (!preview) return;

        setIsLoading(true);
        setError(null);
        setStep('executing');

        try {
            const operation: BulkTagOperation = {
                type: operationType,
                toolIds: selectedTools.map(t => t.id),
                tagIds: selectedTagIds,
                requiresConfirmation: preview.requiresConfirmation,
                estimatedChanges: preview.summary.totalTagChanges
            };

            const response = await fetch('/api/admin/relationships/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ operation })
            });

            if (!response.ok) {
                throw new Error('Failed to execute operation');
            }

            const resultData: BulkOperationResult = await response.json();
            setResult(resultData);
            setStep('results');

            if (resultData.success) {
                onOperationComplete();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to execute operation');
            setStep('preview');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        switch (step) {
            case 'preview':
                setStep('select');
                setPreview(null);
                break;
            case 'confirm':
                setStep('preview');
                break;
            default:
                break;
        }
    };

    const handleReset = () => {
        setStep('select');
        setSelectedTagIds([]);
        setPreview(null);
        setResult(null);
        setError(null);
    };

    return (
        <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                        {operationType === 'assign' ? (
                            <PlusIcon className="w-5 h-5 text-blue-600" />
                        ) : (
                            <MinusIcon className="w-5 h-5 text-red-600" />
                        )}
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Bulk {operationType === 'assign' ? 'Assign' : 'Remove'} Tags
                        </h2>
                        <p className="text-sm text-gray-600">
                            {toolCount} tool{toolCount !== 1 ? 's' : ''} selected
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Close bulk operations"
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4 max-h-[calc(90vh-120px)] overflow-y-auto">
                {/* Step 1: Select Operation and Tags */}
                {step === 'select' && (
                    <div className="space-y-6">
                        {/* Operation Type Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Operation Type
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setOperationType('assign')}
                                    className={classNames(
                                        'flex items-center gap-3 p-4 rounded-lg border-2 transition-colors',
                                        operationType === 'assign'
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                    )}
                                >
                                    <PlusIcon className="w-5 h-5" />
                                    <div className="text-left">
                                        <div className="font-medium">Assign Tags</div>
                                        <div className="text-sm text-gray-600">Add tags to selected tools</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setOperationType('remove')}
                                    className={classNames(
                                        'flex items-center gap-3 p-4 rounded-lg border-2 transition-colors',
                                        operationType === 'remove'
                                            ? 'border-red-500 bg-red-50 text-red-700'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                    )}
                                >
                                    <MinusIcon className="w-5 h-5" />
                                    <div className="text-left">
                                        <div className="font-medium">Remove Tags</div>
                                        <div className="text-sm text-gray-600">Remove tags from selected tools</div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Tag Selection */}
                        <div>
                            <MultiSelect
                                options={tagOptions}
                                selectedIds={selectedTagIds}
                                onSelectionChange={setSelectedTagIds}
                                label={`Tags to ${operationType}`}
                                description={`Select the tags you want to ${operationType} ${operationType === 'assign' ? 'to' : 'from'} the selected tools`}
                                placeholder="Choose tags..."
                                searchable={true}
                                required={true}
                                error={error && selectedTagIds.length === 0 ? error : undefined}
                            />
                        </div>

                        {/* Selected Tools Preview */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-3">
                                Selected Tools ({toolCount})
                            </h3>
                            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                                {selectedTools.map((tool) => (
                                    <div
                                        key={tool.id}
                                        className="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0"
                                    >
                                        <div className="flex items-center gap-3">
                                            <UserGroupIcon className="w-4 h-4 text-gray-400" />
                                            <div>
                                                <div className="font-medium text-sm">{tool.name}</div>
                                                <div className="text-xs text-gray-500">{tool.slug}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={classNames(
                                                'px-2 py-1 text-xs rounded',
                                                tool.isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            )}>
                                                {tool.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {tool.tagCount} tags
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Preview */}
                {step === 'preview' && preview && (
                    <div className="space-y-6">
                        {/* Summary */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-medium text-gray-900 mb-3">Operation Summary</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-blue-600">
                                        {preview.summary.totalTools}
                                    </div>
                                    <div className="text-sm text-gray-600">Tools</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-purple-600">
                                        {selectedTagCount}
                                    </div>
                                    <div className="text-sm text-gray-600">Tags</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-green-600">
                                        {preview.summary.newRelationships}
                                    </div>
                                    <div className="text-sm text-gray-600">Added</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-red-600">
                                        {preview.summary.removedRelationships}
                                    </div>
                                    <div className="text-sm text-gray-600">Removed</div>
                                </div>
                            </div>
                        </div>

                        {/* Warnings */}
                        {preview.warnings.length > 0 && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
                                    <h3 className="font-medium text-amber-800">Warnings</h3>
                                </div>
                                <ul className="space-y-1">
                                    {preview.warnings.map((warning, index) => (
                                        <li key={index} className="text-sm text-amber-700">
                                            • {warning}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Tool Changes Details */}
                        <div>
                            <h3 className="font-medium text-gray-900 mb-3">Changes by Tool</h3>
                            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                                {preview.toolsToUpdate.map((toolUpdate) => {
                                    const hasChanges = toolUpdate.addedTags.length > 0 || toolUpdate.removedTags.length > 0;

                                    if (!hasChanges) return null;

                                    return (
                                        <div
                                            key={toolUpdate.id}
                                            className="p-3 border-b border-gray-100 last:border-b-0"
                                        >
                                            <div className="font-medium text-sm mb-2">{toolUpdate.name}</div>

                                            {toolUpdate.addedTags.length > 0 && (
                                                <div className="mb-1">
                                                    <span className="text-xs text-green-600 font-medium">Adding: </span>
                                                    <span className="text-xs text-gray-600">
                                                        {toolUpdate.addedTags.length} tag{toolUpdate.addedTags.length !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            )}

                                            {toolUpdate.removedTags.length > 0 && (
                                                <div>
                                                    <span className="text-xs text-red-600 font-medium">Removing: </span>
                                                    <span className="text-xs text-gray-600">
                                                        {toolUpdate.removedTags.length} tag{toolUpdate.removedTags.length !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Executing */}
                {step === 'executing' && (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <Loading size="lg" />
                        <div className="text-center">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Executing Operation...
                            </h3>
                            <p className="text-gray-600">
                                Updating {toolCount} tool{toolCount !== 1 ? 's' : ''} with {selectedTagCount} tag{selectedTagCount !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                )}

                {/* Step 4: Results */}
                {step === 'results' && result && (
                    <div className="space-y-6">
                        {/* Result Status */}
                        <div className={classNames(
                            'rounded-lg p-4 text-center',
                            result.success
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-red-50 border border-red-200'
                        )}>
                            <div className="flex items-center justify-center mb-3">
                                {result.success ? (
                                    <CheckCircleIcon className="w-12 h-12 text-green-600" />
                                ) : (
                                    <ExclamationTriangleIcon className="w-12 h-12 text-red-600" />
                                )}
                            </div>
                            <h3 className={classNames(
                                'text-lg font-medium mb-2',
                                result.success ? 'text-green-800' : 'text-red-800'
                            )}>
                                {result.success ? 'Operation Completed Successfully' : 'Operation Failed'}
                            </h3>

                            {result.success && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                                    <div>
                                        <div className="text-2xl font-bold text-green-600">
                                            {result.totalChanges}
                                        </div>
                                        <div className="text-sm text-green-700">Total Changes</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-blue-600">
                                            {result.toolsAffected}
                                        </div>
                                        <div className="text-sm text-blue-700">Tools Updated</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-purple-600">
                                            {result.tagsAffected}
                                        </div>
                                        <div className="text-sm text-purple-700">Tags Involved</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Errors */}
                        {result.errors.length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <h4 className="font-medium text-red-800 mb-2">Errors</h4>
                                <ul className="space-y-1">
                                    {result.errors.map((error, index) => (
                                        <li key={index} className="text-sm text-red-700">
                                            • {error}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Warnings */}
                        {result.warnings.length > 0 && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <h4 className="font-medium text-amber-800 mb-2">Warnings</h4>
                                <ul className="space-y-1">
                                    {result.warnings.map((warning, index) => (
                                        <li key={index} className="text-sm text-amber-700">
                                            • {warning}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* General Error */}
                {error && step !== 'select' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-700" role="alert">
                            {error}
                        </p>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {step !== 'select' && step !== 'executing' && step !== 'results' && (
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            disabled={isLoading}
                        >
                            Back
                        </Button>
                    )}

                    {step === 'results' && (
                        <Button
                            variant="outline"
                            onClick={handleReset}
                        >
                            Start New Operation
                        </Button>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading && step === 'executing'}
                    >
                        {step === 'results' ? 'Close' : 'Cancel'}
                    </Button>

                    {step === 'select' && (
                        <Button
                            onClick={handlePreviewOperation}
                            disabled={selectedTagIds.length === 0 || isLoading}
                            isLoading={isLoading}
                        >
                            Preview Changes
                        </Button>
                    )}

                    {step === 'preview' && (
                        <Button
                            onClick={handleExecuteOperation}
                            disabled={isLoading}
                            variant={preview?.requiresConfirmation ? 'danger' : 'primary'}
                        >
                            {preview?.requiresConfirmation ? 'Confirm & Execute' : 'Execute Operation'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
} 