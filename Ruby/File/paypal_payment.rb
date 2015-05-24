class PaypalPayment
  def initialize(subscription)
    @subscription = subscription
  end
  def make_recurring(month)
    process :request_payment
    process :create_recurring_profile, period: :monthly, frequency: month, start_at: Time.zone.now
  end
  
  def checkout_url(options)
    process(:checkout, options).checkout_url
  end
  
  def cancel_recurring
    process :cancel
  end
  
  def suspend_recurring
    process :suspend
  end
  
  def reactivate_recurring
    process :reactivate
  end
   
  def checkout_details
    process :checkout_details
  end
  
  private
  
  def process(action, options = {})
    options = options.reverse_merge(
      token: @subscription.paypal_payment_token,
      ipn_url: "http://192.168.5.63/paypal_ipn?subscription_id=#{@subscription.id}&plan_id=#{@subscription.plan.id}",
      payer_id: @subscription.paypal_customer_token,
      description: @subscription.plan.name,
      amount: @subscription.plan.price,
      currency: "USD"
    )
    response = PayPal::Recurring.new(options).send(action)
    raise response.errors.inspect     if response.errors.present?
    response
  end
end