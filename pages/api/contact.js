import mailHelper from "../../lib/mail";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const result = await mailHelper.sendContactFormEmail({ name, email, subject, message });
    
    if (result.success) {
      return res.status(200).json({ success: true, message: "Email sent successfully" });
    } else {
      return res.status(500).json({ success: false, message: "Failed to send email", error: result.error });
    }
  } catch (error) {
    console.error("Contact API Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}
