import { useEffect, useState } from 'react';
import styles from './BottomSheet.module.css';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const CLOSE_DURATION = 260;

export default function BottomSheet({ open, onClose, children, title }: BottomSheetProps) {
  const [mounted, setMounted] = useState(open);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setIsClosing(false);
    } else if (mounted) {
      setIsClosing(true);
      const t = setTimeout(() => {
        setMounted(false);
        setIsClosing(false);
      }, CLOSE_DURATION);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = mounted ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div
      className={`${styles.overlay} ${isClosing ? styles.overlayClosing : ''}`}
      onClick={onClose}
    >
      <div
        className={`${styles.sheet} ${isClosing ? styles.sheetClosing : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.handle} />
        {title && <h3 className={styles.title}>{title}</h3>}
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
