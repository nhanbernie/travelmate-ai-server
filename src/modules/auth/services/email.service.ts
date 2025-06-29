import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('GMAIL_USER'),
        pass: this.configService.get<string>('GMAIL_APP_PASSWORD'),
      },
    });
  }

  async sendPasswordResetOTP(
    email: string,
    otp: string,
    userName?: string,
  ): Promise<void> {
    const mailOptions = {
      from: {
        name: 'TravelMate Support',
        address: this.configService.get<string>('GMAIL_USER') || '',
      },
      to: email,
      subject: '🔐 Password Reset - Your OTP Code',
      html: this.generatePasswordResetEmailTemplate(otp, userName),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset OTP sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send password reset OTP to ${email}:`,
        error,
      );
      throw new Error('Failed to send email');
    }
  }

  private generatePasswordResetEmailTemplate(
    otp: string,
    userName?: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset - TravelMate</title>
          <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
              
              * { margin: 0; padding: 0; box-sizing: border-box; }
              
              body {
                  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                  line-height: 1.6;
                  color: #1a1a1a;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  padding: 40px 20px;
                  min-height: 100vh;
              }
              
              .email-wrapper {
                  max-width: 600px;
                  margin: 0 auto;
                  background: #ffffff;
                  border-radius: 24px;
                  overflow: hidden;
                  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
                  position: relative;
              }
              
              .email-wrapper::before {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  height: 6px;
                  background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c);
                  background-size: 400% 400%;
                  animation: gradient-shift 3s ease infinite;
              }
              
              @keyframes gradient-shift {
                  0%, 100% { background-position: 0% 50%; }
                  50% { background-position: 100% 50%; }
              }
              
              .header {
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  padding: 50px 40px;
                  text-align: center;
                  position: relative;
                  overflow: hidden;
              }
              
              .header::before {
                  content: '';
                  position: absolute;
                  top: -50%;
                  left: -50%;
                  width: 200%;
                  height: 200%;
                  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
                  animation: float 6s ease-in-out infinite;
              }
              
              @keyframes float {
                  0%, 100% { transform: translateY(0px) rotate(0deg); }
                  50% { transform: translateY(-20px) rotate(180deg); }
              }
              
              .logo {
                  font-size: 3rem;
                  margin-bottom: 15px;
                  display: inline-block;
                  animation: pulse 2s ease-in-out infinite;
              }
              
              @keyframes pulse {
                  0%, 100% { transform: scale(1); }
                  50% { transform: scale(1.05); }
              }
              
              .header h1 {
                  font-size: 28px;
                  font-weight: 700;
                  margin-bottom: 10px;
                  position: relative;
                  z-index: 1;
              }
              
              .header p {
                  font-size: 16px;
                  opacity: 0.9;
                  font-weight: 300;
                  position: relative;
                  z-index: 1;
              }
              
              .content {
                  padding: 50px 40px;
                  background: #ffffff;
                  position: relative;
              }
              
              .greeting {
                  font-size: 24px;
                  font-weight: 600;
                  color: #1a1a1a;
                  margin-bottom: 20px;
                  background: linear-gradient(135deg, #667eea, #764ba2);
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                  background-clip: text;
              }
              
              .intro-text {
                  font-size: 16px;
                  color: #4a5568;
                  margin-bottom: 35px;
                  line-height: 1.7;
              }
              
              .otp-section {
                  margin: 40px 0;
                  text-align: center;
              }
              
              .otp-label {
                  font-size: 18px;
                  font-weight: 600;
                  color: #2d3748;
                  margin-bottom: 20px;
              }
              
              .otp-container {
                  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
                  border: 3px solid #e2e8f0;
                  border-radius: 20px;
                  padding: 35px;
                  margin: 25px 0;
                  position: relative;
                  overflow: hidden;
                  transition: all 0.3s ease;
              }
              
              .otp-container::before {
                  content: '';
                  position: absolute;
                  top: -2px;
                  left: -2px;
                  right: -2px;
                  bottom: -2px;
                  background: linear-gradient(45deg, #667eea, #764ba2, #f093fb, #f5576c);
                  border-radius: 20px;
                  z-index: -1;
                  opacity: 0;
                  transition: opacity 0.3s ease;
              }
              
              .otp-container:hover::before {
                  opacity: 1;
              }
              
              .otp-code {
                  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                  font-size: 42px;
                  font-weight: 700;
                  color: #667eea;
                  letter-spacing: 12px;
                  margin: 20px 0;
                  text-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
                  position: relative;
                  display: inline-block;
              }
              
              .otp-code::after {
                  content: '';
                  position: absolute;
                  bottom: -10px;
                  left: 50%;
                  transform: translateX(-50%);
                  width: 80%;
                  height: 3px;
                  background: linear-gradient(90deg, transparent, #667eea, transparent);
                  border-radius: 2px;
              }
              
              .timer {
                  display: inline-flex;
                  align-items: center;
                  gap: 8px;
                  background: #fff;
                  padding: 12px 20px;
                  border-radius: 25px;
                  font-weight: 600;
                  color: #e53e3e;
                  box-shadow: 0 4px 12px rgba(229, 62, 62, 0.15);
                  margin-top: 15px;
              }
              
              .timer-icon {
                  font-size: 18px;
                  animation: tick 1s ease-in-out infinite;
              }
              
              @keyframes tick {
                  0%, 100% { transform: rotate(0deg); }
                  50% { transform: rotate(10deg); }
              }
              
              .security-notice {
                  background: linear-gradient(135deg, #fff5cd 0%, #fef5e7 100%);
                  border-left: 5px solid #f6ad55;
                  border-radius: 12px;
                  padding: 25px;
                  margin: 35px 0;
                  position: relative;
              }
              
              .security-notice::before {
                  content: '⚠️';
                  position: absolute;
                  top: -10px;
                  left: 20px;
                  background: #fff;
                  padding: 5px 10px;
                  border-radius: 50%;
                  font-size: 20px;
              }
              
              .security-title {
                  font-weight: 700;
                  color: #c05621;
                  margin-bottom: 15px;
                  font-size: 16px;
              }
              
              .security-list {
                  list-style: none;
                  padding: 0;
              }
              
              .security-list li {
                  padding: 8px 0;
                  color: #744210;
                  position: relative;
                  padding-left: 25px;
              }
              
              .security-list li::before {
                  content: '•';
                  color: #f6ad55;
                  font-size: 20px;
                  position: absolute;
                  left: 0;
                  top: 5px;
              }
              
              .cta-section {
                  text-align: center;
                  margin: 40px 0;
              }
              
              .support-link {
                  display: inline-block;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  padding: 15px 30px;
                  border-radius: 25px;
                  text-decoration: none;
                  font-weight: 600;
                  transition: all 0.3s ease;
                  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
              }
              
              .support-link:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 12px 25px rgba(102, 126, 234, 0.4);
                  color: white;
                  text-decoration: none;
              }
              
              .footer {
                  background: #f8fafc;
                  padding: 40px;
                  text-align: center;
                  border-top: 1px solid #e2e8f0;
              }
              
              .footer p {
                  color: #718096;
                  font-size: 14px;
                  margin: 5px 0;
              }
              
              .social-links {
                  margin: 20px 0;
              }
              
              .social-links a {
                  display: inline-block;
                  margin: 0 10px;
                  width: 40px;
                  height: 40px;
                  background: linear-gradient(135deg, #667eea, #764ba2);
                  border-radius: 50%;
                  line-height: 40px;
                  color: white;
                  text-decoration: none;
                  transition: transform 0.3s ease;
              }
              
              .social-links a:hover {
                  transform: translateY(-3px);
              }
              
              .disclaimer {
                  font-size: 12px;
                  color: #a0aec0;
                  margin-top: 20px;
                  padding: 15px;
                  background: #edf2f7;
                  border-radius: 8px;
              }
              
              @media (max-width: 600px) {
                  body { padding: 20px 10px; }
                  .email-wrapper { border-radius: 16px; }
                  .header, .content { padding: 30px 25px; }
                  .otp-code { font-size: 32px; letter-spacing: 8px; }
                  .greeting { font-size: 20px; }
              }
          </style>
      </head>
      <body>
          <div class="email-wrapper">
              <div class="header">
                  <div class="logo">🛡️</div>
                  <h1>Password Reset Request</h1>
                  <p>TravelMate Security Team</p>
              </div>
              
              <div class="content">
                  <div class="greeting">Hello ${userName || 'User'}! 👋</div>
                  
                  <p class="intro-text">
                      We received a request to reset your password. To ensure the security of your account, 
                      please use the verification code below to proceed with your password reset.
                  </p>
                  
                  <div class="otp-section">
                      <div class="otp-label">Your Verification Code:</div>
                      <div class="otp-container">
                          <div class="otp-code">${otp}</div>
                          <div class="timer">
                              <span class="timer-icon">⏰</span>
                              <span>Expires in 10 minutes</span>
                          </div>
                      </div>
                  </div>
                  
                  <div class="security-notice">
                      <div class="security-title">🔒 Security Notice</div>
                      <ul class="security-list">
                          <li><strong>This code is valid for 10 minutes only</strong></li>
                          <li>Never share this code with anyone</li>
                          <li>If you didn't request this reset, please ignore this email</li>
                          <li>Your password will remain unchanged if you don't use this code</li>
                      </ul>
                  </div>
                  
                  <div class="cta-section">
                      <p style="margin-bottom: 20px; color: #4a5568;">Need help or have concerns?</p>
                      <a href="#" class="support-link">Contact Support</a>
                  </div>
                  
                  <p style="color: #718096; margin-top: 30px;">
                      Best regards,<br>
                      <strong style="color: #2d3748;">The TravelMate Security Team</strong>
                  </p>
              </div>
              
              <div class="footer">
                  <div class="social-links">
                      <a href="#">📧</a>
                      <a href="#">🐦</a>
                      <a href="#">📘</a>
                  </div>
                  <p><strong>TravelMate</strong> - Your trusted travel companion</p>
                  <p>&copy; 2025 TravelMate. All rights reserved.</p>
                  <div class="disclaimer">
                      This is an automated security message. Please do not reply to this email. 
                      If you have any questions, please contact our support team.
                  </div>
              </div>
          </div>
      </body>
      </html>
    `;
  }

  async sendPasswordChangeConfirmation(
    email: string,
    userName?: string,
  ): Promise<void> {
    const mailOptions = {
      from: {
        name: 'TravelMate Support',
        address: this.configService.get<string>('GMAIL_USER') || '',
      },
      to: email,
      subject: '✅ Password Successfully Updated - TravelMate',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Changed - TravelMate</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                
                * { margin: 0; padding: 0; box-sizing: border-box; }
                
                body {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    line-height: 1.6;
                    color: #1a1a1a;
                    background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
                    padding: 40px 20px;
                    min-height: 100vh;
                }
                
                .email-wrapper {
                    max-width: 600px;
                    margin: 0 auto;
                    background: #ffffff;
                    border-radius: 24px;
                    overflow: hidden;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
                    position: relative;
                }
                
                .email-wrapper::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 6px;
                    background: linear-gradient(90deg, #48bb78, #38a169, #68d391, #9ae6b4);
                    background-size: 400% 400%;
                    animation: gradient-shift 3s ease infinite;
                }
                
                @keyframes gradient-shift {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                
                .header {
                    background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
                    color: white;
                    padding: 50px 40px;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }
                
                .header::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
                    animation: float 6s ease-in-out infinite;
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(180deg); }
                }
                
                .success-icon {
                    font-size: 4rem;
                    margin-bottom: 20px;
                    display: inline-block;
                    animation: bounce 2s ease-in-out infinite;
                }
                
                @keyframes bounce {
                    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                    40% { transform: translateY(-10px); }
                    60% { transform: translateY(-5px); }
                }
                
                .header h1 {
                    font-size: 28px;
                    font-weight: 700;
                    margin-bottom: 10px;
                    position: relative;
                    z-index: 1;
                }
                
                .header p {
                    font-size: 16px;
                    opacity: 0.9;
                    font-weight: 300;
                    position: relative;
                    z-index: 1;
                }
                
                .content {
                    padding: 50px 40px;
                    background: #ffffff;
                    position: relative;
                }
                
                .greeting {
                    font-size: 24px;
                    font-weight: 600;
                    color: #1a1a1a;
                    margin-bottom: 25px;
                    background: linear-gradient(135deg, #48bb78, #38a169);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                
                .success-message {
                    background: linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%);
                    border: 2px solid #9ae6b4;
                    border-radius: 16px;
                    padding: 30px;
                    margin: 30px 0;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }
                
                .success-message::before {
                    content: '✓';
                    position: absolute;
                    top: -15px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #48bb78;
                    color: white;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    font-weight: bold;
                }
                
                .success-title {
                    font-size: 20px;
                    font-weight: 700;
                    color: #2f855a;
                    margin-bottom: 15px;
                    margin-top: 10px;
                }
                
                .timestamp {
                    background: #fff;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 20px;
                    margin: 25px 0;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                
                .timestamp-icon {
                    font-size: 24px;
                    color: #48bb78;
                }
                
                .timestamp-info {
                    flex: 1;
                }
                
                .timestamp-label {
                    font-size: 14px;
                    color: #718096;
                    margin-bottom: 5px;
                }
                
                .timestamp-value {
                    font-size: 16px;
                    font-weight: 600;
                    color: #2d3748;
                }
                
                .security-tips {
                    background: linear-gradient(135deg, #fefcbf 0%, #fef5e7 100%);
                    border-left: 5px solid #f6ad55;
                    border-radius: 12px;
                    padding: 25px;
                    margin: 30px 0;
                    position: relative;
                }
                
                .security-tips::before {
                    content: '💡';
                    position: absolute;
                    top: -10px;
                    left: 20px;
                    background: #fff;
                    padding: 5px 10px;
                    border-radius: 50%;
                    font-size: 20px;
                }
                
                .tips-title {
                    font-weight: 700;
                    color: #c05621;
                    margin-bottom: 15px;
                    font-size: 16px;
                    margin-top: 5px;
                }
                
                .tips-list {
                    list-style: none;
                    padding: 0;
                }
                
                .tips-list li {
                    padding: 5px 0;
                    color: #744210;
                    position: relative;
                    padding-left: 20px;
                }
                
                .tips-list li::before {
                    content: '→';
                    color: #f6ad55;
                    font-weight: bold;
                    position: absolute;
                    left: 0;
                }
                
                .action-buttons {
                    text-align: center;
                    margin: 40px 0;
                }
                
                .btn {
                    display: inline-block;
                    padding: 15px 30px;
                    margin: 0 10px;
                    border-radius: 25px;
                    text-decoration: none;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    font-size: 14px;
                }
                
                .btn-primary {
                    background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
                    color: white;
                    box-shadow: 0 8px 20px rgba(72, 187, 120, 0.3);
                }
                
                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 25px rgba(72, 187, 120, 0.4);
                    color: white;
                    text-decoration: none;
                }
                
                .btn-secondary {
                    background: #fff;
                    color: #48bb78;
                    border: 2px solid #48bb78;
                }
                
                .btn-secondary:hover {
                    background: #48bb78;
                    color: white;
                    text-decoration: none;
                }
                
                .footer {
                    background: #f8fafc;
                    padding: 40px;
                    text-align: center;
                    border-top: 1px solid #e2e8f0;
                }
                
                .footer p {
                    color: #718096;
                    font-size: 14px;
                    margin: 5px 0;
                }
                
                .social-links {
                    margin: 20px 0;
                }
                
                .social-links a {
                    display: inline-block;
                    margin: 0 10px;
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, #48bb78, #38a169);
                    border-radius: 50%;
                    line-height: 40px;
                    color: white;
                    text-decoration: none;
                    transition: transform 0.3s ease;
                }
                
                .social-links a:hover {
                    transform: translateY(-3px);
                }
                
                @media (max-width: 600px) {
                    body { padding: 20px 10px; }
                    .email-wrapper { border-radius: 16px; }
                    .header, .content { padding: 30px 25px; }
                    .greeting { font-size: 20px; }
                    .btn { margin: 5px; padding: 12px 24px; }
                }
            </style>
        </head>
        <body>
            <div class="email-wrapper">
                <div class="header">
                    <div class="success-icon">🎉</div>
                    <h1>Password Successfully Updated!</h1>
                    <p>Your account is now more secure</p>
                </div>
                
                <div class="content">
                    <div class="greeting">Hello ${userName || 'User'}! 👋</div>
                    
                    <div class="success-message">
                        <div class="success-title">Great news!</div>
                        <p style="color: #2f855a; margin: 0;">
                            Your password has been successfully updated. Your account is now secured with your new password.
                        </p>
                    </div>
                    
                    <div class="timestamp">
                        <div class="timestamp-icon">📅</div>
                        <div class="timestamp-info">
                            <div class="timestamp-label">Password changed on:</div>
                            <div class="timestamp-value">${new Date().toLocaleString(
                              'en-US',
                              {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                timeZoneName: 'short',
                              },
                            )}</div>
                        </div>
                    </div>
                    
                    <div class="security-tips">
                        <div class="tips-title">Security Tips</div>
                        <ul class="tips-list">
                            <li>Keep your password private and secure</li>
                            <li>Use a unique password for your TravelMate account</li>
                            <li>Enable two-factor authentication for extra security</li>
                            <li>Regularly update your password every 6 months</li>
                        </ul>
                    </div>
                    
                    <div class="action-buttons">
                        <a href="#" class="btn btn-primary">Login to Your Account</a>
                        <a href="#" class="btn btn-secondary">Security Settings</a>
                    </div>
                    
                    <p style="color: #e53e3e; font-weight: 600; text-align: center; margin-top: 30px;">
                        ⚠️ If you didn't make this change, please contact our support team immediately.
                    </p>
                    
                    <p style="color: #718096; margin-top: 30px; text-align: center;">
                        Best regards,<br>
                        <strong style="color: #2d3748;">The TravelMate Security Team</strong>
                    </p>
                </div>
                
                <div class="footer">
                    <div class="social-links">
                        <a href="#">📧</a>
                        <a href="#">🐦</a>
                        <a href="#">📘</a>
                    </div>
                    <p><strong>TravelMate</strong> - Your trusted travel companion</p>
                    <p>&copy; 2025 TravelMate. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password change confirmation sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send confirmation email to ${email}:`,
        error,
      );
    }
  }
}
