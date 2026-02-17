import React, { useEffect, useState } from 'react'
import SearchBar from './components/SearchBar';
import Spinner from './components/Spinner';
import ErrorMessage from './components/ErrorMessage';
import MovieCard from './components/MovieCard';
import MovieDetailsModal from './components/MovieDetailsModal';
import Pagination from './components/Pagination';

function App() {
  const [movies,setMovies]=useState([]); // to store list of movies
  const [favorites,setFavorites]=useState([]);//to store favrt movies
  const [initialized,setInitialized]=useState(false);
  const [searchTerm,SetSearchTerm]=useState("");
  const [page,setPage]=useState(1);//store page number
  const [totalPages,setTotalPages]=useState(0);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(null);
  const [selectedMovie,setSelectedMovie]=useState(null);
  const [view,setView]=useState("search");

  const API_KEY=import.meta.env.VITE_TMDB_API_KEY;

  useEffect(()=>{
    const storedFavorites=JSON.parse(localStorage.getItem
      ("favorites"))||[];
      // Load saved favorites from browser
      // If none exist, use empty list
      setFavorites(storedFavorites);
      setInitialized(true);
  },[]);

  useEffect(()=>{
    if (initialized){
      localStorage.setItem("favorites",JSON.stringify(favorites));
    }
  },[favorites,initialized]);



  useEffect(()=>{
    if(view==="favorites"){ //if the user view the favorite then clear the movie list
      setMovies([]);
      return;
  }
   
  const fetchMovies=async()=>{
   setLoading(true);//starts loading for telling the user
   setError(null);//removes prev eror
   try{
    let url;

  if (searchTerm) {
  url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(searchTerm)}&page=${page}`;
    }
 else {
  url = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&page=${page}`;
      }

      const res=await fetch(url);
      if(!res.ok) throw new Error("Failed to fetch movies");
      const data=await res.json();
      console.log(data);
      setMovies(data.results);
      setTotalPages(Math.min(data.total_pages || 0,500))
   }
   catch(err){
    setError("Failed to fetch movies");
   }

   finally{
    setLoading(false);
   }
  }
  fetchMovies();
  },[searchTerm,page,view]);


  const handleSearch=(term)=>{  //it lets searchbar to take data from user
    SetSearchTerm(term);//if this runs then fetchmovie will re render
    setPage(page);
  }



  const handlePageChange=(newPage)=>{
    if(newPage >= 1 && newPage <= totalPages){
      setPage(newPage);
    }
  }

  const openModal=async(movieId)=>{
    setError(null);
    try{
      const res= await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}`
      );
      if(!res.ok) throw new Error("Failed to Fetch");
      const data=await res.json();
      setSelectedMovie(data);
    }
    catch(err){
      setError("Failed to fetch movie details");
    }
  }

  const closeModal=()=>setSelectedMovie(null);

  const toggleFavorite=(movie)=>{
    const exists=favorites.some((f)=>f.id===movie.id);//it checks my fav movies if its already there

    if(exists){
      setFavorites(favorites.filter((f)=>f.id !== movie.id));//used to remove the favrt movies
    }
    else{
      const favMovie={
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        overview: movie.overview,
        vote_average: movie.vote_average
      };
      setFavorites([...favorites,favMovie]);
    }
  }

  const isFavorite=(movieId)=>favorites.some((f)=>f.id===movieId);
  //movieId just holds the movie.id which is done at the time of function calling
 //it gives true or false values

    const displayedMovies=view==="search"?movies:favorites;//if the screen is at search then show movies or else favrt movies

  return (
    <div className='container mx-auto p-4 flex flex-col
    items-center text-center'>
      <h1 className="text-4xl font-extrabold mb-6 drop-shadow-2xl text-[#007ACC] cursor-pointer hover:opacity-80 transition"
        onClick={() => {
        setView("search");
        SetSearchTerm("");
        setPage(1);
        }}>
        Movie App
        </h1>
      <div className='tabs tabs-border mb-6'>

        <a className={`tab text-lg ${view === "search" ?"tab-active":""}`}
        onClick={()=>{
          setView("search");setPage(1);
        }}>
          Search/Popular
        </a>

        <a className={`tab text-lg ${view === "favorites" ?"tab-active":""}`}
        onClick={()=>
          setView("favorites")
        }>
        Favorites ({favorites.length})
        </a>
      </div>
         
         {view==="search" && (
          <div className='w-full max-w-md mb-6'>
          <SearchBar onSearch={handleSearch}/>
         </div>)}

          {loading && <Spinner/>}
          {error && <ErrorMessage message={error}/>}
          {/* bad network wrong api error */}
          {!loading && !error && displayedMovies.length===0 && (
            <div>
              No Movies Found.{" "}
              {view === "favorites"?"Add some to your favorites!"
              :"Try a different Search"}
              </div>
          )}
          {/* this is for no movies found but the api works */}

            {!loading && !error && displayedMovies.length>0 &&(
              <div className='grid grid-cols-1 sm:grid-cols-2
              md:grid-cols-3 lg:grid-cols-4 gap-4 w-full'>
                {displayedMovies.map((movie)=>(
                  <MovieCard key={movie.id} 
                  movie={movie}
                  onToggleFavorite={toggleFavorite} 
                  isFavorite={isFavorite(movie.id)}
                  onViewDetails={openModal}/>
                ))}
              </div>
            )}
             {/* “If we are not loading, there is no error, and we have movies —
then display them in a responsive grid layout.” */}

              {view === "search" && totalPages >1 && !loading && !error &&(
                <div className='mt-6'>
                  <Pagination 
                  currentPage={page} 
                  totalPages={totalPages}
                  onPageChange={handlePageChange}/>
                </div>
              )}

            {selectedMovie &&(
              <MovieDetailsModal movie={selectedMovie}
              onClose={closeModal}
              isFavorite={isFavorite(selectedMovie.id)}
              onToggleFavorite={()=>toggleFavorite(selectedMovie)}/>
            )}
           
      </div>
  )
}

export default App