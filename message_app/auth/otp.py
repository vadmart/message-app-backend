import os, pyotp


class MessageHOTP:
    __hmac_key = os.environ.get("HMAC_KEY")
    otp_counter = 0
    hotp = pyotp.HOTP(__hmac_key, initial_count=otp_counter)

