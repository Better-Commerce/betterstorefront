import { useState, useEffect } from 'react'
import withDataLayer, { PAGE_TYPES } from '@components/withDataLayer'
import { useConfig } from '@components/utils/myAccount'
import withAuth from '@components/utils/withAuth'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { EVENTS_MAP } from '@components/services/analytics/constants'
import useAnalytics from '@components/services/analytics/useAnalytics'
import { useUI } from '@components/ui/context'
import React from 'react'
import ContactPreferences from '@components/account/ContactPreferences'
import SideMenu from '@components/account/MyAccountMenu'
import { useTranslation } from '@commerce/utils/use-translation'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { BETTERCOMMERCE_DEFAULT_LANGUAGE } from '@components/utils/constants'
import LayoutAccount from '@components/Layout/LayoutAccount'
function MyAccount({ deviceInfo }:any) {
  const [isShow, setShow] = useState(true)
  const router = useRouter()
  const translate = useTranslation()
  const { CustomerProfileViewed } = EVENTS_MAP.EVENT_TYPES
  const { Customer } = EVENTS_MAP.ENTITY_TYPES
  const { user, deleteUser, isGuestUser } = useUI()
  const currentOption = translate('label.contactPreferences.contactPreferencesText')

  useEffect(() => {
    if (isGuestUser) {
      router.push('/')
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  let loggedInEventData: any = {
    eventType: CustomerProfileViewed,
  }

  if (user && user.userId) {
    loggedInEventData = {
      ...loggedInEventData,
      entity: JSON.stringify({
        email: user.email,
        dateOfBirth: user.yearOfBirth,
        gender: user.gender,
        id: user.userId,
        name: user.firstName + user.lastName,
        postCode: user.postCode,
      }),
      entityId: user.userId,
      entityName: user.firstName + user.lastName,
      entityType: Customer,
    }
  }
  const [active, setActive] = useState(false)

  const handleClick = () => {
    setActive(!active)
  }
  useAnalytics(CustomerProfileViewed, loggedInEventData)

  return (
    <section className="container w-full bar">
      <div className="mt-14 sm:mt-20">
        <div className='max-w-4xl mx-auto'>
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold xl:text-4xl dark:text-white">{translate('common.label.accountText')}</h2>
            <span className="block mt-4 text-base text-neutral-500 dark:text-neutral-400 sm:text-lg">
              <span className="font-semibold text-slate-900 dark:text-slate-200">
                {user?.firstName},
              </span>{" "}
              {user.email}
            </span>
          </div>
          <hr className="mt-10 border-slate-200 dark:border-slate-700"></hr>
          <SideMenu
            handleClick={handleClick}
            setShow={setShow}
            currentOption={currentOption}
            deviceInfo={deviceInfo}
          />
          <hr className="border-slate-200 dark:border-slate-700"></hr>
        </div>
        <div className="max-w-4xl pb-24 mx-auto pt-14 sm:pt-26 lg:pb-32">
          <h2 className='text-2xl font-semibold sm:text-3xl'>{translate('label.contactPreferences.contactPreferencesText')}</h2>
          <div className={'orders bg-white dark:bg-transparent my-2 sm:my-6'}>
            <ContactPreferences />
          </div>
        </div>
      </div>
    </section>
  )
}

MyAccount.LayoutAccount = LayoutAccount

const PAGE_TYPE = PAGE_TYPES.Page

export async function getServerSideProps(context: any) {
  const { locale } = context
  return {
    props: {
      ...(await serverSideTranslations(locale ?? BETTERCOMMERCE_DEFAULT_LANGUAGE!)),
    }, // will be passed to the page component as props
  }
}

export default withDataLayer(withAuth(MyAccount), PAGE_TYPE, true, LayoutAccount)
