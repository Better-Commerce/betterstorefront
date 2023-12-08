import type { GetStaticPropsContext } from 'next'
import commerce from '@lib/api/commerce'
import LayoutError from '../components/common/Layout/LayoutError'
import Link from 'next/link'
import { STATIC_PAGE_CACHE_INVALIDATION_IN_200_SECONDS } from '@framework/utils/constants'

export async function getStaticProps({
  preview,
  locale,
  locales,
}: GetStaticPropsContext) {
  const config = { locale, locales }
  const { pages } = await commerce.getAllPages({ config, preview })
  const { categories, brands } = await commerce.getSiteInfo({ config, preview })
  return {
    props: {
      pages,
      categories,
      brands,
    },
    revalidate: STATIC_PAGE_CACHE_INVALIDATION_IN_200_SECONDS
  }
}

export default function NotFound({ deviceInfo }: any) {
  const { isMobile } = deviceInfo
  return (
    <>
      {!isMobile && (
        <>
          <div className="w-full py-14 p-5">
            <div className="error-container">
              <div className="error-text-section w-full text-center mb-8 mt-24">
                <h1 className="text-black sm:text-2xl font-semibold mb-2">
                  404 : Page Not Found
                </h1>
                <p className="text-black">
                  Check that you typed the address correctly. Maybe go back to
                  your previous page or try using our site search to find
                  something specific.
                </p>
              </div>
              <div className="w-40 mx-auto text-center mt-5">
                <Link
                  href="/"
                  className="text-white bg-black block p-4 text-center text-sm font-semibold"
                >
                  Back to Homepage
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
      {isMobile && (
        <>
          <div className="w-full py-8 px-10 pr-10">
            <div className="error-container">
              <div className="error-text-section w-full text-left mb-8 mt-24 px-10 pr-10">
                <h1 className="text-black text-base font-semibold mb-2">
                  404 : Page Not Found
                </h1>
                <p className="text-brown-light text-xs">
                  Check that you typed the address correctly. Maybe go back to
                  your previous page or try using our site search to find
                  something specific.
                </p>
              </div>
              <div className="w-40 mx-auto text-center mt-5">
                <Link
                  href="/"
                  className="text-white bg-black block p-4 text-center text-sm font-semibold"
                >
                  Back to Homepage
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

NotFound.Layout = LayoutError
