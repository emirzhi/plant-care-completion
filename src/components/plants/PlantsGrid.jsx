import Link from 'next/link';
import PlantsCard from './PlantsCard';

export default function PlantsGrid({ plants }) {
    if (!plants || plants.length === 0) {
        return <p>No plants available.</p>;
    }

    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {plants.map((plant) => (
                <Link
                    key={plant.id}
                    href={`/plants/${plant.id}`}
                    className="group"
                >
                    <PlantsCard plant={plant} />
                </Link>
            ))}
        </div>
    );
}