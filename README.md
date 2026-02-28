# Laser Cutting Tools Online Store

Academic project developed for the Fundación Universitaria de Compensar. A hybrid mobile and web store application for browsing and managing laser cutting tool products. Users register and authenticate via email OTP, can add products with photos, and browse the catalog on both Android and web.

## Technologies

- Angular 20
- Ionic 8
- Capacitor 8
- Supabase (authentication, PostgreSQL, storage)
- TypeScript 5.9
- pnpm

## Build

Requires Linux or WSL2 with Node.js, pnpm, and the Android SDK available in PATH.

Install dependencies:

```
pnpm install
```

Then run the build pipeline, which compiles the Angular app, syncs with Capacitor, and builds the Android APK:

```
bash scripts/compile.sh
```

At the end of the build the script will offer to start a local web preview server.

## Loading to the emulator

With the Android emulator already running, the following script handles the full sideload process interactively:

```
bash scripts/sideload.sh
```

## License

This project is licensed under the GNU General Public License v3.0.
See https://www.gnu.org/licenses/gpl-3.0.html for details.
