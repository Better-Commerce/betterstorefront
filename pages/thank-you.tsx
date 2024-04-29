/* This example requires Tailwind CSS v2.0+ */
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useUI } from '@components/ui/context'
import Link from 'next/link'
import axios from 'axios'
import { Transition, Dialog } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Fragment } from 'react'
import {
  NEXT_REFERRAL_BY_EMAIL, NEXT_REFERRAL_INVITE_SENT, NEXT_REFERRAL_INFO, FACEBOOK_SHARE_STRING,
  TWITTER_SHARE_STRING, NEXT_GET_ORDER, NEXT_GET_ORDERS, EmptyString, BETTERCOMMERCE_DEFAULT_LANGUAGE
} from '@components/utils/constants'
import { Button, LoadingDots } from '@components/ui'
import { } from '@components/utils/constants'
import { removeItem } from '@components/utils/localStorage'
import { ELEM_ATTR, ORDER_CONFIRMATION_AFTER_PROGRESS_BAR_ELEM_SELECTORS } from '@framework/content/use-content-snippet'
import { generateUri } from '@commerce/utils/uri-util'
import { LocalStorage } from '@components/utils/payment-constants'
import { vatIncluded } from '@framework/utils/app-util'
import classNames from 'classnames'
import { eddDateFormat, parseItemId, stringFormat, stringToBoolean } from '@framework/utils/parse-util'
import NonHeadContentSnippet from '@old-components/common/Content/NonHeadContentSnippet'
import { useTranslation } from '@commerce/utils/use-translation'
import { IMG_PLACEHOLDER } from '@components/utils/textVariables'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import SplitDeliveryOrderItems from '@components/SectionCheckoutJourney/cart/SplitDeliveryOrderItems'

