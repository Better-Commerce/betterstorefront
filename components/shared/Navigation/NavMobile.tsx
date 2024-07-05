"use client";

import React from "react";
import { Disclosure } from "@headlessui/react";
import { NavItemType } from "./NavigationItem";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import SocialsList from "../SocialsList/SocialsList";
import SwitchDarkMode from "../SwitchDarkMode/SwitchDarkMode";
import ButtonClose from "../ButtonClose/ButtonClose";
import ButtonPrimary from "../Button/ButtonPrimary";
import { Logo, useUI } from "@components/ui";
import { useTranslation } from "@commerce/utils/use-translation";
import { removePrecedingSlash, sanitizeRelativeUrl } from "@framework/utils/app-util";

export interface NavMobileProps {
  data?: NavItemType[];
  onClickClose?: () => void;
  navItems?: any;
  featureToggle?: any
}

const NavMobile: React.FC<NavMobileProps> = ({ data, navItems, onClickClose, featureToggle }) => {
  const { setShowSearchBar, openBulkAdd, isGuestUser, user } = useUI()
  const _renderMenuChild = (item: any, itemClass = "pl-3 text-neutral-900 dark:text-neutral-900 font-medium ") => {
    return (
      <ul className="pb-1 pl-6 text-base nav-mobile-sub-menu">
        {item?.navBlocks?.map((i: any, index: number) => (
          <Disclosure key={index} as="li">
            <div className={`flex text-sm rounded-lg capitalize hover:bg-neutral-100 dark:hover:bg-neutral-100 mt-0.5 pr-4 ${itemClass}`} >
              <span className={`py-2.5 ${!i?.children ? "block w-full" : ""}`}>
                {i?.boxTitle.toLowerCase()}
              </span>
              {i?.navItems?.length > 0 && (
                <span className="flex items-center flex-grow" onClick={(e) => e.preventDefault()} >
                  <Disclosure.Button as="span" className="flex justify-end flex-grow" >
                    <ChevronDownIcon className="w-4 h-4 ml-2 text-slate-500" aria-hidden="true" />
                  </Disclosure.Button>
                </span>
              )}
            </div>
            {i?.navItems && (
              <Disclosure.Panel>
                <ul className="grid grid-cols-2 pl-3 mt-2 space-2 nav-submenu-level">
                  {i?.navItems?.map((child: any, cIdx: number) => (
                    <li key={cIdx} className={`${child?.itemType ? "menuIsNew" : ""}`} onClick={onClickClose}>
                      <Link className="font-normal capitalize text-slate-600 font-14 hover:text-black dark:text-slate-600 dark:hover:text-black " href={i?.navBlockType == 9 ? `collection${sanitizeRelativeUrl(`/${child?.itemLink}`)}` : `${sanitizeRelativeUrl(`/${child?.itemLink}`)}`} >
                        {child?.caption.toLowerCase()}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Disclosure.Panel>
            )}
          </Disclosure>
        ))}
      </ul>
    );
  };


  const _renderItem = (item: any, index: number) => {
    return (
      <Disclosure key={index} as="li" className="text-slate-900 dark:text-slate-900" >
        <Link className="flex w-full items-center py-2.5 px-4 font-medium uppercase tracking-wide text-sm hover:bg-slate-100 dark:hover:bg-slate-100 rounded-lg" href={sanitizeRelativeUrl(`/${item?.hyperlink}`)} >
          <span className={!item?.children ? "block w-full" : ""} onClick={onClickClose} >
            {item?.caption}
          </span>
          {item?.navBlocks?.length > 0 && (
            <span className="flex-grow block" onClick={(e) => e.preventDefault()} >
              <Disclosure.Button as="span" className="flex justify-end flex-grow" >
                <ChevronDownIcon className="w-4 h-4 ml-2 text-neutral-500" aria-hidden="true" />
              </Disclosure.Button>
            </span>
          )}
        </Link>
        {item?.navBlocks?.length > 0 && (
          <Disclosure.Panel>{_renderMenuChild(item)}</Disclosure.Panel>
        )}
      </Disclosure>
    );
  };

  const renderMagnifyingGlassIcon = () => {
    return (
      <svg width={22} height={22} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" >
        <path d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 22L20 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  const renderSearchForm = () => {
    const translate = useTranslation();
    return (
      <form action="" method="POST" className="flex-1 text-slate-900 dark:text-slate-200" >
        <div className="flex items-center h-full px-4 py-2 space-x-1 bg-slate-50 dark:bg-slate-800 rounded-xl">
          {renderMagnifyingGlassIcon()}
          <input type="search" placeholder={translate('common.label.typeAndPressEnterText')} className="w-full text-sm bg-transparent border-none focus:outline-none focus:ring-0 " />
        </div>
        <input type="submit" hidden value="" />
      </form>
    );
  };

  return (
    <div className="w-full h-screen py-2 overflow-y-auto transition transform bg-white divide-y-2 shadow-lg ring-1 dark:ring-neutral-700 dark:bg-white divide-neutral-100 dark:divide-neutral-800">
      <div className="px-5 pb-2">
        <Logo />
        <span className="absolute p-1 right-2 top-4">
          <ButtonClose onClick={onClickClose} />
        </span>
      </div>
      <ul className="flex flex-col px-2 py-6 space-y-1">
        {navItems?.map(_renderItem)}
        {featureToggle?.features?.enableStoreLocator &&
          <Disclosure as="li" className="text-slate-900 dark:text-white" >
            <Link className="flex w-full items-center py-2.5 px-4 font-medium uppercase tracking-wide text-sm hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" href={`/store-locator`} >
              <span className="" onClick={onClickClose} >
                Stores
              </span>
            </Link>
          </Disclosure>
        }
        {!isGuestUser && user.userId && featureToggle?.features?.enableMyStoreFeature &&
          <Disclosure as="li" className="py-4 text-black border bg-slate-50 dark:text-white border-slate-200 rounded-xl">
            <div className="flex w-full items-center pb-2.5 px-4 font-semibold tracking-wide text-sm hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" >
              My Fashion Store
            </div>
            <Link onClick={onClickClose} className="flex items-center w-full px-4 py-1 font-normal tracking-wide rounded-lg font-12 hover:bg-slate-100 dark:hover:bg-slate-800" href={`/my-store`} passHref >
              <span>Browsing History</span>
            </Link>
            <Link onClick={onClickClose} className="flex items-center w-full px-4 py-1 font-normal tracking-wide rounded-lg font-12 hover:bg-slate-100 dark:hover:bg-slate-800" href={`/my-store/recommendations`} passHref >
              <span>Recommended For You</span>
            </Link>
            <Link onClick={onClickClose} className="flex items-center w-full px-4 py-1 font-normal tracking-wide rounded-lg font-12 hover:bg-slate-100 dark:hover:bg-slate-800" href={`/my-store/improve-recommendations`} passHref >
              <span>Improve Your Recommendation</span>
            </Link>
            <Link onClick={onClickClose} className="flex items-center w-full px-4 py-1 font-normal tracking-wide rounded-lg font-12 hover:bg-slate-100 dark:hover:bg-slate-800" href={`/my-account`} passHref >
              <span>Your Profile</span>
            </Link>
          </Disclosure>
        }
      </ul>
    </div >
  );
};

export default NavMobile;
