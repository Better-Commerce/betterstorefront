import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  NEXT_GET_ORDERS,
  NEXT_CREATE_RETURN_DATA,
} from '@components/utils/constants'
import { useUI } from '@components/ui/context'
import Link from 'next/link'
import cartHandler from '@components/services/cart'
import {
  IMG_PLACEHOLDER,
} from '@components/utils/textVariables'
import ReturnModal from '@components/returns/Modal'
import { isCartAssociated, vatIncluded } from '@framework/utils/app-util'
import Image from 'next/image'
import { generateUri } from '@commerce/utils/uri-util'
import { useTranslation } from '@commerce/utils/use-translation'

export default function MyOrders({ deviceInfo }: any) {
  const translate = useTranslation()
  const [data, setData] = useState([])
  const [productIdsInReturn, setProductIdsInReturn] = useState([''])
  const [returnData, setReturnData] = useState({ product: {}, order: {} })
  const { user, basketId, setCartItems, openCart, cartItems } = useUI()
  const isIncludeVAT = vatIncluded()
  useEffect(() => {
    const fetchOrders = async () => {
      const response: any = await axios.post(NEXT_GET_ORDERS, {
        id: user.userId,
        hasMembership: user.hasMembership,
      })

      setData(response.data)
    }
    fetchOrders()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCreateReturn = (product: any, order: any) => {
    setReturnData({ product: product, order: order })
  }

  const handlePostReturn = async (data: any) => {
    const returnInfo: any = returnData
    const model = {
      orderId: returnInfo.order.id,
      lineItems: [
        {
          productId: returnInfo.product.productId,
          stockCode: returnInfo.product.stockCode,
          returnQtyRequested: returnInfo.product.qty,
          returnQtyRecd: 0,
          reasonForReturnId: data.reasonsForReturn,
          requiredActionId: data.requiredActions,
          comment: data.comment,
        },
      ],
      faultReason: data.reasonsForReturn,
      uploadFileUrls: ['string'],
    }
    try {
      const responseData: any = await axios.post(NEXT_CREATE_RETURN_DATA, {
        model,
      })
      setProductIdsInReturn([
        ...productIdsInReturn,
        ...responseData.data.response.result.lineItems.map(
          (item: any) => item.productId
        ),
      ])
      return true
    } catch (error) {
      alert('Woops! Could not create a return')
      console.log(error)
    }
  }

  const handleClose = () => setReturnData({ product: {}, order: {} })
  const handleAddToCart = (product: any) => {
    cartHandler()
      .addToCart(
        {
          basketId,
          productId: product.recordId,
          qty: product.qty,
          manualUnitPrice: product.price,
          stockCode: product.stockCode,
          userId: user.userId,
          isAssociated: isCartAssociated(cartItems),
        },
        'ADD',
        {
          product: {
            name: product.name,
            price: {
              raw: {
                withTax: product.price,
              },
            },
            stockCode: product.stockCode,
            recordId: product.id,
          },
        }
      )
      .then((response: any) => {
        setCartItems(response)
        openCart()
      })
      .catch((err: any) => console.log('error', err))
  }

  return (
    <div className="bg-white">
      {/* Mobile menu */}

      <main className="sm:px-6 lg:px-8">
        <div className="max-w-4xl lg:mx-12">
          <div className="lg:px-4 sm:px-0 pt-5">
            <h1 className="font-extrabold tracking-tight text-gray-900">
            {translate('label.order.orderHistory')}
            </h1>
            <p className="mt-2 text-sm text-gray-500">{translate('label.orderDetails.myOrderHeadingText')}</p>
          </div>
          <ReturnModal
            handlePostReturn={handlePostReturn}
            handleClose={handleClose}
            returnData={returnData}
          />
          <section aria-labelledby="recent-heading" className="mt-16">
            <h2 id="recent-heading" className="sr-only">
              {translate('label.orderDetails.recentOrdersText')}
            </h2>

            <div className="space-y-16 sm:space-y-24">
              {data.map((order: any) => (
                <div key={order.orderNo}>
                  <h3 className="sr-only">
                    {translate('common.label.orderPlacedText')}{' '}
                    <time dateTime={order.orderDate}>
                      {new Date(order.orderDate).toLocaleDateString()}
                    </time>
                  </h3>
                  <div className="px-4 py-8 bg-gray-50 sm:rounded-lg sm:p-8 md:flex md:items-center md:justify-between md:space-x-6 lg:space-x-10">
                    <dl className="flex-auto w-full space-y-6 text-sm text-gray-600 divide-y divide-gray-200 md:divide-y-0 md:space-y-0 md:grid md:grid-cols-5 md:gap-x-10 lg:flex-none lg:gap-x-10">
                      <div className="flex justify-between md:block">
                        <dt className="font-medium text-gray-900">
                          {translate('label.common.orderNumberText')}
                        </dt>
                        <dd className="md:mt-1">{order.orderNo}</dd>
                      </div>
                      <div className="flex justify-between pt-4 md:block md:pt-0">
                        <dt className="font-medium text-gray-900">
                          {translate('label.common.datePlacedText')}
                        </dt>
                        <dd className="md:mt-1">
                          <time dateTime={order.orderDate}>
                            {new Date(order.orderDate).toLocaleDateString()}
                          </time>
                        </dd>
                      </div>
                      <div className="flex justify-between pt-4 font-medium text-gray-900 md:block md:pt-0">
                        <dt>{translate('label.orderSummary.totalText')}</dt>
                        <dd className="md:mt-1">
                          {isIncludeVAT
                            ? order?.subTotal?.formatted?.withTax
                            : order?.subTotal?.formatted?.withoutTax}
                        </dd>
                      </div>
                      <div className="flex justify-between md:block">
                        <dt className="font-medium text-gray-900">{translate('label.orderDetails.statusText')}</dt>
                        <dd className="md:mt-1">{order.orderStatus}</dd>
                      </div>
                      <div className="flex justify-between md:block">
                        <dt className="font-medium text-gray-900">{translate('label.orderDetails.trackingText')}</dt>
                        {/* <dd className="md:mt-1">{order.orderStatus}</dd> */}
                        <a
                          href={order.trackingLink}
                          className="text-indigo-600 md:mt-1 hover:indigo-500"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {translate('label.orderDetails.trackingLinkBtnText')}
                        </a>
                      </div>
                    </dl>
                  </div>
                  <div className="flow-root px-4 mt-6 sm:mt-10 sm:px-0">
                    <div className="-my-6 divide-y divide-gray-200 sm:-my-10">
                      {order.itemsBasic.map((product: any) => (
                        <div key={product.id} className="flex py-6 sm:py-10">
                          <div className="flex-1 min-w-0 lg:flex lg:flex-col">
                            <div className="lg:flex-1">
                              <div className="sm:flex">
                                <div>
                                  <h4 className="font-medium text-gray-900">
                                    {product?.name}
                                  </h4>
                                  <div
                                    dangerouslySetInnerHTML={{
                                      __html: product.shortDescription,
                                    }}
                                    className="hidden mt-2 text-sm text-gray-500 sm:block"
                                  />
                                </div>
                                <p className="mt-1 font-medium text-gray-900 sm:mt-0 sm:ml-6">
                                  {product?.price?.raw?.withTax > 0 ? 
                                    (isIncludeVAT
                                      ? product.price?.formatted?.withTax
                                      : product.price?.formatted?.withoutTax)
                                    :<span className='font-medium uppercase text-14 xs-text-14 text-emerald-600'>FREE</span>
                                    }
                                </p>
                              </div>
                              <div className="flex mt-2 text-sm font-medium sm:mt-4">
                                <Link
                                  href={`/${product.slug || '#'}`}
                                  className="text-indigo-600 hover:text-indigo-500"
                                >
                                  {translate('label.product.viewProductText')}
                                </Link>
                                <div className="pl-4 ml-4 border-l border-gray-200 sm:ml-6 sm:pl-6">
                                  <button
                                    onClick={() => handleAddToCart(product)}
                                    className="text-indigo-600 hover:text-indigo-500"
                                  >
                                    {translate('label.basket.addToBagText')}
                                  </button>
                                </div>
                                {productIdsInReturn.includes(
                                  product.productId
                                ) ? (
                                  <div className="pl-4 ml-4 border-l border-gray-200 sm:ml-6 sm:pl-6">
                                    <button
                                      type="button"
                                      className="text-indigo-600 hover:text-indigo-500"
                                    >
                                      {translate('label.orderDetails.returnCreatedText')} </button>
                                  </div>
                                ) : (
                                  <div className="pl-4 ml-4 border-l border-gray-200 sm:ml-6 sm:pl-6">
                                    <button
                                      onClick={() =>
                                        handleCreateReturn(product, order)
                                      }
                                      type="button"
                                      className="text-indigo-600 hover:text-indigo-500"
                                    >
                                      {product.shippedQty < product.qty
                                        ? 'Cancel'
                                        : translate('label.orderDetails.createReturnBtnText')}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex-shrink-0 ml-4 sm:m-0 sm:mr-6 sm:order-first">
                            <img
                              src={generateUri(product.image,'h=200&fm=webp')||IMG_PLACEHOLDER}
                              alt={product.name ||'Order-Image'}
                              className="object-cover object-center w-20 h-20 col-start-2 col-end-3 rounded-lg sm:col-start-1 sm:row-start-1 sm:row-span-2 sm:w-40 sm:h-40 lg:w-52 lg:h-52"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
