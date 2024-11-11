import React, { createContext, useState, useContext } from 'react';

const TasteContext = createContext();

export const TasteProvider = ({ children }) => {
  const [tasteProfile, setTasteProfile] = useState(null);

  return (
    <TasteContext.Provider value={{ tasteProfile, setTasteProfile }}>
      {children}
    </TasteContext.Provider>
  );
};

export const useTaste = () => useContext(TasteContext); 