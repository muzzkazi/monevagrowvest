import * as React from "react";
import { Input } from "@/components/ui/input";

const groupIndian = (digits: string) => {
  if (!digits) return "";
  const n = Number(digits);
  if (!Number.isFinite(n)) return digits;
  return n.toLocaleString("en-IN");
};

/** Formats a raw string into Indian-grouped digits, preserving a trailing decimal part. */
export const formatIndianInput = (raw: string, allowDecimal = true): string => {
  let cleaned = raw.replace(/[^0-9.]/g, "");
  if (!allowDecimal) cleaned = cleaned.replace(/\./g, "");
  const firstDot = cleaned.indexOf(".");
  if (firstDot === -1) return groupIndian(cleaned);
  const intPart = cleaned.slice(0, firstDot);
  const decPart = cleaned.slice(firstDot + 1).replace(/\./g, "");
  return `${groupIndian(intPart)}.${decPart}`;
};

export const parseIndianInput = (raw: string): number => {
  const n = parseFloat(raw.replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};

export interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type" | "defaultValue"> {
  /** Current numeric value (or empty string for blank). Omit for uncontrolled use with defaultValue. */
  value?: number | string;
  /** Initial value when used uncontrolled. */
  defaultValue?: number | string;
  /** Called with the parsed number on every keystroke. */
  onValueChange?: (value: number) => void;
  /** Called with the raw comma-formatted string on every keystroke. */
  onTextChange?: (text: string) => void;
  allowDecimal?: boolean;
  /** Render blank instead of 0 when the value is 0. */
  blankOnZero?: boolean;
}

const toDisplay = (v: number | string | undefined, allowDecimal: boolean, blankOnZero?: boolean) => {
  if (v === "" || v === null || v === undefined) return "";
  if (blankOnZero && Number(v) === 0) return "";
  return formatIndianInput(String(v), allowDecimal);
};

/**
 * Text input that groups digits with Indian-style commas as the user types
 * while reporting a clean numeric value to the parent.
 */
export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ value, defaultValue, onValueChange, onTextChange, allowDecimal = true, blankOnZero, ...props }, ref) => {
    const controlled = value !== undefined;
    const [inner, setInner] = React.useState(() => toDisplay(defaultValue, allowDecimal, blankOnZero));
    const display = controlled ? toDisplay(value, allowDecimal, blankOnZero) : inner;

    return (
      <Input
        ref={ref}
        type="text"
        inputMode={allowDecimal ? "decimal" : "numeric"}
        value={display}
        onChange={(e) => {
          const formatted = formatIndianInput(e.target.value, allowDecimal);
          if (!controlled) setInner(formatted);
          onTextChange?.(formatted);
          onValueChange?.(parseIndianInput(formatted));
        }}
        {...props}
      />
    );
  },
);
NumberInput.displayName = "NumberInput";
