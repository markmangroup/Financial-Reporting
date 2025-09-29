'use client'

import { useState, useEffect } from 'react'

interface BTCPrice {
  price: number
  change24h: number
  changePercent24h: number
  lastUpdated: string
}

export default function BTCDashboard() {
  const [btcData, setBtcData] = useState<BTCPrice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBTCPrice = async () => {
    try {
      setLoading(true)
      // Using CoinGecko API (free, no API key required)
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true')

      if (!response.ok) {
        throw new Error('Failed to fetch BTC price')
      }

      const data = await response.json()

      setBtcData({
        price: data.bitcoin.usd,
        change24h: 0, // CoinGecko doesn't provide absolute change, only percentage
        changePercent24h: data.bitcoin.usd_24h_change || 0,
        lastUpdated: new Date(data.bitcoin.last_updated_at * 1000).toLocaleString()
      })
      setError(null)
    } catch (err) {
      console.error('Error fetching BTC price:', err)
      setError('Failed to fetch BTC price data')
      // Fallback data for development
      setBtcData({
        price: 67500,
        change24h: 1250,
        changePercent24h: 1.89,
        lastUpdated: new Date().toLocaleString()
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBTCPrice()

    // Refresh every 5 minutes
    const interval = setInterval(fetchBTCPrice, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  const refreshPrice = () => {
    fetchBTCPrice()
  }

  if (loading && !btcData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading BTC data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hero BTC Price */}
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
            <span className="text-2xl">₿</span>
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-gray-500">BITCOIN (BTC)</div>
            <div className="text-xs text-gray-400">1 BTC = USD</div>
          </div>
        </div>

        <div className="text-6xl font-bold text-gray-900 mb-4">
          ${btcData?.price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </div>

        {btcData && (
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className={`text-lg font-semibold ${
              btcData.changePercent24h >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {btcData.changePercent24h >= 0 ? '+' : ''}{btcData.changePercent24h.toFixed(2)}%
            </div>
            <div className="text-sm text-gray-500">24h</div>
          </div>
        )}

        <div className="flex items-center justify-center space-x-4">
          <div className="text-sm text-gray-500">
            Last updated: {btcData?.lastUpdated}
          </div>
          <button
            onClick={refreshPrice}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
            {error} (Showing fallback data)
          </div>
        )}
      </div>

      {/* BTC Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-500">MARKET CAP RANK</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">#1</div>
          <div className="text-sm text-gray-600 mt-1">Digital Assets</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-500">ALL-TIME HIGH</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">$73,737</div>
          <div className="text-sm text-gray-600 mt-1">March 14, 2024</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-500">CIRCULATING SUPPLY</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">19.8M</div>
          <div className="text-sm text-gray-600 mt-1">of 21M BTC</div>
        </div>
      </div>

      {/* Simple Chart Placeholder */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Price Chart</h3>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded">24H</button>
            <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">7D</button>
            <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">30D</button>
          </div>
        </div>

        {/* Simple Chart Visualization */}
        <div className="h-64 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg flex items-end justify-center">
          <div className="text-gray-500 text-center">
            <div className="text-4xl mb-2">📈</div>
            <div className="text-sm">Interactive chart integration available</div>
            <div className="text-xs text-gray-400 mt-1">
              Current: ${btcData?.price.toLocaleString() || 'Loading...'}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="flex space-x-4">
          <button className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-medium hover:bg-orange-200 transition-colors">
            Track Portfolio
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
            Price Alerts
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
            Export Data
          </button>
        </div>
      </div>
    </div>
  )
}