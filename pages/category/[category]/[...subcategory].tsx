import { useReducer, useState, useEffect } from 'react'
import Link from 'next/link'
import NextHead from 'next/head'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import useSwr from 'swr'
import 'swiper/css'
import 'swiper/css/navigation'
import { getDataByUID, parseDataValue, setData } from '@framework/utils/redis-util'
import getAllCategoriesStaticPath from '@framework/category/get-all-categories-static-path'
import { Redis } from '@framework/utils/redis-constants'
import { getSecondsInMinutes, stringToNumber } from '@framework/utils/parse-util'
import { getCategoryBySlug } from '@framework/category'
import { getCategoryProducts } from '@framework/api/operations'
import { parsePLPFilters, routeToPLPWithSelectedFilters, setPLPFilterSelection, } from 'framework/utils/app-util'
import { Cookie, STATIC_PAGE_CACHE_INVALIDATION_IN_MINS } from '@framework/utils/constants'
import { maxBasketItemsCount, setPageScroll, notFoundRedirect, logError } from '@framework/utils/app-util'
import commerce from '@lib/api/commerce'
import { generateUri, removeQueryString, serverSideMicrositeCookies } from '@commerce/utils/uri-util'
import { useTranslation } from '@commerce/utils/use-translation'
import { SCROLLABLE_LOCATIONS } from 'pages/_app'
import { postData } from '@components/utils/clientFetcher'
import withDataLayer, { PAGE_TYPES } from '@components/withDataLayer'
import { IMG_PLACEHOLDER } from '@components/utils/textVariables'
import OutOfStockFilter from '@components/Product/Filters/OutOfStockFilter'
import CompareSelectionBar from '@components/Product/ProductCompare/compareSelectionBar'
import { useUI } from '@components/ui'
import { CURRENT_THEME, EmptyGuid, EmptyObject, EmptyString, EngageEventTypes, SITE_ORIGIN_URL } from '@components/utils/constants'
import { PHASE_PRODUCTION_BUILD } from 'next/constants'
import RecentlyViewedProduct from '@components/Product/RelatedProducts/RecentlyViewedProducts'
const ProductFilterRight = dynamic(() => import('@components/Product/Filters/filtersRight'))
const ProductMobileFilters = dynamic(() => import('@components/Product/Filters'))
const ProductFiltersTopBar = dynamic(() => import('@components/Product/Filters/FilterTopBar'))
const ProductGridWithFacet = dynamic(() => import('@components/Product/Grid'))
const ProductGrid = dynamic(() => import('@components/Product/Grid/ProductGrid'))
const BreadCrumbs = dynamic(() => import('@components/ui/BreadCrumbs'))
import EngageProductCard from '@components/SectionEngagePanels/ProductCard'
import { Guid } from '@commerce/types'
import { IPagePropsProvider } from '@framework/contracts/page-props/IPagePropsProvider'
import { getPagePropType, PagePropType } from '@framework/page-props'
import useAnalytics from '@components/services/analytics/useAnalytics'
import { EVENTS_MAP } from '@components/services/analytics/constants'
import Loader from '@components/Loader'
import { AnalyticsEventType } from '@components/services/analytics'
import FilterHorizontal from '@components/Product/Filters/filterHorizontal'

const PAGE_TYPE = PAGE_TYPES.SubCategoryList
declare const window: any

