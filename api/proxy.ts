// Menggunakan Edge Runtime dari Vercel untuk kecepatan maksimal
export const config = {
  runtime: 'edge',
};

// Fungsi utama yang akan dijalankan Vercel
export default async function handler(request: Request) {
  // 1. Ambil URL dari parameter pencarian
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  // 2. Jika parameter 'url' tidak ada, kirim pesan error
  if (!imageUrl) {
    return new Response('Parameter "url" dibutuhkan.', { status: 400 });
  }

  try {
    // 3. Ambil gambar dari URL asli dengan header yang lebih lengkap
    const imageResponse = await fetch(imageUrl, {
      headers: {
        // *** BAGIAN INI TELAH DIPERBARUI ***
        // Header ini membuat permintaan kita terlihat seperti dari browser asli
        'Referer': 'https://komikcast.li/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
      },
    });

    // 4. Jika server komik merespons dengan error, teruskan errornya
    if (!imageResponse.ok) {
        // Memberi pesan yang lebih jelas jika gagal
        return new Response(`Gagal mengambil gambar. Sumber merespons dengan status: ${imageResponse.status}`, { status: imageResponse.status });
    }

    // 5. Salin header penting dari respons asli
    const headers = new Headers();
    headers.set('Content-Type', imageResponse.headers.get('Content-Type') || 'image/jpeg');
    headers.set('Cache-Control', 'public, max-age=604800, immutable');

    // 6. Kirim gambar kembali ke browser pengguna
    return new Response(imageResponse.body, {
      headers,
    });

  } catch (error) {
    return new Response('Terjadi kesalahan pada server proxy.', { status: 500 });
  }
}
