import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";

export function ContactFab() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        aria-label="문의하기"
        onClick={() => setOpen(true)}
        className="group fixed right-6 z-50 inline-flex h-[63px] w-[63px] items-center justify-center rounded-full text-white transition-all duration-300 hover:translate-y-[-2px] hover:scale-[1.04] active:scale-[0.98] lg:right-8"
        style={{
          bottom: "max(24px, env(safe-area-inset-bottom, 24px))",
          background: "linear-gradient(180deg, var(--cm) 0%, var(--cp) 100%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25), 0 8px 20px -8px rgba(var(--cd-rgb),0.45)",
        }}
      >
        <MessageCircle size={22} strokeWidth={2} />
      </button>

      {open && <ContactModal onClose={() => setOpen(false)} />}
    </>
  );
}

function ContactModal({ onClose }: { onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", contact: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-end p-4 lg:p-8"
      style={{ animation: "modalFade 200ms ease both" }}
    >
      <button
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-neutral-950/40 backdrop-blur-[2px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
        className="relative w-full max-w-[400px] overflow-hidden rounded-2xl bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.3)]"
        style={{ animation: "modalSlide 320ms cubic-bezier(0.22,1,0.36,1) both" }}
      >
        <div
          className="relative px-6 py-5 text-white"
          style={{ background: "linear-gradient(135deg, var(--cp) 0%, var(--cm) 100%)" }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 id="contact-modal-title" style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em" }}>
                무엇을 도와드릴까요?
              </h3>
              <p className="mt-1 text-white/85" style={{ fontSize: 14, lineHeight: 1.55 }}>
                평일 영업시간 내 1시간 이내 답변드립니다.
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="닫기"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/85 transition-colors hover:bg-white/15 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {submitted ? (
          <div className="px-6 py-10 text-center">
            <div
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: "rgba(var(--cp-rgb),0.12)" }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M5 12.5l4.5 4.5L19 7" stroke="var(--cp)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h4 className="mt-4 text-neutral-950" style={{ fontSize: 16, fontWeight: 700 }}>
              문의가 접수되었습니다
            </h4>
            <p className="mt-2 text-neutral-600" style={{ fontSize: 14, lineHeight: 1.6 }}>
              담당자가 곧 연락드리겠습니다.
            </p>
            <button
              onClick={onClose}
              className="mt-6 inline-flex h-10 items-center rounded-full px-5 text-white transition-colors"
              style={{
                fontSize: 14,
                fontWeight: 600,
                background: "linear-gradient(135deg,var(--cp) 0%,var(--cm) 100%)",
              }}
            >
              닫기
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5">
            <Field label="이름">
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="홍길동"
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 outline-none transition-all focus:border-[var(--cp)] focus:ring-2 focus:ring-[var(--cp)]/15"
                style={{ fontSize: 14 }}
              />
            </Field>
            <Field label="연락처 (이메일 또는 전화)">
              <input
                type="text"
                required
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
                placeholder="hello@brand.com"
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 outline-none transition-all focus:border-[var(--cp)] focus:ring-2 focus:ring-[var(--cp)]/15"
                style={{ fontSize: 14 }}
              />
            </Field>
            <Field label="문의 내용">
              <textarea
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="간단히 적어주세요"
                rows={3}
                className="w-full resize-none rounded-lg border border-neutral-200 bg-white px-3 py-2.5 outline-none transition-all focus:border-[var(--cp)] focus:ring-2 focus:ring-[var(--cp)]/15"
                style={{ fontSize: 14, lineHeight: 1.6 }}
              />
            </Field>
            <button
              type="submit"
              className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-full text-white transition-all hover:translate-y-[-1px]"
              style={{
                fontSize: 14,
                fontWeight: 600,
                background: "linear-gradient(135deg,var(--cp) 0%,var(--cm) 100%)",
                boxShadow: "0 8px 18px -8px rgba(var(--cp-rgb),0.45)",
              }}
            >
              문의 보내기
            </button>
            <p className="mt-3 text-center text-neutral-400" style={{ fontSize: 12 }}>
              제출 시 개인정보 처리방침에 동의하는 것으로 간주됩니다.
            </p>
          </form>
        )}
      </div>

      <style>{`
        @keyframes modalFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlide {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mb-3 block">
      <span
        className="mb-1.5 block text-neutral-700"
        style={{ fontSize: 12, fontWeight: 600, letterSpacing: "-0.005em" }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}
