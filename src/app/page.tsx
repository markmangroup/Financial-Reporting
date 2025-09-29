export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Markman Group Financial Reporting
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            CFO-level financial analysis and reporting dashboard
          </p>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Welcome to Your Financial Dashboard
            </h2>
            <p className="text-gray-600 mb-6">
              Upload your Chase bank CSV files to generate comprehensive financial reports
              and visualizations for executive-level analysis.
            </p>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-900 mb-2">Ready to Process:</h3>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Chase bank CSV files</li>
                  <li>• Monthly reporting packages</li>
                  <li>• CFO-level insights and trends</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}