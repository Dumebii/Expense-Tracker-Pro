'use client';

import { ReactNode } from 'react';

interface ScrollClientProps {
  id: string;
  children: ReactNode;
  className?: string;
}

export default function ScrollClient({ id, children, className }: ScrollClientProps) {
  const handleClick = () => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
