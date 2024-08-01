import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './Pokedex.css';

const BATCH_SIZE = 100;
const RETRY_LIMIT = 1;

function Pokedex() {
  const [pokemonData, setPokemonData] = useState([]);
  const [filteredPokemonData, setFilteredPokemonData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [popUpName, setPopUpName] = useState('');
  const [popUpImage, setPopUpImage] = useState('');
  const [popUpAbilities, setPopUpAbilities] = useState([]);
  const [popUpTypes, setPopUpTypes] = useState([]);
  const [popUpCry, setPopUpCry] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const pokemonContainerRef = useRef(null);
  const popUpRef = useRef(null); // Create a ref for the pop-up

  const fetchPokemonDetails = async (url, retries = RETRY_LIMIT) => {
    try {
      const result = await axios.get(url);
      return {
        name: result.data.name,
        image: result.data.sprites.other['official-artwork']?.front_default || result.data.sprites.front_default,
        gif: result.data.sprites.other.showdown.front_default || result.data.sprites.front_default,
        abilities: result.data.abilities.map(ability => ability.ability.name),
        types: result.data.types.map(type => type.type.name),
        cry: result.data.cries.latest
      };
    } catch (error) {
      if (retries > 0) {
        return fetchPokemonDetails(url, retries - 1);
      } else {
        return null;
      }
    }
  };

  const fetchBatchOfPokemons = async (pokemonList) => {
    const pokemonDetailsPromises = pokemonList.map(pokemon => fetchPokemonDetails(pokemon.url));
    return await Promise.all(pokemonDetailsPromises);
  };

  useEffect(() => {
    const fetchAllPokemonData = async () => {
      try {
        const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=3000');
        const pokemonList = response.data.results;

        const batchedPokemonData = [];
        for (let i = 0; i < pokemonList.length; i += BATCH_SIZE) {
          const batch = pokemonList.slice(i, i + BATCH_SIZE);
          const batchData = await fetchBatchOfPokemons(batch);
          batchedPokemonData.push(...batchData.filter(pokemon => pokemon && pokemon.image));
        }

        setPokemonData(batchedPokemonData);
        setFilteredPokemonData(batchedPokemonData);
      } catch {
        setError('An error occurred while fetching Pokémon data.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllPokemonData();
  }, []);

  useEffect(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    const filteredData = pokemonData.filter(pokemon =>
      pokemon.name.toLowerCase().includes(lowercasedSearchTerm)
    );
    const sortedData = filteredData.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });
    setFilteredPokemonData(sortedData);
  }, [searchTerm, pokemonData, sortOrder]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popUpRef.current && !popUpRef.current.contains(event.target)) {
        handleClosePopUp();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setSearchTerm(inputValue);
      if (pokemonContainerRef.current) {
        pokemonContainerRef.current.scrollTop = 0;
      }
    }
  };

  const handleBtnClick = () => {
    setSearchTerm(inputValue);
    if (pokemonContainerRef.current) {
      pokemonContainerRef.current.scrollTop = 0;
    }
  };

  const handlePokecard = (name, image, abilities, types, cry) => {
    setPopUpName(name);
    setPopUpImage(image);
    setPopUpAbilities(abilities);
    setPopUpTypes(types);
    setPopUpCry(cry);
    let card = document.getElementById('pokecard');
    card.style.opacity = '100%';
    card.style.zIndex = 0;
  };

  const handleClosePopUp = () => {
    let card = document.getElementById('pokecard');
    card.style.opacity = '0%';
    card.style.zIndex = -1;
  };

  const toggleSortOrder = () => {
    setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="main-container">

      <div>
        <h1 className='title'>Poké</h1><h1 className='title-yellow'>Dex</h1>
      </div>

      <div className='search-container'>
        <input
          type='text'
          placeholder='Search Pokémon'
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className='search-bar'
        />
        <button className='search-btn' onClick={handleBtnClick}>Search</button>
      </div>

      <div className='sort-container'>
        <button className='sort-btn' onClick={toggleSortOrder}>
          Sort by Name ({sortOrder === 'asc' ? 'Ascending' : 'Descending'})
        </button>
      </div>

      <div className='pokemon-container' ref={pokemonContainerRef}>
        {loading && <p>Loading...</p>}
        {error && <p>Error: {error}</p>}
        {filteredPokemonData.map(({ name, image, abilities, types, gif, cry }) => (
          <div
            onClick={() => handlePokecard(name, image, abilities, types, cry)}
            className='pokemon'
            key={name}
          >
            <p>{name}</p>
            <img className='pokemon-image' src={gif} alt={name} />
            <div></div>
          </div>
        ))}
      </div>

      <div id='pokecard' className='pokecard' ref={popUpRef}>
        <div className='pokecard-content'>
          <h1 className='pop-up-name'>{popUpName}</h1>
          <img className='pop-up-img' src={popUpImage} alt={popUpName} />
          <div className='pop-up-abilities'>
            {popUpAbilities.map((ability, index) => (
              <h1 className='ability' key={index}>{ability}</h1>
            ))}
          </div>

          <div className='pop-up-types'>
            {popUpTypes.map((type, index) => (
              <h1 className='type' key={index}>{type}</h1>
            ))}
          </div>

          {popUpCry && (
            <div>
              <audio id='pokemon-cry' src={popUpCry} />
              <button className='play-cry-btn' onClick={() => document.getElementById('pokemon-cry').play()}>
                Hear Pokémon Cry
              </button>
            </div>
          )}
        </div>
        <button className='close-btn' onClick={handleClosePopUp}>Close</button>
      </div>

    </div>
  );
}

export default Pokedex;
