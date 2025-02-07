import { useState, useEffect } from 'react'
import { MagnifyingGlassIcon, StarIcon, XMarkIcon, ChevronLeftIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/router'
import Link from 'next/link'
import axios from 'axios'
import { SEARCH_PROVIDER, NEXT_SEARCH_PRODUCTS, } from '@components/utils/constants'
import rangeMap from '@lib/range-map'
import { EVENTS_MAP } from '@components/services/analytics/constants'
import { IMG_PLACEHOLDER } from '@components/utils/textVariables'
import { generateUri } from '@commerce/utils/uri-util'
import ElasticSearchResult from './elastic/ElasticSearchResult'
import { matchStrings } from '@framework/utils/parse-util'
import { SearchProvider } from '@framework/utils/enums'
import InstantSearchBar from './algolia/InstantSearchBar'
import { pushSearchToNavigationStack } from '@framework/utils/app-util'
import { useTranslation } from '@commerce/utils/use-translation'
import ProductTag from '@components/Product/ProductTag'
import Prices from '@components/Prices'
import { AnalyticsEventType } from '@components/services/analytics'
import useAnalytics from '@components/services/analytics/useAnalytics'

export default function Search(props: any) {
  const { recordAnalytics } = useAnalytics()
  const { closeWrapper = () => { }, keywords, maxBasketItemsCount, deviceInfo, featureToggle, defaultDisplayMembership, searchDefaultSortBy } = props;
  const Router = useRouter()
  const [inputValue, setInputValue] = useState('')
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [path, setCurrentPath] = useState(Router.asPath)
  const translate = useTranslation()
  const SearchEntity = EVENTS_MAP.ENTITY_TYPES.Search

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true)
      try {
        const response: any = await axios.post(NEXT_SEARCH_PRODUCTS, {
          value: inputValue,
          sortBy: searchDefaultSortBy
        })
        setProducts(response?.data?.results)
        setIsLoading(false)
        recordAnalytics(AnalyticsEventType.SEARCH, { inputValue, products: response?.data?.products, entityType: SearchEntity, })
      } catch (error) {
        console.log(error)
        setIsLoading(false)
      }
    }
    if (inputValue.trim().length > 2) fetchItems()
  }, [inputValue])

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === 'Enter') {
      Router.push(`/search?freeText=${encodeURIComponent(inputValue.trim())}`);
      closeWrapper()
    }
  };

  const handleClickSearch = () => {
    Router.push(`/search?freeText=${encodeURIComponent(inputValue.trim())}`);
    closeWrapper()
  }

  useEffect(() => {
    if (path !== Router.asPath) {
      closeWrapper()
    }
  }, [Router.asPath])

  const CLASSES = "absolute top-3 start-3";
  const defaultSearch = (
    <div className="fixed top-0 left-0 w-full h-full bg-white z-9999 search-fixed">
      <div className='top-0 left-0 right-0 w-full h-40 nc-HeadBackgroundCommon 2xl:h-28 bg-primary-50 dark:bg-primary-50 '></div>
      <div className="absolute text-gray-900 cursor-pointer h-9 w-9 right-10 top-10 mobile-hidden black-icon-svg" onClick={closeWrapper} >
        <XMarkIcon />
      </div>
      <div className="absolute z-10 flex flex-col items-center justify-center w-full px-4 py-5 mt-4 sm:mt-10 sm:px-10 top-5">
        <div className="w-full mx-auto mb-4 sm:w-3/5">
          <div className="flex flex-row items-center justify-center px-1 rounded-sm mob-center-align">
            <label className="hidden" htmlFor={'search-bar'}>
              {translate('label.search.searchText')}
            </label>
            <div className="hidden mt-2 text-gray-900 cursor-pointer h-9 w-9 desktop-hidden mobile-visible" onClick={closeWrapper} >
              <ChevronLeftIcon />
            </div>
            <input id={'search-bar'} autoFocus className="w-full min-w-0 px-5 py-4 text-xl text-gray-700 placeholder-gray-500 bg-white border-0 border-b border-gray-300 rounded-full shadow appearance-none focus:outline-none focus:ring-0 focus:ring-white focus:border-gray-700 search-input" placeholder={translate('label.search.searchText')} onChange={(e: any) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} />
            <div className="relative py-4 text-gray-400 right-10 mob-right-pos black-icon-svg">
              <MagnifyingGlassIcon onClick={handleClickSearch} className="w-6 h-6" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="w-full mt-10 sm:w-3/5 p-[1px] border-gray-100 gap-x-6 gap-y-4 grid grid-cols-1 sm:mx-0 md:grid-cols-4 px-3 sm:px-4 lg:grid-cols-4 max-panel-search overflow-y-scroll max-h-[70vh] pb-10">
          {isLoading &&
            rangeMap(12, (i) => (
              <div key={i} className="mx-auto mt-20 rounded-md shadow-md w-60 h-72" >
                <div className="flex flex-row items-center justify-center h-full space-x-2 animate-pulse">
                  <div className="flex flex-col space-y-3">
                    <div className="w-full h-48 bg-gray-100 rounded-md "></div>
                    <div className="h-6 mt-40 bg-gray-100 rounded-md w-36 "></div>
                  </div>
                </div>
              </div>
            ))}
          {products?.map((product: any, idx: number) => {
            return (
              <div className={`nc-ProductCard relative flex flex-col group bg-transparent mb-6`} key={`search-${idx}`}>
                <div onClick={closeWrapper} className="relative flex-shrink-0 overflow-hidden bg-slate-50 dark:bg-slate-300 rounded-3xl z-1 group">
                  <Link href={`/${product.slug}`} className="block">
                    <div className="flex w-full h-0 aspect-w-11 aspect-h-12"
                      onClick={() => {
                        if (inputValue) {
                          const location = window.location
                          pushSearchToNavigationStack(`${location.pathname}${location.search}`, inputValue)
                        }
                      }}>
                      <img src={generateUri(product?.image, 'h=270&fm=webp') || IMG_PLACEHOLDER} className="object-cover object-top w-full h-full drop-shadow-xl" alt={product?.name} />
                    </div>
                  </Link>
                  <div className={CLASSES}>
                    <ProductTag product={product} />
                  </div>
                </div>

                <div className="space-y-4 px-2.5 pt-5 pb-2.5">
                  <div>
                    <h2 className="text-base font-semibold text-left transition-colors min-h-[60px] dark:text-black nc-ProductCard__title">{product?.name}</h2>
                    <p className={`text-sm text-slate-500 dark:text-slate-400 mt-1 text-left justify-start`}>{product?.classification?.mainCategoryName}</p>
                  </div>
                  <div className="flex items-end justify-between product-card-panel">
                    <Prices price={product?.price} listPrice={product?.listPrice} featureToggle={featureToggle} defaultDisplayMembership={defaultDisplayMembership} />
                    {product?.reviewCount > 0 &&
                      <div className="flex items-center mb-0.5">
                        <StarIcon className="w-5 h-5 pb-[1px] text-amber-400" />
                        <span className="text-sm ms-1 text-slate-500 dark:text-slate-400">
                          {product?.rating || ""} ({product?.reviewCount || 0} reviews)
                        </span>
                      </div>
                    }
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )

  const elasticSearch = (
    <ElasticSearchResult {...props} />
  )

  return (
    <>
      {
        matchStrings(SEARCH_PROVIDER!, SearchProvider.DEFAULT) && (
          <>{defaultSearch}</>
        )
      }
      {
        matchStrings(SEARCH_PROVIDER!, SearchProvider.ELASTIC) && (
          <>{elasticSearch}</>
        )
      }
      {
        matchStrings(SEARCH_PROVIDER!, SearchProvider.ALGOLIA) && (
          <InstantSearchBar maxBasketItemsCount={maxBasketItemsCount} deviceInfo={deviceInfo} />
        )
      }
    </>
  )
}
