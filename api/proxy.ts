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

  // Header penyamaran yang paling penting
  const requestHeaders = new Headers();
  requestHeaders.set('Referer', 'https://komikcast.li/');
  requestHeaders.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36');

  try {
    // 2. Coba ambil gambar dari URL asli
    const imageResponse = await fetch(imageUrl, {
      headers: requestHeaders,
    });

    // 3. JIKA GAGAL, JALANKAN MODE DETEKTIF
    if (!imageResponse.ok) {
      // Ambil semua header dari respons error untuk dianalisa
      const errorHeaders = Object.fromEntries(imageResponse.headers.entries());
      
      // Buat laporan dalam format JSON
      const errorReport = {
        pesan: `Gagal mengambil gambar. Sumber merespons dengan status: ${imageResponse.status}`,
        url_sumber: imageUrl,
        laporan_dari_sumber: errorHeaders, // Ini bagian terpenting!
      };
      
      // Tampilkan laporan ini di browser
      return new Response(JSON.stringify(errorReport, null, 2), {
        status: imageResponse.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 4. JIKA BERHASIL, kirim gambar seperti biasa
    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', imageResponse.headers.get('Content-Type') || 'image/jpeg');
    responseHeaders.set('Cache-Control', 'public, max-age=604800, immutable');

    return new Response(imageResponse.body, {
      headers: responseHeaders,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ message: 'Terjadi kesalahan pada server proxy.', error: errorMessage }), { status: 500 });
  }
}
