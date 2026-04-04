import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

// ─── In-memory rate limiter ───────────────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; timestamp: number }>()

function rateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)
  if (!record || now - record.timestamp > windowMs) {
    rateLimitMap.set(ip, { count: 1, timestamp: now })
    return true
  }
  if (record.count >= limit) return false
  record.count++
  return true
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'

  // ─── Rate limiting ──────────────────────────────────────────────────────────
  const authRoute = pathname.startsWith('/auth') || pathname.startsWith('/login')
  const trpcRoute = pathname.startsWith('/api/trpc')

  if (authRoute && !rateLimit(ip, 10, 60_000)) {
    return new NextResponse('Too many requests', { status: 429 })
  }
  if (trpcRoute && !rateLimit(ip, 100, 60_000)) {
    return new NextResponse('Too many requests', { status: 429 })
  }

  // ─── Supabase session refresh ───────────────────────────────────────────────
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // ─── Auth guards ────────────────────────────────────────────────────────────
  if (!user && (pathname.startsWith('/member') || pathname.startsWith('/admin'))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && pathname === '/login') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const dest = profile?.role === 'admin' ? '/admin/dashboard' : '/member/dashboard'
    const url = request.nextUrl.clone()
    url.pathname = dest
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/member/:path*',
    '/admin/:path*',
    '/login',
    '/auth/:path*',
    '/api/trpc/:path*',
  ],
}
