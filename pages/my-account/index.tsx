import { useState, useEffect, useMemo } from 'react'
import withDataLayer, { PAGE_TYPES } from '@components/withDataLayer'
import withAuth from '@components/utils/withAuth'
import { useRouter } from 'next/router'
import { EVENTS_MAP } from '@components/services/analytics/constants'
import useAnalytics from '@components/services/analytics/useAnalytics'
import { useUI } from '@components/ui/context'
import React from 'react'
import MyDetails from '@components/account/MyDetails'
import { useTranslation } from '@commerce/utils/use-translation'
import LayoutAccount from '@components/Layout/LayoutAccount'
import { IPagePropsProvider } from '@framework/contracts/page-props/IPagePropsProvider'
import { getPagePropType, PagePropType } from '@framework/page-props'
import { AnalyticsEventType } from '@components/services/analytics'

function MyAccount() {
  const [isShow, setShow] = useState(true)
  const { user, isGuestUser, changeMyAccountTab } = useUI()
  const router = useRouter()
  const translate = useTranslation()
  const { Customer } = EVENTS_MAP.ENTITY_TYPES

  useEffect(() => {
    if (isGuestUser) {
      router.push('/')
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  let loggedInEventData: any = { eventType: AnalyticsEventType.CUSTOMER_PROFILE_VIEWED, entityType: Customer,}

  if (user && user.userId) {
    loggedInEventData = { ...loggedInEventData, ...user, }
  }
  useEffect(()=>{
    changeMyAccountTab(translate('label.myAccount.myDetailsHeadingText'))
  },[])
  
  useAnalytics(AnalyticsEventType.CUSTOMER_PROFILE_VIEWED, loggedInEventData)

  const handleToggleShowState = () => {
    setShow(!isShow)
  }


  return ( 
    <div className={'orders bg-white dark:bg-transparent'}>
      <MyDetails/>
    </div> )
  }

MyAccount.LayoutAccount = LayoutAccount

const PAGE_TYPE = PAGE_TYPES.MyAccount

export async function getServerSideProps(context: any) {
  const { locale } = context
  const props: IPagePropsProvider = getPagePropType({ type: PagePropType.COMMON })
  const pageProps = await props.getPageProps({ cookies: context?.req?.cookies })

  return {
    props: {
      ...pageProps,
    }, // will be passed to the page component as props
  }
}

export default withDataLayer(withAuth(MyAccount), PAGE_TYPE, true, LayoutAccount)