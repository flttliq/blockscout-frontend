import { useUpdateEffect } from '@chakra-ui/react';
import React from 'react';
import type { ControllerRenderProps } from 'react-hook-form';
import { useFormContext, Controller } from 'react-hook-form';

import type { FormFields } from '../types';
import type { Option } from 'ui/shared/FancySelect/types';

import useIsMobile from 'lib/hooks/useIsMobile';
import FancySelect from 'ui/shared/FancySelect/FancySelect';

import ContractVerificationFormRow from '../ContractVerificationFormRow';

const SOURCIFY_ERROR_REGEXP = /(?<=\bcontracts\s\([^()]*)\w+/gi;

const ContractVerificationFieldContractIndex = () => {
  const [ options, setOptions ] = React.useState<Array<Option>>([]);
  const { formState, control, watch } = useFormContext<FormFields>();
  const isMobile = useIsMobile();

  const sources = watch('sources');
  const sourcesError = 'sources' in formState.errors ? formState.errors.sources?.message : undefined;

  useUpdateEffect(() => {
    if (!sourcesError) {
      return;
    }

    const parsedMethods = sourcesError.match(SOURCIFY_ERROR_REGEXP);
    if (!Array.isArray(parsedMethods) || parsedMethods.length === 0) {
      return;
    }

    const newOptions = parsedMethods.map((option, index) => ({ label: option, value: String(index + 1) }));
    setOptions(newOptions);
  }, [ sourcesError ]);

  useUpdateEffect(() => {
    setOptions([]);
  }, [ sources ]);

  const renderControl = React.useCallback(({ field }: {field: ControllerRenderProps<FormFields, 'contract_index'>}) => {
    const error = 'contract_index' in formState.errors ? formState.errors.contract_index : undefined;

    return (
      <FancySelect
        { ...field }
        options={ options }
        size={ isMobile ? 'md' : 'lg' }
        placeholder="Contract name"
        isDisabled={ formState.isSubmitting }
        error={ error }
        isRequired
        isAsync={ false }
      />
    );
  }, [ formState.errors, formState.isSubmitting, isMobile, options ]);

  if (options.length === 0) {
    return null;
  }

  return (
    <ContractVerificationFormRow>
      <Controller
        name="contract_index"
        control={ control }
        render={ renderControl }
        rules={{ required: true }}
      />
    </ContractVerificationFormRow>
  );
};

export default React.memo(ContractVerificationFieldContractIndex);
