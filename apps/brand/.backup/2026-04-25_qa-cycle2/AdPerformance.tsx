import { useState } from 'react'
import { TrendingUp, MousePointer, ShoppingBag, DollarSign, BarChart2, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { KPICard, StatusBadge, ErrorState, fmtNumber, fmtPrice, getRoasColor, getCtrColor } from '@wellink/ui'
import { useQAModeBrand as useQAMode } from '../utils/useQAModeBrand'
import { useInstagramConnected } from '../utils/useInstagramState'
import InstagramConnectPrompt from '../components/InstagramConnectPrompt'
import { getDateLabel } from '../utils/getDateLabel'

const periods = ['일간', '주간', '월간', '연간'] as const
type Period = (typeof periods)[number]

/** 기간별 KPI 데이터 — Meta 유료 광고 기준 */
const kpiByPeriod: Record<Period, {
  spend: number; reach: number; clicks: number; roas: number
  trends: [number, number, number, number]
}> = {
  일간: { spend: 72000,     reach: 13800,   clicks: 350,    roas: 3.6, trends: [5.2,  3.8,  12.0, 2.1] },
  주간: { spend: 486000,    reach: 96000,   clicks: 2410,   roas: 3.8, trends: [9.3,  6.2,  18.5, 3.4] },
  월간: { spend: 1950000,   reach: 386000,  clicks: 9820,   roas: 4.1, trends: [14.8, 11.2, 22.3, 7.6] },
  연간: { spend: 23400000,  reach: 4600000, clicks: 117840, roas: 4.3, trends: [32.1, 28.4, 41.2, 18.9] },
}

/** Meta 광고 캠페인 더미 데이터 */
const metaCampaigns = [
  {
    name: '브랜드 인지도 — 릴스 부스팅',
    objective: '인지도',
    spend: 820000,
    reach: 168000,
    clicks: 2520,
    ctr: 1.50,
    conversions: 210,
    roas: 4.1,
    status: '게재중',
  },
  {
    name: '신제품 론칭 — 전환 캠페인',
    objective: '전환',
    spend: 640000,
    reach: 124000,
    clicks: 1860,
    ctr: 1.50,
    conversions: 168,
    roas: 3.2,
    status: '게재중',
  },
  {
    name: '리타겟팅 — 웹사이트 방문자',
    objective: '전환',
    spend: 310000,
    reach: 52000,
    clicks: 1300,
    ctr: 2.50,
    conversions: 124,
    roas: 4.8,
    status: '종료',
  },
  {
    name: '팔로워 확보 — 프로필 방문 유도',
    objective: '트래픽',
    spend: 180000,
    reach: 42000,
    clicks: 840,
    ctr: 2.00,
    conversions: 0,
    roas: 0,
    status: '일시중지',
  },
]

/** 광고 소재 유형별 성과 — CPM은 업계 평균 기준 (₩5K~₩18K) */
const adFormatPerf = [
  { format: '릴스 광고', impressions: 218000, clicks: 3270, ctr: 1.50, cpm: 8400 },
  { format: '피드 이미지', impressions: 124000, clicks: 1610, ctr: 1.30, cpm: 11200 },
  { format: '스토리 광고', impressions: 88000,  clicks: 1230, ctr: 1.40, cpm: 6800 },
]


function getObjectiveBadge(obj: string) {
  switch (obj) {
    case '인지도': return 'bg-blue-50 text-blue-600'
    case '전환':   return 'bg-purple-50 text-purple-600'
    case '트래픽': return 'bg-sky-50 text-sky-600'
    default:      return 'bg-gray-50 text-gray-500'
  }
}

function RoasBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  // data-policy-v1: ROAS ≥3.0 녹색 / ≥1.5 amber / >0 빨강
  const color = value >= 3.0 ? 'var(--color-brand-green)' : value >= 1.5 ? 'var(--color-roas-warning)' : value > 0 ? 'var(--color-roas-danger)' : 'var(--color-chart-empty)'
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className={`text-sm font-semibold ${getRoasColor(value)}`}>
        {value > 0 ? `${value}x` : '—'}
      </span>
    </div>
  )
}

