import os
import pyotp

otp = pyotp.TOTP(os.environ.get("OTP_HMAC_KEY"))
