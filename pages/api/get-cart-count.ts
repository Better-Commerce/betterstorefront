import { useCartCount } from '@framework/cart'
import { apiMiddlewareErrorHandler } from '@framework/utils'
import apiRouteGuard from './base/api-route-guard'

async function getCartApiMiddleware(req: any, res: any) {
  const { basketId }: any = req.query
  try {
    const response = await useCartCount()({
      basketId,
      cookies: req.cookies,
    })
    res.status(200).json(response)
  } catch (error) {
    apiMiddlewareErrorHandler(req, res, error)
  }
}

export default apiRouteGuard(getCartApiMiddleware)
