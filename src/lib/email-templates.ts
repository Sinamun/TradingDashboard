const baseStyle = `
  body { margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  table { border-collapse: collapse; }
`;

function wrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>${baseStyle}</style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#030712; padding: 48px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Logo / Brand -->
          <tr>
            <td align="center" style="padding-bottom: 40px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:8px; height:8px; background-color:#34d399; border-radius:50%;"></td>
                  <td style="padding-left:10px; font-size:11px; font-weight:700; letter-spacing:0.15em; color:#d1d5db; text-transform:uppercase;">
                    Bullist
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#111827; border:1px solid #1f2937; border-radius:12px; padding:40px 36px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:28px;">
              <p style="margin:0; font-size:11px; color:#4b5563; line-height:1.6;">
                This email was sent by Bullist · <a href="https://www.bullist.co" style="color:#4b5563; text-decoration:underline;">www.bullist.co</a>
              </p>
              <p style="margin:6px 0 0; font-size:11px; color:#374151;">
                If you didn't request this, you can safely ignore it.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function verificationEmail(name: string, url: string): string {
  return wrapper(`
    <!-- Heading -->
    <h1 style="margin:0 0 8px; font-size:22px; font-weight:700; color:#f9fafb; letter-spacing:-0.02em;">
      Verify your email
    </h1>
    <p style="margin:0 0 32px; font-size:14px; color:#9ca3af; line-height:1.6;">
      Hey ${name || "there"} — one quick step before you can access your dashboard.
    </p>

    <!-- Divider -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr><td style="height:1px; background-color:#1f2937;"></td></tr>
    </table>

    <!-- Body -->
    <p style="margin:0 0 28px; font-size:14px; color:#d1d5db; line-height:1.7;">
      Click the button below to verify your email address and activate your account.
      This link expires in <strong style="color:#f9fafb;">24 hours</strong>.
    </p>

    <!-- CTA Button -->
    <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="background-color:#059669; border-radius:8px;">
          <a href="${url}"
             style="display:inline-block; padding:13px 28px; font-size:14px; font-weight:600; color:#ffffff; text-decoration:none; letter-spacing:0.01em;">
            Verify email address →
          </a>
        </td>
      </tr>
    </table>

    <!-- Fallback link -->
    <p style="margin:0; font-size:12px; color:#6b7280; line-height:1.6;">
      Button not working? Copy and paste this link into your browser:<br/>
      <a href="${url}" style="color:#34d399; word-break:break-all; text-decoration:none;">${url}</a>
    </p>
  `);
}

export function resetPasswordEmail(name: string, url: string): string {
  return wrapper(`
    <!-- Heading -->
    <h1 style="margin:0 0 8px; font-size:22px; font-weight:700; color:#f9fafb; letter-spacing:-0.02em;">
      Reset your password
    </h1>
    <p style="margin:0 0 32px; font-size:14px; color:#9ca3af; line-height:1.6;">
      Hey ${name || "there"} — we received a request to reset your password.
    </p>

    <!-- Divider -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr><td style="height:1px; background-color:#1f2937;"></td></tr>
    </table>

    <!-- Body -->
    <p style="margin:0 0 28px; font-size:14px; color:#d1d5db; line-height:1.7;">
      Click the button below to choose a new password.
      This link expires in <strong style="color:#f9fafb;">1 hour</strong>.
    </p>

    <!-- CTA Button -->
    <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="background-color:#059669; border-radius:8px;">
          <a href="${url}"
             style="display:inline-block; padding:13px 28px; font-size:14px; font-weight:600; color:#ffffff; text-decoration:none; letter-spacing:0.01em;">
            Reset password →
          </a>
        </td>
      </tr>
    </table>

    <!-- Fallback link -->
    <p style="margin:0; font-size:12px; color:#6b7280; line-height:1.6;">
      Button not working? Copy and paste this link into your browser:<br/>
      <a href="${url}" style="color:#34d399; word-break:break-all; text-decoration:none;">${url}</a>
    </p>
  `);
}
