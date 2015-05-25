/** OrderWizard.Module.PaymentMethod.WireTransfer.js
 *  This is the view for Wire Transfer Payment Method.
 *  It is responsible to show wire transfer method on Checkout Page.
**/
define('OrderWizard.Module.PaymentMethod.WireTransfer',
	['OrderWizard.Module.PaymentMethod', 'OrderPaymentmethod.Model'],
	function (OrderWizardModulePaymentMethod, OrderPaymentmethodModel) {
	'use strict';
	return OrderWizardModulePaymentMethod.extend({

		/* defining the template to be shown. */

		template: 'order_wizard_paymentmethod_wire_transfer_module',

		/* Return active wire transfer. */
		isActive: function () {
			var wireTransfer = _.findWhere(this.wizard.application.getConfig('siteSettings.paymentmethods', []), {
				ispaypal: 'F',
				creditcard: 'F'
			});
			return (wireTransfer && wireTransfer.internalid);
		},

		/* This method renders the template on page. */
		render: function () {
			if (this.isActive()) {
				this.paymentMethod = new OrderPaymentmethodModel({
					type: 'wiretransfer'
				});
				this.paymentMethod.set('primary', null);
				this.paymentMethod.set('complete', true);
				this._render();
			}
		}
	});
});