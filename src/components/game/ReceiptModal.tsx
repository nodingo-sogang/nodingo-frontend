import { useRef } from 'react';
import type { ReceiptData } from '../../types/game';

interface ReceiptModalProps {
  data: ReceiptData;
  onClose: () => void;
}

const SERRATED = `M0,0 Q10,14 20,0 Q30,14 40,0 Q50,14 60,0 Q70,14 80,0 Q90,14 100,0
  Q110,14 120,0 Q130,14 140,0 Q150,14 160,0 Q170,14 180,0 Q190,14 200,0
  Q210,14 220,0 Q230,14 240,0 Q250,14 260,0 Q270,14 280,0 Q290,14 300,0
  Q310,14 320,0 Q330,14 340,0 Q350,14 360,0 Q370,14 380,0 Q390,14 400,0
  L400,14 L0,14 Z`;

export default function ReceiptModal({ data, onClose }: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);

  // 텍스트 폴백 (이미지 캡처 실패 시)
  const shareText =
    `🧾 노딩고 데일리 인사이트\n오늘의 지식 칼로리 +50 XP · 새 시냅스 ${data.synapseFrom} → ${data.synapseTo}\n#노딩고 #지식그래프`;

  const shareTextFallback = async () => {
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ title: '노딩고 데일리 인사이트', text: shareText, url: window.location.origin });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareText}\n${window.location.origin}`);
        alert('공유 문구를 클립보드에 복사했어요!');
      }
    } catch { /* 취소 등 무시 */ }
  };

  // 영수증을 PNG 이미지로 떠서 공유 → 인스타 등에 실제 이미지로 전송.
  // 모바일: navigator.share(files) / 데스크톱·미지원: PNG 다운로드 / 실패: 텍스트 폴백
  const handleShare = async () => {
    const node = shareCardRef.current ?? receiptRef.current;
    if (!node) { void shareTextFallback(); return; }
    try {
      // 무거운 라이브러리 → 공유 클릭 시에만 동적 로딩 (별도 청크)
      const { toBlob } = await import('html-to-image');
      const blob = await toBlob(node, { pixelRatio: 3, cacheBust: true, backgroundColor: '#5BBA6F' });
      if (!blob) throw new Error('capture failed');
      const file = new File([blob], `nodingo-receipt-${data.serial}.png`, { type: 'image/png' });

      if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] }) && navigator.share) {
        await navigator.share({ files: [file], title: '노딩고 데일리 인사이트', text: shareText });
      } else {
        // 다운로드 폴백 (데스크톱 등) → 사용자가 직접 인스타에 업로드
        const objUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objUrl;
        a.download = `nodingo-receipt-${data.serial}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(objUrl);
      }
    } catch {
      void shareTextFallback(); // 캡처/공유 실패 시 텍스트로
    }
  };

  return (
    <>
      {/* ── 인스타 스토리용 공유 카드 (바깥 래퍼=화면 밖 / 안쪽=캡처 대상, 위치 스타일 없음) ── */}
      <div aria-hidden style={{ position: 'fixed', left: '-99999px', top: 0, pointerEvents: 'none' }}>
      <div ref={shareCardRef} style={{
        width: 360, height: 640, boxSizing: 'border-box',   // 9:16 인스타 스토리 규격
        padding: '46px 30px 40px',
        background: 'linear-gradient(160deg,#5BBA6F 0%,#3E9E7E 50%,#4FA3E0 100%)',
        fontFamily: '"Pretendard", -apple-system, system-ui, sans-serif',
        color: '#FFFFFF',
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* 배경 장식 원 */}
        <div style={{ position: 'absolute', top: -70, right: -55, width: 190, height: 190, borderRadius: '50%', background: 'rgba(255,255,255,0.10)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -65, width: 210, height: 210, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />

        {/* 상단: 브랜드 + 헤드라인 */}
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontWeight: 900, fontSize: 19, letterSpacing: '-0.02em' }}>
            <svg width="27" height="27" viewBox="0 0 22 22" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="4" fill="#FFFFFF" />
              <circle cx="4" cy="5" r="2.5" fill="#FFFFFF" opacity="0.85" />
              <circle cx="18" cy="5" r="2.5" fill="#FFFFFF" opacity="0.85" />
              <circle cx="4" cy="17" r="2.5" fill="#FFFFFF" opacity="0.85" />
              <circle cx="18" cy="17" r="2.5" fill="#FFFFFF" opacity="0.85" />
              <line x1="11" y1="11" x2="4" y2="5" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.55" />
              <line x1="11" y1="11" x2="18" y2="5" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.55" />
              <line x1="11" y1="11" x2="4" y2="17" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.55" />
              <line x1="11" y1="11" x2="18" y2="17" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.55" />
            </svg>
            Nodingo
          </div>
          <div style={{ marginTop: 28, fontSize: 12, fontWeight: 800, letterSpacing: '.16em', opacity: 0.9 }}>
            오늘의 지식 영수증
          </div>
          <div style={{ marginTop: 8, fontSize: 29, fontWeight: 900, lineHeight: 1.3, letterSpacing: '-0.03em' }}>
            {data.username} 님,<br />오늘도 지식 한 입 🧠
          </div>
        </div>

        {/* 중앙: 흰 성과 패널 */}
        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '100%', background: '#FFFFFF', color: '#0F1115', borderRadius: 26, padding: '24px 24px 20px', boxShadow: '0 16px 42px rgba(15,17,21,0.24)' }}>
            {[
              ['오늘의 지식 칼로리', '+50 XP'],
              ['새로 연결된 시냅스', `${data.synapseFrom} → ${data.synapseTo}`],
              ['일일 목표', 'CLEAR ✓'],
              ['발급일', data.date],
            ].map(([k, v], i, arr) => (
              <div key={k} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '9px 0', fontSize: 14.5,
                borderBottom: i < arr.length - 1 ? '1px dashed #ECECE8' : 'none',
              }}>
                <span style={{ color: '#6B6B66', fontWeight: 700 }}>{k}</span>
                <span style={{ fontWeight: 900 }}>{v}</span>
              </div>
            ))}
            <div style={{ marginTop: 14, textAlign: 'center', fontFamily: '"Courier New", monospace', fontSize: 11, letterSpacing: 4, color: '#9A9A94' }}>
              {data.serial}
            </div>
          </div>
        </div>

        {/* 하단: 브랜딩 */}
        <div style={{ position: 'relative', textAlign: 'center', fontSize: 12.5, fontWeight: 700, opacity: 0.94, lineHeight: 1.7 }}>
          매일 뉴스로 나만의 지식지도를 키워요<br />
          <span style={{ opacity: 0.82 }}>#노딩고 #지식그래프</span>
        </div>
      </div>
      </div>

    <div style={{
      position: 'absolute', inset: 0, zIndex: 200,
      background: 'rgba(15,17,21,0.5)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      padding: '0 16px 36px',
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '24px 24px 16px 16px',
        width: '100%', maxWidth: 380,
        overflow: 'hidden',
        animation: 'nodingo-receipt-in 0.45s cubic-bezier(.3,1.4,.4,1) both',
        boxShadow: '0 -8px 48px rgba(15,17,21,0.22)',
      }}>
        {/* receiptRef: 캡처 대상 (영수증 본문 + 톱니 가장자리, 버튼 제외) */}
        <div ref={receiptRef} style={{ background: '#FFFFFF' }}>
        <div style={{
          padding: '26px 28px 24px',
          fontFamily: '"Courier New", "Courier", monospace',
          color: '#0F1115',
        }}>
          <div style={{
            textAlign: 'center',
            paddingBottom: 16, marginBottom: 16,
            borderBottom: '1px dashed #D8D8D2',
          }}>
            <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 2.5, marginBottom: 5 }}>
              NODINGO · DAILY INSIGHT
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: 4 }}>
              RECEIPT
            </div>
            <div style={{ fontSize: 11, color: '#6B6B66', marginTop: 2 }}>{data.date}</div>
          </div>

          <div style={{ fontSize: 13, lineHeight: 2.1, marginBottom: 16 }}>
            {[
              ['고객명', data.username],
              ['오늘의 지식 칼로리', '+50 XP'],
              ['새로 연결된 시냅스', `${data.synapseFrom} → ${data.synapseTo}`],
              ['절약한 시간', '12 min'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B6B66' }}>{k}</span>
                <span style={{ fontWeight: 700 }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{
            paddingTop: 12, marginBottom: 16,
            borderTop: '1px dashed #D8D8D2',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: 14 }}>
              <span>DAILY GOAL</span>
              <span>CLEAR</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6B6B66', marginTop: 4 }}>
              <span>영수증 발급 완료</span>
              <span>🧾</span>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 10 }}>
            <svg width="200" height="40" viewBox="0 0 200 40" style={{ display: 'inline-block' }}>
              {Array.from({ length: 55 }, (_, i) => (
                <rect key={i}
                  x={i * 3.5 + (i % 4 === 0 ? 0.5 : 0)}
                  y={0}
                  width={i % 7 === 0 ? 2.5 : i % 3 === 0 ? 2 : 1.5}
                  height={40}
                  fill="#222"
                />
              ))}
            </svg>
            <div style={{ fontSize: 9, letterSpacing: 4, color: '#999', marginTop: 3 }}>
              {data.serial}
            </div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF' }}>
          <svg width="100%" height="14" viewBox="0 0 400 14" preserveAspectRatio="none"
            style={{ display: 'block', transform: 'rotate(180deg)' }}>
            <path d={SERRATED} fill="rgba(15,17,21,0.5)" />
          </svg>
        </div>
        </div>{/* /receiptRef */}

        <div style={{
          background: '#FFFFFF',
          display: 'flex', gap: 10, padding: '16px 20px 20px',
        }}>
          <button onClick={onClose} style={{
            flex: 1, padding: 13, borderRadius: 13, border: 'none',
            background: '#F4F4F0', color: '#6B6B66',
            fontSize: 14, fontWeight: 800, cursor: 'pointer',
            fontFamily: 'Pretendard, -apple-system, system-ui, sans-serif',
          }}>닫기</button>
          <button
            onClick={handleShare}
            style={{
              flex: 1.4, padding: 13, borderRadius: 13, border: 'none',
              background: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)',
              color: '#fff',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'Pretendard, -apple-system, system-ui, sans-serif',
            }}
          >
            공유하기
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
