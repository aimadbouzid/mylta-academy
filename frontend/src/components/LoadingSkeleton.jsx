// LoadingSkeleton.jsx

export default function LoadingSkeleton() {
  return (
    <div className="card-academy overflow-hidden animate-pulse">
      {/* Thumbnail skeleton */}
      <div className="h-48 skeleton" />

      <div className="p-5 space-y-3">
        {/* Badge + duration */}
        <div className="flex items-center justify-between">
          <div className="h-5 w-20 skeleton rounded-full" />
          <div className="h-4 w-14 skeleton rounded-full" />
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <div className="h-5 skeleton rounded-lg w-full" />
          <div className="h-5 skeleton rounded-lg w-4/5" />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <div className="h-3.5 skeleton rounded w-full" />
          <div className="h-3.5 skeleton rounded w-3/4" />
        </div>

        {/* Stats */}
        <div className="flex gap-4 pt-1">
          <div className="h-3.5 skeleton rounded w-12" />
          <div className="h-3.5 skeleton rounded w-20" />
          <div className="h-3.5 skeleton rounded w-16" />
        </div>

        {/* Divider */}
        <div className="h-px skeleton" />

        {/* Price + Button */}
        <div className="flex items-center justify-between">
          <div className="h-6 skeleton rounded w-28" />
          <div className="h-9 skeleton rounded-xl w-36" />
        </div>
      </div>
    </div>
  )
}

export function LoadingGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <LoadingSkeleton key={i} />
      ))}
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-full bg-red-950/30 border border-red-800/40
                      flex items-center justify-center mb-6">
        <span className="text-3xl">⚠️</span>
      </div>
      <h3 className="font-display text-xl font-semibold text-academy-textMain mb-2">
        Chargement impossible
      </h3>
      <p className="text-academy-textMain/40 mb-6 max-w-sm text-sm leading-relaxed">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary-outline text-sm py-2 px-5">
          Réessayer
        </button>
      )}
    </div>
  )
}
