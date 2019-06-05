import React, { PureComponent } from 'react'
import { Link } from 'react-router-dom'
import { WiredIconButton } from 'wired-elements'
import Home from './home';

console.info(Link.toString())

export default class Menu extends PureComponent {

  changeRoute = () => {
    console.info(window.history)
    // 浏览器地址变化，但页面视图不会变化
    window.history.replaceState({page: 'home'},  'home', '/home')
  }
  render() {
    const menuStyle = {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
    return <div style={menuStyle}>
      <wired-icon-button class="blue" onClick={this.changeRoute}>home</wired-icon-button>
      <Link to='/home'>Home</Link>
    </div>
  }
}
