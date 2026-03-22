'use client';

import { createContext, useContext, useState } from 'react';

interface InspectorContextType {
  isOpen: boolean;
  toggle: () => void;
}

const InspectorContext = createContext<InspectorContextType>({ isOpen: true, toggle: () => {} });

export function useInspector() {
  return useContext(InspectorContext);
}

export function InspectorProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const toggle = () => setIsOpen(prev => !prev);
  
  return (
    <InspectorContext.Provider value={{ isOpen, toggle }}>
      {children}
    </InspectorContext.Provider>
  );
}
