import styles from './SnowOverlay.module.css';

const FLAKES = 22;

export function SnowOverlay() {
  return (
    <div className={styles.overlay} aria-hidden>
      {Array.from({ length: FLAKES }).map((_, index) => {
        const size = 6 + (index % 4);
        const duration = 12 + (index % 8);
        const delay = (index * 0.7) % 6;
        const left = (index * 97) % 100;
        return (
          <span
            key={index}
            className={styles.flake}
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
