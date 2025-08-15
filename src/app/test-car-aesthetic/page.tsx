'use client'

// import { useTheme } from '@/lib/theme'

export default function TestCarAestheticPage() {
  // const { theme, toggleTheme } = useTheme()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Car-Inspired Aesthetic Test</h1>
        {/*
        <button
          onClick={toggleTheme}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-400 transition-colors"
        >
          Current Theme: {theme}
        </button>
        */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Brushed Metal / Carbon Fiber Cards */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-foreground">Garage Cards</h2>
          <div className="space-y-4">
            <div className="car-themed-card rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2 text-foreground">2023 BMW M3</h3>
              <p className="text-muted-foreground">Alpine White • Competition Package</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">by @bmwfan</span>
                <span className="text-red-500 font-semibold">$85,000</span>
              </div>
            </div>

            <div className="car-themed-card rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2 text-foreground">2022 Porsche 911 GT3</h3>
              <p className="text-muted-foreground">Shark Blue • Touring Package</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">by @porsche_lover</span>
                <span className="text-red-500 font-semibold">$185,000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Marketplace Tiles */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-foreground">Marketplace Tiles</h2>
          <div className="space-y-4">
            <div className="car-themed-tile rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2 text-foreground">Carbon Fiber Spoiler</h3>
              <p className="text-muted-foreground">Universal fit • High-quality carbon fiber</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">by @mods_king</span>
                <span className="text-red-500 font-semibold">$450</span>
              </div>
            </div>

            <div className="car-themed-tile rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2 text-foreground">LED Headlights</h3>
              <p className="text-muted-foreground">OEM-style replacement • Plug & play</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">by @lighting_pro</span>
                <span className="text-red-500 font-semibold">$320</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section Headers */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-foreground">Section Headers</h2>
          <div className="space-y-4">
            <div className="car-themed-header rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-foreground">Trending Garages</h3>
                <span className="text-sm text-muted-foreground">View All →</span>
              </div>
            </div>

            <div className="car-themed-header rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-foreground">Nearby Meets</h3>
                <span className="text-sm text-muted-foreground">View All →</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Banners */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-foreground">Profile Banners</h2>
          <div className="space-y-4">
            <div className="car-themed-header rounded-lg p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-2xl">🏎️</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">@speed_demon</h3>
                  <p className="text-muted-foreground">Car enthusiast • 15 cars • 2.5k followers</p>
                </div>
              </div>
            </div>

            <div className="car-themed-header rounded-lg p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-2xl">🚗</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">@classic_collector</h3>
                  <p className="text-muted-foreground">Vintage cars • 8 cars • 1.2k followers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="mt-12 car-themed-section rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-foreground">Aesthetic Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">🟢 Light Mode - Brushed Metal</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Subtle vertical line texture</li>
              <li>• Light gray background (#f9f9f9)</li>
              <li>• Soft shadows and borders</li>
              <li>• Glossy overlay effect</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">⚫ Dark Mode - Glossy Carbon Fiber</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Diagonal weave pattern</li>
              <li>• Dark background (#111)</li>
              <li>• Deep shadows and contrast</li>
              <li>• Screen blend overlay</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 