// Component Imports
import { IPaymentButtonProps } from './BasePaymentButton'
import BasePaymentButton, { IDispatchState } from './BasePaymentButton'
import PaymentGatewayNotification from '@components/checkout/PaymentGatewayNotification'

// Other Imports
import { EmptyString, Messages } from '@components/utils/constants'

export class CODPaymentButton extends BasePaymentButton {
  /**
   * CTor
   * @param props
   */
  constructor(props: IPaymentButtonProps & IDispatchState) {
    super(props)
    this.state = {
      isPaymentInitiated: false,
    }
  }

  /**
   * Executes order generation for COD payment method on CommerceHub.
   * @param paymentMethod {Object} PaymentMethod info of the executing payment type.
   * @param basketOrderInfo {Object} Input data object for generating the CommerceHub order.
   * @param uiContext {Object} Method for dispatching global ui state changes.
   * @param dispatchState {Function} Method for dispatching state changes.
   */
  private async onPay(
    paymentMethod: any,
    basketOrderInfo: any,
    uiContext: any,
    dispatchState: Function
  ) {
    uiContext?.setOverlayLoaderState({
      visible: true,
      message: 'Please wait...',
    })
    const { state, result: orderResult } = await super.confirmOrder(
      paymentMethod,
      basketOrderInfo,
      dispatchState,
      true
    )
    if (orderResult?.success && orderResult?.result?.id) {
      uiContext?.hideOverlayLoaderState()

      if (state) {
        dispatchState(state)
      }

      this.setState({
        isPaymentInitiated: true,
      })
    } else {
      uiContext?.hideOverlayLoaderState()
      if (state) {
        dispatchState(state)
      } else {
        dispatchState({
          type: 'SET_ERROR',
          payload: Messages.Errors['GENERIC_ERROR'],
        })
      }
    }
  }

  /**
   * Called immediately after a component is mounted.
   */
  public componentDidMount(): void {
    const { dispatchState }: any = this.props
    dispatchState({ type: 'SET_ERROR', payload: EmptyString })
  }

  /**
   * Renders the component.
   * @returns {React.JSX.Element}
   */
  public render() {
    const that = this
    return (
      <>
        {this.baseRender({
          ...this?.props,
          ...{
            onPay: (
              paymentMethod: any,
              basketOrderInfo: any,
              uiContext: any,
              dispatchState: Function
            ) =>
              that.onPay(
                that.state.paymentMethod,
                basketOrderInfo,
                uiContext,
                dispatchState
              ),
          },
        })}

        {this.state.isPaymentInitiated && (
          <PaymentGatewayNotification
            isCOD={true}
            gateway={this.props?.paymentMethod?.systemName}
            params={{
              token: EmptyString,
              orderId: EmptyString,
              payerId: EmptyString,
            }}
            isCancelled={false}
          />
        )}
      </>
    )
  }
}
