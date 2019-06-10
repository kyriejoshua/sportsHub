/*
* @Author: kyriejoshua
* @Date:   2019-06-05 17:23:00
* @Last Modified by:   kyriejoshua
* @Last Modified time: 2019-06-05 17:54:37
*/
import React, { PureComponent } from 'react'
import { Link } from 'react-router-dom'
import { WiredIconButton } from 'wired-elements'
import { Menu } from "baseui/menu"
import Home from './home';
// import Stat from './stat';

import './index.css'

export default class Main extends PureComponent {

  changeRoute = () => {
    // 浏览器地址变化，但页面视图不会变化
    window.history.replaceState({page: 'home'},  'home', '/home')
  }
  render() {
    return <div className="container">
      <div className="menu">
        <div className="menu-item">
          <wired-icon-button class="blue" onClick={this.changeRoute}>home</wired-icon-button>
          <Link to='/home'>Home</Link>
        </div>
        {/*<div className="menu-item">
          <Link to='/stat'>Stat</Link>
        </div>*/}
      </div>
    </div>
  }
}
