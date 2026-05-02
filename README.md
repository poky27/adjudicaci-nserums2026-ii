# SERUMS 2026-I — Adjudicación Medicina

Web app en tiempo real para hacer seguimiento del proceso de adjudicación de plazas SERUMS 2026-I (Medicina, Perú).

## Características

- **2,089 plazas** y **6,033 candidatos** precargados desde el Excel oficial
- **Sincronización en tiempo real** vía Firebase Firestore
- **Modal de adjudicación de 30 segundos** con timer visual
- **Dropdowns en cascada**: DIRESA → Provincia → Distrito → Establecimiento
- Manejo de **2da y 3ra oportunidad** según reglamento
- Validación automática de plazas ya tomadas (guard contra race conditions)
- Exportación a Excel del historial completo

## Estructura

```
.
├── index.html          # App completa (HTML + CSS + JS)
├── data/
│   ├── plazas.json     # 2,089 plazas
│   └── candidatos.json # 6,033 candidatos del orden de mérito
└── DEPLOY.md           # Guía de deploy paso a paso
```

## Deploy rápido

1. **Firebase**: crear proyecto en console.firebase.google.com, activar Firestore, copiar `firebaseConfig` y pegar en `index.html` (líneas ~12-19)
2. **Cloudflare Pages**: arrastrar la carpeta a pages.cloudflare.com → deploy

Ver [DEPLOY.md](DEPLOY.md) para instrucciones detalladas.

## Stack

- **Frontend**: HTML + CSS + Vanilla JS (sin build process)
- **Real-time DB**: Firebase Firestore
- **Hosting**: Cloudflare Pages
- **Excel export**: SheetJS via CDN
