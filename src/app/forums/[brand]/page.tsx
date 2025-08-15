import Link from 'next/link'
import { notFound } from 'next/navigation'

const validBrands = ['audi', 'bmw', 'mercedes', 'porsche', 'volkswagen']

// Mock data for development
const mockPosts = {
  bmw: [
    {
      id: '1',
      title: 'My Experience with the New M3',
      content: 'I recently had the chance to test drive the new BMW M3, and I have to say, it\'s absolutely incredible. The power delivery is smooth, and the handling is precise.',
      created_at: new Date().toISOString(),
      comment_count: 5,
      likes: 12,
      profiles: { username: 'BMWEnthusiast' }
    },
    {
      id: '2',
      title: 'Maintenance Tips for Your BMW',
      content: 'Here are some essential maintenance tips that every BMW owner should know. Regular oil changes, tire rotations, and brake inspections are crucial.',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      comment_count: 3,
      likes: 8,
      profiles: { username: 'CarExpert' }
    }
  ],
  audi: [
    {
      id: '1',
      title: 'RS6 Avant Review',
      content: 'The RS6 Avant is the perfect combination of performance and practicality. Here\'s my full review after 6 months of ownership.',
      created_at: new Date().toISOString(),
      comment_count: 7,
      likes: 15,
      profiles: { username: 'AudiLover' }
    }
  ],
  mercedes: [
    {
      id: '1',
      title: 'AMG GT Black Series Experience',
      content: 'Track day with the AMG GT Black Series. This car is an absolute monster on the track!',
      created_at: new Date().toISOString(),
      comment_count: 9,
      likes: 20,
      profiles: { username: 'AMGMaster' }
    }
  ],
  porsche: [
    {
      id: '1',
      title: '911 GT3 vs GT3 RS Comparison',
      content: 'Having driven both the GT3 and GT3 RS back to back, here are my thoughts on which one you should choose.',
      created_at: new Date().toISOString(),
      comment_count: 12,
      likes: 25,
      profiles: { username: 'PorschePro' }
    }
  ],
  volkswagen: [
    {
      id: '1',
      title: 'Golf R Review',
      content: 'The new Golf R is a daily driver dream. Here\'s why it might be the perfect all-around car.',
      created_at: new Date().toISOString(),
      comment_count: 4,
      likes: 10,
      profiles: { username: 'VWFanatic' }
    }
  ]
}

export default function BrandForumPage({
  params: { brand },
}: {
  params: { brand: string }
}) {
  if (!validBrands.includes(brand)) {
    notFound()
  }

  const posts = mockPosts[brand as keyof typeof mockPosts] || []
  const brandName = brand.charAt(0).toUpperCase() + brand.slice(1)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="page-heading">{brandName} Forum</h1>
        <Link
          href={`/forums/${brand}/new`}
                      className="button-primary"
        >
          Create Post
        </Link>
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-900">{post.title}</h2>
                <p className="text-gray-600">
                  Posted by {post.profiles?.username || 'Anonymous'}
                </p>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(post.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-gray-700 line-clamp-3">{post.content}</p>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">💬 {post.comment_count || 0}</span>
                <span className="text-gray-600">👍 {post.likes || 0}</span>
              </div>
              <Link
                href={`/forums/${brand}/posts/${post.id}`}
                className="text-accent-primary hover:text-accent-primary/80"
              >
                Read more →
              </Link>
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">No posts yet. Be the first to post!</p>
          </div>
        )}
      </div>
    </div>
  )
} 