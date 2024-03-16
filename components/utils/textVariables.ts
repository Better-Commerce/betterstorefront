import { useRouter } from 'next/router'

//USE THIS AS TEMPLATE
// const content: any = {
//   'en-US': {
//     GENERAL_CHECKOUT: 'Checkout',
//   },
//   es: {
//     GENERAL_CHECKOUT: 'Checkout',
//   },
//   'en-GB': {
//     GENERAL_CHECKOUT: 'Checkout',
//   },
//   'es-ES': {
//     GENERAL_CHECKOUT: 'Checkout',
//   },
// }

//REACT CUSTOM HOOK, TO BE IMPORTED ONLY IN REACT FUNCTIONAL COMPONENTS
// const useTranslation = () => {
//   const { locale }: any = useRouter()
//   return content[locale] || content['en-GB']
// }

// export default useTranslation

// export const DETAILS_SUCCESS = 'Success! Your details have been updated!'
// export const DETAILS_ERROR = 'Woops! Something went wrong!'
// export const ADDRESS_BOOK_TITLE = 'Address Book'
// export const DETAILS_SUBTITLE =
  // 'Feel free to edit any of your details below so your account is totally up to date.'
// export const EMPTY_ADDRESS = 'Oh-no! Your address book is empty is empty.'
// export const ADD_ADDRESS = 'Add new address'
// export const GENERAL_EDIT = 'Edit'
// export const GENERAL_DELETE = 'Delete'
// export const FEATURES_HEADING = 'Features'
//PDP
// export const INSUFFICIENT_STOCK = 'Insufficient stock for add to cart'
// export const PROD_ADDED = 'Added to Bag'
// export const PROD_ADDED_SUCCESSFULLY = 'Product Added Successfully'
// export const REV_SUB = 'Review Submitted'

// export const GENERAL_DEFAULT_DELIVERY_ADDRESS = 'Default delivery address'
// export const GENERAL_DEFAULT_BILLING_ADDRESS = 'Default billing address'
export const GENERAL_TITLE = 'Title'
export const GENERAL_MISS = 'Miss'
export const GENERAL_MR = 'Mr'
export const GENERAL_MRS = 'Mrs'
export const GENERAL_FIRST_NAME = 'First name'
export const GENERAL_LAST_NAME = 'Last name'
// export const GENERAL_ADDRESS = 'Address'
// export const GENERAL_ADDRESS_LINE = 'Address line'
export const GENERAL_ADDRESS_LINE1 = 'Address line 1'
export const GENERAL_ADDRESS_LINE2 = 'Address line 2'
// export const GENERAL_CANCEL = 'Cancel'
export const GENERAL_CITY = 'Town / city'
export const GENERAL_POSTCODE = 'Postcode'
export const GENERAL_COUNTRY = 'Country'
export const GENERAL_PHONE = 'Phone'
export const GENERAL_GENDER = 'Gender'
export const GENERAL_IS_DEFAULT_DELIVERY_ADDRESS = 'Is Default Delivery Address'
export const GENERAL_IS_DEFAULT_BILLING_ADDRESS = 'Is Default Billing Address'
export const GENERAL_SMS = 'SMS'
export const GENERAL_EMAIL = 'Email'
export const GENERAL_POST = 'Post'
export const GENERAL_MOBILE_NUMBER = 'Mobile Number'
export const GENERAL_WANT_RECEIVE_OFFERS = 'I want to receive offers'
export const GENERAL_NOT_WANT_RECEIVE_OFFERS = 'I don’t want to receive offers'
// export const CONTACT_PREFERENCES_TITLE =
//   'Please note, when you update your preferences they will be saved but they won’t be reflected right away.'
// export const CONTACT_PREFERENCES_SUBTITLE =
//   'Receive emails and texts containing tips, guidance, offers and news on new products and services.'
// export const GENERAL_SAVE_CHANGES = 'Save changes'
// export const MY_ACCOUNT_TITLE = 'My Account'
// export const MY_DETAIL_TEXT =
  // 'Feel free to edit any of your details below so your account is totally up to date.'
