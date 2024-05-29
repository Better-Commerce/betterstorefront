import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { useRegistrationConfig, useLoginConfig, useB2bRegistrationConfig, } from './config'
import Button from '@components/ui/Button'
import { stringToBoolean } from '@framework/utils/parse-util'
import { mergeSchema } from '@framework/utils/schema-util'
import { useTranslation } from '@commerce/utils/use-translation'
import { Checkbox } from '@components/account/Address'

/**
 * This is a schema for registration to enable Trading account registration.
 */
const registerInitialValues = {
  firstName: '',
  lastName: '',
  password: '',
  confirmPassword: '',
}

/**
 * This is initial values object for registration to enable Trading account registration.
 */
const b2bRegisterInitialValues = {
  isRequestTradingAccount: false, // "Request trading account" checkbox checked value is FALSE by default.
  companyName: '',
  registeredNumber: '',
  email: '',
  address1: '',
  city: '',
  country: '',
  postCode: '',
}

const loginInitialValues = {
  email: '',
  password: '',
}


const COMPONENTS_MAP: any = {
  CustomCheckbox: (props: any) => <Checkbox {...props} />,
}

export default function CustomerForm({
  type = 'register',
  isLoginSidebarOpen,
  onSubmit = () => { },
  btnText = "Register",
  email = '', // This prop contains the value of "Email Address" that is validated for availability at first step.
  b2bSettings = new Array<{ key: string; value: string }>(), // B2B settings passed from parent.
}: any) {
  const translate = useTranslation()
  const registerSchema = Yup.object({
    firstName: Yup.string().required(translate('common.message.profile.firstNameRequiredMsg')),
    lastName: Yup.string().required(translate('common.message.profile.lastNameRequiredMsg')),
    password: Yup.string().min(8,translate('common.message.profile.passwordMinLenghtMsg')).max(24,translate('common.message.profile.passwordMaxLengthMsg')).required(translate('common.message.profile.passwordRequiredMsg')),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')],translate('label.myAccount.passwordMustMatchText'))
      .required(),
  })

  const b2bRegisterSchema = Yup.object({
    isRequestTradingAccount: Yup.boolean(),
  
    companyName: Yup.string().when('isRequestTradingAccount', {
      is: (val: boolean) => val == true,
      then: Yup.string().required(translate('common.message.profile.companyNameRequiredMsg')),
    }), // Required validation of this field depends isRequestTradingAccount (i.e. when checked to TRUE)
  
    registeredNumber: Yup.string().when('isRequestTradingAccount', {
      is: (val: boolean) => val == true,
      then: Yup.string().required(translate('common.message.profile.registeredNumberRequiredMsg')),
    }), // Required validation of this field depends isRequestTradingAccount (i.e. when checked to TRUE)
  
    email: Yup.string().when('isRequestTradingAccount', {
      is: (val: boolean) => val == true,
      then: Yup.string().email(translate('common.message.profile.emailInvalidMsg')).max(255 , translate('common.message.profile.maxEmailLengthMsg') ).required(translate('common.message.profile.emailInputMsg')),
    }), // Required validation of this field depends isRequestTradingAccount (i.e. when checked to TRUE)
  
    address1: Yup.string().when('isRequestTradingAccount', {
      is: (val: boolean) => val == true,
      then: Yup.string().required(translate('common.message.profile.addressLine1RequiredMsg')),
    }), // Required validation of this field depends isRequestTradingAccount (i.e. when checked to TRUE)
  
    city: Yup.string().when('isRequestTradingAccount', {
      is: (val: boolean) => val == true,
      then: Yup.string().required(translate('common.message.profile.cityRequiredMsg')),
    }), // Required validation of this field depends isRequestTradingAccount (i.e. when checked to TRUE)
  
    country: Yup.string().when('isRequestTradingAccount', {
      is: (val: boolean) => val == true,
      then: Yup.string().required(translate('common.message.profile.countryRequiredMsg')),
    }), // Required validation of this field depends isRequestTradingAccount (i.e. when checked to TRUE)
  
    postCode: Yup.string().when('isRequestTradingAccount', {
      is: (val: boolean) => val == true,
      then: Yup.string().required(translate('common.message.profile.postCodeRequiredMsg')),
    }), // Required validation of this field depends isRequestTradingAccount (i.e. when checked to TRUE)
  })
  
  const loginSchema = Yup.object({
    email: Yup.string().email(translate('common.message.profile.emailInvalidMsg')).required(translate('common.message.profile.emailRequiredMsg')),
    password: Yup.string().min(8,translate('common.message.profile.passwordMinLenghtMsg') ).max(24,translate('common.message.profile.passwordMaxLengthMsg')).required(translate('common.message.profile.passwordRequiredText')),
  })
  

  const registrationConfig = useRegistrationConfig();
  const loginConfig = useLoginConfig();
  const b2bRegistrationConfig = useB2bRegistrationConfig();
  
  const VALUES_MAP: any = {
    register: {
      schema: registerSchema,
      initialValues: registerInitialValues,
      config: registrationConfig,
    },
    login: {
      schema: loginSchema,
      initialValues: loginInitialValues,
      config: loginConfig,
    },
  }
  const { config, initialValues, schema } = VALUES_MAP[type]
  
  // Read b2b enabled value from settings
  const b2bEnabled = b2bSettings?.length
  ? stringToBoolean(
    b2bSettings.find((x: any) => x.key === 'B2BSettings.EnableB2B')?.value
    )
    : false

  // Extend initial values based on form type & b2b setting.
  // Note: Values are extended for "registration" only, based on B2B settings.
  const extendedInitialValues =
    type === 'register'
      ? b2bEnabled
        ? {
          ...initialValues,
          ...b2bRegisterInitialValues,
          ...{ isRequestTradingAccount: b2bEnabled, email: email },
        }
        : initialValues
      : initialValues

  // Extend form config based on form type & b2b setting.
  // Note: Config is extended for "registration" only, based on B2B settings.
  const extendedConfig =
    type === 'register'
      ? b2bEnabled
        ? [...config, ...b2bRegistrationConfig]
        : config
      : config

  // Extend from schema based on form type & b2b setting.
  // Note: Schema is extended for "registration" only, based on B2B settings.
  const extendedSchema =
    type === 'register'
      ? b2bEnabled
        ? mergeSchema(schema, b2bRegisterSchema)
        : schema
      : schema

  return (
    <Formik validationSchema={extendedSchema} initialValues={extendedInitialValues} onSubmit={(values, actions) => { onSubmit(values, () => { actions.setSubmitting(false) }) }} >
      {({ errors, touched, handleSubmit, values, handleChange, isSubmitting, }: any) => {
        return (
          <div className={`flex flex-col items-center justify-center w-full lg:px-0 ${!isLoginSidebarOpen && `px-5`}`} >
            <Form onSubmit={handleSubmit} className={`w-full font-semibold ${!isLoginSidebarOpen && `sm:w-full`}`} >
              {extendedConfig.map((formItem: any, idx: number) => {
                function handleKeyPress(e: any) {
                  if (e.keyCode == 13) {
                    handleSubmit()
                  }
                }
                return (
                  <>
                    <div key={`${formItem.key}_${idx}`} className={`form-field mb-4 ${idx + 1}`} >
                      {formItem?.customComponent ? (COMPONENTS_MAP[formItem?.customComponent]({ formItem, values, handleChange, })) : (
                        !formItem?.show || (formItem?.show && formItem?.show(values)) ? (
                          <>
                            <label className="text-neutral-800 dark:text-neutral-800"> {formItem?.label} </label>
                            <Field key={idx} name={formItem?.key} placeholder={formItem?.placeholder} onChange={handleChange} value={values[formItem?.key]} onKeyUp={(e: any) => handleKeyPress(e)} type={formItem?.type} className="block w-full px-4 py-3 mt-1 text-sm font-normal bg-white border border-slate-300 focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 dark:border-neutral-700 dark:focus:ring-primary-6000 dark:text-black dark:focus:ring-opacity-25 dark:bg-white disabled:bg-neutral-200 dark:disabled:bg-neutral-800 rounded-2xl h-11 " />
                            {errors[formItem?.key] && touched[formItem?.key] ? (
                              <div className="mb-2 font-medium text-red-400 font-12">
                                {errors[formItem?.key]}
                              </div>
                            ) : null}
                          </>
                        ) : null
                      )}
                    </div>
                  </>
                )
              })}
              <div className={`flex items-center justify-center !w-full my-5 ${!isLoginSidebarOpen && `md:w-1/2`}`} >
                <Button type="submit" className="w-full border border-black btn btn-c btn-primary rounded-2xl" loading={isSubmitting} disabled={isSubmitting} >
                  {!isSubmitting && btnText}
                </Button>
              </div>
            </Form>
          </div>
        )
      }}
    </Formik>
  )
}
