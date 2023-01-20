import React, { Component } from 'react';
import { Card, Tag, Rate, Spin } from 'antd';
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
  };

  setRate = async (value) => {
    const { id, getRateFilms } = this.props;
    await this.api.postMoviesRate(value, id);
    setTimeout(async () => {
      await getRateFilms();
    }, 1000);
    this.setState({ stars: value });
  };

  render() {
    const { title, logo, overview, voteAverage, date, genre, starsRate } = this.props;
    const { stars, img } = this.state;
    let color = voteAverage > 7 ? '#66E900' : voteAverage >= 5 ? '#E9D100' : voteAverage >= 3 ? '#E97E00' : '#E90000';
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
          );
        }}
      </GenresConsumer>
    );
  }
}
