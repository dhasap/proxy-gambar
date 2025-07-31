// Menggunakan Edge Runtime dari Vercel untuk kecepatan maksimal
export const config = {
  runtime: 'edge',
};

// Fungsi utama yang akan dijalankan Vercel
export default async function handler(request: Request) {
  // 1. Ambil URL dari parameter pencarian (misal: ?url=https://...)
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  // 2. Jika parameter 'url' tidak ada, kirim pesan error
  if (!imageUrl) {
    return new Response('Parameter "url" dibutuhkan.', { status: 400 });
  }

  try {
    // 3. Ambil gambar dari URL asli
    const imageResponse = await fetch(imageUrl, {
      headers: {
        // Menyamarkan permintaan kita seolah-olah dari browser biasa
        'Referer': 'https://komikcast.li/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    // 4. Jika server komik merespons dengan error, teruskan errornya
    if (!imageResponse.ok) {
        return new Response('Gagal mengambil gambar dari sumber.', { status: imageResponse.status });
    }

    // 5. Salin header penting (seperti tipe gambar) dari respons asli
    const headers = new Headers();
    headers.set('Content-Type', imageResponse.headers.get('Content-Type') || 'image/jpeg');
    headers.set('Cache-Control', 'public, max-age=604800, immutable'); // Cache selama 7 hari

    // 6. Kirim gambar kembali ke browser pengguna
    return new Response(imageResponse.body, {
      headers,
    });

  } catch (error) {
    // Jika terjadi error jaringan, kirim pesan error server
    return new Response('Terjadi kesalahan pada server proxy.', { status: 500 });
  }
}
