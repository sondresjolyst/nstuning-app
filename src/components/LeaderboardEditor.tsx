"use client";

import { useState } from 'react';
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { SectionField, type SectionEditorProps } from '@sjolystinnovation/app-kit/sections';
import { TextInput } from '@sjolystinnovation/app-kit/ui';
import {
    DEFAULT_BOARD_LIMIT, LEADERBOARD_METRICS, LEADERBOARD_METRIC_IDS, MAX_BOARD_LIMIT, boardLimit, metricName, metricOf, normaliseBoards,
    type LeaderboardBoard, type StoredBoard,
} from '@/lib/leaderboard';
import type { LeaderboardSection } from '@/types/content';

const iconButton = 'p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30';

// Keeps what is typed, so the field can be cleared and retyped. A whole number in range is saved
// at once, and leaving the field clamps it, or puts back the saved limit when it is not a number.
function LimitInput({ limit, onChange }: { limit: number; onChange: (limit: number) => void }) {
    const [draft, setDraft] = useState(String(limit));
    const [shown, setShown] = useState(limit);
    if (limit !== shown) {
        setShown(limit);
        setDraft(String(limit));
    }
    return (
        <TextInput
            label="Runs shown"
            type="number"
            min={1}
            max={MAX_BOARD_LIMIT}
            value={draft}
            onChange={e => {
                setDraft(e.target.value);
                const n = Number(e.target.value);
                if (e.target.value !== '' && Number.isInteger(n) && n >= 1 && n <= MAX_BOARD_LIMIT) onChange(n);
            }}
            onBlur={() => {
                const next = draft.trim() === '' || !Number.isFinite(Number(draft)) ? limit : boardLimit(Number(draft));
                setDraft(String(next));
                if (next !== limit) onChange(next);
            }}
        />
    );
}

export default function LeaderboardEditor({ section, patch, strings }: SectionEditorProps<LeaderboardSection>) {
    const boards = normaliseBoards(section.boards);
    // An unknown stored metric stays as it is until the admin picks another one.
    const onChange = (next: StoredBoard[]) => patch({ boards: next as LeaderboardBoard[] });
    const update = (i: number, changes: Partial<StoredBoard>) => onChange(boards.map((b, j) => (j === i ? { ...b, ...changes } : b)));
    const move = (i: number, by: number) => {
        const next = [...boards];
        [next[i], next[i + by]] = [next[i + by], next[i]];
        onChange(next);
    };

    return (
        <div className="space-y-4">
            <SectionField label={strings.heading} value={section.heading} onChange={v => patch({ heading: v })} />
            <div>
                <p className="block text-sm font-medium text-gray-700 mb-1">Boards</p>
                <div className="space-y-3">
                    {boards.map((board, i) => (
                        <div key={i} role="group" aria-label={`Board ${i + 1}`} className="flex flex-wrap items-end gap-2 rounded-lg border border-gray-200 p-3">
                            <div className="flex-1 min-w-[10rem]">
                                <TextInput label="Title" value={board.title} onChange={e => update(i, { title: e.target.value })} />
                            </div>
                            <label className="min-w-0 max-w-full text-xs text-gray-600">
                                Metric
                                <select
                                    value={board.metric}
                                    onChange={e => update(i, { metric: e.target.value })}
                                    className="mt-1 block w-full max-w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                >
                                    {!metricOf(board.metric) && <option value={board.metric}>Unknown metric</option>}
                                    {LEADERBOARD_METRIC_IDS.map(id => (
                                        <option key={id} value={id}>{metricName(LEADERBOARD_METRICS[id])}</option>
                                    ))}
                                </select>
                            </label>
                            <div className="w-28">
                                <LimitInput limit={board.limit} onChange={limit => update(i, { limit })} />
                            </div>
                            <div className="flex items-center">
                                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} title="Move board up" className={iconButton}>
                                    <ArrowUpIcon className="h-4 w-4" />
                                </button>
                                <button type="button" onClick={() => move(i, 1)} disabled={i === boards.length - 1} title="Move board down" className={iconButton}>
                                    <ArrowDownIcon className="h-4 w-4" />
                                </button>
                                <button type="button" onClick={() => onChange(boards.filter((_, j) => j !== i))} title="Remove board" className="p-2 rounded-lg text-red-500 hover:bg-red-50">
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => onChange([...boards, { title: '', metric: 'hubPowerWhp', limit: DEFAULT_BOARD_LIMIT }])}
                        className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900"
                    >
                        <PlusIcon className="h-4 w-4" /> Add board
                    </button>
                </div>
            </div>
        </div>
    );
}
