import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, Upload, X, AlertCircle, Compass, Edit2, Sparkles, Hash, FileText, Phone, MapPin, ExternalLink } from 'lucide-react'
import Layout from '../components/Layout'
import { ResponsiveSheet, StatusBadge, Tabs, EmptyState, ErrorState, Skeleton, getDDay, getDDayBadgeStyle } from '@wellink/ui'
import { useQAMode } from '@wellink/ui'
import { useToast } from '@wellink/ui'
import { fmtDate } from '@wellink/ui'
import { mockMyCampaigns, mockAppliedData } from '../services/mock/campaigns'
import type { MyCampaign } from '../services/mock/campaigns'
import { getThumbnailFromPool, getPlaceholderDataUri } from '../utils/thumbnailPlaceholder'

// 탭: 지원완료(WAIT) / 참여중(ACTIVE·CONFIRMED) / 완료 / 미선정
type TabKey = '전체' | '지원완료' | '참여중' | '완료' | '미선정'
const STATUS_TABS: TabKey[] = ['전체', '지원완료', '참여중', '완료', '미선정']

const WAIT_STATUSES: Set<string> = new Set(['지원완료'])
const ACTIVE_STATUSES: Set<string> = new Set(['검토중', '콘텐츠대기', '검수중'])

function statusToTab(s: string): TabKey {
  if (WAIT_STATUSES.has(s)) return '지원완료'
  if (ACTIVE_STATUSES.has(s)) return '참여중'
  if (s === '완료') return '완료'
  if (s === '미선정') return '미선정'
  return '전체'
}

// '상세보기' — 원본 mypage/page.tsx L920-925: 미선정/완료 상태에서 apply?mode=view 진입
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

// 원본 mypage/page.tsx L772-789: participateEndDate → 모집중/종료됨
function getRecruitChip(applyEnd?: string): { label: string; className: string } | null {
  if (!applyEnd) return null
  const end = new Date(applyEnd)
  if (isNaN(end.getTime())) return null
  end.setHours(23, 59, 59, 999)
  if (end >= new Date()) return { label: '모집중', className: 'bg-lime-100 text-lime-700' }
  return { label: '종료됨', className: 'bg-gray-100 text-gray-500' }
}