export async function getStaticProps(context: any) {
  const { locale, locales } = context
  const slugName = Object.keys(context.params)[0]
  const childSlugName = Object.keys(context.params)[1]
  const slug =
    slugName +
    '/' +
    context.params[slugName] +
    '/' +
    context.params[childSlugName].join('/')

  const props: IPagePropsProvider = getPagePropType({ type: PagePropType.COMMON })
  const cookies = serverSideMicrositeCookies(locale!)
  const pageProps = await props.getPageProps({ slug, cookies })

  const cachedDataUID = {
    allMembershipsUID: Redis.Key.ALL_MEMBERSHIPS,
    infraUID: Redis.Key.INFRA_CONFIG,
    categorySlugUID: Redis.Key.Category.Slug + '_' + slug,
    categoryProductUID: Redis.Key.Category.CategoryProduct + '_' + slug
  }

  const cachedData = await getDataByUID([
    cachedDataUID.allMembershipsUID,
    cachedDataUID.infraUID,
    cachedDataUID.categorySlugUID,
    cachedDataUID.categoryProductUID,
  ])

  let infraUIDData: any = parseDataValue(cachedData, cachedDataUID.infraUID)
  let categorySlugUIDData: any = parseDataValue(cachedData, cachedDataUID.categorySlugUID)
  let categoryProductUIDData: any = parseDataValue(cachedData, cachedDataUID.categoryProductUID)

  try {
    if (!categorySlugUIDData) {
      categorySlugUIDData = await getCategoryBySlug(slug, { [Cookie.Key.LANGUAGE]: locale })
      // save to redis
      await setData([{ key: cachedDataUID.categorySlugUID, value: categorySlugUIDData }])
    }
    if (!infraUIDData) {
      const infraPromise = commerce.getInfra({ [Cookie.Key.LANGUAGE]: locale })
      infraUIDData = await infraPromise
      await setData([{ key: cachedDataUID.infraUID, value: infraUIDData }])
    }
  } catch (error: any) {
    logError(error)
    if (process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD) {
      let errorUrl = '/500'
      const errorData = error?.response?.data
      if (errorData?.errorId) {
        errorUrl = `${errorUrl}?errorId=${errorData.errorId}`
      }
      return {
        redirect: {
          destination: errorUrl,
          permanent: false,
        },
      }
    }
  }

  let allMembershipsUIDData: any = parseDataValue(cachedData, cachedDataUID.allMembershipsUID)
  if (!allMembershipsUIDData) {
    const data = {
      "SearchText": null,
      "PricingType": 0,
      "Name": null,
      "TermType": 0,
      "IsActive": 1,
      "ProductId": Guid.empty,
      "CategoryId": Guid.empty,
      "ManufacturerId": Guid.empty,
      "SubManufacturerId": Guid.empty,
      "PlanType": 0,
      "CurrentPage": 0,
      "PageSize": 0
    }
    const membershipPlansPromise = commerce.getMembershipPlans({ data, cookies: {} })
    allMembershipsUIDData = await membershipPlansPromise
    await setData([{ key: cachedDataUID.allMembershipsUID, value: allMembershipsUIDData }])
  }

  let defaultDisplayMembership = EmptyObject
  if (allMembershipsUIDData?.result?.length) {
    const membershipPlan = allMembershipsUIDData?.result?.sort((a: any, b: any) => a?.price?.raw?.withTax - b?.price?.raw?.withTax)[0]
    if (membershipPlan) {
      const promoCode = membershipPlan?.membershipBenefits?.[0]?.code
      if (promoCode) {
        const promotion = await commerce.getPromotion(promoCode)
        defaultDisplayMembership = { membershipPromoDiscountPerc: stringToNumber(promotion?.result?.additionalInfo1), membershipPrice: membershipPlan?.price?.raw?.withTax }
      }
    }
  }

  if (process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD) {
    if (categorySlugUIDData?.status === "NotFound") {
      return notFoundRedirect()
    }
  }
  if (categorySlugUIDData && categorySlugUIDData?.id) {
    if (!categoryProductUIDData) {
      categoryProductUIDData = await getCategoryProducts(categorySlugUIDData?.id, { [Cookie.Key.LANGUAGE]: locale })
      await setData([{ key: cachedDataUID.categoryProductUID, value: categoryProductUIDData }])
      return {
        props: {
          ...pageProps,
          category: categorySlugUIDData,
          slug,
          products: categoryProductUIDData,
          globalSnippets: infraUIDData?.snippets ?? [],
          snippets: categorySlugUIDData?.snippets ?? [],
          defaultDisplayMembership,
        },
        revalidate: getSecondsInMinutes(STATIC_PAGE_CACHE_INVALIDATION_IN_MINS)
      }
    }
    else {
      return {
        props: {
          ...pageProps,
          category: categorySlugUIDData,
          slug,
          products: categoryProductUIDData,
          globalSnippets: infraUIDData?.snippets ?? [],
          snippets: categorySlugUIDData?.snippets ?? [],
          defaultDisplayMembership,
        },
        revalidate: getSecondsInMinutes(STATIC_PAGE_CACHE_INVALIDATION_IN_MINS)
      }
    }
  } else
    return {
      props: {
        ...pageProps,
        category: categorySlugUIDData,
        slug,
        products: null,
        globalSnippets: infraUIDData?.snippets ?? [],
        snippets: categorySlugUIDData?.snippets ?? [],
        defaultDisplayMembership,
      },
      revalidate: getSecondsInMinutes(STATIC_PAGE_CACHE_INVALIDATION_IN_MINS)
    }
}

