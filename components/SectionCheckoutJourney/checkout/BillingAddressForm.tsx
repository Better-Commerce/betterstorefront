import React, { useEffect, useMemo, useState } from 'react'
import { useFormik } from 'formik'
import { addressFinderSchema, billingAddressWithPhoneCheckout2Schema } from './config'
import {
  BETTERCOMMERCE_DEFAULT_PHONE_COUNTRY_CODE,
  EmptyString,
} from '@components/utils/constants'
import { LoadingDots, useUI } from '@components/ui'
import { isMobile } from 'react-device-detect'
import { useTranslation } from '@commerce/utils/use-translation'
import { CheckoutStep } from '@framework/utils/enums'
import { retrieveAddress } from '@framework/utils/app-util'

export const DEFAULT_COUNTRY = 'United Kingdom'

const BillingAddressForm: React.FC<any> = ({
  editAddressValues,
  onSubmit,
  searchAddressByPostcode,
  onEditAddressToggleView,
  shippingCountries,
  billingCountries,
  useSameForBilling,
  shouldDisplayEmail = true,
  guestCheckoutFormik,
  onGuestCheckout,
  currentStep,
  featureToggle
}) => {
  const translate = useTranslation()
  const BILLING_ADDRESS_WITH_PHONE_CHECKOUT2_SCHEMA = billingAddressWithPhoneCheckout2Schema();
  const ADDRESS_FINDER_SCHEMA = addressFinderSchema();
  const { isGuestUser, user, setOverlayLoaderState } = useUI()
  const [isGuestCheckoutSubmit, setIsGuestCheckoutSubmit] = useState(false)
  const [searchedAddresses, setSearchedAddresses] = useState([])

  const addressFinderFormik = useFormik({
    initialValues: {
      postCode: EmptyString,
    },
    validationSchema: ADDRESS_FINDER_SCHEMA,
    onSubmit: async (values, { setSubmitting }) => {
      const payload: any = ADDRESS_FINDER_SCHEMA.cast(values)
      addressFinderFormik.setValues(payload)
      const searchAddressesResult = await searchAddressByPostcode(
        payload.postCode
      )
      setSearchedAddresses(searchAddressesResult || [])
      setSubmitting(false)
    },
  })

  const formik: any = useFormik({
    enableReinitialize: true,
    initialValues: {
      firstName: editAddressValues?.firstName || user?.firstName || EmptyString,
      lastName: editAddressValues?.lastName || user?.lastName || EmptyString,
      phoneNo:
        editAddressValues?.phoneNo ||
        user?.phoneNo ||
        user?.mobile ||
        EmptyString,
      companyName: editAddressValues?.companyName || EmptyString,
      postCode: editAddressValues?.postCode || EmptyString,
      address1: editAddressValues?.address1 || EmptyString,
      address2: editAddressValues?.address2 || EmptyString,
      address3: editAddressValues?.address3 || EmptyString,
      city: editAddressValues?.city || EmptyString,
      state: editAddressValues?.state || EmptyString,
      country: editAddressValues?.country || DEFAULT_COUNTRY,
    },
    validationSchema: BILLING_ADDRESS_WITH_PHONE_CHECKOUT2_SCHEMA,
    onSubmit: (values, { setSubmitting }) => {
      const payload: any =
        BILLING_ADDRESS_WITH_PHONE_CHECKOUT2_SCHEMA.cast(values)
      formik.setValues(payload)
      payload.countryCode = billingCountries?.find(
        (o: any) => o.name === payload.country
      )?.twoLetterIsoCode
      onSubmit(
        { ...payload, isBilling: true },
        true,
        () => {
          setSubmitting(false)
          formik.resetForm()
        },
        isGuestUser
      )
    },
  })

  const handleGuestWithAddressSubmit = async (e: any) => {
    e.preventDefault()
    setIsGuestCheckoutSubmit(false)
    if (guestCheckoutFormik) {
      setIsGuestCheckoutSubmit(true)
      const guestCheckoutErrors = await guestCheckoutFormik.validateForm()
      const addressErrors = await formik.validateForm()
      if (
        (!guestCheckoutErrors ||
          (guestCheckoutErrors &&
            Object.keys(guestCheckoutErrors).length == 0)) &&
        (!addressErrors ||
          (addressErrors && Object.keys(addressErrors).length == 0))
      ) {
        setOverlayLoaderState({ visible: true, message: 'Please wait...' })
        if (onGuestCheckout) {
          onGuestCheckout(guestCheckoutFormik.values, () => {
            formik.handleSubmit()
          })
        } else {
          formik.handleSubmit()
        }
      }
    } else {
      formik.handleSubmit()
    }
  }

  const handleSelectAddress = async (address: any) => {
    if (!address?.id) return
    const foundAddress: any = await retrieveAddress(address?.id)
    if (foundAddress) {
      setSearchedAddresses([])
      formik.setValues((prevValues:any) => ({
        ...prevValues,
        ...foundAddress, // foundAddress contains the address fields
      }))
      addressFinderFormik.setValues({ postCode: foundAddress?.postCode })
    }
  }

  const buttonText = useMemo(() => {
    if (currentStep === CheckoutStep.DELIVERY_TYPE_SELECT) {
      return translate('common.label.saveAndContinueBtnText')
    }
    return translate('label.checkout.saveAndContinueToDeliveryText')
  }, [currentStep, useSameForBilling, translate])

  return (
    <>
      {shouldDisplayEmail && (
        <div className="flex flex-col gap-0 p-2 my-2 border border-gray-200 rounded-md sm:my-4 sm:p-4 bg-gray-50">
          <span className="font-semibold text-black font-14 mob-font-12 dark:text-black">
            {user?.userEmail || user?.email}
          </span>
        </div>
      )}
      <div
        className={`${
          !useSameForBilling
            ? ''
            : 'sm:border sm:border-gray-200 sm:bg-gray-50 bg-white rounded-md sm:p-4'
        } flex flex-col gap-2 sm:mt-4 mt-3 sm:rounded-md sm:border border-transparent bg-white py-4 px-0`}
      >
        <h5 className="font-medium font-18 dark:text-black">
          {editAddressValues ? translate('common.label.editText') : ''} {translate('label.addressBook.BillingAddressHeadingText')}
        </h5>
        {/* address finder form */}
        <div className="border border-gray-200 sm:border-none sm:border-transparent rounded-md sm:rounded-none sm:p-0 p-3 mt-0 bg-[#fbfbfb] sm:bg-transparent">
        {(featureToggle?.features?.enableLoqateSearch || featureToggle?.features?.enableAddressIOSearch) && (
          <form
          onSubmit={addressFinderFormik.handleSubmit}
          className="flex items-start w-full gap-4 sm:mt-4"
        >
          <div className="">
            <input
              name="postCode"
              type="text"
              value={addressFinderFormik.values.postCode}
              onChange={addressFinderFormik.handleChange}
              placeholder="Enter your postcode"
              className="font-semibold text-black placeholder:text-gray-400 placeholder:font-normal checkout-input-field dark:bg-white dark:text-black input-check-default rounded"
            />
            {addressFinderFormik.errors.postCode &&
              addressFinderFormik.touched.postCode && (
                <span className="form-input-error">
                  {addressFinderFormik.errors.postCode}
                </span>
              )}
            {searchedAddresses?.length > 0 && (
              <div className="absolute z-10 p-4 mt-2 origin-top-right transform scale-100 bg-white border border-black rounded shadow-xl opacity-100 focus:outline-none">
                <div className="!max-h-80 overflow-y-scroll max-panel pr-4">
                  {searchedAddresses?.map(
                    (address: any, addressIdx: number) => {
                      return (
                        <AddressItem
                          option={address?.description}
                          optionIdx={addressIdx}
                          key={addressIdx}
                          address={address}
                          handleSelectAddress={handleSelectAddress}
                        />
                      )
                    }
                  )}
                </div>
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={addressFinderFormik.isSubmitting}
            className="border border-black btn-primary disabled:cursor-not-allowed disabled:opacity-60 btn-c btn-primary btn lg:py-2 py-3 sm:px-4 px-1"
          >
            {addressFinderFormik.isSubmitting ? (
              <LoadingDots />
            ) : isMobile ? (
              translate('common.label.findText')
            ) : (
              translate('common.label.findAddressText')
            )}
          </button>
          </form>
        )}
        {/* address form */}
        <form
          onSubmit={handleGuestWithAddressSubmit}
          className="flex flex-col w-full gap-1 mt-1 sm:gap-4 sm:mt-4"
        >
          <div className="grid grid-cols-1 gap-2 sm:gap-4 sm:grid-cols-12">
            <div className="relative mt-1 sm:col-span-12 custom-select">
              <select
                name="country"
                value={formik.values.country}
                onChange={formik.handleChange}
                className="checkout-input-field dark:bg-white dark:text-black"
              >
                <option value="">{translate('label.addressBook.selectCountryText')}</option>
                {billingCountries?.map((country: any, idx: number) => (
                  <option key={idx} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </select>
              {formik?.errors?.country && formik?.touched?.country && (
                <span className="form-input-error">
                  {formik?.errors?.country}
                </span>
              )}
            </div>
            <div className="sm:col-span-6">
              <input
                name="firstName"
                type="text"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                placeholder={translate('common.label.firstNameText')}
                className="font-medium text-black checkout-input-field dark:bg-white dark:text-black placeholder:text-gray-400 placeholder:font-normal input-check-default rounded"
              />
              {formik?.errors?.firstName && (
                <span className="form-input-error">
                  {formik?.errors?.firstName}
                </span>
              )}
            </div>
            <div className="sm:col-span-6">
              <input
                name="lastName"
                type="text"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                placeholder={translate('common.label.lastNameText')}
                className="font-medium text-black checkout-input-field dark:bg-white dark:text-black placeholder:text-gray-400 placeholder:font-normal input-check-default rounded"
              />
              {formik?.errors?.lastName /*&& formik?.touched?.lastName*/ && (
                <span className="form-input-error">
                  {formik?.errors?.lastName}
                </span>
              )}
            </div>
            <div className="sm:col-span-12">
              <input
                name="phoneNo"
                type="text"
                value={formik.values.phoneNo}
                onChange={formik.handleChange}
                className="font-medium text-black checkout-input-field dark:bg-white dark:text-black placeholder:text-gray-400 placeholder:font-normal input-check-default rounded"
                placeholder={translate('common.label.mobileNumText')}
                onKeyDown={(ev: any) => {
                  const target = ev?.target
                  if (target && target?.value) {
                    const txtPhoneNo: any = document.querySelector(
                      "input[name='phoneNo']"
                    )
                    if (txtPhoneNo) {
                      formik.setValues({
                        ...formik.values,
                        phoneNo: target?.value?.replace(
                          `+${BETTERCOMMERCE_DEFAULT_PHONE_COUNTRY_CODE}`,
                          '0'
                        ),
                      })
                    }
                  }
                }}
                onKeyUp={(ev: any) => {
                  const target = ev?.target
                  if (target && target?.value) {
                    const txtPhoneNo: any = document.querySelector(
                      "input[name='phoneNo']"
                    )
                    if (txtPhoneNo) {
                      formik.setValues({
                        ...formik.values,
                        phoneNo: target?.value?.replace(
                          `+${BETTERCOMMERCE_DEFAULT_PHONE_COUNTRY_CODE}`,
                          '0'
                        ),
                      })
                    }
                  }
                }}
              />
              {formik?.errors?.phoneNo /*&& formik?.touched?.phoneNo*/ && (
                <span className="form-input-error">
                  {formik?.errors?.phoneNo}
                </span>
              )}
            </div>
            <div className="sm:col-span-12">
              <input
                name="companyName"
                type="text"
                value={formik.values.companyName}
                onChange={formik.handleChange}
                placeholder={translate('common.label.companyNameAndVATNumText')}
                className="font-medium text-black checkout-input-field dark:bg-white dark:text-black placeholder:text-gray-400 placeholder:font-normal rounded"
              />
              {formik?.errors?.companyName && formik?.touched?.companyName && (
                <span className="form-input-error">
                  {formik.errors.companyName}
                </span>
              )}
            </div>
            <div className="sm:col-span-12">
              <input
                name="address1"
                type="text"
                value={formik.values.address1}
                onChange={formik.handleChange}
                placeholder={translate('common.label.addressLine1Text')}
                className="font-medium text-black checkout-input-field dark:bg-white dark:text-black placeholder:text-gray-400 placeholder:font-normal rounded"
              />
              {formik?.errors?.address1 /*&& formik?.touched?.address1*/ && (
                <span className="form-input-error">
                  {formik.errors.address1}
                </span>
              )}
            </div>
            <div className="sm:col-span-12">
              <input
                name="address2"
                type="text"
                value={formik.values.address2}
                onChange={formik.handleChange}
                className="font-medium text-black checkout-input-field dark:bg-white dark:text-black placeholder:text-gray-400 placeholder:font-normal rounded"
                placeholder={translate('common.label.addressLine2Text')}
              />
              {formik?.errors?.address2 && formik?.touched?.address2 && (
                <span className="form-input-error">
                  {formik?.errors?.address2}
                </span>
              )}
            </div>
            <div className="sm:col-span-12">
              <input
                name="address3"
                type="text"
                value={formik.values.address3}
                onChange={formik.handleChange}
                className="font-medium text-black checkout-input-field dark:bg-white dark:text-black placeholder:text-gray-400 placeholder:font-normal rounded"
                placeholder={translate('common.label.addressLine3Text')}
              />
              {formik?.errors?.address3 && formik?.touched?.address3 && (
                <span className="form-input-error">
                  {formik?.errors?.address3}
                </span>
              )}
            </div>
            <div className="sm:col-span-6">
              <input
                name="city"
                type="text"
                value={formik.values.city}
                onChange={formik.handleChange}
                className="font-medium text-black checkout-input-field dark:bg-white dark:text-black placeholder:text-gray-400 placeholder:font-normal rounded"
                placeholder={translate('common.label.cityText')}
              />
              {formik?.errors?.city /*&& formik?.touched?.city*/ && (
                <span className="form-input-error">{formik?.errors?.city}</span>
              )}
            </div>
            <div className="sm:col-span-6">
              <input
                name="postCode"
                type="text"
                value={formik.values.postCode}
                onChange={formik.handleChange}
                className="font-medium text-black checkout-input-field dark:bg-white dark:text-black placeholder:text-gray-400 placeholder:font-normal rounded"
                placeholder={translate('common.label.postcodeText')}
              />
              {formik?.errors?.postCode /*&& formik?.touched?.postCode*/ && (
                <span className="form-input-error">
                  {formik?.errors?.postCode}
                </span>
              )}
            </div>

            <div className="sm:col-span-12">
              <input
                name="state"
                type="text"
                value={formik.values.state}
                onChange={formik.handleChange}
                className="font-medium text-black checkout-input-field dark:bg-white dark:text-black placeholder:text-gray-400 placeholder:font-normal rounded"
                placeholder={translate('common.label.countyStateEtcText')}
              />
              {formik?.errors?.state && formik?.touched?.state && (
                <span className="form-input-error">
                  {formik?.errors?.state}
                </span>
              )}
            </div>
          </div>
          <div className="grid flex-col w-full gap-2 mt-4 sm:justify-end sm:gap-2 sm:flex-row sm:flex sm:w-auto">
            {onEditAddressToggleView && (
              <button
                className="border-black btn-primary-white btn"
                type="button"
                onClick={() => onEditAddressToggleView(undefined)}
              >
                {translate('common.label.cancelText')}
              </button>
            )}
            <button
              className="border border-black btn-primary disabled:cursor-not-allowed disabled:opacity-60 btn-c btn-primary btn lg:py-2 py-3 sm:px-4 px-1"
              type="submit"
              disabled={formik.isSubmitting}
            >
              {buttonText}
            </button>
          </div>
        </form>
        </div>
      </div>
    </>
  )
}

export default BillingAddressForm

const AddressItem = ({
  option,
  optionIdx,
  isChecked = false,
  address,
  handleSelectAddress,
}: any) => {
  const [isCheckboxChecked, setCheckbox] = useState(isChecked)

  useEffect(() => {
    setCheckbox(isChecked)
  }, [isChecked])

  const handleCheckbox = () => {
    setCheckbox(!isCheckboxChecked)
  }

  return (
    <div
      key={`option-right-value-${option.value}-${optionIdx}`}
      onClick={() => handleSelectAddress(address)}
      className={`flex items-center w-full px-2 py-3 mb-2 rounded border border-black`}
    >
      <input
        name={`${optionIdx}-input[]`}
        defaultValue={option.value}
        type="checkbox"
        className="w-4 h-4 border-gray-300 rounded filter-input"
      />
      <label
        htmlFor={`${optionIdx}-input[]`}
        onClick={handleCheckbox}
        className={`relative w-full ml-0 text-sm cursor-pointer filter-label`}
      >
        <div
          style={{
            content: '',
            top: '0',
            right: '0',
            float: 'right',
            height: '18px',
            width: '18px',
            borderRadius: '16px',
            background: `${isCheckboxChecked ? 'green' : 'white'}`,
            border: `${isCheckboxChecked ? 'none' : '1px solid black'}`,
            position: 'absolute',
            marginRight: '6px',
          }}
        />
        <span className="inline-block pr-7 dark:text-black">{option}</span>
        {isCheckboxChecked && (
          <div
            style={{
              content: '',
              float: 'right',
              right: '12px',
              top: '2px',
              zIndex: 99999,
              position: 'absolute',
              width: '6px',
              height: '10px',
              border: 'solid white',
              borderWidth: '0 2px 2px 0',
              transform: 'rotate(45deg)',
            }}
          />
        )}
      </label>
    </div>
  )
}
