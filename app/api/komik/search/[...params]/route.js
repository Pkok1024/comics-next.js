// app/api/komik/[...params]/route.js
import { SearchComicsPage } from "@/app/function/index"; // Pastikan path ini benar

export async function GET(req, { params }) {
  const { params: queryParams } = await params; // Mengambil parameter dari query string

  // Pastikan ada dua parameter: search dan pages
  if (queryParams.length !== 2) {
    return new Response(JSON.stringify({ message: "Invalid parameters" }), {
      status: 400,
    });
  }

  const [search, pages] = queryParams; // Mendapatkan search dan pages dari params

  try {
    const chapters = await SearchComicsPage(search, pages); // Mengambil data chapters dari fungsi yang diimpor
    return new Response(JSON.stringify(chapters), { status: 200 }); // Mengirimkan response dengan data chapters
  } catch (error) {
    console.error("Error scraping komik chapters:", error);
    return new Response(
      JSON.stringify({ message: "Error retrieving chapter list" }),
      { status: 500 },
    );
  }
}