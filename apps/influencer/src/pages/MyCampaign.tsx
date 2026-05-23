import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, Upload, X, AlertCircle, Compass, Edit2, Sparkles, Hash, FileText, Phone, MapPin, ExternalLink } from 'lucide-react'
import Layout from '../components/Layout'
import { ResponsiveSheet, StatusBadge, Tabs, EmptyState, ErrorState, Skeleton, getDDay } from '@wellink/ui'
import { useQAMode } from '@wellink/ui'
import { useToast } from '@wellink/ui'
import { fmtDate } from '@wellink/ui'
import { mockMyCampaigns, mockAppliedData } from '../services/mock/campaigns'
import type { MyCampaign } from '../services/mock/campaigns'
import { getThumbnailFromPool, getPlaceholderDataUri } from '../utils/thumbnailPlaceholder'

// 탭: 진행중(지원완료+검토중+콘텐츠대기+검수중) / 완료 / 미선정
type TabKey = '전체' | '진행중' | '완료' | '미선정'
const STATUS_TABS: TabKey[] = ['전체', '진행중', '완료', '미선정']

const ACTIVE_STATUSES: Set<string> = new Set(['지원완료', '검토중', '콘텐츠대기', '검수중'])


function statusToTab(s: string): TabKey {
  if (ACTIVE_STATUSES.has(s)) return '진행중'
  if (s === '완료') return '완료'
  if (s === '미선정') return '미선정'
  return '전체'
}

// '상세보기' — 원본 mypage/page.tsx L920-925: 미선정/완료 상태에서 apply?mode=view 진입
// campaignRef 기반으로 라우팅 (mc-N id가 숫자 id와 분리되어 있으므로)
// '수정하기' — 원본 mypage/page.tsx L832-865: WAIT 상태 → campaignRef 있을 때만 표시
// '본인이 제출한 컨텐츠' — 원본 mypage/page.tsx L871-903: 완료 캠페인에서 제출 URL 확인
const ACTION_MAP: Partial<Record<string, Array<'신청 정보 보기' | '수정하기' | '취소' | '콘텐츠 제출' | '콘텐츠 수정' | '본인이 제출한 컨텐츠' | '상세보기'>>> = {
  '지원완료':   ['신청 정보 보기', '수정하기', '취소'],
  '검토중':     ['신청 정보 보기', '취소'],
  '콘텐츠대기': ['콘텐츠 제출'],
  '검수중':     ['콘텐츠 수정'],
  '완료':       ['본인이 제출한 컨텐츠'],
  '미선정':     ['상세보기'],
}

function getActions(status: string) {
  return ACTION_MAP[status] ?? []
}

// 콘텐츠 제출 마감 임박 여부 (3일 이내)
function isDeadlineUrgent(dateStr?: string): boolean {
  if (!dateStr) return false
  const diff = new Date(dateStr).getTime() - Date.now()
  return diff > 0 && diff < 1000 * 60 * 60 * 24 * 3
}

