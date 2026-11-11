# UberClone — Versión Conductor

Aplicación móvil multiplataforma (Android, iOS y web) inspirada en la app de conductor de Uber, construida con **React Native + Expo SDK 58** y **Firebase** (Authentication + Cloud Firestore). El conductor se registra, recibe solicitudes en tiempo real, las acepta o rechaza en 15 segundos, hace el viaje, cobra con Mercado Pago (modo de prueba) o en efectivo y consulta sus ganancias e historial.

## Integrantes

| Nombre | Rol |
| --- | --- |
| Linay Yuliani Muñoz Perez | Desarrollo |
| _(agregar a los demás integrantes)_ | |

## Funcionalidades

| Módulo | Pantallas |
| --- | --- |
| Cuenta | Iniciar sesión y Crear cuenta (Firebase Authentication, correo y contraseña) |
| Registro (Tabs) | Datos personales · Vehículo · Documentos y pagos · botón **Enviar registro** (solo con las tres pestañas completas y válidas) |
| Flujo del viaje (Stack) | Inicio (mapa + Disponible/No disponible) · Solicitud entrante (15 s) · Viaje en curso · Cobro y resumen |
| Menú lateral (Drawer) | Inicio · Ganancias · Historial (con detalle) · Perfil y configuración |
| Backend (`backend/`) | Cobro con Mercado Pago Checkout Pro, despacho de solicitudes al conductor más cercano, simulador de pasajero |

## Puesta en marcha

### 1. Instalar

```bash
npm install
```
```bash
npm install --prefix backend
```

### 2. Configurar Firebase (proyecto real)

El archivo `.env` (no se sube a Git) ya apunta al proyecto **UberClone** (`uberclone-dd7cc`). Si clonas el repositorio, copia `.env.example` como `.env` y llena los valores de *Configuración del proyecto → Tus apps → App web*.

En la consola de Firebase el proyecto ya tiene:
- Authentication con **Correo electrónico/contraseña** habilitado.
- Cloud Firestore (ubicación `nam5`) con las reglas de [`firestore.rules`](firestore.rules) publicadas.
- Los índices de [`firestore.indexes.json`](firestore.indexes.json) (historial por conductor y fecha, y por método de pago).

### 3. Configurar el backend

Copia `backend/.env.example` como `backend/.env` y completa:
- **Cuenta de servicio de Firebase**: *Configuración del proyecto → Cuentas de servicio → Generar nueva clave privada*. Guarda el archivo como `backend/serviceAccountKey.json` (está en `.gitignore`).
- **Mercado Pago**: el *access token de prueba* de tu cuenta vendedora de prueba en `MERCADOPAGO_ACCESS_TOKEN`.

### 4. Ejecutar

Backend (pagos y despacho de solicitudes):
```bash
npm run backend
```
App:
```bash
npx expo start
```
Escanea el QR con **Expo Go** (SDK 58) o presiona `a` para Android y `w` para web. En el celular, `EXPO_PUBLIC_BACKEND_URL` debe usar la IP del computador (por ejemplo `http://192.168.1.10:3001`), no `localhost`.

### 5. Probar el flujo completo

1. Crea una cuenta en la app y completa las tres pestañas. Toca **Enviar registro**: la cuenta queda *Pendiente de aprobación*.
2. Aprueba la cuenta, como permite el documento, cambiando el campo en la base de datos:
   ```bash
   npm run aprobar -- correo@ejemplo.com
   ```
   (o en la consola: `drivers/{uid}` → `accountStatus` = `approved`). La app lo ve al instante.
3. En el Inicio activa **Disponible**.
4. Crea una solicitud como si fueras el pasajero:
   ```bash
   npm run simular:viaje -- --metodo efectivo --categoria economy --propina 2000
   ```
   Opciones: `--metodo efectivo|mercadopago`, `--categoria economy|xl|premium`, `--propina N`, `--conductor correo`.
5. Para simular que el pasajero cancela:
   ```bash
   npm run simular:cancelar
   ```

### Desarrollo sin tocar la base de datos real (emuladores)

```bash
npm run emuladores
```
Crea un `.env.local` con `EXPO_PUBLIC_USE_FIREBASE_EMULATOR=true` y `EXPO_PUBLIC_FIREBASE_PROJECT_ID=demo-uberclone`. En `backend/.env` descomenta las variables del emulador. Se necesita Java 17 o superior; el script corrige el problema de Java en Windows con usuarios que tienen "ñ" en la ruta.

### Pruebas

```bash
npm test
```
46 pruebas de funciones puras: validaciones de las tres pestañas, tarifa (incluido el ejemplo de 8,5 km y 22 min del documento), estados del viaje, ganancias, saldo, fechas, rutas e idiomas.

## Cómo se cumple el documento

### Registro (sección 2)

