/*
* @Author: kyriejoshua
* @Date:   2019-06-10 20:17:54
* @Last Modified by:   kyriejoshua
* @Last Modified time: 2019-06-11 20:05:50
*/
import React, { PureComponent } from 'react'
import { Link } from 'react-router-dom'

import IMG_URLS from './urls'
import Home from './../home'

export default class Card extends PureComponent {

  render() {
    const { title = 'Sports', start, id } = this.props
    const RandomIndex = parseInt(Math.random() * 1000 % IMG_URLS.length)
    console.info(RandomIndex)

    return <div className="card-container">
      <div className="base-card">
        <div className="card-header">
          {/*<img src={IMG_URLS[id]} className="card-header-img" />*/}
          <img src={IMG_URLS[RandomIndex]} className="card-header-img" />
        </div>
        <div className="card-section">
          <div className="card-section-title">
            {title}
          </div>
          <div className="card-section-desc">
            时间: {start}
          </div>
          <div className="card-section-link">
            <Link to='/home'>Home</Link>
          </div>
        </div>
      </div>
    </div>
  }
}
