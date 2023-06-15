import { getShippingPlans } from '@framework/shipping'
import { apiMiddlewareErrorHandler } from '@framework/utils'

interface BodyProps {
  model: any
}

const GetShippingPlansApiMiddleware = async (req: any, res: any) => {
  const { model }: any = req.body
  try {
    const response = await getShippingPlans()({
      model,
      cookies: req.cookies,
    })
    res.status(200).json(response)
  } catch (error) {
    apiMiddlewareErrorHandler(req, res, error)
  }
};

export default GetShippingPlansApiMiddleware;