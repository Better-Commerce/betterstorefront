// Base Imports
import { useEffect, useState } from 'react'

// Package Imports
import axios from 'axios'
import Image from 'next/image'
import Router from 'next/router'
import Link from 'next/link'

// Component Imports
import { useUI } from '@components/ui/context'
import ReturnReason from '../../../components/account/Orders/ReturnReason'

// Other Imports
import { matchStrings } from '@framework/utils/parse-util'
import {
  NEXT_RETURN_REASON,
  NEXT_GET_ORDER_DETAILS,
  NEXT_RETURN_ORDER_LINE,
  Messages,
} from '@components/utils/constants'
import { sanitizeBase64, vatIncluded } from '@framework/utils/app-util'
import Spinner from '@components/ui/Spinner'
import { Guid } from '@commerce/types'
import { useTranslation } from '@commerce/utils/use-translation'
import LayoutAccount from '@components/Layout/LayoutAccount'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { IPagePropsProvider } from '@framework/contracts/page-props/IPagePropsProvider'
import { getPagePropType, PagePropType } from '@framework/page-props'
import withDataLayer, { PAGE_TYPES } from '@components/withDataLayer'
import useAnalytics from '@components/services/analytics/useAnalytics'
import { EVENTS_MAP } from '@components/services/analytics/constants'
import { generateUri } from '@commerce/utils/uri-util'
import { IMG_PLACEHOLDER } from '@components/utils/textVariables'
import { AnalyticsEventType } from '@components/services/analytics'

