// Base Imports
import React from 'react'

// Package Imports
import { useRouter } from 'next/router'

// Other Imports
import { useUI } from '@components/ui'
import { vatIncluded } from '@framework/utils/app-util'
import { eddDateFormat } from '@framework/utils/parse-util'
import PaymentMethodSelection from './PaymentMethodSelection'

interface ShippingMethod {
  id: string
  name: string
  description: string
  charge: number
}

interface Address {
  id: string
  addressLine1: string
  addressLine2?: string
  addressLine3?: string
  townCity: string
  countyStateProvince?: string
  postcode: string
  country: string
}

interface ReviewOrderProps {
  basket: any
  isApplePayScriptLoaded: boolean
  selectedDeliveryMethod?: ShippingMethod
  onPlaceOrder: () => void
  onPaymentMethodSelect: () => void
  readonly uiContext: any
  readonly setAlert: any
  setOverlayLoaderState: any
  hideOverlayLoaderState: any
  readonly generateBasketId: any
  goToStep: (step:string) => void
}

const ReviewOrder: React.FC<ReviewOrderProps> = ({
  basket,
  isApplePayScriptLoaded,
  selectedDeliveryMethod,
  onPlaceOrder,
  uiContext,
  setAlert,
  setOverlayLoaderState,
  hideOverlayLoaderState,
  generateBasketId,
  onPaymentMethodSelect,
  onEditAddressToggleView,
  goToStep
}: any) => {
  const isIncludeVAT = vatIncluded()
  const shippingMethod = basket?.shippingMethods?.find(
    (x: any) => x?.id === basket?.shippingMethodId
  )
  const { shippingAddress, billingAddress } = basket || {}
  const selectedAddress = { shippingAddress, billingAddress }
  return (
    <>
      <div className="flex flex-col gap-2 my-4 bg-white rounded-md sm:p-4 sm:border sm:border-gray-200 sm:bg-gray-50">
        <h5 className="px-0 font-semibold uppercase font-18 dark:text-black">
          Review & Payment
        </h5>
        <div className="p-2 sm:p-0 bg-[#fbfbfb] sm:bg-transparent border border-gray-200 sm:border-0 rounded-md sm:rounded-none">
          {selectedDeliveryMethod?.type === 1 && <div className="flex flex-col w-full pb-2 border-b border-gray-200 sm:pb-4">
            <div className="flex items-center justify-between w-full">
              <h5 className="mt-2 mb-2 font-normal text-gray-400 sm:font-medium sm:text-black font-14 mob-font-12 dark:text-black">
                Shipping Address
              </h5>
              <button
                className="justify-end font-semibold text-black font-12 hover:text-orange-600"
                onClick={() =>
                  onEditAddressToggleView(selectedAddress?.shippingAddress)
                }
              >
                Change
              </button>
            </div>
            {selectedAddress?.shippingAddress ? (
              <div className="flex gap-1 font-normal text-black font-12 dark:text-black">
                <span className="m-0">
                  {selectedAddress?.shippingAddress.firstName}{' '}
                  {selectedAddress?.shippingAddress.lastName}
                  {', '}
                  {selectedAddress?.shippingAddress.address1}
                  {', '}
                  {selectedAddress?.shippingAddress.address2 &&
                    `${selectedAddress?.shippingAddress.address2}, `}
                  {selectedAddress?.shippingAddress.address3 &&
                    `${selectedAddress?.shippingAddress.address3}, `}
                  {selectedAddress?.shippingAddress.city &&
                    `${selectedAddress?.shippingAddress.city}, `}
                  {selectedAddress?.shippingAddress.postCode &&
                    `${selectedAddress?.shippingAddress.postCode}`}
                </span>
              </div>
            ) : (
              <p>No address selected.</p>
            )}
          </div>}

          {selectedDeliveryMethod?.type === 1 && <div className="flex flex-col w-full pb-2 border-b border-gray-200 sm:pb-4">
            <div className="flex items-center justify-between w-full">
              <h5 className="mt-2 mb-2 font-normal text-gray-400 sm:font-medium sm:text-black font-14 mob-font-12 dark:text-black">
                Billing Address
              </h5>
              <button
                className="justify-end font-semibold text-black font-12 hover:text-orange-600"
                onClick={() =>
                  onEditAddressToggleView(
                    selectedAddress?.billingAddress,
                    'billing-address'
                  )
                }
              >
                Change
              </button>
            </div>
            {selectedAddress?.billingAddress ? (
              <div className="flex gap-1 font-normal text-black font-12 dark:text-black">
                <span className="m-0">
                  {selectedAddress?.billingAddress.firstName}{' '}
                  {selectedAddress?.billingAddress.lastName}
                  {', '}
                  {selectedAddress?.billingAddress.address1}
                  {', '}
                  {selectedAddress?.billingAddress.address2 &&
                    `${selectedAddress?.billingAddress.address2}, `}
                  {selectedAddress?.billingAddress.address3 &&
                    `${selectedAddress?.billingAddress.address3}, `}
                  {selectedAddress?.billingAddress.city &&
                    `${selectedAddress?.billingAddress.city}, `}
                  {selectedAddress?.billingAddress.postCode &&
                    `${selectedAddress?.billingAddress.postCode}`}
                </span>
              </div>
            ) : (
              <p>No address selected.</p>
            )}
          </div>}

          <div className="flex flex-col w-full">
          <div className="flex items-center justify-between w-full">
              <h5 className="mt-2 mb-2 font-normal text-gray-400 sm:font-medium sm:text-black font-14 mob-font-12 dark:text-black">
               Shipping Method
              </h5>
              <button
                className="justify-end font-semibold text-black font-12 hover:text-orange-600"
                onClick={() =>
                  goToStep('delivery')
                }
              >
                Change
              </button>
            </div>
            <div className="flex items-start justify-between pb-2 rounded cursor-pointer sm:pb-0">
              <span className="font-medium text-black dark:text-black">
                {shippingMethod?.displayName}
                {basket?.estimatedDeliveryDate && (
                  <span className="block font-normal font-12 text-wrap-p">
                    Expected Delivery Date:{' '}
                    <span className="font-bold">
                      {eddDateFormat(basket?.estimatedDeliveryDate)}{' '}
                    </span>
                  </span>
                )}
              </span>
              <span className="font-bold text-black font-12 dark:text-black">
                {basket?.shippingCharge?.raw?.withTax == 0
                  ? 'FREE'
                  : isIncludeVAT
                  ? basket?.shippingCharge?.formatted?.withTax
                  : basket?.shippingCharge?.formatted?.withoutTax}
              </span>
            </div>
          </div>
        </div>
      </div>
      <PaymentMethodSelection
        basket={basket}
        isApplePayScriptLoaded={isApplePayScriptLoaded}
        uiContext={uiContext}
        setAlert={setAlert}
        selectedDeliveryMethod={selectedDeliveryMethod}
        setOverlayLoaderState={setOverlayLoaderState}
        hideOverlayLoaderState={hideOverlayLoaderState}
        generateBasketId={generateBasketId}
        onPaymentMethodSelect={onPaymentMethodSelect}
      />
      {/*<button className='w-full mb-4 border border-black sm:mt-4 btn-primary-green' onClick={onPlaceOrder}>Place Order</button>*/}
    </>
  )
}

export default ReviewOrder
