import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

url: str = os.environ.get("SUPABASE_URL", "https://jsrpceiurkbknhgwjhsc.supabase.co")
key: str = os.environ.get("SUPABASE_KEY", "sb_publishable_hsLFMmW4wYehxPx6p1FUTQ_YYvee__5")

try:
    supabase: Client = create_client(url, key)
except Exception as e:
    print(f"[Supabase Client Warning] Could not initialize Supabase client: {e}")
    supabase = None
