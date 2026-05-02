# Guía de Deploy — SERUMS 2026-I Adjudicación

## Estructura del proyecto

```
serums-adjudicacion/
├── index.html          ← La app completa
└── data/
    ├── plazas.json     ← 2,089 plazas (extraídas del Excel)
    └── candidatos.json ← 6,033 candidatos (orden de mérito)
```

---

## Paso 1 — Crear proyecto Firebase (5 min)

1. Ve a **https://console.firebase.google.com**
2. Clic en **"Agregar proyecto"** → nombre: `serums-2026` → crear
3. En el menú izquierdo: **Firestore Database** → **Crear base de datos**
   - Modo: **Producción**
   - Región: `us-central1` (o la más cercana)
4. Ve a **Configuración del proyecto** (ícono ⚙️ arriba izquierda)
5. Sección **"Tus aplicaciones"** → clic en el ícono `</>`  (web)
6. Nombre: `serums-web` → registrar
7. Copia el bloque `firebaseConfig` que aparece — lo necesitarás en el siguiente paso

### Reglas Firestore (permisivas para el evento)

En Firestore → **Reglas**, pega esto y publica:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

> ⚠️ Después del evento, cambia a `allow read, write: if false;` para cerrar el acceso.

---

## Paso 2 — Configurar el index.html

Abre `index.html` y busca este bloque (líneas 12-19 aprox):

```js
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO_ID",
  ...
};
```

Reemplaza con los valores reales de tu proyecto Firebase.

---

## Paso 3 — Deploy en Cloudflare Pages

### Opción A: desde GitHub (recomendada)

1. Crea un repo en GitHub (puede ser privado): `serums-adjudicacion`
2. Sube los 3 archivos: `index.html`, `data/plazas.json`, `data/candidatos.json`
3. Ve a **https://pages.cloudflare.com** → **Create a project**
4. Conecta tu cuenta de GitHub → selecciona el repo
5. Configuración:
   - **Framework preset**: None
   - **Build command**: _(vacío)_
   - **Build output directory**: `/` (raíz)
6. Deploy → obtienes URL tipo `https://serums-adjudicacion.pages.dev`

### Opción B: Cloudflare Pages con drag & drop (más rápida)

1. Ve a **https://pages.cloudflare.com** → **Create a project** → **Upload assets**
2. Arrastra la carpeta `serums-adjudicacion/` completa
3. Nombre del proyecto: `serums-2026`
4. Deploy → URL lista en ~30 segundos

---

## Paso 4 — Probar antes del evento

Abre la URL en **2 pestañas diferentes** (o 2 computadoras):

- [ ] Pestaña 1: registra una adjudicación de prueba
- [ ] Pestaña 2: verifica que la plaza aparece tachada en <3 segundos
- [ ] El historial muestra la adjudicación
- [ ] Las estadísticas del header se actualizan
- [ ] Borra los datos de prueba en Firebase Console (colecciones `adjudicaciones` y `plazas_tomadas`)

---

## Uso durante el evento

### Flujo de registro (30 segundos)

1. Candidato dice **"ADJUDICO"**
2. Clic en **"Registrar adjudicación"** al lado de su nombre (búscalo por nombre arriba)
3. El modal se abre con timer de 30 segundos
4. Selecciona en cascada: **DIRESA → Provincia → Distrito → Establecimiento**
5. Si la plaza está libre → aparece indicador verde → clic **"Confirmar Adjudicación"**
6. Si la plaza ya fue tomada → aparece alerta roja → selecciona otra
7. Si no logra adjudicar → clic **"No adjudicó / Pasar"**
   - Se ofrece dar 2da oportunidad (confirma o pasa directamente)
   - Si ya usó 2 oportunidades, la 3ra es la última

### Búsqueda rápida de candidatos

- Usa el campo de búsqueda para encontrar por apellido
- Activa "Ocultar ya adjudicados" para ver solo los pendientes

### Ver plazas disponibles

- Tab **"Plazas"**: usa filtros de DIRESA/Provincia/GD
- Activa filtro **"🟢 Libres"** para ver solo las disponibles
- Las plazas tomadas aparecen tachadas en tiempo real

---

## Datos del evento

- **2,089** plazas de medicina disponibles
- **6,033** candidatos en orden de mérito
- **29** regiones (DIRESA/GERESA/DIRIS)
- Actualización en tiempo real en todos los navegadores conectados