const generateCategories = (categories: any) => {
  const categoryMap: any = []
  const generateCategory = (category: any, categoryPrefix: any) => {
    if (category?.link) {
      const segments = category.link.split('/')
      if (segments.length >= 3) {
        category?.link.includes('category/') ? categoryMap.push(`/${category?.link}`) : categoryMap.push(`/${categoryPrefix}/${category?.link}`)
      }
    }
    if (category?.subCategories) {
      category?.subCategories.forEach((i: any) => {
        generateCategory(i, category?.link)
      })
    }
  }
  categories.forEach((category: any) =>
    generateCategory(category, category?.link)
  )
  return categoryMap
}

export async function getStaticPaths() {
  const data = await getAllCategoriesStaticPath()
  return {
    paths: generateCategories(data),
    fallback: 'blocking',
  }
}

export const ACTION_TYPES = {
  SORT_BY: 'SORT_BY',
  PAGE: 'PAGE',
  SORT_ORDER: 'SORT_ORDER',
  CLEAR: 'CLEAR',
  HANDLE_FILTERS_UI: 'HANDLE_FILTERS_UI',
  SET_FILTERS: 'SET_FILTERS',
  ADD_FILTERS: 'ADD_FILTERS',
  REMOVE_FILTERS: 'REMOVE_FILTERS',
  SET_CATEGORY_ID: 'SET_CATEGORY_ID',
  RESET_STATE: 'RESET_STATE'
}

interface actionInterface {
  type?: string
  payload?: object | any
}

interface stateInterface {
  sortBy?: string
  currentPage?: string | number
  sortOrder?: string
  filters: any
  categoryId: any
}

const IS_INFINITE_SCROLL = process.env.NEXT_PUBLIC_ENABLE_INFINITE_SCROLL === 'true'
const { SORT_BY, PAGE, SORT_ORDER, CLEAR, HANDLE_FILTERS_UI, SET_FILTERS, ADD_FILTERS, REMOVE_FILTERS, SET_CATEGORY_ID, RESET_STATE } = ACTION_TYPES
const DEFAULT_STATE = { sortBy: '', sortOrder: 'asc', currentPage: 1, filters: [], categoryId: '', }

function reducer(state: stateInterface, { type, payload }: actionInterface) {
  switch (type) {
    case SORT_BY:
      return { ...state, sortBy: payload, currentPage: 1 }
    case PAGE:
      return { ...state, currentPage: payload }
    case SORT_ORDER:
      return { ...state, sortOrder: payload }
    case CLEAR:
      return { ...state, currentPage: 1, filters: [] }
    case HANDLE_FILTERS_UI:
      return { ...state, areFiltersOpen: payload }
    case SET_CATEGORY_ID:
      return { ...state, categoryId: payload }
    case SET_FILTERS:
      return { ...state, filters: payload }
    case ADD_FILTERS:
      return { ...state, filters: [...state.filters, payload] }
    case RESET_STATE:
      return DEFAULT_STATE
    case REMOVE_FILTERS:
      return { ...state, filters: state.filters.filter((item: any) => item.Value !== payload.Value), }
    default:
      return { ...state }
  }
}

