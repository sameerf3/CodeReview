// OrderWizard.Module.Shipmethod.js
// --------------------------------
//
define('OrderWizard.Module.Shipmethod.NewCustomer', ['Wizard.Module', 'Account.Register.Model'], function (WizardModule, AccountRegisterModel)
{
    'use strict';

    return WizardModule.extend({

        template: 'order_wizard_shipmethod_module'

    ,   events: {
            'click input[name="delivery-options"]': 'changeDeliveryOptions',
            'click a[id="showShipMethods"]' : 'showShipMethods'
        }

    ,   errors: ['ERR_CHK_SELECT_SHIPPING_METHOD','ERR_WS_INVALID_SHIPPING_METHOD'],

        /**
         * This method will be called to show ship methods if user not created.
         */
        showShipMethods: function () {
            var self_add = this;
            debugger;
            if(SC.ENVIRONMENT.PROFILE.isLoggedIn !== 'T') {
                if(!self_add.createUser()) {
                    jQuery('.delivery-options fieldset')
                        .html('<p style="color: #F00">Sorry, complete main information and a valid shipping address is required to view available delivery options.</p>');
                }
            } else {
                self_add.reloadMethods();
            }
        },
       initialize: function ()
        {
            this.waitShipmethod = !SC.ENVIRONMENT.CART.shipmethod;
            WizardModule.prototype.initialize.apply(this, arguments);
            // So we allways have a the reload promise
            this.reloadMethodsPromise = jQuery.Deferred().resolve();
        }
    ,   present: function ()
        {
            this.currentAddress = this.previousAddress = this.model.get('shipaddress');
            this.eventHandlersOn();
        }

    ,   future: function()
        {
            this.currentAddress = this.previousAddress = this.model.get('shipaddress');
            this.eventHandlersOn();
        }

    ,   past: function()
        {
            this.waitShipmethod = !this.model.get('shipmethod');
            this.currentAddress = this.previousAddress = this.model.get('shipaddress');
            this.eventHandlersOn();
        }

    ,   eventHandlersOn: function ()
        {
            // Removes any leftover observer
            this.eventHandlersOff();
            // Adds the observer for this step
            this.model.on('change:shipaddress', this.shipAddressChange, this);

            this.model.on('change:shipmethods', function(){
                _.defer(_.bind(this.render, this));
            }, this);

            var selected_address = this.wizard.options.profile.get('addresses').get(this.currentAddress);

            if (selected_address)
            {
                selected_address.on('change:country change:zip', jQuery.proxy(this, 'reloadMethods'), this);
            }
        }

    ,   eventHandlersOff: function ()
        {
            // removes observers
            this.model.off('change:shipmethods', null, this);
            this.model.off('change:shipaddress', this.shipAddressChange, this);

            var addresses = this.wizard.options.profile.get('addresses')
            ,   current_address = addresses.get(this.currentAddress)
            ,   previous_address = addresses.get(this.previousAddress);

            if (current_address)
            {
                current_address.off('change:country change:zip', null, this);
            }

            if (previous_address && previous_address !== current_address)
            {
                previous_address.off('change:country change:zip', null, this);
            }
        }

    ,   render: function ()
        {

            if (this.state === 'present')
            {
                if (this.model.get('shipmethod') && !this.waitShipmethod)
                {
                    this.trigger('ready', true);
                }
                this._render();
            }
        }

    ,   shipAddressChange: function (model, value)
        {
            // if its not null and there is a difference we reload the methods
            if (this.currentAddress !== value)
            {
                this.currentAddress = value;
                debugger;
                var user_address = this.wizard.options.profile.get('addresses')
                ,   order_address = this.model.get('addresses')
                ,   previous_address = this.previousAddress && (order_address.get(this.previousAddress) || user_address.get(this.previousAddress))
                ,   current_address = this.currentAddress && order_address.get(this.currentAddress) || user_address.get(this.currentAddress)
                ,   changed_zip = previous_address && current_address && previous_address.get('zip') !== current_address.get('zip')
                ,   changed_country = previous_address && current_address && previous_address.get('country') !== current_address.get('country');

                // if previous address is equal to current address we compare the previous values on the model.
                if (this.previousAddress && this.currentAddress && this.previousAddress === this.currentAddress)
                {
                    changed_zip = current_address.previous('zip') !== current_address.get('zip');
                    changed_country = current_address.previous('country') !== current_address.get('country');
                }

                // reload ship methods only if there is no previous address or when change the country or zipcode
                if ((!previous_address && current_address) || changed_zip || changed_country)
                {
                    var self_add = this;
                    debugger;
                    if(SC.ENVIRONMENT.PROFILE.isLoggedIn !== 'T') {
                        self_add.createUser();
                    } else {
                        self_add.reloadMethods();
                    }
                }
                else
                {
                    this.render();
                }

                if (value)
                {
                    this.previousAddress = value;
                }
            }
        }
    ,   accountRegisterModel: new AccountRegisterModel()
    ,   createUser: function() {
            try {
                var firstName = jQuery('#first-name').val();
                var lastName = jQuery('#last-name').val();
                var phone = jQuery('#phone');
                var email = jQuery('#email-address').val();
                //var regex_email = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
                var regex_email = /^[A-Za-z0-9.%+%_\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,4}$/;
                var self_add = this;
                var flag = false;
                if (regex_email.test(email) && firstName.length > 0 && lastName.length > 0 && phone.length > 0) {
                    //Clearing all attributes before creating new user.
                    self_add.accountRegisterModel.clear();
                    //Adding required attributes to create a user
                    self_add.accountRegisterModel.set('firstname', firstName);
                    self_add.accountRegisterModel.set('lastname', lastName);
                    self_add.accountRegisterModel.set('email', email);
                    self_add.accountRegisterModel.set('password', 'click123');
                    self_add.accountRegisterModel.set('password2', 'click123');
                    self_add.accountRegisterModel.save().success(
                        function () {
                            jQuery('body').append('<iframe id="iframe-child" style="display: none;" src = ' + window.location.href + '></iframe>');
                            window.setTimeout(function () {
                                debugger;
                                SC = document.getElementById('iframe-child').contentWindow.SC;
                                jQuery('#iframe-child').remove();
                            }, 10000);
                            self_add.reloadMethods();
                            jQuery('#email-address').attr('disabled', 'disabled');
                            jQuery('#loadingIndicator').hide();
                            jQuery('#showShipMethods').hide();
                        }
                    );
                    flag = true;
                } else {
                    jQuery('#error-main-info').html(SC.macros.message('Sorry, the information below is either incomplete or needs to be corrected.', 'error', true));
                    jQuery('#showShipMethods').show();
                }
                return flag;
            }
            catch (e) {
                return false;
            }
        }
    ,   reloadMethods: function ()
        {
            // to reload the shipping methods we just save the order
            var self = this
            ,   $container = this.$el;

            $container.addClass('loading');
            this.step.disableNavButtons();
            this.reloadMethodsPromise = this.model.save(null, {
                parse: false
            ,   success: function (model, attributes)
                {
                    model.set({
                            shipmethods: attributes.shipmethods
                        ,   summary: attributes.summary
                    });
                }
            }).always(function ()
            {
                $container.removeClass('loading');
                self.render();
                self.step.enableNavButtons();
            });
        }


    ,   submit: function ()
        {
            this.model.set('shipmethod', this.$('input[name=delivery-options]:checked').val());

            return this.isValid();
        }

    ,   isValid: function ()
        {
            var model = this.model
            ,   valid_promise = jQuery.Deferred();

            this.reloadMethodsPromise.always(function ()
            {
                if (model.get('shipmethod') && model.get('shipmethods').get(model.get('shipmethod')))
                {
                    valid_promise.resolve();
                }
                else
                {
                    valid_promise.reject({
                        errorCode: 'ERR_CHK_SELECT_SHIPPING_METHOD'
                    ,   errorMessage: _('Please select a shipping method').translate()
                    });
                }
            });

            return valid_promise;
        }
        , checkFlag : true
    ,   changeDeliveryOptions: function (e)
        {
            if (!this.checkFlag && parseFloat(this.$(e.target).attr('cost')) === 0) {
                return;
            }

            var self = this;

            this.waitShipmethod = true;

            var flCost = parseFloat(this.$(e.target).attr('cost'));
            if (flCost > 0) {
                this.checkFlag = true;
            } else {
                this.checkFlag = false;
            }
            if (isNaN(flCost) || !isFinite(flCost)) {
                flCost = 0.00;
            }

            jQuery('[id=esSubmitBtn]').hide();
            jQuery.ajax({
                async: false,
                url: './services/esSetShipCost.ss?esC=' + flCost
            });
            var url_base = window.location.origin;
            if (flCost) {
                //jQuery('<iframe id="esLoader" src="https://checkout.na1.netsuite.com/app/site/backend/additemtocart.nl?buyid=1455&qty=1&amount=' + flCost + '" style="display:none;"/>').appendTo('body');

                jQuery('<iframe id="esLoader" src="' + url_base + '/app/site/backend/additemtocart.nl?buyid=1455&qty=1&amount=' + flCost + '" style="display:none;"/>').appendTo('body');
                setTimeout(function(){
                    jQuery('[id=esSubmitBtn]').show();
                    jQuery('#esLoader').remove();
                }, 500);
            } else {
                jQuery('<iframe id="esLoader" src="' + url_base + '/app/site/backend/additemtocart.nl?buyid=1455&qty=1" style="display:none;"/>').appendTo('body');
                //jQuery('<iframe id="esLoader" src="https://checkout.na1.netsuite.com/app/site/backend/additemtocart.nl?buyid=1455&qty=1" style="display:none;"/>').appendTo('body');
                setTimeout(function(){
                    jQuery('[id=esSubmitBtn]').show();
                    jQuery('#esLoader').remove();
                }, 500);
            }

            this.model.set('shipmethod', this.$(e.target).val());

            this.step.disableNavButtons();

            this.model.save().success(function()
            {
                self.clearError();
                self.step.enableNavButtons();
                //SC._applications.Checkout.cartInstance.fetch();
            });
        }

        // render the error message
    ,   showError: function ()
        {
            // Note: in special situations (like in payment-selector), there are modules inside modules, so we have several place holders, so we only want to show the error in the first place holder.
            this.$('[data-type="alert-placeholder-module"]:first').html(
                SC.macros.message(this.error.errorMessage, 'error', true)
            );
        }
    });
});
