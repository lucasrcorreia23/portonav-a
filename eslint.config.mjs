import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/* ─────────────────────────────────────────────────────────────────────────
   Guard-rail do Atomsix Design System (docs/design-system/UI-PRIMITIVES.md §6)
   Bloqueia classes-fantasma e elementos nativos do SO fora de components/ui/,
   pra garantir que o app nao regrida pros widgets nativos que o DS proibe.
   ───────────────────────────────────────────────────────────────────────── */

const REGRA_CLASSE_FANTASMA = {
  selector: 'JSXAttribute[name.name="className"] > Literal[value=/(?:^|\\s)(?:input|field-label|field-error)(?:\\s|$)/]',
  message:
    'Classe fantasma detectada ("input", "field-label" ou "field-error" nao existem no CSS). ' +
    "Use os primitivos de UI: <Input rotulo erro />, <Select />, <Textarea /> — ver docs/design-system/UI-PRIMITIVES.md.",
};

const REGRA_SELECT_TEXTAREA_CRU = {
  selector: "JSXOpeningElement[name.name=/^(select|textarea)$/]",
  message:
    "Elemento HTML cru detectado. Use os primitivos de UI: " +
    "<Select /> (components/ui/Select.tsx) ou <Textarea /> (components/ui/Textarea.tsx) — ver docs/design-system/UI-PRIMITIVES.md.",
};

const REGRA_INPUT_CRU_AVISO = {
  selector: 'JSXOpeningElement[name.name="input"]',
  message: "Elemento <input> cru detectado. Use <Input /> (components/ui/Input.tsx) — ver docs/design-system/UI-PRIMITIVES.md.",
};

const REGRA_DATA_NATIVA = {
  selector: 'JSXAttribute[name.name="type"] > Literal[value=/^(date|time|datetime-local|month|week)$/]',
  message:
    'type="date/time/…" abre o calendario/relogio nativo do SO. ' +
    "Use <DatePicker /> (components/ui/DatePicker.tsx) — ver docs/design-system/UI-PRIMITIVES.md.",
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),

  // Guard-rail: app/ e components/ (exceto components/ui/).
  {
    files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
    ignores: ["components/ui/**"],
    rules: {
      "no-restricted-syntax": ["error", REGRA_CLASSE_FANTASMA, REGRA_SELECT_TEXTAREA_CRU, REGRA_DATA_NATIVA],
    },
  },
  {
    files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
    ignores: ["components/ui/**"],
    rules: {
      "no-restricted-syntax": ["warn", REGRA_INPUT_CRU_AVISO],
    },
  },
]);

export default eslintConfig;
