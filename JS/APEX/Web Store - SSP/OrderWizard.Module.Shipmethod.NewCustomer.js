/**
 * OrderWizard.Module.Shipmethod.NewCustomer.js
 * We need to create a user on chip method change.
 * This View is responsible of handling Ship Methods.
 */

define('OrderWizard.Module.Shipmethod.NewCustomer',
    ['Wizard.Module', 'Account.Register.Model'],
    function (WizardModule, AccountRegisterModel) {
    'use strict';

    return WizardModule.extend({

        /* defining the template to be shown. */
        template: 'order_wizard_shipmethod_module',
        events: {
            'click input[name="delivery-options"]': 'changeDeliveryOptions',
            'click a[id="showShipMethods"]': 'showShipMethods'
        },

        /* Error messages. */
        errors: ['ERR_CHK_SELECT_SHIPPING_METHOD', 'ERR_WS_INVALID_SHIPPING_METHOD'],

        /**
         * This method will be called to show ship methods if user not created.
         */
        showShipMethods: function () {
            var self_add = this;
            /*  checks if user is logged in... If user is not logged in, try to create a user. */
            if (SC.ENVIRONMENT.PROFILE.isLoggedIn !== 'T') {
                if (!self_add.createUser()) {
                    /* If user not created, show error. */
                    jQuery('.delivery-options fieldset')
                        .html('<p style="color: #F00">Sorry, complete main information and a valid shipping address is required to view available delivery options.</p>');
                }
            } else {
                /* try to load ship methods */
                self_add.reloadMethods();
            }
        },

        /**
         * Constructor.
         */
        initialize: function () {
            this.waitShipmethod = !SC.ENVIRONMENT.CART.shipmethod;
            WizardModule.prototype.initialize.apply(this, arguments);
            // So we always have the reload promise
            this.reloadMethodsPromise = jQuery.Deferred().resolve();
        },

        /**
         * Event handlers on.
         */
        eventHandlersOn: function () {
            // Removes any leftover observer
            this.eventHandlersOff();
            // Adds the observer for this step
            /* observer for ship address change */
            this.model.on('change:shipaddress', this.shipAddressChange, this);

            /* observer for ship method change */
            this.model.on('change:shipmethods', function () {
                _.defer(_.bind(this.render, this));
            }, this);

            var selected_address = this.wizard.options.profile.get('addresses').get(this.currentAddress);

            /* observer on selected address change. */
            if (selected_address) {
                selected_address.on('change:country change:zip', jQuery.proxy(this, 'reloadMethods'), this);
            }
        },

        /**
         * Event handlers off.
         */
        eventHandlersOff: function () {
            // removes observers
            this.model.off('change:shipmethods', null, this);
            this.model.off('change:shipaddress', this.shipAddressChange, this);

            var addresses = this.wizard.options.profile.get('addresses'),
                current_address = addresses.get(this.currentAddress),
                previous_address = addresses.get(this.previousAddress);

            if (current_address) {
                current_address.off('change:country change:zip', null, this);
            }

            if (previous_address && previous_address !== current_address) {
                previous_address.off('change:country change:zip', null, this);
            }
        },

        /**
         *  This method renders the template on page.
         */
        render: function () {

            if (this.state === 'present') {
                if (this.model.get('shipmethod') && !this.waitShipmethod) {
                    this.trigger('ready', true);
                }
                this._render();
            }
        },

        /**
         * Methods that contains all the logic of shipping address changes.
         * @param model
         * @param value
         */
        shipAddressChange: function (model, value) {
            // if its not null and there is a difference we reload the methods
            if (this.currentAddress !== value) {
                this.currentAddress = value;
                /* get all the addresses */
                var user_address = this.wizard.options.profile.get('addresses'),
                    order_address = this.model.get('addresses'),
                    previous_address = this.previousAddress && (order_address.get(this.previousAddress) || user_address.get(this.previousAddress)),
                    current_address = this.currentAddress && order_address.get(this.currentAddress) || user_address.get(this.currentAddress),
                    changed_zip = previous_address && current_address && previous_address.get('zip') !== current_address.get('zip'),
                    changed_country = previous_address && current_address && previous_address.get('country') !== current_address.get('country');

                /* if previous address is equal to current address we compare the previous values on the model.*/
                if (this.previousAddress && this.currentAddress && this.previousAddress === this.currentAddress) {
                    changed_zip = current_address.previous('zip') !== current_address.get('zip');
                    changed_country = current_address.previous('country') !== current_address.get('country');
                }

                // reload ship methods only if there is no previous address or when change the country or zipcode
                if ((!previous_address && current_address) || changed_zip || changed_country) {
                    var self_add = this;
                    /**
                     * Checks if the user is logged in?
                     * if the user is not logged in, we try to create a user. As user is required to load ship methods.
                     */
                    if (SC.ENVIRONMENT.PROFILE.isLoggedIn !== 'T') {
                        /* Trying to create a user*/
                        self_add.createUser();
                    } else {
                        /* if user is already logged in, reload ship methods. */
                        self_add.reloadMethods();
                    }
                } else {
                    /* if no address present, or no address changed, then only render the template */
                    this.render();
                }

                /* set previous address value */
                if (value) {
                    this.previousAddress = value;
                }
            }
        },
        /**
         * Creating new object of Account Register model to be used in creating new user.
         */
        accountRegisterModel: new AccountRegisterModel(),

        /**
         * Create a user and load ship methods.
         * @returns {boolean}
         */
        createUser: function () {
            try {
                /*  Get data from page. */
                var firstName = jQuery('#first-name').val();
                var lastName = jQuery('#last-name').val();
                var phone = jQuery('#phone');
                var email = jQuery('#email-address').val();
                /* Regex for testing email address/*/
                var regex_email = /^[A-Za-z0-9.%+%_\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,4}$/;
                var self_add = this;
                var flag = false;
                /* if all the cases passes, try to create a user with dummy password. */
                if (regex_email.test(email) && firstName.length > 0 && lastName.length > 0 && phone.length > 0) {
                    //Clearing all attributes before creating new user just to ensure no extra property is left in model.
                    self_add.accountRegisterModel.clear();
                    //Adding required attributes to create a user
                    self_add.accountRegisterModel.set('firstname', firstName);
                    self_add.accountRegisterModel.set('lastname', lastName);
                    self_add.accountRegisterModel.set('email', email);
                    self_add.accountRegisterModel.set('password', 'click123');
                    self_add.accountRegisterModel.set('password2', 'click123');
                    self_add.accountRegisterModel.save().success(
                        /**
                         * The below functionality is just to gain required values that needs a complete redirection of page.
                         * To avoid redirection, we opened the current page in an i-frame, extracted required values from there
                         * and removed the i-frame.
                         */
                        function () {
                            jQuery('body').append('<iframe id="iframe-child" style="display: none;" src = ' + window.location.href + '></iframe>');
                            window.setTimeout(function () {
                                SC = document.getElementById('iframe-child').contentWindow.SC;
                                jQuery('#iframe-child').remove();
                            }, 10000);
                            self_add.reloadMethods();
                            /* Setting email address field disabled.*/
                            jQuery('#email-address').attr('disabled', 'disabled');
                            /* Hiding loader icon */
                            jQuery('#loadingIndicator').hide();
                            /* Hiding "show ship method button". */
                            jQuery('#showShipMethods').hide();
                        }
                    );
                    flag = true;
                } else {
                    /* Show errors if user creation failed*/
                    jQuery('#error-main-info').html(
                        SC.macros.message('Sorry, the information below is either incomplete or needs to be corrected.', 'error', true)
                    );
                    /* Showing "show ship method button". */
                    jQuery('#showShipMethods').show();
                }
                return flag;
            } catch (e) {
                return false;
            }
        },

        /* Load ship methods and gets prices from pace jet script. */
        reloadMethods: function () {
            // to reload the shipping methods we just save the order
            var self = this,
                $container = this.$el;

            /* Adding a loader image on the ship method section*/
            $container.addClass('loading');

            /* Disable submit button just to ensure user not press is while the ship methods being calculated. */
            this.step.disableNavButtons();
            this.reloadMethodsPromise = this.model.save(null, {
                parse: false,
                success: function (model, attributes) {
                    model.set({
                        shipmethods: attributes.shipmethods,
                        summary: attributes.summary
                    });
                }
            }).always(function () {
                $container.removeClass('loading');
                self.render();
                self.step.enableNavButtons();
            });
        },

        /* sets ship method in cart. */
        submit: function () {
            this.model.set('shipmethod', this.$('input[name=delivery-options]:checked').val());

            return this.isValid();
        },

        /* validate whether any ship method is selected or not */
        isValid: function () {
            var model = this.model,
                valid_promise = jQuery.Deferred();

            this.reloadMethodsPromise.always(function () {
                if (model.get('shipmethod') && model.get('shipmethods').get(model.get('shipmethod'))) {
                    valid_promise.resolve();
                } else {
                    valid_promise.reject({
                        errorCode: 'ERR_CHK_SELECT_SHIPPING_METHOD',
                        errorMessage: _('Please select a shipping method').translate()
                    });
                }
            });

            return valid_promise;
        },

        /** hack: There was an error in the script calculating shipping cost. When the 0 price occurs.
         *  The Scripts goes in an infinite loop. To avoid it, we introduced a flag that stops the script from further execution
         *  if the cost is 0.
         *  This flag is used in change delivery option method.*/
        checkFlag: true,

        /**
         * Handle change delivery option logic.
         * @param e
         */
        changeDeliveryOptions: function (e) {
            /* Check if the flag is not false.
            * This is just to check if script is gone in infinite loop.
            * If so, return without any further execution.
            */
            if (!this.checkFlag && parseFloat(this.$(e.target).attr('cost')) === 0) {
                return;
            }
            var self = this;

            this.waitShipmethod = true;

            var flCost = parseFloat(this.$(e.target).attr('cost'));
            /* If the cost is 0, mark flag false. */
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
                setTimeout(function () {
                    jQuery('[id=esSubmitBtn]').show();
                    jQuery('#esLoader').remove();
                }, 500);
            } else {
                jQuery('<iframe id="esLoader" src="' + url_base + '/app/site/backend/additemtocart.nl?buyid=1455&qty=1" style="display:none;"/>').appendTo('body');
                //jQuery('<iframe id="esLoader" src="https://checkout.na1.netsuite.com/app/site/backend/additemtocart.nl?buyid=1455&qty=1" style="display:none;"/>').appendTo('body');
                setTimeout(function () {
                    jQuery('[id=esSubmitBtn]').show();
                    jQuery('#esLoader').remove();
                }, 500);
            }

            this.model.set('shipmethod', this.$(e.target).val());

            this.step.disableNavButtons();

            this.model.save().success(function () {
                self.clearError();
                self.step.enableNavButtons();
                //SC._applications.Checkout.cartInstance.fetch();
            });
        },

        /* Show errors on submit if any */
        showError: function () {
            // Note: in special situations (like in payment-selector), there are modules inside modules, so we have several place holders, so we only want to show the error in the first place holder.
            this.$('[data-type="alert-placeholder-module"]:first').html(
                SC.macros.message(this.error.errorMessage, 'error', true)
            );
        }
    });
});