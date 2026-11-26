"use client";

import { useState, type ChangeEvent, type FocusEvent, type FormEvent } from "react";
import { FIELD_HINTS, FIELD_PLACEHOLDERS, checkField, type FieldKind } from "./validation";

const TYPES: Record<FieldKind, { type: string; inputMode: "text" | "tel" | "email" }> = {
  name: { type: "text", inputMode: "text" },
  phone: { type: "tel", inputMode: "tel" },
  email: { type: "email", inputMode: "email" },
};

// Champ avec contrôle de format : l'astérisque d'obligation est en rouge, le
// format attendu est indiqué sous le champ, et une saisie non conforme est
// refusée avec un message clair (le formulaire ne part pas).
export function CheckedField({
  kind,
  label,
  name,
  defaultValue,
  required = true,
  hint,
  autoComplete,
  inputClassName = "",
  className = "",
  id,
}: {
  kind: FieldKind;
  label: string;
  name: string;
  defaultValue?: string | null;
  required?: boolean;
  hint?: string;
  autoComplete?: string;
  inputClassName?: string;
  className?: string;
  id?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  function validate(el: HTMLInputElement) {
    const msg = checkField(kind, el.value, required);
    el.setCustomValidity(msg ?? "");
    return msg;
  }

  return (
    <label className={`block ${className}`} htmlFor={id}>
      <span className="text-sm font-semibold">
        {label}
        {required ? (
          <span className="ml-0.5 text-red-600" aria-hidden="true">
            *
          </span>
        ) : null}
      </span>
      <input
        id={id}
        name={name}
        type={TYPES[kind].type}
        inputMode={TYPES[kind].inputMode}
        required={required}
        autoComplete={autoComplete}
        defaultValue={defaultValue ?? ""}
        placeholder={FIELD_PLACEHOLDERS[kind] || undefined}
        aria-invalid={error ? true : undefined}
        ref={(el) => {
          if (el) validate(el);
        }}
        onInvalid={(e: FormEvent<HTMLInputElement>) => {
          setTouched(true);
          setError(validate(e.currentTarget));
        }}
        onBlur={(e: FocusEvent<HTMLInputElement>) => {
          setTouched(true);
          setError(validate(e.currentTarget));
        }}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const msg = validate(e.currentTarget);
          if (touched) setError(msg);
        }}
        className={`${inputClassName} ${error ? "!border-red-500 !ring-red-200" : ""}`}
      />
      <span className={`mt-1 block text-xs ${error ? "font-semibold text-red-600" : "text-ccr-ink/50"}`} role={error ? "alert" : undefined}>
        {error ?? hint ?? FIELD_HINTS[kind]}
      </span>
    </label>
  );
}
