import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

// In-memory rate limiter
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

  // Rate limiting
  const authRoute = pathname.startsWith('/auth') || pathname.startsWith('/login')
  const trpcRoute = pathname.startsWith('/api/trpc')

  if (authRoute && !rateLimit(ip, 10, 60_000)) {
    return new NextResponse('Too many requests', { status: 429 })
  }
  if (trpcRoute && !rateLimit(ip, 100, 60_000)) {
    return new NextResponse('Too many requests', { status: 429 })
  }

  // Supabase session refresh
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const onProtectedAppRoute = pathname.startsWith('/member') || pathname.startsWith('/admin')

  const redirectToLogin = (error?: string) => {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    if (error) {
      url.searchParams.set('error', error)
    }
    return NextResponse.redirect(url)
  }

  // Auth guards
  if (!user && onProtectedAppRoute) {
    return redirectToLogin()
  }

  if (user && (onProtectedAppRoute || pathname === '/login')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', user.id)
      .single()

    if (!profile) {
      await supabase.auth.signOut()
      return redirectToLogin('not_registered')
    }

    if (profile.status === 'pending') {
      await supabase.auth.signOut()
      return redirectToLogin('pending_approval')
    }

    if (profile.status === 'rejected' || profile.status === 'inactive') {
      await supabase.auth.signOut()
      return redirectToLogin('access_rejected')
    }

    if (profile.status !== 'active') {
      await supabase.auth.signOut()
      return redirectToLogin('pending_approval')
    }

    if (onProtectedAppRoute) {
      // Block members from /admin/* and admins from /member/*
      if (pathname.startsWith('/admin') && profile.role !== 'admin') {
        const url = request.nextUrl.clone()
        url.pathname = '/member/dashboard'
        return NextResponse.redirect(url)
      }
      if (pathname.startsWith('/member') && profile.role !== 'member') {
        const url = request.nextUrl.clone()
        url.pathname = '/admin/dashboard'
        return NextResponse.redirect(url)
      }
      return supabaseResponse
    }

    // Post-login redirect: route by role
    const dest = profile.role === 'admin' ? '/admin/dashboard' : '/member/dashboard'
    const url = request.nextUrl.clone()
    url.pathname = dest
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/member/:path*', '/admin/:path*', '/login', '/auth/:path*', '/api/trpc/:path*'],
}
