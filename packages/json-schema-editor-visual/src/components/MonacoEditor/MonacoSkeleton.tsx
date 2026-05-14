import styles from './MonacoSkeleton.module.css';

export interface MonacoSkeletonProps {
  lines?: number;
  minHeight?: number | string;
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
}

const linePattern = [
  { width: '33%', indent: 0 },
  { width: '0%', indent: 0 },
  { width: '50%', indent: 0 },
  { width: '75%', indent: 1 },
  { width: '66%', indent: 1 },
  { width: '50%', indent: 2 },
  { width: '85%', indent: 2 },
  { width: '25%', indent: 1 },
  { width: '0%', indent: 0 },
  { width: '40%', indent: 0 },
  { width: '100%', indent: 1 },
  { width: '33%', indent: 1 },
];

export function MonacoSkeleton({
  lines = 12,
  minHeight = 400,
  className = '',
  theme = 'auto',
}: MonacoSkeletonProps) {
  const themeClass =
    theme === 'dark' ? styles.dark : theme === 'auto' ? styles.auto : '';

  return (
    <div
      className={[styles.container, themeClass, className]
        .filter(Boolean)
        .join(' ')}
      style={{
        minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
      }}
    >
      <aside className={styles.gutter} aria-hidden="true">
        {Array.from({ length: lines }, (_, i) => (
          <div key={i} className={styles.lineNumber}>
            {i + 1}
          </div>
        ))}
      </aside>

      <div className={styles.content}>
        {Array.from({ length: lines }, (_, i) => {
          const { width, indent } = linePattern[i % linePattern.length];

          return (
            <div
              key={i}
              className={styles.row}
              style={indent ? { paddingLeft: `${indent * 2}rem` } : undefined}
            >
              {width !== '0%' && (
                <div className={styles.code} style={{ width }} />
              )}
            </div>
          );
        })}

        <div className={styles.scrollbar}>
          <div className={styles.scrollThumb} />
        </div>
      </div>
    </div>
  );
}

export default MonacoSkeleton;
