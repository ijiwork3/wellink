import { useNavigate } from 'react-router-dom'
import { StatusBadge, getDDay } from '@wellink/ui'

interface Campaign {
  id: number
  name: string
  status: string
  total: number
  current: number
  deadline: string
}

interface CampaignRowProps {
  campaign: Campaign
}

export default function CampaignRow({ campaign }: CampaignRowProps) {
  const navigate = useNavigate()
  const progress = campaign.total > 0 ? Math.round((campaign.current / campaign.total) * 100) : 0
  const dday = getDDay(campaign.deadline)

  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
      <td className="py-3 px-4">
        <span className="font-medium text-sm text-gray-900">{campaign.name}</span>
      </td>
      <td className="py-3 px-4">
        <StatusBadge status={campaign.status} />
      </td>
      <td className="py-3 px-4 min-w-[140px]">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-900 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 w-12 text-right">{campaign.current}/{campaign.total}명</span>
        </div>
      </td>
      <td className="py-3 px-4">
        <span className={`text-xs font-medium ${dday.color}${dday.pulse ? ' animate-pulse' : ''}`}>
          {dday.label}
        </span>
        <div className="text-xs text-gray-400">{campaign.deadline}</div>
      </td>
      <td className="py-3 px-4">
        <button
          onClick={() => navigate(`/campaigns/${campaign.id}`)}
          className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-xl hover:bg-gray-700 transition-colors"
        >
          상세보기
        </button>
      </td>
    </tr>
  )
}
