import React, { Component } from 'react';
import { Card, Tag, Rate, Spin, Alert } from 'antd';
import { format } from 'date-fns';
import PropTypes from 'prop-types';

import { GenresConsumer } from '../GenresContext/GenresContext';
import MoviesApi from '../../service/Movies';

import 'antd/dist/reset.css';
import './MovieCard.scss';

export default class MovieCard extends Component {
  static defaultProps = {
    title: 'TITLE',
    logo: '',
    overview: '',
    voteAverage: 0,
    date: '',
    genre: [],
    starsRate: 0,
  };
  static propTypes = {
    searchQuery: PropTypes.string,
    title: PropTypes.string,
    logo: PropTypes.string,
    overview: PropTypes.string,
    voteAverage: PropTypes.number,
    date: PropTypes.string,
    genre: PropTypes.array,
    starsRate: PropTypes.number,
  };

  api = new MoviesApi('809a67e0d0a61d8139c5fb080216f70d');
  state = {
    img: null,
    stars: 0,
    error: false,
  };

  setRate = async (value) => {
    const { id, getRateFilms, rateLoad } = this.props;
    this.setState({ stars: value });
    rateLoad();
    await this.api.postMoviesRate(value, id);
    setTimeout(async () => {
      try {
        await getRateFilms();
      } catch (err) {
        this.setState({ error: true });
      }
    }, 1000);
  };

  render() {
    const { title, logo, overview, voteAverage, date, genre, starsRate } = this.props;
    const { stars, img, error } = this.state;
    let color;
    if (voteAverage > 7) {
      color = '#66E900';
    } else if (voteAverage >= 5) {
      color = '#E9D100';
    } else if (voteAverage >= 3) {
      color = '#E97E00';
    } else {
      color = '#66E900';
    }
    if (!this.state.img) {
      let image = new Image();
      image.src = logo;
      image.onload = () => {
        this.setState({ img: true });
      };
    }
    const imageLoader = img ? <img src={logo} /> : <Spin className="spin" size="large" />;
    return (
      <GenresConsumer>
        {(genres) => {
          return (
            <>
              {!error ? (
                <Card className="card">
                  <div className="card__image">{imageLoader}</div>
                  <div className="card__all">
                    <div className="card__info">
                      <div className="header">
                        <div className="header__title">
                          <h5>{title}</h5>
                        </div>
                        <div className="header__rate" style={{ border: `2px solid ${color}` }}>
                          <span>{voteAverage.toFixed(1)}</span>
                        </div>
                      </div>
                      <p>{date ? format(new Date(date), 'MMMM d, yyyy') : 'none'}</p>
                      <div className="header__tags">
                        {genre.map((el) => {
                          const textGenre = genres.find((gen) => {
                            if (gen.id === el) return gen.name;
                          });
                          return <Tag key={el}>{textGenre.name}</Tag>;
                        })}
                      </div>
                    </div>
                    <p className="card__text">{overview}</p>
                    <Rate count={10} value={starsRate || stars} allowHalf={true} onChange={this.setRate} />
                  </div>
                </Card>
              ) : (
                <Alert type="error" message="Connection refused" showIcon="true" />
              )}
            </>
          );
        }}
      </GenresConsumer>
    );
  }
}
