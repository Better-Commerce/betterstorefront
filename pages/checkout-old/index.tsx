import dynamic from 'next/dynamic'
import withDataLayer, { PAGE_TYPES } from '@components/withDataLayer'
import { useState, useEffect } from 'react'
import cookie from 'cookie'
import { basketId as basketIdGenerator } from '@components/ui/context'
import { useCart as getCart } from '@framework/cart'
import { GetServerSideProps } from 'next'
import { useUI } from '@components/ui/context'
import { asyncHandler } from '@components/account/Address/AddressBook'
import { NEXT_GUEST_CHECKOUT, NEXT_UPDATE_DELIVERY_INFO } from '@components/utils/constants'
import axios from 'axios'
import { EVENTS_MAP } from '@components/services/analytics/constants'
import useAnalytics from '@components/services/analytics/useAnalytics'
import Spinner from '@components/ui/Spinner'
import { Guid } from '@commerce/types'
import CheckoutHeading from '@components/SectionCheckoutJourney/checkout/CheckoutHeading'
import { AnalyticsEventType } from '@components/services/analytics'
const CheckoutRouter = dynamic(() => import('@components/SectionCheckoutJourney/checkout/CheckoutRouter'))
const CheckoutForm = dynamic(() => import('@components/SectionCheckoutJourney/checkout/CheckoutForm'))

export interface actionInterface {
  type?: string
  payload?: any
}