export const MY_ORDERS_TEXT =
  'Check the status of recent orders, manage returns, and download invoices.'
export const GENERAL_MY_ORDERS = 'My Orders'
export const GENERAL_MY_RETURNS = 'My Returns'
export const GENERAL_MY_DETAILS = 'My Details'
export const GENERAL_CONTACT_PREFERENCES = 'Contact Preferences'
// export const ORDER_HISTORY_TITLE = 'Order history'
// export const GENERAL_RECENT_ORDERS = 'Recent orders'
// export const GENERAL_ORDER_NUMBER = 'Order number'
// export const GENERAL_RETURN_NUMBER = 'Return number'
// export const GENERAL_DATE_PLACED = 'Date placed'
// export const GENERAL_TRACKING_LINK = 'Tracking link'
// export const GENERAL_VIEW_PRODUCT = 'View Product'
// export const GENERAL_ADD_TO_BASKET = 'Add to bag'
// export const GENERAL_CREATE_RETURN = 'Create return'
// export const GENERAL_TOTAL = 'Total'
// export const GENERAL_TAX = 'Tax'
// export const GENERAL_REMOVE = 'Remove'
// export const GENERAL_REMOVE_ITEM = 'Remove this Item?'
// export const GENERAL_ORDER_PLACED_ON = 'Order placed on'
// export const GENERAL_TOTAL_AMOUNT = 'Total amount'
// export const GENERAL_REFUND_AMOUNT = 'Refund Amount'
// export const GENERAL_VIEW_ORDER = 'View Order'
// export const GENERAL_VIEW_INVOICE = 'View Invoice'
// export const RETURN_FOR_ORDER = 'for order'
// export const GENERAL_BUY_AGAIN = 'Buy Again'
// export const GENERAL_DELIVERED = 'Delivered'
// export const GENERAL_ON_TEXT = 'on'
// export const GENERAL_CATALOG = 'Catalog'
// export const WISHLIST_SUCCESS_MESSAGE = 'Item was added in the cart'
// export const GENERAL_CONTINUE_SHOPPING = 'Continue Shopping'
// export const RETURN_ORDER_TITLE = 'Return history'
// export const RETURN_ORDER_TEXT = 'Check the products you’ve returned'
// export const ORDER_STATUS_OUT_FOR_DELIVERY = 'Out For Delivery'
// export const ORDER_STATUS_CANCELLED = 'Cancelled'
export const WISHLIST_TITLE = 'Wishlist'
// export const ITEM_WISHLISTED = 'Wishlisted'
// export const FREE_SHIPPING_CART_ITEM_REMOVE_TILE =
//   "You're about to lose Free Delivery!"
// export const WISHLIST_SIDEBAR_MESSAGE =
//   'Uh-oh, you don’t have any items in here'
// export const GENERAL_BULK_ORDER_PAD = 'Bulk Order'
// export const GENERAL_SHOW_MORE_ENTRY_FIELDS = 'Show More Entry Fields'
// export const WISHLIST_SUB_TITLE = 'You haven’t wished for anything yet.'
// export const GENERAL_COPY_AND_PASTE = 'Copy and Paste'
// export const GENERAL_LINE_BY_LINE = 'Line By Line'
// export const CLOSE_PANEL = 'Close panel'
// export const SUBTOTAL_INCLUDING_TAX = 'Subtotal (taxes included)'
// export const SUBTOTAL_EXCLUDING_TAX = 'Subtotal (taxes excluded)'
// export const GENERAL_SUBTOTAL = 'Subtotal'
// export const GENERAL_TAXES = 'Taxes'
// export const CALCULATED_AT_CHECKOUT = 'Calculated at checkout'
export const GENERAL_SHIPPING = 'Shipping'
// export const GENERAL_DISCOUNT = 'Discount'
// export const GENERAL_CHECKOUT = 'Checkout'
// export const BTN_FIND_MORE = 'Find out more'
// export const APPLY_PROMOTION = 'Apply promotion'
// export const APPLY_PROMOTION_SUCCESS_MESSAGE = 'has been applied'
// export const GENERAL_APPLY_TEXT = 'Apply'
export const ENTER_POSTCODE = 'Enter your postcode'
// export const GENERAL_DISTANCE_MILES = 'miles'
// export const NORMAL_OPENING_HOURS = 'Normal Opening Hours'
export const GENERAL_DELIVERY_METHOD = 'Delivery Method'
// export const GENERAL_COMBINED_DELIVERY = 'Combined Delivery'
// export const GENERAL_DELIVERY_ADDRESS = 'Delivery Address'
// export const GENERAL_PAYMENT_METHOD = 'Payment Method'
// export const GENERAL_PAYMENT = 'Payment'
// export const ADDRESS_OF_YOUR_CHOICE = 'to an address of your choice'
// export const IN_STORE_OR_COLLECT_PLUS = 'in store or using Collect+'
// export const GENERAL_SELECT_COUNTRY = 'Select country'
// export const GENERAL_CONFIRM = 'Confirm'
export const GENERAL_PAY = 'Pay'
export const GENERAL_PAY_WITH_KLARNA = 'Pay Later with Klarna'
// export const BILLING_ADDRESS_SAME_AS_DELIVERY_ADDRESS =
//   'My billing and delivery address are the same'
// export const BILLING_INFORMATION = 'Billing information'
// export const BTN_DELIVER_TO_THIS_ADDRESS = 'Deliver to this address'
// export const BTN_CONFIRM_PURCHASE = 'Confirm Purchase'
// export const GENERAL_ORDER_SUMMARY = 'Order summary'
// export const ITEMS_IN_YOUR_CART = 'Items in your cart'
export const ITEM_TYPE_ADDON_10 = 10
// export const GENERAL_CONFIRM_ORDER = 'Confirm order'
// export const GUEST_LATEST_PROMOTIONS_OFFERS_INFORMATION =
//   "To get our latest promotions, exclusive offers, new launches and more, let us know how you'd like us to keep you updated"
// export const BTN_CHECKOUT_SECURELY = 'Checkout securely'
// export const NEW_CUSTOMER = 'New customer?'
// export const CUSTOMER_ERROR_MESSAGE =
//   'No account has been found with this email/password'
// export const GENERAL_FREE = 'FREE'
// export const CARDHOLDER_NAME = 'Cardholder Name'
// export const CARD_NUMBER = 'Card Number'
// export const CARD_EXPIRY_DATE = 'Expires'
// export const CARD_CVC = 'CVC'
// export const ADDRESS_COMPANY_OPTIONAL = 'Company (Optional)'
// export const ADDRESS_STREET_HOUSE_NUMBER = 'Street and House Number'
// export const ADDRESS_APARTMENT_SUITES = 'Apartment, Suite, Etc. (Optional)'
// export const ADDRESS_POSTAL_CODE = 'Postal Code'
// export const BTN_CONTINUE = 'Continue'
// export const ADD_PAYMENT_METHOD = 'Add Payment Method'
// export const USE_DIFFERENT_SHIPPING_ADDRESS = 'Use a different shipping address'
// export const ADDRESS_SAME_AS_BILLING = 'Same as billing address'
// export const BTN_ADD_SHIPPING_ADDRESS = 'Add Shipping Address'
export const GENERAL_BAGS = 'Bags'
export const GENERAL_TEES = 'Tees'
export const GENERAL_OBJECTS = 'Objects'
export const GENERAL_HOME_GOODS = 'Home Goods'
export const GENERAL_ACCESSORIES = 'Accessories'
export const GENERAL_WHO_WE_ARE = 'Who we are'
export const GENERAL_SUSTAINABILITY = 'Sustainability'
export const GENERAL_PRESS = 'Press'
export const GENERAL_CAREERS = 'Careers'
export const GENERAL_TERMS_AND_CONDITIONS = 'Terms & Conditions'
export const GENERAL_PRIVACY = 'Privacy'
export const GENERAL_CONTACT = 'Contact'
export const GENERAL_RETURNS = 'Returns'
export const GENERAL_WARRANTY = 'Warranty'
export const GENERAL_SECURE_PAYMENT = 'Secure Payments'
export const GENERAL_FAQ = 'FAQ'
export const GENERAL_FIND_A_STORE = 'Find a store'
// export const SIGN_UP_FOR_NEWSLETTER = 'Sign up for our newsletter'
// export const SIGN_UP_TEXT =
//   'The latest deals and savings, sent to your inbox weekly.'

