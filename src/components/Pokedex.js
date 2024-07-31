import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Pokedex.css';

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

  useEffect(() => {
    const fetchAllPokemonData = async () => {
      try {
        const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=3500');
        const pokemonList = response.data.results;

        const pokemonDetailsPromises = pokemonList.map(pokemon =>
          axios.get(pokemon.url)
        );
        const pokemonDetailsResponses = await Promise.all(pokemonDetailsPromises);

        const allPokemonData = pokemonDetailsResponses.map(({ data }) => ({
            name: data.name,
            image: data.sprites.other['official-artwork']?.front_default || data.sprites.front_default,
            abilities: data.abilities.map(ability => ability.ability.name)
          })).filter(pokemon => pokemon.image);

        setPokemonData(allPokemonData);
        setFilteredPokemonData(allPokemonData);

      } catch (err) {
        setError(err.message);
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
    setFilteredPokemonData(filteredData);
  }, [searchTerm, pokemonData]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setSearchTerm(inputValue);
    }
  };

  const handleBtnClick = () => {
      setSearchTerm(inputValue);
  };

  const handlePokecard = (name, image, abilities) => {
    setPopUpName(name);
    setPopUpImage(image);
    setPopUpAbilities(abilities);
    let card = document.getElementById('pokecard');
    card.style.opacity = '100%';
    card.style.zIndex = 0;
  };

  const handleClosePopUp = () => {
    let card = document.getElementById('pokecard');
    card.style.opacity = '0%';
    card.style.zIndex = -1;
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
        <div className='pokemon-container'>
        {loading && <p>Loading...</p>}
            {filteredPokemonData.map(({ name, image, abilities }) => (
            <div
                onClick={() => handlePokecard(name, image, abilities)}
                className='pokemon'
                key={name}
            >
                <p>{name}</p>
                <img className='pokemon-image' src={image} alt={name} />
            </div>
            ))}
        </div>
        <div id='pokecard' className='pokecard'>
            <h1 className='pop-up-name'>{popUpName}</h1>
            <img className='pop-up-img' src={popUpImage} alt={popUpName} />
            <button className='close-btn' onClick={handleClosePopUp}>Close</button>
            <div className='pop-up-abilities'>
                {popUpAbilities.map((ability, index) => (
                    <h1 className='ability' key={index}>{ability}</h1>
                ))}
            </div>
        </div>
    </div>
  );
}

export default Pokedex;
