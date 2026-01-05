
// Formatação de moeda BRL
export const formatCurrency = (val: number): string => {
  if (isNaN(val)) return 'R$ 0,00';
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
    if (!item || item === "undefined" || item === "null") return fallback;
    return JSON.parse(item);
  } catch (error) {
    console.warn(`Erro ao carregar ${key}, usando fallback.`, error);
    return fallback;
  }
};

// Gera ID único simples
export const generateId = () => Math.random().toString(36).substr(2, 9);

// Security: Robust sanitization to prevent XSS, Prompt Injection, and Markdown breakage
export const sanitizeString = (str: string): string => {
  if (!str) return '';
  // Removes HTML tags < >, brackets { } [ ], and backticks ` to prevent injection
  // Limit length to reasonable amount for names/categories (e.g. 100 chars)
  return str.replace(/[<>{}[\]`]/g, '').slice(0, 100).trim();
};
