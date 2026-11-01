// AI-assisted: see docs/AI_LOG.md #1
import { useCallback, useMemo } from 'react';

import FormActions from '../../components/FormActions.js';
import DateField from '../../components/form/DateField';
import PhotoField from '../../components/form/PhotoField.js';
import SegmentedField from '../../components/form/SegmentedField.js';
import SelectField from '../../components/form/SelectField.js';
import TextField from '../../components/form/TextField.js';
import FormScrollView from '../../components/FormScrollView.js';
import RegistrationProgress from '../../components/RegistrationProgress.js';
import SectionCard from '../../components/SectionCard.js';
import { GENDERS, PERSONAL_RULES } from '../../constants/registration.js';
import { useAuth } from '../../context/AuthContext.js';
import { usePreferences } from '../../context/PreferencesContext.js';
import { useRegistration } from '../../context/RegistrationContext.js';
import useForm from '../../hooks/useForm.js';
import useSectionSave from '../../hooks/useSectionSave.js';
import { LANGUAGES } from '../../i18n/index.js';
import { latestBirthDateForAge } from '../../utils/dates.js';
import { keepDigits } from '../../utils/validators.js';
import { EMPTY_PERSONAL_DATA, toPersonalDataForm, validatePersonalData } from '../../validation/personalDataForm.js';

// Pestaña 1 — Datos personales: foto, nombre, documento, celular, fecha de nacimiento, género,
// correo e idioma. Al guardar con éxito pasa a la pestaña Vehículo.
// (DateField se importa sin extensión para que Metro elija DateField.web.js en la web.)
export default function PersonalDataScreen({ navigation }) {
  const { t, language, setLanguage } = usePreferences();
  const { session } = useAuth();
  const { registration, progress, completedSections, savePersonalData } = useRegistration();

  // Primera vez: el correo se propone con el de la sesión y el idioma con el de la app.
  const { values, errors, errorCount, setValue, setValueAndTouch, touchField, validateForm } = useForm(
    () =>
      registration.personalData
        ? toPersonalDataForm(registration.personalData)
        : { ...EMPTY_PERSONAL_DATA, email: session.email, language },
    validatePersonalData,
  );

  const goToVehicle = useCallback(() => navigation.navigate('Vehicle'), [navigation]);
  const { isSaving, feedback, handleSave } = useSectionSave({
    values,
    validateForm,
    save: savePersonalData,
    successKey: 'personalData.saved',
    onSaved: goToVehicle,
  });

  const genderOptions = useMemo(() => GENDERS.map((id) => ({ value: id, label: t(`options.gender.${id}`) })), [t]);
  const languageOptions = useMemo(
    () => LANGUAGES.map((id) => ({ value: id, label: t(`options.language.${id}`) })),
    [t],
  );
  // Fecha máxima del calendario: hoy hace 18 años.
  const maxBirthDate = useMemo(() => latestBirthDateForAge(PERSONAL_RULES.minimumAge), []);

  // Mismo selector de idioma de la app del pasajero: además de guardarse en el perfil,
  // cambia el idioma de la interfaz de inmediato.
  const handleLanguageChange = (nextLanguage) => {
    setValueAndTouch('language', nextLanguage);
    setLanguage(nextLanguage);
  };

  return (
    <FormScrollView>
      <RegistrationProgress
        currentSection="personalData"
        progress={progress}
        completedSections={completedSections}
        accountStatus={registration.accountStatus}
      />

      <SectionCard title={t('personalData.sectionPhoto')}>
        <PhotoField
          variant="avatar"
          accessibilityLabel={t('personalData.photoLabel')}
          hint={t('personalData.photoHint')}
          value={values.photoUri}
          onChange={(uri) => setValueAndTouch('photoUri', uri)}
          onBlur={() => touchField('photoUri')}
          error={errors.photoUri}
        />
      </SectionCard>

      <SectionCard title={t('personalData.sectionPersonal')}>
        <TextField
          label={t('personalData.fullNameLabel')}
          placeholder={t('personalData.fullNamePlaceholder')}
          value={values.fullName}
          onChangeText={(text) => setValue('fullName', text)}
          onBlur={() => touchField('fullName')}
          error={errors.fullName}
          maxLength={PERSONAL_RULES.fullNameMaxLength}
          showCounter
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
        />
        <TextField
          label={t('personalData.documentLabel')}
          placeholder={t('personalData.documentPlaceholder')}
          value={values.documentNumber}
          onChangeText={(text) => setValue('documentNumber', keepDigits(text, PERSONAL_RULES.documentMaxDigits))}
          onBlur={() => touchField('documentNumber')}
          error={errors.documentNumber}
          keyboardType="number-pad"
        />
        <TextField
          label={t('personalData.phoneLabel')}
          placeholder={t('personalData.phonePlaceholder')}
          value={values.phone}
          onChangeText={(text) => setValue('phone', keepDigits(text, PERSONAL_RULES.phoneDigits))}
          onBlur={() => touchField('phone')}
          error={errors.phone}
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
        />
        <DateField
          label={t('personalData.birthDateLabel')}
          placeholder={t('personalData.birthDatePlaceholder')}
          hint={t('personalData.birthDateHint', { age: PERSONAL_RULES.minimumAge })}
          value={values.birthDate}
          maximumDate={maxBirthDate}
          onChange={(isoDate) => setValueAndTouch('birthDate', isoDate)}
          onBlur={() => touchField('birthDate')}
          error={errors.birthDate}
        />
        <SelectField
          label={t('personalData.genderLabel')}
          placeholder={t('personalData.genderPlaceholder')}
          options={genderOptions}
          value={values.gender}
          onChange={(gender) => setValueAndTouch('gender', gender)}
          onBlur={() => touchField('gender')}
          error={errors.gender}
        />
      </SectionCard>

      <SectionCard title={t('personalData.sectionAccount')}>
        <TextField
          label={t('personalData.emailLabel')}
          placeholder={t('personalData.emailPlaceholder')}
          icon="mail-outline"
          value={values.email}
          onChangeText={(text) => setValue('email', text)}
          onBlur={() => touchField('email')}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
        />
        <SegmentedField
          label={t('personalData.languageLabel')}
          hint={t('personalData.languageHint')}
          options={languageOptions}
          value={values.language}
          onChange={handleLanguageChange}
          error={errors.language}
        />
      </SectionCard>

      <FormActions
        errorCount={errorCount}
        feedback={feedback}
        submitTitle={t('personalData.submit')}
        submitIcon="arrow-forward"
        isSaving={isSaving}
        onSubmit={handleSave}
      />
    </FormScrollView>
  );
}
