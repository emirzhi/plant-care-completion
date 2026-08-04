import Image from "next/image";

export default function PlantsCard({ plant }) {
    return (
        <main className="overflow-hidden rounded-2xl border border-gray-200 bg-white hover:shadow-lg">
            <div className="relative h-96 overflow-hidden">
                {plant.image_url ? (
                    <Image
                        src={plant.image_url}
                        alt={plant.species_scientific || "Plant Image"}
                        fill
                        className="object-cover"
                        sizes="100vw"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center bg-gray-100">
                        <span className="text-sm text-gray-400">
                            No Image Available
                        </span>
                    </div>
                )}
            </div>

            <div className="space-y-2 p-5">
                <div>
                    <p className="text-sm italic text-green-600">
                        {plant.species_common}
                    </p>
                </div>

                <p className="text-md font-bold text-gray-600">
                    {plant.species_scientific}
                </p>
            </div>
        </main>
    );
}