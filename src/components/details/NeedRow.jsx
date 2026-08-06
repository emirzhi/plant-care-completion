export default function NeedRow({ key, label, notes }) {
    return (
        <div className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:bg-gray-100">
            <span className="text-lg font-semibold text-gray-800">{label}</span>
            <span className="font-sm text-gray-600">{notes}</span>
        </div>
    );
}