interface LogoProps {
  size?: 'small' | 'large';
  showText?: boolean;
  variant?: 'light' | 'dark';
}

export function Logo({ size = 'small', showText = true, variant = 'light' }: LogoProps) {
  const isLarge = size === 'large';
  const iconSize = isLarge ? 40 : 24;
  const textSize = isLarge ? '28px' : '17px';
  const gap = isLarge ? 'gap-3' : 'gap-2';
  const textColor = variant === 'dark' ? '#FFFFFF' : '#0F172A';

  return (
    <div className={`flex items-center ${gap}`}>
      {/* Icon Only - PharmEasy style */}
      <svg 
        width={iconSize} 
        height={iconSize} 
        viewBox="0 0 40 40" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Soft gradient for modern look */}
          <linearGradient id="pillGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#14B8A6" />
            <stop offset="100%" stopColor="#0F766E" />
          </linearGradient>
          
          <linearGradient id="checkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
        
        {/* Main pill shape - rounded capsule */}
        <rect 
          x="6" 
          y="14" 
          width="28" 
          height="12" 
          rx="6" 
          fill="url(#pillGradient)"
        />
        
        {/* Subtle pill divider */}
        <line 
          x1="20" 
          y1="14" 
          x2="20" 
          y2="26" 
          stroke="white" 
          strokeWidth="1.5"
          opacity="0.25"
        />
        
        {/* Small dots inside pill - representing doses */}
        <circle cx="13" cy="17.5" r="1" fill="white" opacity="0.6"/>
        <circle cx="13" cy="22.5" r="1" fill="white" opacity="0.6"/>
        <circle cx="27" cy="20" r="1" fill="white" opacity="0.6"/>
        
        {/* Checkmark badge - friendly rounded style */}
        <circle 
          cx="30" 
          cy="12" 
          r="7" 
          fill="white"
        />
        <circle 
          cx="30" 
          cy="12" 
          r="6" 
          fill="url(#checkGradient)"
        />
        <path 
          d="M27.5 12L29 13.5L32.5 10" 
          stroke="white" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      
      {showText && (
        <span 
          className="font-semibold" 
          style={{ 
            fontSize: textSize, 
            color: textColor,
            letterSpacing: '-0.01em',
            fontFamily: 'Inter, system-ui, sans-serif'
          }}
        >
          MediTrack
        </span>
      )}
    </div>
  );
}