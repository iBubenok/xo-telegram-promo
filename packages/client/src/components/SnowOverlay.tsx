import styles from './SnowOverlay.module.css';

const ORBS = 16;

export function SnowOverlay() {
  return (
    <div className={styles.overlay} aria-hidden>
      {Array.from({ length: ORBS }).map((_, index) => {
        const size = 18 + (index % 5) * 6;
        const duration = 14 + (index % 7);
        const delay = (index * 0.8) % 7;
        const left = (index * 61) % 100;
        return (
          <span
            key={`orb-${index}`}
            className={styles.orb}
            style={{
              width: `${size}px`,
              height: `${size}px`,
              animationDuration: `${duration}s`,
              animationDelay: `-${delay}s`,
              left: `${left}%`
            }}
          />
        );
      })}
    </div>
  );
}
