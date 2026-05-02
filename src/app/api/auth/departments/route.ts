import { NextResponse } from "next/server";

import { createClient } from "~/lib/supabase/server";

// Public endpoint — used by the signup form before the user is authenticated.
// No auth check needed; department names are not sensitive data.
export async function GET() {
  try {
    // Intentionally avoid service-role on public endpoints.
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("department")
      .not("department", "is", null);

    if (error) {
      return NextResponse.json({ departments: [] }, { status: 200 });
    }

    const departments = Array.from(
      new Set(
        (data ?? [])
          .map((row) => row.department?.trim())
          .filter((value): value is string => Boolean(value)),
      ),
    ).sort((a, b) => a.localeCompare(b));

    return NextResponse.json({ departments }, { status: 200 });
  } catch {
    return NextResponse.json({ departments: [] }, { status: 200 });
  }
}
