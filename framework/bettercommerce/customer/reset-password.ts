import fetcher from '../fetcher'
import { CUSTOMER_BASE_API } from '@components/utils/constants'

interface ForgotPassword {
  userName: string
  token: string
  password: string
}

export default async function resetPassword(
  forgotPasswordData: ForgotPassword
) {
  try {
    const res = await fetcher({
      url: CUSTOMER_BASE_API,
      method: 'post',
      data: forgotPasswordData,
    })
    return res
  } catch (error) {
    console.log(error)
  }
}
