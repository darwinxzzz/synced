const requiredIntegrationEnv = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "TEST_MEMBER_EMAIL",
  "TEST_MEMBER_PASSWORD",
] as const;

for (const key of requiredIntegrationEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing integration test env var: ${key}`);
  }
}
