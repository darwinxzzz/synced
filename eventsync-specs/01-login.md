# EventSync — Login Page
> Read 00-design-system.md first. Feed both files together.

## Screenshot Reference
- Design target: `screenshots/stitch-login.png`
- Stitch ID: `3ef10a2ba7f044bc8484e13d9abbdbfb` — "Login Page – Event Sync"

## File to Build
`src/app/(auth)/login/page.tsx`

---

## Layout
Split layout — two columns side by side, full viewport height.

### Left Column (50% width, desktop only — hidden on mobile)
- Full-height bamboo grove photo (Arashiyama aesthetic)
- Use `next/image` with `fill` and `object-cover`
- Slight dark overlay so text is readable if any text is placed over it

### Right Column (50% desktop / 100% mobile)
- Vertically and horizontally centred login card
- Card: `var(--cream-white)` background, `.card-shadow`, rounded-2xl
- Padding: p-8 desktop, p-6 mobile

---

## Login Card Contents (top to bottom)

### Logo / Brand
- "🎋 Event Sync" logo or wordmark
- Subtitle or tagline (small, muted, DM Sans)

### Form Fields
```
Label: Email
Input: type="email", placeholder="your@email.com"
Class: .es-input

Label: Password
Input: type="password", placeholder="••••••••"
Class: .es-input
```

### Primary CTA
```
Button: "Sign In"
Style: full-width, bg-[--deep-forest], text-white
Height: 48px minimum
Loading: spinner replaces text while submitting
```

### Divider
```
— or —
Thin line with centred "or" text, muted colour
```

### OAuth Button
```
Button: "Sign in with Google"
Style: full-width, outlined border, white bg, Google icon left
```

### Footer Link
```
Text: "New? Create an account"
Style: centred, text-sm, var(--bamboo-green) link colour
```

---

## Validation & Error States
- Invalid credentials: inline red error message below password field
- Empty required fields: red border on input + helper text
- No page reload on error — display inline

---

## Post-Login Routing
```typescript
const role = user.user_metadata?.role
if (role === 'admin')  router.push('/admin/dashboard')
if (role === 'member') router.push('/member/dashboard')
```

---

## Mobile (390px)
- Left column (photo) hidden entirely
- Right column becomes full-width, full-height
- Card fills most of the screen with comfortable padding
- "Sign In" button full-width, 52px height
