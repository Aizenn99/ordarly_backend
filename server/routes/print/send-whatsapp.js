import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import twilio from "twilio";

const app = express();
const upload = multer({ dest: "uploads/" });

// 🔑 Twilio credentials
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

app.post("/send-whatsapp", upload.single("file"), async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const filePath = path.join(__dirname, req.file.path);

    // Upload the PDF to a public URL (Twilio needs a link)
    // For simplicity, you can serve /uploads as static:
    // app.use("/uploads", express.static("uploads"));
    const fileUrl = `https://your-server.com/uploads/${req.file.filename}`;

    await client.messages.create({
      from: "whatsapp:+14155238886", // ✅ Twilio Sandbox Number
      to: `whatsapp:${phoneNumber}`,
      body: `Here is your bill PDF for Order #${req.file.originalname}`,
      mediaUrl: [fileUrl],
    });

    res.json({ success: true, message: "WhatsApp PDF sent ✅" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
