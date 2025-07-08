import React, { createContext, useContext, useState, ReactNode } from "react";

interface IngredientContextType {
  selected: string[];
  addIngredient: (ingredient: string) => void;
  removeIngredient: (ingredient: string) => void;
}

const IngredientContext = createContext<IngredientContextType | undefined>(
  undefined,
);

export const IngredientProvider = ({ children }: { children: ReactNode }) => {
  const [selected, setSelected] = useState<string[]>([]);

  const addIngredient = (ingredient: string) => {
    if (!selected.includes(ingredient)) {
      setSelected([...selected, ingredient]);
    }
  };

  const removeIngredient = (ingredient: string) => {
    setSelected(selected.filter((item) => item !== ingredient));
  };

  return (
    <IngredientContext.Provider
      value={{ selected, addIngredient, removeIngredient }}
    >
      {children}
    </IngredientContext.Provider>
  );
};

export const useIngredients = () => {
  const context = useContext(IngredientContext);
  if (!context) {
    throw new Error("error");
  }
  return context;
};
