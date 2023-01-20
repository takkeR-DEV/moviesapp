import React, { Component } from 'react';
import { Alert } from 'antd';

import Header from '../Header/Header';
import Search from '../Search/Search';
import MovieList from '../MovieList/MovieList';
import MoviesApi from '../../service/Movies';
import { GenresProvider } from '../GenresContext/GenresContext';

import './App.scss';

export default class App extends Component {
  api = new MoviesApi('809a67e0d0a61d8139c5fb080216f70d');

  state = {
    active: 'search',
    searchQuery: '',
    genres: [],
    error: false,
  };

  async componentDidMount() {
    try {
      await this.api.getSession();
      const data = await this.api.getGenres();
      this.setState({ genres: data.genres });
    } catch (error) {
      this.setState({ error: true });
    }
  }
  async componentDidUpdate() {}

  componentDidCatch() {
    this.setState({ error: true });
  }

  setActive = (e) => {
    this.setState(() => {
      return { active: e };
    });
  };

  search = (e) => {
    this.setState({ searchQuery: e.target.value });
  };

  render() {
    const { active, searchQuery, genres, error } = this.state;

    return (
      <main className="wrapper">
        {!error ? (
          <GenresProvider value={genres}>
            <Header setActive={this.setActive} active={active} />
            {active === 'search' ? <Search search={this.search} /> : null}
            <MovieList searchQuery={searchQuery} active={active} />
          </GenresProvider>
        ) : (
          <Alert type="error" message="Connection refused,please use VPN" showIcon="true" className="errorvpn" />
        )}
      </main>
    );
  }
}
