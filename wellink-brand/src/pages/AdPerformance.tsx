import { useState } from 'react'
import { TrendingUp, MousePointer, ShoppingBag, DollarSign } from 'lucide-react'
import KPICard from '../components/KPICard'

const periods = ['일간', '주간', '월간'] as const
type Period = (typeof periods)[number]

const campaignPerformance = [
  { name: '봄 요가 프로모션', reach: 182000, clicks: 4320, ctr: 2.37, conversions: 312, roas: 4.2 },
  { name: '비건 신제품 론칭', reach: 0, clicks: 0, ctr: 0, conversions: 0, roas: 0 },
]

const contentPerf = [
  { platform: '인스타그램', type: '릴스', impressions: 98000, engagement: 4.1, clicks: 2100 },
  { platform: '인스타그램', type: '피드', impressions: 54000, engagement: 2.8, clicks: 1100 },
  { platform: '인스타그램', type: '스토리', impressions: 30000, engagement: 1.9, clicks: 620 },
]

/** 하이라이트 색상 판별 */
function getRoasColor(roas: number): string {
  if (roas >= 3.0) return 'text-blue-600'
  if (roas > 0 && roas < 1.0) return 'text-red-500'
  return 'text-gray-900'
}

function getCtrColor(ctr: number): string {
  if (ctr >= 2.0) return 'text-blue-600'
  if (ctr > 0 && ctr < 1.0) return 'text-red-500'
  return 'text-gray-900'
}

function getConversionColor(conv: number): string {
  if (conv > 0) return 'text-blue-600'
  return 'text-gray-900'
}

export default function AdPerformance() {
  const [period, setPeriod] = useState<Period>('월간')

  return (
    <div className="space-y-6">
      {/* 헤더 + 기간 탭 */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">광고 성과</h1>
          <p className="text-sm text-gray-500 mt-0.5">캠페인별 광고 효율 및 전환 분석</p>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          {periods.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`text-sm px-3 py-1.5 rounded-md transition-all ${
                period === p
                  ? 'bg-white shadow-sm font-medium text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI 카드 — 하이라이트 적용 */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          title="총 도달"
          value="182K"
          sub="이번 달 누적"
          trend={12.4}
          trendLabel="전월 대비"
          icon={<TrendingUp size={16} />}
        />
        <KPICard
          title="총 클릭"
          value="4,320"
          sub="모든 채널 합산"
          trend={8.7}
          trendLabel="전월 대비"
          icon={<MousePointer size={16} />}
        />
        <KPICard
          title="전환 수"
          value={312}
          sub="구매+가입 합산"
          trend={23.1}
          trendLabel="전월 대비"
          icon={<ShoppingBag size={16} />}
          valueColor={getConversionColor(312)}
        />
        <KPICard
          title="ROAS"
          value="4.2x"
          sub="광고비 대비 매출"
          trend={5.0}
          trendLabel="전월 대비"
          icon={<DollarSign size={16} />}
          valueColor={getRoasColor(4.2)}
        />
      </div>

      {/* 캠페인별 성과 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h3 className="text-sm font-semibold text-gray-900">캠페인별 성과</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-50">
              {['캠페인', '도달수', '클릭수', 'CTR', '전환수', 'ROAS'].map(h => (
                <th key={h} className="text-left text-xs font-medium text-gray-500 py-2.5 px-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {campaignPerformance.map(c => {
              const roasColor = getRoasColor(c.roas)
              const ctrColor = getCtrColor(c.ctr)
              const convColor = getConversionColor(c.conversions)

              return (
                <tr key={c.name} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{c.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{c.reach ? c.reach.toLocaleString() : '--'}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{c.clicks ? c.clicks.toLocaleString() : '--'}</td>
                  <td className={`py-3 px-4 text-sm font-medium ${c.ctr ? ctrColor : 'text-gray-400'}`}>
                    {c.ctr ? `${c.ctr}%` : '--'}
                  </td>
                  <td className={`py-3 px-4 text-sm font-medium ${c.conversions ? convColor : 'text-gray-400'}`}>
                    {c.conversions ? c.conversions : '--'}
                  </td>
                  <td className={`py-3 px-4 text-sm font-semibold ${c.roas ? roasColor : 'text-gray-400'}`}>
                    {c.roas ? `${c.roas}x` : '--'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* 콘텐츠 유형별 성과 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h3 className="text-sm font-semibold text-gray-900">콘텐츠 유형별 성과</h3>
        </div>
        <div className="p-5 grid grid-cols-3 gap-4">
          {contentPerf.map(c => (
            <div key={c.type} className="border border-gray-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-600">{c.platform} · {c.type}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 text-xs">임프레션</span>
                  <span className="font-semibold text-gray-900 text-xs">{(c.impressions / 1000).toFixed(0)}K</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 text-xs">참여율</span>
                  <span className="font-semibold text-gray-900 text-xs">{c.engagement}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 text-xs">클릭</span>
                  <span className="font-semibold text-gray-900 text-xs">{c.clicks.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