export default function AdPerformance() {
  const qa = useQAMode()
  const isInstagramConnected = useInstagramConnected()
  const [period, setPeriod] = useState<Period>('월간')
  const [dateOffset, setDateOffset] = useState(0)

  /* ── QA: 로딩 ── */
  if (qa === 'loading') {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex flex-col @sm:flex-row @sm:items-end @sm:justify-between gap-3">
          <div className="space-y-2">
            <div className="h-6 w-32 bg-gray-100 rounded-xl" />
            <div className="h-4 w-56 bg-gray-100 rounded-xl" />
          </div>
          <div className="h-9 w-48 bg-gray-100 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 @sm:grid-cols-4 gap-3 @sm:gap-4">
          {[1,2,3,4].map(i => <div key={i} className="bg-gray-100 rounded-xl h-32" />)}
        </div>
        <div className="bg-gray-100 rounded-xl h-64" />
        <div className="bg-gray-100 rounded-xl h-40" />
      </div>
    )
  }

  /* ── QA: 에러 ── */
  if (qa === 'error') {
    return <ErrorState message="광고 성과 데이터를 불러올 수 없습니다" onRetry={() => window.location.reload()} />
  }

  /* ── Instagram 미연결 상태 ── */
  if (qa === 'disconnected' || !isInstagramConnected) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">광고 성과</h1>
          <p className="text-sm text-gray-500 mt-0.5">Meta 광고 캠페인 성과 및 전환 분석</p>
        </div>
        <InstagramConnectPrompt featureName="광고 성과" />
      </div>
    )
  }

  /* ── QA: 빈 상태 ── */
  if (qa === 'empty') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center w-full max-w-sm">
          <BarChart2 size={40} className="text-gray-200 mx-auto mb-3" aria-hidden="true" />
          <p className="text-sm font-semibold text-gray-400 mb-1">집행 중인 Meta 광고가 없습니다</p>
          <p className="text-xs text-gray-300 mb-4">Meta 광고를 집행하면 성과 데이터가 여기에 표시됩니다.</p>
          <button
            onClick={() => window.open('https://business.facebook.com/ads/manager/', '_blank', 'noopener,noreferrer')}
            className="flex items-center gap-1.5 mx-auto text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ExternalLink size={12} aria-hidden="true" />Meta 광고 관리자 열기
          </button>
        </div>
      </div>
    )
  }

  const isZero = qa === 'zero'
  const kpi = kpiByPeriod[period]
  const tableData = isZero
    ? metaCampaigns.map(c => ({ ...c, spend: 0, reach: 0, clicks: 0, ctr: 0, conversions: 0, roas: 0 }))
    : metaCampaigns

  return (
    <div className="space-y-6">
      {isZero && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 text-xs px-4 py-2 rounded-xl">
          광고가 방금 시작되었습니다. 데이터 집계까지 최대 24시간이 소요될 수 있습니다.
        </div>
      )}

      {/* 헤더 + 기간 탭 + 날짜 네비게이션 */}
      <div className="flex flex-col @sm:flex-row @sm:items-end @sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">광고 성과</h1>
          <p className="text-sm text-gray-500 mt-0.5">Meta 광고 캠페인 성과 및 전환 분석</p>
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {periods.map(p => (
              <button
                key={p}
                onClick={() => { setPeriod(p); setDateOffset(0) }}
                className={`text-sm px-3 py-1.5 rounded-md transition-all ${
                  period === p ? 'bg-white shadow-sm font-medium text-gray-900' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 py-1">
            <button onClick={() => setDateOffset(o => o - 1)} className="p-2 rounded hover:bg-gray-100 transition-colors">
              <ChevronLeft size={14} className="text-gray-500" aria-hidden="true" />
            </button>
            <span className="text-xs font-medium text-gray-700 min-w-[80px] text-center">
              {getDateLabel(period, dateOffset)}
            </span>
            <button
              onClick={() => setDateOffset(o => Math.min(0, o + 1))}
              disabled={dateOffset >= 0}
              className="p-2 rounded hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={14} className="text-gray-500" aria-hidden="true" />
            </button>
          </div>
          <button
            onClick={() => window.open('https://business.facebook.com/ads/manager/', '_blank', 'noopener,noreferrer')}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 border border-gray-200 rounded-lg bg-white"
          >
            <ExternalLink size={12} aria-hidden="true" />
            Meta 광고 관리자
          </button>
        </div>
      </div>

      {/* KPI 카드 — Meta 광고 지표 */}
      <div className="grid grid-cols-2 @sm:grid-cols-4 gap-3 @sm:gap-4">
        <KPICard
          title="광고 지출"
          value={isZero ? '₩0' : fmtPrice(kpi.spend)}
          sub={period === '일간' ? '오늘 지출' : period === '주간' ? '이번 주' : period === '월간' ? '이번 달' : '올해 누적'}
          trend={isZero ? 0 : kpi.trends[0]}
          trendLabel="전기간 대비"
          icon={<DollarSign size={16} aria-hidden="true" />}
          tooltip="Meta 광고 관리자에서 집행된 총 광고 비용"
        />
        <KPICard
          title="총 도달"
          value={isZero ? '0' : fmtNumber(kpi.reach)}
          sub="광고 노출 사용자"
          trend={isZero ? 0 : kpi.trends[1]}
          trendLabel="전기간 대비"
          icon={<TrendingUp size={16} aria-hidden="true" />}
          tooltip="광고를 1회 이상 본 고유 사용자 수"
        />
        <KPICard
          title="총 클릭"
          value={isZero ? '0' : fmtNumber(kpi.clicks)}
          sub="링크 클릭 합산"
          trend={isZero ? 0 : kpi.trends[2]}
          trendLabel="전기간 대비"
          icon={<MousePointer size={16} aria-hidden="true" />}
          tooltip="광고 내 링크를 클릭한 횟수"
        />
        <KPICard
          title="ROAS"
          value={isZero ? '—' : `${kpi.roas}x`}
          sub="광고비 대비 매출"
          trend={isZero ? 0 : kpi.trends[3]}
          trendLabel="전기간 대비"
          icon={<ShoppingBag size={16} aria-hidden="true" />}
          valueColor={getRoasColor(isZero ? 0 : kpi.roas)}
          tooltip="광고 지출 1원당 발생한 매출 (≥4.0x 우수)"
        />
      </div>

      {/* Meta 광고 캠페인별 성과 테이블 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">캠페인별 성과</h3>
            <p className="text-xs text-gray-400 mt-0.5">Meta 광고 관리자 기준 캠페인</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-green inline-block" />≥4.0x 우수</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />{'<'}2.0x 주의</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-50">
                {['캠페인명', '목표', '상태', '광고비', '도달', '클릭수', 'CTR', 'ROAS'].map(h => (
                  <th key={h} scope="col" className="text-left text-xs font-medium text-gray-500 py-2.5 px-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(() => {
                const maxRoas = Math.max(...tableData.map(x => x.roas))
                return tableData.map(c => (
                  <tr key={c.name} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="py-3.5 px-4 text-sm font-medium text-gray-900 max-w-[180px] truncate" title={c.name}>{c.name}</td>
                    <td className="py-3.5 px-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getObjectiveBadge(c.objective)}`}>{c.objective}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={c.status} dot={false} />
                    </td>
                    <td className="py-3.5 px-4 text-sm text-gray-700">
                      {c.spend ? fmtPrice(c.spend) : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-sm text-gray-700">
                      {c.reach ? fmtNumber(c.reach) : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-sm text-gray-700">
                      {c.clicks ? fmtNumber(c.clicks) : '—'}
                    </td>
                    <td className={`py-3.5 px-4 text-sm font-medium ${c.ctr ? getCtrColor(c.ctr) : 'text-gray-300'}`}>
                      {c.ctr ? `${c.ctr}%` : '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <RoasBar value={c.roas} max={maxRoas} />
                    </td>
                  </tr>
                ))
              })()}
            </tbody>
          </table>
        </div>
      </div>

      {/* 광고 소재 유형별 성과 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h3 className="text-sm font-semibold text-gray-900">소재 유형별 성과</h3>
          <p className="text-xs text-gray-400 mt-0.5">광고 포맷별 효율 비교</p>
        </div>
        <div className="p-5 space-y-4">
          {adFormatPerf.map(f => (
            <div key={f.format} className="flex items-center gap-4">
              <div className="w-24 shrink-0">
                <span className="text-xs font-medium text-gray-700">{f.format}</span>
                <p className="text-xs text-gray-400 mt-0.5">CPM {fmtPrice(f.cpm)}</p>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">노출 {fmtNumber(f.impressions)}</span>
                  <span className={`text-xs font-semibold ${getCtrColor(f.ctr)}`}>CTR {f.ctr}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-green"
                    style={{ width: `${(f.impressions / adFormatPerf[0].impressions) * 100}%` }}
                  />
                </div>
              </div>
              <div className="w-20 text-right shrink-0">
                <span className="text-xs text-gray-500">클릭 </span>
                <span className="text-xs font-bold text-gray-800">{fmtNumber(f.clicks)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
