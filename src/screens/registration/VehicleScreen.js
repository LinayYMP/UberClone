// AI-assisted: see docs/AI_LOG.md #1, #11
import { useMemo } from 'react';

import FormActions from '../../components/FormActions.js';
import PhotoField from '../../components/form/PhotoField.js';
import SelectField from '../../components/form/SelectField.js';
import TextField from '../../components/form/TextField.js';
import FormScrollView from '../../components/FormScrollView.js';
import RegistrationProgress from '../../components/RegistrationProgress.js';
import SectionCard from '../../components/SectionCard.js';
import { VEHICLE_CATEGORIES, VEHICLE_COLORS, VEHICLE_RULES } from '../../constants/registration.js';
import { usePreferences } from '../../context/PreferencesContext.js';
import { useRegistration } from '../../context/RegistrationContext.js';
import useForm from '../../hooks/useForm.js';
import useSectionSave from '../../hooks/useSectionSave.js';
import { keepDigits, normalizePlate } from '../../utils/validators.js';
import { minimumCapacityFor, toVehicleForm, validateVehicle } from '../../validation/vehicleForm.js';

// Pestaña 2 — Vehículo: categoría, placa, marca y modelo, año, color, capacidad y foto.
// Al guardar pasa a Documentos; desde Perfil y configuración vuelve atrás.
export default function VehicleScreen({ navigation, route }) {
  const isProfile = route?.params?.mode === 'profile';
  const { t } = usePreferences();
  const { registration, progress, completedSections, canSubmit, saveVehicle, submitRegistration } = useRegistration();

  const { values, errors, errorCount, setValue, setValueAndTouch, touchField, validateForm } = useForm(
    () => toVehicleForm(registration.vehicle),
    validateVehicle,
  );

  const { isSaving, feedback, handleSave } = useSectionSave({
    values,
    validateForm,
    save: saveVehicle,
    successKey: 'vehicle.saved',
    onSaved: isProfile ? () => navigation.goBack() : () => navigation.navigate('Documents'),
  });

  const categoryOptions = useMemo(
    () => VEHICLE_CATEGORIES.map(({ id }) => ({ value: id, label: t(`options.category.${id}`) })),
    [t],
  );
  const colorOptions = useMemo(
    () => VEHICLE_COLORS.map(({ id, swatch }) => ({ value: id, label: t(`options.color.${id}`), swatch })),
    [t],
  );

  // Si la categoría exige más de 1 pasajero (XL), se avisa debajo del campo de capacidad.
  const minCapacity = minimumCapacityFor(values.category);
  const capacityHint = minCapacity > 1 ? t('vehicle.capacityXlHint', { min: minCapacity }) : undefined;

  return (
    <FormScrollView>
      {!isProfile ? (
        <RegistrationProgress
          currentSection="vehicle"
          progress={progress}
          completedSections={completedSections}
          accountStatus={registration.accountStatus}
          canSubmit={canSubmit}
          onSubmit={submitRegistration}
        />
      ) : null}

      <SectionCard title={t('vehicle.sectionInfo')}>
        <SelectField
          label={t('vehicle.categoryLabel')}
          placeholder={t('vehicle.categoryPlaceholder')}
          icon="pricetag-outline"
          options={categoryOptions}
          value={values.category}
          onChange={(category) => setValueAndTouch('category', category)}
          onBlur={() => touchField('category')}
          error={errors.category}
        />
        <TextField
          label={t('vehicle.plateLabel')}
          placeholder={t('vehicle.platePlaceholder')}
          hint={t('vehicle.plateHint')}
          value={values.plate}
          onChangeText={(text) => setValue('plate', normalizePlate(text).slice(0, VEHICLE_RULES.plateLength))}
          onBlur={() => touchField('plate')}
          error={errors.plate}
          autoCapitalize="characters"
          autoCorrect={false}
        />
        <TextField
          label={t('vehicle.brandLabel')}
          placeholder={t('vehicle.brandPlaceholder')}
          value={values.brand}
          onChangeText={(text) => setValue('brand', text)}
          onBlur={() => touchField('brand')}
          error={errors.brand}
          maxLength={VEHICLE_RULES.brandMaxLength}
          showCounter
          autoCapitalize="words"
        />
        <TextField
          label={t('vehicle.modelLabel')}
          placeholder={t('vehicle.modelPlaceholder')}
          value={values.model}
          onChangeText={(text) => setValue('model', text)}
          onBlur={() => touchField('model')}
          error={errors.model}
          maxLength={VEHICLE_RULES.modelMaxLength}
          showCounter
          autoCapitalize="words"
        />
        <TextField
          label={t('vehicle.yearLabel')}
          placeholder={t('vehicle.yearPlaceholder')}
          value={values.year}
          onChangeText={(text) => setValue('year', keepDigits(text, VEHICLE_RULES.yearDigits))}
          onBlur={() => touchField('year')}
          error={errors.year}
          keyboardType="number-pad"
        />
        <SelectField
          label={t('vehicle.colorLabel')}
          placeholder={t('vehicle.colorPlaceholder')}
          icon="color-palette-outline"
          options={colorOptions}
          value={values.color}
          onChange={(color) => setValueAndTouch('color', color)}
          onBlur={() => touchField('color')}
          error={errors.color}
        />
        <TextField
          label={t('vehicle.capacityLabel')}
          placeholder={t('vehicle.capacityPlaceholder')}
          hint={capacityHint}
          icon="people-outline"
          value={values.capacity}
          onChangeText={(text) => setValue('capacity', keepDigits(text, VEHICLE_RULES.capacityMaxDigits))}
          onBlur={() => touchField('capacity')}
          error={errors.capacity}
          keyboardType="number-pad"
        />
      </SectionCard>

      <SectionCard title={t('vehicle.sectionPhoto')}>
        <PhotoField
          variant="banner"
          accessibilityLabel={t('vehicle.photoLabel')}
          hint={t('vehicle.photoHint')}
          value={values.photoUri}
          onChange={(uri) => setValueAndTouch('photoUri', uri)}
          onBlur={() => touchField('photoUri')}
          error={errors.photoUri}
        />
      </SectionCard>

      <FormActions
        errorCount={errorCount}
        feedback={feedback}
        submitTitle={t('vehicle.submit')}
        submitIcon="checkmark"
        isSaving={isSaving}
        onSubmit={handleSave}
      />
    </FormScrollView>
  );
}
