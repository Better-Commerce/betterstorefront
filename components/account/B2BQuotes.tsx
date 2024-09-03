import Spinner from '@components/ui/Spinner'
import React, { useState } from 'react'
import QuoteDetail from './QuoteDetail'
import { useTranslation } from '@commerce/utils/use-translation'
import { DATE_FORMAT, QuoteStatus } from '@components/utils/constants'
import moment from 'moment'

function B2BQuotes({ quotes }: any) {
  const translate = useTranslation()
  const [quoteData, setQuoteDetail] = useState<any>(undefined)
  const [isOpen, setIsOpen] = useState(false)

  const showQuoteDetail = (quote: any) => {
    setQuoteDetail(quote)
    setIsOpen(true)
  }

  const handleCloseQuoteView = () => {
    setQuoteDetail(null)
  }

  const quoteId: any = quoteData?.quoteId

  return (
    <section className="w-full">
      {!quotes ? (<Spinner />) : (
        <>
          <div className="flex flex-col p-0 py-3 gap-y-6 sm:py-8 sm:p-0">
            {quotes?.map((quote: any, Idx: any) => (
              <div key={Idx} className={`flex flex-col px-6 py-4 border rounded-2xl gap-y-2 ${quote?.status == QuoteStatus.CONVERTED ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-slate-200'}`} >
                <div className="flex justify-between gap-x-6">
                  <h2 className="font-semibold mob-font-14 sm:text-2xl font-Inter text-brand-blue">
                    {quote?.quoteName != "" ? (
                      <>
                        {`${quote?.customQuoteNo} -`} {quote?.quoteName}
                      </>
                    ) : (
                      <>
                        {`${quote?.customQuoteNo}`} {quote?.rfqNumber !="" && ` - ${quote?.rfqNumber}`}
                      </>
                    )}

                  </h2>
                  <button className='px-6 py-1 font-semibold text-white rounded-full bg-sky-800 font-14 hover:bg-sky-600' onClick={() => showQuoteDetail(quote)}>{translate('common.label.viewText')}</button>
                </div>
                <div className='flex justify-normal'>
                  <span className={`px-4 py-2 text-sm font-semibold leading-none truncate rounded-full ${quote?.status == QuoteStatus.CONVERTED ? 'label-confirmed' : 'label-pending'}`}>
                    {quote?.status == QuoteStatus.ABANDONED ? 'Abandoned' : quote?.status == QuoteStatus.CANCELLED ? 'Cancelled' : quote?.status == QuoteStatus.CONVERTED ? 'Converted' : quote?.status == QuoteStatus.DRAFT ? 'Draft' : quote?.status == QuoteStatus.NOT_QUOTE ? 'Not Quote' : quote?.status == QuoteStatus.PAYMENT_LINK_SENT ? 'Payment Link Sent' : quote?.status == QuoteStatus.QUOTE_SENT ? 'Quote Sent' : ''}
                  </span>
                </div>
                {quote?.status != QuoteStatus.CONVERTED && quote?.status != QuoteStatus.PAYMENT_LINK_SENT &&
                  <div className="flex flex-col gap-y-2 sm:gap-y-0 sm:flex-row gap-x-6">
                    <span className="font-Inter font-light leading-4 mob-font-14 text-sm tracking-[2%]">
                      <span className='font-semibold text-black'>Valid Until:</span> {moment(new Date(quote?.validUntil)).format(DATE_FORMAT)}                      
                    </span>
                    <span className="font-Inter font-light leading-4 mob-font-14 text-sm tracking-[2%]">
                      <span className='font-semibold text-black'>Validity Days:</span> {`${quote?.validDays} ${translate('label.product.productSidebar.daysText')}`}
                    </span>
                  </div>
                }
                <div className="flex flex-col gap-y-2 sm:gap-y-0 sm:flex-row gap-x-6">
                  <span className="font-Inter font-light leading-4 text-sm tracking-[2%]">
                    <span className='font-semibold text-black'>{translate('label.companyUsers.usernameText')} </span> {quote?.userName}
                  </span>
                  <span className="font-Inter font-light leading-4 text-sm tracking-[2%]">
                    <span className='font-semibold text-black'>{translate('label.companyUsers.emailText')}</span> {quote?.email}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <QuoteDetail isQuoteViewOpen={Boolean(quoteData)} handleCloseQuoteView={handleCloseQuoteView} quoteId={quoteId} isOpen={isOpen} quoteData={quoteData} />
        </>
      )}
    </section>
  )
}

export default B2BQuotes
