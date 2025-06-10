import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();
const resend = new Resend(process.env.RESEND_API_KEY);

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/send-email", async (req, res) => {
  const { name, email, subject, message } = req.body;

  // 收件人寫死，避免濫用
  const to = process.env.TO_EMAIL;

  // 基本驗證
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: "缺少必要欄位" });
  }

  try {
    const data = await resend.emails.send({
      from: "HODES <contact@homershie.com>", // 建議換成你自己的 verified domain
      to,
      subject: subject || "Portfolio 聯絡表單",
      html: `
        <p><b>姓名：</b>${name}</p>
        <p><b>Email：</b>${email}</p>
        <p><b>訊息：</b></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    });
    res.status(200).json({ success: true, data });
  } catch (error) {
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