// export const GENERAL_EMAIL_ADDRESS = 'Email address'
// export const BTN_SIGN_UP = 'Sign up'
// export const COPYRIGHT_FOOTER_INFO = 'BetterCommerce, Inc. All rights reserved.'
// export const GENERAL_COOKIE_TEXT =
//   'This site uses cookies to improve your experience. By clicking, you agree to our Privacy Policy.'
// export const BTN_ACCEPT_COOKIE = 'Accept cookies'
// export const GENERAL_RECENTLY_VIEWED = 'Recently viewed'
// export const BTN_SIGN_OUT = 'Sign out'
export const GENERAL_LOGIN = 'Login'
export const GENERAL_REGISTER = 'Register'
// export const FORGOT_PASSWORD = 'Forgot Password'
// export const CHANGE_PASSWORD = 'Change password'
// export const NEW_PASSWORD = 'New Password'
// export const CONFIRM_PASSWORD = 'Confirm Password'
export const SOCIAL_REGISTER_GOOGLE = 'Google Login'
export const SOCIAL_REGISTER_FACEBOOK = 'Facebook Login'
export const SOCIAL_REGISTER_APPLE = 'Apple Login'
// export const GENERAL_WORKFLOW_TITLE = 'BetterCommerce'
// export const SELECT_CURRENCY = 'Select currency'
// export const SELECT_LANGUAGE = 'Select language'
// export const GENERAL_ITEM_IN_CART = 'items in cart, view bag'
// export const BTN_SEARCH = 'Search'
// export const GENERAL_CLOSE = 'Close'
// export const GENERAL_BACK = 'Back'
export const VALIDATION_PASSWORD_MUST_MATCH = 'Passwords must match'
// export const PRODUCT_INFORMATION = 'Product information'
// export const PERSONALISATION = 'Personalisation'
// export const SELECT_IMAGE_ERROR = 'Please select an Image before proceeding!'
// export const PRODUCT_PERSONALIZATION_TITLE =
//   'Personalise with custom embroidery'
// export const PRODUCT_DESCRIPTION = 'Description'
// export const PRODUCT_OPTIONS = 'Product options'
// export const BTN_SEE_MORE_DETAILS = 'See more details'
// export const BTN_SEE_ALL = 'See All'
// export const YOUR_BUNDLE_INCLUDE = 'Your bundle includes'
// export const BUNDLE_TEXT = 'Click on a product to edit your bundle'
export const VALIDATION_PLEASE_COMPLETE_THIS_FIELD =
  'Please compelte this field'
