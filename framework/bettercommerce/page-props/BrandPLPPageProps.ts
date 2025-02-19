import { BasePagePropsProvider } from '@framework/contracts/page-props/BasePagePropsProvider'
import { IPagePropsProvider } from '@framework/contracts/page-props/IPagePropsProvider'
import { Redis } from '@framework/utils/redis-constants'
import { getDataByUID, parseDataValue, setData } from '@framework/utils/redis-util'
import commerce from '@lib/api/commerce'
import getCollectionById from '@framework/api/content/getCollectionById'
import getBrandBySlug from '@framework/api/endpoints/catalog/getBrandBySlug'
import { PHASE_PRODUCTION_BUILD } from 'next/constants'
import { tryParseJson } from '@framework/utils/parse-util'
import { mapObject } from '@framework/utils/translate-util'
import isEmpty from 'lodash/isEmpty'
import { getCollectionHeroBannerTransform, getCollectionOfferBannerCollectionTransform, getProductCollectionTransformMap } from '@framework/api/content/getCollectionBySlug'
import { Cookie } from '@framework/utils/constants'

/**
 * Class {BrandPLPPageProps} inherits and implements the base behavior of {BasePagePropsProvider} and {IPagePropsProvider} respectively to return the PageProp values.
 */
export class BrandPLPPageProps extends BasePagePropsProvider implements IPagePropsProvider {

