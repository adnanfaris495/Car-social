'use client'

// import { useTheme } from '@/lib/theme'

export default function TestBrushedMetalPage() {
  // const { theme, toggleTheme } = useTheme()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Brushed Metal Test Page</h1>
        {/*
        <button
          onClick={toggleTheme}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-400 transition-colors"
        >
          Current Theme: {theme}
        </button>
        */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Test Card 1 */}
        <div className="brushed-metal-card">
          <h3 className="text-xl font-bold mb-2">Test Card 1</h3>
          <p className="text-gray-600">This is a test card with brushed metal effect.</p>
        </div>

        {/* Test Card 2 */}
        <div className="brushed-metal-card">
          <h3 className="text-xl font-bold mb-2">Test Card 2</h3>
          <p className="text-gray-600">Another test card with brushed metal effect.</p>
        </div>

        {/* Test Card 3 */}
        <div className="brushed-metal-card">
          <h3 className="text-xl font-bold mb-2">Test Card 3</h3>
          <p className="text-gray-600">Third test card with brushed metal effect.</p>
        </div>

        {/* Test Header */}
        <div className="brushed-metal-header col-span-full">
          <h2 className="text-2xl font-bold">Test Header with Brushed Metal</h2>
          <p className="text-gray-600 mt-2">This header should have the brushed metal effect.</p>
        </div>

        {/* Test Section */}
        <div className="brushed-metal-section col-span-full">
          <h2 className="text-2xl font-bold mb-4">Test Section</h2>
          <p className="text-gray-600 mb-4">This section should have the brushed metal effect.</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="brushed-metal-tile">
              <h4 className="font-bold">Tile 1</h4>
              <p className="text-sm text-gray-600">Small tile with brushed metal</p>
            </div>
            <div className="brushed-metal-tile">
              <h4 className="font-bold">Tile 2</h4>
              <p className="text-sm text-gray-600">Another small tile</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 p-6 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Instructions</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Switch to light mode to see the brushed metal effect</li>
          <li>The brushed metal effect uses a subtle gradient and texture overlay</li>
          <li>Hover over the cards to see the lift effect</li>
          <li>The effect should be most visible in light mode</li>
        </ul>
      </div>
    </div>
  )
} 