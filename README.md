# UberClone — Versión Conductor

Aplicación móvil multiplataforma (Android, iOS y web) inspirada en la app de conductor de Uber, construida con **React Native + Expo SDK 58**. Este repositorio contiene la **primera entrega**: inicio de sesión y las pestañas 1 (Datos personales) y 2 (Vehículo) del registro del conductor.

## Integrantes

| Nombre | Rol |
| --- | --- |
| Linay Yuliani Muñoz Perez | Desarrollo |
| _(agregar a los demás integrantes)_ | |

## Alcance de la primera entrega

| Módulo | Estado |
| --- | --- |
| Inicio de sesión (correo + contraseña, validaciones, errores, carga, sesión persistente, cierre de sesión) | ✅ Implementado |
| Registro — Pestaña 1: Datos personales | ✅ Implementado |
| Registro — Pestaña 2: Vehículo | ✅ Implementado |
| Navegación Stack (sesión) + Tabs (registro) | ✅ Implementado |
| Registro — Pestaña 3: Documentos y pagos, botón **Enviar registro** | ⏳ Siguiente entrega |
| Inicio con mapa, solicitudes, viaje, cobro, ganancias, historial, Drawer de perfil | ⏳ Entregas posteriores |

## Requisitos

- Node.js 20 o superior (probado con Node 24) y npm.
- App **Expo Go** (SDK 58) en el celular, o un emulador Android / simulador iOS.

## Instalación y ejecución

```bash
npm install
npx expo start
```

En la terminal de Expo: escanear el código QR con Expo Go, o presionar `a` (Android), `i` (iOS) o `w` (web).

```bash
npm run android   # abre directamente en el emulador Android
npm run web       # abre la versión web en el navegador
npm test          # 37 pruebas unitarias (validaciones, fechas, servicios, idiomas)
```

### Cuenta de prueba

