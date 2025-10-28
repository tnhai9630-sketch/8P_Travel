const express = require("express");
const cors = require("cors");
const paypal = require("@paypal/checkout-server-sdk");

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

const Environment = paypal.core.SandboxEnvironment;
const paypalClient = new paypal.core.PayPalHttpClient(
  new Environment(
    "AaYcbdE1JmHL3j1bqJsg8zUIkdRXuZdII-v2g4TQTR6Qjnu3rHnQiD2KcDb3D2A_Xz0rJehEUGYVcRl6",
    "EJpCqkulbUqgGT4NmWKL2SWd7ZiXIRsBZfZMTID8j9OU2olkn8odLZd7cnlq4hbfqihgwVEsofCw3aMn"
  )
);

// 🟢 Tạo đơn thanh toán
app.post("/create-paypal-order", async (req, res) => {
  try {
    const totalVND = req.body.total;
    const description = req.body.description || "Thanh toán đặt phòng";
    const VND_TO_USD_RATE = 25400;
    const totalUSD = (totalVND / VND_TO_USD_RATE).toFixed(2);

    if (!totalVND || totalUSD < 0.01) {
      return res.status(400).json({ error: "Số tiền không hợp lệ." });
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: totalUSD,
          },
          description,
        },
      ],
      application_context: {
        brand_name: "8P Travel",
        landing_page: "LOGIN",
        user_action: "PAY_NOW",
        return_url: "http://localhost:4000/success",
        cancel_url: "http://localhost:4000/cancel",
      },
    });

    const order = await paypalClient.execute(request);
    const approveLink = order.result.links.find(link => link.rel === "approve").href;
    res.json({ link: approveLink });
  } catch (err) {
    console.error("❌ Lỗi tạo đơn PayPal:", err.message);
    res.status(500).json({ error: "Không thể tạo đơn PayPal." });
  }
});

// 🟢 Xử lý khi thanh toán thành công
app.get("/success", async (req, res) => {
  const { token } = req.query;
  try {
    const captureRequest = new paypal.orders.OrdersCaptureRequest(token);
    captureRequest.requestBody({});
    const capture = await paypalClient.execute(captureRequest);
    console.log("✅ Thanh toán thành công:", capture.result);
     // Gửi HTML hiển thị thông báo trước khi chuyển trang
    res.send(`
      <html lang="vi">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Đang xử lý...</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              background: #f0f8ff;
              padding-top: 100px;
            }
            h2 {
              color: #28a745;
              font-size: 24px;
            }
            p {
              color: #555;
              font-size: 18px;
            }
          </style>
        </head>
        <body>
          <h2>✅ Thanh toán thành công!</h2>
          <p>Cảm ơn bạn đã đặt phòng cùng <strong>8P Travel</strong>.</p>
          <p>Đang chuyển đến trang xác nhận...</p>

          <script>
            setTimeout(() => {
              window.location.href = "http://127.0.0.1:5500/xac-nhan-thanh-toan.html";
            }, 3000); // 3 giây sau chuyển trang
          </script>
        </body>
      </html>
    `);
  } catch (err) {
    console.error("❌ Lỗi xác nhận thanh toán:", err);
    res.send("Thanh toán thất bại!");
  }
});

app.get("/cancel", (req, res) => {
  res.send("Thanh toán đã bị hủy.");
});

app.listen(4000, () => console.log("✅ Server PayPal đang chạy tại http://localhost:4000"));
