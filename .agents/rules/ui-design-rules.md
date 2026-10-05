# Reglas Obligatorias de Diseño UI (Monocromático, Limpio y Sin Emojis)

1. **PROHIBICIÓN TOTAL DE EMOJIS**:
   - Nunca usar emojis en componentes, botones, textos, títulos, modales, etiquetas, comentarios ni documentación.
   - Usar únicamente iconos vectoriales limpios (Lucide) o tipografía sobria.

2. **PROHIBICIÓN DE FONDOS Y BORDES COLORIDOS ("VISUAL SLOP")**:
   - No usar fondos de colores saturados o translúcidos con tinte cromático (`bg-*-500/*`, `bg-*-950`, etc.).
   - No usar bordes de color (`border-sky-*`, `border-amber-*`, `border-emerald-*`, `border-rose-*`, etc.).
   - No usar efectos de brillo, neón o sombras de color (`shadow-[0_0_*_rgba(*)]`).
   - No usar puntos pulsantes multicolores en indicadores de estado.

3. **ESTÉTICA PERMITIDA**:
   - Paleta monocromática y neutra en escala de grises (`bg-black`, `bg-neutral-950`, `bg-neutral-900`, `border-neutral-800`, `border-neutral-700`).
   - Textos: `text-white`, `text-neutral-300`, `text-neutral-400`, `text-neutral-500`.
   - Badges y chips: fondo `bg-neutral-900`, borde `border-neutral-800`, texto `text-neutral-300`/`text-neutral-400`, fuente monoespaciada sutil.
   - Botones primarios en blanco sólido con texto negro; botones secundarios en `bg-neutral-900 border-neutral-800`.
