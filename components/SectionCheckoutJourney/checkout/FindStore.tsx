import React, { useState } from 'react'
import { LoadingDots, useUI } from '@components/ui'
import { AlertType } from '@framework/utils/enums'
import axios from 'axios'
import { NEXT_CLICK_AND_COLLECT } from '@components/utils/constants'
import { useTranslation } from '@commerce/utils/use-translation'
import { metresToMiles } from '@framework/utils/parse-util'

interface FindStoreProps {
  readonly basket: any
  onStoreSelected: (store: any) => void
}

const FindStore: React.FC<FindStoreProps> = ({ basket, onStoreSelected }) => {
  const translate = useTranslation()
  const { setAlert } = useUI()
  const [postCode, setPostCode] = useState<any>(null)
  const [stores, setStores] = useState<any>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [selectedStore, setSelectedStore] = useState<any>(null)

  // Function to fetch stores based on postcode
  const handleFetchStores = async (e: any) => {
    e.preventDefault()
    try {
      if (!postCode) return
      setLoading(true)

      const items = basket?.lineItems?.length ? basket?.lineItems?.map((item: any) => ({ stockCode: item?.stockCode, qty: item?.qty })) : []
      //const { data } = await axios.post(NEXT_STORE_LOCATOR, {
      const { data } = await axios.post(NEXT_CLICK_AND_COLLECT, {
        items,
        postCode,
      })
      setLoading(false)
      if (data?.length) {
        setStores(data)
      } else {
        setStores(null)
        setAlert({ type: AlertType.ERROR, msg: translate('common.message.noStoreFoundErrorMsg') })
      }
    } catch (error) {
      console.error(error)
    }
  }

  // Function to handle store selection
  const handleStoreSelection = (store: any) => {
    setSelectedStore(store)
    onStoreSelected(store)
  }

  // Function to handle collection from selected store
  // const handleCollectFromStore = () => {
  //     onStoreSelected(selectedStore);
  // };

  const handlePostCode = (e: any) => {
    const { value } = e.target
    setPostCode(value.trim())
    if (!value) {
      setStores(null)
      setSelectedStore(null)
      onStoreSelected(null)
    }
  }

  const lessThanAMileTextKey = 'label.checkout.lessThanAMileText'

  return (
    <div className="flex flex-col gap-2 my-4 bg-white rounded-md sm:p-4 sm:border sm:border-gray-200 sm:bg-gray-50">
      <h5 className="font-semibold uppercase font-18 dark:text-black">
        {translate('label.store.findStoreNearYouText')}
      </h5>
      <form onSubmit={handleFetchStores} className="grid border border-gray-200 sm:border-0 rounded-md sm:rounded-none sm:p-0 p-2 grid-cols-1 mt-0 bg-[#fbfbfb] sm:bg-transparent sm:mt-4 gap-2">
        <input
          type="text"
          className="font-semibold text-black placeholder:text-gray-400 placeholder:font-normal checkout-input-field dark:bg-white dark:text-black input-check-default rounded"
          placeholder={translate('common.label.enterPostcodePlaceholder')}
          value={postCode}
          onChange={handlePostCode}
        />
        <button className="px-1 py-3 mb-4 border border-black btn-primary lg:py-2 sm:px-4">
          {loading ? <LoadingDots /> : translate('label.store.findStoresText')}
        </button>
      </form>
      {stores?.length > 0 && (
        <div>
          {stores?.map((store: any) => (
            <>
              <div
                key={store.Id}
                onClick={() => handleStoreSelection(store)}
                className={`${selectedStore?.Id === store?.Id
                  ? 'bg-gray-200'
                  : 'bg-white border-gray-200'
                  } sm:p-4 p-2 border cursor-pointer rounded mb-1`}
              >
                <div className="flex justify-start w-full gap-0 sm:gap-3">
                  <div className="check-panel">
                    <span
                      className={`rounded-check rounded-full check-address ${selectedStore?.Id === store?.Id
                        ? 'bg-black border border-black'
                        : 'bg-white border border-gray-600'
                        }`}
                    ></span>
                  </div>
                  <div>
                    <div>
                      <h2 className="text-base font-semibold mb-1">
                        {store?.Name}
                      </h2>
                      <span className="text-gray-500 mb-1 font-semibold">
                        {metresToMiles(store?.DistanceInMetres) < 0.1 ? <>{translate(lessThanAMileTextKey)}</> : <>{metresToMiles(store?.DistanceInMetres)}{' '}{translate('label.checkout.milesText')}</>}
                      </span>
                      <br />
                      {store?.AvailableToCollectIn && <span className="text-black mr-1 text-base">
                        {store?.AvailableToCollectIn}
                      </span>}
                      <br />
                      {/* <p className="text-black mb-1">{store.City}</p>
                        <span className="text-black mr-1 text-base">
                          {store?.PostCode}
                        </span> */}
                    </div>
                  </div>

                  {
                    selectedStore?.Id === store?.Id && (
                      <div>
                        <span className="text-black mr-1 text-base">
                          {store?.Address1}
                        </span>
                        <br />
                        <span className="text-black mr-1 text-base">
                          {store?.Address2}
                        </span>
                        <br />
                        <span className="text-black mr-1 text-base">
                          {store?.City}{' '}{store?.PostCode}
                        </span>
                        <br />
                        <span className="text-black mr-1 text-base">
                          {store?.County}
                        </span>
                      </div>
                    )
                  }
                </div>
                {/* {selectedStore?.id === store.id && (
                      <button className='ml-8 px-1 py-3 mb-2 border border-black btn-primary lg:py-2 sm:px-4' onClick={handleCollectFromStore}>Collect from Store</button>
                  )} */}
              </div>
            </>
          ))}
        </div>
      )}
    </div>
  )
}

export default FindStore