  /**
   * Returns the common PageProp values depending on the page slug.
   * @param param0 
   * @returns 
   */
  public async getPageProps({ slug, cookies }: any) {
    const locale = cookies?.[Cookie.Key.LANGUAGE]

    const cachedDataUID = {
        infraUID: Redis.Key.INFRA_CONFIG + '_' + locale,
        brandSlugUID: Redis.Key.Brands.Slug + '_' + slug + '_' + locale,
        collectionUID: Redis.Key.Brands.Collection + '_' + slug + '_' + locale,
      }
      const cachedData = await getDataByUID([
        cachedDataUID.infraUID,
        cachedDataUID.brandSlugUID,
        cachedDataUID.collectionUID,
      ])
      let infraUIDData: any = parseDataValue(cachedData, cachedDataUID.infraUID)
      let brandBySlugUIDData: any = parseDataValue(cachedData, cachedDataUID.brandSlugUID)
      let collectionUIDData: any = parseDataValue(cachedData, cachedDataUID.collectionUID)
    
      if (!brandBySlugUIDData) {
        brandBySlugUIDData = await getBrandBySlug(slug, cookies)
        await setData([{ key: cachedDataUID.brandSlugUID, value: brandBySlugUIDData }])
      }
    
      if (!infraUIDData) {
        infraUIDData = await commerce.getInfra(cookies)
        await setData([{ key: cachedDataUID.infraUID, value: infraUIDData }])
      }
    
      if (process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD) {
        if (brandBySlugUIDData?.status === "NotFound") {
            return { notFound: true }
        }
      }
    
      const collections: any = {
        imageBannerCollection: !isEmpty(collectionUIDData?.imageBannerCollection) ? mapObject(collectionUIDData?.imageBannerCollection, getCollectionHeroBannerTransform)?.data || null : null,
        imageCategoryCollection: !isEmpty(collectionUIDData?.imageCategoryCollection) ? collectionUIDData?.imageCategoryCollection || []: [],
        imgFeatureCollection: !isEmpty(collectionUIDData?.imgFeatureCollection) ? mapObject(collectionUIDData?.imgFeatureCollection, getCollectionHeroBannerTransform)?.data || null : null,
        offerBannerCollection: !isEmpty(collectionUIDData?.offerBannerCollection) ? mapObject(collectionUIDData?.offerBannerCollection, getCollectionOfferBannerCollectionTransform)?.data || []: [],
        productCollection: mapObject(collectionUIDData?.productCollection, getProductCollectionTransformMap)?.data || [],
      }
    
      try {
        let promises: any = []
        const widgets: any = tryParseJson(brandBySlugUIDData?.result?.widgetsConfig) || []
        if (widgets?.length) {
          widgets?.forEach(async (widget: any) => {
            if (
              widget.manufacturerSettingType == 'ImageCollection' &&
              widget.code == 'HeroBanner'
            ) {
              promises.push(
                new Promise(async (resolve: any, reject: any) => {
                  try {
                    const imageBannerCollection = await getCollectionById(widget.recordId, cookies)
                    collections.imageBannerCollection = !isEmpty(imageBannerCollection) ? mapObject(imageBannerCollection, getCollectionHeroBannerTransform)?.data || null : null
                  } catch (error: any) { }
                  resolve()
                })
              )
            } else if (
              widget.manufacturerSettingType == 'ImageCollection' &&
              widget.code == 'MultipleImageBanner'
            ) {
              promises.push(
                new Promise(async (resolve: any, reject: any) => {
                  try {
                    const res = await getCollectionById(widget.recordId, cookies)
                    collections.imageCategoryCollection = res?.images
                  } catch (error: any) { }
                  resolve()
                })
              )
            } else if (
              widget.manufacturerSettingType == 'ImageCollection' &&
              widget.code == 'HeroBanner'
            ) {
              promises.push(
                new Promise(async (resolve: any, reject: any) => {
                  try {
                    const imgFeatureCollection = await getCollectionById(widget.recordId, cookies)
                    collections.imgFeatureCollection = !isEmpty(imgFeatureCollection) ? mapObject(imgFeatureCollection, getCollectionHeroBannerTransform)?.data || null : null
                  } catch (error: any) { }
                  resolve()
                })
              )
            } else if (
              widget.manufacturerSettingType == 'ImageCollection' &&
              widget.code == 'HeroBanner'
            ) {
              promises.push(
                new Promise(async (resolve: any, reject: any) => {
                  try {
                    const res = await getCollectionById(widget.recordId, cookies)
                    const offerBannerCollection = res?.images
                    collections.offerBannerCollection = !isEmpty(offerBannerCollection) ? mapObject(offerBannerCollection, getCollectionOfferBannerCollectionTransform)?.data || []: []
                  } catch (error: any) { }
                  resolve()
                })
              )
            } else if (
              widget.manufacturerSettingType == 'ProductCollection' &&
              widget.code == 'RecommendedProductCollection'
            ) {
              promises.push(
                new Promise(async (resolve: any, reject: any) => {
                  try {
                    const res = await getCollectionById(widget.recordId, cookies)
                    const productCollection = res?.products?.results
                    collections.productCollection = mapObject(productCollection, getProductCollectionTransformMap)?.data || []
                  } catch (error: any) { }
                  resolve()
                })
              )
            } else if (
              widget.manufacturerSettingType == 'ProductCollection' &&
              widget.code == 'SaleProductCollection'
            ) {
              promises.push(
                new Promise(async (resolve: any, reject: any) => {
                  try {
                    const res = await getCollectionById(widget.recordId, cookies)
                    const saleProductCollection = res?.products?.results
                    collections.saleProductCollection = mapObject(saleProductCollection, getProductCollectionTransformMap)?.data || []
                  } catch (error: any) { }
                  resolve()
                })
              )
            }
          })
        }
    
        if (promises?.length) {
          await Promise.all(promises)
          await setData([{ key: cachedDataUID.collectionUID, value: collections }])
        }
      } catch (error: any) {
        // return console.error(error)
    }

    const allMembershipsUIDData: any = await this.getMembershipPlans({ cookies })
    const defaultDisplayMembership = await this.getDefaultMembershipPlan(allMembershipsUIDData?.result, cookies)
    const pluginConfig = await this.getPluginConfig({ cookies })
    const reviewData = await this.getReviewSummary({ cookies })
    const appConfig = await this.getAppConfig(infraUIDData, cookies)
    const navTreeUIDData = await this.getNavTree({ cookies })
    const keywordsUIDData = await this.getKeywords({ cookies })
    const props = {
      ...collectionUIDData,

      // --- Common STARTS
      navTree: navTreeUIDData,
      pluginConfig,
      reviewData,
      appConfig,
      globalSnippets: infraUIDData?.snippets ?? [],
      snippets: brandBySlugUIDData?.snippets ?? [],
      keywords: keywordsUIDData || [],
      // --- Common ENDS

      slug,
      collections,
      brandDetails: brandBySlugUIDData?.result ?? {},
      defaultDisplayMembership,
    }
    return props
  }
}
