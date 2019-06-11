/*
* @Author: kyriejoshua
* @Date:   2019-06-10 20:17:54
* @Last Modified by:   kyriejoshua
* @Last Modified time: 2019-06-11 20:10:01
*/
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { WiredIconButton } from 'wired-elements'
import Card from "./base-card"
import Home from './../home'
import data from './../home/data'

import './index.css'

export default class CardList extends Component {

  render() {
    const listData = Object.keys(data).reverse()

    return (<div className="cardlist-container">
      <div className="cardlists">
        {listData.map((key) => {
          return (<div className="cardlist" key={key}>
            <div className="cardlist-title"><h1>{key}</h1></div>
            <div className="cardlist-content">
              {data[key].map((card) => {
                return <Card {...card} key={card.id} />
              })}
            </div>
          </div>)
        })}
      </div>
    </div>)
  }
}
