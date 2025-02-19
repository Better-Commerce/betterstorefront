"use client";
import React, { FC, useEffect, useState } from "react";
import LikeButton from "@components/LikeButton";
import { StarIcon } from "@heroicons/react/24/solid";
import { HeartIcon } from "@heroicons/react/24/outline";
import Prices from "@components/Prices";
import detail1JPG from "images/products/detail1.jpg";
import detail2JPG from "images/products/detail2.jpg";
import detail3JPG from "images/products/detail3.jpg";
import AccordionInfo from "@components/AccordionInfo";
import Link from "next/link";
import { generateUri } from "@commerce/utils/uri-util";
import { IMG_PLACEHOLDER, ITEM_TYPE_ADDON, ITEM_TYPE_ADDON_10 } from "@components/utils/textVariables";
import AttributesHandler from "@components/Product/AttributesHandler";
import axios from "axios";
import { Messages, NEXT_BULK_ADD_TO_CART, NEXT_CREATE_WISHLIST, NEXT_GET_ORDER_RELATED_PRODUCTS, NEXT_GET_PRODUCT_QUICK_VIEW, NEXT_GET_PRODUCT_REVIEW, NEXT_UPDATE_CART_INFO, SITE_ORIGIN_URL } from "@components/utils/constants";
import ProductTag from "@components/Product/ProductTag";
import { useUI } from "@components/ui";
const Button = dynamic(() => import('@components/ui/IndigoButton'))
import { cartItemsValidateAddToCart, getCurrentPage, logError } from "@framework/utils/app-util";
import { matchStrings, stringFormat } from "@framework/utils/parse-util";
import cartHandler from "@components/services/cart";
import wishlistHandler from "@components/services/wishlist";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.min.css';
import dynamic from "next/dynamic";
import { useTranslation } from "@commerce/utils/use-translation";
import { PRODUCTS } from "./Product/data";
import { Guid } from '@commerce/types';
import { AnalyticsEventType } from "./services/analytics";
import Router from "next/router";
import useAnalytics from "./services/analytics/useAnalytics";
import { EVENTS_MAP } from "./services/analytics/constants";
const Engraving = dynamic(() => import('@components/Product/Engraving'))

export interface ProductQuickViewProps {
  className?: string;
  product?: any;
  maxBasketItemsCount?: any
  onCloseModalQuickView?: any
  featureToggle: any
  defaultDisplayMembership: any
  deviceInfo: any
}

