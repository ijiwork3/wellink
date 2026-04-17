import { useState } from 'react'
import { BarChart2, Users, TrendingUp, Eye } from 'lucide-react'
import KPICard from '../components/KPICard'

const periods = ['일간', '주간', '월간'] as const
type Period = (typeof periods)[number]

const ageData = [
  { label: '13-17', value: 5 },
  { label: '18-24', value: 32 },
  { label: '25-34', value: 41 },
  { label: '35-44', value: 15 },
  { label: '45+', value: 7 },
]

const genderData = [
  { label: '여성', value: 68, color: 'bg-pink-400' },
  { label: '남성', value: 28, color: 'bg-blue-400' },
  { label: '기타', value: 4, color: 'bg-gray-300' },
]

const regionData = [
  { label: '서울', value: 38 },
  { label: '경기', value: 24 },
  { label: '부산', value: 12 },
  { label: '인천', value: 8 },
  { label: '기타', value: 18 },
]

/** 최근 5개 게시물 피드별 좋아요 추세 데이터 */
const feedTrendData = [
  { label: '게시물 1', likes: 320 },
  { label: '게시물 2', likes: 480 },
  { label: '게시물 3', likes: 410 },
  { label: '게시물 4', likes: 560 },
  { label: '게시물 5', likes: 620 },
]

/** SVG 추세선 차트 */
function FeedTrendChart({ data }: { data: typeof feedTrendData }) {
  const width = 500
  const height = 160
  const padX = 50
  const padY = 24
  const chartW = width - padX * 2
  const chartH = height - padY * 2

  const maxVal = Math.max(...data.map(d => d.likes))
  const minVal = Math.min(...data.map(d => d.likes))
  const range = maxVal - minVal || 1

  const points = data.map((d, i) => ({
    x: padX + (chartW / (data.length - 1)) * i,
    y: padY + chartH - ((d.likes - minVal) / range) * chartH,
    ...d,
  }))

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: '180px' }}>
      {/* 그리드 라인 */}
      {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
        const y = padY + chartH - ratio * chartH
        return (
          <line key={ratio} x1={padX} y1={y} x2={width - padX} y2={y} stroke="#f3f4f6" strokeWidth={1} />
        )
      })}

      {/* 추세선 */}
      <path d={linePath} fill="none" stroke="#8CC63F" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

      {/* 데이터 포인트 */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill="#8CC63F" />
          <circle cx={p.x} cy={p.y} r={2} fill="white" />
          {/* 값 라벨 */}
          <text x={p.x} y={p.y - 10} textAnchor="middle" className="text-[10px]" fill="#6b7280" fontSize="10">
            {p.likes}
          </text>
          {/* x축 라벨 */}
          <text x={p.x} y={height - 4} textAnchor="middle" className="text-[10px]" fill="#9ca3af" fontSize="10">
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  )
}

export default function ProfileInsight() {
  const [period, setPeriod] = useState<Period>('월간')

  return (
    <div className="space-y-6">
      {/* 헤더 + 기간 탭 */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">프로필 인사이트</h1>
          <p className="text-sm text-gray-500 mt-0.5">브랜드 프로필의 오디언스 분석 및 도달 현황</p>
        </div>
        {/* 기간 pill 탭 */}
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          {periods.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`text-sm px-3 py-1.5 rounded-md transition-all ${
                period === p
                  ? 'bg-white font-medium text-gray-900'
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
          title="팔로워 수"
          value="24,800"
          sub="@wellink_brand"
          trend={5.2}
          trendLabel="이번 달"
          icon={<Users size={16} />}
          tooltip="현재 브랜드 계정을 팔로우하는 총 사용자 수"
        />
        <KPICard
          title="평균 도달률"
          value="12.4%"
          sub="게시물 기준"
          trend={1.8}
          trendLabel="전월 대비"
          icon={<Eye size={16} />}
          tooltip="게시물 1개당 팔로워 대비 도달한 비율 평균"
        />
        <KPICard
          title="참여율"
          value="3.7%"
          sub="좋아요+댓글 기준"
          trend={-0.3}
          trendLabel="전월 대비"
          icon={<TrendingUp size={16} />}
          tooltip="(좋아요+댓글) / 도달 수 x 100으로 산출"
        />
        <KPICard
          title="인상 수"
          value="482K"
          sub="이번 달 누적"
          trend={8.3}
          trendLabel="전월 대비"
          icon={<BarChart2 size={16} />}
          tooltip="콘텐츠가 화면에 노출된 총 횟수 (중복 포함)"
        />
      </div>

      {/* 콘텐츠 성과 — 피드별 추세선 */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">콘텐츠 성과</h3>
        <p className="text-xs text-gray-500 -mt-2 mb-4">최근 5개 게시물의 좋아요 추세</p>
        <FeedTrendChart data={feedTrendData} />
      </div>

      {/* 오디언스 분포 */}
      <div className="grid grid-cols-3 gap-5">
        {/* 나이 분포 */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">연령대 분포</h3>
          <div className="space-y-3">
            {ageData.map(d => (
              <div key={d.label}>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>{d.label}</span>
                  <span>{d.value}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gray-900 rounded-full" style={{ width: `${d.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 성별 */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">성별 비율</h3>
          <div className="flex h-4 rounded-full overflow-hidden mb-4">
            {genderData.map(d => (
              <div key={d.label} className={`${d.color} transition-all`} style={{ width: `${d.value}%` }} />
            ))}
          </div>
          <div className="space-y-2">
            {genderData.map(d => (
              <div key={d.label} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-sm ${d.color}`} />
                  <span className="text-gray-600">{d.label}</span>
                </div>
                <span className="font-medium text-gray-900">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* 지역 */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">지역 분포</h3>
          <div className="space-y-3">
            {regionData.map(d => (
              <div key={d.label}>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>{d.label}</span>
                  <span>{d.value}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#8CC63F] rounded-full" style={{ width: `${d.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 월별 팔로워 추이 */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">월별 팔로워 추이</h3>
        <div className="flex items-end gap-3 h-32">
          {['1월', '2월', '3월', '4월'].map((month, i) => {
            const heights = [60, 72, 85, 100]
            const values = ['20.2K', '21.8K', '23.1K', '24.8K']
            return (
              <div key={month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500">{values[i]}</span>
                <div className="w-full bg-gray-900 rounded-t-md" style={{ height: `${heights[i]}px` }} />
                <span className="text-xs text-gray-500">{month}</span>
              </div>
            )
          })}
          <div className="flex-1 flex flex-col items-center gap-1 opacity-30">
            <span className="text-xs text-gray-500">--</span>
            <div className="w-full bg-gray-300 rounded-t-md" style={{ height: '80px' }} />
            <span className="text-xs text-gray-500">5월</span>
          </div>
        </div>
      </div>
    </div>
  )
}
