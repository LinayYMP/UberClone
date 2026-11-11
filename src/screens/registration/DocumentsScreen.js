// AI-assisted: see docs/AI_LOG.md #11
import { useMemo } from 'react';
import { Text, StyleSheet } from 'react-native';

import CheckboxField from '../../components/form/CheckboxField.js';
import DateField from '../../components/form/DateField';
import PhotoField from '../../components/form/PhotoField.js';
import TextField from '../../components/form/TextField.js';
import FormActions from '../../components/FormActions.js';
import FormScrollView from '../../components/FormScrollView.js';
import InlineMessage from '../../components/InlineMessage.js';
import RegistrationProgress from '../../components/RegistrationProgress.js';
import SectionCard from '../../components/SectionCard.js';
import { PRICING } from '../../config/pricing.js';
import { DOCUMENT_RULES } from '../../constants/registration.js';
import { COLORS, TYPOGRAPHY } from '../../constants/theme.js';
import { usePreferences } from '../../context/PreferencesContext.js';
import { useRegistration } from '../../context/RegistrationContext.js';
import useForm from '../../hooks/useForm.js';
import useSectionSave from '../../hooks/useSectionSave.js';
import { requiresTechnicalInspection, toDocumentsForm, validateDocuments } from '../../validation/documentsForm.js';

// Pestaña 3 — Documentos y pagos: licencia (número, foto y vencimiento), SOAT, revisión
// técnico-mecánica si aplica según el año del vehículo, correo de Mercado Pago y términos con la
// comisión visible. También se usa desde Perfil y configuración (route.params.mode = 'profile').
// (DateField se importa sin extensión para que Metro elija DateField.web.js en la web.)
export default function DocumentsScreen({ navigation, route }) {
  const isProfile = route?.params?.mode === 'profile';
  const { t } = usePreferences();
  const { registration, progress, completedSections, canSubmit, saveDocuments, submitRegistration } = useRegistration();
  const vehicleYear = registration.vehicle?.year;
  const inspectionApplies = requiresTechnicalInspection(vehicleYear);

  // La validación depende del año del vehículo; se crea una función nueva solo si ese año cambia.
  const validate = useMemo(() => (values) => validateDocuments(values, { vehicleYear }), [vehicleYear]);
  const { values, errors, errorCount, setValue, setValueAndTouch, touchField, validateForm } = useForm(
    () => toDocumentsForm(registration.documents),
    validate,
  );

  const { isSaving, feedback, handleSave } = useSectionSave({
    values,
    validateForm,
    save: saveDocuments,
    successKey: 'documents.saved',
    onSaved: isProfile ? () => navigation.goBack() : undefined,
  });

  // Las fechas de vencimiento deben ser posteriores a hoy: el calendario empieza mañana.
  const tomorrow = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date;
  }, []);

  const photoProps = (field) => ({
    variant: 'banner',
    hint: t('documents.photoHint'),
    value: values[field],
    onChange: (uri) => setValueAndTouch(field, uri),
    onBlur: () => touchField(field),
    error: errors[field],
  });

  const expiryProps = (field) => ({
    label: t('documents.expiryLabel'),
    placeholder: t('documents.expiryPlaceholder'),
    hint: t('documents.expiryHint'),
    value: values[field],
    minimumDate: tomorrow,
    onChange: (isoDate) => setValueAndTouch(field, isoDate),
    onBlur: () => touchField(field),
    error: errors[field],
  });

  return (
    <FormScrollView>
      {!isProfile ? (
        <RegistrationProgress
          currentSection="documents"
          progress={progress}
          completedSections={completedSections}
          accountStatus={registration.accountStatus}
          canSubmit={canSubmit}
          onSubmit={submitRegistration}
        />
      ) : null}

      <SectionCard title={t('documents.sectionLicense')}>
        <TextField
          label={t('documents.licenseNumberLabel')}
          placeholder={t('documents.licenseNumberPlaceholder')}
          value={values.licenseNumber}
          onChangeText={(text) => setValue('licenseNumber', text.replace(/[^A-Za-z0-9]/g, '').toUpperCase())}
          onBlur={() => touchField('licenseNumber')}
          error={errors.licenseNumber}
          maxLength={DOCUMENT_RULES.licenseMaxLength}
          autoCapitalize="characters"
          autoCorrect={false}
        />
        <PhotoField label={t('documents.licensePhotoLabel')} accessibilityLabel={t('documents.licensePhotoLabel')} {...photoProps('licensePhotoUri')} />
        <DateField {...expiryProps('licenseExpiresAt')} />
      </SectionCard>

      <SectionCard title={t('documents.sectionSoat')}>
        <PhotoField label={t('documents.soatPhotoLabel')} accessibilityLabel={t('documents.soatPhotoLabel')} {...photoProps('soatPhotoUri')} />
        <DateField {...expiryProps('soatExpiresAt')} />
      </SectionCard>

      <SectionCard title={t('documents.sectionInspection')}>
        {!vehicleYear ? <InlineMessage tone="info" message={t('documents.inspectionNeedsVehicle')} /> : null}
        {vehicleYear && !inspectionApplies ? (
          <Text style={styles.notRequired}>
            {t('documents.inspectionNotRequired', {
              year: vehicleYear,
              after: DOCUMENT_RULES.technicalInspectionAfterYears,
            })}
          </Text>
        ) : null}
        {inspectionApplies ? (
          <>
            <PhotoField
              label={t('documents.inspectionPhotoLabel')}
              accessibilityLabel={t('documents.inspectionPhotoLabel')}
              {...photoProps('inspectionPhotoUri')}
            />
            <DateField {...expiryProps('inspectionExpiresAt')} />
          </>
        ) : null}
      </SectionCard>

      <SectionCard title={t('documents.sectionPayments')}>
        <TextField
          label={t('documents.mercadoPagoLabel')}
          placeholder={t('personalData.emailPlaceholder')}
          hint={t('documents.mercadoPagoHint')}
          icon="mail-outline"
          value={values.mercadoPagoEmail}
          onChangeText={(text) => setValue('mercadoPagoEmail', text)}
          onBlur={() => touchField('mercadoPagoEmail')}
          error={errors.mercadoPagoEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <CheckboxField
          label={t('documents.termsLabel')}
          description={t('documents.termsCommission', { percent: Math.round(PRICING.commissionRate * 100) })}
          value={values.termsAccepted}
          onChange={(accepted) => setValueAndTouch('termsAccepted', accepted)}
          error={errors.termsAccepted}
        />
      </SectionCard>

      <FormActions
        errorCount={errorCount}
        feedback={feedback}
        submitTitle={t('documents.submit')}
        submitIcon="checkmark"
        isSaving={isSaving}
        onSubmit={handleSave}
      />
    </FormScrollView>
  );
}

const styles = StyleSheet.create({
  notRequired: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: 21,
  },
});