const ProductQuickView: FC<ProductQuickViewProps> = ({ className = "", product, maxBasketItemsCount, onCloseModalQuickView, featureToggle, defaultDisplayMembership, deviceInfo }) => {
  const { recordAnalytics } = useAnalytics()
  const { sizes, variants, status, allOfSizes } = PRODUCTS[0];
  const LIST_IMAGES_DEMO = [detail1JPG, detail2JPG, detail3JPG];
  const { isMobile, isIPadorTablet } = deviceInfo
  const { openNotifyUser, basketId, cartItems, setCartItems, user, openCart, setAlert, removeFromWishlist, addToWishlist, openWishlist, openLoginSideBar, isGuestUser } = useUI()
  const { isInWishList, deleteWishlistItem } = wishlistHandler()
  const [selectedAttrData, setSelectedAttrData] = useState({ productId: product?.recordId, stockCode: product?.stockCode, ...product, })
  const [variantInfo, setVariantInfo] = useState<any>({ variantColour: '', variantSize: '', })
  const [quickViewData, setQuickViewData] = useState<any>(undefined)
  const [reviewData, setReviewData] = useState<any>(undefined)
  const [relatedProducts, setRelatedProducts] = useState<any>(null)
  const [isEngravingOpen, showEngravingModal] = useState(false)
  const [isPersonalizeLoading, setIsPersonalizeLoading] = useState(false)
  const [sizeInit, setSizeInit] = useState('')
  let currentPage = getCurrentPage()
  const translate = useTranslation();
  const handleSetProductVariantInfo = ({ colour, clothSize }: any) => {
    if (colour) {
      setVariantInfo((v: any) => ({
        ...v,
        variantColour: colour,
      }))
    }
    if (clothSize) {
      setVariantInfo((v: any) => ({
        ...v,
        variantSize: clothSize,
      }))
    }
  }
  const productSlug: any = product?.slug;

  const fetchRelatedProducts = async (recordId: string) => {
    const { data: relatedProducts }: any = await axios.post(NEXT_GET_ORDER_RELATED_PRODUCTS, { recordId })
    setRelatedProducts(relatedProducts)
  }

  const handleFetchProductQuickView = (productSlug: any) => {
    const loadView = async (productSlug: string) => {
      const { data: productQuickViewData }: any = await axios.post(NEXT_GET_PRODUCT_QUICK_VIEW, { slug: productSlug })
      const data = productQuickViewData?.product
      const { data: reviewData }: any = await axios.post(NEXT_GET_PRODUCT_REVIEW, { recordId: data?.recordId })
      fetchRelatedProducts(data?.recordId)
      setQuickViewData(data)
      setReviewData(reviewData?.review)
      if (data) {
        setSelectedAttrData({ ...data, productId: data?.recordId, stockCode: data?.stockCode, })
      }
    }
    if (productSlug) loadView(productSlug)
    return []
  }
  const fetchIsQuickView = () => {
    if (product) {
      const loadView = async (slug: string) => {
        const { data: productQuickViewData }: any = await axios.post(
          NEXT_GET_PRODUCT_QUICK_VIEW,
          { slug: slug }
        )

        const { data: reviewData }: any = await axios.post(
          NEXT_GET_PRODUCT_REVIEW,
          { recordId: productQuickViewData?.product?.recordId }
        )

        const data = productQuickViewData?.product
        fetchRelatedProducts(data?.recordId)
        setQuickViewData(data)
        setReviewData(reviewData?.review)
        if (data) {
          setSelectedAttrData({ ...data, productId: data?.recordId, stockCode: data?.stockCode, })
        }
        // console.log('QUICKVIEW_PRODUCTDATA:',productQuickViewData?.product)
      }

      if (product?.slug) loadView(product?.slug)
    } else {
      setQuickViewData(undefined)
    }
    return [product]
  }
  useEffect(() => {

    fetchIsQuickView()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const handleNotification = () => {
    openNotifyUser(product.recordId)
  }

  const buttonTitle = () => {
    let buttonConfig: any = {
      title: translate('label.basket.addToBagText'),
      validateAction: async () => {
        const cartLineItem: any = cartItems?.lineItems?.find((o: any) => {
          if (matchStrings(o.productId, selectedAttrData?.recordId, true) || matchStrings(o.productId, selectedAttrData?.productId, true)) {
            return o
          }
        })
        if (selectedAttrData?.currentStock === cartLineItem?.qty && !selectedAttrData?.fulfilFromSupplier && !selectedAttrData?.flags?.sellWithoutInventory) {
          setAlert({ type: 'error', msg: translate('common.message.cartItemMaxAddedErrorMsg'), })
          return false
        }
        const isValid = cartItemsValidateAddToCart(cartItems, maxBasketItemsCount,)
        if (!isValid) {
          setAlert({
            type: 'error', msg: stringFormat(stringFormat(translate('common.message.basket.maxBasketItemsCountErrorMsg'), { maxBasketItemsCount }), { maxBasketItemsCount, }),
          })
        }
        return isValid
      },
      action: async () => {
        const item = await cartHandler().addToCart(
          {
            basketId: basketId,
            productId: selectedAttrData?.productId,
            qty: 1,
            manualUnitPrice: product?.price?.raw?.withTax,
            stockCode: selectedAttrData?.stockCode,
            userId: user?.userId,
            isAssociated: user?.isAssociated,
          },
          'ADD',
          { product: selectedAttrData }
        )
        setCartItems(item)
        setModalClose()
        if (typeof window !== 'undefined') {
          //debugger
          const extras = { originalLocation: SITE_ORIGIN_URL + Router.asPath }
          recordAnalytics(AnalyticsEventType.ADD_TO_BASKET, { ...product, ...{ ...extras }, cartItems, addToCartType: "Single - From PLP Quick View", itemIsBundleItem: false, entityType: EVENTS_MAP.ENTITY_TYPES.Product, });

          if (currentPage) {
            //debugger
            const extras = { originalLocation: SITE_ORIGIN_URL + Router.asPath }
            recordAnalytics(AnalyticsEventType.VIEW_BASKET, { ...{ ...extras }, cartItems, currentPage, itemListName: 'Quick View', itemIsBundleItem: false, entityType: EVENTS_MAP.ENTITY_TYPES.Product, })
          }
        }
      },
      shortMessage: '',
    }
    if (selectedAttrData?.currentStock <= 0 && !product?.preOrder?.isEnabled && !product?.flags?.sellWithoutInventory) {
      buttonConfig.title = translate('label.product.notifyMeText')
      buttonConfig.action = async () => handleNotification()
      buttonConfig.type = 'button'
    } else if (product?.price?.raw?.withTax == 0) {
      buttonConfig.title = translate('label.product.notifyMeText')
      buttonConfig.action = async () => handleNotification()
      buttonConfig.type = 'button'
    } else if (
      product?.preOrder?.isEnabled &&
      selectedAttrData?.currentStock <= 0
    ) {
      if (
        product.preOrder.currentStock < product.preOrder.maxStock &&
        (!product.flags.sellWithoutInventory ||
          selectedAttrData.sellWithoutInventory)
      ) {
        buttonConfig.title = translate('label.product.preOrderText')
        buttonConfig.shortMessage = product.preOrder.shortMessage
        return buttonConfig
      } else if (
        product.flags.sellWithoutInventory ||
        selectedAttrData.sellWithoutInventory
      ) {
        buttonConfig = {
          title: translate('label.basket.addToBagText'),
          validateAction: async () => {
            const cartLineItem: any = cartItems?.lineItems?.find((o: any) => o.productId === selectedAttrData?.productId?.toUpperCase())
            if (selectedAttrData?.currentStock === cartLineItem?.qty && !selectedAttrData?.fulfilFromSupplier && !selectedAttrData?.flags?.sellWithoutInventory) {
              setAlert({
                type: 'error',
                msg: translate('common.message.cartItemMaxAddedErrorMsg'),
              })
              return false
            }
            const isValid = cartItemsValidateAddToCart(
              cartItems,
              maxBasketItemsCount
            )
            if (!isValid) {
              setAlert({
                type: 'error',
                msg: stringFormat(translate('common.message.basket.maxBasketItemsCountErrorMsg'), { maxBasketItemsCount }),

              })
            }
            return isValid
          },
          action: async () => {
            const item = await cartHandler().addToCart(
              {
                basketId: basketId,
                productId: selectedAttrData?.productId,
                qty: 1,
                manualUnitPrice: product?.price?.raw?.withTax,
                stockCode: selectedAttrData?.stockCode,
                userId: user?.userId,
                isAssociated: user?.isAssociated,
              },
              'ADD',
              { product: selectedAttrData }
            )
            setCartItems(item)
            if (typeof window !== 'undefined') {
              //debugger
              const extras = { originalLocation: SITE_ORIGIN_URL + Router.asPath }
              recordAnalytics(AnalyticsEventType.ADD_TO_BASKET, { ...product, ...{ ...extras }, cartItems, addToCartType: "Single - From PLP Quick View", itemIsBundleItem: false, entityType: EVENTS_MAP.ENTITY_TYPES.Product, });

              if (currentPage) {
                //debugger
                const extras = { originalLocation: SITE_ORIGIN_URL + Router.asPath }
                recordAnalytics(AnalyticsEventType.VIEW_BASKET, { ...{ ...extras }, cartItems, currentPage, itemListName: 'Quick View', itemIsBundleItem: false, entityType: EVENTS_MAP.ENTITY_TYPES.Product, })
              }
            }
          },
          shortMessage: '',
        }
      } else {
        buttonConfig.title = translate('label.product.notifyMeText')
        buttonConfig.action = async () => handleNotification()
        buttonConfig.type = 'button'
        return buttonConfig
      }
    }
    return buttonConfig
  }
  const setModalClose = () => {
    setSelectedAttrData(undefined)
    setQuickViewData(undefined)
    onCloseModalQuickView()
  }

  const isEngravingAvailable =
    !!relatedProducts?.relatedProducts?.filter(
      (item: any) => item?.stockCode === ITEM_TYPE_ADDON
    ).length ||
    !!product?.customAttributes?.filter(
      (item: any) => item?.display == 'Is Enabled'
    ).length

  const buttonConfig = buttonTitle()

  const handleEngravingSubmit = (values: any) => {
    const updatedProduct = {
      ...product,
      ...{
        recordId: selectedAttrData?.productId,
        stockCode: selectedAttrData?.stockCode,
      },
    }
    const addonProducts = relatedProducts?.relatedProducts?.filter((item: any) => item?.itemType === ITEM_TYPE_ADDON_10)
    const addonProductsWithParentProduct = addonProducts?.map((item: any) => {
      item.parentProductId = updatedProduct?.recordId
      return item
    })
    const computedProducts = [
      ...addonProductsWithParentProduct,
      updatedProduct,
    ].reduce((acc: any, obj: any) => {
      acc.push({
        ProductId: obj?.recordId || obj?.productId,
        BasketId: basketId,
        ParentProductId: obj?.parentProductId || null,
        Qty: 1,
        DisplayOrder: obj?.displayOrder || 0,
        StockCode: obj?.stockCode,
        ItemType: obj?.itemType || 0,
        CustomInfo1: values?.line1?.message || null,
        CustomInfo2: values?.line1?.imageUrl || null,
        CustomInfo3: values?.line3 || null,
        CustomInfo4: values?.line4 || null,
        CustomInfo5: values?.line5 || null,
        ProductName: obj?.name,
        ManualUnitPrice: obj?.manualUnitPrice || 0.0,
        PostCode: obj?.postCode || null,
        IsSubscription: obj?.subscriptionEnabled || false,
        IsMembership: obj?.hasMembership || false,
        SubscriptionPlanId: obj?.subscriptionPlanId || null,
        SubscriptionTermId: obj?.subscriptionTermId || null,
        UserSubscriptionPricing: obj?.userSubscriptionPricing || 0,
        GiftWrapId: obj?.giftWrapConfig || null,
        IsGiftWrapApplied: obj?.isGiftWrapApplied || false,
        ItemGroupId: obj?.itemGroupId || 0,
        PriceMatchReqId:
          obj?.priceMatchReqId || '00000000-0000-0000-0000-000000000000',
      })
      return acc
    }, [])

    const asyncHandler = async () => {
      try {
        const newCart = await axios.post(NEXT_BULK_ADD_TO_CART, {
          basketId,
          products: computedProducts,
        })
        await axios.post(NEXT_UPDATE_CART_INFO, {
          basketId,
          info: [...Object.values(values)],
          lineInfo: computedProducts,
        })
        setCartItems(newCart.data)
        showEngravingModal(false)
        openCart()
      } catch (error) {
        logError(error)
      }
    }
    asyncHandler()
  }

  const handleTogglePersonalizationDialog = () => {
    if (!isPersonalizeLoading) showEngravingModal((v) => !v)
  }
  const insertToLocalWishlist = () => {
    addToWishlist(product)
    openWishlist()
  }
  const handleWishList = () => {
    if (!isGuestUser && user?.userId && user?.id != Guid.empty) {
      const product = { ...quickViewData, productId: selectedAttrData.productId, stockCode: selectedAttrData.stockCode, }
      if (isInWishList(product?.productId)) {
        deleteWishlistItem(user?.userId, product?.productId)
        removeFromWishlist(product?.productId)
        openWishlist()
        onCloseModalQuickView()
        return
      }
      let productAvailability = 'Yes'
      if (product?.currentStock > 0) {
        productAvailability = 'Yes'
      } else {
        productAvailability = 'No'
      }

      if (typeof window !== 'undefined') {
        //debugger
        recordAnalytics(AnalyticsEventType.VIEW_WISHLIST, { header: 'PLP', currentPage: 'Quick view ', })
        recordAnalytics(AnalyticsEventType.ADD_TO_WISHLIST, { ...product, productAvailability, header: 'Quick View', currentPage: 'Quick View', })
      }

      if (currentPage) {
        if (typeof window !== 'undefined') {
          //debugger
          recordAnalytics(AnalyticsEventType.VIEW_WISHLIST, { header: 'Quick View', currentPage, })
        }
      }

      const accessToken = localStorage.getItem('user')
      if (accessToken) {
        const createWishlist = async () => {
          try {
            await axios.post(NEXT_CREATE_WISHLIST, {
              id: user.userId,
              productId: product?.productId,
              flag: true,
            })
            insertToLocalWishlist()
          } catch (error) {
            logError(error)
          }
        }
        createWishlist()
        onCloseModalQuickView()
      } else insertToLocalWishlist()
    } else {
      onCloseModalQuickView()
      openLoginSideBar()
    }
  }

  const renderVariants = () => {
    return (
      <div>
        {quickViewData &&
          <AttributesHandler
            product={quickViewData}
            variant={selectedAttrData}
            setSelectedAttrData={setSelectedAttrData}
            variantInfo={variantInfo}
            handleSetProductVariantInfo={handleSetProductVariantInfo}
            handleFetchProductQuickView={handleFetchProductQuickView}
            isQuickView={true}
            sizeInit={sizeInit}
            setSizeInit={setSizeInit} />
        }
      </div>
    );
  };


  const renderStatus = () => {
    if (!status) {
      return null;
    }
    const CLASSES = "absolute top-3 start-3";
    return (
      <div className={CLASSES}>
        <ProductTag product={product} />
      </div>
    )
  };

  const renderSectionContent = () => {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold transition-colors hover:text-primary-6000 dark:text-black">
            <Link href={`/${product?.slug}`} onClick={onCloseModalQuickView}>{selectedAttrData?.name}</Link>
          </h2>
          <div className="flex items-center justify-start mt-5 space-x-4 rtl:justify-end sm:space-x-5 rtl:space-x-reverse">
            <Prices contentClass="py-1 px-2 md:py-1.5 md:px-3 text-lg font-semibold" price={selectedAttrData?.price} listPrice={selectedAttrData?.listPrice} featureToggle={featureToggle} defaultDisplayMembership={defaultDisplayMembership} />
            {selectedAttrData?.reviewCount > 0 &&
              <>
                <div className="h-6 border-s border-slate-300 dark:border-slate-700"></div>
                <div className="flex items-center w-56">
                  <Link href={`/${product?.slug}`} onClick={onCloseModalQuickView} className="flex items-center text-sm font-medium" >
                    <StarIcon className="w-5 h-5 pb-[1px] text-yellow-400" />
                    <div className="ms-1.5 flex">
                      <span className="dark:text-black">{selectedAttrData?.rating}</span>
                      <span className="block mx-2 dark:text-black">·</span>
                      <span className="underline text-slate-600 dark:text-slate-600">
                        {selectedAttrData?.reviewCount} {translate('common.label.reviews')}
                      </span>
                    </div>
                  </Link>
                </div>
              </>
            }
          </div>
        </div>
        <div className="">{renderVariants()}</div>

        <div className="flex rtl:space-x-reverse">
          {!isEngravingAvailable && (
            <div className="flex mt-6 sm:mt-4 !text-sm w-full">
              <Button title={buttonConfig.title} action={buttonConfig.action} buttonType={buttonConfig.type || 'cart'} />
              <button type="button" onClick={handleWishList} className="flex items-center justify-center ml-4 border border-gray-300 rounded-full dark:border-gray-300 hover:bg-red-50 hover:text-pink hover:border-pink btn dark:text-black">
                {isInWishList(selectedAttrData?.productId) ? (
                  <HeartIcon className="flex-shrink-0 w-6 h-6 text-pink" />
                ) : (
                  <HeartIcon className="flex-shrink-0 w-6 h-6 dark:hover:text-pink" />
                )}
                <span className="sr-only"> {translate('label.product.addToFavoriteText')} </span>
              </button>
            </div>
          )}

          {isEngravingAvailable && (
            <>
              <div className="flex mt-6 sm:mt-8 sm:flex-col1">
                <Button className="block py-3 sm:hidden" title={buttonConfig.title} action={buttonConfig.action} buttonType={buttonConfig.type || 'cart'} />
              </div>
              <div className="flex mt-6 sm:mt-8 sm:flex-col1">
                <Button className="hidden sm:block " title={buttonConfig.title} action={buttonConfig.action} buttonType={buttonConfig.type || 'cart'} />
                <button className="flex items-center justify-center flex-1 max-w-xs px-8 py-3 font-medium text-white bg-gray-400 border border-transparent rounded-full sm:ml-4 hover:bg-pink focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-gray-500 sm:w-full" onClick={() => showEngravingModal(true)} >
                  <span className="font-bold"> {translate('label.product.engravingText')} </span>
                </button>
                <button type="button" onClick={handleWishList} className="flex items-center justify-center px-4 py-2 ml-4 text-gray-500 bg-white border border-gray-300 rounded-full hover:bg-red-50 hover:text-pink sm:px-10 hover:border-pink" >
                  {isInWishList(selectedAttrData?.productId) ? (
                    <HeartIcon className="flex-shrink-0 w-6 h-6 text-pink" />
                  ) : (
                    <HeartIcon className="flex-shrink-0 w-6 h-6" />
                  )}
                  <span className="sr-only"> {translate('label.product.addToFavoriteText')} </span>
                </button>
              </div>
            </>
          )}
        </div>
        <hr className=" border-slate-200 dark:border-slate-200"></hr>
        {quickViewData && <AccordionInfo data={[{ name: translate('common.label.descriptionText'), content: product?.description }]} />}
      </div>
    );
  };

  return (
    <div className={`nc-ProductQuickView ${className}`}>
      <div className="lg:flex">
        {isMobile ? (
          <div className="w-full lg:w-[55%]">
            <Swiper
              slidesPerView={1}
              spaceBetween={30}
              navigation
              loop
              className="mySwiper"
            >
              <SwiperSlide>
                <div className="relative">
                  <img
                    src={
                      generateUri(product?.image, 'h=1000&fm=webp') ||
                      IMG_PLACEHOLDER
                    }
                    className="object-cover object-top w-full"
                    alt={product?.name}
                  />
                  {renderStatus()}
                </div>
              </SwiperSlide>
              {product?.images?.map((item: any, index: number) => {
                return (
                  item?.tag != 'specification' && (
                    <SwiperSlide key={index}>
                      <div className="relative">
                        <img
                          src={
                            generateUri(item?.image, 'h=500&fm=webp') ||
                            IMG_PLACEHOLDER
                          }
                          className="object-cover w-full"
                          alt={product?.name}
                        />
                      </div>
                    </SwiperSlide>
                  )
                )
              })}
            </Swiper>
          </div>
        ) : (
          <div className="w-full lg:w-[50%] ">
            <div className="relative">
              <div className="aspect-w-16 aspect-h-16">
                <img
                  src={
                    generateUri(selectedAttrData?.image, 'h=1000&fm=webp') ||
                    IMG_PLACEHOLDER
                  }
                  className="object-cover object-top w-full rounded-xl"
                  alt={selectedAttrData?.name}
                />
              </div>
              {renderStatus()}
            </div>
            <div className="hidden grid-cols-2 gap-3 mt-3 lg:grid sm:gap-6 sm:mt-6 xl:gap-5 xl:mt-5">
              {selectedAttrData?.images
                ?.slice(0, 2)
                .map((item: any, index: number) => {
                  return (
                    <div key={index} className="aspect-w-3 aspect-h-4">
                      <img
                        src={
                          generateUri(item?.image, 'h=400&fm=webp') ||
                          IMG_PLACEHOLDER
                        }
                        className="object-cover object-top w-full rounded-xl"
                        alt={item?.name}
                      />
                    </div>
                  )
                })}
            </div>
          </div>
        )}
        {isEngravingAvailable && (
          <Engraving show={isEngravingOpen} submitForm={handleEngravingSubmit} onClose={() => showEngravingModal(false)} handleToggleDialog={handleTogglePersonalizationDialog} product={selectedAttrData} />
        )}
        <div className="w-full lg:w-[50%] pt-6 lg:pt-0 lg:ps-7 xl:ps-8 pl-1 lg:pl-0 pdp-right-section">
          {renderSectionContent()}
        </div>
      </div>
    </div>
  );
};

export default ProductQuickView;
