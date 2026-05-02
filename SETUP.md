# Setup — Cloudflare D1 + Pages Functions

Esta guía te lleva de **0 a app funcionando con sync en vivo** en ~5 minutos.

---

## Pre-requisitos
- Repo ya conectado a Cloudflare Pages ✅ (ya hecho)
- Node.js instalado (ya tienes — node v25)
- Cuenta de Cloudflare ✅ (ya tienes)

---

## Paso 1 — Login a Cloudflare (1 sola vez)

Abre tu terminal y ejecuta:

```bash
npx wrangler login
```

Esto:
1. Abre tu navegador
2. Te pide autorizar wrangler con tu cuenta Cloudflare
3. Cuando confirmes, regresa a la terminal y verás `Successfully logged in.`

> Si ya hiciste login antes para otro proyecto, puedes saltarte este paso.

---

## Paso 2 — Crear la base de datos D1

```bash
cd ruta/a/serums-adjudicacion
npx wrangler d1 create serums-2026
```

**Salida que verás (algo así):**
```
✅ Successfully created DB 'serums-2026'

[[d1_databases]]
binding = "DB"
database_name = "serums-2026"
database_id = "abc123-def456-..."
```

**📋 IMPORTANTE**: copia ese `database_id` y pégalo en `wrangler.toml` reemplazando `REEMPLAZAR_DESPUES_DE_npx_wrangler_d1_create`.

Tu `wrangler.toml` debe quedar así:

```toml
name = "adjudicaci-nserums2026-ii"
compatibility_date = "2026-01-01"
pages_build_output_dir = "."

[[d1_databases]]
binding = "DB"
database_name = "serums-2026"
database_id = "abc123-def456-..."   ← AQUÍ va el ID que copiaste
```

---

## Paso 3 — Crear las tablas en D1

```bash
npx wrangler d1 execute serums-2026 --remote --file=schema.sql
```

Verás:
```
🚣 Executed 4 commands in XXms
```

---

## Paso 4 — Vincular D1 al proyecto Pages

En el **Dashboard de Cloudflare**:

1. Ve a **Workers & Pages** → tu proyecto **`adjudicaci-nserums2026-ii`**
2. Tab **Settings** → sección izquierda **Bindings**
3. Clic en **Add binding** → tipo **D1 database**
4. Llena:
   - **Variable name**: `DB`
   - **D1 database**: `serums-2026` (selecciónala del dropdown)
5. Clic **Save**
6. (Opcional) En **Production / Preview** asegúrate que ambos tengan el binding

---

## Paso 5 — Push final

Confirma el cambio en `wrangler.toml` (con el `database_id` real) y haz push:

```bash
git add wrangler.toml
git commit -m "config: D1 database_id real"
git push
```

Cloudflare detecta el push y re-deploya con D1 conectado en ~30 segundos.

---

## ✅ Verificación

Abre `https://adjudicaci-nserums2026-ii.pages.dev`:

- El banner rojo "Sin conexión al servidor" **NO** debe aparecer
- En las DevTools (`F12`) → Network → verás llamadas a `/api/estado` cada 3 seg
- Abre en otra pestaña/dispositivo → registra una adjudicación → en la primera pestaña aparece tachada en <3 segundos

---

## Comandos útiles después

```bash
# Ver datos de la D1 desde la terminal
npx wrangler d1 execute serums-2026 --remote --command "SELECT * FROM adjudicaciones ORDER BY numero_adjudicacion"

# Limpiar todas las adjudicaciones (cuidado!)
npx wrangler d1 execute serums-2026 --remote --command "DELETE FROM adjudicaciones; DELETE FROM plazas_tomadas;"

# Re-ejecutar schema (DROP + CREATE — borra TODO)
npx wrangler d1 execute serums-2026 --remote --file=schema.sql

# Ver logs en vivo del Worker
npx wrangler pages deployment tail
```

---

## Costos

Todo en **free tier de Cloudflare**:
- D1: 5 GB · 5M reads/día · 100K writes/día
- Pages Functions: 100K requests/día
- Pages: hosting ilimitado

Para un evento SERUMS típico: ~20K requests totales en un día. Cero costo.