function Checkout({ cart, config, location }: any) {
  const { recordAnalytics } = useAnalytics()
  const {
    user,
    basketId,
    setCartItems,
    cartItems,
    setUser,
    setIsGuestUser,
    guestUser,
    setGuestUser,
    isPaymentLink,
    isSplitDelivery,
  } = useUI()
  const [isLoggedIn, setIsLoggedIn] = useState<any>(undefined)
  const [defaultShippingAddress, setDefaultShippingAddress] = useState({})
  const [defaultBillingAddress, setDefaultBillingAddress] = useState({})
  const [userAddresses, setUserAddresses] = useState<any>([])
  const [splitDeliveryItems, setSplitDeliveryItems] = useState<any>(null)

  const { getAddress } = asyncHandler()

  const onShippingPlansUpdated = async () => {
    let lineItems = [...cartItems?.lineItems]
    // console.log("lineItems:  ",lineItems);

    let shippingPlansList = []
    for (const item in lineItems) {
      shippingPlansList.push({ ...lineItems[item]?.shippingPlan })
    }

    let { data: response } = await axios.post(NEXT_UPDATE_DELIVERY_INFO, {
      data: shippingPlansList,
      id: cartItems?.id,
    })
  }

  useEffect(() => {
    if (isSplitDelivery) {
      onShippingPlansUpdated()
    }
  }, [])

  useEffect(() => {
    function groupItemsByDeliveryDate(items: any) {
      const groupedItems: any = {}

      for (const item of items) {
        const deliveryDate = new Date(
          item.deliveryDateTarget
        ).toLocaleDateString()

        if (groupedItems.hasOwnProperty(deliveryDate)) {
          groupedItems[deliveryDate].push(item)
        } else {
          groupedItems[deliveryDate] = [item]
        }
      }

      return groupedItems
    }
    const splitDeliveryExtract = () => {
      let deliveryPlans = groupItemsByDeliveryDate([...cartItems?.lineItems])
      setSplitDeliveryItems(deliveryPlans)
    }
    splitDeliveryExtract()
    if (user?.userId) {
      fetchAddress()
    }
  }, [])

  useEffect(() => {
    setIsLoggedIn(Boolean(user?.userId || guestUser?.userId || false))
  }, [user, cartItems, guestUser])

  useEffect(() => {
    const billingAddress = userAddresses?.find((o: any) => o.isDefault || o.isDefaultBilling)
    const shippingAddress = userAddresses?.find((o: any) => o.isDefault || o.isDefaultDelivery)
    if (billingAddress) setDefaultBillingAddress(billingAddress)
    else setDefaultBillingAddress(userAddresses?.[0] || {})
    if (shippingAddress) setDefaultShippingAddress(shippingAddress)
    else setDefaultShippingAddress(userAddresses?.[0] || {})
  }, [userAddresses])

  const handleGuestMail = (values: any) => {
    const handleAsync = async () => {
      const response = await axios.post(NEXT_GUEST_CHECKOUT, {
        basketId: basketId,
        ...values,
      })
      setGuestUser({
        userId: response.data.userId,
        email: response.data.userEmail,
        ...values,
      })
      const newCartClone = { ...response.data, isGuestCheckout: true }
      setCartItems(newCartClone)
      setIsLoggedIn(Boolean(response?.data?.userEmail))
      setIsGuestUser(true)
    }
    handleAsync()
  }

  const fetchAddress = async (customerId?: any) => {
    let userId =
      customerId ||
      (cartItems?.userId === Guid.empty ? user?.userId : cartItems?.userId)
    if (guestUser || !userId || (userId && userId === Guid.empty)) return
    try {
      const response: any = await getAddress(userId)
      setUserAddresses(response || [])
      return response
    } catch (error) {
      // console.log(error, 'err')
    }
  }

  const { Basket } = EVENTS_MAP.ENTITY_TYPES

  useAnalytics(AnalyticsEventType.BEGIN_CHECKOUT, {
    entity: JSON.stringify({
      grandTotal: cart.grandTotal.raw,
      id: cart.id,
      lineItems: cart.lineItems,
      shipCharge: cart.shippingCharge.raw.withTax,
      shipTax: cart.shippingCharge.raw.tax,
      taxPercent: cart.taxPercent,
      tax: cart.grandTotal.raw.tax,
    }),
    promoCodes: JSON.stringify(cart.promotionsApplied),
    entityId: cart.id,
    entityName: PAGE_TYPE,
    entityType: Basket,
    eventType: AnalyticsEventType.BEGIN_CHECKOUT,
  })

  const recordShippingInfo = () => {
    if (typeof window !== 'undefined') {
      debugger
      recordAnalytics(AnalyticsEventType.ADD_SHIPPING_INFO, { cartItems, })
    }
  }

  if (isLoggedIn === undefined) {
    return <Spinner />
  }

  if (isLoggedIn) {
    return (
      <>
        <CheckoutHeading />
        <CheckoutForm
          cart={cart}
          addresses={userAddresses}
          setUserAddresses={setUserAddresses}
          defaultBillingAddress={defaultBillingAddress}
          defaultShippingAddress={defaultShippingAddress}
          user={user}
          getAddress={getAddress}
          fetchAddress={fetchAddress}
          config={config}
          location={location}
          recordShippingInfo={recordShippingInfo}
          splitDeliveryItems={splitDeliveryItems}
          onShippingPlansUpdated={onShippingPlansUpdated}
        />
      </>
    )
  }

  if (!isPaymentLink) {
    return (
      <CheckoutRouter
        setIsLoggedIn={setIsLoggedIn}
        handleGuestMail={handleGuestMail}
        fetchAddress={fetchAddress}
      />
    )
  }

  return <></>
}
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { locale } = context
  const cookies = cookie.parse(context.req.headers.cookie || '')
  let basketRef: any = cookies.basketId
  if (!basketRef) {
    basketRef = basketIdGenerator()
    context.res.setHeader('set-cookie', `basketId=${basketRef}`)
  }

  const response = await getCart()({
    basketId: basketRef,
    cookies: context?.req?.cookies,
  })

  return {
    props: {
      cart: response,
    }, // will be passed to the page component as props
  }
}

const PAGE_TYPE = PAGE_TYPES['Checkout']

export default withDataLayer(Checkout, PAGE_TYPE)
