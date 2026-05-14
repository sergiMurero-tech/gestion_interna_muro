# Gestión Interna Muro CF

App Android (Kotlin + Jetpack Compose) para la gestión interna del Muro CF:

- **Jugadores**: alta/edición de jugadores con sueldo y configuración de primas (gol, portería a 0, minutos y prima personalizada).
- **Calcular nómina del mes**: introduces goles, porterías, minutos y descuentos del mes y obtienes el total a pagar.
- **Descuentos**: descuento por viaje (50 € por viaje) y descuento proporcional al sueldo según días de ausencia / días de entrenamiento.
- **Histórico mensual**: cada cálculo se guarda con mes y año.
- **Certificado de licencia (PDF)**: genera un PDF idéntico al modelo del Muro CF (cabecera con datos del club, nombre del jugador, DNI, importes de licencia y mutualidad, total y firma manuscrita del secretario).

## Cómo obtener el APK (sin instalar nada)

Cada `git push` a esta rama dispara el workflow de GitHub Actions que compila el APK debug:

1. Abre la pestaña **Actions** del repositorio.
2. Entra en el último workflow `Build APK` que esté en verde.
3. Baja al apartado **Artifacts** y descarga `gestion-muro-debug-apk`.
4. Descomprime el ZIP y copia el `.apk` al móvil (cable USB, Drive, Telegram, etc.).
5. En el móvil, abre el `.apk`. Android te pedirá permiso para instalar apps de orígenes desconocidos: acéptalo y se instalará la app.

## Compilar localmente (opcional)

Requiere Android Studio (Hedgehog o superior) o JDK 17 + Android SDK.

```
./gradlew assembleDebug
```

El APK queda en `app/build/outputs/apk/debug/app-debug.apk`.

## Estructura

- `app/src/main/java/com/murocf/gestion/data/` – Room (jugadores, cálculos mensuales) + datos fijos del club (`ClubInfo`).
- `app/src/main/java/com/murocf/gestion/viewmodel/` – `AppViewModel` y la lógica de cálculo (`CalculationLogic`).
- `app/src/main/java/com/murocf/gestion/ui/screens/` – Pantallas Compose.
- `app/src/main/java/com/murocf/gestion/ui/components/SignaturePad.kt` – Componente de firma manuscrita.
- `app/src/main/java/com/murocf/gestion/pdf/CertificateGenerator.kt` – Generador del PDF del certificado.

## Notas de cálculo

- Prima total = `goles * €/gol + porterías * €/portería + minutos * €/minuto + cantidad personalizada * € unidad`.
- Descuento por viaje: 50 € por cada viaje declarado.
- Descuento proporcional: `sueldo * (días ausencia / días entrenamiento)`.
- Total a pagar = `sueldo + primas - descuentos`.

## Personalización del club

Los datos del Muro CF (CIF, teléfono, dirección, email, título del firmante) están en
`app/src/main/java/com/murocf/gestion/data/ClubInfo.kt`. Si cambian, edítalos ahí y vuelve a compilar.
