export default class Movies {
  _apiBase = 'https://api.themoviedb.org/3';
  _apiImage = 'https://image.tmdb.org/t/p/w500';
  _noImage = 'https://critics.io/img/movies/poster-placeholder.png';

  constructor(key) {
    this.apiKey = key;
    this.genres = null;
    this.sessionId = '';
  }
  async #getResource(request) {
    return new Promise((resolve, reject) => {
      fetch(`${this._apiBase}${request.url}?api_key=${this.apiKey}${request.query}${request.page}`)
        .then((result) => {
          if (!result.ok) {
            throw new Error(`${result.status}`);
          }
          result.json().then((json) => {
            const data = this.#changeImageLinkInObject(json);
            resolve(data);
          });
        })
        .catch((err) => reject(err));
    });
  }

  #changeImageLinkInObject(result) {
    const newDataJson = JSON.stringify(result);
    const newData = JSON.parse(newDataJson);
    if (!Object.prototype.hasOwnProperty.call(newData, 'results')) {
      return { ...newData, poster_path: this.getImage(newData.poster_path) };
    }
    const changeData = newData.results.map((data) => {
      data.poster_path = this.getImage(data.poster_path);
      return data;
    });
    return { ...result, results: changeData };
  }

  getMovie(id) {
    const request = {
      url: `/movie/${id}`,
      query: '',
      page: '',
    };
    return this.#getResource(request);
  }

  getSearchMovies(query, page = 1) {
    const request = {
      url: '/search/movie/',
      query: `&query=${query}`,
      page: `&page=${page}`,
    };
    return this.#getResource(request);
  }
  async getGenres() {
    return new Promise((resolve, reject) => {
      const request = {
        url: '/genre/movie/list',
        query: '',
        page: '',
      };
      if (!this.genres)
        this.#getResource(request)
          .then((genres) => {
            this.genres = genres;
            resolve(genres);
          })
          .catch((err) => reject(err));
      else {
        resolve(this.genres);
      }
    });
  }
  getImage = (path) => (!path ? `${this._noImage}` : `${this._apiImage}${path}`);
  // Работа с БД
  async getResource(path) {
    const data = await fetch(`${this._apiBase}${path}?api_key=${this.apiKey}`);
    return data.json();
  }

  async postResourceRate(path, vote) {
    try {
      const data = await fetch(`${this._apiBase}${path}?api_key=${this.apiKey}&guest_session_id=${this.sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify({
          value: vote,
        }),
      });
      if (data.status === 401) {
        localStorage.removeItem('guest_session_id');
        await this.getSession();
      }
      if (!data.ok) {
        throw new Error(`${data.status}`);
      }
      return data.json();
    } catch (error) {
      return error;
    }
  }
  async getResourceRatedMovies(path, page = 1) {
    try {
      const data = await fetch(`${this._apiBase}${path}?api_key=${this.apiKey}&page=${page}`);
      return data.json();
    } catch (error) {
      return error;
    }
  }
  async getRatedMovies(page = 1) {
    this.sessionId = localStorage.getItem('guest_session_id');
    if (!this.sessionId) await this.getSession();
    const path = `/guest_session/${this.sessionId}/rated/movies`;
    const data = await this.getResourceRatedMovies(path, page);
    const newData = await this.#changeImageLinkInObject(data);
    return newData;
  }
  postMoviesRate(vote, id) {
    try {
      this.sessionId = localStorage.getItem('guest_session_id');
      const path = `/movie/${id}/rating`;
      return this.postResourceRate(path, vote);
    } catch (error) {
      return error;
    }
  }

  async getSession() {
    const path = '/authentication/guest_session/new';
    return await this.getResource(path)
      .then((data) => {
        if (localStorage.getItem('guest_session_id')) {
          this.sessionId = localStorage.getItem('guest_session_id');
          return localStorage.getItem('guest_session_id');
        }
        this.sessionId = data.guest_session_id;
        localStorage.setItem('guest_session_id', data.guest_session_id);
      })
      .catch((error) => error);
  }
}
//   async getMoviesRatePage() {
//     try {
//       const path = `/guest_session/${this.sessionId}/rated/movies`;
//       // const data = await fetch(`${this._apiBase}${path}?api_key=${this.apiKey}&guest_session_id=${this.sessionId}`);
//       const data = await fetch(`${this._apiBase}${path}?api_key=${this.apiKey}&page=2`);
//       console.log(data.json());
//     } catch (error) {
//       return error;
//     }
//   }
// }

// const api = new Movies('809a67e0d0a61d8139c5fb080216f70d');
// const api = new Movies('809a67e0d0a61d8139c5fb080216f70d');
// const imagePath = `/cibC5b4D99Vosf41wop3jVeyL2f.jpg`;
// (async () => {
// console.log(`1 Фильмы по запросу`, await api.getSerchMovies('hh'));
// console.log(`2 Фильм по id`, await api.getMovie(2));
//   // console.log(`3 Жанры фильмов`, await api.getGenres());
//   // console.log(`4 Получение картинки`, await api.getImage(imagePath));
// })();