function ReturnOrder({
  orderId = Guid.empty,
  itemId = Guid.empty,
  deviceInfo,
}: any) {
  const { recordAnalytics } = useAnalytics()
  const { setAlert, user } = useUI()
  const { isMobile, isIPadorTablet } = deviceInfo
  const [orderDetails, setOrderDetails] = useState<any>()
  const [itemData, setItemData] = useState<any>(undefined)
  const [showReturnReasons, setShowReturnReasons] = useState(false)
  const [returnsReasons, setReturnsReasons] = useState<any>(undefined)
  const [value, setValue] = useState<any>('')
  const translate = useTranslation()
  const handleChange = (e: any) => {
    setValue(e.target.value)
  }
  const isIncludeVAT = vatIncluded()
  const fetchReturnReasons = async () => {
    const { data: reasonData }: any = await axios.post(NEXT_RETURN_REASON)
    //console.log(reasonData?.result)
    setReturnsReasons(reasonData?.result)
  }
  const onReturnReason = () => {
    fetchReturnReasons()
  }
  const handleFetchOrderDetails = async (id: any) => {
    const { data: orderDetails }: any = await axios.post(
      NEXT_GET_ORDER_DETAILS,
      {
        id: user?.userId,
        orderId: id,
      }
    )
    return orderDetails
  }
  let deviceCheck = ''
  if (isMobile || isIPadorTablet) {
    deviceCheck = 'Mobile'
  } else {
    deviceCheck = 'Desktop'
  }

  const returnOrderLine = async (data: any) => {
    const { data: orderReturnData }: any = await axios.post(
      NEXT_RETURN_ORDER_LINE,
      data
    )
    return orderReturnData
  }

  const [itemReturnLoading, setItemReturnLoading] = useState(false)

  const itemReturn = async (reason: string, selectedImages: Array<any>) => {
    setItemReturnLoading(true)
    if (matchStrings(itemData?.productId, itemId, true)) {
      // submitData(submitDispatch, CancelOrderPageAction.CANCEL);
      let promises = new Array<Promise<any>>()
      selectedImages?.forEach((blob: any) => {
        promises.push(
          new Promise((resolve, _) => {
            const reader = new FileReader()
            reader.onloadend = () =>
              resolve({
                name: blob?.name,
                data: sanitizeBase64(reader?.result as string),
              })
            reader.readAsDataURL(blob)
          })
        )
      })

      const images = await Promise.all(promises)
      let lineItems = [
        {
          productId: itemData?.productId,
          stockCode: itemData?.stockCode,
          returnQtyRequested: value,
          returnQtyRecd: value,
          reasonForReturnId: reason,
          requiredActionId: 'Refund',
          comment: reason,
          replacementStockCode: '',
          replacementProductName: '',
        },
      ]

      //const payment = orderDetails?.order?.payments?.find((x: any) => x?.isValid);
      const data = {
        orderId: orderDetails?.order.id,
        comment: reason,
        lineItems: lineItems,
        faultReason: reason,
        images: images,
      }
      const orderReturnResult = await returnOrderLine(data)
      if (orderReturnResult?.returnNo) {
        setAlert({ type: 'success', msg: Messages.Messages['RETURN_SUCCESS'] })
        setItemReturnLoading(false)
        if (typeof window !== 'undefined') {
          //debugger
          recordAnalytics(AnalyticsEventType.RETURN_CONFIRM, { transactionId: data?.orderId, user, deviceCheck, })
        }
        setTimeout(() => {
          Router.push('/my-account/orders')
        }, 200)
      } else {
        setAlert({ type: 'error', msg: translate('common.message.requestCouldNotProcessErrorMsg') })
        setItemReturnLoading(false)
      }
    }
  }
  const hideReturnReasons = () => {
    setShowReturnReasons(!showReturnReasons)
  }

  useAnalytics(AnalyticsEventType.ORDER_PAGE_VIEWED, { entityName: PAGE_TYPES.OrderReturn, entityType: EVENTS_MAP.ENTITY_TYPES.Order, })

  useEffect(() => {
    const handleAsync = async () => {
      const orderDetails = await handleFetchOrderDetails(orderId)
      if (orderDetails?.order?.items?.length) {
        setOrderDetails(orderDetails)
        setItemData(
          orderDetails?.order?.items?.length > 0
            ? orderDetails?.order?.items?.find((x: any) =>
              matchStrings(x?.productId, itemId, true)
            )
            : []
        )
      }
      //debugger;
      /*if (orderDetails?.order?.deliveryPlans?.length) {
                //const deliveryPlan = orderDetails?.order?.deliveryPlans?.find((x: any) => x?.items?.length > 0 && x?.items?.find((y: any) => matchStrings(y?.productId, itemId, true)));
                //console.log(deliveryPlan)
            }*/
    }
    window.scrollTo(0, 0)
    handleAsync()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      {!itemData ? (
        <Spinner />
      ) : (
        <>
          {/* cancel section start */}
          <div
            className="w-full cancel-section"
            style={{ display: showReturnReasons ? 'none' : 'block' }}
          >
            <div className="px-6 py-4 mb-4 border-b mob-header sm:hidden">
              <Link href="/my-account/orders">
                <h3 className="flex items-center max-w-4xl mx-auto text-xl font-semibold text-gray-900">
                  <ArrowLeftIcon className='w-4 h-4 mr-2 text-gray-500' />
                  {translate('label.help.returnItemText')}
                </h3>
              </Link>
            </div>
            <div className="mx-auto cancel-continer">
              <Link href="/my-account/orders" className="mobile-view">
                <h4 className="flex items-center mr-2 text-xl font-semibold leading-none text-gray-900 uppercase">
                  <ArrowLeftIcon className='w-4 h-4 mr-2 text-gray-500' />
                  {translate('label.help.returnItemText')}
                </h4>
              </Link>
              <div className="w-full">
                <div className="px-0 mt-4">
                  <div className="flow-root">
                    <ul role="list" className="-my-6 divide-y divide-gray-200">
                      <li className="px-0 pb-2 my-4">
                        <div className="flex gap-3 py-6 sm:gap-6 max-w-fit">
                          <div className="flex-shrink-0">
                            <img
                              width={100}
                              height={120}
                              src={generateUri(itemData?.image, 'h=120&fm=webp') || IMG_PLACEHOLDER}
                              alt="image"
                              className="basket-image"
                            />
                          </div>
                          <div className="flex flex-col flex-1">
                            <div>
                              <div className="flex flex-col justify-between font-medium text-gray-900">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium uppercase">
                                    {itemData?.categoryItems[0]?.categoryName}
                                  </p>
                                </div>
                                <h3 className="pr-6 mt-2 font-normal text-12 text-primary">
                                  <Link
                                    href={`/${itemData?.slug}`}
                                    passHref
                                    className="font-semibold text-md dark:text-gray-900"
                                  >
                                    {itemData?.name}
                                  </Link>
                                </h3>
                                <p className="mt-2 text-sm font-medium">
                                  {isIncludeVAT
                                    ? itemData?.price?.formatted?.withTax
                                    : itemData?.price?.formatted?.withoutTax}
                                </p>
                                <div className="flex mt-3">
                                  <div className="w-24">
                                    <label className="font-medium dark:text-gray-900">
                                      {translate('common.label.sizeText')} {itemData?.size}
                                    </label>
                                  </div>
                                  <div className="w-full">
                                    <label className="font-medium dark:text-gray-900">
                                      {translate('common.label.qtyText')} {itemData?.qty}
                                    </label>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pb-2 border-gray-300 border-dashed border-y">
                          <div className="flex items-end flex-1 px-3 py-2 pl-0 mt-1">
                            <label className="text-base font-bold text-primary">
                              {translate('label.myAccount.selectQuantityText')}
                            </label>
                          </div>
                          <div className="py-2">
                            <div className="flex flex-1 px-3 py-2 mt-1 ml-2 text-sm border border-gray-200">
                              <label className="mt-2 mr-2 text-xs text-primary">
                                {translate('common.label.qtyText')}{' '}
                              </label>
                              <select
                                className="text-xs bg-white sm:w-22 text-primary"
                                value={value}
                                onChange={handleChange}
                              >
                                <option value="0">{translate('label.myAccount.selectText')}</option>
                                {Array.from(Array(itemData?.qty).keys())
                                  ?.map((x: number) => x + 1)
                                  ?.map((qty: any, idx: number) => (
                                    <option key={idx} value={qty}>
                                      {qty}
                                    </option>
                                  ))}
                              </select>
                            </div>
                          </div>
                        </div>
                        <div className="w-full py-4">
                          {value > 0 ? (
                            <button
                              type="button"
                              onClick={() => {
                                onReturnReason()
                                hideReturnReasons()
                              }}
                              className="block w-full px-12 py-3 font-semibold text-center text-white bg-black border hover:bg-gray-800 text-14 link-btn"
                            >
                              {translate('label.myAccount.proceedToReturnText')}
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="block w-full px-12 py-3 font-semibold text-center text-white bg-black border hover:bg-gray-800 text-14 link-btn"
                            >
                              {translate('label.myAccount.proceedToReturnText')}
                            </button>
                          )}
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* return section start */}

          <div
            className="w-full"
            style={{ display: showReturnReasons ? 'block' : 'none' }}
          >
            <div className="px-6 py-4 mb-4 border-b mob-header sm:hidden">
              <h3 className="max-w-4xl mx-auto text-xl font-semibold text-black">
                <Link className="mr-2 leading-none" href="/my-account">
                  <i className="sprite-icon sprite-left-arrow"></i> {translate('label.myAccount.reasonForReturn')}
                </Link>
              </h3>
            </div>
            <ReturnReason
              returnsReasons={returnsReasons}
              onItemReturn={itemReturn}
              item={itemData}
              itemReturnLoadingState={itemReturnLoading}
              qty={value}
            />
          </div>
        </>
      )}
    </>
  )
}
export async function getServerSideProps(context: any) {
  const { locale } = context
  const ids = context?.query?.ids
  const props: IPagePropsProvider = getPagePropType({ type: PagePropType.COMMON })
  const pageProps = await props.getPageProps({ cookies: context?.req?.cookies })

  return {
    props: {
      ...pageProps,
      orderId: ids?.length > 0 ? ids[0] : Guid.empty,
      itemId: ids?.length > 1 ? ids[1] : Guid.empty,
    }, // will be passed to the page component as props
  }
}

ReturnOrder.LayoutAccount = LayoutAccount

export default withDataLayer(ReturnOrder, PAGE_TYPES.OrderReturn)
