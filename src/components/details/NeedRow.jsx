export default function NeedRow({ key, label, notes, icon: Icon }) {
    return (
        <div className="flex rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:bg-gray-100">
            <div className="rounded-full self-center me-4 bg-emerald-400/20 content-center pt-3 pb-1.5 px-3 text-white">
                <Icon size={20} className="mb-2 text-gray-600" />
            </div>
            <div className="flex flex-col gap-1">
                <span className="text-lg font-semibold text-gray-800">{label}</span>
                <span className="font-sm text-gray-600">{notes}</span>
            </div>
        </div>
    );
}