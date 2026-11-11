// AI-assisted: see docs/AI_LOG.md #11
import { useEffect, useRef, useState } from 'react';

// Cuenta regresiva en segundos (temporizador de 15 s de la solicitud entrante). Reinicia cuando
// cambia `resetKey` y llama a `onExpire` al llegar a cero. La limpieza del useEffect detiene el
// intervalo: sin ella, al aceptar una solicitud el temporizador seguiría corriendo y la rechazaría.
export default function useCountdown(totalSeconds, { active, resetKey, onExpire }) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const onExpireRef = useRef(onExpire);

  // Siempre la versión más reciente de onExpire, sin reiniciar el intervalo.
  useEffect(() => {
    onExpireRef.current = onExpire;
  });

  useEffect(() => {
    if (!active) {
      return undefined;
    }
    const startedAt = Date.now();
    setRemaining(totalSeconds);
    const timer = setInterval(() => {
      const left = Math.max(0, totalSeconds - Math.floor((Date.now() - startedAt) / 1000));
      setRemaining(left);
      if (left === 0) {
        clearInterval(timer);
        onExpireRef.current?.();
      }
    }, 250);
    return () => clearInterval(timer);
  }, [active, resetKey, totalSeconds]);

  return remaining;
}
