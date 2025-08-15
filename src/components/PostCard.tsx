import Image from 'next/image';
import Link from 'next/link';

type PostCardProps = {
  id: string;
  username: string;
  userAvatar: string;
  imageUrl: string;
  caption: string;
  likes: number;
  comments: number;
  tags: string[];
  carInfo?: {
    make: string;
    model: string;
    year: number;
  };
};

export default function PostCard({
  id,
  username,
  userAvatar,
  imageUrl,
  caption,
  likes,
  comments,
  tags,
  carInfo,
}: PostCardProps) {
  return (
    <article className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800">
      {/* Header */}
      <header className="p-4 flex items-center space-x-3">
        <div className="relative w-10 h-10 rounded-full overflow-hidden">
          <Image
            src={userAvatar}
            alt={username}
            width={40}
            height={40}
            className="object-cover"
            unoptimized
          />
        </div>
        <Link href={`/profile/${username}`} className="font-medium text-white hover:text-red-500">
          {username}
        </Link>
      </header>

      {/* Image */}
      <div className="relative w-full h-[400px]">
        <Image
          src={imageUrl}
          alt={caption}
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Actions */}
        <div className="flex items-center space-x-4 mb-3">
          <button className="text-red-500 hover:text-red-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          <button className="text-zinc-400 hover:text-zinc-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
        </div>

        {/* Stats */}
        <div className="flex space-x-4 text-sm text-zinc-400 mb-2">
          <span>{likes} likes</span>
          <span>{comments} comments</span>
        </div>

        {/* Car Info */}
        {carInfo && (
          <div className="text-sm text-zinc-400 mb-2">
            🚗 {carInfo.year} {carInfo.make} {carInfo.model}
          </div>
        )}

        {/* Caption */}
        <p className="text-white mb-2">
          <Link href={`/profile/${username}`} className="font-medium hover:text-red-500 mr-2">
            {username}
          </Link>
          {caption}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/tags/${tag}`}
              className="text-sm text-red-500 hover:text-red-400"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
} 