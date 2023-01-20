import React, { Component } from 'react';
import { Input } from 'antd';
import './Search.scss';
import PropTypes from 'prop-types';

export default class Search extends Component {
  static defaultProps = {
    search: () => {},
  };
  static propTypes = {
    search: PropTypes.func,
  };

  state = {
    inputValue: '',
  };

  // changeInput = (event) => {
  //   this.setState({ inputValue: event.target.value });
  //   this.props.changeStateValue(event.target.value);
  //   this.props.searchDeb(event);
  // };
  render() {
    const { search } = this.props;
    return (
      <div className="search">
        <Input className="search__input" onChange={search} placeholder="Введите название фильма" autoFocus required />
      </div>
    );
  }
}
