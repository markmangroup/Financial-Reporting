export default function InsightSkeleton() {
    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            {/* Thinking Indicator */}
            <div className="flex items-center space-x-2 text-sm text-gray-500 animate-pulse mb-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animation-delay-200"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animation-delay-400"></div>
                <span className="ml-2 font-medium">Analyzing financial data...</span>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Header Skeleton */}
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 via-white to-gray-50 animate-shimmer" style={{ backgroundSize: '200% 100%' }}>
                    <div className="flex justify-between items-start">
                        <div className="space-y-3 w-2/3">
                            <div className="h-8 bg-gray-200 rounded-md w-3/4"></div>
                            <div className="h-4 bg-gray-100 rounded-md w-1/2"></div>
                        </div>
                        <div className="h-16 w-32 bg-gray-200 rounded-lg"></div>
                    </div>
                </div>

                {/* Content Grid Skeleton */}
                <div className="p-6">
                    <div className="grid grid-cols-12 gap-6">
                        {/* Main Chart Area */}
                        <div className="col-span-12 md:col-span-8">
                            <div className="h-64 bg-gray-100 rounded-xl w-full relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
                            </div>
                        </div>

                        {/* Side Metrics */}
                        <div className="col-span-12 md:col-span-4 space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-20 bg-gray-50 rounded-xl w-full relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
                                </div>
                            ))}
                        </div>

                        {/* Text Lines */}
                        <div className="col-span-12 space-y-3 mt-4">
                            <div className="h-4 bg-gray-100 rounded w-full"></div>
                            <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                            <div className="h-4 bg-gray-100 rounded w-4/6"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
