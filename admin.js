(function () {
    'use strict';

    var ADMIN_USER = 'admin';
    var ADMIN_PASS = 'admin123';
    var STORAGE_KEY = 'mi-pos-admin-data';

    function getDefaultData() {
        return {
            pricing: {
                standard: {
                    accounts: '1 User Account',
                    desc: 'Perfect for small shops and retail stores. Enjoy lightning-fast billing, inventory management, sales reports, barcode support, and receipt printing in a fully offline POS system. Simple, reliable, and easy to use.',
                    otPrice: '30,000',
                    otInstall: 'Installation Charges',
                    moPrice: '2,500',
                    moInstall: 'Installation Charges'
                },
                premium: {
                    accounts: '1 Admin + 1 Cashier Account + 1 Cashier Account Free',
                    desc: 'Designed for growing businesses that need multiple users and better control. Includes advanced reporting, purchase management, supplier management, stock alerts, and role-based access to streamline daily operations.',
                    otPrice: '35,000',
                    otInstall: 'Installation Charges',
                    moPrice: '6,999',
                    moInstall: 'Installation Charges'
                },
                enterprise: {
                    accounts: 'Unlimited User Accounts',
                    desc: 'The ultimate solution for distributors, wholesalers, supermarkets, and multi-branch businesses. Includes unlimited users, warehouse management, distributor operations, FBR integration, cloud synchronization, custom modules, and dedicated support for enterprise-level growth.',
                    otInstall: 'Pricing is customized according to the number of devices and business requirements.',
                    moInstall: 'Pricing is customized according to the number of devices and business requirements.'
                }
            },
            whatsapp: {
                primary: '923325900007',
                secondary: '923162905672'
            },
            variants: {
                restaurant: { icon: '🍽️', name: 'Restaurant POS', desc: 'Complete restaurant management with table layout, kitchen orders, and billing.', badge: 'Available', color: 'green' },
                mart: { icon: '🛒', name: 'Mart POS', desc: 'Retail and supermarket POS with barcode scanning and inventory tracking.', badge: 'Available', color: 'green' },
                bakery: { icon: '🥖', name: 'Bakery POS', desc: 'Bakery-specific billing with weight-based pricing and recipe management.', badge: 'Coming Soon', color: 'yellow' },
                distributor: { icon: '🚚', name: 'Distributor POS', desc: 'Wholesale distribution POS with bulk pricing and delivery management.', badge: 'Premium', color: 'purple' },
                salon: { icon: '💇', name: 'Salon POS', desc: 'Salon and spa POS with appointment booking and service management.', badge: 'Enterprise', color: 'blue' },
                pharmacy: { icon: '💊', name: 'Pharmacy POS', desc: 'Pharmacy POS with expiry tracking, prescription management, and GST.', badge: 'Enterprise', color: 'blue' }
            },
            hardware: {
                scanner: { icon: '📷', name: 'Barcode Scanner', desc: 'High-speed barcode scanner for quick product scanning at checkout.', badge: 'In Stock', color: 'green' },
                'barcode-gen': { icon: '🏷️', name: 'Barcode Generator', desc: 'Create and print custom barcodes for your product inventory.', badge: 'In Stock', color: 'green' },
                thermal: { icon: '🧾', name: 'Thermal Printer', desc: 'High-speed thermal receipt printer with reliable performance.', badge: 'In Stock', color: 'green' },
                'a4-printer': { icon: '🖨️', name: 'A4 Printer', desc: 'Multifunction A4 printer for invoices, reports, and documents.', badge: 'Available', color: 'blue' },
                'pos-terminal': { icon: '💻', name: 'POS Terminal', desc: 'All-in-one POS terminal with touchscreen and built-in printer.', badge: 'Available', color: 'blue' },
                'cash-drawer': { icon: '💰', name: 'Cash Drawer', desc: 'Secure cash drawer with automatic release on transaction completion.', badge: 'Available', color: 'blue' }
            }
        };
    }

    function getData() {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            try {
                var parsed = JSON.parse(raw);
                if (parsed.oneTime) {
                    var defaults = getDefaultData();
                    parsed.pricing = defaults.pricing;
                    parsed.hardware = defaults.hardware;
                    delete parsed.oneTime;
                    delete parsed.monthly;
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
                }
                return parsed;
            } catch (e) {
                return getDefaultData();
            }
        }
        return getDefaultData();
    }

    function saveData(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    function showMsg(el, msg, isError) {
        el.textContent = msg;
        el.className = 'admin-success-msg' + (isError ? ' error' : '');
        setTimeout(function () { el.textContent = ''; }, 3000);
    }

    /* ========== LOGIN ========== */
    var loginScreen = document.getElementById('login-screen');
    var dashboardScreen = document.getElementById('dashboard-screen');
    var loginForm = document.getElementById('login-form');
    var loginError = document.getElementById('login-error');

    if (localStorage.getItem('mi-pos-admin-session') === 'true') {
        loginScreen.style.display = 'none';
        dashboardScreen.style.display = 'block';
        initDashboard();
    }

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var user = document.getElementById('login-user').value.trim();
        var pass = document.getElementById('login-pass').value.trim();

        if (user === ADMIN_USER && pass === ADMIN_PASS) {
            localStorage.setItem('mi-pos-admin-session', 'true');
            loginScreen.style.display = 'none';
            dashboardScreen.style.display = 'block';
            initDashboard();
        } else {
            loginError.textContent = 'Invalid username or password';
        }
    });

    /* ========== LOGOUT ========== */
    document.getElementById('logout-btn').addEventListener('click', function () {
        localStorage.removeItem('mi-pos-admin-session');
        dashboardScreen.style.display = 'none';
        loginScreen.style.display = 'flex';
        document.getElementById('login-user').value = '';
        document.getElementById('login-pass').value = '';
    });

    /* ========== TABS ========== */
    document.querySelectorAll('.admin-tab').forEach(function (tab) {
        tab.addEventListener('click', function () {
            document.querySelectorAll('.admin-tab').forEach(function (t) { t.classList.remove('active'); });
            document.querySelectorAll('.admin-tab-content').forEach(function (c) { c.classList.remove('active'); });
            tab.classList.add('active');
            document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
        });
    });

    /* ========== DASHBOARD INIT ========== */
    function initDashboard() {
        var data = getData();
        populateFields(data);
        bindSaveHandlers(data);
    }

    function populateFields(data) {
        function setVal(id, val) {
            var el = document.getElementById(id);
            if (el) el.value = val || '';
        }

        // Pricing
        if (data.pricing) {
            var priceKeys = ['standard', 'premium', 'enterprise'];
            priceKeys.forEach(function (k) {
                var p = data.pricing[k];
                if (p) {
                    setVal('pricing-' + k + '-accounts', p.accounts);
                    setVal('pricing-' + k + '-desc', p.desc);
                    setVal('pricing-' + k + '-otPrice', p.otPrice);
                    setVal('pricing-' + k + '-otInstall', p.otInstall);
                    setVal('pricing-' + k + '-moPrice', p.moPrice);
                    setVal('pricing-' + k + '-moInstall', p.moInstall);
                }
            });
        }

        // Variants
        if (data.variants) {
            var varKeys = ['restaurant', 'mart', 'bakery', 'distributor', 'salon', 'pharmacy'];
            varKeys.forEach(function (k) {
                var v = data.variants[k];
                if (v) {
                    setVal('var-' + k + '-icon', v.icon);
                    setVal('var-' + k + '-name', v.name);
                    setVal('var-' + k + '-desc', v.desc);
                    setVal('var-' + k + '-badge', v.badge);
                    setVal('var-' + k + '-color', v.color);
                }
            });
        }

        // Hardware
        if (data.hardware) {
            var hwKeys = ['scanner', 'barcode-gen', 'thermal', 'a4-printer', 'pos-terminal', 'cash-drawer'];
            hwKeys.forEach(function (k) {
                var h = data.hardware[k];
                if (h) {
                    setVal('hw-' + k + '-icon', h.icon);
                    setVal('hw-' + k + '-name', h.name);
                    setVal('hw-' + k + '-desc', h.desc);
                    setVal('hw-' + k + '-badge', h.badge);
                    setVal('hw-' + k + '-color', h.color);
                }
            });
        }

        // WhatsApp
        setVal('wa-primary', data.whatsapp.primary);
        setVal('wa-secondary', data.whatsapp.secondary);
    }

    function bindSaveHandlers(data) {
        /* Save Pricing */
        document.getElementById('save-pricing').addEventListener('click', function () {
            function g(id) { return document.getElementById(id).value.trim(); }

            data.pricing = {
                standard: {
                    accounts: g('pricing-standard-accounts'),
                    desc: g('pricing-standard-desc'),
                    otPrice: g('pricing-standard-otPrice'),
                    otInstall: g('pricing-standard-otInstall'),
                    moPrice: g('pricing-standard-moPrice'),
                    moInstall: g('pricing-standard-moInstall')
                },
                premium: {
                    accounts: g('pricing-premium-accounts'),
                    desc: g('pricing-premium-desc'),
                    otPrice: g('pricing-premium-otPrice'),
                    otInstall: g('pricing-premium-otInstall'),
                    moPrice: g('pricing-premium-moPrice'),
                    moInstall: g('pricing-premium-moInstall')
                },
                enterprise: {
                    accounts: g('pricing-enterprise-accounts'),
                    desc: g('pricing-enterprise-desc'),
                    otInstall: g('pricing-enterprise-otInstall'),
                    moInstall: g('pricing-enterprise-moInstall')
                }
            };

            saveData(data);
            showMsg(document.getElementById('pricing-saved-msg'), 'Pricing saved successfully!');
        });

        /* Save Variants */
        document.getElementById('save-variants').addEventListener('click', function () {
            function g(id) { return document.getElementById(id).value.trim(); }

            data.variants = {
                restaurant: { icon: g('var-restaurant-icon'), name: g('var-restaurant-name'), desc: g('var-restaurant-desc'), badge: g('var-restaurant-badge'), color: g('var-restaurant-color') },
                mart: { icon: g('var-mart-icon'), name: g('var-mart-name'), desc: g('var-mart-desc'), badge: g('var-mart-badge'), color: g('var-mart-color') },
                bakery: { icon: g('var-bakery-icon'), name: g('var-bakery-name'), desc: g('var-bakery-desc'), badge: g('var-bakery-badge'), color: g('var-bakery-color') },
                distributor: { icon: g('var-distributor-icon'), name: g('var-distributor-name'), desc: g('var-distributor-desc'), badge: g('var-distributor-badge'), color: g('var-distributor-color') },
                salon: { icon: g('var-salon-icon'), name: g('var-salon-name'), desc: g('var-salon-desc'), badge: g('var-salon-badge'), color: g('var-salon-color') },
                pharmacy: { icon: g('var-pharmacy-icon'), name: g('var-pharmacy-name'), desc: g('var-pharmacy-desc'), badge: g('var-pharmacy-badge'), color: g('var-pharmacy-color') }
            };

            saveData(data);
            showMsg(document.getElementById('variants-saved-msg'), 'Variants saved successfully!');
        });

        /* Save Hardware */
        document.getElementById('save-hardware').addEventListener('click', function () {
            function g(id) { return document.getElementById(id).value.trim(); }

            data.hardware = {
                scanner: { icon: g('hw-scanner-icon'), name: g('hw-scanner-name'), desc: g('hw-scanner-desc'), badge: g('hw-scanner-badge'), color: g('hw-scanner-color') },
                'barcode-gen': { icon: g('hw-barcode-gen-icon'), name: g('hw-barcode-gen-name'), desc: g('hw-barcode-gen-desc'), badge: g('hw-barcode-gen-badge'), color: g('hw-barcode-gen-color') },
                thermal: { icon: g('hw-thermal-icon'), name: g('hw-thermal-name'), desc: g('hw-thermal-desc'), badge: g('hw-thermal-badge'), color: g('hw-thermal-color') },
                'a4-printer': { icon: g('hw-a4-printer-icon'), name: g('hw-a4-printer-name'), desc: g('hw-a4-printer-desc'), badge: g('hw-a4-printer-badge'), color: g('hw-a4-printer-color') },
                'pos-terminal': { icon: g('hw-pos-terminal-icon'), name: g('hw-pos-terminal-name'), desc: g('hw-pos-terminal-desc'), badge: g('hw-pos-terminal-badge'), color: g('hw-pos-terminal-color') },
                'cash-drawer': { icon: g('hw-cash-drawer-icon'), name: g('hw-cash-drawer-name'), desc: g('hw-cash-drawer-desc'), badge: g('hw-cash-drawer-badge'), color: g('hw-cash-drawer-color') }
            };

            saveData(data);
            showMsg(document.getElementById('hardware-saved-msg'), 'Hardware saved successfully!');
        });

        /* Save WhatsApp */
        document.getElementById('save-whatsapp').addEventListener('click', function () {
            data.whatsapp.primary = document.getElementById('wa-primary').value.trim();
            data.whatsapp.secondary = document.getElementById('wa-secondary').value.trim();

            if (!data.whatsapp.primary || !data.whatsapp.secondary) {
                showMsg(document.getElementById('whatsapp-saved-msg'), 'Both numbers are required', true);
                return;
            }

            saveData(data);
            showMsg(document.getElementById('whatsapp-saved-msg'), 'WhatsApp numbers saved successfully!');
        });
    }
})();
