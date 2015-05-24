// OrderWizard.Module.PaymentMethod.WireTransfer.js
// --------------------------------
// 
define('OrderWizard.Module.PaymentMethod.WireTransfer', ['OrderWizard.Module.PaymentMethod', 'OrderPaymentmethod.Model'], function (OrderWizardModulePaymentMethod, OrderPaymentmethodModel)
{
	'use strict';

	return OrderWizardModulePaymentMethod.extend({
		
		template: 'order_wizard_paymentmethod_wire_transfer_module'


	,	isActive: function()
		{
			var wireTransfer = _.findWhere(this.wizard.application.getConfig('siteSettings.paymentmethods', []), {ispaypal: 'F', creditcard: 'F'});
			return (wireTransfer && wireTransfer.internalid);
		}

	,	past: function()
		{
			//if (this.isActive() && !this.wizard.isPaypalComplete() && !this.wizard.hidePayment())
			//{
            //
			//	var checkout_url = this.wizard.application.getConfig('siteSettings.touchpoints.checkout')
			//	,	joint = ~checkout_url.indexOf('?') ? '&' : '?'
			//	,	previous_step_url = this.wizard.getPreviousStepUrl();
			//
			//	checkout_url += joint + 'paypal=T&next_step=' + previous_step_url;
            //
			//	Backbone.history.navigate(previous_step_url, {trigger: false, replace: true});
			//
			//	document.location.href = checkout_url;
            //
			//	throw new Error('This is not an error. This is just to abort javascript');
			//}
		}

	,	render: function()
		{
			if (this.isActive())
			{
				this.paymentMethod = new OrderPaymentmethodModel({ type: 'wiretransfer' });
				this.paymentMethod.set('primary', null);
				this.paymentMethod.set('complete',true);
				this._render();
			}
		}



	});
});