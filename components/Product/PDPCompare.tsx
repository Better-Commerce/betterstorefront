import ProductSlider from '@components/Product/ProductCompareSlider'
const PDPCompare = ({ pageConfig, name, products, deviceInfo, activeProduct, attributeNames, maxBasketItemsCount, compareProductsAttributes, featureToggle, defaultDisplayMembership, }: any) => {
  return (
    <div className="container px-4 pb-5 mx-auto sm:px-4 md:px-6 lg:px-6 2xl:px-0">
      <ProductSlider config={{ newInCollection: products, limit: 20, }} compareProductsAttributes={compareProductsAttributes} products={products} deviceInfo={deviceInfo} activeProduct={activeProduct} attributeNames={attributeNames} maxBasketItemsCount={maxBasketItemsCount} featureToggle={featureToggle} defaultDisplayMembership={defaultDisplayMembership} />
    </div>
  )
}

export default PDPCompare
