// Formatação de moeda BRL
export const formatCurrency = (val: number): string => {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// Funções seguras de Storage para evitar crashes (tela branca)
export const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Erro ao salvar ${key}:`, error);
  }
};

export const loadFromStorage = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.warn(`Erro ao carregar ${key}, usando fallback.`, error);
    return fallback;
  }
};

// Gera ID único simples
export const generateId = () => Math.random().toString(36).substr(2, 9);