- **Datos personales**: foto (cámara o galería), nombre (máx. 50, solo letras), documento (6–10 dígitos), celular (10 dígitos), fecha de nacimiento (18 años o más), género, correo e idioma.
- **Vehículo**: categoría (Económico, XL, Premium), placa ABC123 (en mayúsculas), marca y modelo (máx. 30), año (≤ año actual), color, capacidad (XL ≥ 6) y foto.
- **Documentos y pagos**: licencia (número, foto y vencimiento posterior a hoy), SOAT (foto y vencimiento), revisión técnico-mecánica (foto y vencimiento, **solo si aplica por el año del vehículo**), correo de Mercado Pago y casilla obligatoria de términos con el **20 % de comisión visible**. No se piden ni se guardan números de cuenta ni de tarjeta.
- Errores debajo de cada campo (nunca en `Alert`). **Enviar registro** solo se habilita con las tres pestañas completas y válidas. La cuenta queda en `pending_approval` y no puede ponerse Disponible hasta `approved`. Las reglas de Firestore impiden que el conductor se apruebe a sí mismo.

### Estados del viaje (sección 3)

El campo `status` controla la pantalla ([`TripFlowNavigator`](src/navigation/TripFlowNavigator.js)):

| Estado | Qué ve el conductor |
| --- | --- |
| `requested` | Tarjeta de solicitud entrante con temporizador de 15 s. Si rechaza o vence el tiempo, el despachador la ofrece al siguiente conductor o queda `rejected` |
| `accepted` → `driver_arriving` | Viaje en curso: ruta al punto de recogida (se calcula una sola vez al aceptar) |
| `in_progress` | Tras tocar **Pasajero a bordo**: ruta al destino y botón **Finalizar viaje** |
| `completed` | Cobro y resumen: tarifa final, comisión, propina, ganancia neta y estado del pago |
| `paid` | Pago aprobado por la pasarela o efectivo confirmado |
| `cancelled` | Cancelado por el conductor o el pasajero antes de `in_progress` |

Las transiciones válidas están en [`constants/trips.js`](src/constants/trips.js) y se verifican antes de cada cambio.

### Hooks obligatorios

| Requisito | Dónde |
| --- | --- |
| `useState` (disponibilidad, solicitud activa, formularios) | `HomeScreen`, `useTripRequests`, `useForm` |
| `useEffect` con limpieza: ubicación | `useDriverLocation` (detiene `watchPosition` y el envío a Firestore al pasar a No disponible o salir del Inicio) |
| `useEffect` con limpieza: temporizador | `useCountdown` (15 s de la solicitud) |
| `useEffect` con limpieza: tiempo real | `onSnapshot` en `AuthContext`, `RegistrationContext`, `TripContext`, `useTripRequests`, `useEarnings` |
| `useContext` (sesión y viaje activo) | `AuthContext`, `TripContext` (y `RegistrationContext`, `PreferencesContext`) |
| `useMemo` (totales de ganancias) | `useEarnings` |
| `useCallback` (aceptar y rechazar) | `handleAccept` / `handleReject` en `HomeScreen` |
| Hooks personalizados mínimos | `useDriverLocation`, `useTripRequests`, `useEarnings` (más `useForm`, `useCountdown`, `useTripHistory`, `useImagePicker`, `useSectionSave`) |
| AsyncStorage solo para preferencias y sesión | idioma y último estado de disponibilidad ([`storage.js`](src/services/storage.js)); la sesión la guarda Firebase Auth |

### Pagos (sección 4)

1. Al finalizar, la app calcula la tarifa final con `calculateFare`, la misma función de la estimación.
2. En **Cobrar con Mercado Pago**, la app envía `tripId` y el monto al backend con el token de sesión de Firebase.
3. El backend verifica el conductor y el monto, y crea la preferencia con el `access_token`, que solo vive en `backend/.env`.
4. La app abre el checkout y el pasajero paga con una tarjeta de prueba.
5. Mercado Pago vuelve al backend (URL de retorno o webhook). El backend consulta el pago y actualiza `paymentStatus`, `paymentId` y `status: paid`.
6. La app ve el cambio en tiempo real.

**Efectivo**: el conductor confirma el cobro y la comisión se descuenta de su saldo (puede quedar negativo). Las reglas de Firestore impiden que la app marque un pago como aprobado.

### Tarifa y ganancias (sección 5)

[`src/config/pricing.js`](src/config/pricing.js) concentra los valores: base 3.500, 1.200/km, 250/min, mínimo 6.000, multiplicadores 1,0 / 1,4 / 1,8 y comisión del 20 %. La tarifa se redondea al múltiplo de 100 antes de la comisión, y cada viaje guarda su `commissionRate`.

La pantalla Ganancias muestra, para hoy, la semana y el mes: viajes, total facturado, comisiones, propinas, ganancia neta y promedio, calculados con `useMemo`. También muestra el saldo: ganancias por pasarela menos las comisiones de los viajes en efectivo.

### Historial (sección 6)

