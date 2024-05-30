const guessInput = document.getElementById('guess-input');
const guessButton = document.getElementById('guess-button');
const guessesLeft = document.getElementById('guesses-left');
const cluesContainer = document.getElementById('clues-container');
const previousGuessesContainer = document.getElementById('previous-guesses-container');
const previousGuessesList = document.getElementById('previous-guesses-list');

let previousGuesses = [];

let movieData = {};

let guessesRemaining = 5;

// Fetch movie data from OMDB

guessButton.addEventListener('click', guessMovie);

const fetchGuessData = async (guess) => {

    const formattedGuess = guess.replace(/\s+/g, "+");
    console.log(formattedGuess); 
  
   const url= "https://www.omdbapi.com/?apikey=100b061f&t=" + formattedGuess;
    console.log("url: " + url);
    // const url = "https://jsonplaceholder.typicode.com/todos/1"
    let data;
    try {
    const response = await fetch(url);
    data = await response.json();
      console.log("data", data)
    return data;
        
  } catch (error) {
    console.error(error);
    return("")
  }
}

async function guessMovie() {
    // don't allow guesses if game over
    if(guessesRemaining === 0){
        alert("You have run out of guesses. Game over!")
        // Clear the guess input field
        guessInput.value = '';
        return;
    }
    
    //get daily movie data
    try {
        const response = await fetch("./dailyMovieData.json");
        movieData = await response.json();
          console.log("movieData", movieData)
      } catch (error) {
        console.error(error);
      }

    const guess = guessInput.value.trim();
    if (guess === '') {
        alert('Please enter a movie title');
        return;
    }

    const guessData = await fetchGuessData(guess);

    //use for testing
    //const guessData = {"Title":"The Irishman","Year":"2019","Rated":"R","Released":"27 Nov 2019","Runtime":"209 min","Genre":"Biography, Crime, Drama","Director":"Martin Scorsese","Writer":"Steven Zaillian, Charles Brandt","Actors":"Robert De Niro, Al Pacino, Joe Pesci","Plot":"An illustration of Frank Sheeran's life, from W.W.II veteran to hit-man for the Bufalino crime family and his alleged assassination of his close friend Jimmy Hoffa.","Language":"English, Italian, Latin, Spanish, German","Country":"United States","Awards":"Nominated for 10 Oscars. 73 wins & 357 nominations total","Poster":"https://m.media-amazon.com/images/M/MV5BMGUyM2ZiZmUtMWY0OC00NTQ4LThkOGUtNjY2NjkzMDJiMWMwXkEyXkFqcGdeQXVyMzY0MTE3NzU@._V1_SX300.jpg","Ratings":[{"Source":"Internet Movie Database","Value":"7.8/10"},{"Source":"Rotten Tomatoes","Value":"95%"},{"Source":"Metacritic","Value":"94/100"}],"Metascore":"94","imdbRating":"7.8","imdbVotes":"430,826","imdbID":"tt1302006","Type":"movie","DVD":"27 Nov 2019","BoxOffice":"N/A","Production":"N/A","Website":"N/A","Response":"True"}
    
    console.log("this guessData", guessData)
    
    const correct = checkGuess(guessData);
    displayClues()
    if (correct) {
        alert('Congratulations! You guessed the movie correctly!');
    } else {
        guessesRemaining--;
        guessesLeft.textContent = `You have ${guessesRemaining} guesses left`;

        displayPreviousGuesses();
        //displayPreviousGuess(guess);
        if (guessesRemaining === 0) {
            alert('Game over! You ran out of guesses.');
        }
    }

    // Clear the guess input field
    guessInput.value = '';
}

function displayPreviousGuesses() {
    const previousGuessesList = document.getElementById('previous-guesses-list');
    previousGuessesList.innerHTML = '';
    previousGuesses.forEach((guess, index) => {
        const guessElement = document.createElement('li');
        let cluesHTML = '';
        guess.clues.forEach((clue, index) => {
            const label = ['Genre', 'Year', 'IMDB Rating', 'Runtime'][index];
            const value = [guess.genreValue, guess.yearValue, guess.imdbValue, guess.runtimeValue][index];
            let clueHTML = '';
            if (clue.includes('Correct')) {
                clueHTML = `<b><span style="color: green">${clue}</span></b>`;
            } else {
                clueHTML = `<b><span style="color: red">${clue}</span></b>`;
            }
            cluesHTML += `<div>${label}: ${value} ${clueHTML}</div>`;
        });
        guessElement.innerHTML = `Guess ${index + 1}: ${guess.guess} <ul>${cluesHTML}</ul>`;
        previousGuessesList.appendChild(guessElement);
    });
}

