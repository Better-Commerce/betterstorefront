import { useState, useEffect } from 'react'
import axios from 'axios'
import dynamic from 'next/dynamic'
import { decrypt, encrypt } from '@framework/utils/cipher'
import { HeartIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { StarIcon } from '@heroicons/react/24/solid'
import { useUI } from '@components/ui/context'
import { KEYS_MAP, EVENTS } from '@components/utils/dataLayer'
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.min.css';
import cartHandler from '@components/services/cart'
import { NEXT_CREATE_WISHLIST, NEXT_BULK_ADD_TO_CART, NEXT_UPDATE_CART_INFO, NEXT_GET_PRODUCT, NEXT_GET_PRODUCT_PREVIEW, NEXT_GET_ORDER_RELATED_PRODUCTS, NEXT_COMPARE_ATTRIBUTE, EmptyString, EngageEventTypes } from '@components/utils/constants'
import eventDispatcher from '@components/services/analytics/eventDispatcher'
import { EVENTS_MAP } from '@components/services/analytics/constants'
import { IMG_PLACEHOLDER, ITEM_TYPE_ADDON, ITEM_TYPE_ADDON_10, ITEM_TYPE_ALTERNATIVE, SLUG_TYPE_MANUFACTURER } from '@components/utils/textVariables'
import { ELEM_ATTR, PDP_ELEM_SELECTORS, } from '@framework/content/use-content-snippet'
import { generateUri } from '@commerce/utils/uri-util'
import _, { groupBy, round } from 'lodash'
import { matchStrings, stringFormat } from '@framework/utils/parse-util'
import { recordGA4Event } from '@components/services/analytics/ga4'
import { getCurrentPage, validateAddToCart, vatIncluded, } from '@framework/utils/app-util'
import { LocalStorage } from '@components/utils/payment-constants'
import wishlistHandler from '@components/services/wishlist'
import AccordionInfo from '@components/AccordionInfo'
import Link from 'next/link'
import { useTranslation } from '@commerce/utils/use-translation'
import { PRODUCTS } from './data'
import DeliveryInfo from './DeliveryInfo'
import ProductDescription from './ProductDescription'
import CacheProductImages from './CacheProductImages'
import RecentlyViewedProduct from '@components/Product/RelatedProducts/RecentlyViewedProducts'
import EngageProductCard from '@components/SectionEngagePanels/ProductCard'
const PDPCompare = dynamic(() => import('@components/Product/PDPCompare'))
const ProductSpecifications = dynamic(() => import('@components/Product/Specifications'))
const ProductTag = dynamic(() => import('@components/Product/ProductTag'))
const ReviewItem = dynamic(() => import('@components/ReviewItem'))
const Prices = dynamic(() => import('@components/Prices'))
const AttributesHandler = dynamic(() => import('@components/Product/AttributesHandler'))
const BreadCrumbs = dynamic(() => import('@components/ui/BreadCrumbs'))
const Bundles = dynamic(() => import('@components/Product/Bundles'))
const Engraving = dynamic(() => import('@components/Product/Engraving'))
const Button = dynamic(() => import('@components/ui/IndigoButton'))
const RelatedProductWithGroup = dynamic(() => import('@components/Product/RelatedProducts/RelatedProductWithGroup'))
const AvailableOffers = dynamic(() => import('@components/Product/AvailableOffers'))
const QuantityBreak = dynamic(() => import('@components/Product/QuantiyBreak'))
declare const window: any
const PLACEMENTS_MAP: any = {
  Head: {
    element: 'head',
    position: 'beforeend',
  },
  PageContainerAfter: {
    element: '.page-container',
    position: 'afterend',
  },
  PageContainerBefore: {
    element: '.page-container',
    position: 'beforebegin',
  },
}

export default function ProductView({ data = { images: [] }, snippets = [], recordEvent, slug, isPreview = false, relatedProductsProp, promotions, pdpCachedImages: cachedImages, reviews, deviceInfo, config, maxBasketItemsCount, allProductsByCategory: allProductsByCategoryProp, campaignData }: any) {
  const translate = useTranslation()
  const { status } = PRODUCTS[0];
  const { openNotifyUser, addToWishlist, openWishlist, basketId, cartItems, setAlert, setCartItems, user, openCart, openLoginSideBar, isGuestUser, setIsCompared, removeFromWishlist, currency, setProductInfo } = useUI()
  const { isMobile, isIPadorTablet } = deviceInfo
  const { isInWishList, deleteWishlistItem } = wishlistHandler()
  const isIncludeVAT = vatIncluded()
  const [product, setUpdatedProduct] = useState<any>(data)
  const [isEngravingOpen, showEngravingModal] = useState(false)
  const [variantInfo, setVariantInfo] = useState<any>({ variantColour: '', variantSize: '', })
  const [isLoading, setIsLoading] = useState(true)
  const [sizeInit, setSizeInit] = useState('')
  const [isPersonalizeLoading, setIsPersonalizeLoading] = useState(false)
  const [fullscreen, setFullscreen] = useState(false);
  const [attributeNames, setAttributeNames] = useState([])
  const [allProductsByCategory, setAllProductsByCategory] = useState<any>(allProductsByCategoryProp)
  const [relatedProducts, setRelatedProducts] = useState<any>(relatedProductsProp)
  const [compareProductsAttributes, setCompareProductAttribute] = useState([])
  const [showMobileCaseButton, setShowMobileCaseButton] = useState(false);
  let currentPage = getCurrentPage()
  const alternativeProducts = relatedProducts?.relatedProducts?.filter((item: any) => item.relatedType == ITEM_TYPE_ALTERNATIVE)


  useEffect(() => {
    if (compareProductsAttributes?.length < 0) return
    let mappedAttribsArrStr: any = compareProductsAttributes?.map((o: any) => o?.customAttributes).flat()
    mappedAttribsArrStr = _.uniq(mappedAttribsArrStr?.map((o: any) => o?.fieldName))
    setAttributeNames(mappedAttribsArrStr)
  }, [compareProductsAttributes])

  const fetchRelatedProducts = async (productId: string) => {
    const { data: relatedProducts }: any = await axios.post(NEXT_GET_ORDER_RELATED_PRODUCTS, { recordId: productId, })
    setRelatedProducts(relatedProducts)
    const alternativeProducts = relatedProducts?.relatedProducts?.filter((item: any) => item?.relatedType == ITEM_TYPE_ALTERNATIVE)
    const stockCodeArray = alternativeProducts?.map((item: { stockCode: any }) => item?.stockCode);
    const newArray = stockCodeArray?.concat(product?.stockCode);

    if (alternativeProducts?.length > 0) {
      const { data: compareDataResult }: any = await axios.post(NEXT_COMPARE_ATTRIBUTE, { stockCodes: newArray || [], compareAtPDP: true })
      setCompareProductAttribute(compareDataResult)
    }
  }
  const [selectedAttrData, setSelectedAttrData] = useState({ productId: product?.recordId, stockCode: product?.stockCode, ...product, })
  useEffect(() => {
    if (allProductsByCategory?.length < 0) return
    let mappedAttribsArrStr = allProductsByCategory?.map((o: any) => o.attributes).flat()
    mappedAttribsArrStr = _.uniq(mappedAttribsArrStr?.map((o: any) => o.display))
    setAttributeNames(mappedAttribsArrStr)
  }, [allProductsByCategory])

  const { ProductViewed } = EVENTS_MAP.EVENT_TYPES
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
  const { Product } = EVENTS_MAP.ENTITY_TYPES
  const fetchProduct = async () => {
    const url = !isPreview ? NEXT_GET_PRODUCT : NEXT_GET_PRODUCT_PREVIEW
    const response: any = await axios.post(url, { slug: slug })
    if (response?.data?.product) {
      fetchRelatedProducts(response?.data?.product?.recordId)
      const recentlyViewedProduct: any = response?.data?.product?.stockCode;
      let viewedProductsList = []
      viewedProductsList = localStorage.getItem(LocalStorage.Key.RECENTLY_VIEWED) ? JSON.parse(decrypt(localStorage.getItem(LocalStorage.Key.RECENTLY_VIEWED) || '[]')) : []
      if (viewedProductsList?.length == 0) {
        viewedProductsList?.push(recentlyViewedProduct)
      } else {
        const checkDuplicate: any = viewedProductsList?.some((val: any) => val === recentlyViewedProduct)
        if (!checkDuplicate) {
          viewedProductsList.push(recentlyViewedProduct)
        }
      }
      localStorage.setItem(
        LocalStorage.Key.RECENTLY_VIEWED,
        encrypt(JSON.stringify(viewedProductsList))
      )
      setProductInfo({
        recordId: response?.data?.product?.recordId,
        variantGroupCode: response?.data?.product?.variantGroupCode,
        productCode: response?.data?.product?.productCode,
      })
    }
    if (response?.data?.product) {
      eventDispatcher(ProductViewed, {
        entity: JSON.stringify({
          id: response?.data?.product?.recordId,
          sku: response?.data?.product?.sku,
          name: response?.data?.product?.name,
          stockCode: response?.data?.product?.stockCode,
          img: response?.data?.product?.image,
        }),
        entityId: response?.data?.product?.recordId,
        entityName: response?.data?.product?.name,
        entityType: Product,
        eventType: ProductViewed,
        omniImg: response?.data?.product?.image,
      })
      setUpdatedProduct(response.data.product)
      setSelectedAttrData({
        productId: response?.data?.product?.recordId,
        stockCode: response?.data?.product?.stockCode,
        ...response?.data?.product,
      })
    }
  }

  let dataForEngage: any = null
  if (typeof window !== 'undefined') {
    // added for engage
    dataForEngage = {
      item: {
        item_id: product?.variantGroupCode || product?.productCode || EmptyString,
        title: product?.name || EmptyString,
        sku: product?.productCode || EmptyString,
        categories: product?.classification?.category || [],
        base_category: product?.classification?.category || EmptyString,
        collection_name: product?.collections ? product?.collections[0]?.name : EmptyString,
        description: product?.fullName || EmptyString,
        product_url: window?.location?.href || EmptyString,
        image_url: product?.image || EmptyString,
        availability: product?.seoAvailability || EmptyString,
        price: product?.price?.maxPrice?.toFixed(2)?.toString() || EmptyString,
        sale_price: product?.price?.minPrice?.toFixed(2)?.toString() || EmptyString,
        brand: product?.brand || EmptyString,
        variant: {
          id: product?.variantGroupCode || product?.productCode || EmptyString,
          title: product?.name || EmptyString,
          sku: product?.productCode || EmptyString,
          image_url: product?.image || EmptyString,
          product_url: window?.location?.href || EmptyString,
          price: product?.price?.maxPrice?.toFixed(2)?.toString() || EmptyString,
          sale_price: product?.price?.minPrice?.toFixed(2)?.toString() || EmptyString,
          availability: product?.seoAvailability || EmptyString,
          metadata: {
            color: product?.customAttributes[0]?.key == "global.colour" ? product?.customAttributes[0]?.value : product?.customAttributes[1]?.value || EmptyString,
            size: product?.customAttributes[2]?.key == "clothing.size" ? product?.customAttributes[2]?.value : product?.customAttributes[3]?.value || EmptyString,
            weight: 0,
            weight_unit: EmptyString,
            make: EmptyString,
            model: product?.brand || EmptyString,
            rating: 0,
          },
        },
        customAttributes: product?.customAttributes || EmptyString,
      },
      item_id: product?.variantGroupCode || product?.productCode || EmptyString,
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined" && dataForEngage && window?.ch_session) {
      window.ch_product_view_before(dataForEngage)
    }
    fetchProduct()
    setIsCompared('true')
  }, [slug, currency])

  useEffect(() => {
    const { entityId, entityName, entityType, entity } = KEYS_MAP
    recordEvent(EVENTS.ProductViewed)
    if (snippets) {
      snippets.forEach((snippet: any) => {
        const domElement = document.querySelector(
          PLACEMENTS_MAP[snippet.placement]?.element
        )
        if (domElement) {
          domElement.insertAdjacentHTML(
            PLACEMENTS_MAP[snippet.placement].position,
            snippet.content
          )
        }
      })
    }
    //this function is triggered when the component is unmounted. here we clean the injected scripts
    return function cleanup() {
      snippets.forEach((snippet: any) => {
        document
          .getElementsByName(snippet.name)
          .forEach((node: any) => node.remove())
      })
      setProductInfo(undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleNotification = () => {
    openNotifyUser(product?.recordId)
  }

  const productImages = product?.images || []
  const productVideos = product?.videos || []
  let content = [{ image: selectedAttrData.image }, ...productImages].filter(
    (value: any, index: number, self: any) =>
      index === self.findIndex((t: any) => t.image === value.image)
  )

  if (product?.videos && product?.videos?.length > 0) {
    content = [...productImages, ...productVideos].filter(
      (value: any, index: number, self: any) =>
        index === self.findIndex((t: any) => t.image === value.image)
    )
  }

  const handleTogglePersonalizationDialog = () => {
    if (!isPersonalizeLoading) showEngravingModal((v) => !v)
  }

  const buttonTitle = () => {
    let buttonConfig: any = {
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
        const isValid = validateAddToCart(
          selectedAttrData?.productId ?? selectedAttrData?.recordId,
          cartItems,
          maxBasketItemsCount
        )
        if (!isValid) {
          setAlert({
            type: 'error',
            msg: stringFormat(stringFormat(translate('common.message.basket.maxBasketItemsCountErrorMsg'), { maxBasketItemsCount }), {
              maxBasketItemsCount,
            }),
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
          recordGA4Event(window, 'add_to_cart', {
            ecommerce: {
              items: [
                {
                  item_name: product?.name,
                  item_brand: product?.brand,
                  item_category2: product?.mappedCategories[1]?.categoryName,
                  item_variant: product?.variantGroupCode,
                  quantity: 1,
                  item_id: product?.productCode,
                  price: product?.price?.raw?.withTax,
                  item_var_id: product?.stockCode,
                  item_list_name: product?.mappedCategories[2]?.categoryName,
                  index: 1,
                },
              ],
              cart_quantity: 1,
              total_value: product?.price?.raw?.withTax,
              current_page: 'PDP',
              section_title: 'Product Detail',
            },
          })
          if (currentPage) {
            recordGA4Event(window, 'view_cart', {
              ecommerce: {
                items: cartItems?.lineItems?.map(
                  (items: any, itemId: number) => ({
                    item_name: items?.name,
                    item_id: items?.sku,
                    price: items?.price?.raw?.withTax,
                    item_brand: items?.brand,
                    item_category2: items?.categoryItems?.length
                      ? items?.categoryItems[1]?.categoryName
                      : '',
                    item_variant: items?.colorName,
                    item_list_name: items?.categoryItems?.length
                      ? items?.categoryItems[0]?.categoryName
                      : '',
                    item_list_id: '',
                    index: itemId,
                    quantity: items?.qty,
                    item_var_id: items?.stockCode,
                  })
                ),
                current_page: currentPage,
              },
            })
          }
          if (window?.ch_session && dataForEngage) {
            window.ch_add_to_cart_before(dataForEngage)
          }
        }
      },
      shortMessage: '',
    }
    if (selectedAttrData?.currentStock <= 0 && !product?.preOrder?.isEnabled && !product?.flags?.sellWithoutInventory) {
      buttonConfig.title = translate('label.product.notifyMeText')
      buttonConfig.action = async () => handleNotification()
      buttonConfig.type = 'button'
    } else if (
      product?.preOrder?.isEnabled &&
      selectedAttrData?.currentStock <= 0
    ) {
      if (
        product?.preOrder?.currentStock < product?.preOrder?.maxStock &&
        (!product?.flags?.sellWithoutInventory ||
          selectedAttrData?.sellWithoutInventory)
      ) {
        buttonConfig.title = translate('label.product.preOrderText')
        buttonConfig.shortMessage = product?.preOrder?.shortMessage
        return buttonConfig
      } else if (
        product?.flags?.sellWithoutInventory ||
        selectedAttrData?.sellWithoutInventory
      ) {
        buttonConfig = {
          title: translate('label.basket.addToBagText'),
          validateAction: async () => {
            const cartLineItem: any = cartItems?.lineItems?.find((o: any) => o.productId === selectedAttrData?.productId?.toUpperCase())
            if (selectedAttrData?.currentStock === cartLineItem?.qty) {
              setAlert({
                type: 'error',
                msg: translate('common.message.cartItemMaxAddedErrorMsg'),
              })
              return false
            }
            const isValid = validateAddToCart(
              selectedAttrData?.productId ?? selectedAttrData?.recordId,
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
              recordGA4Event(window, 'add_to_cart', {
                ecommerce: {
                  items: [
                    {
                      item_name: product?.name,
                      item_brand: product?.brand,
                      item_category2: product?.mappedCategories[1]?.categoryName,
                      item_variant: product?.variantGroupCode,
                      quantity: 1,
                      item_id: product?.productCode,
                      price: product?.price?.raw?.withTax,
                      item_var_id: product?.stockCode,
                      item_list_name: product?.mappedCategories[2]?.categoryName,
                      index: 1,
                    },
                  ],
                  cart_quantity: 1,
                  total_value: product?.price?.raw?.withTax,
                  current_page: 'PDP',
                  section_title: 'Product Detail',
                },
              })
              if (currentPage) {
                recordGA4Event(window, 'view_cart', {
                  ecommerce: {
                    items: cartItems?.lineItems?.map(
                      (items: any, itemId: number) => ({
                        item_name: items?.name,
                        item_id: items?.sku,
                        price: items?.price?.raw?.withTax,
                        item_brand: items?.brand,
                        item_category2: items?.categoryItems?.length ? items?.categoryItems[1]?.categoryName : '',
                        item_variant: items?.colorName,
                        item_list_name: items?.categoryItems?.length ? items?.categoryItems[0]?.categoryName : '',
                        item_list_id: '',
                        index: itemId,
                        quantity: items?.qty,
                        item_var_id: items?.stockCode,
                      })
                    ),
                    current_page: currentPage,
                  },
                })
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
        console.log(error, 'err')
      }
    }
    asyncHandler()
  }

  const isEngravingAvailable =
    !!relatedProducts?.relatedProducts?.filter(
      (item: any) => item?.stockCode === ITEM_TYPE_ADDON
    ).length ||
    !!product?.customAttributes.filter(
      (item: any) => item?.display == 'Is Enabled'
    ).length
  // const isEngravingAvailable:any = true;

  const insertToLocalWishlist = () => {
    addToWishlist(product)
    openWishlist()
  }
  const handleWishList = () => {
    if (isInWishList(product?.recordId)) {
      deleteWishlistItem(user?.userId, product?.recordId)
      removeFromWishlist(product?.recordId)
      openWishlist()
      return
    }
    let productAvailability = 'Yes'
    if (product?.currentStock > 0) {
      productAvailability = 'Yes'
    } else {
      productAvailability = 'No'
    }

    if (typeof window !== 'undefined') {
      recordGA4Event(window, 'wishlist', {
        ecommerce: {
          header: product?.name,
          current_page: 'PDP',
        },
      })

      recordGA4Event(window, 'add_to_wishlist', {
        ecommerce: {
          items: [
            {
              item_name: product?.name,
              item_brand: product?.brand,
              item_category: product?.mappedCategories[0]?.categoryName,
              item_category2: product?.mappedCategories[1]?.categoryName,
              item_variant: product?.variantGroupCode,
              quantity: 1,
              item_id: product?.productCode,
              price: product?.price?.raw?.withTax,
            },
          ],
          item_var_id: product?.stockCode,
          header: 'PDP',
          current_page: 'PDP',
          availability: productAvailability,
        },
      })
    }

    if (currentPage) {
      if (typeof window !== 'undefined') {
        recordGA4Event(window, 'wishlist', {
          ecommerce: {
            header: 'PDP',
            current_page: currentPage,
          },
        })
      }
    }

    const objUser = localStorage.getItem('user')
    if (!objUser || isGuestUser) {
      //  setAlert({ type: 'success', msg:" Please Login "})
      openLoginSideBar()
      return
    }
    if (objUser) {
      const createWishlist = async () => {
        try {
          await axios.post(NEXT_CREATE_WISHLIST, {
            id: user?.userId,
            productId: product?.recordId,
            flag: true,
          })
          insertToLocalWishlist()
        } catch (error) {
          console.log(error, 'error')
        }
      }
      createWishlist()
    } else insertToLocalWishlist()
  }
  const filteredRelatedProducts = relatedProducts?.relatedProducts?.filter((item: any) => item.stockCode !== ITEM_TYPE_ADDON)
  const handleProductBundleUpdate = (bundledProduct: any) => {
    if (bundledProduct && bundledProduct?.id) {
      let clonedProduct = Object.assign({}, product)
      if (clonedProduct && clonedProduct?.componentProducts) {
        setUpdatedProduct(clonedProduct)
      }
    }
  }

  const breadcrumbs = product?.breadCrumbs?.filter((item: any) => item.slugType !== SLUG_TYPE_MANUFACTURER)
  const saving = product?.listPrice?.raw?.withTax - product?.price?.raw?.withTax
  const discount = round((saving / product?.listPrice?.raw?.withTax) * 100, 0)
  const addonPrice = relatedProducts?.relatedProducts?.find((x: any) => x?.itemType == 10)?.price?.formatted?.withTax
  const css = { maxWidth: '100%', height: 'auto' }
  const attrGroup = groupBy(product?.customAttributes, 'key')

  if (!product) {
    return null
  }

  const images = content.map((image: any) => {
    return {
      original: image.image,
      thumbnail: image.image,
    }
  })

  const bundleAddToCart = async () => {
    const item = await cartHandler().addToCart(
      {
        basketId,
        productId: product?.recordId ?? product?.productId,
        qty: 1,
        manualUnitPrice: product?.price?.raw?.withTax,
        stockCode: product?.stockCode,
        userId: user?.userId,
        isAssociated: user?.isAssociated,
      },
      'ADD',
      { product }
    )
    setCartItems(item)
    openCart()
  }

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

//
  useEffect(() => {
    function handleScroll() {
      const addButton = document.getElementById('add-to-cart-button');
      console.log('addButton',addButton)
      if (addButton) {
        const addButtonRect = addButton.getBoundingClientRect();
        const isAddButtonVisible = addButtonRect.top < window.innerHeight;
        setShowMobileCaseButton(isAddButtonVisible);
      }
    }

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // CHECK TRENDING PRODUCTS FROM ENGAGE
  let similarProduct = []
  let recentProduct = []
  if (typeof window !== 'undefined') {
    similarProduct = window.similar_products_sorted_product;
    recentProduct = window.recent_products_product;
  }
  let productDesc = product.description
  if (product?.shortDescription == "") {
    productDesc = product.description
  }

  const renderCustomControls = () => {
    if (fullscreen) {
      return (
        <button className='absolute items-center justify-center rounded flex-end icon-container right-5 z-999 ' onClick={exitFullscreen}>
          <XMarkIcon className="w-8 h-8 mt-3 text-white border-2 rounded-sm hover:text-orange-500 hover:border-orange-500" aria-hidden="true" />
        </button>
      );
    }
    return
  };

  const exitFullscreen = () => {
    if (document) document?.exitFullscreen();
    return
  };

  const customRenderItem = (item: any) => {
    return (
      <div className="flex justify-center image-gallery-image">
        <img src={generateUri(item?.original, "h=2000&fm=webp") || IMG_PLACEHOLDER} alt={product?.name} height={1000} width={1000} className="!object-contain" />
      </div>
    );
  };
  const customRenderThumbInner = (item: any) => {
    return (
      <img src={generateUri(item?.thumbnail, "h=150&fm=webp") || IMG_PLACEHOLDER} alt={product?.name || 'product'} height={150} width={100} />
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

  const renderVariants = () => {
    return (
      <div>
        {product &&
          <AttributesHandler product={product} variant={selectedAttrData} setSelectedAttrData={setSelectedAttrData} variantInfo={variantInfo} handleSetProductVariantInfo={handleSetProductVariantInfo} sizeInit={sizeInit} setSizeInit={setSizeInit} />
        }
      </div>
    );
  };
  const renderDetailSection = () => {
    return (
      <div className="flex flex-col">
        <h2 className="text-2xl font-semibold">{translate('label.product.productDetailsText')}</h2>
        <div dangerouslySetInnerHTML={{ __html: product.description, }} className="hidden mt-2 text-sm text-gray-500 sm:block product-detail-description" />
      </div>
    );
  };
  const detailsConfig = [
    { name: translate('label.product.bundles.descriptionText'), content: productDesc },
    { name: translate('label.orderSummary.shippingText'), content: 'We currently ship in the UK and worldwide. <br /> <br /> We accept payment via PayPal, ClearPay, and major card payment providers (including Visa, Mastercard, Maestro, and Switch) and more. ', },
    { name: translate('common.label.returnsText'), content: 'Items may be returned for a full refund within 14 days from the date an order was received.', }
  ]

  const renderReviews = () => {
    return (
      <>
        <hr className="pt-10 mt-10 sm:pt-10 border-slate-200 dark:border-slate-700" />
        <div className="" id='productReview'>
          <h2 className="flex items-center text-2xl font-semibold">
            <StarIcon className="w-7 h-7 mb-0.5 text-yellow-500" />
            <span className="ml-1.5"> {reviews?.review?.ratingAverage} · {reviews?.review?.productReviews?.length} Reviews</span>
          </h2>

          <div className="mt-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-11 gap-x-28">
              {reviews?.review?.productReviews?.length > 0 && reviews?.review?.productReviews?.map((review: any, reviewIdx: number) => (
                <div key={`review-${reviewIdx}`}>
                  <ReviewItem
                    data={{
                      comment: review?.comment,
                      date: review?.postedOn,
                      name: review?.title,
                      starPoint: review?.rating,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  };
  const renderSectionContent = () => {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold">
            {product?.name}
          </h2>
          <div className="flex items-center justify-start mt-5 space-x-4 rtl:justify-end sm:space-x-5 rtl:space-x-reverse">
            <Prices contentClass="py-1 px-2 md:py-1.5 md:px-3 text-lg font-semibold" price={product?.price} listPrice={product?.listPrice} />

            {reviews?.review?.totalRecord > 0 &&
              <>
                <div className="h-6 border-s border-slate-300 dark:border-slate-700"></div>
                <div className="flex items-center">
                  <Link href={`#productReview`} className="flex items-center text-sm font-medium" >
                    <StarIcon className="w-5 h-5 pb-[1px] text-yellow-400" />
                    <div className="ms-1.5 flex">
                      <span>{reviews?.review?.ratingAverage}</span>
                      <span className="block mx-2">·</span>
                      <span className="underline text-slate-600 dark:text-slate-400">
                        {reviews?.review?.totalRecord} {translate('common.label.reviews')}
                      </span>
                    </div>
                  </Link>
                </div>
              </>
            }
          </div>
        </div>

        <div className="">{renderVariants()}</div>

        {product?.quantityBreakRules?.length > 0 &&
          <QuantityBreak product={product} rules={product?.quantityBreakRules} selectedAttrData={selectedAttrData} />
        }
        {promotions?.promotions?.availablePromotions?.length > 0 && (
          <AvailableOffers currency={product?.price} offers={promotions?.promotions} key={product?.id} />
        )}
        <div id="add-to-cart-button">
          {isMobile ? (
            <>
              {showMobileCaseButton && (
                <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-10">
                  <div className="container mx-auto max-w-7xl p-4">
                    <div className="flex justify-end">
                      <Button title={buttonConfig.title} action={buttonConfig.action} buttonType={buttonConfig.type || 'cart'} />
                    <button type="button" onClick={handleWishList} className="flex items-center justify-center ml-4 border border-gray-300 rounded-full hover:bg-red-50 hover:text-pink hover:border-pink btn">
                      {isInWishList(selectedAttrData?.productId) ? (
                        <HeartIcon className="flex-shrink-0 w-6 h-6 text-pink" />
                      ) : (
                        <HeartIcon className="flex-shrink-0 w-6 h-6" />
                      )}
                      <span className="sr-only"> {translate('label.product.addTofavouriteText')} </span>
                    </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex rtl:space-x-reverse">
              {!isEngravingAvailable && (
                <div className="flex mt-6 sm:mt-4 !text-sm w-full">
                  <Button title={buttonConfig.title} action={buttonConfig.action} buttonType={buttonConfig.type || 'cart'} />
                  <button type="button" onClick={handleWishList} className="flex items-center justify-center ml-4 border border-gray-300 rounded-full hover:bg-red-50 hover:text-pink hover:border-pink btn">
                    {isInWishList(selectedAttrData?.productId) ? (
                      <HeartIcon className="flex-shrink-0 w-6 h-6 text-pink" />
                    ) : (
                      <HeartIcon className="flex-shrink-0 w-6 h-6" />
                    )}
                    <span className="sr-only"> {translate('label.product.addTofavouriteText')} </span>
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
                      {translate('label.product.engravingText')}
                    </button>
                    <button type="button" onClick={handleWishList} className="flex items-center justify-center w-12 h-12 px-4 py-2 ml-4 text-gray-500 bg-white border border-gray-300 rounded-full hover:bg-red-50 hover:text-pink sm:px-2 hover:border-pink" >
                      {isInWishList(selectedAttrData?.productId) ? (
                        <HeartIcon className="flex-shrink-0 w-6 h-6 text-red-700" />
                      ) : (
                        <HeartIcon className="flex-shrink-0 w-6 h-6" />
                      )}
                      <span className="sr-only"> {translate('label.product.addTofavouriteText')} </span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>  
        <hr className=" border-slate-200 dark:border-slate-700"></hr>
        {product && <AccordionInfo data={detailsConfig} />}
        <div className="flex-1 order-6 w-full sm:order-5">
          <DeliveryInfo product={product} grpData={attrGroup} config={config} />
        </div>
      </div>
    );
  };
  return (
    <>
      <CacheProductImages data={cachedImages} setIsLoading={setIsLoading} />
      <main className="container mt-5 lg:mt-11">
        <div className='flex flex-1 mb-4'>
          {breadcrumbs && (
            <BreadCrumbs items={breadcrumbs} currentProduct={product} />
          )}
        </div>
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
                      className="object-cover object-top w-full rounded-2xl"
                      alt={product?.name}
                    />
                    {renderStatus()}
                  </div>
                </SwiperSlide>
                {product?.images?.map((item: any, index: number) => (
                  <SwiperSlide key={index}>
                    <div className="relative">
                      <img
                        src={
                          generateUri(item?.image, 'h=500&fm=webp') ||
                          IMG_PLACEHOLDER
                        }
                        className="object-cover w-full rounded-2xl"
                        alt={product?.name}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          ) : (
            <div className="w-full lg:w-[55%]">
              <div className="relative">
                <div className="relative aspect-w-16 aspect-h-16">
                  <img src={generateUri(product?.image, 'h=1000&fm=webp') || IMG_PLACEHOLDER} className="object-cover object-top w-full rounded-2xl" alt={product?.name} />
                </div>
                {renderStatus()}
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3 sm:gap-6 sm:mt-6 xl:gap-8 xl:mt-8">
                {product?.images?.map((item: any, index: number) => (
                  <div key={index} className="relative aspect-w-11 xl:aspect-w-10 2xl:aspect-w-11 aspect-h-16" >
                    <img src={generateUri(item?.image, 'h=500&fm=webp') || IMG_PLACEHOLDER} className="object-cover w-full rounded-2xl" alt={product?.name} />
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="w-full lg:w-[45%] pt-10 lg:pt-0 lg:pl-7 xl:pl-9 2xl:pl-10">
            {renderSectionContent()}
          </div>
        </div>
        {/* DETAIL AND REVIEW */}
        <div className='flex flex-col w-full pt-4 cart-recently-viewed sm:pt-10'>
          <EngageProductCard productLimit={12} type={EngageEventTypes.ALSO_BOUGHT} campaignData={campaignData} isSlider={true} productPerRow={4} product={product} />
        </div>
        <div className='flex flex-col w-full pt-4 cart-recently-viewed sm:pt-10'>
          <EngageProductCard productLimit={12} type={EngageEventTypes.BOUGHT_TOGETHER} campaignData={campaignData} isSlider={true} productPerRow={4} product={product} />
        </div>
        <div className="mt-12 sm:mt-12">
          {/* {renderDetailSection()} */}
          <hr className="border-slate-200 dark:border-slate-700" />
          <div className="flex flex-col w-full px-0 pt-6 lg:mx-auto sm:container page-container">
            <ProductSpecifications attrGroup={attrGroup} product={product} deviceInfo={deviceInfo} />
          </div>
          {reviews?.review?.productReviews?.length > 0 &&
            renderReviews()
          }
        </div>
        <div className="w-full pt-6 mx-auto lg:max-w-none sm:pt-8">
          {product?.componentProducts && (
            <>
              <Bundles price={isIncludeVAT ? product?.price?.formatted?.withTax : product?.price?.formatted?.withoutTax} products={product?.componentProducts} productBundleUpdate={handleProductBundleUpdate} deviceInfo={deviceInfo} onBundleAddToCart={bundleAddToCart} />
            </>
          )}
          {alternativeProducts?.length > 0 && (
            <div className="flex flex-col w-full px-0 pt-10 pb-6 mx-auto">
              <PDPCompare compareProductsAttributes={compareProductsAttributes} name={data?.brand || ''} pageConfig={config} products={alternativeProducts} deviceInfo={deviceInfo} activeProduct={product} maxBasketItemsCount={maxBasketItemsCount(config)} attributeNames={attributeNames} />
            </div>
          )}
          {relatedProducts?.relatedProducts?.filter((x: any) => matchStrings(x?.relatedType, 'ALSOLIKE', true))?.length > 0 && (
            <>
              <hr className="border-slate-200 dark:border-slate-700" />
              <div className="container flex flex-col w-full px-4 py-10 mx-auto page-container sm:px-4 lg:px-4 2xl:px-0 md:px-4">
                <h3 className="pb-6 text-2xl font-semibold md:text-3xl sm:pb-10"> {translate('label.product.youMayAlsoLikeText')} </h3>
                <RelatedProductWithGroup products={relatedProducts?.relatedProducts} productPerColumn={4} deviceInfo={deviceInfo} maxBasketItemsCount={maxBasketItemsCount} />
              </div>
            </>
          )}
          <div className='flex flex-col w-full pt-4 cart-recently-viewed sm:pt-10'>
            <EngageProductCard productLimit={12} type={EngageEventTypes.SIMILAR_PRODUCTS} campaignData={campaignData} product={product} isSlider={true} productPerRow={4} title="Similar Products" />
          </div>
          <div className='flex flex-col w-full pt-4 cart-recently-viewed sm:pt-10'>
            <EngageProductCard productLimit={12} type={EngageEventTypes.RECENTLY_VIEWED} campaignData={campaignData} isSlider={true} productPerRow={4} product={product} />
          </div>
          <div className='flex flex-col w-full pt-4 cart-recently-viewed sm:pt-10'>
            <EngageProductCard productLimit={12} type={EngageEventTypes.SIMILAR_PRODUCTS_SORTED} campaignData={campaignData} product={product} isSlider={true} productPerRow={4} />
          </div>
          <div className='flex flex-col w-full pt-4 cart-recently-viewed sm:pt-10'>
            <EngageProductCard productLimit={12} type={EngageEventTypes.COLLAB_ITEM_VIEW} campaignData={campaignData} product={product} isSlider={true} productPerRow={4} />
          </div>
          <div className='flex flex-col w-full pt-4 cart-recently-viewed sm:pt-10'>
            <EngageProductCard productLimit={12} type={EngageEventTypes.COLLAB_USER_ITEMS_VIEW} campaignData={campaignData} product={product} isSlider={true} productPerRow={4} />
          </div>
          <div className='flex flex-col w-full pt-4 cart-recently-viewed sm:pt-10'>
            <EngageProductCard productLimit={12} type={EngageEventTypes.COLLAB_ITEM_PURCHASE} campaignData={campaignData} product={product} isSlider={true} productPerRow={4} />
          </div>
          <div className='flex flex-col w-full pt-4 cart-recently-viewed sm:pt-10'>
            <EngageProductCard productLimit={12} type={EngageEventTypes.CROSS_SELL_BY_CATEGORIES} campaignData={campaignData} product={product} isSlider={true} productPerRow={4} />
          </div>
          <div className='flex flex-col w-full pt-4 cart-recently-viewed sm:pt-10'>
            <EngageProductCard productLimit={12} type={EngageEventTypes.CROSS_SELL_ITEMS_SORTED} campaignData={campaignData} product={product} isSlider={true} productPerRow={4} />
          </div>
          <div className={`${ELEM_ATTR}${PDP_ELEM_SELECTORS[0]}`}></div>
          {isEngravingAvailable && (
            <Engraving show={isEngravingOpen} submitForm={handleEngravingSubmit} onClose={() => showEngravingModal(false)} handleToggleDialog={handleTogglePersonalizationDialog} product={product} />
          )}
          <div className="flex flex-col w-full">
            <div className="px-4 mx-auto sm:container page-container sm:px-6">
              <ProductDescription seoInfo={attrGroup} />
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
