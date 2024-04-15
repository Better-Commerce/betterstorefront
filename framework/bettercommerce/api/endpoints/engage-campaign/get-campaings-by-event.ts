import { ENGAGE_QUERY_USER_EVENTS, EngageEventTypes } from '@components/utils/constants'
import fetcher from '@framework/fetcher';
import { tryParseJson } from '@framework/utils/parse-util';

export default async function useGetEngageCampaignData(req: any, payload: any) {
  try {
    const chCookie: any = tryParseJson(req?.cookies?.ch_cookie)
    const { type, guid }: any = payload
    let apiUrl = ENGAGE_QUERY_USER_EVENTS

    // generate respective API url
    if (type === EngageEventTypes.RECENTLY_VIEWED) {
      apiUrl += `/recentitems`
    } else {
      return
    }
    const response = await fetcher({
      baseUrl: ENGAGE_QUERY_USER_EVENTS,
      method: 'GET',
      url: apiUrl,
      headers: {
        Origin: req.headers?.host,
      },
      params: {
        ch_guid: guid,
        ch_data: JSON.stringify({
          data: { user_uuid: chCookie?.user_id, exclusion_item_id: 'index', limit: 12 },
        }),
      },
      logRequest: true,
    });
    return response
  } catch (error: any) {
    console.log(error)
  }
}
