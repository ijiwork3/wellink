import StatusBadge from './StatusBadge'

interface Influencer {
  id: number
  name: string
  platform: string
  followers: number
  engagement: number
  authentic: number
  category: string[]
}

interface InfluencerCardProps {
  influencer: Influencer
  selected?: boolean
  onToggle?: () => void
  onClick?: () => void
}

function formatFollowers(n: number) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}만`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}천`
  return `${n}`
}

export default function InfluencerCard({ influencer, selected, onToggle, onClick }: InfluencerCardProps) {
  const initials = influencer.name.slice(0, 1)
  const colors = ['bg-pink-200', 'bg-blue-200', 'bg-green-200', 'bg-yellow-200', 'bg-purple-200']
  const colorClass = colors[influencer.id % colors.length]

  return (
    <div
      className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${
        selected ? 'border-gray-900 shadow-md' : 'border-gray-100 shadow-sm hover:shadow-md'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center text-gray-700 font-semibold text-sm shrink-0`}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-gray-900">{influencer.name}</span>
            {influencer.platform.split('/').map(p => (
              <StatusBadge key={p} status={p.trim()} />
            ))}
          </div>
          <div className="flex gap-3 mt-1 text-xs text-gray-500">
            <span>팔로워 {formatFollowers(influencer.followers)}</span>
            <span>참여율 {influencer.engagement}%</span>
            <span>진성 {influencer.authentic}%</span>
          </div>
          <div className="flex gap-1 mt-2 flex-wrap">
            {influencer.category.map(c => (
              <span key={c} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{c}</span>
            ))}
          </div>
        </div>
        {onToggle && (
          <button
            onClick={e => { e.stopPropagation(); onToggle() }}
            role="checkbox"
            aria-checked={!!selected}
            aria-label={`${influencer.name} 선택`}
            className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
              selected ? 'bg-gray-900 border-gray-900' : 'border-gray-300'
            }`}
          >
            {selected && <span className="text-white text-xs">✓</span>}
          </button>
        )}
      </div>
    </div>
  )
}
