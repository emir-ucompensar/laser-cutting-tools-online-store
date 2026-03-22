# Laser Cutting Tools Online Store

Academic project developed for Fundación Universitaria Compensar. This repository contains a hybrid mobile and web store application for managing laser cutting tool products.

## Overview

The application supports email OTP authentication, product catalog management, photo upload for products, shopping cart operations, and responsive behavior across Android and web.

## Technology Stack

- Angular 20
- Ionic 8
- Capacitor 8
- Supabase (authentication, PostgreSQL, storage)
- TypeScript 5.9
- pnpm

## Prerequisites

Linux or WSL2 environment with Node.js, pnpm, and Android SDK tools available in PATH.

> [!TIP]
> For a quick functional validation, install the APK and create a test account. A temporary email service such as https://mail.tm can be used to speed up OTP registration. Do not upload sensitive photos to the service. After testing, delete any uploaded content to preserve privacy.

## Installation

```bash
pnpm install
```

## Build

Run the build pipeline to compile the Angular app, sync Capacitor, and generate the Android APK.

```bash
bash scripts/compile.sh
```

The script can also offer a local web preview at the end of the process.

## Emulator Sideload

With an Android emulator running, use:

```bash
bash scripts/sideload.sh
```

## Testing

Run automated tests using the following commands:

```bash
# Interactive mode
pnpm test

# CI mode (headless)
pnpm run test:ci

# Verbose status output per test
pnpm run test:status

# Pass/fail-only output
pnpm run test:status:clean

# Coverage report
pnpm run test:coverage
```

## License

This project is licensed under the GNU General Public License v3.0.
See https://www.gnu.org/licenses/gpl-3.0.html for details.
