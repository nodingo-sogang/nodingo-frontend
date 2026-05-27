import { useEffect } from 'react';
import type { Badge } from '../../types/game';

interface BadgePopupProps {
  badge: Badge | null;
  accentColor?: string;
  onClose: () => void;
}

const CATEGORY_ICON: Record<string, string> = {
  attendance: '📅',
  explore: '🗺️',
  quiz: '🧠',
  social: '👥',
  special: '⭐',
};

export default function BadgePopup({ badge, accentColor = '#5BBA6F', onClose }: BadgePopupProps) {
  useEffect(() => {
    if (!badge) return;
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [badge, onClose]);

  if (!badge) return null;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 300,
      background: 'rgba(15,17,21,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#FFFFFF', borderRadius: 28,
        padding: '32px 28px 24px',
        textAlign: 'center',
        width: 280,
        animation: 'nodingo-modal-in 0.4s cubic-bezier(.3,1.4,.4,1) both',
      }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>{CATEGORY_ICON[badge.category] ?? '🏅'}</div>
        <div style={{
          fontSize: 11, fontWeight: 700, color: accentColor,
          letterSpacing: '.08em', textTransform: 'uppercase',
        }}>
          뱃지 획득!
        </div>
        <div style={{
          fontSize: 22, fontWeight: 900, color: '#0F1115',
          marginTop: 4,
        }}>
          {badge.name}
        </div>
        <div style={{
          fontSize: 13, color: '#6B6B66', marginTop: 8,
          lineHeight: 1.5,
        }}>
          {badge.description}
        </div>
        <button onClick={onClose} style={{
          marginTop: 20, width: '100%', padding: '13px 0',
          borderRadius: 18, background: accentColor, color: '#fff',
          border: 'none', cursor: 'pointer',
          fontSize: 14, fontWeight: 800,
        }}>확인</button>
      </div>
    </div>
  );
}
