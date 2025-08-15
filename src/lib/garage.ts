import { create } from 'zustand'
import { supabase } from './supabase'

export interface Car {
  id: string
  user_id: string
  make: string
  model: string
  year: number
  image_url: string | null
  mods: string[]
  created_at: string
  updated_at?: string
}

interface GarageState {
  cars: Car[]
  userCars: Car[]
  isLoading: boolean
  error: string | null
  fetchCars: () => Promise<void>
  fetchUserCars: (userId: string) => Promise<void>
  addCar: (car: Omit<Car, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateCar: (id: string, updates: Partial<Car>) => Promise<void>
  deleteCar: (id: string) => Promise<void>
}

export const useGarage = create<GarageState>((set) => ({
  cars: [],
  userCars: [],
  isLoading: false,
  error: null,

  fetchCars: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      set({ cars: data || [], isLoading: false })
    } catch (error) {
      console.error('Error fetching cars:', error)
      set({ error: 'Failed to fetch cars', isLoading: false })
    }
  },

  fetchUserCars: async (userId: string) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      set({ userCars: data || [], isLoading: false })
    } catch (error) {
      console.error('Error fetching user cars:', error)
      set({ error: 'Failed to fetch user cars', isLoading: false })
    }
  },

  addCar: async (car) => {
    set({ isLoading: true, error: null })
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      const { data, error } = await supabase
        .from('cars')
        .insert([{ ...car, user_id: userData.user.id }])
        .select()
        .single()

      if (error) throw error
      set((state) => ({
        cars: [data, ...state.cars],
        userCars: [data, ...state.userCars],
        isLoading: false
      }))
    } catch (error) {
      console.error('Error adding car:', error)
      set({ error: 'Failed to add car', isLoading: false })
      throw error
    }
  },

  updateCar: async (id, updates) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('cars')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      set((state) => ({
        cars: state.cars.map((car) => (car.id === id ? data : car)),
        userCars: state.userCars.map((car) => (car.id === id ? data : car)),
        isLoading: false
      }))
    } catch (error) {
      console.error('Error updating car:', error)
      set({ error: 'Failed to update car', isLoading: false })
      throw error
    }
  },

  deleteCar: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase.from('cars').delete().eq('id', id)
      if (error) throw error

      set((state) => ({
        cars: state.cars.filter((car) => car.id !== id),
        userCars: state.userCars.filter((car) => car.id !== id),
        isLoading: false
      }))
    } catch (error) {
      console.error('Error deleting car:', error)
      set({ error: 'Failed to delete car', isLoading: false })
      throw error
    }
  }
})) 