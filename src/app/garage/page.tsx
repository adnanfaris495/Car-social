'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { IconPlus, IconUser, IconCarGarage, IconShoppingBag, IconMessageCircle, IconCalendarEvent, IconSettings, IconTrash, IconEdit, IconChevronLeft, IconChevronRight, IconStar } from '@tabler/icons-react'
import { useSession } from '@supabase/auth-helpers-react';
import { supabase } from '@/lib/supabase'
import AddCarForm from '@/components/AddCarForm'
import CarDetailsDialog from '@/components/CarDetailsDialog'
import { getImageUrl } from '@/lib/utils'
import { ErrorHandler, handleAsyncError, handleAsyncSuccess } from '@/lib/error-handler'
import { PageLoader, CardLoader } from '@/components/LoadingSpinner'

interface Car {
  id: string
  user_id: string
  make: string
  model: string
  year: number
  image_url: string
  mods: string[]
  created_at: string
}

export default function GaragePage() {
  const [showAddCar, setShowAddCar] = useState(false)
  const [selectedCar, setSelectedCar] = useState<Car | null>(null)
  const [cars, setCars] = useState<Car[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentCarIndex, setCurrentCarIndex] = useState(0)
  const [favoriteCarId, setFavoriteCarId] = useState<string | null>(null)
  const [isSettingFavorite, setIsSettingFavorite] = useState(false)
  const router = useRouter()
  const session = useSession();
  const user = session?.user;

  useEffect(() => {
    if (session === undefined) return; // Wait for session to load
    if (!user) {
      // Don't redirect here - let middleware handle it
      return
    }

    const fetchCars = async () => {
      try {
        await handleAsyncError(
          async () => {
            const { data: cars, error } = await supabase
              .from('cars')
              .select('*')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })

            if (error) throw error
            setCars(cars || [])
            
            // Get user's favorite car
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('favorite_car_id')
              .eq('id', user.id)
              .single()
            
            if (!userError && userData) {
              setFavoriteCarId(userData.favorite_car_id)
            }
            
            setError(null)
          },
          'Garage'
        )
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load your cars')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCars()
  }, [user, router, session])

  const handleAddCar = async (car: Omit<Car, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) {
      ErrorHandler.showToast({ message: 'You must be logged in to add a car' }, 'Garage')
      return
    }

    try {
      const result = await handleAsyncSuccess(
        async () => {
      const { data, error } = await supabase
        .from('cars')
        .insert([{
          ...car,
          user_id: user.id,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

          if (error) throw error
          if (!data) throw new Error('No data returned from database')

      setCars(prev => [data, ...prev])
      setShowAddCar(false)
          return data
        },
        'Car added successfully!',
        'Garage'
      )
    } catch (error) {
      // Error is already handled by handleAsyncSuccess
      console.error('Error in handleAddCar:', error)
    }
  }

  const handleCarClick = (car: Car) => {
    setSelectedCar(car)
  }

  const handleCarUpdate = (updatedCar: Car) => {
    setCars(cars.map(car => car.id === updatedCar.id ? updatedCar : car))
  }

  const handleCarDelete = (carId: string) => {
    setCars(cars.filter(car => car.id !== carId))
    // Reset to first car if current car is deleted
    if (currentCarIndex >= cars.length - 1) {
      setCurrentCarIndex(Math.max(0, cars.length - 2))
    }
    // Clear favorite if deleted car was favorite
    if (favoriteCarId === carId) {
      setFavoriteCarId(null)
    }
  }

  const setFavoriteCar = async (carId: string) => {
    if (!user) return
    
    setIsSettingFavorite(true)
    try {
      await handleAsyncSuccess(
        async () => {
          const { error } = await supabase
            .from('users')
            .update({ favorite_car_id: carId })
            .eq('id', user.id)

          if (error) throw error
          
          setFavoriteCarId(carId)
          return { success: true }
        },
        'Car set as avatar successfully!',
        'Garage'
      )
    } catch (error) {
      console.error('Error setting favorite car:', error)
    } finally {
      setIsSettingFavorite(false)
    }
  }

  const nextCar = () => {
    setCurrentCarIndex((prev) => (prev + 1) % cars.length)
  }

  const prevCar = () => {
    setCurrentCarIndex((prev) => (prev - 1 + cars.length) % cars.length)
  }

  const currentCar = cars[currentCarIndex]

  // Don't render anything while checking auth state
  if (session === undefined) {
    return null
  }

  // If not logged in, redirect to login page
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="ml-64"> {/* Account for left sidebar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">My Garage</h1>
                <p className="text-muted font-medium">
                  {cars.length} {cars.length === 1 ? 'car' : 'cars'} in your collection
                </p>
              </div>
              <button
                onClick={() => setShowAddCar(true)}
                className="button-primary flex items-center gap-2"
              >
                <IconPlus size={20} />
                Add Car
              </button>
            </div>
          </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <PageLoader />
          </div>
        ) : error ? (
          <div className="content-card text-center py-12">
            <IconCarGarage size={64} className="text-muted mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Error Loading Garage</h2>
            <p className="text-muted mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="button-primary"
            >
              Try Again
            </button>
          </div>
        ) : cars.length === 0 ? (
          <div className="content-card text-center py-16">
            <div className="w-24 h-24 bg-accent-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <IconCarGarage size={48} className="text-accent-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Your Garage is Empty</h2>
            <p className="text-muted mb-8 max-w-md mx-auto">
              Start building your dream collection by adding your first car to the garage
            </p>
            <button
              onClick={() => setShowAddCar(true)}
              className="button-primary flex items-center gap-2 mx-auto"
            >
              <IconPlus size={20} />
              Add Your First Car
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Car Display Section */}
            <div className="content-card overflow-hidden">
              <div className="relative">
                {/* Car Image */}
                <div className="relative h-[70vh] min-h-[500px] max-h-[800px]">
                  <Image
                    src={getImageUrl('car', currentCar.image_url)}
                    alt={`${currentCar.year} ${currentCar.make} ${currentCar.model}`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 100vw"
                  />
                </div>

                {/* Navigation Arrows */}
                {cars.length > 1 && (
                  <>
                    <button
                      onClick={prevCar}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
                    >
                      <IconChevronLeft size={24} />
                    </button>
                    <button
                      onClick={nextCar}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
                    >
                      <IconChevronRight size={24} />
                    </button>
                  </>
                )}

                {/* Car Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-3xl font-bold text-white mb-2">
                        {currentCar.year} {currentCar.make} {currentCar.model}
                      </h3>
                      {currentCar.mods.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {currentCar.mods.slice(0, 3).map((mod, index) => (
                            <span
                              key={index}
                              className="text-sm bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full"
                            >
                              {mod}
                            </span>
                          ))}
                          {currentCar.mods.length > 3 && (
                            <span className="text-sm bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full">
                              +{currentCar.mods.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCarClick(currentCar)}
                        className="button-ghost bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => setFavoriteCar(currentCar.id)}
                        disabled={isSettingFavorite}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                          favoriteCarId === currentCar.id
                            ? 'bg-accent-primary text-white'
                            : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
                        }`}
                      >
                        <IconStar size={16} fill={favoriteCarId === currentCar.id ? 'currentColor' : 'none'} />
                        {favoriteCarId === currentCar.id ? 'Avatar' : 'Set as Avatar'}
                      </button>
                      <button
                        onClick={() => handleCarClick(currentCar)}
                        className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                      >
                        <IconEdit size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Car Counter */}
            {cars.length > 1 && (
              <div className="flex items-center justify-center gap-4">
                <span className="text-muted font-medium">
                  {currentCarIndex + 1} of {cars.length}
                </span>
                <div className="flex gap-2">
                  {cars.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentCarIndex(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentCarIndex
                          ? 'bg-accent-primary'
                          : 'bg-muted hover:bg-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {showAddCar && (
          <AddCarForm
            onSubmit={handleAddCar}
            onClose={() => setShowAddCar(false)}
          />
        )}

        {selectedCar && (
          <CarDetailsDialog
            car={selectedCar}
            isOpen={!!selectedCar}
            onClose={() => setSelectedCar(null)}
            onCarUpdated={handleCarUpdate}
            onCarDeleted={handleCarDelete}
          />
        )}
      </div>
    </div>
    </div>
  )
} 