import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, ArrowRight, Loader2, Check } from 'lucide-react'
import { CustomSelect } from '@wellink/ui'
import { useToast } from '@wellink/ui'
import { ErrorState } from '@wellink/ui'
import { avatarColors, formatFollowers } from '../utils/influencerUtils'
import { useQAMode } from '@wellink/ui'

// NOTE: 인플루언서 mock 데이터 — 추후 src/data/influencers.ts로 통합 예정
const recommendedInfluencers = [
  { id: 1, name: '이창민', platform: '인스타그램', followers: 8700, engagement: 4.1, authentic: 92.3, category: ['피트니스', '크로스핏'], fitScore: 92 },
  { id: 4, name: '김가애', platform: '인스타그램', followers: 18900, engagement: 4.2, authentic: 88.7, category: ['요가'], fitScore: 88 },
  { id: 5, name: '박리나', platform: '인스타그램', followers: 7120, engagement: 2.23, authentic: 85.2, category: ['웰니스'], fitScore: 71 },
]

const platformOptions = [
  { label: '인스타그램', value: '인스타그램' },
  { label: '유튜브', value: '유튜브' },
  { label: '틱톡', value: '틱톡' },
  { label: '전체', value: '전체' },
]

const followerOptions = [
  { label: '전체', value: '전체' },
  { label: '나노 (~1만)', value: 'nano' },
  { label: '마이크로 (1만~10만)', value: 'micro' },
  { label: '매크로 (10만+)', value: 'macro' },
]

const platformBadge: Record<string, string> = {
  '인스타그램': 'bg-[#E1306C]/10 text-[#E1306C]',
  '유튜브': 'bg-red-100 text-red-700',
  '틱톡': 'bg-gray-100 text-gray-700',
}

const fitScoreColor = (score: number) => {
  if (score >= 85) return 'bg-brand-green'
  if (score >= 70) return 'bg-gray-400'
  return 'bg-gray-300'
}

type Phase = 'idle' | 'loading' | 'done'

