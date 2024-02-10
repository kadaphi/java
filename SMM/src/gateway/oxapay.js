const { Merchant } = require("oxapay");
const { oxapay_merchant_key } = require("../config/config");

const oxapay = new Merchant(oxapay_merchant_key);

module.exports = oxapay;