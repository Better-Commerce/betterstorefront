import { updateDelivery } from '@framework/shipping'
import { apiMiddlewareErrorHandler } from '@framework/utils'

const UpdateDeliveryApiMiddleware = async (req: any, res: any) => {
  const { data, id }: any = req.body
  try {
    const response = await updateDelivery()({
      data,
      id,
      cookies: req.cookies,
    })
    res.status(200).json(response)
  } catch (error) {
    apiMiddlewareErrorHandler(req, res, error)
  }
};

export default UpdateDeliveryApiMiddleware;