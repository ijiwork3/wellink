import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, User, Building2, Phone, Hash, LogOut, Save, Link, CheckCircle2, XCircle, RefreshCw, ExternalLink, Users, Trash2, Shield } from 'lucide-react'

function InstagramIcon({ size = 22, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}
import { Modal, AlertModal, TIMER_MS } from '@wellink/ui'
import { useToast } from '@wellink/ui'
import { useQAModeBrand as useQAMode } from '../utils/useQAModeBrand'
import { usePlanAccess } from '../hooks/usePlanAccess'

const tabs = ['광고주 정보', '팀 멤버', '구독 관리'] as const

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
  Owner:   'bg-brand-green/10 text-brand-green-text',
  Manager: 'bg-sky-100 text-sky-700',
  Viewer:  'bg-gray-100 text-gray-600',
}

export default function MyPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const qa = useQAMode()
  const { planLabel, isSubscribed } = usePlanAccess()
  // QA: tab-settings → '구독 관리' / tab-team → '팀 멤버' 탭 초기 활성화
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>(
    qa === 'tab-settings' ? '구독 관리' :
    qa === 'tab-team'     ? '팀 멤버' :
    '광고주 정보'
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

  // 마케팅 수신
  const [marketingConsent, setMarketingConsent] = useState(false)

  // SNS 연동
  const [snsConnected] = useState(true)
  const [snsModal, setSnsModal] = useState(false)
  const [snsHandle, setSnsHandle] = useState('wellink_brand')

  // QA: modal-password / modal-withdraw 미리 열기
  const [pwModal, setPwModal] = useState(qa === 'modal-password')
  const [withdrawModal, setWithdrawModal] = useState(qa === 'modal-withdraw')
  const [withdrawConfirmText, setWithdrawConfirmText] = useState('')

  // 비밀번호 변경 폼 state (early return 이전에 선언 필수)
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // QA 파라미터 변경 동기화
  useEffect(() => {
    if (qa === 'modal-password') { setPwModal(true); return }
    if (qa === 'modal-withdraw') { setWithdrawModal(true); return }
    if (qa === 'tab-settings')   { setActiveTab('구독 관리'); return }
    if (qa === 'tab-team')       { setActiveTab('팀 멤버'); return }
  }, [qa])

  // QA: 로딩 상태
  if (qa === 'loading') {
    return (
      <div className="space-y-6 animate-pulse">
        {/* 헤더 스켈레톤 */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-24 bg-gray-200 rounded-full" />
            <div className="h-3 w-48 bg-gray-100 rounded-full" />
          </div>
          <div className="h-4 w-16 bg-gray-100 rounded-full" />
        </div>
        {/* 탭 스켈레톤 */}
        <div className="flex gap-1">
          <div className="h-9 w-28 bg-gray-200 rounded-xl" />
          <div className="h-9 w-24 bg-gray-100 rounded-xl" />
        </div>
        {/* 폼 섹션 스켈레톤 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div className="space-y-1.5">
              <div className="h-4 w-28 bg-gray-200 rounded-full" />
              <div className="h-3 w-44 bg-gray-100 rounded-full" />
            </div>
            <div className="h-8 w-24 bg-gray-200 rounded-xl" />
          </div>
          <div className="p-6 space-y-8">
            {/* 계정 정보 */}
            <div className="space-y-3">
              <div className="h-4 w-20 bg-gray-200 rounded-full" />
              <div className="grid grid-cols-1 @sm:grid-cols-2 gap-4">
                <div className="h-12 bg-gray-100 rounded-xl" />
                <div className="h-12 bg-gray-100 rounded-xl" />
              </div>
              <div className="flex gap-2">
                <div className="h-9 w-28 bg-gray-100 rounded-xl" />
                <div className="h-9 w-20 bg-gray-100 rounded-xl" />
              </div>
            </div>
            {/* 회사 정보 */}
            <div className="space-y-3">
              <div className="h-4 w-20 bg-gray-200 rounded-full" />
              <div className="grid grid-cols-1 @sm:grid-cols-2 gap-4">
                <div className="h-12 bg-gray-100 rounded-xl" />
                <div className="h-12 bg-gray-100 rounded-xl" />
                <div className="h-12 bg-gray-100 rounded-xl" />
                <div className="h-12 bg-gray-100 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // QA: 에러 상태
  if (qa === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <XCircle size={48} className="text-red-300" aria-hidden="true" />
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-900">계정 정보를 불러올 수 없습니다</p>
          <p className="text-xs text-gray-500 mt-1">잠시 후 다시 시도해 주세요.</p>
        </div>
        <button onClick={() => window.location.reload()} className="flex items-center gap-2 text-sm bg-gray-100 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-200 transition-colors">
          <RefreshCw size={14} aria-hidden="true" />다시 시도
        </button>
      </div>
    )
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
    if (!currentPw || !newPw || !confirmPw) {
      setPasswordError('모든 항목을 입력하세요.')
      return
    }
    if (newPw.length < 8) {
      setPasswordError('비밀번호는 8자 이상이어야 합니다.')
      return
    }
    if (newPw !== confirmPw) {
      setPasswordError('새 비밀번호가 일치하지 않습니다.')
      return
    }
    setPwModal(false)
    setCurrentPw('')
    setNewPw('')
    setConfirmPw('')
    setPasswordError('')
    showToast('비밀번호가 변경되었습니다.', 'success')
  }

  const handleSnsConnect = () => {
    setSnsModal(false)
    showToast('Instagram 계정이 연결되었습니다.', 'success')
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">마이페이지</h1>
          <p className="text-sm text-gray-500 mt-0.5">계정 설정 및 구독 정보를 한눈에 확인하세요.</p>
        </div>
        <button
          onClick={() => { showToast('로그아웃되었습니다.', 'info'); setTimeout(() => navigate('/login'), TIMER_MS.LOGOUT_REDIRECT) }}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <LogOut size={15} aria-hidden="true" />
          로그아웃
        </button>
      </div>

      {/* 탭 */}
      <div className="flex gap-1">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab)
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-brand-green text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab === '광고주 정보' && <User size={14} aria-hidden="true" />}
            {tab === '팀 멤버' && <Users size={14} aria-hidden="true" />}
            {tab === '구독 관리' && <Hash size={14} aria-hidden="true" />}
            {tab}
            {tab === '구독 관리' && <ExternalLink size={12} className="ml-0.5 opacity-70" aria-hidden="true" />}
          </button>
        ))}
      </div>

      {/* 팀 멤버 탭 콘텐츠 */}
      {activeTab === '팀 멤버' && (
        <div className="space-y-4">
          {/* 안내 + 초대 버튼 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h2 className="text-base font-bold text-gray-900">팀 멤버 관리</h2>
                <p className="text-xs text-gray-500 mt-0.5">{isSubscribed ? `현재 ${planLabel} 플랜` : planLabel} · 플랜별 한도까지 초대할 수 있습니다.</p>
              </div>
              <button
                onClick={() => setInviteModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-brand-green text-white rounded-xl text-sm font-medium hover:bg-brand-green-hover transition-colors"
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
                {/* 아바타 */}
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 shrink-0 font-semibold text-sm">
                  {member.name[0]}
                </div>
                {/* 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900 truncate">{member.name}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_BADGE[member.role]}`}>
                      {member.role}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{member.email}</p>
                  <p className="text-xs text-gray-400 mt-0.5">합류일 {member.joinedAt}</p>
                </div>
                {/* 액션 */}
                {member.role !== 'Owner' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => { setChangeRoleModal(member); setChangeRoleValue(member.role) }}
                      className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Shield size={12} aria-hidden="true" />
                      권한 변경
                    </button>
                    <button
                      onClick={() => setDeleteModal(member)}
                      className="flex items-center gap-1 text-xs text-red-500 border border-red-100 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={12} aria-hidden="true" />
                      삭제
                    </button>
                  </div>
                )}
                {member.role === 'Owner' && (
                  <span className="text-xs text-gray-300 shrink-0">—</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QA: tab-settings — 구독 관리 탭 콘텐츠 */}
      {activeTab === '구독 관리' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">구독 관리</h2>
              <p className="text-xs text-gray-500 mt-0.5">현재 플랜과 결제 정보를 확인합니다.</p>
            </div>
            {isSubscribed ? (
              <span className="text-xs font-semibold bg-brand-green/10 text-brand-green-text px-3 py-1.5 rounded-full border border-brand-green/20">
                현재: {planLabel} 플랜
              </span>
            ) : (
              <span className="text-xs font-semibold bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full border border-amber-200">
                {planLabel}
              </span>
            )}
          </div>
          <button
            onClick={() => navigate('/subscription')}
            className="w-full border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            구독 관리 페이지로 이동
          </button>
        </div>
      )}

      {/* 광고주 정보 설정 */}
      {activeTab === '광고주 정보' && <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">광고주 정보 설정</h2>
            <p className="text-xs text-gray-500 mt-0.5">서비스 이용에 필요한 기본 정보를 관리합니다.</p>
          </div>
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              qa === 'edit'
                ? 'bg-brand-green text-white ring-2 ring-brand-green ring-offset-2 hover:bg-brand-green-hover shadow-md'
                : 'bg-brand-green text-white hover:bg-brand-green-hover'
            }`}
          >
            <Save size={14} aria-hidden="true" />
            변경사항 저장
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* 계정 정보 */}
          <section>
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-brand-green rounded-full" />
              계정 정보
            </h3>
            <div className="grid grid-cols-1 @sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="mypage-email" className="text-xs text-gray-500 mb-1.5 block">이메일 주소</label>
                <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <Mail size={15} className="text-gray-400 shrink-0" aria-hidden="true" />
                  <span id="mypage-email" className="text-sm text-gray-500">{email}</span>
                </div>
              </div>
              <div>
                <label htmlFor="mypage-name" className="text-xs text-gray-500 mb-1.5 block">이름</label>
                <div className="flex items-center gap-2.5 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-gray-400 transition-colors">
                  <User size={15} className="text-gray-400 shrink-0" aria-hidden="true" />
                  <input
                    id="mypage-name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    aria-label="이름"
                    className="flex-1 text-sm text-gray-900 outline-none bg-transparent"
                    placeholder="이름을 입력하세요"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setPwModal(true)}
                className="text-sm text-gray-600 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
              >
                비밀번호 변경하기
              </button>
              <button
                onClick={() => setWithdrawModal(true)}
                className="text-sm text-red-500 border border-red-100 px-4 py-2 rounded-xl hover:bg-red-50 transition-colors"
              >
                회원 탈퇴
              </button>
            </div>
          </section>

          {/* 회사 정보 */}
          <section>
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-brand-green rounded-full" />
              회사 정보
            </h3>
            <div className="grid grid-cols-1 @sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="mypage-company" className="text-xs text-gray-500 mb-1.5 block">회사명</label>
                <div className="flex items-center gap-2.5 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-gray-400 transition-colors">
                  <Building2 size={15} className="text-gray-400 shrink-0" aria-hidden="true" />
                  <input
                    id="mypage-company"
                    type="text"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    aria-label="회사명"
                    className="flex-1 text-sm text-gray-900 outline-none bg-transparent"
                    placeholder="회사명을 입력하세요"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="mypage-biz-number" className="text-xs text-gray-500 mb-1.5 block">사업자 등록번호</label>
                <div className="flex items-center gap-2.5 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-gray-400 transition-colors">
                  <Hash size={15} className="text-gray-400 shrink-0" aria-hidden="true" />
                  <input
                    id="mypage-biz-number"
                    type="text"
                    value={bizNumber}
                    onChange={e => setBizNumber(e.target.value)}
                    aria-label="사업자 등록번호"
                    pattern="[0-9]{3}-[0-9]{2}-[0-9]{5}"
                    className="flex-1 text-sm text-gray-900 outline-none bg-transparent"
                    placeholder="예: 123-45-67890"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="mypage-manager" className="text-xs text-gray-500 mb-1.5 block">담당자명</label>
                <div className="flex items-center gap-2.5 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-gray-400 transition-colors">
                  <User size={15} className="text-gray-400 shrink-0" aria-hidden="true" />
                  <input
                    id="mypage-manager"
                    type="text"
                    value={managerName}
                    onChange={e => setManagerName(e.target.value)}
                    aria-label="담당자명"
                    className="flex-1 text-sm text-gray-900 outline-none bg-transparent"
                    placeholder="담당자명"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="mypage-phone" className="text-xs text-gray-500 mb-1.5 block">연락처</label>
                <div className="flex items-center gap-2.5 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-gray-400 transition-colors">
                  <Phone size={15} className="text-gray-400 shrink-0" aria-hidden="true" />
                  <input
                    id="mypage-phone"
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    aria-label="연락처"
                    inputMode="tel"
                    className="flex-1 text-sm text-gray-900 outline-none bg-transparent"
                    placeholder="연락처"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* 마케팅 수신 동의 */}
          <section>
            <div className="flex items-start gap-3">
              <button
                onClick={() => setMarketingConsent(!marketingConsent)}
                role="checkbox"
                aria-checked={marketingConsent}
                aria-label="마케팅 정보 수신 동의"
                className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                  marketingConsent
                    ? 'bg-brand-green border-brand-green'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {marketingConsent && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <div>
                <p className="text-sm font-medium text-gray-900">마케팅 정보 수신 동의</p>
                <p className="text-xs text-gray-500 mt-0.5">이벤트, 프로모션 등 다양한 혜택 안내를 받아보실 수 있습니다.</p>
              </div>
            </div>
          </section>

          {/* SNS 연동 설정 */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <span className="w-1 h-4 bg-brand-green rounded-full" />
                SNS 연동 설정
              </h3>
              {snsConnected && (
                <span className="flex items-center gap-1 text-xs text-brand-green font-medium">
                  <CheckCircle2 size={13} aria-hidden="true" />
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
                  <p className="text-sm font-semibold text-gray-900">Instagram 비즈니스</p>
                  <p className="text-xs text-gray-500 mt-0.5">인스타그램 통계 및 광고 데이터를 연동합니다.</p>
                </div>
              </div>
              <button
                onClick={() => setSnsModal(true)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
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
      </div>}

      {/* 비밀번호 변경 모달 */}
      <Modal
        open={pwModal}
        onClose={() => { setPwModal(false); setCurrentPw(''); setNewPw(''); setConfirmPw(''); setPasswordError('') }}
        title="비밀번호 변경"
        footer={
          <>
            <button
              onClick={() => { setPwModal(false); setCurrentPw(''); setNewPw(''); setConfirmPw(''); setPasswordError('') }}
              className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handlePasswordChange}
              className="flex-1 bg-brand-green text-white py-2.5 rounded-xl text-sm font-medium hover:bg-brand-green-hover transition-colors"
            >
              변경하기
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="pw-current" className="text-xs text-gray-500 mb-1.5 block">현재 비밀번호</label>
            <input
              id="pw-current"
              type="password"
              value={currentPw}
              onChange={e => { setCurrentPw(e.target.value); setPasswordError('') }}
              aria-label="현재 비밀번호"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors"
              placeholder="현재 비밀번호를 입력하세요"
            />
          </div>
          <div>
            <label htmlFor="pw-new" className="text-xs text-gray-500 mb-1.5 block">새 비밀번호</label>
            <input
              id="pw-new"
              type="password"
              value={newPw}
              onChange={e => { setNewPw(e.target.value); setPasswordError('') }}
              aria-label="새 비밀번호"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors"
              placeholder="새 비밀번호 (8자 이상)"
            />
          </div>
          <div>
            <label htmlFor="pw-confirm" className="text-xs text-gray-500 mb-1.5 block">새 비밀번호 확인</label>
            <input
              id="pw-confirm"
              type="password"
              value={confirmPw}
              onChange={e => { setConfirmPw(e.target.value); setPasswordError('') }}
              aria-label="새 비밀번호 확인"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors"
              placeholder="새 비밀번호를 다시 입력하세요"
            />
          </div>
          {passwordError && (
            <p className="text-xs text-red-500 mt-1">{passwordError}</p>
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
            <button
              onClick={() => { setSnsModal(false); setSnsHandle('wellink_brand') }}
              className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSnsConnect}
              disabled={snsHandle.trim() === ''}
              className="flex-1 bg-brand-green text-white py-2.5 rounded-xl text-sm font-medium hover:bg-brand-green-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
            <label htmlFor="sns-handle" className="text-xs text-gray-500 mb-1.5 block">Instagram 비즈니스 계정</label>
            <input
              id="sns-handle"
              type="text"
              value={snsHandle}
              onChange={e => setSnsHandle(e.target.value)}
              aria-label="Instagram 비즈니스 계정"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors"
              placeholder="Instagram 아이디를 입력하세요"
            />
            {snsHandle.trim() === '' && (
              <p className="text-xs text-red-500 mt-1">아이디를 입력해야 연결할 수 있습니다.</p>
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
            <button
              onClick={() => { setInviteModal(false); setInviteEmail('') }}
              className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              disabled={!inviteEmail.trim()}
              onClick={() => {
                const newMember: TeamMember = {
                  id: Date.now(),
                  name: inviteEmail.split('@')[0],
                  email: inviteEmail,
                  role: inviteRole,
                  joinedAt: '2026-04-19',
                }
                setMembers(prev => [...prev, newMember])
                setInviteModal(false)
                setInviteEmail('')
                showToast(`${inviteEmail}에 초대 메일을 발송했습니다.`, 'success')
              }}
              className="flex-1 bg-brand-green text-white py-2.5 rounded-xl text-sm font-medium hover:bg-brand-green-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              초대하기
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="invite-email" className="text-xs text-gray-500 mb-1.5 block">이메일 주소</label>
            <input
              id="invite-email"
              type="email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors"
              placeholder="초대할 이메일을 입력하세요"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">권한</label>
            <div className="flex gap-2">
              {(['Manager', 'Viewer'] as MemberRole[]).map(role => (
                <button
                  key={role}
                  onClick={() => setInviteRole(role)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
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
            <button
              onClick={() => setChangeRoleModal(null)}
              className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={() => {
                setMembers(prev => prev.map(m =>
                  m.id === changeRoleModal.id ? { ...m, role: changeRoleValue } : m
                ))
                setChangeRoleModal(null)
                showToast(`${changeRoleModal.name}의 권한이 ${changeRoleValue}로 변경되었습니다.`, 'success')
              }}
              className="flex-1 bg-brand-green text-white py-2.5 rounded-xl text-sm font-medium hover:bg-brand-green-hover transition-colors"
            >
              변경하기
            </button>
          </>
        ) : undefined}
      >
        {changeRoleModal && (
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              <strong>{changeRoleModal.name}</strong>의 권한을 변경합니다.
            </p>
            <div className="flex gap-2">
              {(['Manager', 'Viewer'] as MemberRole[]).map(role => (
                <button
                  key={role}
                  onClick={() => setChangeRoleValue(role)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
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

      {/* 회원 탈퇴 모달 (QA: modal-withdraw) */}
      <Modal
        open={withdrawModal}
        onClose={() => { setWithdrawModal(false); setWithdrawConfirmText('') }}
        title="회원 탈퇴"
        footer={
          <>
            <button
              onClick={() => { setWithdrawModal(false); setWithdrawConfirmText('') }}
              className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              disabled={withdrawConfirmText !== '탈퇴'}
              onClick={() => {
                setWithdrawModal(false)
                setWithdrawConfirmText('')
                showToast('탈퇴 처리가 완료되었습니다.', 'info')
                setTimeout(() => navigate('/'), TIMER_MS.NAV_DELAY)
              }}
              className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              탈퇴하기
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-100 rounded-xl p-4">
            <p className="text-sm font-semibold text-red-700 mb-1">탈퇴 전 꼭 확인해주세요</p>
            <ul className="text-xs text-red-600 space-y-1 list-disc list-inside">
              <li>모든 캠페인 데이터 및 인플루언서 이력이 삭제됩니다.</li>
              <li>구독 중인 플랜은 즉시 해지됩니다.</li>
              <li>삭제된 데이터는 복구가 불가능합니다.</li>
            </ul>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">아래 입력란에 <span className="font-semibold text-red-600">탈퇴</span>를 입력하면 버튼이 활성화됩니다.</label>
            <input
              type="text"
              value={withdrawConfirmText}
              onChange={e => setWithdrawConfirmText(e.target.value)}
              placeholder="'탈퇴'를 입력해 주세요"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-400 transition-colors"
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
