'use client'
import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Pagination from '@/app/components/Pagination';
import { useRouter } from 'next/navigation';
import debounce from 'lodash.debounce';

const KomikList = () => {
  const [komikList, setKomikList] = useState([]);
  const [pagination, setPagination] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const router = useRouter();

  const fetchKomik = useCallback(async (page) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/komik/doujindesu?page=${page}`);
      const data = await response.json();
      setKomikList(data.komikList || []);
      setPagination(data.pagination || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSearchResults = useCallback(async (query) => {
    if (query) {
      try {
        const response = await fetch(`/api/komik/doujindesu/search/${query}/1`);
        const data = await response.json();
        setSearchResults(data.comics || []);
      } catch (error) {
        setError(error.message);
      }
    } else {
      setSearchResults([]);
    }
  }, []);

  const debouncedFetchSearchResults = useMemo(() => debounce(fetchSearchResults, 500), [fetchSearchResults]);

  useEffect(() => {
    fetchKomik(currentPage);
  }, [currentPage]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const handleSearchSubmit = (event) => {
    if (event.key === 'Enter') {
      window.location.href = `/search/${searchQuery}`;
    }
  };

  const handleKomikClick = async (komikLink) => {
    setIsLoading(true);
    setError(null);
    try {
      await router.push(`/komik/doujindesu/${komikLink.replace(/https:\/\/[^]+\/komik\/([^]+)\//, '$1')}/chapters`);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const SkeletonLoader = () => (
    <div className="bg-gray-700 p-4 rounded-lg flex flex-col items-center justify-center">
      <div className="w-full aspect-[3/4] bg-gray-600 rounded-lg mb-3 animate-pulse"></div>
      <div className="w-full h-6 bg-gray-600 rounded mb-2 animate-pulse"></div>
      <div className="w-3/4 h-6 bg-gray-600 rounded animate-pulse"></div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-800 text-white p-5">
      {/* Search Bar */}
      <div className="w-full max-w-lg mb-5">
        <input
          type="text"
          placeholder="Cari Komik"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            debouncedFetchSearchResults(e.target.value);
          }}
          onKeyPress={handleSearchSubmit}
          className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none placeholder-gray-400"
        />
        {searchQuery && (
          <div className="absolute z-50 max-h-52 overflow-y-auto bg-gray-700 w-full mt-2 p-3 rounded-lg shadow-lg">
            <ul className="space-y-2">
              {searchResults
                .slice(0, 5)
                .map((komik) => (
                  <li
                    key={komik.link}
                    onClick={() => handleKomikClick(komik.link)}
                    className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-600"
                  >
                    <Image
                      src={komik.image}
                      alt={komik.title}
                      width={48}
                      height={48}
                      className="rounded-lg"
                    />
                    <span className="text-sm">{komik.title}</span>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>

      {/* Komik Grid */}
      <div className="grid grid-cols-4 lg:grid-cols-5 gap-1 w-full mt-5">
        {isLoading
          ? Array.from({ length: 12 }).map((_, index) => (
              <SkeletonLoader key={index} />
            ))
          : error
          ? <div className="text-red-500">{error}</div>
          : komikList.map((komik) => (
              <div
                key={komik.judul}
                className="bg-gray-700 p-2 rounded-lg flex flex-col items-center justify-center"
                onClick={() => handleKomikClick(komik.link)}
              >
                <Image
                  src={komik.thumbnail}
                  alt={komik.judul}
                  width={200}
                  height={250}
                  loading="lazy"
                  className="w-full aspect-[3/4] bg-gray-600 rounded-lg mb-3"
                />
                <h3 className="text-sm font-semibold text-center line-clamp-2">
                  {komik.judul}
                </h3>
              </div>
            ))}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        pagination={pagination}
        setCurrentPage={setCurrentPage}
        disabled={isLoading}
      />
    </div>
  );
};

export default KomikList;