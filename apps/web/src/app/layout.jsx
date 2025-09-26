export const metadata = {
  title: 'QCSv1 Web',
  description: 'QCSv1 Web Application',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