export default function OrderConfirmation({ config }: any) {
  const [order, setOrderData] = useState<any>()
  const [isSnippetLoaded, setIsSnippetLoaded] = useState(false)
  const [snippets, setSnippets] = useState(new Array<any>())
  const [isLoading, setIsLoading] = useState(true)
  const [isReferModalOpen, setIsReferModalOpen] = useState(false)
  const [shareReferralView, setShareReferralView] = useState(false)
  const translate = useTranslation()
  const [referralObj, setReferralObj] = useState({
    id: '',
    userId: '',
    name: '',
    slug: '',
    invitesSent: 0,
    clickOnInvites: 0,
    successfulInvites: 0,
  })
  const [referralOffers, setReferralOffers] = useState<any>(null)
  const [shareMethod, setShareMethod] = useState('')
  const [referralLink, setReferralLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [isReferralSlugLoading, setIsReferralSlugLoading] = useState(false)
  const {
    setOrderId,
    orderId,
    user,
    setGuestUser,
    setIsGuestUser,
    guestUser,
    isGuestUser,
    resetIsPaymentLink,
  } = useUI()
  const shareOptionsConfig = [
    {
      name: 'email',
      onClick: () => {
        setShareMethod('email')
        handleInviteSent()
      },
      icon: (
        <Link
          href={`mailto:?body=${referralOffers?.refereePromo}, Just use the following link: ${referralLink}&subject=Your friend has sent you a gift!`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6"
          >
            <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
            <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
          </svg>
        </Link>
      ),
    },
    {
      name: 'facebook',
      onClick: () => {
        setShareMethod('facebook')
        handleInviteSent()
        window.open(
          `${FACEBOOK_SHARE_STRING}?u=${referralLink}&quote='Referral Link'`
        )
      },
      icon: (
        <svg
          viewBox="-5 0 20 20"
          className="w-6 h-6"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          fill="#000000"
        >
          <g id=" " strokeWidth="0"></g>
          <g id=" " strokeLinecap="round" strokeLinejoin="round"></g>
          <g id=" ">
            <defs> </defs>{' '}
            <g
              id="Page-1"
              stroke="none"
              strokeWidth="1"
              fill="none"
              fillRule="evenodd"
            >
              {' '}
              <g
                id="Dribbble-Light-Preview"
                transform="translate(-385.000000, -7399.000000)"
                fill="#000000"
              >
                {' '}
                <g id="icons" transform="translate(56.000000, 160.000000)">
                  {' '}
                  <path
                    d="M335.821282,7259 L335.821282,7250 L338.553693,7250 L339,7246 L335.821282,7246 L335.821282,7244.052 C335.821282,7243.022 335.847593,7242 337.286884,7242 L338.744689,7242 L338.744689,7239.14 C338.744689,7239.097 337.492497,7239 336.225687,7239 C333.580004,7239 331.923407,7240.657 331.923407,7243.7 L331.923407,7246 L329,7246 L329,7250 L331.923407,7250 L331.923407,7259 L335.821282,7259 Z"
                    id="facebook-[#176]"
                  >
                    {' '}
                  </path>{' '}
                </g>{' '}
              </g>{' '}
            </g>{' '}
          </g>
        </svg>
      ),
    },
    {
      name: 'twitter',
      onClick: () => {
        setShareMethod('twitter')
        handleInviteSent()
        window.open(
          `${TWITTER_SHARE_STRING}?url=${referralLink}&text=Referral Link`
        )
      },
      icon: (
        <svg
          fill="#000000"
          className="w-6 h-6"
          viewBox="0 0 256 256"
          id="Flat"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></g>
          <g id="SVGRepo_iconCarrier">
            {' '}
            <path d="M245.65723,77.65674l-30.16407,30.16455C209.4707,177.70215,150.53809,232,80,232c-14.52441,0-26.49414-2.30273-35.57764-6.84473-7.33056-3.665-10.33349-7.59912-11.07861-8.71777a8,8,0,0,1,3.84717-11.92822c.25732-.09717,23.84814-9.15772,39.09521-26.40869a109.574,109.574,0,0,1-24.72656-24.355c-13.708-18.60352-28.206-50.91114-19.43066-99.17676a8.00023,8.00023,0,0,1,13.52832-4.22559c.35254.35156,33.64209,33.1709,74.3374,43.772L120,87.99609a48.31863,48.31863,0,0,1,48.6084-47.99267,48.11329,48.11329,0,0,1,40.96875,23.99609L240,64a8.0001,8.0001,0,0,1,5.65723,13.65674Z"></path>{' '}
          </g>
        </svg>
      ),
    },
  ]

  const handleInviteSent = async () => {
    let acknowledge = await axios.post(NEXT_REFERRAL_INVITE_SENT, {
      referralId: referralObj?.id,
    })
  }

  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }
  const isIncludeVAT = vatIncluded()
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== undefined) {
      const hostname =
        typeof window !== 'undefined' && window.location.hostname
          ? window.location.hostname
          : ''
      setReferralLink(
        'https://' + hostname + '/?referral-code=' + (referralObj?.slug || '')
      )
    }
  }, [referralObj?.slug])

  const [isNextorderPromo, setIsNextOrderPromo] = useState(false)
  const [nextOrderPromo, setNextOrderPromo] = useState({
    isNextPromoEnabled: false,
    nextOrderPromoName: '',
    nextOrderPromoId: '',
    nextOrderPromoValidity: '',
    firstOrderSetting: false,
    everyOrderSetting: false,
  })
  const [isFirstOrderValid, setIsFirstOrderValid] = useState(false)

  useEffect(() => {
    const fetchNextOrderPromo = async () => {
      try {
        let nextOrderConfig = { ...config }
        const getPromotionConfig = (key: any) =>
          nextOrderConfig?.configSettings
            ?.find((x: any) => x.configType === 'PromotionSettings')
            ?.configKeys?.find((x: any) => x.key === key)?.value

        const isNextPromoEnabled = stringToBoolean(
          getPromotionConfig('PromotionSettings.EnableNextPurchasePromotion')
        )
        const nextOrderPromoName = getPromotionConfig(
          'PromotionSettings.PromotionName'
        )
        const nextOrderPromoId = getPromotionConfig(
          'PromotionSettings.PromotionId'
        )
        const nextOrderPromoValidity = getPromotionConfig(
          'PromotionSettings.VoucherValidityDays'
        )
        const firstOrderSetting = stringToBoolean(
          getPromotionConfig('PromotionSettings.SentWithFirstOrder')
        )
        const everyOrderSetting = stringToBoolean(
          getPromotionConfig('PromotionSettings.SentWithEveryOrder')
        )

        const nextOrderPromoDetails = {
          isNextPromoEnabled,
          nextOrderPromoName,
          nextOrderPromoId,
          nextOrderPromoValidity,
          firstOrderSetting,
          everyOrderSetting,
        }
        if (nextOrderPromoDetails?.isNextPromoEnabled) {
          setIsNextOrderPromo(nextOrderPromoDetails?.isNextPromoEnabled)
          setNextOrderPromo(nextOrderPromoDetails)
          if (nextOrderPromoDetails?.firstOrderSetting) {
            firstOrderCheck()
          }
        }
      } catch (error) {
        console.error(error)
      }
    }

    fetchNextOrderPromo()
  }, [])

  const firstOrderCheck = async () => {
    let userInfo = user?.userId ? { ...user } : { ...guestUser }
    let { data } = await axios.post(NEXT_GET_ORDERS, {
      id: userInfo.userId,
      hasMembership: userInfo.hasMembership,
    })
    if (data?.length) {
      setIsFirstOrderValid(false)
    } else {
      setIsFirstOrderValid(true)
    }
  }

  useEffect(() => {
    const fetchOrder = async () => {
      const { data }: any = await axios.post(NEXT_GET_ORDER, {
        id: orderId,
      })
      setOrderData(data.order)
      setTimeout(() => {
        setSnippets(data?.snippets || [])
      }, 100);
      setIsLoading(false)
    }
    removeItem(LocalStorage.Key.ORDER_RESPONSE)
    removeItem(LocalStorage.Key.ORDER_PAYMENT)
    resetIsPaymentLink()
    // setGuestUser({})
    // setIsGuestUser(false) 
    if (orderId) fetchOrder()
    if (!orderId) setIsLoading(false)
    return function cleanup() {
      setOrderId('')
    }
  }, [])

  useEffect(() => {
    if (snippets?.length > 0) {
      setIsSnippetLoaded(true)
    }
  }, [snippets])

  const setModelClose = () => {
    setIsReferModalOpen(false)
  }

  const handleReferralByEmail = async () => {
    // setIsReferModalOpen(true)
    let referrerEmail = user?.email
    setIsReferralSlugLoading(true)
    let { data: data } = await axios.post(NEXT_REFERRAL_BY_EMAIL, {
      email: referrerEmail,
    })
    if (data?.referralDetails?.id) {
      setReferralObj(data?.referralDetails)
      setIsReferralSlugLoading(false)
    } else {
      setIsReferralSlugLoading(false)
    }
  }

  const handleReferralInfo = async () => {
    let { data: data } = await axios.get(NEXT_REFERRAL_INFO)
    if (data?.referralDetails?.referrerPromo && !isGuestUser) {
      //rm user?.email if guest user can refer
      setReferralOffers(data?.referralDetails)
      setIsReferModalOpen(true)
      handleReferralByEmail()
    }
  }

  useEffect(() => {
    handleReferralInfo()
  }, [])

  useEffect(() => {
    const itemsFromArr = []
    if( order?.items ){
      const iterator = order?.items?.values();
      for (const value of iterator) {
        itemsFromArr?.push({
          id: parseItemId(value?.stockCode) || EmptyString,
          name: value?.name || EmptyString,
          quantity: value?.qty || 1,
          price: value?.totalPrice?.raw?.withTax || 1,
          line_price: value?.totalPrice?.raw?.withTax * value?.qty,
          sku: value?.sku || EmptyString
        })
      }
    }
    const orderData = {
      item_id: "thankyou",
      order_id: order?.orderNo || EmptyString,
      order_price: order?.grandTotal?.raw?.withTax,
      order_shipping_zip: order?.shippingAddress?.postCode || EmptyString, 
      order_shipping_city: order?.shippingAddress?.city || EmptyString, 	
      payment_transactions:  [{
          amount: order?.payments ? order?.payments[0]?.orderAmount : EmptyString, 
          gateway: order?.payments ? order?.payments[0]?.paymentGateway : EmptyString, 
          status:"paid"
      }],
      coupons:  [{
          code: '',
          discount_amt:  order?.discount?.raw?.withTax
      }],
      item_ids: order?.items?.map((x:any) =>  parseItemId(x?.stockCode)) || [],
      items: itemsFromArr,
      customer: {
        id: order?.customerId || EmptyString,
        f_name: order?.billingAddress?.firstName || EmptyString,
        l_name: order?.billingAddress?.lastName || EmptyString,
        email: order?.customer?.username || EmptyString,
        contact_no: order?.billingAddress?.phoneNo || EmptyString
      }
    }
    if( window !== undefined && window?.ch_session && order?.orderNo){
      window.ch_purchase_complete_before(orderData)
    }
  },[order?.orderNo])

  if (isLoading) {
    return (
      <main className="px-4 pt-16 pb-24 bg-white sm:px-6 sm:pt-24 lg:px-8 lg:py-32">
        <h2 className="w-full text-5xl font-extrabold text-center text-gray-600 uppercase tracking-light">
          {translate('label.checkout.loadingYourOrderText')}
        </h2>
        <div className="flex items-center justify-center w-full mt-10 text-gray-900">
          <LoadingDots />
        </div>
      </main>
    )
  }
  const css = { maxWidth: '100%', height: 'auto' }

  const getPaymentMethodName = (payments: any) => {
    return (
      payments?.find(
        (x: any) => x?.isValid /* && x?.status === PaymentStatus.PAID */
      )?.paymentGateway || EmptyString
    )
  }

  const bodyStartScrCntrRef = React.createRef<any>()
  const bodyEndScrCntrRef = React.createRef<any>()


  return (
    <>
      <div
        ref={bodyStartScrCntrRef}
        className={`${ELEM_ATTR}body-start-script-cntr-pc`}
      ></div>
      <main className="px-4 pt-6 pb-10 sm:pb-24 bg-gray-50 sm:px-6 sm:pt-6 lg:px-8 lg:py-2">
        <div className="max-w-3xl p-4 mx-auto bg-white rounded-md shadow-lg">
          <div className="max-w-xl">
            <p className="text-sm font-semibold tracking-wide text-indigo-600 uppercase">
              {order?.orderNo ? translate('label.thankyou.thankyouText') : null}
            </p>
            <h1 className="mt-2 font-bold tracking-tight text-black uppercase">
              {order?.orderNo ? translate('label.thankyou.itsOnTheWayText') : translate('label.thankyou.noOrderProvidedText')}
            </h1>
            {order?.orderNo ? (
              <p className="mt-2 text-black">
                  {translate('label.checkout.yourOrderText')}{' '}
                <span className="font-bold text-black">{order?.orderNo}</span>{' '}
                  {translate('label.thankyou.willBeWithYouSoonText')}
              </p>
            ) : null}
          </div>
          {order?.orderNo ? (
            <section
              aria-labelledby="order-heading"
              className="mt-10 border-t border-gray-200"
            >
              <h2 id="order-heading" className="sr-only">
                {translate('label.checkout.yourOrderText')}
              </h2>

              <h3 className="sr-only">{translate('common.label.itemPluralText')}</h3>
              {order?.deliveryPlans?.length < 1 ? order?.items?.map((product: any) => (
                <>
                  <div
                    key={product.id}
                    className="flex py-10 space-x-6 border-b border-gray-200"
                  >
                    <div className="flex-shrink-0 w-24 h-24 overflow-hidden border border-gray-200 rounded-md">
                      <img
                        style={css}
                        src={
                          generateUri(product.image, 'h=200&fm=webp') ||
                          IMG_PLACEHOLDER
                        }
                        width={200}
                        height={200}
                        alt={product.name || 'thank you'}
                        className="flex-none object-cover object-center w-20 h-20 bg-gray-100 rounded-lg sm:w-40 sm:h-40"
                      />
                    </div>
                    <div className="flex flex-col flex-auto">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          <Link href={`/${product.slug}`}>{product.name}</Link>
                        </h4>
                        <p className="mr-1 text-sm font-medium text-gray-700">
                          {translate('label.thankyou.sizeText')}:{' '}
                          <span className="uppercase">{product.size}</span>
                        </p>
                      </div>
                      <div className="flex items-end mt-2">
                        <dl className="flex space-x-4 text-sm divide-x divide-gray-200 sm:space-x-6">
                          <div className="flex">
                            <dt className="font-medium text-gray-900">
                              {translate('common.label.quantityText')}
                            </dt>
                            <dd className="ml-2 text-gray-700">
                              {product.qty}
                            </dd>
                          </div>
                          <div className="flex pl-4 sm:pl-6">
                            <dt className="font-medium text-gray-900">
                              {translate('common.label.priceText')}
                            </dt>
                            <dd className="ml-2 text-gray-700">
                              {product?.price?.raw?.withTax > 0 ? product.price.formatted.withTax :<span className='font-medium uppercase text-14 xs-text-14 text-emerald-600'>{translate('label.orderSummary.freeText')}</span>}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  </div>
                </>
              )) : (
                <SplitDeliveryOrderItems order={order} />
              )}

              <div className="border-t border-gray-200 lg:pl-5 sm:pl-2 ">
                <h3 className="sr-only">{translate('common.label.yourInfoText')}</h3>

                <h4 className="sr-only">{translate('label.checkout.addressesText')}</h4>
                <dl className="grid grid-cols-2 py-10 text-sm gap-x-6">
                  <div>
                    <dt className="font-bold text-gray-900">
                      {/* {GENERAL_SHIPPING_ADDRESS} */}
                      {translate('label.orderDetails.deliveryAddressHeadingText')}
                    </dt>
                    <dd className="mt-2 text-gray-700">
                      <address className="not-italic">
                        <span className="block">{`${order?.shippingAddress.firstName} ${order?.shippingAddress.lastName}`}</span>
                        <span className="block">{`${order?.shippingAddress?.phoneNo}`}</span>
                        <span className="block">{`${order?.shippingAddress?.address1}`}</span>
                        <span className="block">{`${order?.shippingAddress?.address2}`}</span>
                        <span className="block">{`${order?.shippingAddress?.city} ${order?.shippingAddress?.countryCode} ${order?.shippingAddress?.postCode}`}</span>
                      </address>
                    </dd>
                  </div>
                  {/* <div>
                    <dt className="font-medium text-gray-900">
                      {GENERAL_BILLING_ADDRESS}
                    </dt>
                    <dd className="mt-2 text-gray-700">
                      <address className="not-italic">
                        <span className="block">{`${order?.billingAddress?.firstName} ${order?.billingAddress?.lastName}`}</span>
                        <span className="block">{`${order?.shippingAddress?.phoneNo}`}</span>
                        <span className="block">{`${order?.billingAddress?.address1}`}</span>
                        <span className="block">{`${order?.billingAddress?.address2}`}</span>
                        <span className="block">{`${order?.billingAddress?.city} ${order?.billingAddress?.countryCode} ${order?.billingAddress?.postCode}`}</span>
                      </address>
                    </dd>
                  </div> */}
                </dl>

                <h4 className="sr-only">{translate('label.checkout.paymentHeadingText')}</h4>
                <dl className="grid grid-cols-2 py-10 text-sm border-t border-gray-200 gap-x-6">
                  {order?.payments && (
                    <div>
                      <dt className="font-bold text-gray-900">
                        {translate('label.checkout.paymentMethodText')}
                      </dt>
                      <dd className="mt-2 text-gray-700">
                        <p>{getPaymentMethodName(order?.payments)}</p>
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="font-bold text-gray-900">
                      {translate('label.checkout.shippingMethodText')}
                    </dt>
                    <dd className="mt-2 text-gray-700">
                      <p>{order?.shipping?.displayName}</p>
                      <p>
                        {translate('label.thankyou.deliverdText')}:{' '}
                        {order?.deliveryPlans?.length >= 1 ? (
                          <p className="font-semibold uppercase font-24 dark:text-black">
                            {eddDateFormat(
                              order?.deliveryPlans[0].deliveryDateTarget
                            )}
                          </p>
                        ) : (
                          <p className="font-semibold uppercase font-14 dark:text-black">
                            {eddDateFormat(
                              order?.shipping?.expectedDeliveryDate
                            )}
                          </p>
                        )}
                      </p>
                    </dd>
                  </div>
                </dl>
                {isNextorderPromo &&
                  nextOrderPromo?.firstOrderSetting &&
                  !isFirstOrderValid && (
                    <div className="py-2 my-2 text-sm font-semibold text-center bg-lime-100">
                      <p className="">
                      {translate('label.thankyou.congratilationDiscountText')}{' '}
                        <span className="font-bold text-indigo-600">
                          {nextOrderPromo?.nextOrderPromoName}
                        </span>
                      </p>
                      <p>
                        {stringFormat(translate('label.thankyou.yourOfferIsValidText'), {
                          days: nextOrderPromo?.nextOrderPromoValidity,
                        })}
                      </p>
                    </div>
                  )}
                {isNextorderPromo &&
                  nextOrderPromo?.everyOrderSetting &&
                  !isFirstOrderValid && (
                    <div className="py-2 my-2 text-sm font-semibold text-center bg-lime-100">
                      <p className="">
                      {translate('label.thankyou.congratilationDiscountText')}{' '}
                        <span className="font-bold text-indigo-600">
                          {nextOrderPromo?.nextOrderPromoName}
                        </span>
                      </p>
                      <p>
                        {stringFormat(translate('label.thankyou.yourOfferIsValidText'), {
                          days: nextOrderPromo?.nextOrderPromoValidity,
                        })}
                      </p>
                    </div>
                  )}
                <h3 className="sr-only">{translate('label.thankyou.summaryText')}</h3>
                <dl className="pt-10 space-y-6 text-sm border-t border-gray-200">
                  <div className="flex justify-between">
                    <dt className="font-medium text-gray-900">
                      {isIncludeVAT
                        ? translate('label.orderSummary.subTotalVATIncText')
                        : translate('label.orderSummary.subTotalVATExText')}
                    </dt>
                    <dd className="text-gray-700">
                      {isIncludeVAT
                        ? order?.subTotal?.formatted?.withTax
                        : order?.subTotal?.formatted?.withoutTax}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-gray-900">
                      {translate('label.orderSummary.shippingText')}
                    </dt>
                    <dd className="text-gray-700">
                      {isIncludeVAT
                        ? order?.shippingCharge.formatted?.withTax
                        : order?.shippingCharge.formatted?.withoutTax}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-gray-900">{translate('label.orderSummary.taxText')}</dt>
                    <dd className="text-gray-700">
                      {order?.grandTotal.formatted?.tax}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-lg font-bold text-gray-900">
                      {translate('label.orderSummary.totalText')}
                    </dt>
                    <dd className="text-lg font-bold text-gray-900">
                      {isIncludeVAT
                        ? order?.grandTotal?.formatted?.withTax
                        : order?.grandTotal?.formatted?.withTax}
                    </dd>
                  </div>
                </dl>
              </div>
            </section>
          ) : null}
          <div className="max-w-xl mt-5 text-center">
            <Link href={`/`} passHref>
              <span className="btn-primary btn">
                {translate('common.label.backToHomeText')}
              </span>
            </Link>
          </div>
        </div>
      </main>

      {/* Placeholder for order confirmation after progress bar snippet */}
      <div
        className={`${ELEM_ATTR}${ORDER_CONFIRMATION_AFTER_PROGRESS_BAR_ELEM_SELECTORS[0]}`}
      ></div>
      <Transition.Root show={isReferModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 overflow-hidden z-999"
          onClose={() => setModelClose()}
        >
          <div className="absolute inset-0 overflow-hidden z-999">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay
                className="w-full h-screen bg-black opacity-50"
                onClick={() => setModelClose()}
              />
            </Transition.Child>

            <div className="fixed inset-0 flex items-center justify-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="w-screen max-w-xl">
                  <div className="flex flex-col h-full overflow-y-auto rounded shadow-xl bg-gray-50">
                    <div className="flex-1 px-0 overflow-y-auto">
                      <div className="sticky top-0 z-10 flex items-start justify-between w-full px-6 py-4 border-b shadow bg-indigo-50">
                        <Dialog.Title className="text-lg font-medium text-gray-900">
                          {translate('label.myAccount.referAFriendText')}
                        </Dialog.Title>
                        <div className="flex items-center ml-3 h-7">
                          <button
                            type="button"
                            className="p-2 -m-2 text-gray-400 hover:text-gray-500"
                            onClick={() => setModelClose()}
                          >
                            <span className="sr-only">{translate('common.label.closePanelText')}</span>
                            <XMarkIcon className="w-6 h-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                      <div className="\py-2  sm:px-0 flex flex-row">
                        {/*Referal Program Info view*/}
                        {shareReferralView ? (
                          <div className="flex flex-col items-center justify-center w-full my-20">
                            <h3 className="px-5 text-center">
                              {user.firstName} {translate('label.referral.inviteNowUsingText')}
                            </h3>
                            <div className="flex flex-row items-center justify-center gap-x-5">
                              {shareOptionsConfig?.map(
                                (shareOpt: any, Idx: any) => {
                                  return (
                                    <span
                                      key={Idx}
                                      onClick={shareOpt.onClick}
                                      className={classNames(
                                        shareOpt.name === shareMethod
                                          ? 'border-b-[3px]  border-black'
                                          : 'border-none',
                                        'border-b-1[px] py-2 mx-4 w-8 my-2 flex items-center justify-center cursor-pointer text-black'
                                      )}
                                    >
                                      {shareOpt?.icon}
                                    </span>
                                  )
                                }
                              )}
                              {/* <span className="w-5 h-5 mx-2 my-2 text-black">
                                <ChatBubbleLeftEllipsisIcon />
                              </span>
                              <span className="w-5 h-5 mx-2 my-2 text-black">
                                <EnvelopeIcon />
                              </span>
                              <span className="w-5 h-5 mx-2 my-2 text-black">
                                <LinkIcon />
                              </span> */}
                            </div>
                            <p className="px-5 text-center">
                              {translate('label.checkout.enterReferalfriendText')}
                            </p>
                            <h2 className="mx-2 text-lg ">
                              {referralObj?.slug}
                            </h2>
                            <Button className="my-3" onClick={() => { }}>
                              {translate('label.myAccount.shareInPersonBtnText')}
                            </Button>

                            {referralObj?.slug && (
                              <>
                                {isReferralSlugLoading ? (
                                  <LoadingDots />
                                ) : (
                                  <div className="\w-full w-[450px] flex flex-col border-[1px] items-center justify-center border-black px-2 py-2">
                                    <p className="w-full text-left">
                                      {translate('label.referral.shareLinkText')}
                                    </p>
                                    <div className="flex items-center justify-between w-full">
                                      <p className="mx-1 truncate">
                                        {referralLink}
                                      </p>
                                      <Button
                                        className="h-4 !text-[10px]"
                                        onClick={handleCopyClick}
                                      >
                                        {copied ? translate('label.product.copiedText') : translate('label.product.copyText')}
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        ) : (
                          <div
                            className={classNames(
                              'my-20 flex w-full flex-col justify-center items-center'
                            )}
                          >
                            <h2 className="px-5 text-center">
                              {referralOffers?.refereePromo}
                            </h2>
                            <p className="px-5 text-center">
                              {translate('label.thankyou.referralServiceEmailsText')}
                            </p>
                            <Button
                              className="my-3"
                              onClick={() => {
                                setShareReferralView(true)
                              }}
                            >
                              {referralOffers?.referrerPromo}
                            </Button>
                            <p className="px-5 text-center">
                              {translate('label.footer.navigation.byAcceptingOfferAgreText')}{' '}
                              <a href="#">
                                <span className='font-bold'>{translate('label.footer.navigation.termsAndConditionsText')}</span>
                              </a>
                            </p>
                          </div>
                        )}
                        <div className="flex w-full">
                          <img
                            src={'/assets/images/refer-a-friend.jpg'}
                            alt="banner"
                            height={700}
                            width={480}
                            className="object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      <div
        ref={bodyEndScrCntrRef}
        className={`${ELEM_ATTR}body-end-script-cntr-pc`}
      ></div>

      {(!isSnippetLoaded && snippets?.length > 0) && (
        <NonHeadContentSnippet snippets={snippets} refs={{ bodyStartScrCntrRef, bodyEndScrCntrRef }} />
      )}
    </>
  )
}

export async function getServerSideProps(context: any) {
  const { locale } = context
  return {
    props: {
      ...(await serverSideTranslations(locale ?? BETTERCOMMERCE_DEFAULT_LANGUAGE!)),
    }, // will be passed to the page component as props
  }
}
