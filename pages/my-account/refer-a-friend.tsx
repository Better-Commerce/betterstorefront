import { useState, useEffect } from 'react'
import withDataLayer, { PAGE_TYPES } from '@components/withDataLayer'
import withAuth from '@components/utils/withAuth'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { EVENTS_MAP } from '@components/services/analytics/constants'
import useAnalytics from '@components/services/analytics/useAnalytics'
import { useUI } from '@components/ui/context'
import React from 'react'
import { Disclosure } from '@headlessui/react'
import { Transition } from '@headlessui/react'
import axios from 'axios'
import {
  NEXT_REFERRAL_BY_EMAIL,
  NEXT_REFERRAL_INFO,
  NEXT_REFERRAL_INVITE_SENT,
  NEXT_REFERRAL_VOUCHERS,
  SITE_ORIGIN_URL,
} from '@components/utils/constants'
import {
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline'
import Spinner from '@components/ui/Spinner'
import { useTranslation } from '@commerce/utils/use-translation'
import LayoutAccount from '@components/Layout/LayoutAccount'
import { IPagePropsProvider } from '@framework/contracts/page-props/IPagePropsProvider'
import { getPagePropType, PagePropType } from '@framework/page-props'
import { AnalyticsEventType } from '@components/services/analytics'

function ReferralPage() {
  const { recordAnalytics } = useAnalytics()
  const { user, isGuestUser, changeMyAccountTab } = useUI()
  const router = useRouter()
  const [isShow, setShow] = useState(true)
  const translate = useTranslation()
  const { Customer } = EVENTS_MAP.ENTITY_TYPES
  const [active, setActive] = useState(false)
  const [referralLink, setReferralLink] = useState('')
  const [referralOffers, setReferralOffers] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [vouchersEarned, setVouchersEarned] = useState<any>(null)
  const [referralInfo, setReferralInfo] = useState({
    id: '',
    userId: '',
    name: '',
    slug: '',
    invitesSent: 0,
    clickOnInvites: 0,
    successfulInvites: 0,
  })
  const REFERRAL_CODE_INSTRUCTIONS = <><p className="px-5">
    Just tell your friends to mention your Referral Code
  </p></>

  const REFERRAL_INSTRUCTIONS = <> All they need to do to get their reward is to
    click on the Link asking if they've <b>Been referred
      by a friend?</b> in the checkout and enter Referral
    Code.</>

  const handleInviteSent = async (referralId: any) => {
    let inviteInfo = await axios.post(NEXT_REFERRAL_INVITE_SENT, {
      referralId: referralInfo?.id,
    })
  }

  const dateConverter = (dateString: any) => {
    let date = new Date(dateString)
    return date.toLocaleDateString()
  }
  const handleVouchers = async (userId: any) => {
    let { data: referralVouchers } = await axios.post(NEXT_REFERRAL_VOUCHERS, {
      userId: userId,
    })

    if (referralVouchers?.referralDetails) {
      setVouchersEarned(referralVouchers?.referralDetails)
    }
  }

  useEffect(() => {
    if (typeof window !== undefined) {
      const hostname =
        typeof window !== 'undefined' && window.location.hostname
          ? window.location.hostname
          : ''
      setReferralLink(
        'https://' + hostname + '/?referral-code=' + (referralInfo?.slug || '')
      )
    }
  }, [referralInfo?.slug])

  useEffect(() => {
    const getReferralOffers = async () => {
      let { data: referralProgram } = await axios.post(NEXT_REFERRAL_INFO)
      if (referralProgram?.referralDetails?.refereePromo) {
        setReferralOffers(referralProgram?.referralDetails)
      }
    }
    getReferralOffers()
  }, [])

  useEffect(() => {
    setIsLoading(true)
    const fetchReferralInfo = async () => {
      let { data: referralInfo } = await axios.post(NEXT_REFERRAL_BY_EMAIL, {
        email: user?.email,
      })
      if (referralInfo?.referralDetails) {
        setReferralInfo(referralInfo?.referralDetails)
        handleVouchers(referralInfo?.referralDetails?.userId)
        setIsLoading(false)
      }
    }
    fetchReferralInfo()
  }, [])

  useEffect(() => {
    if (isGuestUser) {
      router.push('/')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(()=>{
    changeMyAccountTab(translate('label.myAccount.referAFriendText'))
  },[])

  let loggedInEventData: any = { eventType: AnalyticsEventType.CUSTOMER_PROFILE_VIEWED, entityType: Customer, }

  if (user && user.userId) {
    loggedInEventData = { ...loggedInEventData, ...user, }
  }

  const handleClick = () => {
    setActive(!active)
  }
  useAnalytics(AnalyticsEventType.CUSTOMER_PROFILE_VIEWED, loggedInEventData)

  return (
    <>

            {isLoading ? (
              <Spinner />
            ) : (
              <div
                className={`relative col-span-9 px-10 lg:col-span-8 md:col-span-8 border-l tabpanel-sm mob-tab-full ${isShow ? `` : ''
                  }`}
              >
                <div className={'orders bg-white my-2 sm:my-6 pl-2'}>
                  <h1 className="px-5 py-2 font-bold dark:text-black">
                    {referralInfo?.successfulInvites > 0
                      ? referralInfo?.successfulInvites == 1
                        ? `1 ${translate('label.myAccount.successfulInviteHeadingText')}`
                        : `${referralInfo?.successfulInvites} ${translate('label.myAccount.successfulInvitesHeadingText')}`
                      : translate('label.myAccount.noInvitesText')}
                  </h1>
                  <div className="w-full border-t-[1px] mt-4 border-gray-300 border-b-[1px] ">
                    <div className="border-b-[1px] border-gray-300 flex flex-row justify-between px-5 py-2">
                      <p className="text-sm font-semibold text-black ">
                        {translate('label.myAccount.invitesSentText')}
                      </p>
                      <p className="text-sm font-semibold text-black">
                        {referralInfo?.invitesSent}
                      </p>
                    </div>
                    <div className="flex flex-row justify-between px-5 py-2">
                      <p className="text-sm font-semibold text-black">
                        {translate('label.myAccount.clicksOnInvitesText')}
                      </p>
                      <p className="text-sm font-semibold text-black">
                        {referralInfo?.clickOnInvites}
                      </p>
                    </div>
                  </div>
                  {/* Tell them in person section */}
                  <Disclosure defaultOpen={true}>
                    {({ open }) => (
                      <div className="border-b-[1px] border-gray-300 pt-2">
                        <Disclosure.Button className="flex justify-between w-full px-5 py-2 text-sm font-medium text-left text-gray-500 focus-visible:ring-opacity-75 link-button">
                          <div className="flex flex-row items-center justify-between w-full ">
                            <h2 className="text-sm font-semibold text-black capitalize">
                              {translate('label.myAccount.shareInPersonBtnText')}
                            </h2>
                            <span className="w-5 h-5 text-gray-500">
                              {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
                            </span>
                          </div>
                        </Disclosure.Button>
                        <Transition
                          enter="transition duration-100 ease-out"
                          enterFrom="transform scale-95 opacity-0"
                          enterTo="transform scale-100 opacity-100"
                          leave="transition duration-75 ease-out"
                          leaveFrom="transform scale-100 opacity-100"
                          leaveTo="transform scale-95 opacity-0"
                        >
                          <Disclosure.Panel className="px-0 pt-4 pb-2 text-sm text-gray-800">
                            <div className="px-0 text-sm">
                              {REFERRAL_CODE_INSTRUCTIONS}
                              <div className="px-5 my-4 text-sm">
                                {translate('label.myAccount.yourFriendsEnterText')}
                                <h2 className="text-lg text-black">
                                  {referralInfo?.slug}{' '}
                                  {/* {user?.firstName+" "+ user?.lastName} */}
                                </h2>
                              </div>
                              <div className="px-5 text-sm leading-relaxed ">
                                {REFERRAL_INSTRUCTIONS}
                              </div>
                            </div>
                          </Disclosure.Panel>
                        </Transition>
                      </div>
                    )}
                  </Disclosure>
                  {/* Share by email section */}
                  <Disclosure defaultOpen={false}>
                    {({ open }) => (
                      <div className="border-b-[1px] border-gray-300 pt-2">
                        <Disclosure.Button className="flex justify-between w-full px-5 py-2 text-sm font-medium text-left text-gray-500 focus-visible:ring-opacity-75 link-button">
                          <div className="flex flex-row items-center justify-between w-full ">
                            <h2 className="text-sm font-semibold text-black capitalize">
                              {translate('label.myAccount.shareByEmailHeadingText')}
                            </h2>
                            <span className="w-5 h-5 text-gray-500">
                              {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
                            </span>
                          </div>
                        </Disclosure.Button>
                        <Transition
                          enter="transition duration-100 ease-out"
                          enterFrom="transform scale-95 opacity-0"
                          enterTo="transform scale-100 opacity-100"
                          leave="transition duration-75 ease-out"
                          leaveFrom="transform scale-100 opacity-100"
                          leaveTo="transform scale-95 opacity-0"
                        >
                          <Disclosure.Panel className="px-0 pt-4 pb-2 text-sm text-gray-800">
                            <div className="px-5 py-2 text-sm">
                              <p>{translate('label.myAccount.shareReferralByEmail')}</p>
                              <Link
                                href={`mailto:?body=${referralOffers?.refereePromo}, Just use the following link: ${referralLink}&subject=Your friend has sent you a gift!`}
                                className="font-bold"
                                onClick={handleInviteSent}
                              >
                                {translate('label.myAccount.shareReferralLinkByEmailBtnText')}
                              </Link>
                            </div>
                          </Disclosure.Panel>
                        </Transition>
                      </div>
                    )}
                  </Disclosure>
                  {/* Vouchers Earned Section */}
                  <Disclosure defaultOpen={false}>
                    {({ open }) => (
                      <div className="border-b-[1px] border-gray-300 pt-2">
                        <Disclosure.Button className="flex justify-between w-full px-5 py-2 text-sm font-medium text-left text-gray-500 focus-visible:ring-opacity-75 link-button">
                          <div className="flex flex-row items-center justify-between w-full ">
                            <h2 className="text-sm font-semibold text-black capitalize">
                              {translate('label.myAccount.vouchersEarnedHeadingText')}
                            </h2>
                            <span className="w-5 h-5 text-gray-500">
                              {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
                            </span>
                          </div>
                        </Disclosure.Button>
                        <Transition
                          enter="transition duration-100 ease-out"
                          enterFrom="transform scale-95 opacity-0"
                          enterTo="transform scale-100 opacity-100"
                          leave="transition duration-75 ease-out"
                          leaveFrom="transform scale-100 opacity-100"
                          leaveTo="transform scale-95 opacity-0"
                        >
                          <Disclosure.Panel className="px-0 pt-4 pb-2 text-sm text-gray-800">
                            <div className="px-5 py-2 text-sm">
                              {vouchersEarned?.length > 0 ? (
                                <div className="flex flex-col">
                                  <table className='border-separate border-spacing-y-3'>
                                    <thead>
                                      <tr>
                                        <th>{translate('label.myAccount.referralText')}</th>
                                        <th>{translate('label.myAccount.orderStatusText')}</th>
                                        <th>{translate('label.myAccount.VoucherText')}</th>
                                        <th>{translate('label.checkout.offerText')}</th>
                                        <th>{translate('label.myAccount.valifFromText')}</th>
                                        <th>{translate('label.myAccount.validTillText')}</th>
                                        <th>{translate('label.myAccount.ClaimedText')}</th>
                                      </tr>
                                    </thead>
                                    <tbody className="">
                                      {vouchersEarned?.map(
                                        (voucher: any, Idx: any) => {
                                          return (
                                            <tr key={Idx} className="py-2 my-2">
                                              <td className='text-center border-b-[1px] flex flex-col'>
                                                {voucher?.refereeFirstName && voucher?.refereeLastName && (
                                                  <span>
                                                    {voucher?.refereeFirstName + " " + voucher?.refereeLastName}
                                                  </span>
                                                )
                                                }
                                                <span>
                                                  {voucher?.refereeUserName}
                                                </span>
                                              </td>
                                              <td className='text-center border-b-[1px]'>
                                                {voucher?.refereeOrderStatusText}
                                              </td>
                                              <td className="text-center border-b-[1px]">
                                                {voucher?.voucherCode !== '' ? voucher?.voucherCode : "Voucher Not Valid yet"}
                                              </td>
                                              <td className="text-center border-b-[1px]">
                                                {voucher?.promoName}
                                              </td>
                                              <td className="text-center border-b-[1px]">
                                                {dateConverter(
                                                  voucher?.validFrom
                                                )}
                                              </td>
                                              <td className="text-center border-b-[1px]">
                                                {dateConverter(
                                                  voucher?.validTo
                                                )}
                                              </td>
                                              <td className="text-center border-b-[1px]">
                                                {voucher?.claimedOn !== "0001-01-01T00:00:00" && dateConverter(
                                                  voucher?.claimedOn
                                                )}
                                                {voucher?.claimedOn === "0001-01-01T00:00:00" && (
                                                  "Not Claimed"
                                                )

                                                }
                                              </td>

                                            </tr>
                                          )
                                        }
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <p>{translate('label.myAccount.noVouchersEarnedYetMsg')}</p>
                              )}
                            </div>
                          </Disclosure.Panel>
                        </Transition>
                      </div>
                    )}
                  </Disclosure>
                </div>
              </div>
            )}
    </>
  )
}

ReferralPage.LayoutAccount = LayoutAccount

export async function getServerSideProps(context: any) {
  const { locale } = context
  const props: IPagePropsProvider = getPagePropType({ type: PagePropType.COMMON })
  const pageProps = await props.getPageProps({ cookies: context?.req?.cookies })

  return {
    props: {
      ...pageProps,
    },
  }
}

export default withDataLayer(withAuth(ReferralPage), PAGE_TYPES.ReferFriend, true, LayoutAccount)
