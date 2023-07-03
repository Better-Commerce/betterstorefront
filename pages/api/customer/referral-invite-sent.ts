import { useReferralInviteSent } from '@framework/customer'
import { apiMiddlewareErrorHandler } from '@framework/utils'

const ReferralInviteSentApiMiddleware = async (req: any, res: any) => {
  const { referralId}: any = req.body
  try {
    const response: any = await useReferralInviteSent()(referralId)
    res.status(200).json({ referralDetails: response.result })
  } catch (error) {
    apiMiddlewareErrorHandler(req, res, error)
  }
};

export default ReferralInviteSentApiMiddleware;