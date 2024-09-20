export enum AnalyticsEventType {
    VIEW_PLP_ITEMS = 'view_item_list',
    VIEW_BASKET = 'view_cart',
    BASKET = 'cart',
    ADD_TO_BASKET = 'add_to_cart',
    REMOVE_FROM_CART = 'remove_from_cart',
    SELECT_QUANTITY = 'select_quantity',
    SAVE_NEW_ADDRESS = 'save_new_address',
    VIEW_WISHLIST = 'wishlist',
    ADD_TO_WISHLIST = 'add_to_wishlist',
    REMOVE_FROM_WISHLIST = 'remove_item',
    ADDRESS_CHANGE = 'address_changes',
    PDP_VIEW = 'view_item',
    PDP_VIEW_DETAILS = 'select_item',
    PDP_QUICK_VIEW = 'popup_view',
    PDP_QUICK_VIEW_CLICK = 'quick_view_click',
    VIEW_PRODUCT_DETAILS = 'view_prod_details',
    SPECIFICATION_PRODUCT_DETAIL = 'specification_product_detail',
    BEGIN_CHECKOUT = 'begin_checkout',
    ADD_SHIPPING_INFO = 'add_shipping_info',
    PURCHASE = 'purchase',
    HELP_ICON = 'help_icon',
    HAMBURGER_MENU = 'hamburger_menu',
    HAMBURGER_MENU_CLICK = 'hamburger_menu_click',
    HAMBURGER_ICON_CLICK = 'hamburger_icon_click',
    HELP_SIDEBAR_MENU = 'help_sidebar_menu',
    NEED_HELP_WITH_ORDER = 'need_help_with_your_order',
    PROCEED_TO_CANCEL_ITEM = 'proceed_to_cancel_item',
    PROCEED_TO_CANCEL_ORDER = 'proceed_to_cancel_order',
    PROCEED_TO_RETURN = 'proceed_to_return',
    PROCEED_TO_EXCHANGE = 'proceed_to_exchange',
    CANCEL_CONFIRM = 'cancel_confirm',
    RETURN_CONFIRM = 'return_confirm',
    TRACK_PACKAGE = 'track_package',
    FOOTER_QUERY_CLICK = 'footer_query_click',
    LOGIN_ATTEMPT = 'login_attempt',
    NOTIFY_ME = 'notify_me',
    NOTIFY_CLICK = 'notify_click',
    REFERRER_BANNERS = 'referrer_banners',
    LOGO_CLICK = 'logo_click',
}

export const AnalyticsType = {
    GOOGLE_ANALYTICS: 'googleAnalytics',
    GOOGLE_TAG: 'googleTag',
}