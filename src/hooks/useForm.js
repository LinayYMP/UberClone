// AI-assisted: see docs/AI_LOG.md #1
import { useCallback, useMemo, useState } from 'react';

import { hasErrors } from '../utils/validators.js';

// Estado de un formulario con useState: valores, campos tocados y si ya se intentó enviar.
// Los errores no se guardan aparte: se calculan con useMemo a partir de los valores, así nunca
// quedan desactualizados. Solo se muestran en campos ya tocados o después de intentar enviar.
// `initialValues` puede ser un objeto o una función (se evalúa una sola vez, como en useState).
// `validate` debe ser una función estable (declarada fuera del componente).
export default function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const allErrors = useMemo(() => validate(values), [validate, values]);

  const errors = useMemo(() => {
    if (submitAttempted) {
      return allErrors;
    }
    return Object.fromEntries(Object.entries(allErrors).filter(([field]) => touched[field]));
  }, [allErrors, touched, submitAttempted]);

  const setValue = useCallback((field, value) => {
    setValues((previous) => ({ ...previous, [field]: value }));
  }, []);

  // Para campos de texto: se marca al perder el foco.
  const touchField = useCallback((field) => {
    setTouched((previous) => (previous[field] ? previous : { ...previous, [field]: true }));
  }, []);

  // Para selectores, fechas y fotos (no tienen blur): elegir un valor también marca el campo.
  const setValueAndTouch = useCallback(
    (field, value) => {
      setValue(field, value);
      touchField(field);
    },
    [setValue, touchField],
  );

  // true si todo es válido; si no, deja visibles todos los errores debajo de cada campo.
  const validateForm = useCallback(() => {
    setSubmitAttempted(true);
    return !hasErrors(allErrors);
  }, [allErrors]);

  return {
    values,
    errors,
    errorCount: submitAttempted ? Object.keys(allErrors).length : 0,
    setValue,
    setValueAndTouch,
    touchField,
    validateForm,
  };
}