export default function MyCampaign() {
  const navigate = useNavigate()
  const qa = useQAMode()
  const { showToast } = useToast()
  const [searchParams] = useSearchParams()

  const urlTab = searchParams.get('tab') as TabKey | null
  const validTabs: TabKey[] = ['전체', '지원완료', '참여중', '완료', '미선정']
  const initialTab: TabKey = urlTab && validTabs.includes(urlTab) ? urlTab : '전체'

  const [campaigns, setCampaigns] = useState<MyCampaign[]>(mockMyCampaigns)
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab)

  useEffect(() => {
    const t = searchParams.get('tab') as TabKey | null
    if (t && validTabs.includes(t)) setActiveTab(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const [cancelModal, setCancelModal] = useState<MyCampaign | null>(null)
  const [submitModal, setSubmitModal] = useState<MyCampaign | null>(null)
  const [appliedModal, setAppliedModal] = useState<MyCampaign | null>(null)
  const [contentUrl, setContentUrl] = useState('')
  const [guideAgreed, setGuideAgreed] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (qa === 'empty') { setCampaigns([]); return }
    if (qa === 'modal-cancel') { setCancelModal(mockMyCampaigns[0]); return }
    if (qa === 'modal-submit') { setSubmitModal(mockMyCampaigns[0]); return }
    const tabMap: Record<string, TabKey> = {
      'tab-신청완료': '지원완료', 'tab-진행중': '참여중',
      'tab-게시완료': '완료',     'tab-포인트지급': '완료',
      'tab-검수중':   '참여중',
      'tab-미선정':   '미선정',
      'tab-신청완료-empty': '지원완료', 'tab-진행중-empty': '참여중',
      'tab-게시완료-empty': '완료',     'tab-포인트지급-empty': '완료',
    }
    if (qa && tabMap[qa]) setActiveTab(tabMap[qa])
    setCampaigns(qa?.endsWith('-empty') ? [] : mockMyCampaigns)
  }, [qa])

  const filtered = useMemo(() => {
    let list = campaigns
    if (activeTab !== '전체') list = list.filter(c => statusToTab(c.status) === activeTab)
    const q = search.trim().toLowerCase()
    if (q) list = list.filter(c => c.name.toLowerCase().includes(q) || c.brand.toLowerCase().includes(q))
    return list
  }, [campaigns, activeTab, search])

  const countByTab = (tab: TabKey) => {
    if (tab === '전체') return campaigns.length
    return campaigns.filter(c => statusToTab(c.status) === tab).length
  }

  const handleContentSubmit = () => {
    const url = contentUrl.trim()
    if (!url) { showToast('콘텐츠 URL을 입력해 주세요', 'error'); return }
    if (!/^https?:\/\/.+\..+/.test(url)) { showToast('올바른 URL 형식이 아니에요 (예: https://...)', 'error'); return }
    const isEdit = submitModal?.status === '검수중'
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

  // ── 로딩 스켈레톤 (리스트형) ─────────────────────────────────────────────
  if (qa === 'loading') {
    return (
      <Layout>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <Skeleton shape="text" height={16} width="5.5rem" />
              <Skeleton shape="text" height={12} width="7rem" />
            </div>
            <Skeleton shape="card" height={32} width="5.5rem" />
          </div>
          <Skeleton shape="card" height={42} width="100%" />
          <div className="flex gap-2">
            {[60, 56, 56, 48, 52].map((w, i) => (
              <Skeleton key={i} shape="card" height={36} width={`${w}px`} />
            ))}
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 @[640px]:p-5">
                {/* 모바일: 썸네일+정보 위, 버튼 아래 / 데스크탑: 썸네일+정보+버튼 한 행 */}
                <div className="flex gap-3 @[640px]:gap-4 items-start">
                  <Skeleton shape="card" height={72} width={72} className="rounded-xl flex-shrink-0 @[640px]:!h-[100px] @[640px]:!w-[100px]" />
                  <div className="flex-1 min-w-0 flex flex-col @[640px]:flex-row @[640px]:items-start @[640px]:gap-4">
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex gap-1.5">
                        <Skeleton shape="card" height={20} width="4rem" />
                        <Skeleton shape="card" height={20} width="3rem" />
                      </div>
                      <Skeleton shape="text" height={14} width="85%" />
                      <Skeleton shape="text" height={12} width="55%" />
                      <Skeleton shape="text" height={12} width="40%" />
                    </div>
                    {/* 버튼 영역: 모바일 border-t 아래, 데스크탑 우측 */}
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 @[640px]:mt-0 @[640px]:pt-0 @[640px]:border-0 @[640px]:flex-col @[640px]:shrink-0 @[640px]:w-[140px]">
                      <Skeleton shape="card" height={36} className="flex-1 @[640px]:flex-none @[640px]:w-full" />
                      <Skeleton shape="card" height={36} className="flex-1 @[640px]:flex-none @[640px]:w-full" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
            className="w-full pl-10 pr-9 py-2.5 text-base border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 focus:bg-white transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} aria-label="검색어 지우기" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">
              <X size={14} />
            </button>
          )}
        </div>

        {/* 탭 */}
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

        {/* 리스트 */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-12">
            {!search && activeTab === '전체' && campaigns.length === 0 ? (
              <ErrorState
                message="알 수 없는 오류가 발생했어요"
                subMessage="잠시 후 다시 시도해 주세요"
                retryLabel="캠페인 탐색으로 이동"
                showRetryIcon={false}
                onRetry={() => navigate('/campaigns/browse')}
              />
            ) : (
              <EmptyState
                variant={search ? 'search' : 'default'}
                title={search ? '검색 결과가 없어요' : '해당 상태의 캠페인이 없어요'}
                description={search ? `'${search}'와 일치하는 캠페인이 없어요` : '새로운 캠페인에 신청해 보세요'}
                action={search ? (
                  <button
                    onClick={() => setSearch('')}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                  >
                    검색어 지우기
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/campaigns/browse')}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-brand-green hover:bg-brand-green-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                  >
                    캠페인 찾아보기
                  </button>
                )}
              />
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map(c => {
              const actions = getActions(c.status)
              const urgent = (c.status === '콘텐츠대기' || c.status === '검수중') && isDeadlineUrgent(c.contentDeadline)
              const recruitChip = getRecruitChip(c.applyEnd)
              const dday = c.contentDeadline ? getDDay(c.contentDeadline) : null

              return (
                <div key={c.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-shadow hover:shadow-md ${urgent ? 'border-orange-200' : 'border-gray-100'}`}>

                  {/* 마감 임박 배너 */}
                  {urgent && (
                    <div className="flex items-start gap-1.5 text-sm text-orange-600 bg-orange-50 px-4 py-2.5 border-b border-orange-100">
                      <AlertCircle size={14} className="shrink-0 mt-0.5" aria-hidden="true" />
                      <span>콘텐츠 제출 마감이 <strong>{fmtDate(c.contentDeadline!)}</strong>까지예요!</span>
                    </div>
                  )}

                  <div className="p-4 @[640px]:p-5">
                    <div className="flex gap-3 @[640px]:gap-4 items-start">
                      {/* 썸네일: 모바일 72px, 데스크탑 100px */}
                      <div
                        className={`w-[72px] h-[72px] @[640px]:w-[100px] @[640px]:h-[100px] rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 ${c.campaignRef ? 'cursor-pointer' : ''}`}
                        onClick={() => c.campaignRef && navigate(`/campaigns/${c.campaignRef}`)}
                      >
                        <img
                          src={getThumbnailFromPool(c.campaignRef ?? c.id)}
                          alt=""
                          loading="lazy"
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => { e.currentTarget.src = getPlaceholderDataUri(c.campaignRef ?? c.id, c.brand) }}
                        />
                      </div>

                      {/* 정보 + 액션 버튼 */}
                      <div className="flex-1 min-w-0 flex flex-col @[640px]:flex-row @[640px]:items-start @[640px]:gap-4">

                        {/* 정보 */}
                        <div className="flex-1 min-w-0">
                          {/* 배지 행: 참여 상태 + 캠페인 모집 상태 */}
                          <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                            <StatusBadge status={c.status} size="sm" />
                            {recruitChip && (
                              <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-md whitespace-nowrap ${recruitChip.className}`}>
                                {recruitChip.label}
                              </span>
                            )}
                            {dday && (
                              <span className={getDDayBadgeStyle(dday.color, dday.pulse)}>{dday.label}</span>
                            )}
                          </div>

                          {/* 캠페인명 */}
                          <h3 className="text-sm @[640px]:text-base font-bold text-gray-900 line-clamp-2 break-keep leading-snug mb-1">{c.name}</h3>

                          {/* 브랜드 + 신청일 */}
                          <p className="text-xs text-gray-500 truncate">{c.brand} · 신청 {fmtDate(c.appliedAt)}</p>

                          {/* 리워드 */}
                          {c.rewardAmount > 0 && (
                            <p className="text-xs text-gray-400 mt-0.5">{c.rewardAmount.toLocaleString('ko-KR')}원 상당 혜택</p>
                          )}
                        </div>

                        {/* 액션 버튼:
                            모바일 — border-t 아래, flex-row 가득 채움
                            데스크탑(@[640px]) — 우측 고정 열(140px), flex-col */}
                        {actions.length > 0 && (
                          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 flex-wrap @[640px]:mt-0 @[640px]:pt-0 @[640px]:border-0 @[640px]:flex-col @[640px]:flex-nowrap @[640px]:shrink-0 @[640px]:w-[140px]">
                            {actions.map(action => {
                              // 데스크탑: 버튼 폭 100%, 모바일: flex-1
                              const btnBase = 'flex items-center justify-center gap-1 py-2 rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 whitespace-nowrap flex-1 @[640px]:flex-none @[640px]:w-full'
                              if (action === '수정하기') {
                                if (!c.campaignRef) return null
                                return (
                                  <button key={action}
                                    onClick={() => navigate(`/campaigns/${c.campaignRef}/apply?mode=edit`)}
                                    className={`${btnBase} border border-brand-green-border text-brand-green-text hover:bg-brand-green-bg`}>
                                    <Edit2 size={13} />수정하기
                                  </button>
                                )
                              }
                              if (action === '콘텐츠 제출') return (
                                <button key={action}
                                  onClick={() => setSubmitModal(c)}
                                  className={`${btnBase} text-white bg-brand-green hover:bg-brand-green-hover font-semibold`}>
                                  <Upload size={13} />콘텐츠 제출
                                </button>
                              )
                              if (action === '콘텐츠 수정') return (
                                <button key={action}
                                  onClick={() => { setSubmitModal(c); setContentUrl(c.postUrl ?? '') }}
                                  className={`${btnBase} border border-brand-green-border text-brand-green-text hover:bg-brand-green/5`}>
                                  <Edit2 size={13} />콘텐츠 수정
                                </button>
                              )
                              if (action === '신청 정보 보기') return (
                                <button key={action}
                                  onClick={() => setAppliedModal(c)}
                                  className={`${btnBase} border border-gray-200 text-gray-700 hover:bg-gray-50`}>
                                  <FileText size={13} />신청 정보
                                </button>
                              )
                              if (action === '본인이 제출한 컨텐츠') return (
                                <button key={action}
                                  onClick={() => {
                                    if (c.postUrl) window.open(c.postUrl, '_blank', 'noopener,noreferrer')
                                    else showToast('제출된 콘텐츠가 없어요', 'info')
                                  }}
                                  className={`${btnBase} border border-gray-200 text-gray-600 bg-gray-50 hover:bg-gray-100`}>
                                  <ExternalLink size={13} />내 콘텐츠
                                </button>
                              )
                              if (action === '취소') return (
                                <button key={action}
                                  onClick={() => setCancelModal(c)}
                                  className={`${btnBase} border border-red-100 text-red-400 hover:bg-red-50 focus-visible:ring-red-300/60`}>
                                  <X size={13} />취소
                                </button>
                              )
                              if (action === '상세보기') return (
                                <button key={action}
                                  onClick={() => c.campaignRef && navigate(`/campaigns/${c.campaignRef}/apply?mode=view`)}
                                  disabled={!c.campaignRef}
                                  className={`${btnBase} border border-gray-200 text-gray-600 bg-gray-50 hover:bg-gray-100 disabled:opacity-40`}>
                                  <FileText size={13} />상세보기
                                </button>
                              )
                              return null
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 콘텐츠 제출/수정 */}
      <ResponsiveSheet open={!!submitModal} onClose={() => { setSubmitModal(null); setContentUrl(''); setGuideAgreed(false) }} title={submitModal?.status === '검수중' ? '콘텐츠 수정' : '콘텐츠 제출'} size="md">
        <div className="space-y-4">
          <p className="text-sm text-gray-600"><strong className="text-gray-900">{submitModal?.name}</strong>에 게시한 콘텐츠 URL을 입력해 주세요</p>
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
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-base outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 transition-colors"
              placeholder="https://instagram.com/p/..."
            />
          </div>
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

      {/* 신청 정보 */}
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
