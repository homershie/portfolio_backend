import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Resend } from "resend";
import rateLimit from "express-rate-limit";

dotenv.config();
const resend = new Resend(process.env.RESEND_API_KEY);

const app = express();
app.use(cors());
app.use(express.json());

// 設定 API 請求頻率限制: 限制同一 IP 在 15 分鐘內最多請求 5 次
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, error: "請求過於頻繁，請 15 分鐘後再試" },
  standardHeaders: true,
  legacyHeaders: false,
});

app.post("/api/send-email", apiLimiter, async (req, res) => {
  const { name, email, subject, message } = req.body;

  // 收件人寫死，避免濫用
  const to = process.env.TO_EMAIL;

  // 基本驗證
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: "缺少必要欄位" });
  }

  try {
    const data = await resend.emails.send({
      from: "HODES <contact@homershie.com>",
      to,
      subject: subject || "Portfolio 聯絡表單",
      html: `
        <p><b>姓名：</b>${name}</p>
        <p><b>Email：</b>${email}</p>
        <p><b>訊息：</b></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    });
    console.log("📧 Email 發送成功:", {
      to,
      subject,
      timestamp: new Date().toISOString(),
    });
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("❌ Email 發送失敗:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/", (req, res) => {
  res.send("OK");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("NODE_ENV:", process.env.NODE_ENV);
});
