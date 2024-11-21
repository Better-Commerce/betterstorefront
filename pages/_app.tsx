import '@assets/css/main.css'
import "fonts/line-awesome-1.3.0/css/line-awesome.css";
import "styles/index.scss";
import 'swiper/css/bundle'
import '@assets/css/algolia-instant-search.css'
import React, { FC, useCallback, useEffect, useState } from 'react'
import NextHead from 'next/head'
import Cookies from 'js-cookie'
import TagManager from 'react-gtm-module'
import { v4 as uuid_v4 } from 'uuid'
import { useRouter } from 'next/router'
import { AppContext, AppInitialProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import os from 'os'

import { resetSnippetElements, } from '@framework/content/use-content-snippet'
import { IncomingMessage, ServerResponse } from 'http'
import { Cookie, } from '@framework/utils/constants'
import { DeviceType } from '@commerce/utils/use-device'

import packageInfo from '../package.json'
import { decrypt, } from '@framework/utils/cipher'
import { tryParseJson } from '@framework/utils/parse-util'
import { backToPageScrollLocation, logError, maxBasketItemsCount } from '@framework/utils/app-util'
import PasswordProtectedRoute from '@components/route/PasswordProtectedRoute'
import OverlayLoader from '@components/shared/OverlayLoader/OverlayLoader';
import { SessionIdCookieKey, DeviceIdKey, SITE_NAME, SITE_ORIGIN_URL, EmptyString, } from '@components/utils/constants'
import DataLayerInstance from '@components/utils/dataLayer'
import geoData from '@components/utils/geographicService'
import analytics from '@components/services/analytics/omnilytics'
import setSessionIdCookie, { createSession, isValidSession, getExpiry, getMinutesInDays, setGeoDataCookie, } from '@components/utils/setSessionId'
import { ManagedUIContext, IDeviceInfo } from '@components/ui/context'
import Head from '@components/shared/Head/Head';
import InitDeviceInfo from '@components/shared/InitDeviceInfo';
import BrowserNavigation from '@components/shared/routing/BrowserNavigation';
import ErrorBoundary from '@components/shared/error';
import CustomCacheBuster from '@components/shared/CustomCacheBuster';
import CustomerReferral from '@components/customer/Referral';
import { CURRENT_THEME } from "@components/utils/constants";
import { fetchCampaignsByPagePath } from '@components/utils/engageWidgets';
import { hasBaseUrl, removeQueryString } from '@commerce/utils/uri-util';
import { I18nProvider } from '@components/ui/i18nContext';
import { i18nLocalization } from 'framework/utils/app-util';
import { ContentSnippetInjector } from '@components/common/Content'
const featureToggle = require(`../public/theme/${CURRENT_THEME}/features.config.json`);

const tagManagerArgs: any = {
  gtmId: process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID,
}

const Noop: FC<React.PropsWithChildren<unknown>> = ({ children }) => (
  <>{children}</>
)

const TEST_GEO_DATA = {
  Ip: '81.196.3.147',
  Country: 'Romania',
  CountryCode: 'RO',
  City: 'Bucharest',
  CityCode: 'B',
  DetailJson: null,
  Message: null,
  IsValid: false,
}

const setDeviceIdCookie = () => {
  if (!Cookies.get(DeviceIdKey)) {
    const deviceId = uuid_v4()
    Cookies.set(DeviceIdKey, deviceId, {
      expires: getExpiry(getMinutesInDays(365)),
    })
    DataLayerInstance.setItemInDataLayer(DeviceIdKey, deviceId)
  } else {
    DataLayerInstance.setItemInDataLayer(DeviceIdKey, Cookies.get(DeviceIdKey))
  }
}

export const SCROLLABLE_LOCATIONS = [ '/collection/', '/brands/', '/category/', '/kit/' ]

function MyApp({ Component, pageProps, nav, footer, clientIPAddress, ...props }: any) {
  const [location, setUserLocation] = useState({ Ip: '' })
  const [isAnalyticsEnabled, setAnalyticsEnabled] = useState(false)
  const [isAppLoading, setAppIsLoading] = useState(true)
  const [deviceInfo, setDeviceInfo] = useState<IDeviceInfo>({
    isMobile: undefined,
    isDesktop: undefined,
    isIPadorTablet: undefined,
    deviceType: DeviceType.UNKNOWN,
    isOnlyMobile: undefined,
  })
  const [updatedPageProps, setUpdatedPageProps] = useState({ ...pageProps, featureToggle })
  const [campaignData, setCampaignData] = useState()

  const keywordsData = pageProps?.keywords || []
  const snippets = [
    ...(pageProps?.globalSnippets ?? []),
    ...(pageProps?.snippets ?? []),
    ...(pageProps?.data?.snippets ?? []),
  ]
  //snippets = uniqBy(snippets, 'name'); //Prevent duplicate data being passed on to snippets rendering engine.

  const router = useRouter()
  const Layout = (Component as any).Layout || Noop
  const setClientIPAddress = (pageProps: any) => {
    if (pageProps?.clientIPAddress) {
      Cookies.set(Cookie.Key.CLIENT_IP_ADDRESS, pageProps?.clientIPAddress)
    }
  }
  const i18n = i18nLocalization(pageProps?.locale || EmptyString)
  const fetchEngageCampaigns = useCallback(async () => {
    try {
      const campaignRes = await fetchCampaignsByPagePath(router.asPath)
      setCampaignData(campaignRes)
    } catch (error: any) {
      logError(error)
    }
  }, [router.asPath])

  useEffect(() => {
    let urlReferrer = pageProps?.urlReferrer || document.referrer
    if (urlReferrer) {
      urlReferrer = SITE_ORIGIN_URL + new URL(pageProps?.urlReferrer || document.referrer).pathname;
      DataLayerInstance.setItemInDataLayer('urlReferrer', urlReferrer)
    }
  }, [pageProps?.urlReferrer])

  useEffect(() => {
    // Listener for snippet injector reset.
    router.events.on('routeChangeStart', () => {
      setClientIPAddress(pageProps)
      resetSnippetElements()
    })

    const isScrollEnabled = SCROLLABLE_LOCATIONS.find((x: string) => window.location.pathname.startsWith(x))
    if (isScrollEnabled) {
      router.events.on('routeChangeComplete', () => {
        backToPageScrollLocation(window.location)
      })
    }

    // Dispose listener.
    return () => {
      router.events.off('routeChangeStart', () => { })
      if (isScrollEnabled) {
        router.events.off('routeChangeComplete', () => { })
      }
    }
  }, [router.events])

  let appConfig: any = null
  if (pageProps?.appConfig) {
    appConfig = tryParseJson(decrypt(pageProps?.appConfig))
  }

  let pluginConfig: any = null
  if (pageProps?.pluginConfig) {
    pluginConfig = tryParseJson(decrypt(pageProps?.pluginConfig))
  }

  const initializeGTM = () => {
    if (process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID)
      TagManager.initialize(tagManagerArgs)
  }

  useEffect(() => {
    initializeGTM()
    document.body.classList?.remove('loading')
    if (appConfig) {
      const currencyCode = Cookies.get(Cookie.Key.CURRENCY) || appConfig?.defaultCurrency || EmptyString
      Cookies.set(Cookie.Key.CURRENCY, currencyCode)
      const currencySymbol = appConfig?.currencies?.find((x: any) => x?.currencyCode === currencyCode)?.currencySymbol || EmptyString
      Cookies.set(Cookie.Key.CURRENCY_SYMBOL, currencySymbol)
      const languageCulture = appConfig?.languages?.find((x: any) => x?.languageCulture === Cookies.get(Cookie.Key.LANGUAGE))?.languageCulture || pageProps?.locale || EmptyString
      Cookies.set(Cookie.Key.LANGUAGE, languageCulture)
      Cookies.set(Cookie.Key.COUNTRY, languageCulture?.substring(3))
    }
  }, [])

  useEffect(() => {
    DataLayerInstance.setDataLayer()
    DataLayerInstance.setItemInDataLayer('server', pageProps?.serverHost || EmptyString)
    // If browser session is not yet started.
    if (!isValidSession()) {
      // Initiate a new browser session.
      createSession()
    } else {
      setAppIsLoading(false)
    }
    if (featureToggle?.features?.enableOmnilytics) {
      setGeoData()
    }
    let analyticsCb = analytics()
    setAnalyticsEnabled(true)
    setSessionIdCookie()
    setDeviceIdCookie()
    return function cleanup() {
      analyticsCb.removeListeners()
      Cookies.remove(SessionIdCookieKey)
    }
  }, [])

  const setGeoData = async () => {
    try {
      const geoResult: any = await geoData(EmptyString)
      if (geoResult) {
        setGeoDataCookie(geoResult)
        setUserLocation(geoResult)
        setAppIsLoading(false)
      }
    } catch (error) {
      setAppIsLoading(false)
    }
  }

  useEffect(() => {
    if (featureToggle?.features?.enableOmnilytics) {
      fetchEngageCampaigns()
    }
  }, [router.asPath])

  const seoInfo = pageProps?.metaTitle || pageProps?.metaDescription || pageProps?.metaKeywords ? pageProps : pageProps?.data?.product || undefined
  const seoImage = pageProps?.metaTitle || pageProps?.metaDescription || pageProps?.metaKeywords ? pageProps?.products?.images[0]?.url : pageProps?.data?.product?.image || undefined
  const cleanPath = removeQueryString(router.asPath)
  return (
    <>
      <NextHead>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />
        {seoInfo && (
          <>
            <title>{seoInfo?.metaTitle}</title>
            {
              router.asPath.startsWith('/products/') && (
                // <link rel="canonical" href={(seoInfo?.canonicalTags != "" || seoInfo?.canonicalTags != null) ? (!hasBaseUrl(seoInfo?.canonicalTags) ? SITE_ORIGIN_URL + "/" + seoInfo?.canonicalTags : seoInfo?.canonicalTags) : SITE_ORIGIN_URL +  cleanPath} />
                <link rel="canonical" href={SITE_ORIGIN_URL + cleanPath} />
              )
            }
            <meta name="title" content={seoInfo?.metaTitle} />
            <meta name="description" content={seoInfo?.metaDescription} />
            <meta name="keywords" content={seoInfo?.metaKeywords} />
            <meta property="og:title" content={seoInfo?.metaTitle} key="ogtitle" />
            <meta property="og:description" content={seoInfo?.metaDescription} key="ogdesc" />
          </>
        )}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} key="ogsitename" />
        <meta property="og:url" content={SITE_ORIGIN_URL + router.asPath} key="ogurl" />
        <meta property="og:image" content={seoImage} />
      </NextHead>

      <Head {...appConfig}></Head>
      {<ContentSnippetInjector snippets={snippets} />}
      <ManagedUIContext>
        <PasswordProtectedRoute config={appConfig}>
          <CustomCacheBuster buildVersion={packageInfo?.version} />
          <InitDeviceInfo setDeviceInfo={setDeviceInfo} />
          {
            (deviceInfo && (deviceInfo.isDesktop || deviceInfo.isMobile || deviceInfo.isIPadorTablet)) && (
              <BrowserNavigation deviceInfo={deviceInfo} />
            )
          }
          <I18nProvider value={i18n}>
            <ErrorBoundary>
              <Layout nav={nav} footer={footer} config={appConfig} pluginConfig={pluginConfig} pageProps={updatedPageProps} keywords={keywordsData} deviceInfo={deviceInfo} maxBasketItemsCount={maxBasketItemsCount(appConfig)} >
                <CustomerReferral router={router} />
                <SessionProvider session={pageProps?.session}>
                  <Component
                    {...{...pageProps, featureToggle}}
                    campaignData={campaignData}
                    location={location}
                    ipAddress={location.Ip}
                    config={appConfig}
                    pluginConfig={pluginConfig}
                    deviceInfo={deviceInfo}
                  />
                </SessionProvider>
              </Layout>
            </ErrorBoundary>
          </I18nProvider>
        </PasswordProtectedRoute>
      </ManagedUIContext>
    </>
  )
}

MyApp.getInitialProps = async (context: AppContext): Promise<AppInitialProps> => {

  const { ctx, Component } = context
  const { locale } = ctx
  const req: any = ctx?.req
  const res: ServerResponse<IncomingMessage> | undefined = ctx?.res

  let clientIPAddress = req?.ip ?? req?.headers['x-real-ip']
  const forwardedFor = req?.headers['x-forwarded-for']
  if (!clientIPAddress && forwardedFor) {
    clientIPAddress = forwardedFor.split(',').at(0) ?? ''
  }
  const serverHost = os?.hostname?.()
  const urlReferrer = req?.headers?.referer
  //const cookies: any = { [Cookie.Key.LANGUAGE]: locale }
  
  return {
    pageProps: {
      serverHost,
      urlReferrer,
      clientIPAddress,
      locale,
    },
  }
}

export default MyApp