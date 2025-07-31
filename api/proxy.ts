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

  // Membuat URL referer yang dinamis berdasarkan URL gambar
  const refererUrl = new URL(imageUrl);

  // *** BAGIAN INI TELAH DIPERBARUI DENGAN PENYAMARAN MAKSIMAL ***
  // 2. Buat header yang meniru browser Chrome di Android
  const requestHeaders = new Headers();
  requestHeaders.set('Accept', 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8');
  requestHeaders.set('Accept-Encoding', 'gzip, deflate, br');
  requestHeaders.set('Accept-Language', 'en-US,en;q=0.9,id;q=0.8');
  requestHeaders.set('Referer', refererUrl.origin + '/'); // Menggunakan domain utama sebagai referer
  requestHeaders.set('Sec-Ch-Ua', '"Not/A)Brand";v="99", "Google Chrome";v="115", "Chromium";v="115"');
  requestHeaders.set('Sec-Ch-Ua-Mobile', '?1');
  requestHeaders.set('Sec-Ch-Ua-Platform', '"Android"');
  requestHeaders.set('Sec-Fetch-Dest', 'image');
  requestHeaders.set('Sec-Fetch-Mode', 'no-cors');
  requestHeaders.set('Sec-Fetch-Site', 'cross-site');
  requestHeaders.set('User-Agent', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36');


  try {
    // 3. Ambil gambar dari URL asli dengan header penyamaran
    const imageResponse = await fetch(imageUrl, {
      headers: requestHeaders,
    });

    if (!imageResponse.ok) {
      return new Response(`Gagal mengambil gambar. Sumber merespons dengan status: ${imageResponse.status}`, { status: imageResponse.status });
    }

    // 4. Salin header penting dari respons asli
    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', imageResponse.headers.get('Content-Type') || 'image/jpeg');
    responseHeaders.set('Cache-Control', 'public, max-age=604800, immutable');

    // 5. Kirim gambar kembali ke browser pengguna
    return new Response(imageResponse.body, {
      headers: responseHeaders,
    });

  } catch (error) {
    return new Response('Terjadi kesalahan pada server proxy.', { status: 500 });
  }
}
