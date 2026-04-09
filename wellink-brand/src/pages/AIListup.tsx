import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, ArrowRight, Loader2, Check } from 'lucide-react'
import CustomSelect from '../components/CustomSelect'
import { useToast } from '../components/Toast'

const recommendedInfluencers = [
  { id: 1, name: '이창민', platform: '인스타그램', followers: 8700, engagement: 4.1, authentic: 64.7, category: ['피트니스', '크로스핏'], fitScore: 92 },
  { id: 4, name: '김가애', platform: '인스타그램', followers: 18900, engagement: 4.2, authentic: 5.5, category: ['요가'], fitScore: 88 },
  { id: 5, name: '박리나', platform: '인스타그램', followers: 7120, engagement: 2.23, authentic: 1.6, category: ['웰니스'], fitScore: 71 },
]

const platformOptions = [
  { label: '인스타그램', value: '인스타그램' },
  { label: '유튜브', value: '유튜브' },
  { label: '틱톡', value: '틱톡' },
  { label: '전체', value: '전체' },
]

const followerOptions = [
  { label: '전체', value: '전체' },
  { label: '나노 (1천~1만)', value: 'nano' },
  { label: '마이크로 (1만~10만)', value: 'micro' },
  { label: '매크로 (10만+)', value: 'macro' },
]

const avatarColors = ['bg-pink-200', 'bg-blue-200', 'bg-green-200', 'bg-yellow-200', 'bg-purple-200']

const platformBadge: Record<string, string> = {
  '인스타그램': 'bg-pink-100 text-pink-700',
  '유튜브': 'bg-red-100 text-red-700',
  '틱톡': 'bg-gray-100 text-gray-700',
}

function formatFollowers(n: number) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}만`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}천`
  return `${n}`
}

const fitScoreGradient = (score: number) => {
  if (score >= 85) return 'from-green-400 to-green-500'
  if (score >= 70) return 'from-yellow-400 to-yellow-500'
  return 'from-gray-300 to-gray-400'
}

type Phase = 'idle' | 'loading' | 'done'

export default function AIListup() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [prompt, setPrompt] = useState('')
  const [phase, setPhase] = useState<Phase>('idle')
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [prefPlatform, setPrefPlatform] = useState('인스타그램')
  const [followerRange, setFollowerRange] = useState('전체')

  const handleAnalyze = () => {
    if (!prompt.trim()) { showToast('브랜드 설명을 입력해주세요.', 'error'); return }
    setPhase('loading')
    setTimeout(() => {
      setPhase('done')
      showToast('AI 리스트업이 완료되었습니다.', 'success')
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

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* 헤더 */}
      <div className="text-center pt-4">
        <div className="relative inline-flex items-center justify-center w-20 h-20 mb-4">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full" />
          <div className="absolute inset-2 bg-gradient-to-br from-purple-200/50 to-blue-200/50 rounded-full" />
          <Sparkles size={28} className="text-purple-600 relative z-10" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">AI 인플루언서 리스트업</h1>
        <p className="text-gray-500 mt-2 text-sm">AI가 브랜드에 딱 맞는 인플루언서를 찾아드려요</p>
      </div>

      {/* 입력 폼 */}
      {phase === 'idle' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">브랜드 설명</label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="예) 저희는 웰니스 라이프스타일 브랜드로, 요가·필라테스 관련 제품을 판매합니다. 25-35세 여성 타겟이며, 진성성 높고 건강한 라이프스타일을 추구하는 인플루언서를 찾고 있습니다."
              rows={5}
              className="w-full text-sm border border-gray-200 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-purple-100 leading-relaxed transition-all duration-150"
            />
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
              className="flex-1 bg-[#8CC63F] text-white py-3 rounded-xl text-sm font-medium hover:bg-[#7AB535] transition-colors duration-150 flex items-center justify-center gap-2"
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
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
              <Loader2 size={28} className="animate-spin text-purple-500" />
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-900 mb-1">브랜드를 분석 중입니다...</p>
          <p className="text-xs text-gray-500 mb-5">최적의 인플루언서를 찾고 있어요</p>
          <div className="space-y-2 text-left max-w-xs mx-auto">
            {['브랜드 키워드 추출 중', '오디언스 매칭 분석 중', 'Fit Score 계산 중'].map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
                <p className="text-xs text-gray-500 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}>{s}</p>
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
              onClick={() => { setPhase('idle'); setPrompt(''); setSelected(new Set()) }}
              className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors duration-150"
            >
              다시 검색
            </button>
          </div>

          <div className="space-y-3">
            {recommendedInfluencers.map((inf, idx) => (
              <div
                key={inf.id}
                onClick={() => toggleSelect(inf.id)}
                className={`relative bg-white rounded-xl border p-4 cursor-pointer transition-all duration-150 ${
                  selected.has(inf.id)
                    ? 'border-gray-900 shadow-md'
                    : 'border-gray-100 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                {/* 순위 뱃지 */}
                <div className="absolute -top-2.5 -left-2.5 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold z-10">
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
                    <div className="flex gap-3 mt-1 text-xs text-gray-500">
                      <span>팔로워 {formatFollowers(inf.followers)}</span>
                      <span>참여율 {inf.engagement}%</span>
                      <span>진성 {inf.authentic}%</span>
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
                          className={`h-1.5 rounded-full bg-gradient-to-r ${fitScoreGradient(inf.fitScore)}`}
                          style={{ width: `${inf.fitScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-gray-900 shrink-0">{inf.fitScore}</span>
                    </div>
                  </div>

                  {/* 선택 체크 */}
                  <div className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-150 ${
                    selected.has(inf.id) ? 'bg-[#8CC63F] border-[#8CC63F]' : 'border-gray-300'
                  }`}>
                    {selected.has(inf.id) && <Check size={12} className="text-white" />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selected.size > 0 && (
            <div className="sticky bottom-4 bg-[#8CC63F] text-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-xl">
              <span className="text-sm font-medium">{selected.size}명 선택됨</span>
              <button
                onClick={() => navigate('/campaigns/new')}
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
