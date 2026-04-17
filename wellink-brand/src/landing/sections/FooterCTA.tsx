import { CtaLink } from '../components/CtaLink';

type FooterCTAProps = {
  contactUrl: string;
  termsUrl: string;
  privacyUrl: string;
  inquiryUrl: string;
};

export function FooterCTA({ contactUrl, termsUrl, privacyUrl, inquiryUrl }: FooterCTAProps) {
  return (
    <footer id="consultation" className="scroll-mt-28 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <h2 className="mb-4 text-3xl font-black text-slate-900 md:text-5xl">
          데이터가 움직이면 매출이 바뀝니다.
        </h2>
        <h2 className="mb-8 text-3xl font-black text-[#0A3622] md:text-5xl">
          피트니스 마케팅의 새로운 기준, 웰링크.
        </h2>
        <p className="mb-12 text-slate-500">
          이미 200여 개 이상의 브랜드가 웰링크와 함께
          <br />
          검증된 전문가 마케팅의 힘을 경험하고 있습니다.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <CtaLink
            href={contactUrl}
            ctaLabel="무료 상담 신청"
            ctaLocation="footer_primary"
            ctaId="footer_primary_consult"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A3622] px-10 py-5 text-lg font-bold text-white shadow-xl shadow-emerald-900/20 transition-all hover:scale-105 active:scale-95 sm:w-auto"
          >
            지금 무료 상담 신청하기
          </CtaLink>
          <CtaLink
            href={contactUrl}
            ctaLabel="사례집 열람"
            ctaLocation="footer_secondary"
            ctaId="footer_secondary_casebook"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-10 py-5 text-lg font-bold text-slate-900 transition-all hover:bg-slate-50 sm:w-auto"
          >
            사례집 열람하기
          </CtaLink>
        </div>

        <div className="mt-24 border-t border-slate-100 pt-12">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="text-xl font-black tracking-tighter text-[#0A3622]">WELLINK</div>
            <div className="flex gap-8 text-sm font-medium text-slate-400">
              <a href={termsUrl} target="_blank" rel="noopener noreferrer">
                이용약관
              </a>
              <a href={privacyUrl} target="_blank" rel="noopener noreferrer">
                개인정보처리방침
              </a>
              <a href={inquiryUrl} target="_blank" rel="noopener noreferrer">
                문의하기
              </a>
            </div>
            <div className="text-sm text-slate-400">© 2026 Wellink. All rights reserved.</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
