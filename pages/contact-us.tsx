import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import NextHead from 'next/head'
import axios from 'axios'
import os from 'os'
import type { GetStaticPropsContext } from 'next'
import Layout from '@components/Layout/Layout'
import {
  SITE_ORIGIN_URL,
} from '@components/utils/constants'
import withDataLayer, { PAGE_TYPES } from '@components/withDataLayer'
import { EVENTS_MAP } from '@components/services/analytics/constants'
import useAnalytics from '@components/services/analytics/useAnalytics'
import {
  CONTACT_PAGE_DEFAULT_SLUG,
  STATIC_PAGE_CACHE_INVALIDATION_IN_MINS,
} from '@framework/utils/constants'
import {
  getCurrency,
  getCurrentCurrency,
  obfuscateHostName,
  setCurrentCurrency,
} from '@framework/utils/app-util'
import { getSecondsInMinutes, matchStrings } from '@framework/utils/parse-util'
import {
  containsArrayData,
  getDataByUID,
  parseDataValue,
  setData,
} from '@framework/utils/redis-util'
import { Redis } from '@framework/utils/redis-constants'
import { useTranslation } from '@commerce/utils/use-translation'
import Link from 'next/link'
import ContactForm from '@components/contact/ContactForm'
import { IPagePropsProvider } from '@framework/contracts/page-props/IPagePropsProvider'
import { getPagePropType, PagePropType } from '@framework/page-props'
// import ContactUsForm from '@old-components/contact/ContactUsForm'
const Loader = dynamic(() => import('@components/ui/LoadingDots'))

export async function getStaticProps({
  preview,
  locale,
  locales,
}: GetStaticPropsContext) {
  const config = { locale, locales }
  const props: IPagePropsProvider = getPagePropType({ type: PagePropType.CONTACT_US })
  const pageProps = await props.getPageProps({ slug: CONTACT_PAGE_DEFAULT_SLUG, cookies: {} })
  const hostName = os.hostname()

  return {
    props: {
      ...pageProps,
      hostName: obfuscateHostName(hostName),
    },
    revalidate: getSecondsInMinutes(STATIC_PAGE_CACHE_INVALIDATION_IN_MINS),
  }
}

const PAGE_TYPE = PAGE_TYPES.Contact

function Contact({
  setEntities,
  recordEvent,
  ipAddress,
  pageContentsWeb,
  pageContentsMobileWeb,
  hostName,
  deviceInfo,
  data,
}: any) {
  const router = useRouter()
  const { PageViewed } = EVENTS_MAP.EVENT_TYPES
  const { isMobile } = deviceInfo
  const currencyCode = getCurrency()
  const translate = useTranslation()
  const ContactPageContents = isMobile
    ? pageContentsMobileWeb?.find((x: any) => x?.key === currencyCode)?.value ||
      []
    : pageContentsWeb?.find((x: any) => x?.key === currencyCode)?.value || []
  const [pageContents, setPageContents] = useState<any>(ContactPageContents)

  useEffect(() => {
    const currentCurrency = getCurrentCurrency()
    if (!matchStrings(currencyCode, currentCurrency, true)) {
      axios
        .post('/api/page-preview-content', {
          id: '',
          slug: CONTACT_PAGE_DEFAULT_SLUG,
          workingVersion: process.env.NODE_ENV === 'production' ? true : true,
          channel: isMobile ? 'MobileWeb' : 'Web',
          cachedCopy: true,
          currencyCode,
        })
        .then((res: any) => {
          if (res?.data) setPageContents(res?.data)
        })
      setCurrentCurrency(currencyCode)
    }
  }, [currencyCode, isMobile])

  useAnalytics(PageViewed, {
    entity: JSON.stringify({
      id: '',
      name: pageContents?.metatitle,
      metaTitle: pageContents?.metaTitle,
      MetaKeywords: pageContents?.metaKeywords,
      MetaDescription: pageContents?.metaDescription,
      Slug: pageContents?.slug,
      Title: pageContents?.metatitle,
      ViewType: 'Page View',
    }),
    entityName: PAGE_TYPE,
    pageTitle: pageContents?.metaTitle,
    entityType: 'Page',
    entityId: '',
    eventType: 'PageViewed',
  })

  if (!pageContents) {
    return (
      <div className="flex w-full text-center flex-con">
        {' '}
        <Loader />{' '}
      </div>
    )
  }
  return (
    <>
      {(pageContents?.metatitle || pageContents?.metadescription || pageContents?.metakeywords) && (
        <NextHead>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
          <link rel="canonical" id="canonical" href={pageContents?.canonical || SITE_ORIGIN_URL + router.asPath} />
          <title> {pageContents?.metatitle || translate('common.message.ContactUsText')} </title>
          <meta name="title" content={ pageContents?.metatitle || translate('common.message.ContactUsText') } />
          {pageContents?.metadescription && (
            <meta name="description" content={pageContents?.metadescription} />
          )}
          {pageContents?.metakeywords && (
            <meta name="keywords" content={pageContents?.metakeywords} />
          )}
          <meta property="og:image" content={pageContents?.image} />
          {pageContents?.metatitle && (
            <meta property="og:title" content={pageContents?.metatitle} key="ogtitle" />
          )}
          {pageContents?.metadescription && (
            <meta property="og:description" content={pageContents?.metadescription} key="ogdesc" />
          )}
        </NextHead>
      )}
      {hostName && <input className="inst" type="hidden" value={hostName} />}
      <div className="mt-5 sm:mt-0">
        {pageContents?.heading?.map((head: any, Idx: any) => (
          <div key={Idx}>
            <Link href="/">
              <div className="relative flex items-center justify-center">
                <img className="object-cover min-h-[225px]" src={head?.heading_heroimage} alt={head?.heading_herotitle} />
                <div className="absolute text-center text-white">
                  <p className="text-6xl transition-colors duration-300 hover:text-blue">
                    {head?.heading_herotitle}
                  </p>
                  <p className="text-2xl transition-colors duration-300 hover:text-blue">
                    {translate('label.contactUs.homeContactUsText')} </p>
                </div>
              </div>
            </Link>
          </div>
        ))}
        <div className="container grid grid-cols-1 gap-5 mt-12 mb-0 md:grid-cols-2 lg:grid-cols-3 lg:mt-32">
          {pageContents?.contactbanner?.map((contact: any, Idx: any) => (
            <div className="flex flex-col items-center p-10 bg-gray-200 rounded-md cursor-pointer" key={Idx}>
              <img src={contact?.contactbanner_heroimage} alt={contact?.contactbanner_herotitle} />
              <p className="mt-5 mb-5 text-2xl font-semibold leading-9 dark:text-black">
                {contact?.contactbanner_herotitle}
              </p>
              <div className="mt-1 text-center dark:text-black" dangerouslySetInnerHTML={{ __html: contact?.contactbanner_herodescription, }} />
            </div>
          ))}
        </div>
        <ContactForm />
      </div>
    </>
  )
}

Contact.Layout = Layout
export default withDataLayer(Contact, PAGE_TYPE)
