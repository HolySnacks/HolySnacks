export type Product = {
  name: string;
  flavor: string;
  price: string;
  emoji: string;
  badge?: string;
  desc: string;
  gradient: string;
};

export type KeyIngredient = {
  emoji: string;
  name: string;
  benefit: string;
};

export type Category = {
  id: string;
  radius: number;
  duration: number;
  size: number;
  startAngle: number;
  icon: string;
  label: string;
  labelLt: string;
  gradient: string;
  glow: string;
  ring: string;
  bgFrom: string;
  accentColor: string;
  products: Product[];
  keyIngredients?: KeyIngredient[];
};

export type CartItem = {
  product: Product;
  cat: Category;
  quantity: number;
};