export default function AIListup() {
  const navigate = useNavigate()
  const qa = useQAMode()
  const { showToast } = useToast()
  const [prompt, setPrompt] = useState('')
  const [phase, setPhase] = useState<Phase>('idle')
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [prefPlatform, setPrefPlatform] = useState('인스타그램')
  const [followerRange, setFollowerRange] = useState('전체')

  const handleAnalyze = () => {
    if (!prompt.trim()) { showToast('브랜드 설명을 입력해 주세요.', 'error'); return }
    setPhase('loading')
    setTimeout(() => {
      setPhase('done')
      showToast('AI 리스트업이 완료됐어요.', 'success')
    }, 2200)
  }

  const toggleSelect = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  /* ── QA: 에러 상태 ── */
  if (qa === 'error') {
    return <ErrorState message="AI 리스트업 데이터를 불러올 수 없어요" onRetry={() => window.location.reload()} />
  }

  /* ── QA: 빈 상태 ── */
  if (qa === 'empty') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center w-full max-w-sm">
          <Sparkles size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-400 mb-1">분석 결과가 없어요</p>
          <p className="text-xs text-gray-300 mb-4">AI 리스트업을 실행해 인플루언서를 추천받아 보세요.</p>
          <button
            onClick={() => navigate('/campaigns/new')}
            className="text-sm bg-brand-green text-white px-4 py-2 rounded-xl hover:bg-brand-green-hover transition-colors"
          >
            캠페인 만들기
          </button>
        </div>
      </div>
    )
  }

  /* ── QA: 로딩 상태 ── */
  if (qa === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center w-full max-w-sm">
          <div className="relative inline-block mb-4">
            <div className="w-16 h-16 rounded-full bg-brand-green/10 flex items-center justify-center">
              <Loader2 size={28} className="animate-spin text-brand-green" />
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-900 mb-1">AI가 인플루언서를 분석 중입니다...</p>
          <p className="text-xs text-gray-500 mb-0.5">잠시만 기다려 주세요.</p>
          <p className="text-xs text-gray-400">약 20~30초 소요됩니다</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* 헤더 */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">AI 리스트업</h1>
        <p className="text-sm text-gray-500 mt-0.5">AI가 브랜드에 딱 맞는 인플루언서를 찾아드려요.</p>
      </div>

      {/* AI 브랜딩 */}
      <div className="flex items-center gap-3 bg-brand-green/5 border border-brand-green/20 rounded-2xl px-5 py-4">
        <div className="relative flex items-center justify-center w-12 h-12 shrink-0">
          <div className="absolute inset-0 bg-brand-green/10 rounded-full" />
          <Sparkles size={22} className="text-brand-green relative z-10" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">AI 인플루언서 리스트업</p>
          <p className="text-xs text-gray-500 mt-0.5">브랜드 설명을 입력하면 AI가 최적의 인플루언서를 추천해 드려요.</p>
        </div>
      </div>

      {/* 입력 폼 */}
      {phase === 'idle' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">브랜드 설명</label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => { if (e.ctrlKey && e.key === 'Enter') handleAnalyze() }}
              placeholder="예) 저희는 웰니스 라이프스타일 브랜드로, 요가·필라테스 관련 제품을 판매합니다. 25-35세 여성 타겟이며, 진성성 높고 건강한 라이프스타일을 추구하는 인플루언서를 찾고 있습니다."
              rows={5}
              maxLength={500}
              className="w-full text-sm border border-gray-200 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green leading-relaxed transition-all duration-150"
            />
            <div className="text-right text-xs text-gray-400 mt-0.5">{prompt.length}/500</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">선호 플랫폼</label>
              <CustomSelect
                value={prefPlatform}
                onChange={v => setPrefPlatform(v as string)}
                options={platformOptions}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">팔로워 규모</label>
              <CustomSelect
                value={followerRange}
                onChange={v => setFollowerRange(v as string)}
                options={followerOptions}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button
              onClick={() => navigate('/influencers/list')}
              className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors duration-150 flex items-center justify-center gap-2"
            >
              직접 인플루언서 찾아보기
              <ArrowRight size={15} />
            </button>
            <button
              onClick={handleAnalyze}
              disabled={!prompt.trim()}
              className="flex-1 bg-brand-green text-white py-3 rounded-xl text-sm font-medium hover:bg-brand-green-hover transition-colors duration-150 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Sparkles size={15} />
              분석 시작
            </button>
          </div>
        </div>
      )}

      {/* 로딩 */}
      {phase === 'loading' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="relative inline-block mb-4">
            <div className="w-16 h-16 rounded-full bg-brand-green/10 flex items-center justify-center">
              <Loader2 size={28} className="animate-spin text-brand-green" />
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-900 mb-1">브랜드를 분석 중입니다...</p>
          <p className="text-xs text-gray-500 mb-1">최적의 인플루언서를 찾고 있어요</p>
          <p className="text-xs text-gray-400 mb-5">약 20~30초 소요됩니다</p>
          <div className="space-y-2 text-left max-w-xs mx-auto">
            {['브랜드 키워드 추출 중', '오디언스 매칭 분석 중', 'Fit Score 계산 중'].map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" style={{ animationDelay: `${i * 0.7}s` }} />
                <p className="text-xs text-gray-500 animate-pulse" style={{ animationDelay: `${i * 0.7}s` }}>{s}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 결과 */}
      {phase === 'done' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">AI 추천 결과</h2>
              <p className="text-xs text-gray-500 mt-0.5">브랜드 프로필에 가장 적합한 인플루언서 3인</p>
            </div>
            <button
              onClick={() => { setPhase('idle'); setPrompt(''); setSelected(new Set()); setFollowerRange('전체'); setPrefPlatform('인스타그램') }}
              className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors duration-150"
            >
              다시 검색
            </button>
          </div>

          {(() => {
            const filtered = recommendedInfluencers.filter(inf => {
              // prefPlatform 필터: '전체'가 아닌 경우 플랫폼 일치 여부 확인
              if (prefPlatform && prefPlatform !== '전체' && inf.platform !== prefPlatform) return false
              if (followerRange === '전체' || followerRange === '') return true
              if (followerRange === 'nano') return inf.followers < 10000
              if (followerRange === 'micro') return inf.followers >= 10000 && inf.followers < 100000
              if (followerRange === 'macro') return inf.followers >= 100000
              return true
            })
            if (filtered.length === 0) {
              return (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
                  <Sparkles size={36} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-gray-400 mb-1">선택한 조건에 해당하는 인플루언서가 없어요</p>
                  <p className="text-xs text-gray-300">플랫폼 또는 팔로워 규모 필터를 변경해 보세요.</p>
                </div>
              )
            }
            return (
          <div className="space-y-3">
            {filtered.map((inf, idx) => (
              <div
                key={inf.id}
                onClick={() => toggleSelect(inf.id)}
                role="checkbox"
                aria-checked={selected.has(inf.id)}
                tabIndex={0}
                onKeyDown={e => { if (e.key === ' ') { e.preventDefault(); toggleSelect(inf.id) } }}
                className={`relative bg-white rounded-xl border p-4 cursor-pointer transition-all duration-150 ${
                  selected.has(inf.id)
                    ? 'border-brand-green shadow-md'
                    : 'border-gray-100 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                {/* 순위 뱃지 */}
                <div className="absolute -top-2.5 -left-2.5 w-6 h-6 bg-gray-700 text-white rounded-full flex items-center justify-center text-xs font-bold z-10">
                  {idx + 1}
                </div>

                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-full ${avatarColors[inf.id % avatarColors.length]} flex items-center justify-center text-gray-700 font-semibold shrink-0`}>
                    {inf.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-gray-900">{inf.name}</span>
                      <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${platformBadge[inf.platform] ?? 'bg-gray-100 text-gray-600'}`}>
                        {inf.platform}
                      </span>
                    </div>
                    <div className="flex gap-3 mt-1 text-xs">
                      <span className="text-gray-500">팔로워 {formatFollowers(inf.followers)}</span>
                      <span className={`font-medium ${inf.engagement >= 4 ? 'text-brand-green-text' : inf.engagement >= 2.5 ? 'text-gray-500' : 'text-red-500'}`}>참여율 {inf.engagement}%</span>
                      <span className={`font-medium ${inf.authentic >= 80 ? 'text-brand-green-text' : inf.authentic >= 60 ? 'text-amber-600' : 'text-red-500'}`}>진성 {inf.authentic}%</span>
                    </div>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {inf.category.map(c => (
                        <span key={c} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{c}</span>
                      ))}
                    </div>
                    {/* Fit Score 바 */}
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-gray-500 shrink-0">Fit Score</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${fitScoreColor(inf.fitScore)}`}
                          style={{ width: `${inf.fitScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-gray-900 shrink-0">{inf.fitScore}</span>
                    </div>
                  </div>

                  {/* 선택 체크 */}
                  <div className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-150 ${
                    selected.has(inf.id) ? 'bg-brand-green border-brand-green' : 'border-gray-300'
                  }`}>
                    {selected.has(inf.id) && <Check size={12} className="text-white" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
            )
          })()}

          {selected.size > 0 && (
            <div className="sticky bottom-4 bg-brand-green text-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-xl">
              <span className="text-sm font-medium">{selected.size}명 선택됨</span>
              <button
                onClick={() => navigate('/campaigns/new', { state: { selectedInfluencers: Array.from(selected) } })}
                className="bg-white text-gray-900 text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors duration-150 flex items-center gap-2"
              >
                캠페인에 추가하기
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