// export const GENERAL_ENGRAVING = 'Engraving'
// export const GENERAL_PERSONALISATION = 'Personalise your Product. '
// export const GENERAL_PERSONALISATION_READONLY = 'Personalised Product'
// export const GENERAL_ENGRAVING_PERSONALIZE_BOTTLE =
//   'Add Characters with a click. Type in names, initials or numbers. For just '
// export const GENERAL_SEARCH_BRAND = 'Search Brand'
// export const GENERAL_BRAND = 'Brand'
// export const GENERAL_FILTER_TITLE = 'Filters'
// export const PRODUCT_FILTER = 'Product filters'
// export const BTN_CLEAR_ALL = 'Clear all'
// export const TITLE_PRODUCTS = 'Products'
export const PRICEMATCH_WEBSITE_NAME =
  'Name of website you have found cheaper to*'
export const PRICEMATCH_PRODUCT_LINK =
  'Full direct link to product (copy/paste website URL)*'
export const PRICEMATCH_COST_OF_PRODUCT = 'Cost of product*'
export const PRICEMATCH_DELIVERY_COST = 'Delivery Cost*'
export const PRICEMATCH_TOTAL_COST = 'Total cost'
export const PRICEMATCH_USER_NAME = 'Name*'
export const PRICEMATCH_USER_EMAIL = 'Email*'
export const PRICEMATCH_USER_TELEPHONE = 'Telephone*'
// export const PRICEMATCH_BEST_PRICE = 'We will match the best price'
// export const PRICEMATCH_SEEN_IT_CHEAPER = 'Seen it cheaper?'
// export const PRICEMATCH_ADDITIONAL_DETAILS = 'Additional details'
export const VALIDATION_ENTER_CORRECT_URL = 'Enter correct url!'
export const VALIDATION_ENTER_PRODUCT_LINK = 'Please enter a product link'
export const VALIDATION_ENTER_WEBSITE_LINK = 'Please enter website link'
// export const BTN_SUBMIT = 'Submit'
// export const BTN_NOTIFY_ME = 'Notify me'
// export const BTN_PRE_ORDER = 'Pre-order'
// export const BTN_RECOMMENDED_PROD = 'Recommended products'
// export const GENERAL_ADD_TO_BAG = 'Add to Bag'
// export const GENERAL_QUICK_VIEW = 'Quick View'
// export const ADDED_TO_WISH = 'Added to Wishlist'
// export const BTN_ADD_TO_WISHLIST = 'Add to wishlist'
// export const BTN_MOVE_TO_WISHLIST = 'Move to Wishlist'
// export const ALERT_SUCCESS_WISHLIST_MESSAGE = 'Wishlisted'
// export const PRODUCT_SPECIFICATION = 'Product specification'
// export const PDP_BRAND_COMPARE = 'Compare Same Range'
// export const GENERAL_NOT_AVAILABLE = 'Not Available'
// export const GENERAL_CARE_TITLE = 'Care'
// export const PERFECT_FOR = 'Perfect for'
// export const FABRIC_CARE = 'Fabric care'
// export const WASH_CARE = 'Wash care'
// export const COLLAR = 'Collar'
// export const GENERAL_CARE_TEXT =
//   'This is a limited edition production run. Printing starts when the drop ends.'
// export const GENERAL_DETAILS = 'Details'
// export const GENERAL_DETAILS_TEXT =
//   'This is a limited edition production run. Printing starts when the drop ends. Reminder: Bad Boys For Life. Shipping may take 10+ days due to COVID-19.'
// export const BTN_SEE_EVERYTHING = 'See everything'
// export const GENERAL_SORT = 'Sort by'
// export const CHOOSE_A_COLOR = 'Choose a color'
export const ITEM_TYPE_ADDON = 'ADDON'
export const ITEM_TYPE_ALTERNATIVE = 'ALTERNATIVE'
// export const RELATED_PROD = 'You may also like'
// export const YOUTUBE_VIDEO_PLAYER = 'YouTube video player'
// export const GENERAL_REFERENCE = 'Ref'
// export const GENERAL_PRICE_LABEL_RRP = 'RRP'
// export const BTN_ADD_TO_FAVORITES = 'Add to favorites'
// export const GENERAL_REVIEWS = 'Ratings & Reviews'
// export const GENERAL_REVIEW_OUT_OF_FIVE = 'out of 5 stars'
// export const ERROR_WOOPS_SOMETHING_WENT_WRONG = 'Woops!, Something went wrong'
// export const REVIEW_TITLE = 'Review title'
// export const REVIEW_COMMENT = 'Type Your Comment'
// export const MESSAGE_CHARACTERS_LEFT = 'Characters left'
// export const POST_YOUR_REVIEW = 'Post your review'
// export const VARIANT_SWATCH = 'Variant Swatch'
// export const GENERAL_THANK_YOU = 'Thank you!'
// export const GENERAL_ON_THE_WAY = "It's on the way!"
// export const GENERAL_YOUR_ORDER = ' Your order'
// export const GENERAL_ORDER_WILL_BE_WITH_YOU_SOON = 'will be with you soon.'
// export const GENERAL_ORDER_FAILED = 'Order Failed!'
// export const GENERAL_ORDER_NOT_PROCESSED = 'failed.'
// export const GENERAL_ITEMS = 'Items'
// export const GENERAL_QUANTITY = 'Quantity'
// export const GENERAL_PRICE = 'Price'
// export const YOUR_INFORMATION = 'Your information'
// export const GENERAL_ADDRESSES = 'Addresses'
// export const GENERAL_SHIPPING_ADDRESS = 'Shipping address'
// export const GENERAL_BILLING_ADDRESS = 'Billing address'
// export const GENERAL_DELIVERED_BY = 'Delivered by'
// export const GENERAL_SPLIT_DELIVERY = 'Split Delivery'
// export const GENERAL_SUMMARY = 'Summary'
// export const GENERAL_NEXT_ORDER_PROMO =
//   'Congratulations! You can get a discount on your next order using code'
// export const VALIDATION_YOU_ARE_ALREADY_LOGGED_IN = "You're already logged in"
// export const OFFER_VALIDITY = 'Your offer is valid for {days} days'
// export const LOGIN_SUCCESSFUL = 'login successfully'
// export const INVALID_ACCOUNT =
//   'No account has been found with this email/password'
// export const VALIDATION_NO_ACCOUNT_FOUND_VIA_OTP =
//   'No account has been found with this mobile'
// export const VALIDATION_ENTER_A_VALID_EMAIL = 'Please enter a valid email'
// export const VALIDATION_EMAIL_ALREADY_IN_USE = 'This email is already in use'
// export const BTN_REGISTER_FOR_FREE = 'Register for free'
// export const LOADER_LOADING = 'Loading...'
// export const ERROR_PAGE_NOT_FOUND = 'Not Found'
// export const ERROR_PAGE_NOT_FOUND_MESSAGE =
//   "The requested page doesn't exist or you don't have access to it."
// export const BTN_CHECKOUT_NOW = 'Checkout now'
// export const BTN_PLACE_ORDER = 'Place Order'
// export const MESSAGE_NO_ORDER_FOUND = 'No orders found'
// export const MESSAGE_NO_ORDER_FOUND_TEXT =
//   'Biscuit oat cake wafer icing ice cream tiramisu pudding cupcake.'
export const GENERAL_ENTER_POSTCODE = 'Enter postcode'
export const GENERAL_ADDRESS_FINDER = 'Address Finder'
// export const LOADING_YOUR_ORDERS = 'Loading your order'
// export const NO_ORDER_PROVIDED = 'Woops! No order provided'
// export const ENTER_ADDRESS_MANUALY = 'Enter address manually'
// export const BTN_FIND = 'Find'
// export const BTN_SAVE = 'Save'
// export const BTN_BACK_TO_HOME = 'Back to Home'
export const IMG_PLACEHOLDER = 'https://liveocxcdn.azureedge.net/betterstore/images/noimagefound.png'
// export const SHOP_THE_LOOK = 'Shop the look'
// export const SHOP_NOW = 'Shop Now'
// export const QUICK_VIEW = 'Quick View'
// export const BAD_URL_TEXT = 'This is a bad url. please go back to'
// export const ALL_CATEGORY = 'all categories'
// export const RESULTS = 'results'
// export const SHOP_BY_CATEGORY = 'Shop by Category'
// export const SHOP_BY_COLLECTION = 'Shop by Collection'
// export const SHOP_BY_LIFESTYLRE = 'Shop by Lifestyle'
// export const PRODUCTS_AVAILABLE = 'Products available'
// export const GENERAL_COLOUR = 'Color'
// export const GENERAL_SIZE = 'Size'
// export const PRODUCT_IN_STOCK = 'In Stock'
// export const PRODUCT_OUT_OF_STOCK = 'Out Of Stock'
// export const PRODUCT_AVAILABILITY = 'Availability'
export const SLUG_TYPE_MANUFACTURER = 'Manufacturer'
// export const GENERAL_FOOOTER = 'Footer'
// export const SIZE_CHART = 'Size chart'

