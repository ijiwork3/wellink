import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, User, Building2, Phone, Hash, LogOut, Save, Link, CheckCircle2, RefreshCw, ExternalLink, Users, Trash2, Shield, Globe, Code2, BarChart2, Settings, Target } from 'lucide-react'

function InstagramIcon({ size = 22, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}
import {
  Modal, AlertModal, TIMER_MS, useToast,
  Tabs, ErrorState, SkeletonCard, SkeletonRow,
  type TabItem,
} from '@wellink/ui'
import { useQAModeBrand as useQAMode } from '../utils/useQAModeBrand'
import { usePlanAccess } from '../hooks/usePlanAccess'

// 탭 라벨 = TabItem.value (한국어 식별자, 단일 출처)
type TabName = '브랜드 프로필' | '팀 관리' | '트래킹 설정' | '구독 관리'
const TAB_ITEMS: readonly TabItem<TabName>[] = [
  { value: '브랜드 프로필', label: '브랜드 프로필', icon: <User size={14} aria-hidden="true" /> },
  { value: '팀 관리',       label: '팀 관리',       icon: <Users size={14} aria-hidden="true" /> },
  { value: '트래킹 설정',    label: '트래킹 설정',    icon: <Settings size={14} aria-hidden="true" /> },
  { value: '구독 관리',      label: '구독 관리',      icon: <Hash size={14} aria-hidden="true" />, trailing: <ExternalLink size={12} className="ml-0.5 opacity-70" aria-hidden="true" /> },
]

type MemberRole = 'Owner' | 'Manager' | 'Viewer'

interface TeamMember {
  id: number
  name: string
  email: string
  role: MemberRole
  joinedAt: string
}

const MOCK_MEMBERS: TeamMember[] = [
  { id: 1, name: '이지훈', email: 'brand@wellink.ai', role: 'Owner', joinedAt: '2026-03-01' },
  { id: 2, name: '김마케터', email: 'marketing@wellink.ai', role: 'Manager', joinedAt: '2026-03-15' },
  { id: 3, name: '박뷰어', email: 'viewer@wellink.ai', role: 'Viewer', joinedAt: '2026-04-01' },
]

const ROLE_BADGE: Record<MemberRole, string> = {
  Owner:   'bg-brand-green-bg text-brand-green-text',
  Manager: 'bg-sky-100 text-sky-700',
  Viewer:  'bg-gray-100 text-gray-600',
}

const MAX_MEMBERS_BY_PLAN: Record<string, number> = {
  focus: 3, scale: 10, enterprise: 999,
}

export default function MyPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const qa = useQAMode()
  const { planLabel, isSubscribed, plan } = usePlanAccess()

  const [activeTab, setActiveTab] = useState<TabName>(
    qa === 'tab-settings'  ? '구독 관리' :
    qa === 'tab-team'      ? '팀 관리' :
    qa === 'tab-tracking'  ? '트래킹 설정' :
    '브랜드 프로필'
  )

  // 팀 멤버
  const [members, setMembers] = useState<TeamMember[]>(MOCK_MEMBERS)
  const [inviteModal, setInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<MemberRole>('Manager')
  const [deleteModal, setDeleteModal] = useState<TeamMember | null>(null)
  const [changeRoleModal, setChangeRoleModal] = useState<TeamMember | null>(null)
  const [changeRoleValue, setChangeRoleValue] = useState<MemberRole>('Manager')

  // 계정 정보
  const [name, setName] = useState('이지훈')
  const [email] = useState('brand@wellink.ai')

  // 회사 정보
  const [companyName, setCompanyName] = useState('웰링크 브랜드')
  const [bizNumber, setBizNumber] = useState('123-45-67890')
  const [managerName, setManagerName] = useState('이지훈')
  const [phone, setPhone] = useState('010-1234-5678')
  const [brandWebsite, setBrandWebsite] = useState('https://wellink.ai')
  const [brandCategory, setBrandCategory] = useState('웰니스/피트니스')

  // AI 매칭 타겟
  const [targetGender, setTargetGender] = useState('여성 중심')
  const [targetAge, setTargetAge] = useState('25-34세')
  const [targetInterests, setTargetInterests] = useState('요가/필라테스 · 비건/식단')
  const [marketingKeywords, setMarketingKeywords] = useState('#비건 #플랜트베이스')
  const [monthlyBudget, setMonthlyBudget] = useState('100~500만원')

  // 마케팅 수신
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [campaignAlert, setCampaignAlert] = useState(true)
  const [paymentAlert, setPaymentAlert] = useState(true)

  // SNS 연동
  const [snsConnected] = useState(true)
  const [snsModal, setSnsModal] = useState(false)
  const [snsHandle, setSnsHandle] = useState('wellink_brand')

  // 트래킹 설정
  const [utmMedium, setUtmMedium] = useState('influencer')
  const [ga4Id, setGa4Id] = useState('')
  const [ga4Connected, setGa4Connected] = useState(false)
  const [ga4Saving, setGa4Saving] = useState(false)

  // 모달
  const [pwModal, setPwModal] = useState(qa === 'modal-password')
  const [withdrawModal, setWithdrawModal] = useState(qa === 'modal-withdraw')
  const [withdrawConfirmText, setWithdrawConfirmText] = useState('')

  // 비밀번호 변경 폼
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // qa 모드 (modal-password / modal-withdraw / tab-*)는 useState 초기값에서 이미 처리됨 — useEffect 동기화 중복 제거

  // QA: 로딩 상태 — 공통 SkeletonCard / SkeletonRow 사용
  if (qa === 'loading') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-2">
            <div className="h-6 w-24 bg-gray-100 animate-pulse rounded-full" />
            <div className="h-3 w-48 bg-gray-100 animate-pulse rounded-full" />
          </div>
          <div className="h-4 w-16 bg-gray-100 animate-pulse rounded-full" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-9 w-28 bg-gray-100 animate-pulse rounded-xl" />)}
        </div>
        <SkeletonCard height={180} />
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {[1, 2, 3].map(i => <div key={i} className="px-6"><SkeletonRow cols={4} /></div>)}
        </div>
      </div>
    )
  }

  if (qa === 'error') {
    return <ErrorState message="계정 정보를 불러올 수 없습니다" onRetry={() => window.location.reload()} />
  }

  const handleSave = () => {
    if (!companyName.trim()) { showToast('회사명을 입력하세요.', 'error'); return }
    if (!name.trim()) { showToast('담당자 이름을 입력하세요.', 'error'); return }
    if (bizNumber.trim() && !/^\d{3}-\d{2}-\d{5}$/.test(bizNumber.trim())) {
      showToast('사업자 등록번호 형식을 확인해 주세요. (예: 123-45-67890)', 'error'); return
    }
    showToast('변경사항이 저장되었습니다.', 'success')
  }

  const handlePasswordChange = () => {
    setPasswordError('')
    if (!currentPw || !newPw || !confirmPw) { setPasswordError('모든 항목을 입력하세요.'); return }
    if (newPw.length < 8) { setPasswordError('비밀번호는 8자 이상이어야 합니다.'); return }
    if (newPw !== confirmPw) { setPasswordError('새 비밀번호가 일치하지 않습니다.'); return }
    setPwModal(false); setCurrentPw(''); setNewPw(''); setConfirmPw(''); setPasswordError('')
    showToast('비밀번호가 변경되었습니다.', 'success')
  }

  const handleSnsConnect = () => {
    setSnsModal(false)
    showToast('Instagram 계정이 연결되었습니다.', 'success')
  }

  const maxMembers = MAX_MEMBERS_BY_PLAN[plan ?? ''] ?? 3

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl @md:text-3xl font-bold tracking-tight text-gray-900">마이페이지</h1>
          <p className="text-base text-gray-500 mt-0.5">계정 설정 및 구독 정보를 한눈에 확인하세요.</p>
        </div>
        <button type="button"
          onClick={() => { showToast('로그아웃되었습니다.', 'info'); setTimeout(() => navigate('/login'), TIMER_MS.LOGOUT_REDIRECT) }}
          className="shrink-0 flex items-center gap-1.5 text-base text-gray-500 hover:text-gray-700 transition-colors"
        >
          <LogOut size={15} aria-hidden="true" />
          로그아웃
        </button>
      </div>

      {/* 탭 — 공통 Tabs (variant='pill', scrollable=false → wrap) */}
      <Tabs<TabName>
        variant="pill"
        scrollable={false}
        gap={1}
        items={TAB_ITEMS}
        value={activeTab}
        onChange={setActiveTab}
        ariaLabel="마이페이지 섹션"
      />

      {/* ── 팀 관리 탭 ── */}
      {activeTab === '팀 관리' && (
        <div className="space-y-4">
          {/* 헤더 + 초대 버튼 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h2 className="text-lg font-bold text-gray-900">팀 멤버 관리</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {members.length} / {maxMembers === 999 ? '무제한' : `${maxMembers}명`} 사용 중
                  {isSubscribed ? ` · ${planLabel} 플랜` : ''}
                </p>
              </div>
              <button type="button"
                type="button"
                onClick={() => setInviteModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-brand-green text-white rounded-xl text-base font-medium hover:bg-brand-green-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
              >
                <Users size={14} aria-hidden="true" />
                멤버 초대
              </button>
            </div>
          </div>

          {/* 멤버 목록 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {members.map(member => (
              <div key={member.id} className="flex items-center gap-4 px-6 py-4 border-b border-gray-50 last:border-b-0 hover:bg-gray-50 transition-colors">
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 shrink-0 font-semibold text-base">
                  {member.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-base font-semibold text-gray-900 break-words">{member.name}</p>
                    <span className={`text-sm font-medium px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 ${ROLE_BADGE[member.role]}`}>
                      {member.role}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5 break-all">{member.email}</p>
                  <p className="text-sm text-gray-400 mt-0.5">합류일 {member.joinedAt}</p>
                </div>
                {member.role !== 'Owner' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button type="button"
                      type="button"
                      onClick={() => { setChangeRoleModal(member); setChangeRoleValue(member.role) }}
                      className="flex items-center gap-1 text-sm text-gray-500 border border-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                    >
                      <Shield size={12} aria-hidden="true" />
                      권한 변경
                    </button>
                    <button type="button"
                      type="button"
                      onClick={() => setDeleteModal(member)}
                      className="flex items-center gap-1 text-sm text-red-500 border border-red-100 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                    >
                      <Trash2 size={12} aria-hidden="true" />
                      삭제
                    </button>
                  </div>
                )}
                {member.role === 'Owner' && (
                  <span className="text-sm text-gray-300 shrink-0">—</span>
                )}
              </div>
            ))}
          </div>

          {/* 권한 안내 테이블 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-brand-green rounded-full" />
              권한 안내
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-gray-400 font-medium pb-3 pr-4 min-w-[100px]">기능</th>
                    <th className="text-center text-gray-700 font-semibold pb-3 px-4">Owner</th>
                    <th className="text-center text-gray-700 font-semibold pb-3 px-4">Manager</th>
                    <th className="text-center text-gray-700 font-semibold pb-3 px-4">Viewer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[
                    { label: '결제·플랜', owner: true, manager: false, viewer: false },
                    { label: '캠페인 생성', owner: true, manager: true, viewer: false },
                    { label: '인플루언서', owner: true, manager: true, viewer: '열람만' },
                    { label: '리포트 열람', owner: true, manager: true, viewer: true },
                    { label: '팀 관리', owner: true, manager: false, viewer: false },
                  ].map(row => (
                    <tr key={row.label}>
                      <td className="py-2.5 pr-4 text-gray-600">{row.label}</td>
                      <td className="py-2.5 px-4 text-center">{row.owner === true ? '✅' : '❌'}</td>
                      <td className="py-2.5 px-4 text-center">{row.manager === true ? '✅' : '❌'}</td>
                      <td className="py-2.5 px-4 text-center">
                        {row.viewer === true ? '✅' : row.viewer === '열람만' ? <span className="text-gray-500">열람만</span> : '❌'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── 트래킹 설정 탭 ── */}
      {activeTab === '트래킹 설정' && (
        <div className="space-y-4">
          {/* UTM 기본값 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <Link size={15} className="text-gray-500" aria-hidden="true" />
              UTM 기본값
            </h2>
            <p className="text-sm text-gray-500 mb-5">캠페인 생성 시 인플루언서별 UTM이 자동 생성됩니다. 아래 기본값을 설정하면 자동 생성 UTM에 반영됩니다.</p>
            <div className="space-y-3">
              {[
                { key: 'utm_source', value: 'wellink', editable: false, desc: '고정값, 변경 불가' },
                { key: 'utm_medium', value: utmMedium, editable: true, desc: '수정 가능' },
                { key: 'utm_campaign', value: '{캠페인명 자동}', editable: false, desc: '캠페인별 자동 생성' },
                { key: 'utm_content', value: '{인플루언서ID 자동}', editable: false, desc: '인플루언서별 자동 생성' },
              ].map(row => (
                <div key={row.key} className="grid grid-cols-[140px_1fr_auto] items-center gap-3">
                  <code className="text-sm font-mono text-brand-green-text bg-brand-green/5 px-2 py-1 rounded">{row.key}</code>
                  {row.editable ? (
                    <input
                      type="text"
                      value={utmMedium}
                      onChange={e => setUtmMedium(e.target.value)}
                      aria-label={row.key}
                      className="text-base border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 focus-visible:outline-none"
                    />
                  ) : (
                    <span className="text-base text-gray-500">{row.value}</span>
                  )}
                  <span className="text-sm text-gray-400 whitespace-nowrap">{row.desc}</span>
                </div>
              ))}
            </div>
            <button type="button"
              type="button"
              onClick={() => showToast('UTM 기본값이 저장되었습니다.', 'success')}
              className="mt-5 flex items-center gap-1.5 px-4 py-2 bg-brand-green text-white rounded-xl text-base font-medium hover:bg-brand-green-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
            >
              <Save size={14} aria-hidden="true" />
              저장
            </button>
          </div>

          {/* GA4 연동 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <BarChart2 size={15} className="text-gray-500" aria-hidden="true" />
                GA4 연동
              </h2>
              {ga4Connected ? (
                <span className="flex items-center gap-1 text-sm text-brand-green-text font-medium">
                  <CheckCircle2 size={13} className="text-brand-green" aria-hidden="true" />
                  연결됨
                </span>
              ) : (
                <span className="text-sm text-gray-400">연결되지 않음</span>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-4">GA4 연동 시 UTM 기반 전환 수·ROAS가 성과 리포트에 자동으로 표시됩니다.</p>
            <div>
              <label htmlFor="ga4-id" className="text-sm text-gray-500 mb-1.5 block">GA4 측정 ID</label>
              <div className="flex gap-2">
                <input
                  id="ga4-id"
                  type="text"
                  value={ga4Id}
                  onChange={e => setGa4Id(e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-base outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 focus-visible:outline-none"
                />
                <button type="button"
                  type="button"
                  disabled={ga4Saving || ga4Id.trim() === ''}
                  onClick={() => {
                    if (!/^G-[A-Z0-9]{6,}$/.test(ga4Id.trim())) {
                      showToast('올바른 GA4 측정 ID 형식을 입력해 주세요. (예: G-XXXXXXXX)', 'error'); return
                    }
                    setGa4Saving(true)
                    setTimeout(() => {
                      setGa4Connected(true)
                      setGa4Saving(false)
                      showToast('GA4가 성공적으로 연동되었습니다.', 'success')
                    }, 1200)
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-base font-medium hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {ga4Saving ? <RefreshCw size={14} className="animate-spin" aria-hidden="true" /> : null}
                  {ga4Connected ? '재연동' : '연동하기'}
                </button>
              </div>
              {ga4Id.trim() !== '' && !/^G-/.test(ga4Id) && (
                <p className="text-sm text-red-500 mt-1.5">측정 ID는 G-로 시작해야 합니다.</p>
              )}
            </div>
          </div>

          {/* 웰링크 픽셀 */}
          <div className={`bg-white rounded-2xl border shadow-sm p-6 ${plan === 'scale' || plan === 'enterprise' ? 'border-gray-100' : 'border-gray-100'}`}>
            <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <Code2 size={15} className="text-gray-500" aria-hidden="true" />
              웰링크 픽셀
              <span className="text-sm font-medium text-amber-600 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200">Scale 이상</span>
            </h2>
            <p className="text-sm text-gray-500 mb-4">직접 전환 추적을 위해 브랜드 사이트에 픽셀 스크립트를 삽입합니다.</p>

            {plan === 'scale' || plan === 'enterprise' ? (
              <div className="space-y-3">
                <div className="bg-gray-900 rounded-xl p-4 font-mono text-sm text-green-400 overflow-x-auto">
                  {'<!-- 웰링크 픽셀 -->\n<script src="https://cdn.wellink.ai/pixel.js"\n  data-id="WL-XXXXXXXX" defer></script>'}
                </div>
                <p className="text-sm text-gray-400">{'<head>'} 또는 {'<body>'} 태그 안에 위 코드를 삽입하세요.</p>
                <button type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('<!-- 웰링크 픽셀 -->\n<script src="https://cdn.wellink.ai/pixel.js" data-id="WL-XXXXXXXX" defer></script>')
                    showToast('픽셀 코드가 복사되었습니다.', 'success')
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-base hover:bg-gray-50 transition-colors"
                >
                  코드 복사
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center gap-3 py-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <Code2 size={20} className="text-gray-400" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-900">Scale 플랜 이상에서 사용 가능합니다</p>
                  <p className="text-sm text-gray-500 mt-0.5">픽셀을 통해 캠페인별 직접 전환을 정확하게 추적할 수 있습니다.</p>
                </div>
                <button type="button"
                  onClick={() => navigate('/subscription')}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-base font-medium hover:bg-gray-700 transition-colors"
                >
                  Scale로 업그레이드
                  <ExternalLink size={12} aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 구독 관리 탭 ── */}
      {activeTab === '구독 관리' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-gray-900">구독 관리</h2>
              <p className="text-sm text-gray-500 mt-0.5">현재 플랜과 결제 정보를 확인합니다.</p>
            </div>
            {isSubscribed ? (
              <span className="shrink-0 text-sm font-semibold bg-brand-green-bg text-brand-green-text px-3 py-1.5 rounded-full border border-brand-green-border">
                현재: {planLabel} 플랜
              </span>
            ) : (
              <span className="shrink-0 text-sm font-semibold bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full border border-amber-200">
                {planLabel}
              </span>
            )}
          </div>
          <button type="button"
            onClick={() => navigate('/subscription')}
            className="w-full border border-gray-200 text-gray-700 py-3 rounded-xl text-base font-medium hover:bg-gray-50 transition-colors"
          >
            구독 관리 페이지로 이동
          </button>
        </div>
      )}

      {/* ── 브랜드 프로필 탭 ── */}
      {activeTab === '브랜드 프로필' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900">브랜드 프로필 설정</h2>
              <p className="text-sm text-gray-500 mt-0.5">서비스 이용에 필요한 기본 정보를 관리합니다.</p>
            </div>
            <button type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-base font-medium bg-brand-green text-white hover:bg-brand-green-hover transition-colors"
            >
              <Save size={14} aria-hidden="true" />
              변경사항 저장
            </button>
          </div>

          <div className="p-6 space-y-8">
            {/* 기본 정보 */}
            <section>
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-brand-green rounded-full" />
                기본 정보
              </h3>
              <div className="grid grid-cols-1 @sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="mypage-company" className="text-sm text-gray-500 mb-1.5 block">브랜드명 (회사명)</label>
                  <div className="flex items-center gap-2.5 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-gray-400 transition-colors">
                    <Building2 size={15} className="text-gray-400 shrink-0" aria-hidden="true" />
                    <input
                      id="mypage-company"
                      type="text"
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      aria-label="브랜드명"
                      className="flex-1 text-base text-gray-900 outline-none bg-transparent"
                      placeholder="브랜드명을 입력하세요"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="mypage-category" className="text-sm text-gray-500 mb-1.5 block">업종 카테고리</label>
                  <div className="flex items-center gap-2.5 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-gray-400 transition-colors">
                    <Target size={15} className="text-gray-400 shrink-0" aria-hidden="true" />
                    <input
                      id="mypage-category"
                      type="text"
                      value={brandCategory}
                      onChange={e => setBrandCategory(e.target.value)}
                      aria-label="업종 카테고리"
                      className="flex-1 text-base text-gray-900 outline-none bg-transparent"
                      placeholder="예: 웰니스/피트니스"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="mypage-website" className="text-sm text-gray-500 mb-1.5 block">웹사이트 URL</label>
                  <div className="flex items-center gap-2.5 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-gray-400 transition-colors">
                    <Globe size={15} className="text-gray-400 shrink-0" aria-hidden="true" />
                    <input
                      id="mypage-website"
                      type="url"
                      value={brandWebsite}
                      onChange={e => setBrandWebsite(e.target.value)}
                      aria-label="웹사이트 URL"
                      className="flex-1 text-base text-gray-900 outline-none bg-transparent"
                      placeholder="https://your-brand.com"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="mypage-biz-number" className="text-sm text-gray-500 mb-1.5 block">사업자 등록번호</label>
                  <div className="flex items-center gap-2.5 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-gray-400 transition-colors">
                    <Hash size={15} className="text-gray-400 shrink-0" aria-hidden="true" />
                    <input
                      id="mypage-biz-number"
                      type="text"
                      value={bizNumber}
                      onChange={e => setBizNumber(e.target.value)}
                      aria-label="사업자 등록번호"
                      pattern="[0-9]{3}-[0-9]{2}-[0-9]{5}"
                      className="flex-1 text-base text-gray-900 outline-none bg-transparent"
                      placeholder="예: 123-45-67890"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* AI 매칭 타겟 설정 */}
            <section>
              <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
                <span className="w-1 h-4 bg-brand-green rounded-full" />
                AI 매칭 타겟 설정
              </h3>
              <p className="text-sm text-gray-500 mb-4">이 정보를 기반으로 AI가 인플루언서를 추천합니다.</p>
              <div className="grid grid-cols-1 @sm:grid-cols-2 gap-4">
                {[
                  { id: 'target-gender', label: '주요 타겟 성별', value: targetGender, setter: setTargetGender, placeholder: '예: 여성 중심' },
                  { id: 'target-age', label: '주요 타겟 연령', value: targetAge, setter: setTargetAge, placeholder: '예: 25-34세' },
                  { id: 'target-interests', label: '타겟 관심사', value: targetInterests, setter: setTargetInterests, placeholder: '예: 요가/필라테스' },
                  { id: 'marketing-keywords', label: '마케팅 키워드', value: marketingKeywords, setter: setMarketingKeywords, placeholder: '예: #비건 #플랜트베이스' },
                  { id: 'monthly-budget', label: '월 예산 범위', value: monthlyBudget, setter: setMonthlyBudget, placeholder: '예: 100~500만원' },
                ].map(field => (
                  <div key={field.id}>
                    <label htmlFor={field.id} className="text-sm text-gray-500 mb-1.5 block">{field.label}</label>
                    <div className="flex items-center gap-2.5 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-gray-400 transition-colors">
                      <input
                        id={field.id}
                        type="text"
                        value={field.value}
                        onChange={e => field.setter(e.target.value)}
                        aria-label={field.label}
                        className="flex-1 text-base text-gray-900 outline-none bg-transparent"
                        placeholder={field.placeholder}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 계정 정보 */}
            <section>
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-brand-green rounded-full" />
                계정 정보
              </h3>
              <div className="grid grid-cols-1 @sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="mypage-email" className="text-sm text-gray-500 mb-1.5 block">이메일 주소</label>
                  <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                    <Mail size={15} className="text-gray-400 shrink-0" aria-hidden="true" />
                    <span id="mypage-email" className="text-base text-gray-500">{email}</span>
                  </div>
                </div>
                <div>
                  <label htmlFor="mypage-name" className="text-sm text-gray-500 mb-1.5 block">담당자 이름</label>
                  <div className="flex items-center gap-2.5 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-gray-400 transition-colors">
                    <User size={15} className="text-gray-400 shrink-0" aria-hidden="true" />
                    <input
                      id="mypage-name"
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      aria-label="담당자 이름"
                      className="flex-1 text-base text-gray-900 outline-none bg-transparent"
                      placeholder="이름을 입력하세요"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="mypage-manager" className="text-sm text-gray-500 mb-1.5 block">담당자명 (계약)</label>
                  <div className="flex items-center gap-2.5 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-gray-400 transition-colors">
                    <User size={15} className="text-gray-400 shrink-0" aria-hidden="true" />
                    <input
                      id="mypage-manager"
                      type="text"
                      value={managerName}
                      onChange={e => setManagerName(e.target.value)}
                      aria-label="담당자명"
                      className="flex-1 text-base text-gray-900 outline-none bg-transparent"
                      placeholder="담당자명"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="mypage-phone" className="text-sm text-gray-500 mb-1.5 block">연락처</label>
                  <div className="flex items-center gap-2.5 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-gray-400 transition-colors">
                    <Phone size={15} className="text-gray-400 shrink-0" aria-hidden="true" />
                    <input
                      id="mypage-phone"
                      type="text"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      aria-label="연락처"
                      inputMode="tel"
                      className="flex-1 text-base text-gray-900 outline-none bg-transparent"
                      placeholder="연락처"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button type="button"
                  type="button"
                  onClick={() => setPwModal(true)}
                  className="text-base text-gray-600 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                >
                  비밀번호 변경하기
                </button>
                <button type="button"
                  type="button"
                  onClick={() => setWithdrawModal(true)}
                  className="text-base text-red-500 border border-red-100 px-4 py-2 rounded-xl hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                >
                  회원 탈퇴
                </button>
              </div>
            </section>

            {/* 알림 설정 */}
            <section>
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-brand-green rounded-full" />
                알림 설정
              </h3>
              <div className="space-y-3">
                {[
                  { id: 'alert-email-mkt', label: '이메일 마케팅 수신', desc: '이벤트, 프로모션 등 다양한 혜택 안내', value: marketingConsent, setter: setMarketingConsent },
                  { id: 'alert-campaign', label: '캠페인 알림', desc: '지원자·콘텐츠 제출·발표일 알림 (이메일 + 서비스 내)', value: campaignAlert, setter: setCampaignAlert },
                  { id: 'alert-payment', label: '정산 알림', desc: '결제 예정일·실패 알림', value: paymentAlert, setter: setPaymentAlert },
                ].map(item => (
                  <div key={item.id} className="flex items-start gap-3">
                    <button type="button"
                      onClick={() => item.setter(!item.value)}
                      role="checkbox"
                      aria-checked={item.value}
                      aria-label={item.label}
                      id={item.id}
                      className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                        item.value ? 'bg-brand-green border-brand-green' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {item.value && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                    <div>
                      <p className="text-base font-medium text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* SNS 연동 설정 */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-1 h-4 bg-brand-green rounded-full" />
                  SNS 연동 설정
                </h3>
                {snsConnected && (
                  <span className="flex items-center gap-1 text-sm text-brand-green-text font-medium">
                    <CheckCircle2 size={13} className="text-brand-green" aria-hidden="true" />
                    연결됨
                  </span>
                )}
              </div>
              <div className="border border-gray-200 rounded-xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center shrink-0">
                    <InstagramIcon size={22} className="text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-gray-900">Instagram 비즈니스</p>
                    <p className="text-sm text-gray-500 mt-0.5">인스타그램 통계 및 광고 데이터를 연동합니다.</p>
                  </div>
                </div>
                <button type="button"
                  type="button"
                  onClick={() => setSnsModal(true)}
                  className={`px-5 py-2.5 rounded-xl text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 ${
                    snsConnected
                      ? 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                      : 'bg-brand-green text-white hover:bg-brand-green-hover'
                  }`}
                >
                  {snsConnected ? '연동 관리' : 'Instagram 연결하기'}
                </button>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* 비밀번호 변경 모달 */}
      <Modal
        open={pwModal}
        onClose={() => { setPwModal(false); setCurrentPw(''); setNewPw(''); setConfirmPw(''); setPasswordError('') }}
        title="비밀번호 변경"
        footer={
          <>
            <button type="button"
              onClick={() => { setPwModal(false); setCurrentPw(''); setNewPw(''); setConfirmPw(''); setPasswordError('') }}
              className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-base hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button type="button"
              onClick={handlePasswordChange}
              className="flex-1 bg-brand-green text-white py-2.5 rounded-xl text-base font-medium hover:bg-brand-green-hover transition-colors"
            >
              변경하기
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="pw-current" className="text-sm text-gray-500 mb-1.5 block">현재 비밀번호</label>
            <input
              id="pw-current"
              type="password"
              value={currentPw}
              onChange={e => { setCurrentPw(e.target.value); setPasswordError('') }}
              aria-label="현재 비밀번호"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 transition-colors"
              placeholder="현재 비밀번호를 입력하세요"
            />
          </div>
          <div>
            <label htmlFor="pw-new" className="text-sm text-gray-500 mb-1.5 block">새 비밀번호</label>
            <input
              id="pw-new"
              type="password"
              value={newPw}
              onChange={e => { setNewPw(e.target.value); setPasswordError('') }}
              aria-label="새 비밀번호"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 transition-colors"
              placeholder="새 비밀번호 (8자 이상)"
            />
          </div>
          <div>
            <label htmlFor="pw-confirm" className="text-sm text-gray-500 mb-1.5 block">새 비밀번호 확인</label>
            <input
              id="pw-confirm"
              type="password"
              value={confirmPw}
              onChange={e => { setConfirmPw(e.target.value); setPasswordError('') }}
              aria-label="새 비밀번호 확인"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 transition-colors"
              placeholder="새 비밀번호를 다시 입력하세요"
            />
          </div>
          {passwordError && (
            <p className="text-sm text-red-500 mt-1">{passwordError}</p>
          )}
        </div>
      </Modal>

      {/* SNS 연결 모달 */}
      <Modal
        open={snsModal}
        onClose={() => { setSnsModal(false); setSnsHandle('wellink_brand') }}
        title="Instagram 연결"
        footer={
          <>
            <button type="button"
              onClick={() => { setSnsModal(false); setSnsHandle('wellink_brand') }}
              className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-base hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button type="button"
              onClick={handleSnsConnect}
              disabled={snsHandle.trim() === ''}
              className="flex-1 bg-brand-green text-white py-2.5 rounded-xl text-base font-medium hover:bg-brand-green-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              연결
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
              <Link size={24} className="text-gray-400" aria-hidden="true" />
            </div>
          </div>
          <div>
            <label htmlFor="sns-handle" className="text-sm text-gray-500 mb-1.5 block">Instagram 비즈니스 계정</label>
            <input
              id="sns-handle"
              type="text"
              value={snsHandle}
              onChange={e => setSnsHandle(e.target.value)}
              aria-label="Instagram 비즈니스 계정"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 transition-colors"
              placeholder="Instagram 아이디를 입력하세요"
            />
            {snsHandle.trim() === '' && (
              <p className="text-sm text-red-500 mt-1">아이디를 입력해야 연결할 수 있습니다.</p>
            )}
          </div>
        </div>
      </Modal>

      {/* 멤버 초대 모달 */}
      <Modal
        open={inviteModal}
        onClose={() => { setInviteModal(false); setInviteEmail('') }}
        title="멤버 초대"
        footer={
          <>
            <button type="button"
              onClick={() => { setInviteModal(false); setInviteEmail('') }}
              className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-base hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button type="button"
              disabled={!inviteEmail.trim()}
              onClick={() => {
                const newMember: TeamMember = {
                  id: Date.now(),
                  name: inviteEmail.split('@')[0],
                  email: inviteEmail,
                  role: inviteRole,
                  joinedAt: '2026-05-05',
                }
                setMembers(prev => [...prev, newMember])
                setInviteModal(false)
                setInviteEmail('')
                showToast(`${inviteEmail}에 초대 메일을 발송했습니다.`, 'success')
              }}
              className="flex-1 bg-brand-green text-white py-2.5 rounded-xl text-base font-medium hover:bg-brand-green-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              초대하기
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="invite-email" className="text-sm text-gray-500 mb-1.5 block">이메일 주소</label>
            <input
              id="invite-email"
              type="email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 transition-colors"
              placeholder="초대할 이메일을 입력하세요"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1.5 block">권한</label>
            <div className="flex gap-2">
              {(['Manager', 'Viewer'] as MemberRole[]).map(role => (
                <button type="button"
                  key={role}
                  onClick={() => setInviteRole(role)}
                  className={`flex-1 py-2 rounded-xl text-base font-medium border transition-colors ${
                    inviteRole === role
                      ? 'bg-brand-green text-white border-brand-green'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* 권한 변경 모달 */}
      <Modal
        open={!!changeRoleModal}
        onClose={() => setChangeRoleModal(null)}
        title="권한 변경"
        footer={changeRoleModal ? (
          <>
            <button type="button"
              onClick={() => setChangeRoleModal(null)}
              className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-base hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button type="button"
              onClick={() => {
                setMembers(prev => prev.map(m =>
                  m.id === changeRoleModal.id ? { ...m, role: changeRoleValue } : m
                ))
                setChangeRoleModal(null)
                showToast(`${changeRoleModal.name}의 권한이 ${changeRoleValue}로 변경되었습니다.`, 'success')
              }}
              className="flex-1 bg-brand-green text-white py-2.5 rounded-xl text-base font-medium hover:bg-brand-green-hover transition-colors"
            >
              변경하기
            </button>
          </>
        ) : undefined}
      >
        {changeRoleModal && (
          <div className="space-y-4">
            <p className="text-base text-gray-700">
              <strong>{changeRoleModal.name}</strong>의 권한을 변경합니다.
            </p>
            <div className="flex gap-2">
              {(['Manager', 'Viewer'] as MemberRole[]).map(role => (
                <button type="button"
                  key={role}
                  onClick={() => setChangeRoleValue(role)}
                  className={`flex-1 py-2 rounded-xl text-base font-medium border transition-colors ${
                    changeRoleValue === role
                      ? 'bg-brand-green text-white border-brand-green'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* 멤버 삭제 모달 */}
      <AlertModal
        open={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="멤버 삭제"
        description={deleteModal ? `${deleteModal.name}(${deleteModal.email})을 팀에서 제거하시겠습니까?` : ''}
        confirmLabel="삭제"
        cancelLabel="취소"
        variant="danger"
        size="sm"
        onConfirm={() => {
          if (!deleteModal) return
          setMembers(prev => prev.filter(m => m.id !== deleteModal.id))
          showToast(`${deleteModal.name}이(가) 팀에서 제거되었습니다.`, 'info')
          setDeleteModal(null)
        }}
      />

      {/* 회원 탈퇴 모달 */}
      <Modal
        open={withdrawModal}
        onClose={() => { setWithdrawModal(false); setWithdrawConfirmText('') }}
        title="회원 탈퇴"
        footer={
          <>
            <button type="button"
              onClick={() => { setWithdrawModal(false); setWithdrawConfirmText('') }}
              className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-base hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button type="button"
              disabled={withdrawConfirmText !== '탈퇴'}
              onClick={() => {
                setWithdrawModal(false)
                setWithdrawConfirmText('')
                showToast('탈퇴 처리가 완료되었습니다.', 'info')
                setTimeout(() => navigate('/'), TIMER_MS.NAV_DELAY)
              }}
              className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-base font-medium hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              탈퇴하기
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-red-100 border border-red-200 rounded-xl p-4">
            <p className="text-base font-semibold text-red-700 mb-1">탈퇴 전 꼭 확인해주세요</p>
            <ul className="text-sm text-red-600 space-y-1 list-disc list-inside">
              <li>모든 캠페인 데이터 및 인플루언서 이력이 삭제됩니다.</li>
              <li>구독 중인 플랜은 즉시 해지됩니다.</li>
              <li>삭제된 데이터는 복구가 불가능합니다.</li>
            </ul>
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1.5 block">아래 입력란에 <span className="font-semibold text-red-600">탈퇴</span>를 입력하면 버튼이 활성화됩니다.</label>
            <input
              type="text"
              value={withdrawConfirmText}
              onChange={e => setWithdrawConfirmText(e.target.value)}
              placeholder="'탈퇴'를 입력해 주세요"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/50 transition-colors"
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
