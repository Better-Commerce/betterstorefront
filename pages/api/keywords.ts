import useKeywords from '@framework/api/endpoints/keywords'
import { apiMiddlewareErrorHandler } from '@framework/utils'

const KeywordsApiMiddleware = async (req: any, res: any) => {
  try {
    const response = await useKeywords(req.cookies)
    res.status(200).json(response)
  } catch (error) {
    apiMiddlewareErrorHandler(req, res, error)
  }
};

export default KeywordsApiMiddleware;