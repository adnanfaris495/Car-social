'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/supabase/types';

export default function AddCarPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mods, setMods] = useState<string[]>([]);
  const [newMod, setNewMod] = useState('');
  const [error, setError] = useState('');
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleAddMod = () => {
    if (newMod.trim()) {
      setMods([...mods, newMod.trim()]);
      setNewMod('');
    }
  };

  const handleRemoveMod = (index: number) => {
    setMods(mods.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const formData = new FormData(e.currentTarget);
      const carData = {
        make: formData.get('make') as string,
        model: formData.get('model') as string,
        year: Number(formData.get('year')),
        image_url: formData.get('imageUrl') as string,
        mods: mods,
      };

      const { error: supabaseError } = await supabase
        .from('cars')
        .insert([carData]);

      if (supabaseError) throw supabaseError;

      router.refresh(); // Refresh the page to show new data
      router.push('/garage');
    } catch (err) {
      console.error('Error adding car:', err);
      setError('Failed to add car. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navigation />
      
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="page-heading text-white">Add New Car</h1>
          <p className="text-zinc-400 mt-2">Share your ride with the community</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="make" className="block text-sm font-medium text-zinc-300 mb-2">
                Make
              </label>
              <input
                type="text"
                id="make"
                name="make"
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="e.g., Toyota"
              />
            </div>

            <div>
              <label htmlFor="model" className="block text-sm font-medium text-zinc-300 mb-2">
                Model
              </label>
              <input
                type="text"
                id="model"
                name="model"
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="e.g., Supra"
              />
            </div>
          </div>

          {/* Year and Image */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-zinc-300 mb-2">
                Year
              </label>
              <input
                type="number"
                id="year"
                name="year"
                required
                min="1886"
                max={new Date().getFullYear() + 1}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="e.g., 1998"
              />
            </div>

            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-zinc-300 mb-2">
                Image URL
              </label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Modifications */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Modifications
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newMod}
                onChange={(e) => setNewMod(e.target.value)}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="e.g., HKS Turbo"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMod())}
              />
              <button
                type="button"
                onClick={handleAddMod}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {mods.map((mod, index) => (
                <span
                  key={index}
                  className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full flex items-center gap-2"
                >
                  {mod}
                  <button
                    type="button"
                    onClick={() => handleRemoveMod(index)}
                    className="text-zinc-400 hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-medium disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Car'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
} 