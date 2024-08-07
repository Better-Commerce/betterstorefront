import cn from 'classnames'
import s from './index.module.css'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import classNames from 'classnames'
import { Button, LoadingDots } from '@components/ui'
import { ClipboardIcon } from '@heroicons/react/24/outline'
import ClipboardFill from '@heroicons/react/24/solid/ClipboardIcon'
import { useTranslation } from '@commerce/utils/use-translation'

interface ReferralCardProps {
  className?: string
  title: string
  description?: string
  hide?: boolean
  action?: React.ReactNode
  onInputChange?: any
  onNewReferral?: any
  isLoading?: any
  voucher?: any
  errors?: any
}

const ReferralCard: React.FC<React.PropsWithChildren<ReferralCardProps>> = ({
  title,
  description,
  className,
  action,
  hide,
  onInputChange,
  onNewReferral,
  isLoading,
  voucher,
  errors,
}) => {
  const translate = useTranslation()
  const [show, setShow] = useState(hide||!!voucher)
  const [copied, setCopied] = useState(false)
  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(voucher?.voucherCode)
      setCopied(true)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }
  const rootClassName = cn(
    s.root,
    {
      transform: true,
      'translate-y-0 opacity-100 relative px-3 py-3 !w-[400px] ': show,
      'translate-y-full opacity-0 relative': !show,
    },
    className
  )
  return (
    <div className={classNames(show ? 'block' : 'hidden', '')}>
      <div className={rootClassName}>
          <span
            className="h-5 w-5 cursor-pointer absolute top-4 right-4"
            onClick={() => {
              setShow(!show)
            }}
          >
            <XMarkIcon />
          </span>
        
        <div className='rounded-full bg-gray-100 px-2 py-2'>
            <svg viewBox="0 0 1024 1024" className="h-12 w-12 icon" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M809.6 532.7v327.1c0 15.1-12.3 27.5-27.5 27.5H563.4V532.7h246.2zM454.4 532.7v354.5H238.9c-15.2 0-27.5-12.3-27.5-27.5v-327h243z" fill="#FFE085"></path><path d="M860.9 398.1v96.2c0 15.1-12.3 27.5-27.5 27.5h-270V370.6h270c15.2 0 27.5 12.3 27.5 27.5zM454.4 370.6v151.1H187.6c-15.2 0-27.5-12.3-27.5-27.5V398c0-15.1 12.3-27.5 27.5-27.5H454.4z" fill="#FFF0C2"></path><path d="M871.9 398.1v96.2c0 21.2-17.3 38.5-38.5 38.5h-12.8v327.1c0 21.2-17.3 38.5-38.5 38.5H238.9c-21.2 0-38.5-17.3-38.5-38.5V532.7h-12.8c-21.2 0-38.5-17.3-38.5-38.5V398c0-21.2 17.3-38.5 38.5-38.5h121.9c-25.3-14.4-42.4-41.5-42.4-72.6 0-46.1 37.5-83.7 83.6-83.7 28.2 0 48.4 8.6 68.4 26.9-4.5-15.3-4.7-32.1-0.2-48.2 6.2-22.4 20.8-41.6 39.9-52.6 19.4-11.2 41.9-14.1 63.5-8.4 21.6 5.8 39.6 19.6 50.8 39 16.7 28.9 19.2 58.7 7.4 93.2 28.1-34.4 51.7-50 89.8-50 46.1 0 83.7 37.5 83.7 83.7 0 31.1-17.1 58.2-42.4 72.6h121.9c21.1 0.2 38.4 17.5 38.4 38.7z m-11 96.2v-96.2c0-15.1-12.3-27.5-27.5-27.5h-270v151.1h270c15.2 0 27.5-12.3 27.5-27.4z m-51.3 365.5V532.7H563.4v354.5h218.7c15.2 0.1 27.5-12.3 27.5-27.4z m-66.7-572.9c0-40.1-32.6-72.7-72.7-72.7-41.8 0-64.7 21.9-100.3 70.9l-49.2 74.4h149.5c40.1 0.1 72.7-32.5 72.7-72.6z m-190.2 0.2c28.3-49.1 31.6-85.5 10.8-121.5-9.7-16.8-25.4-28.8-44.1-33.9-6.3-1.7-12.6-2.5-18.9-2.5-12.6 0-25 3.3-36.2 9.8-16.6 9.6-29.3 26.4-34.8 46-5.5 19.7-3.1 40.4 6.4 56.9l73.6 109.2 43.2-64z m-0.3 600.2V370.6h-42.9l-0.1 0.1-0.1-0.1h-44v516.7h87.1z m-52.1-527.7L451 285c-35.5-48.8-58.4-70.7-100.2-70.7-40.1 0-72.7 32.6-72.7 72.7s32.6 72.6 72.7 72.6h149.5z m-45.9 527.7V532.7h-243v327.1c0 15.1 12.3 27.5 27.5 27.5h215.5z m0-365.6V370.6H187.6c-15.2 0-27.5 12.3-27.5 27.5v96.2c0 15.1 12.3 27.5 27.5 27.5h266.8z" fill="#EF4668"></path><path d="M670.2 214.3c40.1 0 72.7 32.6 72.7 72.7s-32.6 72.6-72.7 72.6H520.7l49.2-74.4c35.6-49.1 58.6-70.9 100.3-70.9zM563.5 165.6c20.8 36 17.5 72.4-10.8 121.5l-43.3 64-73.6-109.2c-9.5-16.5-11.8-37.2-6.4-56.9 5.5-19.6 18.1-36.4 34.8-46 11.2-6.5 23.6-9.8 36.2-9.8 6.3 0 12.7 0.8 18.9 2.5 18.9 5.1 34.5 17.1 44.2 33.9zM552.4 589.5v297.8h-87V370.6h44l0.1 0.1v-0.1h42.9v162.1zM451 285l49.3 74.6H350.8c-40.1 0-72.7-32.6-72.7-72.6 0-40.1 32.6-72.7 72.7-72.7 41.7 0 64.7 21.8 100.2 70.7z" fill="#F59A9B"></path></g></svg>
        </div>
        {!voucher ? (
          <>
            <span className="block md:inline">{title}</span>
            <span className="block mb-6 md:inline md:mb-0 md:ml-2 font-normal text-center">
              {description}
            </span>
            <form
              onSubmit={onNewReferral}
              className="flex items-center flex-col w-full justify-center gap-3"
            >
              <input
                type="email"
                placeholder={translate('common.message.enterYourEmailText')}
                className="bg-gray-100 rounded-lg w-full px-6 py-3"
                onChange={onInputChange}
              />
              {errors!=='' && (
                <div className='text-red-700'>
                  {errors}
                </div>
              )}
              <Button
                type="submit"
                className="mx-5 !text-xs  !px-4 rounded btn-c btn-primary"
                // onClick={onInputChange}
              >
                {isLoading ? <LoadingDots /> : translate('label.referral.claimText')}
              </Button>
            </form>
          </>
        ) : (
          <>
          {/*If Referral code sent on email view*/}
          {/* <span className="block md:inline">{title}</span>
            <span className="block mb-6 md:inline md:mb-0 md:ml-2 text-center">
              Check your email for your Discount coupon
            </span>
            <span className='text-sm text-gray-500 text-center font-normal'>
              We will send the discount code to your email
            </span>
            <span>
              {/*terms and conditions*}
            </span> */}
            <span className="block md:inline">
              {translate('label.referral.successText')}
            </span>
            <span className="block mb-6 md:inline md:mb-0 md:ml-2">
              <div className="py-2 flex flex-row border-[1px] my-5 items-center justify-center border-gray-600">
                <p className="px-3 !mt-0 text-center font-bold ">
                  {translate('label.checkout.voucherCodeText')}: {voucher?.voucherCode}
                </p>
                <div className="w-5 m-0 " onClick={handleCopyClick}>
                  {!copied ? (
                    <ClipboardIcon className="flex justify-center items-center" />
                  ) : (
                    <ClipboardFill className="flex justify-center items-center" />
                  )}
                </div>
              </div>
              <p className="px-5 text-center font-bold">
                {translate('label.checkout.offerText')}: {voucher?.promoName}
              </p>
              <p className="px-5 text-center font-bold">
                {translate('common.label.validitytext')}:{' '}
                {translate('label.referral.offerValidText')} {`${voucher?.validityDays}`} {translate('common.label.daysText')}
              </p>
              <p className="px-12 text-center">
                {translate('common.label.availGiftText')}
              </p>
            </span>
          </>
        )}
      </div>
    </div>
  )
}

export default ReferralCard
