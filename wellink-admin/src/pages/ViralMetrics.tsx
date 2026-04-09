import { useState } from 'react'
import { Share2, Bookmark, Eye, Zap, Image } from 'lucide-react'

function InstagramIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}
import KPICard from '../components/KPICard'

const periods = ['일간', '주간', '월간'] as const
type Period = (typeof periods)[number]

const viralContentData = [
  {
    title: '봄맞이 요가 루틴 5분 챌린지',
    influencer: '@yoga_jimin',
    type: '릴스',
    reach: 18200,
    likes: 2340,
    comments: 187,
    saves: 890,
    shares: 420,
    viralScore: 92,
  },
  {
    title: '비건 프로틴 바 솔직 후기',
    influencer: '@fitfoodie_kr',
    type: '피드',
    reach: 12400,
    likes: 1560,
    comments: 98,
    saves: 720,
    shares: 310,
    viralScore: 78,
  },
  {
    title: '주말 홈트 브이로그',
    influencer: '@daily_hana',
    type: '릴스',
    reach: 9800,
    likes: 1120,
    comments: 76,
    saves: 540,
    shares: 280,
    viralScore: 65,
  },
  {
    title: '웰링크 제품 언박싱',
    influencer: '@beauty_sora',
    type: '스토리',
    reach: 5600,
    likes: 680,
    comments: 42,
    saves: 320,
    shares: 150,
    viralScore: 48,
  },
  {
    title: '건강간식 추천 TOP3',
    influencer: '@snack_master',
    type: '피드',
    reach: 4200,
    likes: 520,
    comments: 34,
    saves: 210,
    shares: 80,
    viralScore: 35,
  },
]

function getTypeColor(type: string) {
  switch (type) {
    case '릴스':
      return 'bg-purple-100 text-purple-700'
    case '피드':
      return 'bg-blue-100 text-blue-700'
    case '스토리':
      return 'bg-orange-100 text-orange-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toLocaleString()
}

export default function ViralMetrics() {
  const [period, setPeriod] = useState<Period>('월간')

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-end justify-between">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold text-gray-900">바이럴 지표</h1>
          <span className="text-[11px] font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full leading-none">
            Beta
          </span>
        </div>
        {/* 기간 탭 */}
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

      {/* KPI 카드 */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          title="총 바이럴 도달"
          value="48.2K"
          sub="이번 달 누적"
          trend={15.3}
          trendLabel="전월 대비"
          icon={<Eye size={16} />}
          tooltip="콘텐츠가 공유/저장을 통해 2차 도달된 총 수"
        />
        <KPICard
          title="공유 수"
          value="1,240"
          sub="DM+스토리 공유"
          trend={22.1}
          trendLabel="전월 대비"
          icon={<Share2 size={16} />}
          tooltip="콘텐츠가 DM이나 스토리로 공유된 횟수"
        />
        <KPICard
          title="저장 수"
          value="3,890"
          sub="컬렉션 저장"
          trend={18.7}
          trendLabel="전월 대비"
          icon={<Bookmark size={16} />}
          tooltip="사용자가 나중에 보기 위해 저장한 횟수"
        />
        <KPICard
          title="바이럴 계수"
          value="2.4x"
          sub="콘텐츠 확산 배율"
          trend={8.4}
          trendLabel="전월 대비"
          icon={<Zap size={16} />}
          tooltip="1명이 공유하면 평균 2.4명에게 도달하는 확산률"
          valueColor="text-blue-600"
        />
      </div>

      {/* Instagram 연결 안내 배너 */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
          <InstagramIcon size={16} className="text-green-700" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-green-900">Instagram 비즈니스 계정 연결</p>
          <p className="text-xs text-green-700 mt-0.5">
            Instagram 비즈니스 계정을 연결하면 바이럴 지표가 자동으로 수집되어 실시간 분석이 가능합니다.
          </p>
        </div>
        <button className="text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 px-3 py-1.5 rounded-lg transition-colors shrink-0">
          연결하기
        </button>
      </div>

      {/* 콘텐츠별 바이럴 성과 테이블 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h3 className="text-sm font-semibold text-gray-900">콘텐츠별 바이럴 성과</h3>
          <p className="text-xs text-gray-500 mt-0.5">바이럴 점수 높은 순 정렬</p>
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
                <tr key={item.title} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <Image size={14} className="text-gray-400" />
                      </div>
                      <span className="text-sm font-medium text-gray-900 truncate[180px]">{item.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{item.influencer}</td>
                  <td className="py-3 px-4">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${getTypeColor(item.type)}`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">{formatNumber(item.reach)}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{formatNumber(item.likes)}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{item.comments}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{formatNumber(item.saves)}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{item.shares}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#8CC63F]"
                          style={{ width: `${item.viralScore}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{item.viralScore}</span>
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
