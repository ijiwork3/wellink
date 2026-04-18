import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Share2, Bookmark, Eye, Zap, Image, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { ErrorState } from '@wellink/ui'
import { useToast } from '@wellink/ui'
import { useQAMode } from '@wellink/ui'
import { fmtNumber } from '@wellink/ui'
import { useInstagramConnected } from '../utils/useInstagramState'
import InstagramConnectPrompt from '../components/InstagramConnectPrompt'
import { getDateLabel, type DatePeriod } from '../utils/getDateLabel'

type ViewMode = 'daily' | 'weekly' | 'monthly' | 'yearly'

const VIEW_MODE_TO_PERIOD: Record<ViewMode, DatePeriod> = {
  daily: '일간',
  weekly: '주간',
  monthly: '월간',
  yearly: '연간',
}

// 뷰 모드별 KPI 더미 데이터
const kpiByMode: Record<ViewMode, { reach: number; shares: number; saves: number; viral: number }> = {
  daily:   { reach: 4200,   shares: 82,    saves: 312,   viral: 2.1 },
  weekly:  { reach: 18700,  shares: 410,   saves: 1820,  viral: 2.3 },
  monthly: { reach: 48200,  shares: 1240,  saves: 3890,  viral: 2.4 },
  yearly:  { reach: 578000, shares: 14880, saves: 46680, viral: 2.6 },
}

const viralContentData = [
  { title: '봄맞이 요가 루틴 5분 챌린지', influencer: '@yoga_jimin', type: '릴스', reach: 18200, likes: 2340, comments: 187, saves: 890, shares: 420, viralScore: 92 },
  { title: '비건 프로틴 바 솔직 후기', influencer: '@fitfoodie_kr', type: '피드', reach: 12400, likes: 1560, comments: 98, saves: 720, shares: 310, viralScore: 78 },
  { title: '주말 홈트 브이로그', influencer: '@daily_hana', type: '릴스', reach: 9800, likes: 1120, comments: 76, saves: 540, shares: 280, viralScore: 65 },
  { title: '웰링크 제품 언박싱', influencer: '@beauty_sora', type: '스토리', reach: 5600, likes: 680, comments: 42, saves: 320, shares: 150, viralScore: 48 },
  { title: '건강간식 추천 TOP3', influencer: '@snack_master', type: '피드', reach: 4200, likes: 520, comments: 34, saves: 210, shares: 80, viralScore: 35 },
]

function getTypeColor(type: string) {
  switch (type) {
    case '이미지': return 'bg-sky-100 text-sky-700'
    case '릴스': return 'bg-pink-100 text-pink-700'
    case '스토리': return 'bg-purple-100 text-purple-700'
    case '영상': return 'bg-orange-100 text-orange-700'
    case '피드': return 'bg-blue-100 text-blue-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

// 추세 미니 차트 (바 형태)
function TrendMiniBar({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values)
  return (
    <div className="flex items-end gap-0.5 h-8">
      {values.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm"
          style={{ height: max > 0 ? `${(v / max) * 100}%` : '4px', backgroundColor: color, opacity: i === values.length - 1 ? 1 : 0.35 }}
        />
      ))}
    </div>
  )
}

// 뷰 모드별 추세 데이터 — 일간 30일, 주간 12주, 월간 12개월, 연간 2025년~
const trendData: Record<ViewMode, { reach: number[]; saves: number[]; shares: number[] }> = {
  // 일간: 30일치 (TrendMiniBar가 비율로 자동 렌더)
  daily: {
    reach:  [0,0,0,0,0,0,0,0, 2100,2800,2400,3200,2900,3600,3100,3900,3500,4200,3800,4600,4100,4800,4400,4200,4600,4100,4300,4500,4200,4200],
    saves:  [0,0,0,0,0,0,0,0, 160,195,175,220,200,245,215,265,240,290,260,330,295,340,315,308,325,295,310,320,305,312],
    shares: [0,0,0,0,0,0,0,0, 42,52,47,61,54,70,62,76,68,82,74,88,80,90,84,80,86,78,82,84,80,82],
  },
  // 주간: 12주
  weekly: {
    reach:  [0, 0, 12800, 14200, 16800, 15200, 18700, 17100, 18200, 19400, 18700, 18700],
    saves:  [0, 0, 1100,  1400,  1650,  1520,  1820,  1680,  1750,  1860,  1800,  1820],
    shares: [0, 0, 275,   310,   380,   350,   410,   390,   400,   428,   415,   410],
  },
  // 월간: 12개월 (앞 8개월 데이터 없음 → 0)
  monthly: {
    reach:  [0,0,0,0,0,0,0,0, 34000,38200,44000,48200],
    saves:  [0,0,0,0,0,0,0,0, 2800, 3100, 3600, 3890],
    shares: [0,0,0,0,0,0,0,0, 920,  1020, 1160, 1240],
  },
  // 연간: 월별 12포인트
  yearly: {
    reach:  [28000, 54000, 89000, 124000, 168000, 215000, 264000, 318000, 365000, 410000, 462000, 578000],
    saves:  [2100,  4200,  7000,  10200,  13800,  17600,  21800,  26200,  30100,  34500,  39200,  46680],
    shares: [620,   1240,  2100,  3050,   4120,   5280,   6510,   7840,   9080,   10420,  11840,  14880],
  },
}

