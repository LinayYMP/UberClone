// AI-assisted: see docs/AI_LOG.md #1
import { useCallback, useEffect, useState } from 'react';
import { Keyboard } from 'react-native';

// Lógica de guardado compartida por las pestañas del registro: valida el formulario, llama al
// guardado del contexto y maneja el estado de carga y el mensaje de resultado.
// Devuelve { isSaving, feedback, handleSave }; feedback = { tone, key } para InlineMessage.
export default function useSectionSave({ values, validateForm, save, successKey, onSaved }) {
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Si el conductor edita después de guardar, el aviso anterior deja de ser cierto.
  useEffect(() => {
    setFeedback(null);
  }, [values]);

  const handleSave = useCallback(async () => {
    if (isSaving) {
      return;
    }
    Keyboard.dismiss();
    setFeedback(null);
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      await save(values);
      setFeedback({ tone: 'success', key: successKey });
      onSaved?.();
    } catch {
      setFeedback({ tone: 'danger', key: 'registration.saveError' });
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, validateForm, save, values, successKey, onSaved]);

  return { isSaving, feedback, handleSave };
}
