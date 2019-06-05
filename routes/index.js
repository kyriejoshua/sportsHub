import React from 'react'
import { Router, Route } from 'react-router'
import { WiredCard } from 'wired-elements'
import Home from '@/home'
import Menu from '@/menu'

const prefix = process.env.prefix
// TODO prefix 前缀用法需要特殊处理
const AppRouter = ({ history }) => (
  <Router history={history}>
    <div id="content">
      <Route exact path='/' render={() => (<wired-card>Index</wired-card>)} />
      <Route path='/home' component={Home} />
      <Route path='/menu' component={Menu} />
      {/* <Route path={`${prefix}/home`} component={Home} /> */}
    </div>
  </Router>
)

export default AppRouter
