"use client";

import { useRef, useState } from 'react';
import { DocumentArrowUpIcon, DocumentCheckIcon } from '@heroicons/react/24/outline';

interface ReportUploaderProps {
    onSelect: (file: File | null) => void;
    existingFileName?: string | null;
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ReportUploader({ onSelect, existingFileName }: ReportUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0] ?? null;
        if (selected && selected.type !== 'application/pdf') {
            setError('Only PDF files are accepted.');
            setFile(null);
            onSelect(null);
            return;
        }
        setError(null);
        setFile(selected);
        onSelect(selected);
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dyno report (PDF)</label>
            <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={handleChange} />
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="w-full flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-3 text-sm text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-colors"
            >
                {file ? <DocumentCheckIcon className="h-5 w-5 shrink-0 text-green-600" /> : <DocumentArrowUpIcon className="h-5 w-5 shrink-0 text-gray-400" />}
                {file ? (
                    <span className="min-w-0 truncate text-left">{file.name} · {formatBytes(file.size)}</span>
                ) : existingFileName ? (
                    <>
                        <span className="min-w-0 truncate text-left">{existingFileName}</span>
                        <span className="shrink-0 text-gray-400">— click to replace</span>
                    </>
                ) : (
                    <span className="min-w-0 truncate text-left">Click to choose a PDF</span>
                )}
            </button>
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}