function CategoryPage({ category, slug, products, deviceInfo, config, featureToggle, campaignData, defaultDisplayMembership }: any) {
  const { isMobile } = deviceInfo
  const router = useRouter()
  const qsFilters = router.asPath
  const filters: any = parsePLPFilters(qsFilters as string)
  const [previousSlug, setPreviousSlug] = useState(router?.asPath?.split('?')[0]);
  const translate = useTranslation()
  const adaptedQuery: any = { ...router.query }
  adaptedQuery.currentPage ? (adaptedQuery.currentPage = Number(adaptedQuery.currentPage)) : false
  adaptedQuery.filters ? (adaptedQuery.filters = JSON.parse(adaptedQuery.filters)) : false
  const [isProductCompare, setProductCompare] = useState(false)
  const [excludeOOSProduct, setExcludeOOSProduct] = useState(true)
  const { isCompared } = useUI()
  const initialState = {
    ...DEFAULT_STATE,
    // Setting initial filters from query string
    filters: filters ? filters : [],
    categoryId: category?.id,
  }

  const [state, dispatch] = useReducer(reducer, initialState)
  const {
    data = {
      products: {
        results: [],
        sortList: [],
        pages: 0,
        total: 0,
        currentPage: 1,
        filters: state?.filters || [],
        categoryId: category?.id,
      },
    },
    error,
    isValidating
  } = useSwr(
    [
      `/api/catalog/products`,
      { ...state, ...{ slug: slug, isCategory: true, excludeOOSProduct, categoryId: category?.id } },
    ],
    ([url, body]: any) => postData(url, body),
    {
      revalidateOnFocus: false,
    }
  )

  useEffect(() => {
    const handleRouteChange = (url: any) => {
      const currentSlug = url?.split('?')[0];
      if (currentSlug !== previousSlug) {
        dispatch({ type: RESET_STATE })
        setPreviousSlug(currentSlug);
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    // Cleanup the event listener on unmount
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [previousSlug, router]);

  const [productListMemory, setProductListMemory] = useState({
    products: {
      results: [],
      sortList: [],
      pages: 0,
      total: 0,
      currentPage: 1,
      filters: [],
      categoryId: category?.id,
    },
  })
  const [productDataToPass, setProductDataToPass] = useState(data?.products)

  useEffect(() => {
    if (state?.filters?.length) {
      routeToPLPWithSelectedFilters(router, state?.filters)
    }
    setPLPFilterSelection(state?.filters)
  }, [state?.filters])

  useAnalytics(AnalyticsEventType.CATEGORY_VIEWED, { category, entityName: PAGE_TYPE, entityType: EVENTS_MAP.ENTITY_TYPES.Category, })

  useEffect(() => {
    // for Engage
    if (typeof window !== "undefined" && window?.ch_session) {
      window.ch_page_view_before({ item_id: category?.name || EmptyString })
    }
  }, [category?.id])

  useEffect(() => {
    //if (IS_INFINITE_SCROLL) {
    if (
      data?.products?.currentPage !==
      productListMemory?.products?.currentPage ||
      data?.products?.total !== productListMemory?.products?.total
    ) {
      setProductListMemory((prevData: any) => {
        let dataClone = { ...data }
        if (state?.currentPage > 1 && IS_INFINITE_SCROLL) {
          dataClone.products.results = [
            ...prevData?.products?.results,
            ...dataClone?.products?.results,
          ]
        }
        return dataClone
      })
    }
    //}
  }, [data?.products?.results?.length, data])


  const setFilter = (filters: any) => {
    dispatch({ type: SET_FILTERS, payload: filters })
  }


  useEffect(() => {
    const dataToPass = IS_INFINITE_SCROLL
      ? productListMemory?.products
      : data?.products // productListMemory?.products
    setProductDataToPass(dataToPass)
  }, [productListMemory?.products, products])

  const onEnableOutOfStockItems = (val: boolean) => {
    setExcludeOOSProduct(!val)
    // clearAll()
    dispatch({ type: PAGE, payload: 1 })
  }

  useEffect(() => {
    const trackScroll = (ev: any) => {
      setPageScroll(window?.location, ev.currentTarget.scrollX, ev.currentTarget.scrollY)
    }

    const isScrollEnabled = SCROLLABLE_LOCATIONS.find((x: string) => location.pathname.startsWith(x))
    if (isScrollEnabled) {
      window?.addEventListener('scroll', trackScroll)
      return () => {
        window?.removeEventListener('scroll', trackScroll)
      }
    } /*else {
      resetPageScroll()
    }*/
  }, [])

  const handlePageChange = (page: any, redirect = true) => {
    if (redirect) {
      router.push(
        {
          pathname: router.pathname,
          query: { ...router.query, currentPage: page.selected + 1 },
        },
        undefined,
        { shallow: true }
      )
    }
    dispatch({ type: PAGE, payload: page.selected + 1 })
    if (typeof window !== 'undefined') {
      window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth',
      })
    }
  }

  const handleInfiniteScroll = () => {
    if (products.pages && products.currentPage < products.pages) {
      dispatch({ type: PAGE, payload: products.currentPage + 1 })
    }
  }

  const handleFilters = (filter: null, type: string) => {
    if (filters?.length == 1 && type == REMOVE_FILTERS) {
      routeToPLPWithSelectedFilters(router, [])
    }
    dispatch({
      type,
      payload: filter,
    })
    dispatch({ type: PAGE, payload: 1 })
  }

  const handleSortBy = (payload: any) => {
    router.push({
      pathname: router.pathname,
      query: { ...router.query, sortBy: payload },
    })
    dispatch({
      type: SORT_BY,
      payload: payload,
    })
  }
  const removeFilter = (key: string) => {
    if (filters?.length == 1) {
      routeToPLPWithSelectedFilters(router, [])
    }
    dispatch({ type: REMOVE_FILTERS, payload: key })
  }
  const clearAll = () => {
    routeToPLPWithSelectedFilters(router, [])
    dispatch({ type: CLEAR })
  }

  // IMPLEMENT HANDLING FOR NULL OBJECT
  if (category === null) {
    return (
      <div className="container relative py-10 mx-auto text-center top-20">
        <h1 className="pb-6 text-3xl font-medium text-gray-400 font-30">
          {translate('common.label.badUrlText')}
          <Link href="/category">
            <span className="px-3 text-indigo-500">{translate('label.category.allCategoriesText')}</span>
          </Link>
        </h1>
      </div>
    )
  }

  const css = { maxWidth: '100%', height: 'auto' }
  let absPath = ''
  if (typeof window !== 'undefined') {
    absPath = window?.location?.href
  }
  const showCompareProducts = () => {
    setProductCompare(true)
  }

  const closeCompareProducts = () => {
    setProductCompare(false)
  }
  const cleanPath = removeQueryString(router.asPath)
  return (
    <>
      <NextHead>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="canonical" href={SITE_ORIGIN_URL + cleanPath} />
        <title>{category?.name || translate('label.category.categoryText')}</title>
        <meta name="title" content={category?.name || translate('label.category.categoryText')} />
        <meta name="description" content={category?.metaDescription} />
        <meta name="keywords" content={category?.metaKeywords} />
        <meta property="og:image" content="" />
        <meta property="og:title" content={category?.name} key="ogtitle" />
        <meta property="og:description" content={category?.metaDescription} key="ogdesc" />
      </NextHead>
      <section className="main-section dark:bg-white">
        <div className="container mx-auto mt-2 bg-transparent dark:bg-white">
          {category?.breadCrumbs && (
            <BreadCrumbs items={category?.breadCrumbs} currentProduct={category} />
          )}
        </div>
        <div className="container mx-auto my-0 mt-1 bg-transparent">
          <div className={`max-w-screen-sm max-t-full ${CURRENT_THEME == 'green' ? 'mx-auto text-center sm:py-0 py-3 -mt-4' : ''}`}>
            <h1 className={`block text-2xl capitalize dark:text-black ${CURRENT_THEME == 'green' ? 'sm:text-4xl lg:text-5xl font-bold' : 'sm:text-3xl lg:text-4xl font-semibold'}`}>
              {category?.name.toLowerCase()}
            </h1>
            {category?.description &&
              <div className='w-full'>
                <span className={`block text-neutral-500 dark:text-neutral-500 ${CURRENT_THEME == 'green' ? 'text-xs mt-6' : 'text-sm mt-4'}`} dangerouslySetInnerHTML={{ __html: category?.description }} ></span>
              </div>
            }
          </div>
          <div className='flex justify-between w-full pb-1 mt-1 mb-1 align-center'>
            <span className="inline-block mt-2 text-xs font-medium text-slate-500 sm:px-0 dark:text-slate-500 result-count-text"> {productDataToPass?.total} {productDataToPass?.total > 1 ? translate('common.label.itemPluralText') : translate('common.label.itemSingularText')}</span>
            <div className="flex justify-end align-bottom">
              <OutOfStockFilter excludeOOSProduct={excludeOOSProduct} onEnableOutOfStockItems={onEnableOutOfStockItems} />
            </div>
          </div>
          <hr className='border-slate-200 dark:border-slate-200' />
        </div>


        {category && category?.images && category?.images.length ? (
          <div className="w-full py-4">
            {category?.images.map((cat: any, idx: number) => (
              <div className="relative grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2" key={idx} >
                <div className="flex items-center justify-center order-2 p-4 py-8 bg-blue-web sm:py-0 sm:p-0 sm:order-1">
                  <div className="w-full h-full">
                    <div className="relative sm:absolute sm:top-2/4 sm:left-2/4 sm:-translate-x-2/4 sm:-translate-y-2/4 cat-container">
                      <div className="sm:w-2/4 sm:pr-20">
                        <h2 className="text-white uppercase">{cat?.name}</h2>
                        <p className="mt-5 font-light text-white">
                          {cat?.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="order-1 sm:order-2">
                  <img src={generateUri(cat?.url, 'h=700&fm=webp') || IMG_PLACEHOLDER} className="w-full" alt={category?.name || 'category'} width={700} height={700} />
                </div>
              </div>
            ))}
          </div>
        ) : null}
        <div className={`container mx-auto ${products?.total > 0 ? ' py-0' : 'py-6'}`}>
          {isValidating ? (
            <Loader />
          ) : (
            <>
              {productDataToPass?.results?.length > 0 ? (
                <div className="grid grid-cols-1 mx-auto sm:grid-cols-12">
                  {!!productDataToPass && (productDataToPass?.filters?.length > 0 ? (
                    <>
                      {isMobile ? (
                        <ProductMobileFilters handleFilters={handleFilters} products={products} routerFilters={state.filters} handleSortBy={handleSortBy} clearAll={clearAll} routerSortOption={state.sortBy} removeFilter={removeFilter} featureToggle={featureToggle} />
                      ) : (
                        <>
                          {!featureToggle?.features?.enableHorizontalFilter ? (
                            <ProductFilterRight handleFilters={handleFilters} products={productDataToPass} routerFilters={state.filters} />
                          ) : (
                            <FilterHorizontal handleFilters={handleFilters} products={data.products} routerFilters={state.filters} pageType="category" />
                          )}
                        </>
                      )}
                      <div className={`${CURRENT_THEME == 'green' ? 'sm:col-span-10 lg:col-span-10 md:col-span-10 product-grid-9' : featureToggle?.features?.enableHorizontalFilter ? 'sm:col-span-12 lg:col-span-12 md:col-span-12' : 'sm:col-span-9 lg:col-span-9 md:col-span-9'}`}>
                        {isMobile ? null : (
                          <ProductFiltersTopBar products={productDataToPass} handleSortBy={handleSortBy} routerFilters={state.filters} clearAll={clearAll} routerSortOption={state.sortBy} removeFilter={removeFilter} featureToggle={featureToggle} />
                        )}
                        <ProductGridWithFacet products={productDataToPass} currentPage={state?.currentPage} handlePageChange={handlePageChange} handleInfiniteScroll={handleInfiniteScroll} deviceInfo={deviceInfo} maxBasketItemsCount={maxBasketItemsCount(config)} isCompared={isCompared} featureToggle={featureToggle} defaultDisplayMembership={defaultDisplayMembership} />
                      </div>
                    </>
                  ) : (
                    <div className="sm:col-span-12 p-[1px] sm:mt-0 mt-2">
                      <ProductFiltersTopBar products={productDataToPass} handleSortBy={handleSortBy} routerFilters={state.filters} clearAll={clearAll} routerSortOption={state.sortBy} removeFilter={removeFilter} featureToggle={featureToggle} />
                      <ProductGrid products={productDataToPass} currentPage={state?.currentPage} handlePageChange={handlePageChange} handleInfiniteScroll={handleInfiniteScroll} deviceInfo={deviceInfo} maxBasketItemsCount={maxBasketItemsCount(config)} isCompared={isCompared} featureToggle={featureToggle} defaultDisplayMembership={defaultDisplayMembership} />
                    </div>
                  ))}
                  <CompareSelectionBar name={category?.name} showCompareProducts={showCompareProducts} products={productDataToPass} isCompare={isProductCompare} maxBasketItemsCount={maxBasketItemsCount(config)} closeCompareProducts={closeCompareProducts} deviceInfo={deviceInfo} />
                  {/* <div className="col-span-12 cart-recently-viewed">
                        <RecentlyViewedProduct deviceInfo={deviceInfo} config={config} productPerRow={4} />
                      </div> */}
                  <div className='flex flex-col w-full col-span-12 overflow-hidden'>
                    <EngageProductCard type={EngageEventTypes.TRENDING_FIRST_ORDER} campaignData={campaignData} isSlider={true} productPerRow={4} productLimit={12} />
                    <EngageProductCard type={EngageEventTypes.INTEREST_USER_ITEMS} campaignData={campaignData} isSlider={true} productPerRow={4} productLimit={12} />
                    <EngageProductCard type={EngageEventTypes.TRENDING_COLLECTION} campaignData={campaignData} isSlider={true} productPerRow={4} productLimit={12} />
                    <EngageProductCard type={EngageEventTypes.COUPON_COLLECTION} campaignData={campaignData} isSlider={true} productPerRow={4} productLimit={12} />
                    <EngageProductCard type={EngageEventTypes.SEARCH} campaignData={campaignData} isSlider={true} productPerRow={4} productLimit={12} />
                    <EngageProductCard type={EngageEventTypes.RECENTLY_VIEWED} campaignData={campaignData} isSlider={true} productPerRow={4} productLimit={12} />
                  </div>
                </div>
              ) : (
                <div className="p-4 py-8 mx-auto text-center sm:p-32 max-w-7xl">
                  <h4 className="text-3xl font-bold text-gray-300">
                    {translate('common.label.noProductAvailableText')} {category?.name}
                  </h4>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  )
}

export default withDataLayer(CategoryPage, PAGE_TYPE)