export default function ViralMetrics() {
  const { showToast } = useToast()
  const navigate = useNavigate()
  const qa = useQAMode()
  const isInstagramConnected = useInstagramConnected()
  const [viewMode, setViewMode] = useState<ViewMode>('monthly')
  const [dateOffset, setDateOffset] = useState(0)

  /* ── QA: 로딩 스켈레톤 ── */
  if (qa === 'loading') {
    return (
      <div className="space-y-6 animate-pulse">
        {/* 헤더 스켈레톤 */}
        <div className="flex flex-col @sm:flex-row @sm:items-start @sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-32 bg-gray-100 rounded-xl" />
            <div className="h-5 w-10 bg-gray-100 rounded-full" />
          </div>
          <div className="h-9 w-64 bg-gray-100 rounded-xl" />
        </div>
        {/* KPI 4개 스켈레톤 */}
        <div className="grid grid-cols-2 @sm:grid-cols-4 gap-3 @sm:gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-gray-100 rounded-xl h-32" />
          ))}
        </div>
        {/* 차트/배너 스켈레톤 */}
        <div className="bg-gray-100 rounded-xl h-16" />
        {/* 테이블 스켈레톤 */}
        <div className="bg-gray-100 rounded-xl h-64" />
      </div>
    )
  }

  /* ── Instagram 미연결 상태 ── */
  if (qa === 'disconnected' || !isInstagramConnected) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold text-gray-900">바이럴 지표</h1>
          <span className="text-[11px] font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full leading-none">Beta</span>
        </div>
        <InstagramConnectPrompt featureName="바이럴 지표" />
      </div>
    )
  }

  /* ── QA: 빈 상태 — 바이럴 콘텐츠 없음 ── */
  if (qa === 'empty') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold text-gray-900">바이럴 지표</h1>
          <span className="text-[11px] font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full leading-none">Beta</span>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[380px] bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center">
          <Zap size={40} className="text-gray-200 mb-3" />
          <p className="text-sm font-semibold text-gray-400 mb-1">바이럴 콘텐츠 데이터가 없습니다</p>
          <p className="text-xs text-gray-300 max-w-[220px] mb-4">인플루언서 캠페인 콘텐츠가 게시되면 바이럴 지표가 자동으로 집계됩니다.</p>
          <button
            onClick={() => navigate('/campaigns')}
            className="text-sm font-medium text-white px-5 py-2.5 rounded-xl bg-[#8CC63F] hover:bg-[#7AB535] transition-colors"
          >
            캠페인 만들기
          </button>
        </div>
      </div>
    )
  }

  /* ── QA: 에러 상태 ── */
  if (qa === 'error') {
    return <ErrorState message="바이럴 지표를 불러올 수 없습니다" subMessage="Instagram API 연결을 확인해 주세요." onRetry={() => window.location.reload()} />
  }

  /* ── QA: 전부 0 (엣지케이스) — 데이터 있으나 지표가 모두 0 ── */
  const isZero = qa === 'zero'
  const trendZero = { reach: [0,0,0,0,0,0,0], saves: [0,0,0,0,0,0,0], shares: [0,0,0,0,0,0,0] }

  const rawKpi = kpiByMode[viewMode]
  const kpi = isZero
    ? { reach: '--', shares: '--', saves: '--', viral: '--' }
    : { reach: fmtNumber(rawKpi.reach), shares: fmtNumber(rawKpi.shares), saves: fmtNumber(rawKpi.saves), viral: `${rawKpi.viral}x` }
  const trend = isZero ? trendZero : trendData[viewMode]

  const trendPct: Record<ViewMode, { reach: string; shares: string; saves: string; viral: string }> = {
    daily:   { reach: '+3.2%',  shares: '+5.1%',  saves: '+4.8%',  viral: '+1.2%' },
    weekly:  { reach: '+8.4%',  shares: '+12.3%', saves: '+9.7%',  viral: '+3.8%' },
    monthly: { reach: '+15.3%', shares: '+22.1%', saves: '+18.7%', viral: '+8.4%' },
    yearly:  { reach: '+42.1%', shares: '+58.3%', saves: '+51.2%', viral: '+24.6%' },
  }

  const viewModeLabels: Record<ViewMode, string> = {
    daily: '일간', weekly: '주간', monthly: '월간', yearly: '연간'
  }

  return (
    <div className="space-y-6">
      {/* 헤더 + 날짜 네비게이션 */}
      <div className="flex flex-col @sm:flex-row @sm:items-start @sm:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold text-gray-900">바이럴 지표</h1>
          <span className="text-[11px] font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full leading-none">Beta</span>
        </div>

        {/* 날짜 네비게이션 */}
        <div className="flex items-center gap-2 @sm:gap-3 flex-wrap">
          {/* 뷰 모드 토글 */}
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {(['daily', 'weekly', 'monthly', 'yearly'] as ViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => { setViewMode(mode); setDateOffset(0) }}
                className={`text-sm px-3 py-1.5 rounded-md transition-all ${
                  viewMode === mode ? 'bg-white shadow-sm font-medium text-gray-900' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {viewModeLabels[mode]}
              </button>
            ))}
          </div>

          {/* 날짜 이전/다음 */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-1">
            <button
              onClick={() => setDateOffset(o => o - 1)}
              aria-label="이전 기간"
              className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-500"
            >
              <ChevronLeft size={14} />
            </button>
            <div className="flex items-center gap-1.5 px-2">
              <Calendar size={12} className="text-gray-400" />
              <span className="text-xs font-medium text-gray-700 whitespace-nowrap min-w-[120px] text-center">
                {getDateLabel(VIEW_MODE_TO_PERIOD[viewMode], dateOffset)}
              </span>
            </div>
            <button
              onClick={() => setDateOffset(o => Math.min(o + 1, 0))}
              disabled={dateOffset >= 0}
              aria-label="다음 기간"
              className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-500 disabled:opacity-30"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* KPI 카드 4개 — 지표 중심 */}
      <div className="grid grid-cols-2 @sm:grid-cols-4 gap-3 @sm:gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500">총 바이럴 도달</span>
            <Eye size={14} className="text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{kpi.reach}</p>
          <TrendMiniBar values={trend.reach} color="#3B82F6" />
          <p className="text-xs text-[#8CC63F] font-medium mt-1">{trendPct[viewMode].reach} 전기간 대비</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500">공유 수</span>
            <Share2 size={14} className="text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{kpi.shares}</p>
          <TrendMiniBar values={trend.shares} color="#8CC63F" />
          <p className="text-xs text-[#8CC63F] font-medium mt-1">{trendPct[viewMode].shares} 전기간 대비</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500">저장 수</span>
            <Bookmark size={14} className="text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{kpi.saves}</p>
          <TrendMiniBar values={trend.saves} color="#8B5CF6" />
          <p className="text-xs text-[#8CC63F] font-medium mt-1">{trendPct[viewMode].saves} 전기간 대비</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500">바이럴 계수</span>
            <Zap size={14} className="text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-[#8CC63F]">{kpi.viral}</p>
          <div className="mt-3 h-8 flex items-center">
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#8CC63F] rounded-full" style={{ width: `${isZero ? 0 : Math.max(0, Math.min(100, (rawKpi.viral / 4) * 100))}%` }} />
            </div>
          </div>
          <p className="text-xs text-[#8CC63F] font-medium mt-1">{trendPct[viewMode].viral} 전기간 대비</p>
        </div>
      </div>

      {/* 콘텐츠별 바이럴 성과 테이블 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">콘텐츠별 바이럴 성과</h3>
            <p className="text-xs text-gray-500 mt-0.5">바이럴 점수 높은 순 · {getDateLabel(VIEW_MODE_TO_PERIOD[viewMode], dateOffset)}</p>
          </div>
          <button
            onClick={() => showToast('CSV 파일 다운로드를 시작합니다.', 'success')}
            className="text-xs text-gray-500 border border-gray-200 rounded-xl px-3 py-1.5 hover:bg-gray-50 transition-colors"
          >
            CSV 내보내기
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-50">
                {['콘텐츠', '인플루언서', '유형', '도달', '좋아요', '댓글', '저장', '공유', '바이럴 점수'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-gray-500 py-2.5 px-4 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {viralContentData.map(item => (
                <tr key={item.title} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <Image size={14} className="text-gray-400" />
                      </div>
                      <span className="text-sm text-gray-900 max-w-[160px] truncate">{item.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">{item.influencer}</td>
                  <td className="py-3 px-4">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${getTypeColor(item.type)}`}>{item.type}</span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700 font-medium">{fmtNumber(item.reach)}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{fmtNumber(item.likes)}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{fmtNumber(item.comments)}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{fmtNumber(item.saves)}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{fmtNumber(item.shares)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${item.viralScore}%`,
                            backgroundColor: item.viralScore >= 80 ? '#8CC63F' : item.viralScore >= 50 ? '#F59E0B' : '#E5E7EB'
                          }}
                        />
                      </div>
                      <span className={`text-sm font-bold ${item.viralScore >= 80 ? 'text-[#8CC63F]' : item.viralScore >= 50 ? 'text-amber-600' : 'text-gray-400'}`}>
                        {item.viralScore}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
