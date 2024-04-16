import React, { useState } from 'react'
import { Formik, Form, Field } from 'formik'
import { useDetailsFormConfig, useSchema } from './configs/details'
import { useUI } from '@components/ui/context'
import { useHandleSubmit } from './common'
import eventDispatcher from '@components/services/analytics/eventDispatcher'
import { EVENTS_MAP } from '@components/services/analytics/constants'
import { Button } from '@components/ui'
import Link from 'next/link'
import { findByFieldName } from '@framework/utils/app-util'
import FormField from '@components/utils/FormField'
import { Messages } from '@components/utils/constants'
import { useTranslation } from '@commerce/utils/use-translation'

export default function MyDetails({ handleToggleShowState }: any) {
  const handleSubmit = useHandleSubmit();
  const translate = useTranslation();
  const schema = useSchema();
  const formConfig = useDetailsFormConfig();
  const [title, setTitle] = useState(translate('label.myAccount.myDetailsHeadingText'))
  const { user, setUser } = useUI()
  const { CustomerUpdated } = EVENTS_MAP.EVENT_TYPES

  const ContactNumberLenCheck: any = 10

  const formikHandleChange = (e: any, handleFunction: any) => {
    if (e.target.name === 'phone' || e.target.name === 'mobile') {
      //Regex to check if the value consists of an alphabet or a character
      e.target.value = e.target.value
        ? e.target.value.replace(
          Messages.Validations.RegularExpressions.CHARACTERS_AND_ALPHABETS,
          ''
        )
        : ''
      if (e.target.value.length <= ContactNumberLenCheck) {
        handleFunction(e)
      }
    } else {
      handleFunction(e)
    }
  }
  const initialValues = {
    email: user?.email,
    firstName: user?.firstName,
    lastName: user?.lastName,
    mobile: user?.mobile,
    telephone: user?.telephone,
    gender: user?.gender
      ? user?.gender
      : findByFieldName(formConfig, 'gender')?.options?.length
        ? ''
        : '',
  }

  const handleDataSubmit = async (values: any) => {
    await handleSubmit(values, user, setUser, setTitle)
    eventDispatcher(CustomerUpdated, {
      entity: JSON.stringify({
        id: user.userId,
        name: user.username,
        dateOfBirth: user.yearOfBirth,
        gender: user.gender,
        email: user.email,
        postCode: user.postCode,
      }),
      entityId: user.userId,
      entityName: user.firstName + user.lastName,
      eventType: CustomerUpdated,
    })
  }

  return (
    <main className="space-y-10 sm:space-y-12">
      <div className=''>
        <h2 className="text-2xl sm:text-3xl font-semibold">
          Account infomation
        </h2>
        <p className="mt-2 text-sm text-black font-normal">
          {translate('label.myAccount.editYourDetailsText')}
        </p>
      </div>
      <div className="mx-2">
        <div className="max-w-4xl lg:mx-12 xs:ml-6">
          <div className="lg:px-0 sm:px-0 pt-5">
          </div>
        </div>
        <div className='flex flex-col md:flex-row'>
          <div className="flex-shrink-0 flex items-start">
            {/* AVATAR */}
            <div className="relative border rounded-full overflow-hidden flex">
              <img
                src="/assets/user-avatar.png"
                alt="avatar"
                width={128}
                height={128}
                className="w-32 h-32 rounded-full object-cover z-0"
              />
            </div>
          </div>
          <div className='flex-grow mt-10 md:mt-0 md:pl-16 max-w-3xl space-y-6'>
            <Formik
              enableReinitialize={true}
              validationSchema={schema}
              initialValues={initialValues}
              onSubmit={handleDataSubmit}
            >
              {(context) => {
                const {
                  errors,
                  touched,
                  handleSubmit,
                  values,
                  handleChange,
                  isSubmitting,
                }: any = context
                return (
                  <Form className="font-normal w-full flex-grow mt-10 md:mt-0 max-w-3xl space-y-6">
                    {formConfig?.map((formItem: any, idx: number) => {
                      return (
                        formItem.type !== 'singleSelectButtonGroup' && (
                          <div key={`${formItem.label}_${idx}`}>
                            <label className="nc-Label text-base font-medium text-neutral-900 dark:text-neutral-200 ">
                              {formItem.label}
                            </label>
                            <div className="mt-1.5 flex icon-input-form">
                              <span className="inline-flex items-center px-2.5 rounded-l-2xl border border-r-0 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-sm">
                                <i className={`${formItem.placeholder} text-2xl las`}></i>
                              </span>
                              <Field
                                key={idx}
                                name={formItem.name}
                                placeholder={formItem.placeholder}
                                onChange={(e: any) =>
                                  formikHandleChange(e, handleChange)
                                }
                                value={values[formItem.name]}
                                type={formItem.type}
                                maxLength={formItem.maxLength}
                                className="block !rounded-l-none mt-0 w-full border outline-none border-neutral-200 focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 bg-white dark:border-neutral-700 dark:focus:ring-primary-6000 dark:focus:ring-opacity-25 dark:bg-neutral-900 disabled:bg-neutral-200 dark:disabled:bg-neutral-800 rounded-2xl text-sm font-normal h-11 px-4 py-3"
                              />

                              {errors[formItem.name] && touched[formItem.name] && (
                                <div className="text-red-400 text-xs mb-2">
                                  {errors[formItem.name]}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      )
                    })}
                    {(formConfig?.length
                      ? Array.from<any>([]).concat([
                        findByFieldName(formConfig, 'gender'),
                      ])
                      : []
                    )?.map((item: any, idx: number) => (
                      <div
                        key={item?.name}
                        className="w-full py-4 address-type"
                      >
                        {<FormField context={context} item={item} />}
                      </div>
                    ))}
                    <div className="mt-10 flex sm:flex-col1 w-60">
                      <Button
                        type="submit"
                        onClick={handleSubmit}
                        className="nc-Button relative h-auto inline-flex items-center justify-center rounded-full transition-colors text-sm sm:text-base font-medium py-3 px-4 sm:py-3.5 sm:px-6  ttnc-ButtonPrimary disabled:bg-opacity-90 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 text-slate-50 dark:text-slate-800 shadow-xl  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-6000 dark:focus:ring-offset-0"
                        loading={isSubmitting}
                        disabled={isSubmitting}
                      >
                        {!isSubmitting && translate('common.label.saveChangesText')}
                      </Button>
                    </div>
                  </Form>
                )
              }}
            </Formik>
          </div>
        </div>

      </div>
    </main>
  )
}
