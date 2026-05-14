import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Upload, X, AlertCircle, Compass, Edit2, Sparkles, Hash } from 'lucide-react'
import Layout from '../components/Layout'
import { Modal, StatusBadge, Tabs, EmptyState, ErrorState, Skeleton } from '@wellink/ui'
import { useQAMode } from '@wellink/ui'
import { useToast } from '@wellink/ui'
import { fmtDate } from '@wellink/ui'
import { mockMyCampaigns } from '../services/mock/campaigns'
import type { MyCampaign } from '../services/mock/campaigns'

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

const ACTION_MAP: Partial<Record<string, Array<'신청 정보 보기' | '취소' | '콘텐츠 제출' | '상세보기'>>> = {
  '지원완료':   ['신청 정보 보기', '취소'],
  '검토중':     ['취소'],
  '콘텐츠대기': ['콘텐츠 제출'],
  '검수중':     ['상세보기'],
  '완료':       ['상세보기'],
  '미선정':     ['상세보기'],
}

function getActions(status: string) {
  return ACTION_MAP[status] ?? (['상세보기'] as const)
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

  // 초기값은 useEffect에서 qa에 따라 동기화한다. lazy init과 useEffect의 분기 중복을 막기 위해 mockMyCampaigns를 시작값으로 둠.
  const [campaigns, setCampaigns] = useState<MyCampaign[]>(mockMyCampaigns)
  const [activeTab, setActiveTab] = useState<TabKey>('전체')
  const [cancelModal, setCancelModal] = useState<MyCampaign | null>(null)
  const [submitModal, setSubmitModal] = useState<MyCampaign | null>(null)
  const [contentUrl, setContentUrl] = useState('')
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
      'tab-미선정':   '완료',
      'tab-신청완료-empty': '진행중', 'tab-진행중-empty': '진행중',
      'tab-게시완료-empty': '완료',   'tab-포인트지급-empty': '완료',
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
    setCampaigns(prev => prev.map(c => c.id === submitModal?.id ? { ...c, status: '검수중' as const, progress: '게시 콘텐츠 확인 중' } : c))
    showToast('콘텐츠를 제출했어요!', 'success')
    setSubmitModal(null)
    setContentUrl('')
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
          <ErrorState message="나의 캠페인을 불러오지 못했어요" onRetry={() => window.location.reload()} />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-gray-900">나의 캠페인</h1>
            <p className="text-xs text-gray-500 mt-0.5">총 {campaigns.length}개 참여 중</p>
          </div>
          <button
            onClick={() => navigate('/campaigns/browse')}
            className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
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
            className="w-full pl-10 pr-9 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 focus:border-brand-green focus:bg-white transition-colors"
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
            {filtered.map(c => {
              const actions = getActions(c.status)
              const urgent = c.status === '콘텐츠대기' && isDeadlineUrgent(c.contentDeadline)
              return (
                <div key={c.id} className={`bg-white rounded-2xl border shadow-sm p-4 transition-all ${urgent ? 'border-orange-200' : 'border-gray-100'}`}>
                  {/* 마감 임박 알림 */}
                  {urgent && (
                    <div className="flex items-start gap-1.5 mb-3 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-xl break-keep">
                      <AlertCircle size={14} className="shrink-0 mt-0.5" aria-hidden="true" />
                      <span>콘텐츠 제출 마감이 {fmtDate(c.contentDeadline!)}까지예요!</span>
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <StatusBadge status={c.status} size="sm" />
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

                  {/* 진행 상황 */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-2 h-2 rounded-full ${c.status === '완료' ? 'bg-gray-400' : c.status === '미선정' ? 'bg-red-300' : 'bg-brand-green'}`} />
                    <span className="text-sm text-gray-600 font-medium">{c.progress}</span>
                  </div>

                  {/* ★ 콘텐츠대기 — 미션 가이드 + 필수 키워드 (인플루언서 피드백 매칭) */}
                  {c.status === '콘텐츠대기' && (c.missionGuide || c.requiredKeywords) && (
                    <div className="mb-3 rounded-xl bg-gray-50 border border-gray-100 p-3 space-y-3">
                      {c.missionGuide && (
                        <div>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Sparkles size={13} className="text-brand-green-text" aria-hidden="true" />
                            <span className="text-sm font-bold text-gray-700">미션 가이드</span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed break-keep">{c.missionGuide}</p>
                        </div>
                      )}
                      {c.requiredKeywords && c.requiredKeywords.length > 0 && (
                        <div>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Hash size={13} className="text-brand-green-text" aria-hidden="true" />
                            <span className="text-sm font-bold text-gray-700">필수 키워드</span>
                            <span className="text-sm text-gray-400">(캡션에 모두 포함)</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {c.requiredKeywords.map(k => (
                              <span key={k} className="text-sm font-medium text-brand-green-text bg-brand-green-bg border border-brand-green-border px-2 py-0.5 rounded-md tabular-nums">
                                #{k}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 액션 버튼 — flex-wrap + min-w로 좁은 모바일(360px)에서 자연 줄바꿈 */}
                  <div className="flex flex-wrap gap-2">
                    {actions.map(action => {
                      if (action === '콘텐츠 제출') return (
                        <button key={action}
                          onClick={() => setSubmitModal(c)}
                          className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-semibold text-white bg-brand-green hover:bg-brand-green-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">
                          <Upload size={12} />콘텐츠 제출
                        </button>
                      )
                      if (action === '상세보기' && c.postUrl) return (
                        <React.Fragment key="검수중-actions">
                          <button
                            onClick={() => { setSubmitModal(c); setContentUrl(c.postUrl ?? '') }}
                            className="flex-1 min-w-[120px] flex items-center justify-center gap-1 px-3 py-3 rounded-xl text-sm font-medium border border-brand-green-border text-brand-green-text hover:bg-brand-green/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">
                            <Edit2 size={12} />콘텐츠 수정
                          </button>
                          <button
                            onClick={() => navigate(`/campaigns/${c.id}`)}
                            className="flex-1 min-w-[120px] py-3 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">
                            상세보기
                          </button>
                        </React.Fragment>
                      )
                      if (action === '신청 정보 보기') return (
                        <button key={action}
                          onClick={() => navigate(`/campaigns/${c.id}/apply?mode=view`)}
                          className="flex-1 min-w-[120px] py-3 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">
                          신청 정보 보기
                        </button>
                      )
                      if (action === '취소') return (
                        <button key={action}
                          onClick={() => setCancelModal(c)}
                          className="flex-1 min-w-[120px] flex items-center justify-center gap-1 px-3 py-3 rounded-xl text-sm font-medium border border-red-100 text-red-400 hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/60">
                          <X size={12} />신청 취소
                        </button>
                      )
                      return (
                        <button key={action}
                          onClick={() => navigate(`/campaigns/${c.id}`)}
                          className="flex-1 min-w-[120px] py-3 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">
                          상세보기
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 콘텐츠 제출 모달 */}
      <Modal open={!!submitModal} onClose={() => { setSubmitModal(null); setContentUrl('') }} title="콘텐츠 제출">
        <div className="space-y-4">
          <p className="text-sm text-gray-600"><strong className="text-gray-900">{submitModal?.name}</strong>에 게시한 콘텐츠 URL을 입력해 주세요</p>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center">
            <Upload size={22} className="text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-500">인스타그램, 블로그, 유튜브 등 게시 링크</p>
          </div>
          <div>
            <label htmlFor="content-url" className="text-xs text-gray-500 mb-1.5 block">콘텐츠 URL</label>
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
              onKeyDown={e => e.key === 'Enter' && handleContentSubmit()}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-green focus-visible:ring-2 focus-visible:ring-brand-green/50 transition-colors"
              placeholder="https://instagram.com/p/..."
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setSubmitModal(null); setContentUrl('') }} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">닫기</button>
            <button onClick={handleContentSubmit} disabled={!contentUrl.trim()} aria-disabled={!contentUrl.trim()} className="flex-1 bg-brand-green text-white py-2.5 rounded-xl text-sm font-medium hover:bg-brand-green-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">제출하기</button>
          </div>
        </div>
      </Modal>

      {/* 신청 취소 모달 */}
      <Modal open={!!cancelModal} onClose={() => setCancelModal(null)} title="신청 취소">
        <div className="space-y-4">
          <p className="text-sm text-gray-600"><strong className="text-gray-900">{cancelModal?.name}</strong> 신청을 취소하시겠어요?</p>
          <p className="text-xs text-gray-500">취소 후 재신청이 가능하지 않을 수 있어요</p>
          <div className="flex gap-2">
            <button onClick={() => setCancelModal(null)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">유지하기</button>
            <button onClick={() => cancelModal && handleCancel(cancelModal.id)} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/60">취소하기</button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
