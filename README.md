# SpotCar 🏎️

App de carspotting communautaire — repérez et partagez les voitures rares autour de vous.

## Stack
- React + Vite
- Supabase (base de données + auth + storage)
- Leaflet (carte interactive)
- Tailwind CSS

## Installation locale

```bash
npm install
npm run dev
```

## Déploiement sur Vercel

1. Push ce dossier sur GitHub
2. Connecter le repo sur vercel.com
3. Deploy — c'est tout !

## Configuration Supabase

Les clés sont déjà configurées dans `src/api/supabaseClient.js`

### Storage — créer le bucket photos
Dans Supabase → Storage → New bucket → nom: `spot-photos` → Public: ON

### Auth — activer Email
Dans Supabase → Authentication → Providers → Email → Enable
