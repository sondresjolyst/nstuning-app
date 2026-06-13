import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
            <span className="text-6xl font-black text-gray-900">404</span>
            <p className="text-lg text-gray-600">This page does not exist.</p>
            <Link href="/" className="font-semibold text-gray-900 underline">
                Go home
            </Link>
        </div>
    );
}
