import React, { useRef } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/swiper.min.css'
import SwiperCore, { Navigation } from 'swiper'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/scrollbar'
import dynamic from 'next/dynamic'
import { maxBasketItemsCount } from '@framework/utils/app-util'
import {
  BTN_RECOMMENDED_PROD,
  BTN_SEE_ALL,
} from '@components/utils/textVariables'
const ProductCard = dynamic(
  () => import('@components/product/ProductCard/ProductCard')
)

const RecommendedProductCollection = ({
  recommendedProducts,
  deviceInfo,
  config,
}: any) => {
  SwiperCore.use([Navigation])
  const swiperRef: any = useRef(null)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row justify-between">
        <p className="font-semibold uppercase cursor-default font-lg">
          {BTN_RECOMMENDED_PROD}
        </p>
        <p className="font-semibold uppercase cursor-pointer font-lg">
          {BTN_SEE_ALL}
        </p>
      </div>
      <div className="mt-4 mb-4">
        <Swiper
          slidesPerView={5}
          navigation={true}
          loop={true}
          ref={swiperRef}
          breakpoints={{
            320: { slidesPerView: 1, spaceBetween: 2 },
            640: { slidesPerView: 1.1 },
            768: { slidesPerView: 1.1 },
            1024: { slidesPerView: 4.2 },
          }}
        >
          {recommendedProducts.map((product: any, productIdx: number) => {
            return (
              <SwiperSlide
                className="py-0 2xl:w-[300px] w-[25vw] h-full"
                key={`brand-landing-${productIdx}`}
              >
                <ProductCard
                  product={product}
                  deviceInfo={deviceInfo}
                  maxBasketItemsCount={maxBasketItemsCount(config)}
                />
              </SwiperSlide>
            )
          })}
        </Swiper>
      </div>
    </div>
  )
}

export default RecommendedProductCollection
