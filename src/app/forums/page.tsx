'use client'

import { useState, useEffect } from 'react'
import { IconMessageCircle, IconClock, IconPin, IconFlame, IconSearch, IconHeart, IconPlus, IconStar, IconStarFilled } from '@tabler/icons-react'
import { useForums } from '@/lib/forums'
import { useBrandFollows } from '@/lib/brand-follows'
import { useSession } from '@supabase/auth-helpers-react';
import CreatePostModal from '@/components/CreatePostModal'
import ForumPostDetail from '@/components/ForumPostDetail'

// All popular car brands in alphabetical order
const ALL_BRANDS = [
  'Acura',
  'Alfa Romeo',
  'Aston Martin',
  'Audi',
  'Bentley',
  'BMW',
  'Buick',
  'Cadillac',
  'Chevrolet',
  'Chrysler',
  'Citroën',
  'Dodge',
  'Ferrari',
  'Fiat',
  'Ford',
  'Genesis',
  'GMC',
  'Honda',
  'Hyundai',
  'Infiniti',
  'Jaguar',
  'Jeep',
  'Kia',
  'Lamborghini',
  'Land Rover',
  'Lexus',
  'Lincoln',
  'Lotus',
  'Maserati',
  'Mazda',
  'McLaren',
  'Mercedes-Benz',
  'MINI',
  'Mitsubishi',
  'Nissan',
  'Oldsmobile',
  'Peugeot',
  'Pontiac',
  'Porsche',
  'Ram',
  'Renault',
  'Rolls-Royce',
  'Saab',
  'Saturn',
  'Scion',
  'Seat',
  'Škoda',
  'Smart',
  'Subaru',
  'Suzuki',
  'Tesla',
  'Toyota',
  'Volkswagen',
  'Volvo'
]

export default function ForumsPage() {
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [showPostDetail, setShowPostDetail] = useState(false)

  const { posts, isLoading, error, fetchPosts } = useForums()
  const { followedBrands, followBrand, unfollowBrand, isFollowingBrand } = useBrandFollows()
  const session = useSession()

  useEffect(() => {
    fetchPosts(selectedBrand || undefined)
  }, [selectedBrand, fetchPosts])

  // Filter brands based on search query
  const filteredBrands = ALL_BRANDS.filter(brand =>
    brand.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Separate followed and unfollowed brands
  const followedBrandsList = filteredBrands.filter(brand => isFollowingBrand(brand))
  const unfollowedBrandsList = filteredBrands.filter(brand => !isFollowingBrand(brand))

  // Sort posts to show followed brands first
  const sortedPosts = [...posts].sort((a, b) => {
    const aIsFollowed = isFollowingBrand(a.brand)
    const bIsFollowed = isFollowingBrand(b.brand)
    
    if (aIsFollowed && !bIsFollowed) return -1
    if (!aIsFollowed && bIsFollowed) return 1
    
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const handleBrandSelect = (brand: string) => {
    setSelectedBrand(selectedBrand === brand ? null : brand)
  }

  const handlePostClick = (postId: string) => {
    setSelectedPostId(postId)
    setShowPostDetail(true)
  }

  const closePostDetail = () => {
    setShowPostDetail(false)
    setSelectedPostId(null)
  }

  const handleBrandFollow = async (brandName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (isFollowingBrand(brandName)) {
      await unfollowBrand(brandName)
    } else {
      await followBrand(brandName)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="ml-64"> {/* Account for left sidebar */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-muted font-medium">Loading forums...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="ml-64"> {/* Account for left sidebar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="content-card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-foreground">Brands</h2>
                  {session?.user && (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="button-primary"
                    >
                      <IconPlus size={20} />
                      New Post
                    </button>
                  )}
                </div>

              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <IconSearch size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    placeholder="Search brands..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-card-border rounded-lg bg-card-background text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  />
                </div>
              </div>

              {/* Favorite Brands Section */}
              {followedBrandsList.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <IconStarFilled size={16} className="text-accent-primary" />
                    Favorite Brands
                  </h3>
                  <div className="space-y-2">
                    {followedBrandsList.map((brand) => (
                      <div
                        key={brand}
                        onClick={() => handleBrandSelect(brand)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 cursor-pointer ${
                          selectedBrand === brand
                            ? 'bg-accent-primary text-white'
                            : 'bg-card-background hover:bg-card-hover text-foreground'
                        }`}
                      >
                        <span className="font-medium">{brand}</span>
                        <div
                          onClick={(e) => {
                            e.stopPropagation()
                            handleBrandFollow(brand, e)
                          }}
                          className="text-accent-primary hover:text-accent-primary/80 cursor-pointer"
                        >
                          <IconStarFilled size={16} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Brands Section */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">All Brands</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {unfollowedBrandsList.map((brand) => (
                    <div
                      key={brand}
                      onClick={() => handleBrandSelect(brand)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 cursor-pointer ${
                        selectedBrand === brand
                          ? 'bg-accent-primary text-white'
                          : 'bg-card-background hover:bg-card-hover text-foreground'
                      }`}
                    >
                      <span className="font-medium">{brand}</span>
                      <div
                        onClick={(e) => {
                          e.stopPropagation()
                          handleBrandFollow(brand, e)
                        }}
                        className="text-muted hover:text-accent-primary cursor-pointer"
                      >
                        <IconStar size={16} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="content-card">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-foreground">
                  {selectedBrand ? `${selectedBrand} Forum` : 'All Posts'}
                </h1>
                {session?.user && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="button-primary"
                  >
                    <IconPlus size={20} />
                    New Post
                  </button>
                )}
              </div>

              {error && (
                <div className="text-red-500 mb-4">Error loading posts: {error}</div>
              )}

              {sortedPosts.length === 0 ? (
                <div className="text-center py-12">
                  <IconMessageCircle size={48} className="text-muted mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No posts yet</h3>
                  <p className="text-muted mb-4">
                    {selectedBrand 
                      ? `No posts in the ${selectedBrand} forum yet.` 
                      : 'No posts have been created yet.'
                    }
                  </p>
                  {session?.user && (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="button-primary"
                    >
                      <IconPlus size={20} />
                      Create First Post
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedPosts.map((post) => (
                    <div
                      key={post.id}
                      className="content-card hover-lift cursor-pointer"
                      onClick={() => handlePostClick(post.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-foreground">
                              {post.title}
                            </h3>
                            {isFollowingBrand(post.brand) && (
                              <IconStarFilled size={16} className="text-accent-primary" />
                            )}
                          </div>
                          <p className="text-muted text-sm font-medium mb-2">
                            in {post.brand} • {new Date(post.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-muted">{post.content.substring(0, 200)}...</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted">
                          <div className="flex items-center gap-1">
                            <IconMessageCircle size={16} />
                            <span>{post.replies_count || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <IconClock size={16} />
                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <CreatePostModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          selectedBrand={selectedBrand || undefined}
        />
      )}

      {/* Post Detail Modal */}
      {showPostDetail && selectedPostId && (
        <div className="modal-overlay">
          <div className="modal-content w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <ForumPostDetail
              postId={selectedPostId}
              onBack={closePostDetail}
            />
          </div>
        </div>
      )}
    </div>
  )
} 