function checkGuess(guess) {
    // Compare guess with movie title
    if (guess.Title.toLowerCase() === movieData.Title.toLowerCase()) {
        return true;
    }
    // Check clues and display feedback
    const genreClue = document.getElementById('genre-clue');
    const yearClue = document.getElementById('year-clue');
    const imdbClue = document.getElementById('imdb-clue');
    const runtimeClue = document.getElementById('runtime-clue');

    // IMDB Rating
    const imdbGuess = parseFloat(guess.imdbRating);
    const imdbMovie = parseFloat(movieData.imdbRating);
    const imdbCorrect = imdbGuess === imdbMovie ? 'Correct' : `Incorrect (${imdbGuess < imdbMovie ? 'Higher' : 'Lower'})`;

    // Genre
    console.log(guess)
    const guessGenres = guess.Genre.split(', ');
    const movieGenres = movieData.Genre.split(', ');
    let matchingGenres = guessGenres.filter(g => movieGenres.includes(g));
    const genreCorrect = matchingGenres.length > 0 ? `Correct (${matchingGenres.join(', ')})` : 'Incorrect';

    // Year
    const yearGuess = parseInt(guess.Year);
    const yearMovie = parseInt(movieData.Year);
    const yearCorrect = yearGuess === yearMovie ? 'Correct' : `Incorrect (${yearGuess < yearMovie ? 'Higher' : 'Lower'})`;

    // Runtime
    const runtimeGuess = parseInt(guess.Runtime.split(' ')[0]);
    console.log(runtimeGuess)
    const runtimeMovie = parseInt(movieData.Runtime.split(' ')[0]);
    const runtimeCorrect = runtimeGuess === runtimeMovie ? 'Correct' : `Incorrect (${runtimeGuess < runtimeMovie ? 'Higher' : 'Lower'})`;

    genreClue.textContent = `Genre: ${genreCorrect}`;
    yearClue.textContent = `Year: ${yearCorrect}`;
    imdbClue.textContent = `IMDB Rating: ${imdbCorrect}`;
    runtimeClue.textContent = `Runtime: ${runtimeCorrect}`;

    const clues = [genreCorrect, yearCorrect, imdbCorrect, runtimeCorrect];
    const guessObject = {
        guess: guess.Title,
        Genre: guess.Genre,
        Year: guess.Year,
        imdbRating: guess.imdbRating,
        Runtime: guess.Runtime,
        clues: clues,
        genreValue: guess.Genre,
        matchingGenres: matchingGenres.join(', '),
        yearValue: guess.Year,
        imdbValue: guess.imdbRating,
        runtimeValue: guess.Runtime
    };
    previousGuesses.push(guessObject);
    return false;
}

function displayClues() {
    const genreClue = document.getElementById('genre-clue');
    const yearClue = document.getElementById('year-clue');
    const imdbClue = document.getElementById('imdb-clue');
    const runtimeClue = document.getElementById('runtime-clue');
    const titleClue = document.getElementById('title-clue');
    const lastGuess = previousGuesses[previousGuesses.length - 1];
    if (lastGuess) {
        genreClue.innerHTML = `Genre: ${lastGuess.genreValue || ''} ${getStyledClue(lastGuess.clues[0])}`;
        yearClue.innerHTML = `Year: ${lastGuess.yearValue || ''} ${getStyledClue(lastGuess.clues[1])}`;
        imdbClue.innerHTML = `IMDB Rating: ${lastGuess.imdbValue || ''} ${getStyledClue(lastGuess.clues[2])}`;
        runtimeClue.innerHTML = `Runtime: ${lastGuess.runtimeValue || ''} ${getStyledClue(lastGuess.clues[3])}`;
    } else {
        genreClue.textContent = `Genre:`;
        yearClue.textContent = `Year:`;
        imdbClue.textContent = `IMDB Rating:`;
        runtimeClue.textContent = `Runtime:`;
    }
    // show last letter of movie title if 2 guesses left
    if (guessesRemaining === 3) {
        const lastLetter = movieData.Title.slice(-1);
        titleClue.textContent += ` Movie Last letter: ${lastLetter}`;
    }
    // show first and last letter of movie title if 1 guess left
    if (guessesRemaining === 2) {
        const firstLetter = movieData.Title[0];
        const lastLetter = movieData.Title.slice(-1);
        titleClue.textContent = ` Title First letter: ${firstLetter}, `;
        titleClue.textContent += ` Title Last letter: ${lastLetter}`;
    }
}

function getStyledClue(clue) {
    let clueHTML = '';
    if (clue.includes('Correct')) {
        clueHTML = `<b><span style="color: green">${clue}</span></b>`;
    } else {
        clueHTML = `<b><span style="color: red">${clue}</span></b>`;
    }
    return clueHTML;
}