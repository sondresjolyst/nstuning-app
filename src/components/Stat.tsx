import type { ReactNode } from 'react';

export const statTileClass = 'rounded-xl border border-gray-200 p-4';

export function StatLabel({ children }: { children: ReactNode }) {
    return <p className="text-xs uppercase tracking-wide text-gray-500">{children}</p>;
}

export function StatValue({ value, unit }: { value: number; unit: string }) {
    return <p className="mt-1 text-2xl font-extrabold text-gray-900">{value} <span className="text-sm font-medium text-gray-500">{unit}</span></p>;
}

export default function Stat({ label, before, after, unit }: { label: string; before?: number | null; after?: number | null; unit: string }) {
    if (after == null) return null;
    const gain = before != null ? after - before : null;
    return (
        <div className={statTileClass}>
            <StatLabel>{label}</StatLabel>
            <StatValue value={after} unit={unit} />
            {before != null && (
                <p className="text-xs text-gray-500 mt-0.5">
                    from {before} {unit}{gain != null && gain > 0 ? ` · +${gain}` : ''}
                </p>
            )}
        </div>
    );
}
