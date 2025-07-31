// Menggunakan Edge Runtime dari Vercel untuk kecepatan maksimal
export const config = {
  runtime: 'edge',
};

// Fungsi utama yang akan dijalankan Vercel
export default async function handler(request: Request) {
  // 1. Ambil URL dari parameter pencarian
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new Response('Parameter "url" dibutuhkan.', { status: 400 });
  }

  // 2. Buat URL proxy baru yang menunjuk ke proxy gambar DuckDuckGo
  // Ini adalah trik terakhir kita untuk menembus perlindungan Cloudflare
  const duckDuckGoProxyUrl = `https://proxy.duckduckgo.com/iu/?u=${encodeURIComponent(imageUrl)}`;

  // 3. Alihkan (redirect) browser pengguna ke URL proxy DuckDuckGo
  // Server Anda tidak perlu bekerja keras, hanya mengarahkan lalu lintas.
  return Response.redirect(duckDuckGoProxyUrl, 307); // 307 adalah redirect sementara
}
