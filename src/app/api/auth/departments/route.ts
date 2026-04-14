import { NextResponse } from "next/server";

import { createAdminClient } from "~/lib/supabase/admin";
import { createClient } from "~/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ departments: [] }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin" || profile.status !== "active") {
      return NextResponse.json({ departments: [] }, { status: 403 });
    }

    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from("profiles")
      .select("department")
      .not("department", "is", null);

    if (error) {
      return NextResponse.json({ departments: [] }, { status: 200 });
    }

    const rows = (data ?? []) as Array<{ department: string | null }>;

    const departments = Array.from(
      new Set(
        rows
          .map((row) => row.department?.trim())
          .filter((value): value is string => Boolean(value)),
      ),
    ).sort((a, b) => a.localeCompare(b));

    return NextResponse.json({ departments }, { status: 200 });
  } catch {
    return NextResponse.json({ departments: [] }, { status: 200 });
  }
}
