// Note: nodemailer needs to be installed: npm install nodemailer
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendWelcomeEmail = async (email) => {
  try {
    const mailOptions = {
      from: '"FilmyFire Intelligence" <' + process.env.EMAIL_USER + '>',
      to: email,
      subject: "Welcome to FilmyFire Intelligence!",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #0a0a0f; color: #ffffff; border-radius: 10px;">
          <h2 style="color: #ff3b30; text-align: center;">Welcome to FilmyFire!</h2>
          <p>Thank you for subscribing to our movie intelligence newsletter.</p>
          <p>You'll now receive exclusive explainers, box office insights, and celebrity profiles directly in your inbox.</p>
          <hr style="border: 0; border-top: 1px solid #333; margin: 20px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">&copy; 2026 FilmyFire Intelligence Platform</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return { success: false, error };
  }
};

export const sendNotification = async (subscribers, data) => {
  try {
    const emails = subscribers.map(s => s.email).join(",");
    const { title, description, link, category } = data;
    
    const mailOptions = {
      from: '"FilmyFire Intelligence" <' + process.env.EMAIL_USER + '>',
      to: emails,
      subject: `New Intelligence: ${title}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #0a0a0f; color: #ffffff; border-radius: 10px;">
          <h2 style="color: #ff3b30;">New Intelligence Alert!</h2>
          ${category ? `<p style="color: #a1a1a8; font-size: 14px; text-transform: uppercase; margin-bottom: 5px;">${category}</p>` : ""}
          <p>We've just published a new piece of intelligence that might interest you:</p>
          <div style="background-color: #1a1a24; padding: 20px; border-radius: 8px; border-left: 4px solid #ff3b30; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #ffffff;">${title}</h3>
            <p style="color: #a1a1a8;">${description || ""}</p>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}${link}" 
               style="display: inline-block; padding: 10px 20px; background-color: #ff3b30; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Read Full Intelligence
            </a>
          </div>
          <hr style="border: 0; border-top: 1px solid #333; margin: 20px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">&copy; 2026 FilmyFire Intelligence Platform</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending notification:", error);
    return { success: false, error };
  }
};

export const sendNewArticleNotification = async (subscribers, article) => {
  return sendNotification(subscribers, {
    title: article.title,
    description: article.description || article.summary,
    link: `/articles/${article.category?.toLowerCase()}/${article.slug}`,
    category: article.category
  });
};

export const sendContactFormEmail = async (data) => {
  const { name, email, subject, message } = data;
  try {
    const mailOptions = {
      from: `"${name}" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `Contact Form: ${subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #0a0a0f; color: #ffffff; border-radius: 10px; border: 1px solid #333;">
          <h2 style="color: #ff3b30; border-bottom: 1px solid #333; padding-bottom: 10px;">New Contact Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <div style="background-color: #1a1a24; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <hr style="border: 0; border-top: 1px solid #333; margin: 20px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">&copy; 2026 FilmyFire Intelligence Platform</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending contact email:", error);
    return { success: false, error };
  }
};

export default {
  sendWelcomeEmail,
  sendNotification,
  sendNewArticleNotification,
  sendContactFormEmail
};
