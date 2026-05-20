# Política de Privacidad — Álbum Panini FWC 2026

**Desarrollado por:** SiTechNi  
**Última actualización:** 20 de mayo de 2026  
**Aplicable a:** Álbum Panini FWC 2026 (Android e iOS)  
**URL de esta política:** https://jcardozori.github.io/albu-panini2026/privacy

---

## 1. Introducción

SiTechNi ("nosotros", "nuestro") ha desarrollado la aplicación **Álbum Panini FWC 2026** como una herramienta de uso personal para el seguimiento y organización de colecciones de figuritas del Mundial de Fútbol 2026. Esta aplicación **no es un juego** ni contiene elementos de gamificación, apuestas, compras dentro de la app ni monetización de ningún tipo.

La presente Política de Privacidad describe de forma completa qué datos se utilizan, cómo se protegen, con quién se comparten y cuáles son los derechos del usuario. Esta política es **accesible desde la propia aplicación** (sección Ajustes → Política de Privacidad) y desde la ficha de Google Play.

Al instalar y utilizar esta aplicación, el usuario acepta los términos aquí descritos.

---

## 2. Edad mínima requerida

Esta aplicación está destinada a usuarios **mayores de 13 años**. No recopilamos intencionalmente información de menores de 13 años. Si eres padre, madre o tutor legal y tienes conocimiento de que un menor a tu cargo ha proporcionado información personal a través de esta aplicación, contáctanos a través del correo indicado en la sección 11 para que podamos eliminar dicha información de inmediato.

---

## 3. Datos que la aplicación recopila y transmite

### 3.1 Datos recopilados mediante autenticación

La aplicación ofrece inicio de sesión mediante **Google Sign-In** (Android e iOS) y, opcionalmente, **Sign in with Apple** (exclusivo iOS). Al autenticarse, SiTechNi recibe y almacena temporalmente en memoria del dispositivo los siguientes datos:

| Dato | Origen | Finalidad |
|---|---|---|
| Nombre y apellido de perfil | Google / Apple | Mostrar nombre en la app |
| Dirección de correo electrónico | Google / Apple | Identificar la sesión |
| URL de foto de perfil pública | Google | Mostrar avatar en la app |
| Token de acceso OAuth 2.0 | Google | Leer y escribir el Google Sheet del usuario |

> **Importante:** El token de acceso OAuth **se almacena exclusivamente en memoria del dispositivo** durante la sesión activa. No se transmite a servidores de SiTechNi ni se persiste en disco. Al cerrar sesión, el token se revoca y se elimina.

### 3.2 Datos del álbum (Google Sheets)

El estado de la colección del usuario (figuritas obtenidas, repetidas o faltantes) se transmite y almacena en **Google Sheets dentro de la cuenta de Google del propio usuario**. SiTechNi no almacena estos datos en servidores propios. La sincronización ocurre únicamente cuando el usuario lo solicita de forma explícita.

### 3.3 Datos NO recopilados

Esta aplicación **no recopila, no accede ni transmite**:

- Ubicación geográfica (precisa ni aproximada).
- Datos biométricos (Face ID y Touch ID son gestionados exclusivamente por el sistema operativo del dispositivo; SiTechNi no accede a ellos).
- Información bancaria, de tarjetas de crédito o débito.
- Contactos, fotos de galería, micrófono ni cámara del dispositivo.
- Identificadores de publicidad (AAID, IDFA) ni datos de comportamiento para publicidad.
- Registros de llamadas, SMS ni mensajes.
- Datos de salud o actividad física.
- Identificadores persistentes de dispositivo (IMEI, Android ID).
- Datos de uso o telemetría propios de SiTechNi.

---

## 4. Finalidad del uso de los datos

Los datos recopilados se utilizan exclusivamente para:

1. **Autenticación:** Identificar al usuario dentro de la aplicación durante la sesión activa.
2. **Sincronización del álbum:** Leer y escribir la hoja de cálculo del álbum en Google Sheets, con el consentimiento explícito del usuario.

SiTechNi **no vende, cede, alquila ni comercializa** ningún dato personal del usuario a terceros.

---

## 5. Medidas de seguridad implementadas por SiTechNi

SiTechNi aplica las siguientes medidas técnicas para proteger los datos durante su uso:

- **Cifrado en tránsito:** Todas las comunicaciones con Google Sheets API y los servicios de autenticación se realizan mediante **HTTPS con TLS 1.2 o superior**.
- **Sin almacenamiento en servidores propios:** SiTechNi no opera servidores de base de datos. Los datos del álbum residen exclusivamente en la infraestructura de Google (cuenta del usuario).
- **Tokens en memoria:** El token de acceso OAuth se mantiene únicamente en memoria volátil del dispositivo y se descarta al cerrar sesión o al cerrar la aplicación.
- **Nonce criptográfico:** La autenticación con Apple utiliza un nonce generado con `Crypto.getRandomBytesAsync` (32 bytes aleatorios + SHA-256), cumpliendo con los estándares de seguridad de Apple Sign-In.
- **Sin logs de tokens:** La aplicación no registra tokens, credenciales ni datos personales en logs de consola en entorno de producción.

> La seguridad de los datos almacenados en Google Sheets depende también de las medidas que el **propio usuario** aplique en su cuenta de Google (contraseña robusta, verificación en dos pasos). SiTechNi no puede garantizar la protección de datos ante compromisos de la cuenta de Google del usuario.

---

## 6. Retención de datos

