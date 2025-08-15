'use client'

import { IconShoppingBag, IconTools, IconClock } from '@tabler/icons-react'

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="ml-64"> {/* Account for left sidebar */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Coming Soon Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-accent-primary/10 rounded-full mb-6">
              <IconShoppingBag className="w-10 h-10 text-accent-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Marketplace Coming Soon
            </h1>
            <p className="text-xl text-muted max-w-2xl mx-auto">
              We're building an amazing marketplace for car enthusiasts to buy, sell, and trade vehicles and parts.
            </p>
          </div>

          {/* Features Preview */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6 bg-card-background border border-card-border rounded-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-accent-primary/10 rounded-lg mb-4">
                <IconShoppingBag className="w-6 h-6 text-accent-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Buy & Sell</h3>
              <p className="text-muted">
                List your vehicles and parts for sale, or browse listings from other enthusiasts.
              </p>
            </div>

            <div className="text-center p-6 bg-card-background border border-card-border rounded-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-accent-primary/10 rounded-lg mb-4">
                <IconTools className="w-6 h-6 text-accent-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Parts & Mods</h3>
              <p className="text-muted">
                Find rare parts, aftermarket mods, and performance upgrades for your build.
              </p>
            </div>

            <div className="text-center p-6 bg-card-background border border-card-border rounded-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-accent-primary/10 rounded-lg mb-4">
                <IconClock className="w-6 h-6 text-accent-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Coming Soon</h3>
              <p className="text-muted">
                We're working hard to bring you the best car marketplace experience.
              </p>
            </div>
          </div>

          {/* Progress Section */}
          <div className="bg-card-background border border-card-border rounded-lg p-8">
            <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">
              What We're Building
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-foreground">User authentication and profiles</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-foreground">Car garage management</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-foreground">Social features and following</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-muted">Marketplace listings and search</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="text-muted">Payment processing and transactions</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="text-muted">Messaging and negotiations</span>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <p className="text-muted mb-4">
              Want to be notified when the marketplace launches?
            </p>
            <button className="px-6 py-3 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors">
              Get Notified
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 