El backend de esta entrega es un **servidor simulado en memoria** (ver [Decisiones técnicas](#decisiones-técnicas)). Las credenciales de prueba están en [`src/services/mock/seedDrivers.js`](src/services/mock/seedDrivers.js). La cuenta empieza con el registro vacío (`Registro incompleto`).

> Los datos guardados en las pestañas se conservan mientras la app está abierta (incluso al cerrar y volver a iniciar sesión), y vuelven al estado inicial al recargar la app. Es intencional: el documento prohíbe guardar datos personales en AsyncStorage, y la base de datos real llega en la siguiente entrega.

## Flujo de la aplicación

```
                 ┌──────────────────────┐
  abrir app ───► │ ¿Sesión guardada?    │── sí ──┐
                 └──────────┬───────────┘        │
                            no                   │
                 ┌──────────▼───────────┐        │
                 │ Login                │        │
                 │ correo + contraseña  │        │
                 └──────────┬───────────┘        │
          error: mensaje    │ éxito              │
          debajo / encima   │                    │
          del botón         ▼                    ▼
                 ┌─────────────────────────────────────────┐
                 │ Registro del conductor (Bottom Tabs)    │
                 │  ┌─────────────────┐ ┌───────────────┐  │
                 │  │ Datos personales│→│ Vehículo      │  │
                 │  └─────────────────┘ └───────────────┘  │
                 │  Encabezado: cerrar sesión ⟶ Login      │
                 └─────────────────────────────────────────┘
```

- **Navegación según el resultado de la autenticación**: `RootNavigator` muestra `Login` o el módulo del conductor según el estado de `AuthContext`. Al cambiar la sesión, React Navigation cambia de pantalla y el botón "atrás" no puede volver al login.
- Al guardar la pestaña 1 con éxito, la app pasa sola a la pestaña Vehículo.
- La tarjeta **Tu registro** muestra el estado de la cuenta y el avance de las tres pestañas; cada pestaña completa muestra un check verde en la barra inferior.

## Requisitos del documento y cómo se cumplen

### Pestaña 1 — Datos personales

| Campo | Regla del documento | Implementación |
| --- | --- | --- |
| Foto de perfil | Cámara o galería; obligatoria | `PhotoField` + `useImagePicker` (expo-image-picker). Hoja inferior con "Tomar foto" / "Elegir de la galería". Permiso de cámara denegado → mensaje debajo del campo |
| Nombre completo | Máx. 50; solo letras y espacios | Contador `n/50`; acepta tildes y ñ; se normalizan espacios al guardar |
| Documento de identidad | Numérico, 6 a 10 dígitos | Teclado numérico; se descartan caracteres no numéricos |
| Número de celular | Numérico, 10 dígitos | Ídem; al pegar `300-123-4567` quedan los 10 dígitos |
| Fecha de nacimiento | Selector de fecha; mayor de 18 años | Selector nativo (Android/iOS) o del navegador (web); fecha máxima = hoy hace 18 años; validación de edad |
| Género | Lista desplegable | `SelectField` (hoja inferior) |
| Correo electrónico | Validación de @ y dominio | Se propone el correo de la sesión; se guarda en minúsculas |
| Idioma | Español / inglés | `SegmentedField`; cambia el idioma de **toda la app** al instante y se guarda en AsyncStorage (preferencia) |

### Pestaña 2 — Vehículo

| Campo | Regla del documento | Implementación |
| --- | --- | --- |
| Categoría | Económico, XL, Premium | `SelectField`; ids `economy`, `xl`, `premium` (modelo de datos de la sección 6) |
| Placa | ABC123; a mayúsculas antes de validar | Se convierte a mayúsculas mientras se escribe y se quitan espacios y guiones |
| Marca y modelo | Texto, máx. 30 cada uno | Dos campos con contador |
| Año | 4 dígitos, no mayor al año actual | Validación con el año en curso |
| Color | Lista desplegable | `SelectField` con muestra del color |
| Capacidad de pasajeros | Numérico; XL exige mínimo 6 | Al elegir XL aparece la ayuda "mínimo 6"; error si es menor |
| Foto del vehículo | Obligatoria; debe verse la placa | `PhotoField` (recorte 4:3) con la indicación "La placa debe verse claramente" |

### Reglas generales

- **Ningún campo puede quedar nulo o vacío** (tampoco con solo espacios).
- **Los errores se muestran debajo de cada campo, nunca en un `Alert`**: aparecen al salir del campo o al intentar guardar, y se actualizan mientras se corrige. Junto al botón se indica cuántos campos faltan.
- **AsyncStorage solo para la sesión y las preferencias** (`@uberclone/session`, `@uberclone/language`). Ningún dato personal, de documentos ni de pago se guarda en el dispositivo.
- El servicio **vuelve a validar** los datos antes de guardar: la validación de la app no es la única barrera.

### Hooks exigidos por el documento

| Hook | Dónde |
| --- | --- |
| `useState` | Formularios (`useForm`), estados de carga y mensajes de cada pantalla |
| `useEffect` con limpieza | Restaurar sesión (`AuthContext`), leer idioma (`PreferencesContext`), cargar el registro (`RegistrationContext`): descartan la respuesta si el componente se desmonta |
| `useContext` | Sesión del conductor (`AuthContext`), registro (`RegistrationContext`), idioma (`PreferencesContext`) |
| `useMemo` / `useCallback` | Errores derivados de los valores (`useForm`), avance del registro, opciones de las listas, funciones de los contextos |
| Hooks personalizados | `useForm`, `useImagePicker`, `useSectionSave`. Los del documento (`useDriverLocation`, `useTripRequests`, `useEarnings`) corresponden a módulos de entregas posteriores |

## Arquitectura

```
UberClone/
├── App.js                      # Proveedores (preferencias → sesión) + NavigationContainer
├── app.json                    # Nombre, plugins (image-picker con textos de permisos, datetimepicker, expo-font)
├── src/
│   ├── components/             # UI reutilizable, sin acceso al servidor
│   │   ├── form/               # TextField, SelectField, DateField(.web), SegmentedField, PhotoField…
│   │   ├── AppButton.js · BottomSheet.js · ListOption.js · SectionCard.js · InlineMessage.js
│   │   ├── FormScrollView.js · FormActions.js · RegistrationProgress.js · LogoutButton.js
│   │   └── LoadingView.js · ErrorView.js
│   ├── constants/              # theme.js (colores, espaciados, tipografía) · registration.js (reglas y opciones)
│   ├── context/                # AuthContext · RegistrationContext · PreferencesContext
│   ├── hooks/                  # useForm · useImagePicker · useSectionSave
│   ├── i18n/                   # es.js · en.js · translate()
│   ├── navigation/             # RootNavigator (Stack) · RegistrationNavigator (Tabs)
│   ├── screens/
│   │   ├── auth/LoginScreen.js
│   │   └── registration/       # PersonalDataScreen (pestaña 1) · VehicleScreen (pestaña 2)
│   ├── services/               # Única capa que habla con el "servidor"
│   │   ├── authService.js · driverService.js · storage.js (AsyncStorage) · serviceError.js
│   │   └── mock/               # mockServer.js (en memoria) · seedDrivers.js (cuenta de prueba)
│   ├── utils/                  # validators.js · dates.js (funciones puras)
│   └── validation/             # loginForm.js · personalDataForm.js · vehicleForm.js
├── tests/                      # node:test — se ejecutan con `npm test`
└── docs/AI_LOG.md              # Bitácora de uso de IA
```

**Capas:** las pantallas guardan el estado del formulario y combinan componentes; los contextos comparten la sesión y el registro; los servicios son la única puerta al servidor; las validaciones y utilidades son funciones puras probadas con Node, sin abrir la app. Las mismas funciones de validación se usan en la app y en el servicio.

## Decisiones técnicas

1. **Pocket Desk no estaba disponible** en el equipo ni en GitHub, así que se tomaron como referencia los proyectos anteriores (`pokedex-explorer` y `reservas_clases_ingles`): Expo + JavaScript, carpetas por capa, identificadores en inglés, textos de interfaz traducidos y comentarios en español, pruebas con `node --test` e imports con extensión `.js`.
2. **JavaScript en lugar de TypeScript**: es lo que usan los proyectos anteriores y los nombres de archivo del documento (`src/config/pricing.js`, `src/utils/calculateFare.js`).
3. **React Navigation** (native-stack + bottom-tabs) en lugar de Expo Router: el documento pide explícitamente Stack, Tabs y Drawer, y el proyecto de reservas usa React Navigation.
4. **Servidor simulado**: `authService` y `driverService` exponen funciones `async` con la forma que tendrán con Firebase (Authentication + Firestore) o MongoDB. Para conectar el backend real solo se reemplaza la implementación de esos dos archivos; pantallas y contextos no cambian. Tiene una demora de red simulada para que se vean los estados de carga.
5. **Mismo mensaje para correo inexistente y contraseña incorrecta**: no revela qué cuentas existen.
6. **Idioma**: el selector de la pestaña 1 cambia toda la interfaz (es/en) sin librerías externas; una prueba verifica que ambos diccionarios tengan las mismas claves.
7. **Hojas inferiores** (`BottomSheet`) para listas, origen de foto y confirmación de cierre de sesión, en lugar de `Alert` (que en la web no muestra botones).
8. **Selector de fecha**: `@react-native-community/datetimepicker` en Android/iOS; en la web se usa `<input type="date">` (`DateField.web.js`), porque la librería no soporta web.
9. **Fechas como texto `AAAA-MM-DD`** en hora local, para evitar corrimientos de un día por zona horaria.

## Dudas e inconsistencias del documento

Se resolvieron con la opción más conservadora; conviene confirmarlas con el docente:

1. **Inicio de sesión**: el documento menciona la sesión y el cierre de sesión, pero no define el método de autenticación ni incluye una contraseña en el registro. Se implementó correo + contraseña con una cuenta de prueba; **falta definir cómo se crea la cuenta** (¿Firebase Auth con correo y contraseña antes de las pestañas?).
2. **"Mayor de 18 años"**: se interpretó como mayoría de edad (18 años cumplidos o más).
3. **Opciones de las listas** de Género y Color: el documento no las enumera; se usaron opciones comunes (`src/constants/registration.js`), fáciles de cambiar.
4. **Idioma "mismo selector de la app del pasajero"**: no hay especificación visual de ese selector; se usó un control segmentado Español / English.
5. **Botón Enviar registro**: solo puede habilitarse con las tres pestañas, y la pestaña Documentos es de la siguiente entrega. Por ahora la tarjeta **Tu registro** muestra el avance y la regla.
6. **Fotos**: el documento recomienda Cloudinary; en esta entrega se guarda la URI local de la imagen. La subida a Cloudinary se hace al conectar el backend.

## Pendiente para las siguientes entregas

- Pestaña 3 (Documentos y pagos), botón **Enviar registro** y paso a estado `pending_approval`.
- Backend real (Firebase Authentication + Firestore o MongoDB) y subida de fotos a Cloudinary; `.env.example` con los nombres de las variables cuando existan llaves.
- Pantallas de Inicio (mapa y disponibilidad), solicitud entrante, viaje, cobro, ganancias, historial y Drawer de perfil/configuración, con los hooks `useDriverLocation`, `useTripRequests` y `useEarnings`.

## Uso de IA

Todo uso de herramientas de IA se registra en la bitácora [`docs/AI_LOG.md`](docs/AI_LOG.md). Los bloques asistidos están marcados en el código con `// AI-assisted: see docs/AI_LOG.md #<n>`.
