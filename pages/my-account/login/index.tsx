import Router from 'next/router'
import { GetServerSideProps } from 'next'
import NextHead from 'next/head'
import Layout from '@components/Layout/Layout'
import withDataLayer, { PAGE_TYPES } from '@components/withDataLayer'
import { useUI } from '@components/ui/context'
import Login from '@components/account/Login'
import { SITE_ORIGIN_URL } from '@components/utils/constants'
import { useRouter } from 'next/router'
import { decrypt } from '@framework/utils/cipher'
import { matchStrings } from '@framework/utils/parse-util'
import { useTranslation } from '@commerce/utils/use-translation'
import { IPagePropsProvider } from '@framework/contracts/page-props/IPagePropsProvider'
import { getPagePropType, PagePropType } from '@framework/page-props'
import useAnalytics from '@components/services/analytics/useAnalytics'
import { AnalyticsEventType } from '@components/services/analytics'
import { useEffect, useState } from 'react'

function LoginPage({ appConfig, pluginConfig = [] }: any) {
  const { recordAnalytics } = useAnalytics()
  const router = useRouter()
  const translate = useTranslation()
  let b2bSettings: any = []
  let pluginSettings: any = []
  const [url, setUrl] = useState<any>();

  useEffect(() => {
    setUrl(new URL(document?.URL))
  },[])

  if (appConfig) {
    appConfig = JSON.parse(decrypt(appConfig))
    if (appConfig?.configSettings?.length) {
      b2bSettings =
        appConfig?.configSettings?.find((x: any) =>
          matchStrings(x?.configType, 'B2BSettings', true)
        )?.configKeys || []
    }
  }

  if (pluginConfig) {
    pluginSettings = pluginConfig
  }

  const { isGuestUser, user } = useUI()

  recordAnalytics(AnalyticsEventType.PAGE_VIEWED, { entityName: PAGE_TYPES.Login, })

  if (!isGuestUser && user.userId && !url?.searchParams?.get('referral')) {
    Router.push('/')
    return <></>
  }

  return (
    <>
      <NextHead>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="canonical" href={SITE_ORIGIN_URL + router.asPath} />
        <title>{translate('label.checkout.loginRegistrationText')}</title>
        <meta name="title" content={translate('label.checkout.loginRegistrationText')} />
        <meta name="description" content={translate('label.checkout.loginRegistrationText')} />
        <meta name="keywords" content={translate('label.checkout.loginRegistrationText')} />
        <meta property="og:image" content="" />
        <meta property="og:title" content={translate('label.checkout.loginRegistrationText')} key="ogtitle" />
        <meta property="og:description" content={translate('label.checkout.loginRegistrationText')} key="ogdesc" />
      </NextHead>
      <Login pluginConfig={pluginConfig} />
    </>
  )
}

LoginPage.Layout = Layout

export default withDataLayer(LoginPage, PAGE_TYPES.Login)

export const getServerSideProps: GetServerSideProps = async (context: any) => {
  const { locale } = context
  const props: IPagePropsProvider = getPagePropType({ type: PagePropType.COMMON })
  const pageProps = await props.getPageProps({ cookies: context?.req?.cookies })

  return {
    props: {
      ...pageProps,
    }, // will be passed to the page component as props
  }
}
