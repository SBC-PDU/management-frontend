# Frontend pro centrální správu napájecích jednotek

[![Pipeline status](https://gitlab.com/sbc-pdu/central-management/frontend/badges/master/pipeline.svg)](https://gitlab.com/sbc-pdu/central-management/frontend/-/commits/master)
[![Apache License](https://img.shields.io/badge/license-Apache2-blue.svg)](LICENSE)

Tento repozitář obsahuje frontendovou část pro centrální správu napájecích jednotek.

## Prerekvizity

- Node.js 18.x
- NPM
- [Backend](https://gitlab.com/sbc-pdu/central-management/backend/)

## Instalace

1. Naklonujte si tento repozitář pomocí příkazu:
	 ```bash
	 git clone https://gitlab.com/sbc-pdu/central-management/frontend.git
	 ```
2. Nainstalujte závislosti pomocí příkazu:
	 ```bash
	 npm install
   npm update
	 ```
3. Vytvořte soubor `.env.local` s konfigurací:
	```dotenv
	# Copyright 2022-2024 Roman Ondráček <mail@romanondracek.cz>
	#
	# Licensed under the Apache License, Version 2.0 (the "License");
	# you may not use this file except in compliance with the License.
	# You may obtain a copy of the License at
	#
	#    https://www.apache.org/licenses/LICENSE-2.0
	#
	# Unless required by applicable law or agreed to in writing, software
	# distributed under the License is distributed on an "AS IS" BASIS,
	# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	# See the License for the specific language governing permissions and
	# limitations under the License.
	
	# REST API base URL
	VITE_API_BASE_URL=/api/v1    # URL backendu (např. http://localhost:8090/v1)
	# Localization
	VITE_I18N_LOCALE=en          # Výchozí lokalizace (musí být v seznamu podporovaných lokalizací)
	VITE_I18N_FALLBACK_LOCALE=en # Výchozí lokalizace pro případ, že nějaký text není přeložen
	# Matomo analytics
	VITE_MATOMO_ENABLED=false    # Zapnutí analytiky Matomo
	VITE_MATOMO_HOST=            # Adresa serveru Matomo
	VITE_MATOMO_SITEID=          # ID stránky v Matomo
	# Sentry error tracking
	VITE_SENTRY_ENABLED=false    # Zapnutí hlášení chyb do Sentry
	VITE_SENTRY_DSN=             # DSN pro Sentry
	VITE_SENTRY_URL=             # URL Sentry serveru
	VITE_SENTRY_ORG=             # Název organizace v Sentry
	VITE_SENTRY_PROJECT=         # Název projektu v Sentry
	VITE_SENTRY_AUTH_TOKEN=      # Autentizační token pro Sentry
	```
4. Spusťte aplikaci pomocí příkazu:
	```bash
	npm run dev
	```
5. Aplikace bude dostupná na adrese [http://localhost:3000](http://localhost:3000).