// export const ORDER_CANCELLED = 'Order Cancelled Successfully'
// export const CANCEL_ORDER = 'Cancel Order'
// export const CHAT_WITH_US = 'Chat with us'
// export const GET_HELP_WITH_ORDER = 'Get help with this order'
// export const HELP_ASSIST =
//   'We will be glad to assist you. What seems to be bothering you?'
// export const REASON_CANCEL_HEADING = 'Reason for cancellation'
// export const ORDER_REFUND_INFO =
//   'Refund will be processed within 3-4 working days to your payment method'
// export const ITEM_CANCELLED = 'Item Cancelled Successfully'
// export const PROCEED_TO_CANCEL = 'Proceed to Cancel'
// PLP Filters
// export const FILTER_TITLE = 'Filter & Sorting'
// export const CHANGE_SIZE = 'Change Size'
// export const LOGOUT = 'Logout Successful'
export const PRODUCT_DELIVERY_MESSAGE =
  'For orders above {currencySymbol}{freeShippingOverXValue}, Usually delivered in 2-5 days.'
// export const INVITES_SENT = 'Invites Sent'
// export const CLICKS_ON_INVITES = 'Clicks on Invites'
// export const SUCCESSFUL_INVITES = 'Successful Invites'
// export const SUCCESSFUL_INVITE = 'Successful Invite'
// export const NO_INVITES = 'No Successful Invites Yet'
// export const SHARE_IN_PERSON = 'Tell them in Person'
// export const SHARE_BY_EMAIL = 'Share by Email'
// export const BEEN_REFERRED_BY_A_FRIEND = 'Been Referred by a Friend?'
// export const FIND_THEM = 'Find Them!'
// export const USER_NOT_FOUND =
//   "Unfortunately, couldn't find a user with this name"
// export const VOUCHERS_EARNED = 'Vouchers Earned'
// export const VOUCHERS_NOT_EARNED = 'No Vouchers Earned Yet'
// export const EMAIL_FIELD_VALIDATION = 'Email field cannot be empty!'
// export const CLICK_TO_SHARE_BY_EMAIL =
//   'Click here to share Referral link by Email'
// export const GENERAL_INCLUDE_OUT_OF_STOCK_PRODUCT =
//   'Include out of stock products'
// export const GENERAL_PROMOCODE = 'Promo Code'
// export const GENERAL_QUOTE_SUMMARY = 'Quote summary'
// export const RELATED_PRODUCT_WITHGROUP_TEXT = 'Related Products'
// export const QUANTITY_BREAK_SAVE = 'Buy More and Save'
// export const QUANTITY_BREAK_QTY = 'Qty'
// export const QUANTITY_BREAK_PRICE = 'Price Per Item'
// export const QUANTITY_BREAK_SAVINGS = 'Saving'
// export const SAVE_AND_CONTINUE_TO_COLLECT = 'Save And Continue to Collect'
// export const GENERAL_EDIT_KIT = 'Edit my kit'
// export const GENERAL_FIND_STORE = 'Find Stores'
// export const GENERAL_FIND_STORE_TITLE = 'Find Store Near You'
