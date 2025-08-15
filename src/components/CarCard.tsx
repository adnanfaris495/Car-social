import Image from 'next/image';
import Link from 'next/link';

type CarCardProps = {
  id: string;
  make: string;
  model: string;
  year: number;
  imageUrl: string;
  mods: string[];
};

export default function CarCard({
  id,
  make,
  model,
  year,
  imageUrl,
  mods,
}: CarCardProps) {
  return (
    <article className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 hover:border-red-500 transition-colors">
      <Link href={`/garage/${id}`}>
        {/* Car Image */}
        <div className="relative w-full h-48">
          <Image
            src={imageUrl}
            alt={`${year} ${make} ${model}`}
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        {/* Car Info */}
        <div className="p-4">
          <h3 className="text-xl font-bold text-white mb-1">
            {year} {make} {model}
          </h3>

          {/* Mods List */}
          <div className="mt-2">
            <h4 className="text-sm font-medium text-zinc-400 mb-1">Modifications:</h4>
            <div className="flex flex-wrap gap-2">
              {mods.map((mod) => (
                <span
                  key={mod}
                  className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded-full"
                >
                  {mod}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
} 