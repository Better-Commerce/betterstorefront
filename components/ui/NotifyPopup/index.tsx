import { Fragment, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useUI } from '@components/ui/context'
import axios from 'axios'
import { NEXT_API_NOTIFY_ME_ENDPOINT } from '@components/utils/constants'
import { validate } from 'email-validator'
import { recordGA4Event } from '@components/services/analytics/ga4'
import { useTranslation } from '@commerce/utils/use-translation'

export default function NotifyUserPopup() {
  const translate = useTranslation();
  const [email, setEmailAddress] = useState('')
  const [isPostedMessage, setIsPosted] = useState('')

  const cancelButtonRef = useRef(null)

  const { closeNotifyUser, productId } = useUI()

  const isValidEmail = validate(email)

  const handleModal = () => {
    const postEmail = async () => {
      const result = await axios.post(
        `${NEXT_API_NOTIFY_ME_ENDPOINT}?email=${email}&productId=${productId}`
      )
      if (result.data) {
        setIsPosted(translate('common.label.successText'))
        setTimeout(() => {
          closeNotifyUser()
        }, 1500)
      } else {
        setIsPosted(translate('common.message.somethingWentWrongMsg'))
        setTimeout(() => {
          closeNotifyUser()
        }, 1500)
      }
    }

    if (email && isValidEmail) postEmail()

    if (typeof window !== "undefined") {
      recordGA4Event(window, 'notify_me', {
        current_page: "PDP"
      });
      recordGA4Event(window, 'notify_click', {
        current_page: "PDP"
      });

      recordGA4Event(window, 'notify_click', {
        current_page: "PDP"
      });
    }
  }

  return (
    <Transition.Root show={true} as={"div"}>
      <Dialog
        as="div"
        className="fixed inset-0 overflow-y-auto z-99"
        initialFocus={cancelButtonRef}
        onClose={closeNotifyUser}
      >
        <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={"div"}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full notify-me-pop">
              <div className="px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-red-100 rounded-full sm:mx-0 sm:h-10 sm:w-10"></div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      {translate('label.product.notifyMeText')}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {translate('label.product.notifyDescText')} </p>
                      {isPostedMessage ? (
                        <div className="font-semibold text-indigo-600">
                          {isPostedMessage}
                        </div>
                      ) : (
                        <form className="flex py-5 mt-2 sm:max-w-md">
                          <label htmlFor="email-address" className="sr-only">
                            {translate('label.newsLetter.emailLabelText')}
                          </label>
                          <input
                            id="email-address"
                            type="text"
                            autoComplete="email"
                            onChange={(e) =>
                              setEmailAddress(e.currentTarget.value)
                            }
                            placeholder={translate('label.myAccount.emailAddressText')}
                            required
                            className="w-full min-w-0 px-4 py-2 text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          />
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {isPostedMessage ? null : (
                <div className="px-4 py-3 bg-gray-50 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                  <button
                    type="button"
                    disabled={!isValidEmail}
                    style={
                      !isValidEmail
                        ? { opacity: '75%', pointerEvents: 'none' }
                        : {}
                    }
                    className="nc-Button relative h-auto inline-flex items-center justify-center rounded-full transition-colors text-sm sm:text-base font-medium py-3 px-4 sm:py-3.5 sm:px-6  ttnc-ButtonPrimary disabled:bg-opacity-90 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 !text-slate-50 dark:text-slate-800 shadow-xl  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-6000 dark:focus:ring-offset-0"
                    onClick={() => handleModal()}
                  >
                    {translate('label.product.notifyMeText')}</button>
                  <button
                    type="button"
                    className="nc-Button relative h-auto inline-flex items-center justify-center rounded-full transition-colors text-sm font-medium py-2.5 px-4 sm:px-6  ttnc-ButtonSecondary bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800  border border-slate-300 dark:border-slate-700  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-6000 dark:focus:ring-offset-0"
                    onClick={closeNotifyUser}
                    ref={cancelButtonRef}
                  >
                    {translate('common.label.cancelText')}
                  </button>
                </div>
              )}
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
