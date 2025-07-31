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

  // 2. Buat header penyamaran terbaik yang kita punya
  const requestHeaders = new Headers();
  requestHeaders.set('Referer', 'https://komikcast.li/');
  requestHeaders.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36');
  requestHeaders.set('Accept', 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8');

  try {
    // 3. Ambil gambar dari URL asli dengan penyamaran
    const imageResponse = await fetch(imageUrl, {
      headers: requestHeaders,
    });

    // Jika gagal, berikan pesan error yang jelas
    if (!imageResponse.ok) {
      return new Response(`Gagal mengambil gambar. Sumber merespons dengan status: ${imageResponse.status}`, { status: imageResponse.status });
    }

    // 4. Jika berhasil, kirim gambar seperti biasa
    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', imageResponse.headers.get('Content-Type') || 'image/jpeg');
    responseHeaders.set('Cache-Control', 'public, max-age=604800, immutable');

    return new Response(imageResponse.body, {
      headers: responseHeaders,
    });

  } catch (error) {
    return new Response('Terjadi kesalahan pada server proxy.', { status: 500 });
  }
}
