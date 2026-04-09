import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, User, Building2, Phone, Hash, LogOut, Save, Link, CheckCircle2 } from 'lucide-react'

function InstagramIcon({ size = 22, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'

const tabs = ['광고주 정보', '구독 관리'] as const

export default function MyPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>('광고주 정보')

  // 계정 정보
  const [name, setName] = useState('test')
  const [email] = useState('test@test.com')

  // 회사 정보
  const [companyName, setCompanyName] = useState('')
  const [bizNumber, setBizNumber] = useState('')
  const [managerName, setManagerName] = useState('test')
  const [phone, setPhone] = useState('010-1234-5678')

  // 마케팅 수신
  const [marketingConsent, setMarketingConsent] = useState(false)

  // SNS 연동
  const [snsConnected] = useState(true)
  const [snsModal, setSnsModal] = useState(false)
  const [snsHandle, setSnsHandle] = useState('wellink_brand')

  // 비밀번호 변경 모달
  const [pwModal, setPwModal] = useState(false)
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')

  const handleSave = () => {
    showToast('변경사항이 저장되었습니다.', 'success')
  }

  const handlePasswordChange = () => {
    if (!currentPw || !newPw || !confirmPw) {
      showToast('모든 항목을 입력해주세요.', 'error')
      return
    }
    if (newPw !== confirmPw) {
      showToast('새 비밀번호가 일치하지 않습니다.', 'error')
      return
    }
    if (newPw.length < 8) {
      showToast('비밀번호는 8자 이상이어야 합니다.', 'error')
      return
    }
    setPwModal(false)
    setCurrentPw('')
    setNewPw('')
    setConfirmPw('')
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
          onClick={() => showToast('로그아웃되었습니다.', 'info')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <LogOut size={15} />
          로그아웃
        </button>
      </div>

      {/* 탭 */}
      <div className="flex gap-1">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => {
              if (tab === '구독 관리') {
                navigate('/subscription')
                return
              }
              setActiveTab(tab)
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-[#8CC63F] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab === '광고주 정보' && <User size={14} />}
            {tab === '구독 관리' && <Hash size={14} />}
            {tab}
          </button>
        ))}
      </div>

      {/* 광고주 정보 설정 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">광고주 정보 설정</h2>
            <p className="text-xs text-gray-500 mt-0.5">서비스 이용에 필요한 기본 정보를 관리합니다.</p>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 bg-[#8CC63F] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#7AB535] transition-colors"
          >
            <Save size={14} />
            변경사항 저장
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* 계정 정보 */}
          <section>
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-[#8CC63F] rounded-full" />
              계정 정보
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">이메일 주소 (수정 불가)</label>
                <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <Mail size={15} className="text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-500">{email}</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">이름</label>
                <div className="flex items-center gap-2.5 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-gray-400 transition-colors">
                  <User size={15} className="text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="flex-1 text-sm text-gray-900 outline-none bg-transparent"
                    placeholder="이름을 입력해주세요"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={() => setPwModal(true)}
              className="mt-3 text-sm text-gray-600 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
            >
              비밀번호 변경하기
            </button>
          </section>

          {/* 회사 정보 */}
          <section>
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-[#8CC63F] rounded-full" />
              회사 정보
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">회사명</label>
                <div className="flex items-center gap-2.5 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-gray-400 transition-colors">
                  <Building2 size={15} className="text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="flex-1 text-sm text-gray-900 outline-none bg-transparent"
                    placeholder="회사명을 입력해주세요"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">사업자 등록번호</label>
                <div className="flex items-center gap-2.5 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-gray-400 transition-colors">
                  <Hash size={15} className="text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={bizNumber}
                    onChange={e => setBizNumber(e.target.value)}
                    className="flex-1 text-sm text-gray-900 outline-none bg-transparent"
                    placeholder="사업자 등록번호를 입력해주세요"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">담당자명</label>
                <div className="flex items-center gap-2.5 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-gray-400 transition-colors">
                  <User size={15} className="text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={managerName}
                    onChange={e => setManagerName(e.target.value)}
                    className="flex-1 text-sm text-gray-900 outline-none bg-transparent"
                    placeholder="담당자명"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">연락처</label>
                <div className="flex items-center gap-2.5 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-gray-400 transition-colors">
                  <Phone size={15} className="text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
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
                className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                  marketingConsent
                    ? 'bg-[#8CC63F] border-[#8CC63F]'
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
                <span className="w-1 h-4 bg-[#8CC63F] rounded-full" />
                SNS 연동 설정
              </h3>
              {snsConnected && (
                <span className="flex items-center gap-1 text-xs text-[#8CC63F] font-medium">
                  <CheckCircle2 size={13} />
                  연결됨
                </span>
              )}
            </div>
            <div className="border border-gray-200 rounded-xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center shrink-0">
                  <InstagramIcon size={22} className="text-white" />
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
                    ? 'bg-[#8CC63F] text-white hover:bg-[#7AB535]'
                    : 'bg-[#8CC63F] text-white hover:bg-[#7AB535]'
                }`}
              >
                {snsConnected ? 'Instagram 연결하기' : 'Instagram 연결하기'}
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* 비밀번호 변경 모달 */}
      <Modal open={pwModal} onClose={() => setPwModal(false)} title="비밀번호 변경">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">현재 비밀번호</label>
            <input
              type="password"
              value={currentPw}
              onChange={e => setCurrentPw(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors"
              placeholder="현재 비밀번호를 입력해주세요"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">새 비밀번호</label>
            <input
              type="password"
              value={newPw}
              onChange={e => setNewPw(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors"
              placeholder="새 비밀번호 (8자 이상)"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">새 비밀번호 확인</label>
            <input
              type="password"
              value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors"
              placeholder="새 비밀번호를 다시 입력해주세요"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setPwModal(false)}
              className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handlePasswordChange}
              className="flex-1 bg-[#8CC63F] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#7AB535] transition-colors"
            >
              변경하기
            </button>
          </div>
        </div>
      </Modal>

      {/* SNS 연결 모달 */}
      <Modal open={snsModal} onClose={() => setSnsModal(false)} title="Instagram 연결">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
              <Link size={24} className="text-gray-400" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Instagram 비즈니스 계정</label>
            <input
              type="text"
              value={snsHandle}
              onChange={e => setSnsHandle(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors"
              placeholder="Instagram 아이디를 입력해주세요"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setSnsModal(false)}
              className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSnsConnect}
              className="flex-1 bg-[#8CC63F] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#7AB535] transition-colors"
            >
              연결
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
