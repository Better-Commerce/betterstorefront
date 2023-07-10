import commerce from '@lib/api/commerce'
import { apiMiddlewareErrorHandler } from '@framework/utils'

const GetProductPromosApiMiddleware = async (req: any, res: any) => {
  try {
    const response = await commerce.getProductPromos({
      query: req.body.recordId,
      cookies: req?.cookies,
    })
    res.status(200).json(response)
  } catch (error) {
    apiMiddlewareErrorHandler(req, res, error)
  }
}

export default GetProductPromosApiMiddleware
