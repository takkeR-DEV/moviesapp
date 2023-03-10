import React, { Component } from 'react';
import { debounce } from 'lodash';
import { Spin, Alert, Pagination } from 'antd';
import PropTypes from 'prop-types';

import MovieCard from '../MovieCard/MovieCard';
import MoviesApi from '../../service/Movies';

import './MovieList.scss';
export default class MovieList extends Component {
  static defaultProps = {
    searchQuery: '',
    active: 'search',
  };
  static propTypes = {
    searchQuery: PropTypes.string,
    active: PropTypes.string,
  };
  api = new MoviesApi('809a67e0d0a61d8139c5fb080216f70d');

  state = {
    moviesData: [],
    moviesRateData: [],
    query: '',
    page: 1,
    loading: false,
    error: false,
    result: false,
    update: true,
    pageRateAll: 1,
    pageRate: 1,
    rateLoad: false,
  };

  searchdeb = debounce(
    (e) => {
      this.onChangeInputSearchMovies(e);
    },
    1000,
    {
      maxWait: Infinity,
    }
  );

  onError = () => {
    this.setState({
      moviesRateData: [],
      error: true,
      loading: false,
    });
  };

  onChangeInputSearchMovies = (searchQuery) => {
    const { page } = this.state;
    if (!searchQuery) {
      this.setState({
        moviesData: [],
        query: '',
        page: 1,
      });
    }
    if (searchQuery) {
      this.setState(
        {
          page: 1,
          error: false,
          loading: true,
          result: false,
          query: searchQuery,
          moviesData: [],
        },
        () => {
          this.api
            .getSearchMovies(searchQuery, page)
            .then((el) => {
              this.setState(() => {
                const newData = [...el.results];
                let res = null;
                res = newData.length === 0 ? true : false;
                return {
                  moviesData: newData,
                  pageNumber: el.total_pages,
                  loading: false,
                  result: res,
                };
              });
            })
            .catch(this.onError);
        }
      );
    }
  };
  componentDidMount() {
    this.api
      .getRatedMovies()
      .then((data) => {
        this.setState(() => {
          return { moviesRateData: data.results, pageRateAll: data.total_pages, pageRate: data.page };
        });
      })
      .catch(this.onError);
  }

  componentDidUpdate(prevProps, prevState) {
    const { searchQuery } = this.props;
    const { query, pageRate } = this.state;
    if (searchQuery != query) {
      this.searchdeb(searchQuery);
    }
    const { moviesRateData } = this.state;
    if (moviesRateData !== undefined && prevState.moviesRateData !== undefined) {
      if (moviesRateData.length !== prevState.moviesRateData.length) {
        this.setState({ rateLoad: true });
        this.api
          .getRatedMovies(pageRate)
          .then((data) => {
            this.setState(() => {
              return { moviesRateData: data.results, rateLoad: false };
            });
          })
          .catch(this.onError);
      }
    }
  }
  getRateFilms = (page = 1) => {
    this.api
      .getRatedMovies(page)
      .then((data) => {
        this.setState(() => {
          return { moviesRateData: data.results, pageRateAll: data.total_pages, pageRate: data.page };
        });
      })
      .catch(this.onError);
  };

  reteLoad = () => {
    this.setState({ rateLoad: true });
  };
  //??????????????????

  changePaginationSearch = (page) => {
    this.setState(
      {
        page: page,
        moviesData: [],
      },
      () => {
        if (page) {
          this.setState(
            {
              loading: true,
              error: false,
              result: false,
            },
            () => {
              this.api
                .getSearchMovies(this.state.query, this.state.page)
                .then((el) => {
                  this.setState(() => {
                    const newData = [...el.results];
                    let res = null;
                    res = newData.length === 0 ? true : false;
                    return {
                      moviesData: newData,
                      pageNumber: el.total_pages,
                      loading: false,
                      result: res,
                    };
                  });
                })
                .catch(this.onError);
            }
          );
        }
      }
    );
  };

  onChangePagination = (page) => {
    const { active } = this.props;
    if (active === 'search') this.changePaginationSearch(page);
    if (active === 'rated') {
      this.getRateFilms(page);
    }
  };

  render() {
    const { active } = this.props;
    const { moviesData, moviesRateData, loading, error, rateLoad, result, page, pageNumber, pageRate, pageRateAll } =
      this.state;
    let dataFilms = active === 'search' ? moviesData : moviesRateData;
    let load = loading ? <Spin className="movielist__spin" size="large" /> : null;
    let loadRate = rateLoad ? <Spin className="movielist__spin" size="large" /> : null;
    let pagination;

    if (!!moviesData.length && !loading && !error) {
      if (active === 'search') {
        pagination = (
          <Pagination
            className="pagination"
            current={page}
            total={pageNumber}
            defaultPageSize={1}
            showSizeChanger={false}
            onChange={this.onChangePagination}
          />
        );
      } else if (!!moviesRateData.length && active === 'rated') {
        pagination = (
          <Pagination
            className="pagination"
            current={pageRate}
            total={pageRateAll}
            defaultPageSize={1}
            showSizeChanger={false}
            onChange={this.onChangePagination}
          />
        );
      }
    }
    let resultMessage = result ? (
      <Alert
        type="error"
        message="The movies was not found for this request"
        showIcon="true"
        className="movielist__error"
      />
    ) : null;
    return (
      <div>
        <div className="movielist">
          {resultMessage}
          {load}
          {active === 'rated' ? loadRate : null}
          {!error ? (
            dataFilms.map((data) => {
              let newRate;
              if (!data.rating) {
                const test = moviesRateData.find((el) => el.id === data.id);
                test ? (newRate = test.rating) : null;
              }
              return (
                <MovieCard
                  key={data.id}
                  id={data.id}
                  loading={loading}
                  title={data.original_title}
                  logo={data.poster_path}
                  overview={data.overview}
                  voteAverage={data.vote_average}
                  date={data.release_date}
                  genre={data.genre_ids}
                  starsRate={data.rating || newRate}
                  getRateFilms={this.getRateFilms}
                  rateLoad={this.reteLoad}
                />
              );
            })
          ) : (
            <Alert type="error" message="Connection refused" showIcon="true" className="movielist__error" />
          )}
        </div>
        <div className="pagination">{pagination}</div>
      </div>
    );
  }
}
