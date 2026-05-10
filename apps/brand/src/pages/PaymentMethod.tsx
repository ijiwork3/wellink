import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CreditCard, ShieldCheck, AlertCircle, CheckCircle2, Plus, Trash2 } from 'lucide-react'
import { Modal, AlertModal, useToast, TIMER_MS, CustomCheckbox } from '@wellink/ui'
import { fmtDate } from '../utils/fmtDate'

/** 결제 수단 변경 — 토스페이먼츠 빌링 인증 mock */

interface CardMethod {
  id: string
  brand: string         // VISA·MASTER·신한·국민 등
  last4: string         // 끝 4자리
  expiresAt: string     // MM/YY
  isDefault: boolean
  registeredAt: string  // YYYY-MM-DD
}

const MOCK_METHODS: CardMethod[] = [
  { id: 'card-1', brand: '신한카드', last4: '1234', expiresAt: '12/27', isDefault: true,  registeredAt: '2026-01-15' },
  { id: 'card-2', brand: 'KB국민',   last4: '5678', expiresAt: '08/26', isDefault: false, registeredAt: '2026-03-22' },
]

export default function PaymentMethod() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [methods, setMethods] = useState<CardMethod[]>(MOCK_METHODS)
  const [addModal, setAddModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<CardMethod | null>(null)
  const [registering, setRegistering] = useState(false)

  // 카드 추가 폼
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry]         = useState('')
  const [cvc, setCvc]               = useState('')
  const [holder, setHolder]         = useState('')
  const [setAsDefault, setSetAsDefault] = useState(true)

  const formatCardNumber = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 16)
    return d.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
  }
  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4)
    if (d.length < 3) return d
    return `${d.slice(0, 2)}/${d.slice(2)}`
  }

  const resetAddForm = () => {
    setCardNumber(''); setExpiry(''); setCvc(''); setHolder(''); setSetAsDefault(true)
  }

  const handleRegister = () => {
    const num = cardNumber.replace(/\s/g, '')
    if (num.length !== 16) { showToast('카드 번호 16자리를 입력해 주세요.', 'error'); return }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) { showToast('유효기간을 MM/YY 형식으로 입력해 주세요.', 'error'); return }
    if (cvc.length !== 3) { showToast('CVC 3자리를 입력해 주세요.', 'error'); return }
    if (!holder.trim()) { showToast('카드 소유자명을 입력해 주세요.', 'error'); return }

    setRegistering(true)
    setTimeout(() => {
      const newCard: CardMethod = {
        id: `card-${Date.now()}`,
        brand: '새 카드',
        last4: num.slice(-4),
        expiresAt: expiry,
        isDefault: setAsDefault,
        registeredAt: new Date().toISOString().slice(0, 10),
      }
      setMethods(prev => {
        const next = setAsDefault ? prev.map(m => ({ ...m, isDefault: false })) : prev
        return [...next, newCard]
      })
      setRegistering(false)
      setAddModal(false)
      resetAddForm()
      showToast('결제 수단이 등록되었습니다.', 'success')
    }, TIMER_MS.FORM_SUBMIT)
  }

  const handleSetDefault = (id: string) => {
    setMethods(prev => prev.map(m => ({ ...m, isDefault: m.id === id })))
    showToast('기본 결제 수단으로 변경되었습니다.', 'success')
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    if (deleteTarget.isDefault && methods.length > 1) {
      showToast('기본 결제 수단은 삭제할 수 없습니다. 다른 카드를 기본으로 설정한 후 삭제해 주세요.', 'error')
      setDeleteTarget(null)
      return
    }
    setMethods(prev => prev.filter(m => m.id !== deleteTarget.id))
    setDeleteTarget(null)
    showToast(`${deleteTarget.brand} **** ${deleteTarget.last4} 카드가 삭제되었습니다.`, 'info')
  }

  const defaultMethod = methods.find(m => m.isDefault) ?? methods[0]
  const hasFailedPayment = false // TODO: BE 연동 시 최근 결제 실패 여부 확인

  return (
    <div className="space-y-5">
      {/* 헤더 */}
      <div className="flex items-center gap-2">
        <button type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로 가기"
          className="w-10 h-10 -ml-2 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
        >
          <ArrowLeft size={18} aria-hidden="true" />
        </button>
        <h1 className="text-2xl @md:text-3xl font-bold tracking-tight text-gray-900">결제 수단 관리</h1>
      </div>

      {/* 결제 실패 배너 */}
      {hasFailedPayment && (
        <div className="bg-red-100 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-base font-semibold text-red-700">최근 결제가 실패했습니다</p>
            <p className="text-sm text-red-600 mt-0.5">카드 한도·유효기간을 확인하시거나 새 결제 수단을 추가해 주세요.</p>
          </div>
        </div>
      )}

      {/* 기본 결제 수단 카드 */}
      {defaultMethod && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900">기본 결제 수단</h2>
            <span className="text-sm bg-brand-green-bg text-brand-green-text font-semibold px-2.5 py-1 rounded-full">
              매월 자동 결제
            </span>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-gray-700 text-white rounded-xl p-5">
            <div className="flex items-center justify-between mb-6">
              <CreditCard size={22} aria-hidden="true" />
              <span className="text-sm font-medium opacity-80">{defaultMethod.brand}</span>
            </div>
            <p className="text-xl font-mono tracking-widest mb-4">**** **** **** {defaultMethod.last4}</p>
            <div className="flex items-center justify-between text-sm opacity-80">
              <span>유효기간 {defaultMethod.expiresAt}</span>
              <span>등록일 {fmtDate(defaultMethod.registeredAt)}</span>
            </div>
          </div>
        </div>
      )}

      {/* 등록된 결제 수단 목록 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <h2 className="text-base font-semibold text-gray-900">등록된 결제 수단 <span className="text-gray-500 font-normal">{methods.length}개</span></h2>
          <button type="button"
            onClick={() => setAddModal(true)}
            className="flex items-center gap-1.5 bg-brand-green text-white px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-green-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 whitespace-nowrap"
          >
            <Plus size={14} aria-hidden="true" />
            결제 수단 추가
          </button>
        </div>
        {methods.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <CreditCard size={32} className="text-gray-300 mx-auto mb-3" aria-hidden="true" />
            <p className="text-base text-gray-500 mb-1">등록된 결제 수단이 없습니다.</p>
            <p className="text-sm text-gray-500">결제 수단을 추가하면 자동 결제가 활성화됩니다.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {methods.map(m => (
              <li key={m.id} className="px-5 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                  <CreditCard size={16} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-semibold text-gray-900 whitespace-nowrap">{m.brand}</span>
                    <span className="text-sm text-gray-500 font-mono whitespace-nowrap">**** {m.last4}</span>
                    {m.isDefault && (
                      <span className="text-sm bg-brand-green-bg text-brand-green-text font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">기본</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">유효기간 {m.expiresAt} · 등록일 {fmtDate(m.registeredAt)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!m.isDefault && (
                    <button type="button"
                      onClick={() => handleSetDefault(m.id)}
                      className="text-sm text-gray-700 border border-gray-200 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 whitespace-nowrap"
                    >
                      기본으로 설정
                    </button>
                  )}
                  <button type="button"
                    onClick={() => setDeleteTarget(m)}
                    aria-label={`${m.brand} **** ${m.last4} 삭제`}
                    className="w-10 h-10 flex items-center justify-center text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/60"
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 보안 안내 */}
      <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 flex items-start gap-2">
        <ShieldCheck size={14} className="text-gray-500 mt-0.5 shrink-0" aria-hidden="true" />
        <p className="text-sm text-gray-600 leading-relaxed">
          결제 정보는 토스페이먼츠를 통해 안전하게 암호화되어 저장됩니다.
          웰링크는 카드 정보를 직접 보관하지 않습니다.
        </p>
      </div>

      {/* 결제 수단 추가 모달 */}
      <Modal
        open={addModal}
        onClose={() => { if (!registering) { setAddModal(false); resetAddForm() } }}
        title="결제 수단 추가"
        footer={
          <>
            <button type="button"
              disabled={registering}
              onClick={() => { setAddModal(false); resetAddForm() }}
              className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-base hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              취소
            </button>
            <button type="button"
              disabled={registering}
              onClick={handleRegister}
              className="flex-1 bg-brand-green text-white py-2.5 rounded-xl text-base font-medium hover:bg-brand-green-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {registering ? '등록 중…' : '등록'}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label htmlFor="card-number" className="text-sm text-gray-500 mb-1.5 block">카드 번호</label>
            <input
              id="card-number"
              type="text"
              inputMode="numeric"
              value={cardNumber}
              onChange={e => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="0000 0000 0000 0000"
              maxLength={19}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base font-mono outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="card-expiry" className="text-sm text-gray-500 mb-1.5 block">유효기간</label>
              <input
                id="card-expiry"
                type="text"
                inputMode="numeric"
                value={expiry}
                onChange={e => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM/YY"
                maxLength={5}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base font-mono outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
              />
            </div>
            <div>
              <label htmlFor="card-cvc" className="text-sm text-gray-500 mb-1.5 block">CVC</label>
              <input
                id="card-cvc"
                type="text"
                inputMode="numeric"
                value={cvc}
                onChange={e => setCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
                placeholder="000"
                maxLength={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base font-mono outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
              />
            </div>
          </div>
          <div>
            <label htmlFor="card-holder" className="text-sm text-gray-500 mb-1.5 block">카드 소유자 이름</label>
            <input
              id="card-holder"
              type="text"
              value={holder}
              onChange={e => setHolder(e.target.value)}
              placeholder="HONG GILDONG"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
            />
          </div>
          <CustomCheckbox
            checked={setAsDefault}
            onChange={() => setSetAsDefault(prev => !prev)}
            label="기본 결제 수단으로 설정"
            labelClassName="text-sm text-gray-600"
            className="mt-2"
          />
          <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 flex items-start gap-2 mt-2">
            <CheckCircle2 size={14} className="text-gray-500 mt-0.5 shrink-0" aria-hidden="true" />
            <p className="text-sm text-gray-600">테스트 환경에서는 실제 결제가 발생하지 않습니다.</p>
          </div>
        </div>
      </Modal>

      {/* 결제 수단 삭제 확인 */}
      <AlertModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="결제 수단 삭제"
        description={deleteTarget ? `${deleteTarget.brand} **** ${deleteTarget.last4} 카드를 삭제하시겠습니까?` : ''}
        confirmLabel="삭제"
        cancelLabel="취소"
        variant="danger"
        size="sm"
        onConfirm={handleDelete}
      />
    </div>
  )
}
