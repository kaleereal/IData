import React from 'react';

interface StickyHeaderWrapperProps {
  children: React.ReactNode;
  className?: string;
  backdropClassName?: string;
}

/**
 * StickyHeaderWrapper
 * Memberikan pembungkus sticky dengan backdrop-filter dan pointer-events: none pada shell luar,
 * sementara isi konten dan background plate memiliki pointer-events: auto.
 * Elemen yang digulung (scroll) di bawahnya otomatis terkena efek blur atau menjadi gelap
 * tanpa merusak tampilan asli dari section sticky tersebut.
 */
export const StickyHeaderWrapper: React.FC<StickyHeaderWrapperProps> = ({
  children,
  className = '',
  backdropClassName = '',
}) => {
  return (
    <div className={`sticky top-0 z-30 pointer-events-none ${className}`}>
      {/* Background layer with blur backdrop filter & darkening/tint */}
      <div
        className={`absolute inset-0 -mx-4 sm:-mx-6 backdrop-blur-md transition-colors duration-200 border-b pointer-events-auto ${backdropClassName}`}
        style={{
          backgroundColor: 'var(--sticky-bg, rgba(248, 247, 249, 0.92))',
          borderColor: 'var(--app-border, rgba(222, 215, 229, 0.8))',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      />
      {/* Interactive content layer */}
      <div className="relative z-10 pointer-events-auto">
        {children}
      </div>
    </div>
  );
};
