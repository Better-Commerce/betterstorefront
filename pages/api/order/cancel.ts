import { cancelOrder } from '@framework/api/operations'
import { apiMiddlewareErrorHandler } from '@framework/utils'

export default async function cancelOrderAPI(req: any, res: any) {
  try {
    const response = await cancelOrder()(req.body.id, req?.cookies)
    res.status(200).json({ response })
  } catch (error) {
    apiMiddlewareErrorHandler(req, res, error)
  }
}
