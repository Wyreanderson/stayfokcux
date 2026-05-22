function required(value: string | undefined, key: string): string {
  if (!value) throw new Error(`Variável de ambiente ausente: ${key}`);
  return value;
}

export const env = {
  supabaseUrl: () =>
    required(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: () =>
    required(
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ),
  supabaseServiceRole: () =>
    required(process.env.SUPABASE_SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY"),
  anthropicKey: () =>
    required(process.env.ANTHROPIC_API_KEY, "ANTHROPIC_API_KEY"),
  openaiKey: () => required(process.env.OPENAI_API_KEY, "OPENAI_API_KEY"),
  defaultUserId: () =>
    required(process.env.DEFAULT_USER_ID, "DEFAULT_USER_ID"),
  storageBucket: () => process.env.SUPABASE_STORAGE_BUCKET || "audios-tarefas",
};
