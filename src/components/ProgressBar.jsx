export default function ProgressBar({ progress }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: `${progress * 100}%`,
      height: '2px',
      background: 'var(--accent)',
      zIndex: 100,
      boxShadow: '0 0 12px rgba(255,205,0,0.4)',
      opacity: progress > 0.92 ? Math.max(0, 1 - ((progress - 0.92) / 0.06)) : 1,
      transition: 'opacity 0.2s linear',
    }} />
  )
}
