import React, { useState, useEffect } from 'react'
import { useUI } from '@components/ui/context'
import {
  NEXT_ADDRESS,
  NEXT_EDIT_ADDRESS,
  NEXT_CREATE_ADDRESS,
  NEXT_DELETE_ADDRESS,
} from '@components/utils/constants'
import axios from 'axios'
import AddressItem from './AddressItem'
import Form from './AddressBookForm'
import { LoadingDots } from '@components/ui'
import {
  DETAILS_SUCCESS,
  DETAILS_ERROR,
  ADDRESS_BOOK_TITLE,
  DETAILS_SUBTITLE,
  EMPTY_ADDRESS,
  ADD_ADDRESS,
} from '@components/utils/textVariables'
import { CustomerAddressModel } from 'models/customer'
import { recordGA4Event } from '@components/services/analytics/ga4'
import { getCurrentPage } from '@framework/utils/app-util'

export function asyncHandler() {
  function getAddress() {
    return async (id: string) => {
      const response = await axios.post(NEXT_ADDRESS, {
        id,
      })
      return response.data
    }
  }
  function updateAddress() {
    return async (data: CustomerAddressModel) => {
      const response = await axios.post(NEXT_EDIT_ADDRESS, data)
      return response.data
    }
  }
  function createAddress() {
    return async (data: CustomerAddressModel) => {
      const response = await axios.post(NEXT_CREATE_ADDRESS, data)
      return response.data
    }
  }
  function deleteAddress() {
    return async (data: any) => {
      const response = await axios.post(NEXT_DELETE_ADDRESS, data)
      return response.data
    }
  }
  return {
    getAddress: getAddress(),
    updateAddress: updateAddress(),
    createAddress: createAddress(),
    deleteAddress: deleteAddress(),
  }
}

export default function AddressBook({ deviceInfo }: any) {
  const [data, setData] = useState([])
  const [isNewFormMode, setNewFormMode] = useState(false)
  const [title, setTitle] = useState(ADDRESS_BOOK_TITLE)
  const [isLoading, setIsLoading] = useState(true)
  const { getAddress, updateAddress, createAddress, deleteAddress } =
    asyncHandler()

  const { user } = useUI()

  const fetchAddress = async () => {
    !isLoading && setIsLoading(true)
    try {
      const response: any = await getAddress(user.userId)
      setIsLoading(false)
      setData(response)
    } catch (error) {
      console.log(error, 'err')
      failCb()
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAddress()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const success = () => {
    fetchAddress()
    setTitle(DETAILS_SUCCESS)
    window.scrollTo(0, 0)
  }

  const failCb = () => {
    setTitle(DETAILS_ERROR)
    window.scrollTo(0, 0)
  }

  const addNewAddress = async (values: any) => {
    let newValues = { ...values, userId: user.userId }
    let currentPage = getCurrentPage()

    if (typeof window !== 'undefined') {
      if (currentPage) {
        recordGA4Event(window, 'save_new_address', {
          current_page: currentPage,
        })
      }
    }

    return createAddress(newValues)
      .then(() => {
        setNewFormMode(false)
        success()
      })
      .catch(() => failCb())
  }
  return (
    <main className="sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="px-4 sm:px-0">
          <h1 className="font-extrabold tracking-tight text-gray-900">
            {title}
          </h1>
          <p className="mt-2 text-sm text-gray-500">{DETAILS_SUBTITLE}</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto">
        {!data.length && !isLoading && (
          <div className="py-10">{EMPTY_ADDRESS}</div>
        )}
        {isLoading ? <LoadingDots /> : null}
      </div>
      {isNewFormMode && (
        <Form
          initialValues={{}}
          closeEditMode={() => setNewFormMode(false)}
          onSubmit={addNewAddress}
        />
      )}
      {!isNewFormMode && (
        <div className="max-w-4xl mx-auto">
          {data.map((item: any, idx: number) => {
            return (
              <AddressItem
                errCallback={failCb}
                successCallback={success}
                key={idx}
                user={user}
                updateAddress={updateAddress}
                item={item}
                userId={user.userId}
                deleteAddress={deleteAddress}
              />
            )
          })}

          <button
            type="submit"
            onClick={() => {
              setNewFormMode(true)
              window.scrollTo(0, 0)
            }}
            className="max-w-xs flex-1  border border-transparent py-3 px-8 flex items-center justify-center font-medium btn-primary sm:w-full"
          >
            {ADD_ADDRESS}
          </button>
        </div>
      )}
    </main>
  )
}
