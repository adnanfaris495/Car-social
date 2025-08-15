'use client'

// import { useTheme } from '@/lib/theme'

export default function TestEffectsPage() {
  // const { theme, toggleTheme } = useTheme()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Visual Effects Test Page</h1>
        {/*
        <button
          onClick={toggleTheme}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-400 transition-colors"
        >
          Current Theme: {theme}
        </button>
        */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Brushed Metal Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Brushed Metal Effects</h2>
          <div className="space-y-4">
            <div className="brushed-metal-card">
              <h3 className="text-xl font-bold mb-2">Brushed Metal Card</h3>
              <p>This card uses the brushed metal effect with enhanced visibility.</p>
            </div>
            
            <div className="brushed-metal-header">
              <h3 className="text-xl font-bold">Brushed Metal Header</h3>
              <p>This header uses the brushed metal effect.</p>
            </div>
            
            <div className="brushed-metal-section">
              <h3 className="text-xl font-bold mb-2">Brushed Metal Section</h3>
              <p>This section uses the brushed metal effect with more padding.</p>
            </div>
            
            <div className="brushed-metal-tile">
              <h3 className="text-xl font-bold mb-2">Brushed Metal Tile</h3>
              <p>This tile uses the brushed metal effect with hover animations.</p>
            </div>
          </div>
        </div>

        {/* Carbon Fiber Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Carbon Fiber Effects</h2>
          <div className="space-y-4">
            <div className="carbon-fiber-card p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-2 text-white">Carbon Fiber Card</h3>
              <p className="text-zinc-300">This card uses the carbon fiber effect.</p>
            </div>
            
            <div className="carbon-fiber-header p-4 rounded-lg">
              <h3 className="text-xl font-bold text-white">Carbon Fiber Header</h3>
              <p className="text-zinc-300">This header uses the carbon fiber effect.</p>
            </div>
            
            <div className="carbon-fiber-nav p-4 rounded-lg">
              <h3 className="text-xl font-bold text-white">Carbon Fiber Nav</h3>
              <p className="text-zinc-300">This nav uses the carbon fiber effect.</p>
            </div>
            
            <div className="carbon-fiber-divider p-4 rounded-lg">
              <h3 className="text-xl font-bold text-white">Carbon Fiber Divider</h3>
              <p className="text-zinc-300">This divider uses the carbon fiber effect.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Effect Comparison</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="brushed-metal-card">
            <h3 className="text-xl font-bold mb-2">Light Mode - Brushed Metal</h3>
            <p>This should show a subtle brushed aluminum texture in light mode.</p>
          </div>
          
          <div className="carbon-fiber-card p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-2 text-white">Dark Mode - Carbon Fiber</h3>
            <p className="text-zinc-300">This should show a carbon fiber texture in dark mode.</p>
          </div>
          
          <div className="brushed-metal-alt p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-2">Alternative Brushed Metal</h3>
            <p>This uses a different gradient pattern for the brushed metal effect.</p>
          </div>
        </div>
      </div>
    </div>
  )
} 