//import { toNumber } from 'lodash'
import { stringToBoolean, stringToNumber } from './parse-util'
// import { toNumber } from 'lodash'; cannot apply toMumber from loadash as it breaks the build process ,Error :Dynamic Code Evaluation (e. g. 'eval', 'new Function', 'WebAssembly.compile') not allowed in Edge Runtime

export const STATIC_PAGE_CACHE_INVALIDATION_IN_MINS = process.env
  .STATIC_PAGE_CACHE_INVALIDATION_IN_MINS
  ? parseInt(process.env.STATIC_PAGE_CACHE_INVALIDATION_IN_MINS, 10)
  : 2
export const STATIC_PAGE_CACHE_INVALIDATION_IN_60_SECONDS = 60
export const STATIC_PAGE_CACHE_INVALIDATION_IN_200_SECONDS = 200
export const CLIENT_ID = process.env.BETTERCOMMERCE_CLIENT_ID
export const SHARED_SECRET = process.env.BETTERCOMMERCE_SHARED_SECRET
export const BASE_URL = process.env.BETTERCOMMERCE_BASE_URL
export const AUTH_URL = process.env.BETTERCOMMERCE_AUTH_URL
export const REVIEW_BASE_URL = process.env.BETTERCOMMERCE_REVIEW_BASE_URL
export const STATIC_BRANDS_PATH_ENABLED = stringToBoolean( process.env.STATIC_BRANDS_PATH_ENABLED )
export const OMS_BASE_URL = process.env.OMS_BASE_URL
export const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID
export const CLEARPAY_PAYMENT_ALLOWED_MIN_ORDER_VALUE = stringToNumber( process.env.CLEARPAY_PAYMENT_ALLOWED_MIN_ORDER_VALUE )
export const CLEARPAY_PAYMENT_ALLOWED_MAX_ORDER_VALUE = stringToNumber( process.env.CLEARPAY_PAYMENT_ALLOWED_MAX_ORDER_VALUE )
export const BETTERCMS_BASE_URL = process.env.BETTERCMS_BASE_URL
export const IS_TEST_PAYMENT_ENABLED_ON_LIVE = process.env.IS_TEST_PAYMENT_ENABLED_ON_LIVE
export const TEST_PAYMENT_AMOUNT = process.env.TEST_PAYMENT_AMOUNT ? parseFloat(process.env.TEST_PAYMENT_AMOUNT) : 0.0
export const KIT_BUILDER_API_URL = process.env.KIT_BUILDER_API_URL

export const BETTERCMS_API_VERSION = process.env.BETTERCMS_API_VERSION
export const BETTERCMS_API_URL = process.env.BETTERCMS_API_URL
export const HOME_PAGE_DEFAULT_SLUG = 'home'
export const TERMS_PAGE_DEFAULT_SLUG = 'terms-and-condition'
export const PRIVACY_PAGE_DEFAULT_SLUG = 'privacy-policy'
export const CONTACT_PAGE_DEFAULT_SLUG = 'contact-us'
export const COOKIES_PAGE_DEFAULT_SLUG = 'cookies'
export const HOME_PAGE_NEW_SLUG = 'new-home-bc'
export const HOME_PAGE_SLUG = 'new-home-bc'
export const TOOLS_HOME_PAGE_SLUG = 'home-ffx'
export const CIPHER_ENCRYPTION_KEY = process.env.CIPHER_ENCRYPTION_KEY
export const GOOGLE_MAP_API_KEY = process.env.GOOGLE_MAP_API_KEY
// google analytics
export const GA4_DISABLED = stringToBoolean(process.env.GA4_DISABLED)

export const ERROR_LOG_ENABLED = stringToBoolean(process.env.ERROR_LOG_ENABLED)
export const ERROR_LOG_OUTPUT_DIR = process.env.ERROR_LOG_OUTPUT_DIR

export const HTTP_MESSAGES = {
  SERVER_ERROR: 'Internal server error',
  INVALID_USER_ID: 'User ID was not provided',
}
export const PRODUCT_IMAGE_CDN_URL = process.env.PRODUCT_IMAGE_CDN_URL
export const STATIC_CATEGORIES_PATH_ENABLED = stringToBoolean(
  process.env.STATIC_CATEGORIES_PATH_ENABLED
)

export module Cookie {
  export module Key {
    export const MICROSITE_ID = 'MicrositeId'
    export const CURRENCY = 'Currency'
    export const CURRENT_CURRENCY = 'CurCurrency'
    export const CURRENCY_SYMBOL = 'CurrencySymbol'
    export const LANGUAGE = 'Language'
    export const COUNTRY = 'Country'
    export const SESSION_ID = 'sessionId'
    export const BASKET_ID = 'basketId'
    export const ORDER_ID = 'orderId'
    export const COMPANY_ID = 'CompanyId'
    export const GOOGLE_TRANSLATE = 'googtrans'
    export const KIT_BASKET_ID = 'kitBasketId'
    export const CLIENT_IP_ADDRESS = 'ClientIP'
    export const IS_PAYMENT_LINK = 'ipl'
    export const API_TOKEN = 'i'
    export const USER_TOKEN = 'ut'
    export const ANALYTICS = 'analytics'
    export const ADVERTISEMENT = 'advertisement'
    export const NAV_ENDPOINT_DATA_CACHED = 'nedc'
    export const ALGOLIA_SETTINGS_DATA_CACHED = 'asdc'
    export const DISABLE_USER_LOCATION_POPUP = 'dulp'
    export const PASSWORD_PROTECTION_AUTH = 'ppa'
    export const PASSWORD_PROTECTION_AUTH_STARTED = 'ppas'
    export const ENGAGE_SESSION = 'ch_cookie'
    export const GEO_ENDPOINT_DATA_CACHED = 'gedc'
    export const APPLIED_PLP_FILTERS = 'aplpf'
  }
}

export enum DeviceType {
  DESKTOP = 1,
  MOBILE = 2,
  TABLET = 3,
}

export module UserAuthType {
  export const DEFAULT = 0
  export const PASSWORD = 1
  export const OTP = 2
  export const LOGIN_TOKEN = 3
}
export module AddressFinder {
  export module LoqateUrl {
    export const BASE_URL = 'https://services.postcodeanywhere.co.uk'
    export const FIND = `${BASE_URL}/Capture/Interactive/Find/v1.10/json3.ws`
    export const RETRIEVE = `${BASE_URL}/Capture/Interactive/Retrieve/v1.00/json3.ws`
  }
  export module AddressIOUrl {
    export const BASE_URL = 'https://api.getAddress.io'
    export const FIND = `${BASE_URL}/autocomplete`
    export const RETRIEVE = `${BASE_URL}/get`
  }
}
export const BASKET_TYPES = {
  DEFAULT: "default",
  KIT: "kit",
}

export const BASKET_PROMO_TYPES = {
  KIT: 23,
}
