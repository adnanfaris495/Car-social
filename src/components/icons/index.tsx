export const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)

export const CarWheel = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    width={40}
    height={40}
  >
    {/* Outer rim */}
    <circle cx="32" cy="32" r="30" stroke="#111" strokeWidth="4" fill="#111" />
    {/* Inner hub */}
    <circle cx="32" cy="32" r="6" fill="#111" />
    {/* 8 white spokes */}
    <line x1="32" y1="6" x2="32" y2="26" stroke="#fff" strokeWidth="2" />
    <line x1="32" y1="58" x2="32" y2="38" stroke="#fff" strokeWidth="2" />
    <line x1="6" y1="32" x2="26" y2="32" stroke="#fff" strokeWidth="2" />
    <line x1="58" y1="32" x2="38" y2="32" stroke="#fff" strokeWidth="2" />
    <line x1="14" y1="14" x2="26" y2="26" stroke="#fff" strokeWidth="2" />
    <line x1="50" y1="50" x2="38" y2="38" stroke="#fff" strokeWidth="2" />
    <line x1="14" y1="50" x2="26" y2="38" stroke="#fff" strokeWidth="2" />
    <line x1="50" y1="14" x2="38" y2="26" stroke="#fff" strokeWidth="2" />
  </svg>
)

export const GarageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 3h18v6H3zM3 15h18v6H3z" />
    <path d="M4 9v6M20 9v6" />
  </svg>
)

export const MarketplaceIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 3h18l-1.5 9h-15L3 3z" />
    <circle cx="8" cy="19" r="2" />
    <circle cx="16" cy="19" r="2" />
    <path d="M4.5 12L6 16h12" />
  </svg>
)

export const ForumsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="8" />
    <path d="M12 8v8M8 12h8" strokeLinecap="round" />
  </svg>
)

export const MeetsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
)

// Brand logos as minimal SVG icons
const BrandLogos: Record<string, React.FC> = {
  BMW: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 1v22M1 12h22" stroke="currentColor" strokeWidth="2"/>
      <path fill="currentColor" d="M12 12l6-6L12 0h6l6 6-6 6zM12 12l-6 6L0 12v6l6 6 6-6z"/>
    </svg>
  ),
  Porsche: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L2 12l10 10 10-10L12 2z" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 6l-6 6 6 6 6-6-6-6z" fill="currentColor"/>
    </svg>
  ),
  Mercedes: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 1L8 12h8L12 1z M12 23l4-11H8l4 11z" fill="currentColor"/>
    </svg>
  ),
  Audi: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="6" cy="12" r="4" fill="currentColor"/>
      <circle cx="12" cy="12" r="4" fill="currentColor"/>
      <circle cx="18" cy="12" r="4" fill="currentColor"/>
    </svg>
  ),
  Toyota: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 5l3 5h-6l3-5z M7 15l5-3 5 3-2 4h-6l-2-4z" fill="currentColor"/>
    </svg>
  )
}

export const CarBadge = ({ make }: { make: string }) => {
  const getBadgeStyle = (make: string) => {
    const styles: Record<string, { bg: string; text: string; border: string }> = {
      BMW: { 
        bg: 'bg-blue-500/10',
        text: 'text-blue-400',
        border: 'border-blue-500/20'
      },
      Porsche: {
        bg: 'bg-red-500/10',
        text: 'text-red-400',
        border: 'border-red-500/20'
      },
      Mercedes: {
        bg: 'bg-zinc-400/10',
        text: 'text-zinc-400',
        border: 'border-zinc-400/20'
      },
      Audi: {
        bg: 'bg-zinc-500/10',
        text: 'text-zinc-300',
        border: 'border-zinc-500/20'
      },
      Toyota: {
        bg: 'bg-red-400/10',
        text: 'text-red-300',
        border: 'border-red-400/20'
      },
      default: {
        bg: 'bg-[--color-charcoal]',
        text: 'text-[--color-chrome]',
        border: 'border-[--color-charcoal]'
      }
    }
    return styles[make] || styles.default
  }

  const { bg, text, border } = getBadgeStyle(make)
  const Logo = BrandLogos[make] || null

  return (
    <span className={`brand-badge ${bg} ${text} ${border} border`}>
      {Logo && <Logo />}
      <span className="ml-1.5">{make}</span>
    </span>
  )
} 