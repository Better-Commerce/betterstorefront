import SizeInline from './SizeInline'
import Dropdown from './Dropdown'
import InlineList from './InlineList'
import { useRouter } from 'next/router'

import { useState, useEffect } from 'react'
import attributesGenerator, {
  getAttributesFromSlug,
  productLookup,
} from '@components/utils/attributesGenerator'
import { cloneDeep } from 'lodash'
import { recordGA4Event } from '@components/services/analytics/ga4'

const ATTR_COMPONENTS: any = {
  HorizontalList: (props: any) => <InlineList {...props} />,
  SizeInline: (props: any) => <SizeInline {...props} />,
}

const TEMP_MAP: any = {
  'global.colour': ATTR_COMPONENTS['HorizontalList'],
  'clothing.size': ATTR_COMPONENTS['SizeInline'],
}

export default function AttributesHandler({
  product,
  setSelectedAttrData,
  variant,
  variantInfo,
  handleSetProductVariantInfo,
  isQuickView = false,
  handleFetchProductQuickView,
  setVariantInfo,
  componentAttributeKey = '',
  sizeInit,
  setSizeInit,
}: any) {
  const {
    attributes,
    variantAttributes = [],
    variantProducts,
    slug: productSlug,
  } = product
  const [fieldData, setFieldData] = useState({
    'global.colour': '',
    'clothing.size': '',
  })
  const [mapComponents, setMapComponents] = useState<any>({})

  useEffect(() => {
    if (!!componentAttributeKey.length) {
      setMapComponents({
        [componentAttributeKey]: TEMP_MAP[componentAttributeKey],
      })
    } else {
      setMapComponents(TEMP_MAP)
    }
  }, [componentAttributeKey])

  const router = useRouter()

  const slug = productSlug || `products/${router.query.slug}`

  const originalAttributes = getAttributesFromSlug(slug, variantProducts) || {}

  const generatedAttrCombination = Object.fromEntries(
    Object.entries(originalAttributes).slice(0, 1)
  )
  const [attrCombination, setAttrCombination] = useState(
    generatedAttrCombination
  )

  useEffect(() => {
    setFieldData({
      'global.colour': variantInfo.variantColour,
      'clothing.size': variantInfo.variantSize,
    })
  }, [variantInfo])

  // const generateLink = (fieldCode: any, value: any) => {
  //   let slug = ''
  //   variantProducts.find((item: any) => {
  //     item.attributes.find((option: any) => {
  //       const isFieldCode = option.fieldCode === fieldCode
  //       const isFieldValue = option.fieldValue === value
  //       if (isFieldCode && isFieldValue) {
  //         slug = item.slug
  //       }
  //     })
  //   })
  //   return slug
  // }

  const generateLink = (fieldData: any) => {
    let slug = ''
    for (let i = 0; i < variantProducts.length; i++) {
      const attributes = variantProducts[i].attributes
      const isFound = attributes.every(
        (attribute: any) =>
          fieldData[attribute.fieldCode] &&
          fieldData[attribute.fieldCode] === attribute.fieldValue
      )
      if (isFound) {
        slug = variantProducts[i].slug
        break
      }
    }
    return slug
  }

  const handleChange = (fieldCode: string, value: string, fieldSet: any) => {
    const updatedFieldData: any = {
      ...fieldData,
      [fieldCode]: value,
    }

    if (typeof window !== 'undefined') {
      recordGA4Event(window, 'view_item', {
        ecommerce: {
          items: {
            item_name: product?.name,
            item_brand: product?.brand,
            item_category: product?.mappedCategories[1]?.categoryName,
            item_category2: product?.mappedCategories[0]?.categoryName,
            item_variant: product?.variantGroupCode,
            quantity: 1,
            item_id: product?.productCode,
            item_var_id: product?.stockCode,
            price: product?.price?.raw?.withTax,
          },
          section_title: 'PLP',
          value: product?.price?.raw?.withTax,
        },
      })
      recordGA4Event(window, 'color_change', {
        category: product?.mappedCategories[1]?.categoryName,
        color_clicked: updatedFieldData[KEY_COLOR],
        // color_category: objValue?.fieldGroupName,
        product_name: product?.name,
        item_var_id: product?.stockCode,
        item_id: product?.productCode,
        // position: idx + 1
      })
    }

    // for quickview
    if (isQuickView) {
      const colour = updatedFieldData[KEY_COLOR]
      const clothSize = updatedFieldData[KEY_SIZE]
      handleFetchProductQuickView({
        slug: fieldSet?.slug || null,
        colour,
        clothSize,
        fieldSet,
      })
      return
    }

    // for pdp
    if (fieldSet?.slug) {
      router.push(`/${fieldSet?.slug}`)
    }
  }

  const handleChangeOld = (fieldCode: string, value: string, fieldSet: any) => {
    const updatedFieldData: any = {
      ...fieldData,
      [fieldCode]: value,
    }
    setFieldData(updatedFieldData)
    const slug = generateLink(updatedFieldData)
    if (slug) {
      if (isQuickView) {
        const colour = updatedFieldData[KEY_COLOR]
        const clothSize = updatedFieldData[KEY_SIZE]
        handleFetchProductQuickView({ slug, colour, clothSize, fieldSet })
      } else {
        router.push(`/${slug}`)
      }
    }
  }

  const getStockPerAttribute = (key: string, variant: string) => {
    let productData = {
      stock: 0,
      productId: '',
      isPreOrderEnabled: false,
      sellWithoutInventory: false,
      stockCode: '',
    }
    // const slug = `products/${router.query.slug}`
    variantProducts.find((product: any) => {
      product?.attributes?.forEach((attr: any) => {
        if (
          key.toLowerCase() === attr.fieldCode.toLowerCase() &&
          attr.fieldValue === variant
          // product.slug === slug
        ) {
          productData.stock = product.currentStock
          productData = { ...productData, ...product }
        }
      })
    })
    return productData
  }

  //temporary until DisplayTemplate is implemented
  const isCustomAttr = product.variantAttributes?.length > 2

  //product.variantAttributes=product.variantAttributes?.reverse();

  const generateOptions = (option: any) => {
    const isInOrder =
      Object.keys(originalAttributes).findIndex(
        (i: string) => i === option.fieldCode
      ) -
        Object.keys(attrCombination).length ===
        0 || Object.keys(attrCombination).includes(option.fieldCode)

    const isLastItem = Object.keys(attrCombination).pop() === option.fieldCode
    if (isInOrder) {
      if (
        isCustomAttr &&
        Object.keys(attrCombination).length > 1 &&
        !isLastItem
      ) {
        const entriesFromCombination = () => {
          return Object.fromEntries(Object.entries(attrCombination).slice(-1))
        }
        const generatedAttributes = attributesGenerator(
          entriesFromCombination(),
          variantProducts
        )
        return generatedAttributes
          .map((item: any) => {
            if (option.fieldCode === item.fieldCode) {
              return item
            }
          })
          .filter((el) => el)
      } else return option.fieldValues
    } else return []
  }

  const handleAttrCombinations = (key: string, value: any) => {
    setAttrCombination((prevValue: any) => {
      let newValue = prevValue
      const existingValueIndex = Object.keys(prevValue).findIndex(
        (i: any) => i === key
      )
      newValue[key] = value
      if (existingValueIndex > -1) {
        newValue = Object.fromEntries(
          Object.entries(newValue).slice(0, existingValueIndex + 1)
        )
        return newValue
      }
      newValue = { ...newValue, [key]: value }
      return newValue
    })
  }

  const handleSelectedAttrData = (value: any) => {
    if (isCustomAttr) {
      if (
        Object.keys(attrCombination).length ===
        Object.keys(originalAttributes).length
      ) {
        const currentProduct = productLookup(
          variantProducts,
          attrCombination
        )[0]

        if (currentProduct) setSelectedAttrData(currentProduct)
      }
    } else setSelectedAttrData(value)
  }

  const DefaultComponent: any = () => null
  const stateAttributes: any = attrCombination

  let a = []

  const KEY_COLOR = 'global.colour'
  const KEY_SIZE = 'clothing.size'
  const KEY_ATTRIBUTES = [KEY_COLOR, KEY_SIZE]

  const matchAttributes =
    variantAttributes && variantAttributes.length
      ? variantAttributes.filter((x: any) =>
          KEY_ATTRIBUTES.includes(x.fieldCode)
        )
      : false
  const sortAttributes =
    matchAttributes && matchAttributes.length === KEY_ATTRIBUTES.length
  const tempVariantAttrs = variantAttributes?.map((x: any, index: number) => {
    return { ...x, ...{ displayOrder: index + 1 } }
  })

  //JSON?.parse(JSON?.stringify(tempVariantAttrs))
  const newVariantAttrs = sortAttributes
    ? cloneDeep(tempVariantAttrs)?.map((x: any, index: number) => {
        if (x.fieldCode === KEY_SIZE || x.fieldCode === KEY_COLOR) {
          if (x.fieldCode === KEY_COLOR) {
            x.displayOrder = tempVariantAttrs?.find(
              (x: any) => x.fieldCode === KEY_COLOR
            )?.displayOrder
          } else if (x.fieldCode === KEY_SIZE) {
            x.displayOrder = tempVariantAttrs?.find(
              (x: any) => x.fieldCode === KEY_SIZE
            )?.displayOrder
          }
          return x
        }
        return x
      })
    : tempVariantAttrs

  return (
    <>
      {newVariantAttrs
        ?.sort((first: any, second: any) => {
          return first.displayOrder - second.displayOrder
        })
        ?.map((option: any, idx: number) => {
          const optionsToPass = generateOptions(option)
          const originalAttribute = isCustomAttr
            ? stateAttributes[option.fieldCode]
            : originalAttributes[option.fieldCode]
          const Component =
            ATTR_COMPONENTS[option.inputType] ||
            // TEMP_MAP[option.fieldCode] ||
            mapComponents[option.fieldCode] ||
            DefaultComponent
          return (
            <div key={idx}>
              <Component
                currentAttribute={originalAttribute}
                getStockPerAttribute={getStockPerAttribute}
                items={option.fieldValues}
                label={option.fieldName}
                isDisabled={!optionsToPass.length}
                onChange={handleChange}
                setSelectedAttrData={handleSelectedAttrData}
                fieldCode={option.fieldCode}
                productId={product.id}
                setAttrCombination={handleAttrCombinations}
                generateLink={generateLink}
                product={product}
                variant={variant}
                handleSetProductVariantInfo={handleSetProductVariantInfo}
                sizeInit={sizeInit}
                setSizeInit={setSizeInit}
              />
            </div>
          )
        })}
    </>
  )
}
