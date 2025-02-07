import { useReferralSearch } from '@framework/customer'
import { apiMiddlewareErrorHandler } from '@framework/utils'
import apiRouteGuard from '../../base/api-route-guard'

const referralSearchApiMiddleware = async (req: any, res: any) => {
  const { name, email }: any = req.body
  try {
    const response: any = await useReferralSearch()(name, email, req?.cookies)
    res.status(200).json({ referralDetails: response.result })
  } catch (error) {
    apiMiddlewareErrorHandler(req, res, error)
  }
}

export default apiRouteGuard(referralSearchApiMiddleware)