export default function MyCampaign() {
  const navigate = useNavigate()
  const qa = useQAMode()
  const { showToast } = useToast()
  const [searchParams] = useSearchParams()

  // URL ?tab= 파라미터로 초기 탭 설정 (ProfileHeader 스탯 카드 클릭 시 진입)
  const urlTab = searchParams.get('tab') as TabKey | null
  const validTabs: TabKey[] = ['전체', '진행중', '완료', '미선정']
  const initialTab: TabKey = urlTab && validTabs.includes(urlTab) ? urlTab : '전체'
  // URL ?status= 파라미터: 진행중 탭 내 sub-filter
  // '지원완료' → status === '지원완료' / '참여중' → 검토중|콘텐츠대기|검수중
  const urlStatus = searchParams.get('status')

  // 초기값은 useEffect에서 qa에 따라 동기화한다. lazy init과 useEffect의 분기 중복을 막기 위해 mockMyCampaigns를 시작값으로 둠.
  const [campaigns, setCampaigns] = useState<MyCampaign[]>(mockMyCampaigns)
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab)
  const [cancelModal, setCancelModal] = useState<MyCampaign | null>(null)
  const [submitModal, setSubmitModal] = useState<MyCampaign | null>(null)
  const [appliedModal, setAppliedModal] = useState<MyCampaign | null>(null)
  const [contentUrl, setContentUrl] = useState('')
  const [guideAgreed, setGuideAgreed] = useState(false)
  const [search, setSearch] = useState('')

  // QA 파라미터 외부 동기화 (정책 §외부동기화)
  // tab-X-empty 패턴은 해당 탭으로 이동 + campaigns를 빈 배열로 설정해 탭 빈 상태 검증
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (qa === 'empty') { setCampaigns([]); return }
    if (qa === 'modal-cancel') { setCancelModal(mockMyCampaigns[0]); return }
    if (qa === 'modal-submit') { setSubmitModal(mockMyCampaigns[0]); return }
    const tabMap: Record<string, TabKey> = {
      'tab-신청완료': '진행중', 'tab-진행중': '진행중',
      'tab-게시완료': '완료', 'tab-포인트지급': '완료',
      'tab-검수중':   '진행중',
      'tab-미선정':   '미선정',
      'tab-신청완료-empty': '진행중', 'tab-진행중-empty': '진행중',
      'tab-게시완료-empty': '완료',   'tab-포인트지급-empty': '완료',
    }
    if (qa && tabMap[qa]) setActiveTab(tabMap[qa])
    setCampaigns(qa?.endsWith('-empty') ? [] : mockMyCampaigns)
  }, [qa])

  const PARTICIPATING_STATUSES = ['검토중', '콘텐츠대기', '검수중']

  const filtered = useMemo(() => {
    let list = campaigns
    if (activeTab !== '전체') list = list.filter(c => statusToTab(c.status) === activeTab)
    // sub-filter: ProfileHeader 스탯 카드 '지원 완료' / '참여중' 클릭 시 적용
    if (urlStatus === '지원완료') list = list.filter(c => c.status === '지원완료')
    else if (urlStatus === '참여중') list = list.filter(c => PARTICIPATING_STATUSES.includes(c.status))
    const q = search.trim().toLowerCase()
    if (q) list = list.filter(c => c.name.toLowerCase().includes(q) || c.brand.toLowerCase().includes(q))
    return list
  }, [campaigns, activeTab, urlStatus, search])

  const countByTab = (tab: TabKey) => {
    if (tab === '전체') return campaigns.length
    return campaigns.filter(c => statusToTab(c.status) === tab).length
  }

  const handleContentSubmit = () => {
    const url = contentUrl.trim()
    if (!url) { showToast('콘텐츠 URL을 입력해 주세요', 'error'); return }
    if (!/^https?:\/\/.+\..+/.test(url)) { showToast('올바른 URL 형식이 아니에요 (예: https://...)', 'error'); return }
    // 검수중 상태에서 다시 열린 경우 = 콘텐츠 수정, 아니면 = 신규 제출 (cold-review 7차 H3)
    const isEdit = submitModal?.status === '검수중'
    // postUrl 도 함께 저장 — 검수중 상태에서 '콘텐츠 수정' 버튼 동작에 필요
    setCampaigns(prev => prev.map(c => c.id === submitModal?.id ? { ...c, status: '검수중' as const, progress: '게시 콘텐츠 확인 중', postUrl: url } : c))
    showToast(isEdit ? '콘텐츠를 수정했어요!' : '콘텐츠를 제출했어요!', 'success')
    setSubmitModal(null)
    setContentUrl('')
    setGuideAgreed(false)
  }

  const handleCancel = (id: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== id))
    setCancelModal(null)
    showToast('신청을 취소했어요', 'info')
  }

  if (qa === 'loading') {
    return (
      <Layout>
        <div className="space-y-4">
          <Skeleton shape="text" height={20} width="8rem" />
          <div className="flex gap-2">
            {[1,2,3,4].map(i => <Skeleton key={i} shape="circle" height={28} width="4rem" />)}
          </div>
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
              <div className="flex justify-between">
                <Skeleton shape="text" height={16} width="9rem" />
                <Skeleton shape="circle" height={20} width="4rem" />
              </div>
              <Skeleton shape="text" height={12} width="12rem" />
              <div className="flex gap-2">
                <Skeleton shape="card" height={32} width="100%" className="flex-1" />
                <Skeleton shape="card" height={32} width="5rem" />
              </div>
            </div>
          ))}
        </div>
      </Layout>
    )
  }

  if (qa === 'error') {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[350px]">
          <ErrorState message="내 캠페인을 불러오지 못했어요" onRetry={() => window.location.reload()} />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-4">
        <h1 className="sr-only">내 캠페인</h1>
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">내 캠페인</h2>
            <p className="text-sm text-gray-500 mt-0.5">총 {campaigns.length}개 진행 중</p>
          </div>
          <button
            onClick={() => navigate('/campaigns/browse')}
            className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
          >
            <Compass size={12} />
            캠페인 찾기
          </button>
        </div>

        {/* 검색 */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="캠페인 또는 브랜드 검색"
            aria-label="캠페인 검색"
            autoComplete="off"
            className="w-full pl-10 pr-9 py-2.5 text-base border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 focus:border-brand-green focus:bg-white transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} aria-label="검색어 지우기" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">
              <X size={14} />
            </button>
          )}
        </div>

        {/* 탭 — 가로 스크롤 + 쉐브론 */}
        <Tabs
          variant="pill"
          value={activeTab}
          onChange={(v) => setActiveTab(v as TabKey)}
          ariaLabel="캠페인 상태 필터"
          items={STATUS_TABS.map(tab => ({
            value: tab,
            label: tab,
            trailing: (
              <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap ${
                activeTab === tab ? 'bg-white/20 text-white' : 'bg-white text-gray-500'
              }`}>
                {countByTab(tab)}
              </span>
            ),
          }))}
        />

        {/* 카드 리스트 */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-12">
            <EmptyState
              variant={search ? 'search' : 'default'}
              title={search ? '검색 결과가 없어요' : '해당 상태의 캠페인이 없어요'}
              description={!search ? '새로운 캠페인에 신청해 보세요' : undefined}
              action={!search ? (
                <button
                  onClick={() => navigate('/campaigns/browse')}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-brand-green hover:bg-brand-green-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                >
                  캠페인 찾아보기
                </button>
              ) : undefined}
            />
          </div>
        ) : (
          <div className="space-y-3">
            {/* ── 원본 UI 비교용 (1개) ── */}
            {filtered.length > 0 && (() => {
              const c = filtered[0]
              return (
                <div className="relative">
                  <span className="absolute -top-2 left-3 z-10 text-[10px] font-bold px-2 py-0.5 bg-zinc-700 text-white rounded-full">원본</span>
                  <div className="group flex flex-col gap-3 p-5 rounded-xl border border-zinc-100 bg-white hover:border-lime-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                    onClick={() => c.campaignRef && navigate(`/campaigns/${c.campaignRef}`)}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                      <div className="relative w-full sm:w-20 h-40 sm:h-20 rounded-lg overflow-hidden border border-zinc-100 flex-shrink-0">
                        <img src={getThumbnailFromPool(c.campaignRef ?? 1)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={e => { e.currentTarget.src = getPlaceholderDataUri(c.campaignRef ?? 1) }} />
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                      </div>
                      <div className="flex-1 w-full min-w-0">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded border uppercase tracking-wider flex items-center gap-1 bg-blue-50 text-blue-600 border-blue-100">WAIT</span>
                            <span className="text-xs font-medium text-zinc-500">{c.brand}</span>
                          </div>
                          <h3 className="font-bold text-zinc-900 text-base truncate pr-4 group-hover:text-lime-600 transition-colors">{c.name}</h3>
                          <div className="flex items-center gap-x-4 gap-y-1 text-xs text-zinc-500 flex-wrap">
                            <span className="px-2 flex items-center gap-1 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider bg-lime-100 text-lime-700">
                              <AlertCircle size={12} className="text-zinc-400" />모집중
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="w-full sm:w-auto flex flex-row gap-2 flex-shrink-0">
                        <button className="flex-1 sm:flex-none px-4 py-2.5 font-medium rounded-lg border text-sm whitespace-nowrap text-zinc-700 border-zinc-200 hover:bg-zinc-100 transition-colors">신청 취소</button>
                        <button className="flex-1 sm:flex-none px-4 py-2.5 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors text-sm whitespace-nowrap">수정하기</button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}
            {/* ── 워싱 UI ── */}
            {filtered.map(c => {
              const actions = getActions(c.status)
              // A: 원본 mypage/page.tsx L791-794 — ACTIVE/CONFIRMED 상태 모두에 배너 표시
              // '콘텐츠대기' = ACTIVE (선정 후 업로드 대기), '검수중' = CONFIRMED (업로드 후 검수 중)
              const urgent = (c.status === '콘텐츠대기' || c.status === '검수중') && isDeadlineUrgent(c.contentDeadline)
              return (
                <div key={c.id} className={`bg-white rounded-2xl border shadow-sm p-4 transition-all ${urgent ? 'border-orange-200' : 'border-gray-100'}`}>
                  {/* 마감 임박 알림 */}
                  {urgent && (
                    <div className="flex items-start gap-1.5 mb-3 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-xl break-keep">
                      <AlertCircle size={14} className="shrink-0 mt-0.5" aria-hidden="true" />
                      <span>콘텐츠 제출 마감이 {fmtDate(c.contentDeadline!)}까지예요!</span>
                    </div>
                  )}

                  {/* 카드 상단 — campaignRef 있으면 클릭 시 캠페인 상세로 이동 (원본 mypage L811) */}
                  {c.campaignRef ? (
                    <button
                      onClick={() => navigate(`/campaigns/${c.campaignRef}`)}
                      className="w-full flex items-start gap-3 mb-2 text-left hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded-xl"
                      aria-label={`${c.name} 캠페인 상세 보기`}
                    >
                      <img
                        src={getThumbnailFromPool(c.campaignRef)}
                        alt=""
                        loading="lazy"
                        className="w-20 h-20 rounded-xl object-cover shrink-0"
                        onError={(e) => { e.currentTarget.src = getPlaceholderDataUri(c.campaignRef!, c.brand) }}
                      />
                      <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <StatusBadge status={c.status} size="sm" />
                            {/* 원본 mypage L122-124 getDDayLabel() — 콘텐츠 마감 D-day */}
                            {c.contentDeadline && (() => {
                              const dd = getDDay(c.contentDeadline)
                              if (!dd) return null
                              return (
                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded whitespace-nowrap ${(dd.color === 'red' || dd.color === 'orange') ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                                  {dd.label}
                                </span>
                              )
                            })()}
                            <span className="text-sm text-gray-500">{c.channel}</span>
                          </div>
                          <p className="text-base font-bold text-gray-900 line-clamp-2 break-keep">{c.name}</p>
                          <p className="text-sm text-gray-500 mt-0.5 truncate">{c.brand} · 신청 {fmtDate(c.appliedAt)}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm text-gray-500">리워드</p>
                          <p className="text-base font-bold text-gray-900 tabular-nums whitespace-nowrap">{c.reward}</p>
                        </div>
                      </div>
                    </button>
                  ) : (
                    <div className="flex items-start gap-3 mb-2">
                      {/* 캠페인 썸네일 — 원본 mypage/page.tsx L704-732 */}
                      <img
                        src={getThumbnailFromPool(c.id)}
                        alt=""
                        loading="lazy"
                        className="w-20 h-20 rounded-xl object-cover shrink-0"
                        onError={(e) => { e.currentTarget.src = getPlaceholderDataUri(c.id, c.brand) }}
                      />
                      <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <StatusBadge status={c.status} size="sm" />
                            {/* 원본 mypage L122-124 getDDayLabel() — 콘텐츠 마감 D-day */}
                            {c.contentDeadline && (() => {
                              const dd = getDDay(c.contentDeadline)
                              if (!dd) return null
                              return (
                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded whitespace-nowrap ${(dd.color === 'red' || dd.color === 'orange') ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                                  {dd.label}
                                </span>
                              )
                            })()}
                            <span className="text-sm text-gray-500">{c.channel}</span>
                          </div>
                          <p className="text-base font-bold text-gray-900 line-clamp-2 break-keep">{c.name}</p>
                          <p className="text-sm text-gray-500 mt-0.5 truncate">{c.brand} · 신청 {fmtDate(c.appliedAt)}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm text-gray-500">리워드</p>
                          <p className="text-base font-bold text-gray-900 tabular-nums whitespace-nowrap">{c.reward}</p>
                        </div>
                      </div>
                    </div>
                  )}


                  {/* 액션 버튼 — flex-wrap + min-w로 좁은 모바일(360px)에서 자연 줄바꿈 */}
                  <div className="flex flex-wrap gap-1.5">
                    {actions.map(action => {
                      // '수정하기' — campaignRef 없으면 버튼 숨김 (원본 조건 동일)
                      if (action === '수정하기') {
                        if (!c.campaignRef) return null
                        return (
                          <button key={action}
                            onClick={() => navigate(`/campaigns/${c.campaignRef}/apply?mode=edit`)}
                            className="flex-1 min-w-[120px] flex items-center justify-center gap-1 py-2 rounded-xl text-sm font-medium border border-brand-green-border text-brand-green-text hover:bg-brand-green-bg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">
                            <Edit2 size={14} />수정하기
                          </button>
                        )
                      }
                      if (action === '콘텐츠 제출') return (
                        <button key={action}
                          onClick={() => setSubmitModal(c)}
                          className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold text-white bg-brand-green hover:bg-brand-green-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">
                          <Upload size={14} />콘텐츠 제출
                        </button>
                      )
                      if (action === '콘텐츠 수정') return (
                        <button key={action}
                          onClick={() => { setSubmitModal(c); setContentUrl(c.postUrl ?? '') }}
                          className="flex-1 min-w-[120px] flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-sm font-medium border border-brand-green-border text-brand-green-text hover:bg-brand-green/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">
                          <Edit2 size={14} />콘텐츠 수정
                        </button>
                      )
                      if (action === '신청 정보 보기') return (
                        <button key={action}
                          onClick={() => setAppliedModal(c)}
                          className="flex-1 min-w-[120px] flex items-center justify-center gap-1 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">
                          <FileText size={14} />신청 정보 보기
                        </button>
                      )
                      if (action === '본인이 제출한 컨텐츠') return (
                        // 원본 mypage L871-903: postUrl이 있으면 새 탭으로 직접 이동, 없으면 안내 토스트
                        <button key={action}
                          onClick={() => {
                            if (c.postUrl) window.open(c.postUrl, '_blank', 'noopener,noreferrer')
                            else showToast('제출된 콘텐츠가 없어요', 'info')
                          }}
                          className="flex-1 min-w-[120px] flex items-center justify-center gap-1 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">
                          <ExternalLink size={14} />본인이 제출한 컨텐츠
                        </button>
                      )
                      if (action === '취소') return (
                        <button key={action}
                          onClick={() => setCancelModal(c)}
                          className="flex-1 min-w-[120px] flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-sm font-medium border border-red-100 text-red-400 hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/60">
                          <X size={14} />신청 취소
                        </button>
                      )
                      // 원본 mypage/page.tsx L920-925: 미선정 상태에서 apply?mode=view 진입
                      if (action === '상세보기') return (
                        <button key={action}
                          onClick={() => c.campaignRef && navigate(`/campaigns/${c.campaignRef}/apply?mode=view`)}
                          disabled={!c.campaignRef}
                          className="flex-1 min-w-[120px] flex items-center justify-center gap-1 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 disabled:opacity-40 disabled:cursor-not-allowed">
                          <FileText size={14} />상세보기
                        </button>
                      )
                      return null
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 콘텐츠 제출/수정 바텀시트 — submitModal.status === '검수중' 이면 수정 모드 (H2/H3) */}
      <ResponsiveSheet open={!!submitModal} onClose={() => { setSubmitModal(null); setContentUrl(''); setGuideAgreed(false) }} title={submitModal?.status === '검수중' ? '콘텐츠 수정' : '콘텐츠 제출'} size="md">
        <div className="space-y-4">
          <p className="text-sm text-gray-600"><strong className="text-gray-900">{submitModal?.name}</strong>에 게시한 콘텐츠 URL을 입력해 주세요</p>
          {/* 미션 가이드 + 필수 키워드 — 카드 대신 제출 모달에서 표시 */}
          {(submitModal?.missionGuide || (submitModal?.requiredKeywords && submitModal.requiredKeywords.length > 0)) && (
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 space-y-2.5">
              {submitModal?.missionGuide && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles size={12} className="text-brand-green-text" aria-hidden="true" />
                    <span className="text-xs font-bold text-gray-700">미션 가이드</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed break-keep">{submitModal.missionGuide}</p>
                </div>
              )}
              {submitModal?.requiredKeywords && submitModal.requiredKeywords.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Hash size={12} className="text-brand-green-text" aria-hidden="true" />
                    <span className="text-xs font-bold text-gray-700">필수 키워드</span>
                    <span className="text-xs text-gray-400">(캡션에 모두 포함)</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {submitModal.requiredKeywords.map(k => (
                      <span key={k} className="text-xs font-medium text-brand-green-text bg-brand-green-bg border border-brand-green-border px-2 py-0.5 rounded-md">
                        #{k}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center">
            <Upload size={22} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">인스타그램, 블로그, 유튜브 등 게시 링크</p>
          </div>
          <div>
            <label htmlFor="content-url" className="text-sm text-gray-600 mb-1.5 block font-medium">콘텐츠 URL</label>
            <input
              id="content-url"
              type="url"
              inputMode="url"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              value={contentUrl}
              onChange={e => setContentUrl(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleContentSubmit() }}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-base outline-none focus:border-brand-green focus-visible:ring-2 focus-visible:ring-brand-green/50 transition-colors"
              placeholder="https://instagram.com/p/..."
            />
          </div>
          {/* 가이드 준수 동의 — 원본 CampaignApplyForm.tsx L977-997: contentLinkGuideAgreed 체크 필수 */}
          <label className="flex items-start gap-2.5 cursor-pointer p-3 rounded-xl border transition-colors border-gray-100 bg-gray-50">
            <input
              type="checkbox"
              checked={guideAgreed}
              onChange={e => setGuideAgreed(e.target.checked)}
              className="mt-0.5 accent-brand-green"
            />
            <span className="text-sm text-gray-700 leading-snug break-keep">캠페인 가이드라인을 확인하였으며, 준수할 것에 동의합니다. <span className="text-red-500">*</span></span>
          </label>
          <div className="flex gap-2">
            <button onClick={() => { setSubmitModal(null); setContentUrl(''); setGuideAgreed(false) }} className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">닫기</button>
            <button onClick={handleContentSubmit} disabled={!contentUrl.trim() || !guideAgreed} aria-disabled={!contentUrl.trim() || !guideAgreed} className="flex-1 bg-brand-green text-white py-3 rounded-xl text-sm font-medium hover:bg-brand-green-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">{submitModal?.status === '검수중' ? '수정하기' : '제출하기'}</button>
          </div>
        </div>
      </ResponsiveSheet>

      {/* 신청 취소 */}
      <ResponsiveSheet open={!!cancelModal} onClose={() => setCancelModal(null)} title="신청 취소">
        <div className="space-y-4">
          <p className="text-sm text-gray-600"><strong className="text-gray-900">{cancelModal?.name}</strong> 신청을 취소하시겠어요?</p>
          <p className="text-sm text-gray-500">취소 후에는 재신청이 어려울 수 있어요</p>
          <div className="flex gap-2">
            <button onClick={() => setCancelModal(null)} className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">유지하기</button>
            <button onClick={() => cancelModal && handleCancel(cancelModal.id)} className="flex-1 bg-red-500 text-white py-3 rounded-xl text-sm font-medium hover:bg-red-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/60">취소하기</button>
          </div>
        </div>
      </ResponsiveSheet>

      <ResponsiveSheet open={!!appliedModal} onClose={() => setAppliedModal(null)} title="신청 정보" size="md">
        {appliedModal && (() => {
          const applied = mockAppliedData[appliedModal.id]
          if (!applied) {
            return <p className="text-sm text-gray-500 py-4">신청 정보를 불러올 수 없어요</p>
          }
          return (
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <p className="text-sm font-semibold text-gray-700 mb-1">{appliedModal.name}</p>
                <p className="text-sm text-gray-500">{appliedModal.brand} · {appliedModal.channel}</p>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <Phone size={14} className="text-gray-400 mt-1 shrink-0" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-500">연락처</p>
                    <p className="text-sm font-medium text-gray-900 tabular-nums">{applied.phone}</p>
                  </div>
                </div>

                {applied.deliveryAddr && (
                  <div className="flex items-start gap-2.5">
                    <MapPin size={14} className="text-gray-400 mt-1 shrink-0" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-500">배송지 ({applied.deliveryName})</p>
                      <p className="text-sm font-medium text-gray-900 break-keep">
                        {applied.deliveryZip && <span className="text-gray-500 tabular-nums">({applied.deliveryZip}) </span>}
                        {applied.deliveryAddr}{applied.deliveryAddrDetail ? ` ${applied.deliveryAddrDetail}` : ''}
                      </p>
                    </div>
                  </div>
                )}

                {Object.entries(applied.answers).length > 0 && (
                  <div className="flex items-start gap-2.5">
                    <FileText size={14} className="text-gray-400 mt-1 shrink-0" aria-hidden="true" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <p className="text-sm text-gray-500">추가 답변</p>
                      {Object.values(applied.answers).map((a, i) => (
                        <p key={i} className="text-sm text-gray-900 break-keep leading-relaxed">{a}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setAppliedModal(null)}
                  className="w-full py-3 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                >닫기</button>
              </div>
            </div>
          )
        })()}
      </ResponsiveSheet>
    </Layout>
  )
}
