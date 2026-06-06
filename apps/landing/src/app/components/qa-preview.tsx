export function QAPreview() {
  const frames = [
    { label: "Mobile SE", viewport: 375, scale: 0.72, color: "#f87171" },
    { label: "Tablet", viewport: 768, scale: 0.46, color: "#fbbf24" },
    { label: "Desktop FHD", viewport: 1280, scale: 0.30, color: "#34d399" },
  ];

  const issues = [
    {
      badge: "수정됨",
      color: "#34d399",
      title: "FlowLines z-index",
      desc: "라인이 텍스트 위에 렌더링되던 문제 → content div z-10 추가",
    },
    {
      badge: "수정됨",
      color: "#34d399",
      title: "H1 clamp 최솟값",
      desc: "40px → 28px. 375px에서 텍스트 오버플로우 방지",
    },
    {
      badge: "수정됨",
      color: "#34d399",
      title: "설명 폰트·간격",
      desc: "15px 고정 → clamp(13px,3.5vw,15px). mt-10 → mt-5/md:mt-10",
    },
    {
      badge: "수정됨",
      color: "#34d399",
      title: "카드 그리드",
      desc: "grid-cols-1(모바일 100vh 초과) → grid-cols-2 복원, mt-8/md:mt-12",
    },
    {
      badge: "수정됨",
      color: "#34d399",
      title: "Pricing 터치타겟",
      desc: "빌링 토글 py-2(36px) → min-h-[44px]. WCAG 충족",
    },
    {
      badge: "수정됨",
      color: "#34d399",
      title: "Vision 패널 높이",
      desc: "h-[600px] 고정 → h-[360px] md:h-[600px]. 모바일 과대 노출 해소",
    },
  ];

  return (
    <div
      style={{
        fontFamily: "'Noto Sans KR', 'Inter', system-ui, sans-serif",
        background: "#0c1117",
        minHeight: "100vh",
        padding: "20px 24px",
        boxSizing: "border-box",
      }}
    >
      {/* 헤더 */}
      <div style={{ marginBottom: 16, display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap" }}>
        <h1 style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9", margin: 0 }}>
          QA Preview
        </h1>
        <span style={{ fontSize: 12, color: "#475569" }}>실사이트 기준 해상도 비교 — localhost:5175</span>
        <span style={{ fontSize: 12, color: "#22d3ee", marginLeft: "auto" }}>
          ← 스크롤 없이 한 화면에서 확인
        </span>
      </div>

      {/* 이슈 뱃지 */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {issues.map((issue) => (
          <span
            key={issue.title}
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: issue.color,
              background: `${issue.color}18`,
              border: `1px solid ${issue.color}40`,
              borderRadius: 4,
              padding: "2px 8px",
              whiteSpace: "nowrap",
            }}
          >
            ✓ {issue.title}
          </span>
        ))}
      </div>

      {/* 프레임 3단 그리드 */}
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        {frames.map(({ label, viewport, scale, color }) => {
          const displayWidth = Math.round(viewport * scale);
          const displayHeight = 520;
          const realHeight = Math.round(displayHeight / scale);

          return (
            <div key={label} style={{ flexShrink: 0 }}>
              {/* 레이블 */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <span
                  style={{
                    display: "inline-block",
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8" }}>
                  {label}
                </span>
                <span style={{ fontSize: 12, color: "#475569" }}>{viewport}px</span>
              </div>

              {/* 프레임 */}
              <div
                style={{
                  width: displayWidth,
                  height: displayHeight,
                  overflow: "hidden",
                  borderRadius: 10,
                  border: `1.5px solid ${color}50`,
                  position: "relative",
                  background: "#fff",
                  boxShadow: `0 0 0 1px ${color}20, 0 8px 24px -8px rgba(0,0,0,0.5)`,
                }}
              >
                <iframe
                  src="http://localhost:5175"
                  title={`${label} preview`}
                  scrolling="no"
                  style={{
                    width: viewport,
                    height: realHeight,
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                    border: "none",
                    display: "block",
                  }}
                />
              </div>

              {/* 해상도 정보 */}
              <p style={{ fontSize: 12, color: "#334155", marginTop: 6, textAlign: "center" }}>
                scale {scale} · {displayWidth}×{displayHeight}px
              </p>
            </div>
          );
        })}
      </div>

      {/* 이슈 상세 카드 */}
      <div
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: 8,
        }}
      >
        {issues.map(({ badge, color, title, desc }) => (
          <div
            key={title}
            style={{
              background: "#161b22",
              borderRadius: 8,
              padding: "10px 12px",
              borderLeft: `2px solid ${color}`,
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {badge}
            </span>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0", marginTop: 5 }}>
              {title}
            </p>
            <p style={{ fontSize: 12, color: "#64748b", marginTop: 3, lineHeight: 1.5 }}>
              {desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
