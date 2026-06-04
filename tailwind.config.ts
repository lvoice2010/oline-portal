import type { Config } from "tailwindcss";

/**
 * Палитра под бренд O'LINE.
 *
 * Для минимума правок мы сохраняем имена Tailwind-классов `navy` и `copper`,
 * но переназначаем их HEX-значения: `navy` теперь = тёмно-зелёный из логотипа,
 * `copper` = светло-зелёный (sage) акцент. Семантика классов (тёмный фон vs
 * акцентный CTA) сохраняется, переписывать каждый `bg-navy`/`text-copper`
 * не нужно.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Основной тёмный — почти-чёрный с зелёным подтоном.
        // Сайдбар и крупные тёмные блоки выглядят как тёмный UI,
        // а не «зелёная стена», но бренд-намёк сохраняется.
        navy: {
          DEFAULT: "#0F2A22",
          light: "#1F5240", // оригинал из логотипа — для подсветок и текста
          50: "#EEF5EF",
        },
        // Акцент / CTA — sage из логотипа
        copper: {
          DEFAULT: "#7CB342",
          light: "#8FBF53",
        },
        canvas: "#FAFAFA",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "14px",
      },
      boxShadow: {
        soft: "0 2px 12px rgba(31, 82, 64, 0.06)",
        "soft-lg": "0 4px 24px rgba(31, 82, 64, 0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
