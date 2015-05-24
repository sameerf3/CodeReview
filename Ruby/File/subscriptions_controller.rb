class SubscriptionsController < ApplicationController
  skip_before_filter :verify_authenticity_token, only: [:validate_license, :validate_license_get, :paypal_ipn]
  skip_before_filter :protect_from_forgery, :except => [:paypal_ipn]
  before_action :set_subscription, only: [:show, :edit, :update, :destroy]
  before_action :authenticate_user!, except: [:validate_license, :validate_license_get, :paypal_ipn]
  before_action :authenticate_admin!, only: [:index, :update, :edit, :destroy]
  # GET /subscriptions
  # GET /subscriptions.json
  def index
    @subscriptions = Subscription.all
  end

  # GET /subscriptions/1
  # GET /subscriptions/1.json
  def show
  end

  # GET /subscriptions/new
  def new
    plan = Plan.find(params[:plan_id])
    @subscription = plan.subscriptions.build
    if params[:PayerID]
      @subscription.user_id = current_user.id
      @subscription.paypal_customer_token = params[:PayerID]
      @subscription.paypal_payment_token = params[:token]
    end
    
  end

  # GET /subscriptions/1/edit
  def edit
  end

  # POST /subscriptions
  # POST /subscriptions.json
  def create
    @subscription = Subscription.new(subscription_params)

    respond_to do |format|
      if @subscription.save_with_paypal
        format.html { redirect_to subscription_list_path, notice: 'Thankyou for subscribing!!' }
        format.json { render :show, status: :created, location: @subscription }
      else
        flash.now[:alert] = @subscription.errors.full_messages.to_sentence(words_connector: ' , ', last_word_connector: ' and ')
        format.html { render :new }
        format.json { render json: @subscription.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /subscriptions/1
  # PATCH/PUT /subscriptions/1.json
  def update
    respond_to do |format|
      if @subscription.update(subscription_params)
        format.html { redirect_to @subscription, notice: 'Subscription was successfully updated.' }
        format.json { render :show, status: :ok, location: @subscription }
      else
        flash.now[:alert] = @subscription.errors.full_messages.to_sentence(words_connector: ' , ', last_word_connector: ' and ')
        format.html { render :edit }
        format.json { render json: @subscription.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /subscriptions/1
  # DELETE /subscriptions/1.json
  def destroy
    @subscription.destroy
    respond_to do |format|
      format.html { redirect_to subscriptions_url, notice: 'Subscription was successfully destroyed.' }
      format.json { head :no_content }
    end
  end
  
  def paypal_checkout
    if check_for_existence(params[:plan_id])
      plan = Plan.find(params[:plan_id])
      subscription = plan.subscriptions.build
      redirect_to subscription.paypal.checkout_url(
        return_url: new_subscription_url(plan_id: plan.id),
        cancel_url: root_url
      )
    else
      redirect_to plan_page_path, alert: 'You already have an active subscription of this product against your account.'
    end
  
  end
  
  def check_for_existence(plan)
    prod_id = Plan.find(plan).product_id
    plans = Plan.where(product_id: prod_id)
    .map {|x| x.id}
    subscriptions = []
    subs = []
    plans.each do |x|
      subs += Subscription.where(plan_id: x)
      .where(is_active: true)
      .map { |y| y.id}
    end
    subs.each do |subscription|
      subscriptions += Subscription.where(id: subscription)
      .where(user_id: current_user.id)
      .where(is_active: true)
      .map { |id| id.id}
    end
    if subscriptions.length > 0
      return false
    else
      return true
    end
  end
  
  #This action is api for external request of license information.
  def validate_license
    result = true
    message = ""
    if params[:account_id].present? && params[:internal_id].present?
      begin
        begin
          user = User.find_by_netsuite_account_id(params[:account_id])
          subs_by_user = Subscription.where(user_id: user.id).where(is_active: true).map { |sub| sub.id}
        rescue
          result = false
          message += "Cannot find user with account id: #{params[:account_id]} "
        end
        begin
          product = Product.find_by_internal_name(params[:internal_id]) 
          plan_ids = Plan.where(product_id: product.id).map { |pl| pl.id}
          subs_by_product = []
          plan_ids.each do |plan|
            subs_by_product += Subscription.where(plan_id: plan).map {|sub| sub.id}
          end
          sub_id = subs_by_user & subs_by_product
          subscriptions = Subscription.find(sub_id.first)
        rescue
          result = false
          message += "Cannot find product with Internal name: #{params[:internal_id]}"
        end
      rescue Exception => error
        result = false
        message = error.message
      end
    else
      result = false
      message = "Invalid parameters"
    end
    respond_to do |format|
      if result
        format.json { render json: { Result: result, Data: {accountId: params[:account_id], productId: params[:internal_id], endDate: subscriptions.expiry_date, currentDateTime: DateTime.now}}}
      else
        format.json { render json: { Result: result, Data: { Error: message, currentDateTime: DateTime.now}}, status: 400}
      end
    end
  end
  
  def validate_license_get
    respond_to do |format|
      format.json { render json: { Result: "false", Data: { Error: "unauthorized"}}, status: 403}
      format.html { raise ActionController::RoutingError.new('Not Found')}
    end
  end
  
  def paypal_ipn
    subscription = Subscription.find(params[:subscription_id])
    if params[:payment_status] == "Completed"
      subscription.expiry_date += subscription.plan.duration.month
    else
      subscription.is_active = false
    end
    subscription.save
    render :text => "", :status => 200
  end
  
  private
  # Use callbacks to share common setup or constraints between actions.
  def set_subscription
    @subscription = Subscription.find(params[:id])
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def subscription_params
    params.require(:subscription).permit(:user_id, :plan_id, :amount, :paypal_customer_token, :paypal_payment_token, :expiry_date)
  end
end
