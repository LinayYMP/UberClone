# UberClone — Versión Conductor

Aplicación móvil multiplataforma (Android, iOS y web) inspirada en la app de conductor de Uber, construida con **React Native + Expo SDK 58** y **Firebase** (Authentication + Cloud Firestore). El conductor se registra, recibe solicitudes en tiempo real, las acepta o rechaza en 15 segundos, hace el viaje, cobra con Mercado Pago (modo de prueba) o en efectivo y consulta sus ganancias e historial.

## Integrantes

| Nombre | Rol |
| --- | --- |
| Linay Yuliani Muñoz Perez | Desarrollo |

## Funcionalidades

| Módulo | Pantallas |
| --- | --- |
| Cuenta | Iniciar sesión y Crear cuenta , correo y contraseña) |
| Registro (Tabs) | Datos personales · Vehículo · Documentos y pagos · botón **Enviar registro** (solo con las tres pestañas completas y válidas) |
| Flujo del viaje (Stack) | Inicio (mapa + Disponible/No disponible) · Solicitud entrante (15 s) · Viaje en curso · Cobro y resumen |
| Menú lateral (Drawer) | Inicio · Ganancias · Historial (con detalle) · Perfil y configuración |
| Backend (`backend/`) | Cobro con Mercado Pago Checkout Pro, despacho de solicitudes al conductor más cercano, simulador de pasajero |

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

