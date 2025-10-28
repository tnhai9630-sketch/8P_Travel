const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const crypto = require("crypto");
const axios = require("axios");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public"))); // phục vụ HTML


// ================== CONFIG MOMO SANDBOX ==================
const momoConfig = {
  partnerCode: "MOMO",
  accessKey: "F8BBA842ECF85",
  secretKey: "K951B6PE1waDMi640xX08PD3vg6EkVlz",
  requestType: "payWithMethod",
  redirectUrl: "http://localhost:5500/xac-nhan-thanh-toan.html",
  ipnUrl: "http://localhost:3000/momo-ipn",
  endpoint: "https://test-payment.momo.vn/v2/gateway/api/create",
};

// ================== API tạo link MoMo ==================
app.post("/create-momo", async (req, res) => {
  try {
    const { total } = req.body;
    const orderId = Date.now().toString();
    const requestId = orderId;

    const rawData = {
      partnerCode: momoConfig.partnerCode,
      accessKey: momoConfig.accessKey,
      requestId,
      amount: total.toString(),
      orderId,
      orderInfo: "Thanh toan dat phong",
      redirectUrl: momoConfig.redirectUrl,
      ipnUrl: momoConfig.ipnUrl,
      requestType: momoConfig.requestType,
      extraData: "",
    };

    const rawSignature =
      "accessKey=" + rawData.accessKey +
      "&amount=" + rawData.amount +
      "&extraData=" + rawData.extraData +
      "&ipnUrl=" + rawData.ipnUrl +
      "&orderId=" + rawData.orderId +
      "&orderInfo=" + rawData.orderInfo +
      "&partnerCode=" + rawData.partnerCode +
      "&redirectUrl=" + rawData.redirectUrl +
      "&requestId=" + rawData.requestId +
      "&requestType=" + rawData.requestType;

    const signature = crypto
      .createHmac("sha256", momoConfig.secretKey)
      .update(rawSignature)
      .digest("hex");

    rawData.signature = signature;

    const response = await axios.post(momoConfig.endpoint, rawData);
    res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err);
    res.status(500).json({ message: "Lỗi kết nối server MoMo" });
  }
});


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
