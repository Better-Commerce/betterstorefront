import { Square2StackIcon } from '@heroicons/react/24/outline'
import React, { useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/navigation'
import SwiperCore, { Navigation } from 'swiper'
import ProductSaleCountdown from './SaleCountDown'
import { priceFormat } from '@framework/utils/parse-util'
import { useTranslation } from '@commerce/utils/use-translation'
import BankOfferIcon from '@components/BankOfferIcon'
declare const window: any
SwiperCore.use([Navigation])
export default function AvailableOffers({ currency, offers, key, product }: any) {
  const translate = useTranslation()
  const [isOffers, setOffers] = useState(false)
  const [isCopied, showCopied] = useState(false)
  const [copyData, setCode] = useState<any>()
  const [offerData, setOffer] = useState<any>({})
  function setOfferData(data: any) {
    if (data) {
      setOffer(data)
      setOffers(true)
    } else {
      setOffer({})
      setOffers(false)
    }
  }
  function copyCode(code: any) {
    navigator.clipboard.writeText(code)
    showCopied(true)
    setCode(code)
    setTimeout(() => {
      showCopied(false)
    }, 3000)
  }

  const bestprice = parseInt(offers?.bestAvailablePromotion?.additionalInfo10)
  return (
    <section key={key} aria-labelledby="details-heading" className="mt-4 border-t border-gray-200 sm:mt-2 ipad-border-none-pdp" >
      <div className="flex flex-col pt-4 pb-4 border-b border-gray-200 gap-y-4 mob-gap-y-4 mob-border-none-pdp">
        <div className="grid w-full grid-cols-12 px-0 sm:grid-cols-6 sm:px-0 mob-promo-grid">
          <div className="col-span-7 sm:col-span-3 mob-left-7">
            <h3 className="font-semibold font-16 text-16 dark:text-black">
              <span className="font-medium opacity_056 text-primary dark:text-black font-label-14">
                {translate('label.product.bestPriceText')}{' '}
              </span>
              <span className="inline-block pl-1 text-sm text-black dark:text-black font-label-14">
                {priceFormat(bestprice, undefined, currency?.currencySymbol)}
              </span>
            </h3>
            <p className="text-xs font-medium text-gray-900">
              {offers?.bestAvailablePromotion?.code} {translate('label.product.applyOnCheckoutText')}
            </p>
          </div>
          <div className="relative col-span-5 sm:col-span-3 item-right mob-left-5">
            <div className={`bg-black px-2 py-1 promo-copied text-xs capitalize text-white text-center rounded-md ${isCopied && copyData == offers?.bestAvailablePromotion?.code ? 'block' : 'hidden'}`} >
              {translate('label.product.copiedText')}
            </div>
            <div className="coupon-panel">
              <div className="coupon-text">
                {offers?.bestAvailablePromotion?.code}
              </div>
              <div className="coupon-copy" onClick={() => copyCode(offers?.bestAvailablePromotion?.code)} >
                <Square2StackIcon className="relative inline-block w-5 h-5 text-blue-600 cursor-pointer hover:text-orange-600" />
              </div>
            </div>
          </div>
          <div className='col-span-12'>
            <ProductSaleCountdown startDate={offers?.bestAvailablePromotion?.fromDate} endDate={offers?.bestAvailablePromotion?.toDate} />
          </div>
        </div>
      </div>
      <div className="flex flex-col px-0 py-2 pr-0 mt-2 sm:pr-4 gap-x-4 sm:px-0 offeres m-hide-navigation">
        <h2 className="mb-2 font-semibold text-black uppercase opacity_056 text-primary font-18 dark:text-black offer-heading-text">
          {translate('label.basket.moreOffersText')} <span className='sr-only'>{' '}of {product?.name}</span>
        </h2>
        <Swiper
          className="inline-flex mx-4 space-x-0 sm:mx-0 lg:mx-0 lg:space-x-0 lg:grid lg:grid-cols-4 lg:gap-x-0 h-60"
          slidesPerView={1}
          spaceBetween={2}
          navigation={true}
          loop={false}
          breakpoints={{
            640: { slidesPerView: 1.5 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 2 },
          }}
        >
          {offers?.availablePromotions?.map((saving: any, sid: number) => {
            const percentagePrice = saving?.additionalInfo1
            //AMOUNT DISCOUNT CALCULATION
            const amountPrice = saving?.additionalInfo1
            const amountDiscount = currency.raw.withTax - amountPrice
            //PERCENTAGE DISCOUNT CALCULATION
            const percentDiscount =
              (currency.raw.withTax * percentagePrice) / 100
            const percentagePay = currency.raw.withTax - percentDiscount
            return (
              saving?.additionalInfo8 == 'False' && (
                <SwiperSlide className="h-auto px-1 z-1 !w-48" key={`promo-${sid}-best-available-${saving?.code}`} >
                  <div key={`promotions-${sid}-best-available-${saving?.code}`} className="relative inline-flex flex-col w-full text-left cursor-pointer min-h-28 rounded-xl group" onClick={() => setOfferData(saving)} >
                    <div className="box-border h-full p-2 bg-transparent border cursor-pointer promo-bg sm:p-3">
                      <div className="flex">
                        <BankOfferIcon />
                        <div className="pl-2">
                          <p className="font-semibold text-md dark:text-black">{translate('label.basket.moreOffersText')}</p>
                          <p className="font-semibold text-left text-black uppercase font-10 break-word-text"> {saving.name} </p>
                          {saving?.promoType == 1 && (
                            <span>
                              {saving.additionalInfo2 == 'False' || saving.additionalInfo2 == 'false' ? (
                                <p className="text-xs font-medium text-black break-word-text"> {saving?.code} </p>
                              ) : (
                                <p className="font-medium text-left text-black font-12 break-word-text"> {saving?.code} </p>
                              )}
                            </span>
                          )}
                          <p className="mt-1 text-sm font-medium text-gray-700 font-10 break-word-text"> {saving?.additionalInfo6} </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              )
            )
          })}
        </Swiper>
      </div>
    </section>
  )
}
