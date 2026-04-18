import { useState, useEffect } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { User, Activity, Camera, Star, TrendingUp, Megaphone, XCircle, RefreshCw } from 'lucide-react'
import Layout from '../components/Layout'
import { BRAND, CustomCheckbox } from '@wellink/ui'
import { Toggle } from '@wellink/ui'
import { Modal } from '@wellink/ui'
import { useToast } from '@wellink/ui'
import { useQAMode } from '@wellink/ui'

const activityFields = [
  '헬스', '필라테스', '요가', '크로스핏', '수영', '스포츠', '기타', '아웃도어(배낭여행·트레킹)',
]

const inputClass =
  'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green transition-all duration-150'

export default function Profile() {
  const qa = useQAMode()
  const [name, setName] = useState('김찬기')
  const [instagram, setInstagram] = useState('chanstyler')
  const [marketing, setMarketing] = useState(true)
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set(['헬스', '필라테스']))
  const { showToast } = useToast()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [pwModalOpen, setPwModalOpen] = useState(qa === 'modal-password')
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(qa === 'modal-withdraw')
  const [isEditing, setIsEditing] = useState(qa === 'edit')
  const [savedName, setSavedName] = useState('김찬기')
  const [savedInstagram, setSavedInstagram] = useState('chanstyler')
  const [savedFields, setSavedFields] = useState<Set<string>>(new Set(['헬스', '필라테스']))
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')

  useEffect(() => {
    if (searchParams.get('modal') === 'password') setPwModalOpen(true)
  }, [searchParams, location.key])

  useEffect(() => {
    if (qa === 'edit') setIsEditing(true)
  }, [qa])

  if (qa === 'loading') {
    return (
      <Layout>
        <div className="space-y-4 max-w-xl animate-pulse">
          {/* 프로필 요약 카드 스켈레톤 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-100" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 rounded-xl w-1/3" />
                <div className="h-3 bg-gray-100 rounded-xl w-1/2" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 @sm:gap-3 mt-4">
              {[1,2,3].map(i => (
                <div key={i} className="bg-gray-50 rounded-xl p-3">
                  <div className="h-4 bg-gray-100 rounded mx-auto w-3/4 mb-1" />
                  <div className="h-3 bg-gray-100 rounded mx-auto w-1/2" />
                </div>
              ))}
            </div>
          </div>
          {/* 기본 정보 카드 스켈레톤 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <div className="h-4 bg-gray-100 rounded-xl w-1/4" />
            {[1,2,3,4].map(i => (
              <div key={i}>
                <div className="h-3 bg-gray-100 rounded-xl w-1/5 mb-2" />
                <div className="h-10 bg-gray-100 rounded-xl" />
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
        <div className="flex flex-col items-center justify-center min-h-[350px] gap-4">
          <XCircle size={44} className="text-red-300" />
          <p className="text-sm font-semibold text-gray-900">프로필 정보를 불러오지 못했어요</p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white hover:opacity-90 transition-all duration-150"
            style={{ backgroundColor: BRAND.green }}
          >
            <RefreshCw size={14} />
            다시 시도
          </button>
        </div>
      </Layout>
    )
  }

  const toggleField = (field: string) => {
    setSelectedFields((prev) => {
      const next = new Set(prev)
      if (next.has(field)) next.delete(field)
      else next.add(field)
      return next
    })
  }

  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) { showToast('이름을 입력해 주세요', 'error'); return }
    if (selectedFields.size === 0) { showToast('활동 분야를 최소 1개 선택해 주세요', 'error'); return }
    setIsSaving(true)
    await new Promise(r => setTimeout(r, 800))
    setIsSaving(false)
    setIsEditing(false)
    setSavedName(name)
    setSavedInstagram(instagram)
    setSavedFields(new Set(selectedFields))
    showToast('저장이 완료됐어요!', 'success')
  }

  const handleCancelEdit = () => {
    setName(savedName)
    setInstagram(savedInstagram)
    setSelectedFields(new Set(savedFields))
    setIsEditing(false)
  }

  const handlePwChange = () => {
    if (!currentPw || !newPw || !confirmPw) { showToast('모든 필드를 입력해 주세요', 'error'); return }
    if (newPw !== confirmPw) { showToast('새 비밀번호가 일치하지 않아요', 'error'); return }
    setPwModalOpen(false)
    setCurrentPw(''); setNewPw(''); setConfirmPw('')
    showToast('비밀번호가 변경되었습니다!', 'success')
  }

  return (
    <Layout>
      <div className="space-y-4 max-w-xl">
        {/* 프로필 요약 카드 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-green/30 to-brand-green/10 flex items-center justify-center shrink-0">
                <User size={28} className="text-brand-green" />
              </div>
              <button
                onClick={() => showToast('프로필 사진 변경 기능은 준비 중이에요', 'info')}
                aria-label="프로필 사진 변경"
                className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-brand-green rounded-full flex items-center justify-center hover:bg-brand-green-hover transition-colors"
              >
                <Camera size={10} className="text-white" />
              </button>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-gray-900">{name}</h3>
              <p className="text-xs text-gray-400">@{instagram.replace(/^@/, '')} · 인스타그램</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 @sm:gap-3 mt-4">
            {[
              { icon: <TrendingUp size={13} className="text-brand-green" />, label: '팔로워', value: '8,700' },
              { icon: <Star size={13} className="text-amber-500" />, label: '평균 참여율', value: '4.1%' },
              { icon: <Megaphone size={13} className="text-gray-500" />, label: '완료 캠페인', value: '3건' },
            ].map(stat => (
              <div key={stat.label} className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="flex justify-center mb-1">{stat.icon}</div>
                <p className="text-sm font-bold text-gray-900">{stat.value}</p>
                <p className="text-[10px] text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 편집 모드 뱃지 */}
        {isEditing && (
          <div className="flex items-center gap-2">
            <span className="bg-brand-green/10 text-brand-green-text text-xs px-3 py-1 rounded-full font-medium">편집 모드</span>
            <button
              onClick={handleCancelEdit}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              취소
            </button>
          </div>
        )}

        {/* 기본 정보 카드 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-5">
            <User size={16} style={{ color: BRAND.green }} />
            <h2 className="text-base font-semibold text-gray-900">기본 정보</h2>
          </div>

          <div className="space-y-4">
            {/* 이름 */}
            <div>
              <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700 mb-1.5">이름 <span className="text-red-400">*</span></label>
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            </div>

            {/* 이메일 */}
            <div>
              <label htmlFor="profile-email" className="block text-sm font-medium text-gray-700 mb-1.5">이메일</label>
              <input
                id="profile-email"
                type="email"
                value="chanki@example.com"
                readOnly
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
              />
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">비밀번호</label>
              <button
                onClick={() => setPwModalOpen(true)}
                className="px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-150 hover:bg-brand-green/5"
                style={{ borderColor: BRAND.green, color: BRAND.green }}
              >
                비밀번호 변경하기
              </button>
            </div>

            {/* 인스타그램 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">인스타그램 아이디</label>
              <div className="flex items-center">
                <span className="px-3 py-2.5 border border-r-0 border-gray-200 rounded-l-xl text-sm text-gray-400 bg-gray-50">@</span>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value.replace(/^@/, ''))}
                  placeholder="아이디 입력"
                  aria-label="인스타그램 아이디"
                  className="flex-1 border border-gray-200 rounded-r-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green transition-all duration-150"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 활동 분야 카드 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-5">
            <Activity size={16} style={{ color: BRAND.green }} />
            <h2 className="text-base font-semibold text-gray-900">활동 분야</h2>
          </div>

          <div className="grid grid-cols-2 @sm:grid-cols-4 gap-3">
            {activityFields.map((field) => (
              <CustomCheckbox
                key={field}
                checked={selectedFields.has(field)}
                onChange={() => toggleField(field)}
                label={field}
              />
            ))}
          </div>

          {/* 마케팅 수신 동의 */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50 mt-5">
            <div>
              <p className="text-sm font-medium text-gray-900">마케팅 수신 동의</p>
              <p className="text-xs text-gray-500 mt-0.5">캠페인 알림, 신규 혜택 등을 받아볼 수 있어요</p>
            </div>
            <Toggle checked={marketing} onChange={() => setMarketing(!marketing)} />
          </div>
        </div>

        {/* 저장 버튼 */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-150 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ backgroundColor: BRAND.green }}
        >
          {isSaving ? '저장 중...' : '저장하기'}
        </button>

        {/* 회원탈퇴 */}
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setWithdrawModalOpen(true)}
            className="text-xs text-gray-400 hover:text-red-400 underline underline-offset-2 transition-colors"
          >
            회원탈퇴
          </button>
        </div>
      </div>

      {/* 비밀번호 변경 모달 */}
      <Modal open={pwModalOpen} onClose={() => { setPwModalOpen(false); setCurrentPw(''); setNewPw(''); setConfirmPw('') }} title="비밀번호 변경" size="sm">
        <div className="space-y-3">
          {([
            { ph: '현재 비밀번호', id: 'pw-current', val: currentPw, setter: setCurrentPw },
            { ph: '새 비밀번호', id: 'pw-new', val: newPw, setter: setNewPw },
            { ph: '새 비밀번호 확인', id: 'pw-confirm', val: confirmPw, setter: setConfirmPw },
          ] as const).map(({ ph, id, val, setter }) => (
            <div key={id}>
              <label htmlFor={id} className="sr-only">{ph}</label>
              <input
                id={id}
                type="password"
                placeholder={ph}
                value={val}
                onChange={(e) => setter(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handlePwChange() }}
                className={inputClass}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-5">
          <button
            onClick={() => setPwModalOpen(false)}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-150"
          >
            취소
          </button>
          <button
            onClick={handlePwChange}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-150 hover:opacity-90"
            style={{ backgroundColor: BRAND.green }}
          >
            변경하기
          </button>
        </div>
      </Modal>

      {/* 회원탈퇴 모달 */}
      <Modal open={withdrawModalOpen} onClose={() => setWithdrawModalOpen(false)} title="회원탈퇴" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">정말로 탈퇴하시겠습니까? 탈퇴 후에는 모든 데이터가 삭제되며 복구할 수 없습니다.</p>
          <div className="p-3 rounded-xl text-sm bg-red-50 text-red-600">
            탈퇴 시 캠페인 신청 내역, 프로필 정보 등이 모두 삭제됩니다.
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setWithdrawModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-150"
            >
              취소
            </button>
            <button
              onClick={() => { setWithdrawModalOpen(false); showToast('탈퇴 기능은 준비 중이에요', 'info') }}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-all duration-150"
            >
              탈퇴하기
            </button>
          </div>
        </div>
      </Modal>

      {/* 토스트 */}
    </Layout>
  )
}
