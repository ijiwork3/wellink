import { useState } from 'react'
import { User, Activity } from 'lucide-react'
import Layout from '../components/Layout'
import CustomCheckbox from '../components/CustomCheckbox'
import Toggle from '../components/Toggle'
import Modal from '../components/Modal'
import Toast, { useToast } from '../components/Toast'

const activityFields = [
  '헬스', '필라테스', '요가', '크로스핏', '수영', '스포츠', '기타', '아웃도어(배낭여행·트레킹)',
]

const inputClass =
  'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8CC63F]/30 focus:border-[#8CC63F] transition-all duration-150'

export default function Profile() {
  const [name, setName] = useState('김찬기')
  const [instagram, setInstagram] = useState('chanstyler')
  const [marketing, setMarketing] = useState(true)
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set(['헬스', '필라테스']))
  const { toasts, addToast, removeToast } = useToast()
  const [pwModalOpen, setPwModalOpen] = useState(false)
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')

  const toggleField = (field: string) => {
    setSelectedFields((prev) => {
      const next = new Set(prev)
      if (next.has(field)) next.delete(field)
      else next.add(field)
      return next
    })
  }

  const handleSave = () => {
    if (!name.trim()) { addToast('이름을 입력해 주세요', 'error'); return }
    addToast('저장이 완료되었습니다!', 'success')
  }

  const handlePwChange = () => {
    if (!currentPw || !newPw || !confirmPw) { addToast('모든 필드를 입력해 주세요', 'error'); return }
    if (newPw !== confirmPw) { addToast('새 비밀번호가 일치하지 않아요', 'error'); return }
    setPwModalOpen(false)
    setCurrentPw(''); setNewPw(''); setConfirmPw('')
    addToast('비밀번호가 변경되었습니다!', 'success')
  }

  return (
    <Layout>
      <div className="space-y-4 max-w-xl">
        {/* 기본 정보 카드 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-5">
            <User size={16} style={{ color: '#8CC63F' }} />
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
                className="px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-150 hover:bg-[#8CC63F]/5"
                style={{ borderColor: '#8CC63F', color: '#8CC63F' }}
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
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="아이디 입력"
                  className="flex-1 border border-gray-200 rounded-r-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8CC63F]/30 focus:border-[#8CC63F] transition-all duration-150"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 활동 분야 카드 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-5">
            <Activity size={16} style={{ color: '#8CC63F' }} />
            <h2 className="text-base font-semibold text-gray-900">활동 분야</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
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
          className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-150 hover:opacity-90"
          style={{ backgroundColor: '#8CC63F' }}
        >
          저장하기
        </button>
      </div>

      {/* 비밀번호 변경 모달 */}
      <Modal isOpen={pwModalOpen} onClose={() => setPwModalOpen(false)} title="비밀번호 변경" size="sm">
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
            style={{ backgroundColor: '#8CC63F' }}
          >
            변경하기
          </button>
        </div>
      </Modal>

      {/* 토스트 */}
      <Toast toasts={toasts} onRemove={removeToast} />
    </Layout>
  )
}
