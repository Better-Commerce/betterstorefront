import { Dialog, Transition } from "@headlessui/react";
import  {XMarkIcon}  from "@heroicons/react/24/outline";
import React, { Fragment } from "react";
import { useTranslation } from '@commerce/utils/use-translation'

const HelpModal = ({ details, isHelpOpen, closeHelpModal, isHelpStatus, chooseHelpMode, onExchangeItem, onReturnItem, onCancelItem, isHelpOrderOpen, closeOrderHelpModal, onCancelOrder, returnRequestedItems, }: any) => {
   const translate = useTranslation();
   let replacement: any = "";
   let returnData: any = "";
   let replacementWindow: any = "";
   let returnWindow: any = "";
   if (isHelpStatus?.customInfo4 != null) {
      if (isHelpStatus != "" && isHelpOpen && isHelpStatus?.customInfo4?.includes("{")) {
         replacement = JSON.parse(isHelpStatus?.customInfo4);
         returnData = JSON.parse(isHelpStatus?.customInfo5);
         if (replacement?.formatted?.data["Replacement Eligibility"] != null) {
            replacementWindow = replacement?.formatted?.data["Replacement Eligibility"]?.replace(/[^0-9]/g, '');
         }
         if (returnData?.formatted?.data["Return Eligibility"] != null) {
            returnWindow = returnData?.formatted?.data["Return Eligibility"]?.replace(/[^0-9]/g, '');
         }
      }
   }

   let retunEligible = true;
   let replacementEligible = true;
   const returnDate = new Date(new Date(details?.orderDate).getTime() + (returnWindow * 24 * 60 * 60 * 1000));
   const replacementDate = new Date(new Date(details?.orderDate).getTime() + (replacementWindow * 24 * 60 * 60 * 1000));
   const currentDate = new Date();

   const shouldDisplayReturnItemCTA =
      isHelpStatus?.shippedQty > 0 &&
      returnRequestedItems[isHelpStatus?.orderLineRecordId] &&
      returnRequestedItems[isHelpStatus?.orderLineRecordId]?.isRMACreated === false &&
      returnRequestedItems[isHelpStatus?.orderLineRecordId]?.statusCode === 'Dispatch'

   if (currentDate > returnDate) { retunEligible = false; }
   if (currentDate > replacementDate) { replacementEligible = false; }
   return (
      <>
         <Transition.Root show={isHelpOpen} as={Fragment}>
            <Dialog as="div" open={isHelpOpen} className="relative z-999" onClose={closeHelpModal}>
               <div className="fixed inset-0 left-0 backdrop-blur-[1px] bg-black opacity-40" />
               <div className="fixed inset-0 overflow-hidden">
                  <div className="absolute inset-0 overflow-hidden">
                     <div className="fixed inset-y-0 right-0 flex pointer-events-none bottom-to-top">
                        <Transition.Child
                           as={Fragment}
                           enter="transform transition ease-in-out duration-500 sm:duration-400"
                           enterFrom="translate-x-full"
                           enterTo="translate-x-0"
                           leave="transform transition ease-in-out duration-500 sm:duration-400"
                           leaveFrom="translate-x-0"
                           leaveTo="translate-x-full"
                        >
                           <Dialog.Panel className="w-screen pointer-events-auto sm:max-w-md">
                              <div className="relative z-50 flex flex-col h-full bg-white shadow-xl mobile-position mob-f-modal-width">
                                 <div className="w-full pt-4 sm:z-10 sm:px-0 sm:pb-2 sm:left-1 ">
                                    <div className='flex justify-between px-4 pb-4 mb-3 border-b sm:px-6'>
                                       <div>
                                          <h3 className="text-base font-semibold text-black dark:text-black">{translate('label.help.getHelpOnItemText')} </h3>
                                          <p className='font-normal text-black font-10'>{isHelpStatus?.name}</p>
                                       </div>
                                       <button
                                          type="button"
                                          className="text-black rounded-md outline-none hover:text-gray-500"
                                          onClick={closeHelpModal}
                                       >
                                          <span className="sr-only">{translate('common.label.closePanelText')}</span>
                                          <XMarkIcon className="relative top-0 w-7 h-7" aria-hidden="true" />
                                       </button>
                                    </div>
                                    <div className="w-full px-4 pt-2 overflow-y-auto sm:px-6 innerscroll">
                                       <div className='w-full'>
                                          <p className='mb-4 font-medium text-black text-14'>{translate('common.label.helpAssistanceText')} </p>
                                          {details?.allowedToReturn && !isHelpStatus?.allowedToExchange && !isHelpStatus?.allowedToReturn &&
                                             <p className='text-black text-medium text-14'>{translate('label.help.returnWindowClosedText1')} {returnWindow} {translate('label.help.returnWindowClosedText1')}</p>
                                          }
                                       </div>
                                       <div className='w-full py-4'>
                                          { shouldDisplayReturnItemCTA && (
                                             <a
                                                href="javascript:void(0);"
                                                onClick={() => onReturnItem("Return")}
                                                className='block w-full px-4 py-2 mb-2 font-bold text-center text-white uppercase bg-gray-900 border rounded-full hover:opacity-90 dark:hover:bg-accent-8 btn-basic-property'>
                                                {translate('label.help.returnItemText')} </a>
                                          )}
                                          {
                                             details?.allowedToCancel && details?.paymentStatus != 0 &&
                                                <a href="javascript:void(0);" className='block w-full px-4 py-2 mb-2 font-bold text-center text-white uppercase bg-gray-900 border rounded-full hover:opacity-90 dark:hover:bg-accent-8 btn-basic-property'
                                                   onClick={() => onCancelItem("Cancel")}>
                                                   {translate('common.label.cancelText')}{' '}{translate('common.label.itemSingularText')}
                                                </a>
                                                
                                          }
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </Dialog.Panel>
                        </Transition.Child>
                     </div>
                  </div>
               </div>
            </Dialog>
         </Transition.Root>

         <Transition.Root show={isHelpOrderOpen} as={Fragment}>
            <Dialog as="div" className="relative z-999" onClose={closeOrderHelpModal}>
               <div className="fixed inset-0 left-0 backdrop-blur-[1px] bg-black opacity-40" />
               <div className="fixed inset-0 overflow-hidden">
                  <div className="absolute inset-0 overflow-hidden">
                     <div className="fixed inset-y-0 right-0 flex pointer-events-none bottom-to-top">
                        <Transition.Child
                           as={Fragment}
                           enter="transform transition ease-in-out duration-500 sm:duration-400"
                           enterFrom="translate-x-full"
                           enterTo="translate-x-0"
                           leave="transform transition ease-in-out duration-500 sm:duration-400"
                           leaveFrom="translate-x-0"
                           leaveTo="translate-x-full"
                        >
                           <Dialog.Panel className="w-full pointer-events-auto md:max-w-md">
                              <div className="relative z-50 flex flex-col h-full bg-white shadow-xl">
                                 <div className="w-full p-0 pt-4 sm:z-10 sm:px-0 sm:pb-2 sm:left-1 sm:top-1">
                                    <div className='flex justify-between px-4 pb-4 mb-3 border-b sm:px-6'>
                                       <div>
                                          <h3 className="text-base font-semibold text-black dark:text-black">{translate('label.orderSummary.getHelpText')}</h3>
                                          <p className='font-medium text-black truncate font-10 max-w-mob'>{isHelpStatus?.name}</p>
                                       </div>
                                       <button
                                          type="button"
                                          className="text-black rounded-md outline-none hover:text-gray-500"
                                          onClick={closeOrderHelpModal}
                                       >
                                          <span className="sr-only">{translate('common.label.closePanelText')}</span>
                                          <XMarkIcon className="relative top-0 w-7 h-7" aria-hidden="true" />
                                       </button>
                                    </div>
                                    <div className="w-full px-4 pt-2 overflow-y-auto sm:px-6 innerscroll">
                                       <div className='w-full'>
                                          <p className='mb-4 font-medium text-black text-14'>{translate('common.label.helpAssistanceText')}</p>
                                          {/* {details.order.allowedToCancel &&
                                             <p className='text-black text-14'>Cancel window is now closed since you've recieved this item.</p>
                                          } */}
                                       </div>
                                       <div className='w-full py-4'>                                          
                                          {details?.allowedToCancel && details?.paymentStatus != 0 &&
                                                <a href="javascript:void(0);" className='w-full mb-2 border rounded-full dark:hover:bg-accent-8 btn-primary btn'
                                                   onClick={() => onCancelOrder("Cancel")}>
                                                   {translate('label.order.cancelOrderText')}
                                                </a>
                                          }
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </Dialog.Panel>
                        </Transition.Child>
                     </div>
                  </div>
               </div>
            </Dialog>
         </Transition.Root>
      </>
   )
}

export default HelpModal;