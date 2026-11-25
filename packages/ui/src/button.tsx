import type { ButtonHTMLAttributes } from "react";

// Styles neutres volontaires : la charte graphique CCR (logo, couleurs, typographie)
// n'a pas encore ete fournie (section 10 du cahier des charges).
export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} />;
}
