/**
 * @type {import('next').NextConfig}
 */

const { withCommerceConfig, getProviderName, } = require('./framework/commerce/config')
const commerce = require('./features.config.json')
const provider = commerce.provider || getProviderName()
const isBC = provider === 'bigcommerce'
const crypto = require('crypto')
const isBetterCommerce = provider === 'bettercommerce'
//const isProd = process.env.NODE_ENV === 'production'
module.exports = withCommerceConfig({
  output: 'standalone',
  poweredByHeader: false,
  images: {
    domains: ['liveocxcdn.azureedge.net', 'liveocxstorage.blob.core.windows.net', 'devocxstorage.blob.core.windows.net', 'www.imagedelivery.space', 'liveocx.imgix.net', 'livebccdn-euhthweyb6ckdcec.z01.azurefd.net', 'cdnbs.bettercommerce.tech','cdn.shopify.com'],
    cacheDuration: 31536000,
  },
  //assetPrefix: isProd ? 'https://cdnbs.bettercommerce.tech' : '',  
  commerce,
  rewrites() {
    return [
      { source: '/robots.txt', destination: '/api/robots' },
      isBC && { source: '/checkout', destination: '/api/checkout' },
      isBC && { source: '/logout', destination: '/api/logout?redirect_to=/' },
    ].filter(Boolean)
  },
  headers() {
    const decrypt = (data) => {
      const ALGORITHM = 'aes-256-cbc'
      const ENCODING = 'hex'
      const IV_LENGTH = 16
      const KEY = process.env.CIPHER_ENCRYPTION_KEY
      const binaryData = new Buffer(data, ENCODING)
      const iv = binaryData.slice(-IV_LENGTH)
      const encryptedData = binaryData.slice(0, binaryData.length - IV_LENGTH)
      const decipher = crypto.createDecipheriv(ALGORITHM, new Buffer(KEY), iv)

      return Buffer.concat([
        decipher.update(encryptedData),
        decipher.final(),
      ]).toString()
    }

    const tryParseJson = (json) => {
      if (json) {
        let parsed = {}
        try {
          parsed = JSON.parse(json)
          return parsed
        } catch (e) { }
      }
      return null
    }

    // if (process.env.SITE_SECURITY_HEADERS) {
    //   const headers = decrypt(process.env.SITE_SECURITY_HEADERS)
    //   if (headers) {
    //     const headersJson = tryParseJson(headers)

    //     if (headersJson) {
    //       return headersJson
    //     }
    //   }
    // }
    return []
  },
  env: {
    BETTERCOMMERCE_AUTH_URL: process.env.BETTERCOMMERCE_AUTH_URL,
    BETTERCOMMERCE_BASE_URL: process.env.BETTERCOMMERCE_BASE_URL,
    BETTERCOMMERCE_CLIENT_ID: process.env.BETTERCOMMERCE_CLIENT_ID,
    BETTERCOMMERCE_SHARED_SECRET: process.env.BETTERCOMMERCE_SHARED_SECRET,
    OMS_BASE_URL: process.env.OMS_BASE_URL,
    BETTERCOMMERCE_DEFAULT_CURRENCY: process.env.BETTERCOMMERCE_DEFAULT_CURRENCY,
    BETTERCOMMERCE_DEFAULT_LANGUAGE: process.env.BETTERCOMMERCE_DEFAULT_LANGUAGE,
    BETTERCOMMERCE_DEFAULT_COUNTRY: process.env.BETTERCOMMERCE_DEFAULT_COUNTRY,
    BETTERCOMMERCE_DEFAULT_PHONE_COUNTRY_CODE: process.env.BETTERCOMMERCE_DEFAULT_PHONE_COUNTRY_CODE,
    BETTERCOMMERCE_CURRENCY: process.env.BETTERCOMMERCE_CURRENCY,
    BETTERCOMMERCE_LANGUAGE: process.env.BETTERCOMMERCE_LANGUAGE,
    BETTERCOMMERCE_COUNTRY: process.env.BETTERCOMMERCE_COUNTRY,
    BETTERCMS_BASE_URL: process.env.BETTERCMS_BASE_URL,
    BETTERCMS_API_VERSION: process.env.BETTERCMS_API_VERSION,
    BETTERCMS_API_URL: process.env.BETTERCMS_API_URL,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    SITE_SECURITY_HEADERS: process.env.SITE_SECURITY_HEADERS,
    SITE_HOST: process.env.SITE_HOST,
    SITE_ORIGIN_URL: process.env.SITE_ORIGIN_URL,
    SITE_NAME: process.env.SITE_NAME,
    GA4_DISABLED: process.env.GA4_DISABLED,
    CIPHER_ENCRYPTION_KEY: process.env.CIPHER_ENCRYPTION_KEY,
    ENABLE_SECURED_PAYMENT_PAYLOAD: process.env.ENABLE_SECURED_PAYMENT_PAYLOAD,
    SECURE_PAYMENT_METHODS_SETTINGS_FIELDS: process.env.SECURE_PAYMENT_METHODS_SETTINGS_FIELDS,
    PAYMENT_METHODS_API_RESULT_UI_SECURED_SETTING_KEYS: process.env.PAYMENT_METHODS_API_RESULT_UI_SECURED_SETTING_KEYS,
    OTP_LOGIN_ENABLED: process.env.OTP_LOGIN_ENABLED,
    ERROR_LOG_ENABLED: process.env.ERROR_LOG_ENABLED,
    ERROR_LOG_OUTPUT_DIR: process.env.ERROR_LOG_OUTPUT_DIR,
    CURRENT_THEME: process.env.CURRENT_THEME,
    PDP_SIZE_OPTIONS_COUNT: process.env.PDP_SIZE_OPTIONS_COUNT,
    PRODUCT_IMAGE_CDN_URL: process.env.PRODUCT_IMAGE_CDN_URL,
    OMNILYTICS_BASE_URL: process.env.OMNILYTICS_BASE_URL,
    ENABLE_ELASTIC_SEARCH: process.env.ENABLE_ELASTIC_SEARCH,
    SEARCH_ENGINE_CONFIG: process.env.SEARCH_ENGINE_CONFIG,
    SEARCH_PROVIDER: process.env.SEARCH_PROVIDER,
    REDIS_CACHE_DISABLED: process.env.REDIS_CACHE_DISABLED,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    REDIS_CACHE_DURATION_SECS: process.env.REDIS_CACHE_DURATION_SECS,
    GOOGLE_MAP_API_KEY: process.env.GOOGLE_MAP_API_KEY,
    ENGAGE_QUERY_BASE_URL: process.env.ENGAGE_QUERY_BASE_URL,
    FIND_ADDRESS_KEY: process.env.FIND_ADDRESS_KEY,
  },
})