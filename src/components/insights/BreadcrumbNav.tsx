'use client'

interface BreadcrumbItem {
  label: string
  insightId?: string
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[]
  onNavigate: (insightId: string) => void
}

export default function BreadcrumbNav({ items, onNavigate }: BreadcrumbNavProps) {
  if (items.length === 0) return null

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          {index > 0 && (
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
          {item.insightId ? (
            <button
              onClick={() => onNavigate(item.insightId!)}
              className="hover:text-blue-600 transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className={index === items.length - 1 ? 'font-medium text-gray-900' : ''}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