| Dato | Período de retención | Eliminación |
|---|---|---|
| Token OAuth en memoria | Duración de la sesión activa | Al cerrar sesión o la app |
| Nombre y email en sesión | Duración de la sesión activa | Al cerrar sesión o la app |
| Datos del álbum (Google Sheets) | Indefinido (bajo control del usuario) | El usuario los elimina desde Google Drive |
| Datos en servidores de SiTechNi | No aplica — SiTechNi no almacena datos | — |

---

## 7. Eliminación de cuenta y datos

Dado que esta aplicación utiliza autenticación de terceros (Google / Apple), **no existe una "cuenta SiTechNi"** separada. Para eliminar completamente su acceso y datos, el usuario debe seguir estos pasos:

### Desde la aplicación
1. Ir a **Perfil → Cerrar sesión**. Esto revoca el token OAuth y elimina los datos de sesión del dispositivo.

### Desde la web (eliminación completa)
Para una eliminación total de datos asociados:

1. **Revocar el acceso de la app a Google:** Visita [myaccount.google.com/permissions](https://myaccount.google.com/permissions), busca "Álbum Panini FWC 2026" y retira el acceso.
2. **Eliminar los datos del álbum:** Accede a [drive.google.com](https://drive.google.com), localiza la hoja de cálculo creada por la app y elimínala.
3. **Solicitud formal de eliminación:** Envía un correo a [soporte@sitechni.com](mailto:soporte@sitechni.com) con el asunto **"Eliminación de datos — Álbum Panini FWC 2026"** si requieres confirmación escrita. Responderemos en un plazo máximo de **30 días hábiles**.

---

## 8. Limitación de responsabilidad

SiTechNi no se hace responsable por:

- El **uso indebido** de la aplicación por parte del usuario o de terceros con acceso al dispositivo.
- Pérdida, alteración o eliminación de datos almacenados en Google Sheets u otros servicios de terceros.
- Daños directos, indirectos, incidentales o consecuentes derivados del uso o de la imposibilidad de uso de la aplicación.
- Interrupciones en el servicio causadas por factores externos (conectividad, servidores de terceros, actualizaciones del sistema operativo, etc.).
- Accesos no autorizados a la cuenta de Google del usuario resultantes de negligencia del propio usuario (contraseñas débiles, dispositivos sin bloqueo de pantalla, sesiones compartidas, etc.).

El uso de esta aplicación se realiza **bajo el propio riesgo del usuario**.

---

## 9. Servicios de terceros

Esta aplicación se integra con los siguientes servicios externos. Cada uno opera bajo su propia política de privacidad y puede recopilar datos adicionales de acuerdo con sus propios términos:

| Servicio | Proveedor | Datos que pueden recibir | Política |
|---|---|---|---|
| Google Sign-In | Google LLC | Email, nombre, foto de perfil | [policies.google.com/privacy](https://policies.google.com/privacy) |
| Google Sheets API | Google LLC | Contenido de la hoja del álbum | [policies.google.com/privacy](https://policies.google.com/privacy) |
| Sign in with Apple | Apple Inc. | Email anonimizado, nombre | [apple.com/legal/privacy](https://www.apple.com/legal/privacy/) |
| Expo / EAS | Expo (650 Industries) | Puede recopilar datos de crash y uso anónimos | [expo.dev/privacy](https://expo.dev/privacy) |

SiTechNi no controla las prácticas de privacidad de estos terceros. Se recomienda al usuario revisar sus políticas individuales.

---

## 10. Derechos del usuario

De acuerdo con las normativas aplicables (RGPD, CCPA, COPPA y leyes locales), el usuario tiene derecho a:

- **Acceder** a sus datos del álbum en cualquier momento desde Google Sheets.
- **Rectificar** sus datos modificando directamente la hoja de cálculo.
- **Eliminar** sus datos siguiendo el procedimiento descrito en la sección 7.
- **Portabilidad:** Exportar su hoja de cálculo desde Google Drive en los formatos disponibles (.xlsx, .csv, etc.).
- **Revocar el consentimiento** retirando los permisos OAuth en [myaccount.google.com/permissions](https://myaccount.google.com/permissions).
- **Presentar una reclamación** ante la autoridad de protección de datos de su país si considera que sus derechos han sido vulnerados.

Para ejercer cualquiera de estos derechos, escríbenos a [soporte@sitechni.com](mailto:soporte@sitechni.com).

---

## 11. Cambios en esta política

SiTechNi se reserva el derecho de actualizar esta Política de Privacidad en cualquier momento. Los cambios materiales se notificarán al usuario mediante un aviso en la aplicación en el siguiente inicio de sesión posterior a la actualización. La fecha de "Última actualización" al inicio de este documento se actualizará en cada revisión.

---

## 12. Contacto

Para consultas, solicitudes de eliminación de datos o ejercicio de derechos relacionados con esta Política de Privacidad:

**SiTechNi**  
Correo electrónico: [soporte@sitechni.com](mailto:soporte@sitechni.com)  
Solicitud de eliminación de cuenta: [soporte@sitechni.com](mailto:soporte@sitechni.com) — Asunto: "Eliminación de datos — Álbum Panini FWC 2026"

Tiempo de respuesta máximo: **30 días hábiles**.

---

*Esta política de privacidad fue redactada para cumplir con los lineamientos de Google Play Store, Apple App Store, el Reglamento General de Protección de Datos (RGPD/GDPR), la California Consumer Privacy Act (CCPA) y la Children's Online Privacy Protection Act (COPPA).*
