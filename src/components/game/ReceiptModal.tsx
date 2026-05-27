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
  return (
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
            onClick={() => alert('공유 기능 준비 중')}
            style={{
              flex: 1.4, padding: 13, borderRadius: 13, border: 'none',
              background: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)',
              color: '#fff',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'Pretendard, -apple-system, system-ui, sans-serif',
            }}
          >
            Instagram 공유
          </button>
        </div>
      </div>
    </div>
  );
}
