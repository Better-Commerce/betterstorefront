import { useState } from 'react'
import axios from 'axios'
import Router from 'next/router'
import Link from 'next/link'
import Form from '@components/customer'
import { EmptyString, NEXT_AUTHENTICATE, NEXT_GET_CUSTOMER_DETAILS, OTP_LOGIN_ENABLED } from '@components/utils/constants'
import { useUI } from '@components/ui/context'
import useWishlist from '@components/services/wishlist'
import cartHandler from '@components/services/cart'
import useAnalytics from '@components/services/analytics/useAnalytics'
import LoginOtp from '@components/account/login-otp'
import SocialSignInLinks from '@components/account/SocialSignInLinks'
import { getEnabledSocialLogins, saveUserToken } from '@framework/utils/app-util'
import { useTranslation } from '@commerce/utils/use-translation'
import DataLayerInstance from '@components/utils/dataLayer'
import { AnalyticsEventType } from '@components/services/analytics'
import { PAGE_TYPES } from '@components/withDataLayer'

interface LoginProps {
  isLoginSidebarOpen?: boolean;
  redirectToOriginUrl?: boolean;
  pluginConfig: any;
}

export default function Login({ isLoginSidebarOpen, redirectToOriginUrl = false, pluginConfig = [], }: LoginProps) {
  const { recordAnalytics } = useAnalytics()
  const translate = useTranslation()
  const [noAccount, setNoAccount] = useState(false)
  const { isGuestUser, setIsGuestUser, setUser, user, wishListItems, setAlert, setCartItems, setBasketId, setWishlist, cartItems, basketId, } = useUI()
  const { getWishlist } = useWishlist()
  const { getCartByUser, addToCart } = cartHandler()
  const otpEnabled = OTP_LOGIN_ENABLED
  const SOCIAL_LOGINS_ENABLED = getEnabledSocialLogins(pluginConfig)

  let redirectUrl = EmptyString
  if (redirectToOriginUrl) {
    const url = new URL(document.URL)
    redirectUrl = `${url?.origin}${url?.pathname}${url?.search}`
  }
  recordAnalytics(AnalyticsEventType.PAGE_VIEWED, { entityName: PAGE_TYPES.Login, })

  const handleUserLogin = (values: any, cb?: any) => {
    const asyncLoginUser = async () => {
      const result: any = await axios.post(NEXT_AUTHENTICATE, { data: values })
      if (!result.data) {
        setNoAccount(true)
        setAlert({ type: 'error', msg: translate('common.message.invalidAccountMsg') })
      } else if (result.data) {
        setNoAccount(false)
        setAlert({ type: 'success', msg: translate('common.message.loginSuccessMsg') })
        let userObj = { ...result.data }
        if (userObj?.userToken) saveUserToken(userObj?.userToken)
        // get user updated details
        const updatedUserObj = await axios.post(
          `${NEXT_GET_CUSTOMER_DETAILS}?customerId=${userObj?.userId}`
        )
        if (updatedUserObj?.data) userObj = { ...updatedUserObj?.data }

        const wishlist = await getWishlist(result.data.userId, wishListItems)
        setWishlist(wishlist)
        const cart: any = await getCartByUser({
          userId: result.data.userId,
          cart: cartItems,
          basketId,
        })
        if (cart && cart.id) {
          setCartItems(cart)
          setBasketId(cart.id)
          userObj.isAssociated = true
        } else {
          userObj.isAssociated = false
        }
        setUser(userObj)
        setIsGuestUser(false)
        DataLayerInstance.setItemInDataLayer('visitorId', userObj?.userId)
        Router.push('/')
      }
      if (cb) cb();
    }
    asyncLoginUser()
  }

  if (!isGuestUser && user.userId) {
    return (
      <div className="w-full h-full font-extrabold text-center text-gray-900">
        {translate('common.message.alreadyLoggedInMsg')}
      </div>
    )
  }

  if (otpEnabled) {
    return <LoginOtp />
  }

  return (
    <section aria-labelledby="trending-heading" className="bg-white">
      <div className="px-10 pt-10 pb-10 lg:max-w-7xl lg:mx-auto sm:pt-4 sm:pb-20">
        <div className="flex flex-col items-center justify-center px-4 sm:px-6 lg:px-0">
          <h1 className="mt-20 mb-10 flex items-center text-3xl leading-[115%] md:text-5xl md:leading-[115%] font-semibold text-neutral-900 dark:text-neutral-900 justify-center">
            {translate('label.login.loginBtnText')}
          </h1>
        </div>
        <div className="max-w-md mx-auto space-y-6">
          <div className="grid gap-3">
            {SOCIAL_LOGINS_ENABLED && (
              <>
                <div className='social-login-section'>
                  <SocialSignInLinks isLoginSidebarOpen={isLoginSidebarOpen} containerCss={`flex justify-center gap-2 mx-auto ${isLoginSidebarOpen ? 'sm:w-full width-md-full !px-0' : 'width-md-full'}`} redirectUrl={redirectUrl} pluginSettings={pluginConfig} />
                </div>
                <div className="relative text-center">
                  <span className="relative z-10 inline-block px-4 text-sm font-medium bg-white dark:text-neutral-400 dark:bg-neutral-900"> OR </span>
                  <div className="absolute left-0 w-full transform -translate-y-1/2 border top-1/2 border-neutral-100 dark:border-neutral-800"></div>
                </div>
              </>
            )}
          </div>

          <Form btnText={translate('label.login.loginBtnText')} type="login" onSubmit={handleUserLogin} apiError={noAccount ? translate('common.message.invalidAccountMsg') : ''} isLoginSidebarOpen={isLoginSidebarOpen} />
          <div className={`flex flex-col items-center justify-center w-full mt-0 mx-auto ${isLoginSidebarOpen ? 'sm:w-full ' : 'sm:w-full'}`} >
            <Link passHref href="/my-account/forgot-password">
              <span className="block font-medium text-green-600 underline cursor-pointer hover:text-green-800 hover:underline">
                {translate('label.login.forgotPasswordBtnText')}
              </span>
            </Link>
          </div>
          <span className="block text-center text-neutral-700 dark:text-neutral-700">
            {translate('label.login.newUserText')}{` `}
            <Link passHref className="text-green-600" href="/my-account/register">
              {translate('label.login.createAccountText')}
            </Link>
          </span>
        </div>
      </div>
    </section>
  )
}
