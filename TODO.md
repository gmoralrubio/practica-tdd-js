CA1 (ok) — Tras 3 intentos fallidos consecutivos, la cuenta se bloquea 15 minutos.
      (1er y 2º fallo: cuentan, pero NO bloquean todavía.)

CA2 (ok) — Un login CORRECTO antes del límite resetea el contador de fallos a 0.

CA3 (ok) — Estando bloqueada, la cuenta RECHAZA el login aunque la password sea
      correcta. Error LOCKED (HTTP 423). Y NO llega ni a comparar la password.

CA4 (ok) — Pasados los 15 minutos, el bloqueo EXPIRA solo y vuelve a aceptar logins.