`FlatList` del más reciente al más antiguo, con filtros Hoy, Semana, Mes y Rango de fechas, y filtro por método de pago. Carga 20 viajes por página y muestra un mensaje cuando no hay resultados. El detalle dibuja la ruta guardada con `Polyline` (en Android/iOS), sin volver a pedirla.

### APIs (sección 7)

| Servicio | Uso |
| --- | --- |
| Firestore `onSnapshot` | Solicitudes, viaje activo, aprobación de la cuenta y ganancias en tiempo real |
| `expo-location` (`watchPositionAsync`) | Ubicación del conductor, enviada a Firestore cada 5 s mientras está Disponible |
| `react-native-maps` | Mapa del conductor y rutas con `Polyline` (en la web se muestra OpenStreetMap) |
| Firebase Cloud Messaging | El backend avisa al conductor de solicitudes nuevas con la app en segundo plano. Requiere una **build de desarrollo** (Expo Go no recibe push en Android) y `google-services.json` en la raíz |
| OSRM | Ruta, distancia y duración (gratis). Con `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` se usa Google Directions |
| Nominatim | El simulador convierte coordenadas en direcciones (1 petición por segundo) |
| Cloudinary (opcional) | Fotos de perfil, vehículo y documentos. Sin configurarlo se guarda la ruta local de la foto |

## Modelo de datos (Firestore)

- `drivers/{uid}`: `email`, `accountStatus`, `personalData`, `vehicle`, `documents`, `isAvailable`, `location {lat, lng}`, `locationUpdatedAt`, `fcmToken`.
- `trips/{id}`: `driverId`, `passengerId`, `origin` / `destination {lat, lng, address}`, `distanceKm`, `durationMin`, `category`, `fare`, `commission`, `tip`, `driverEarnings`, `commissionRate`, `paymentMethod`, `paymentStatus`, `paymentId`, `status`, `rating`, `createdAt`, `completedAt`, más `route` (para el `Polyline`), `offeredTo` y `rejectedDriverIds` (despacho).

## Arquitectura

```
UberClone/
├── App.js · app.json · app.config.js
├── firebase.json · firestore.rules · firestore.indexes.json · .firebaserc
├── src/
│   ├── config/pricing.js           # tarifas y comisión
│   ├── constants/                  # tema, reglas del registro, estados del viaje
│   ├── context/                    # AuthContext · RegistrationContext · TripContext · PreferencesContext
│   ├── hooks/                      # useDriverLocation · useTripRequests · useEarnings · useCountdown · useTripHistory · useForm…
│   ├── i18n/                       # español / inglés
│   ├── navigation/                 # RootNavigator (Stack) · RegistrationNavigator (Tabs) · MainNavigator (Drawer) · TripFlowNavigator (Stack)
│   ├── screens/                    # auth/ · registration/ · main/ · trip/
│   ├── components/                 # formularios, mapa, tarjeta de solicitud, desglose de tarifa…
│   ├── services/                   # firebase/ · authService · driverService · tripService · paymentService · routingService · mediaService · notificationService · storage
│   ├── utils/                      # calculateFare · earnings · geo · dates · validators · historyFilters
│   └── validation/                 # login · crear cuenta · pestañas 1, 2 y 3
├── backend/                        # Node.js + Express: pagos, despachador, simulador
├── scripts/emulators.mjs           # emuladores de Firebase
└── tests/                          # node:test
```

## Decisiones y supuestos

1. **Revisión técnico-mecánica**: se exige desde el quinto año del vehículo, como los carros particulares en Colombia; se calcula con el año del modelo. Se cambia en `constants/registration.js`.
2. **Número de licencia**: el documento no fija su formato; se aceptan letras y números (5 a 20).
3. **Solicitudes**: no hay app de pasajero en este repositorio. El simulador crea solicitudes con el mismo modelo de datos y la misma función de tarifa.
4. **Calificación del pasajero**: la registra el conductor en Cobro y resumen (1 a 5).
5. **Disponibilidad**: `isAvailable` en Firestore solo es `true` mientras el conductor está en el Inicio con el interruptor activo. Al salir o al aceptar un viaje se apaga, y el interruptor se recuerda en AsyncStorage.
6. **Fotos**: el documento recomienda Cloudinary porque Firebase Storage puede exigir el plan de pago. Mientras no se configure, se guarda la ruta local de la foto (solo se ve en ese dispositivo).
7. **Mercado Pago**: el regreso automático y el webhook necesitan una URL pública HTTPS (por ejemplo, ngrok en `PUBLIC_BACKEND_URL`). Sin ella, el pago se confirma cuando el pasajero toca "Volver al sitio".

## Uso de IA

Todo uso de herramientas de IA se registra en [`docs/AI_LOG.md`](docs/AI_LOG.md). Los bloques asistidos están marcados con `// AI-assisted: see docs/AI_LOG.md #<n>`.
