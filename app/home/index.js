import React, { PureComponent, memo } from 'react'
import { WiredButton, WiredListbox, WiredIconButton, WiredCard } from 'wired-elements'
import BigCalendar from 'react-big-calendar'
import moment from 'moment'
import swal from 'sweetalert'
import * as util from '@/util'
import data from './data'
import * as CONSTANTS from './constants'

import '../../node_modules/react-big-calendar/lib/css/react-big-calendar.css'
import './index.css'

BigCalendar.momentLocalizer(moment)

const SWAL_PUNCH_WARNING = {
  title: CONSTANTS.PUNCH_WARNING,
  icon: 'warning',
  button: false
}

const SWAL_PUNCH_SUCCESS = {
  title: CONSTANTS.PUNCH_SUCCESS,
  icon: 'success',
  button: false
}

const SWAL_PUNCH_INFO = {
  icon: 'info',
  button: false
}

const CURRENTYEAR = new Date().getFullYear()
const LASTYEAR = CURRENTYEAR - 1
const ENTER_KEYCODE = 13

const renderRedText = (text) => <span className="info-active"> {text} </span>;

export default class Home extends PureComponent  {
  constructor(props) {
    super(props)

    let events = window.localStorage.getItem('sports')
    events = (events && typeof events !== 'string') ? JSON.parse(events) : data
    this.state = {
      events
    }
  }

  componentDidMount() {
    const currentEvents = this.getCurrentEventsFromStates()
    let Tip
    if (util.isRecentlyExercised(currentEvents)) {
      const lasting = util.getRecentlyLasting(currentEvents)
      const title = `您当前连续打卡 ${lasting} 天！继续努力！`
      Object.assign(SWAL_PUNCH_INFO, { title })
      Tip = SWAL_PUNCH_INFO
    } else {
      Tip = SWAL_PUNCH_WARNING
    }
    swal(Tip)
  }

  /**
   * 获取今日数据，顶部展示
   */
  getHeaderInfo = () => {
    const currentEvents = this.getCurrentEventsFromStates()
    const lastEvent = util.getLastEvent(currentEvents)
    const lasting = util.getLastingMax(currentEvents)
    const { weight } = lastEvent

    return `您最长连续打卡${lasting}天! 您当前体重是 ${weight}`
  }

  /**
   * 从当前状态中获取当前事件
   */
  getCurrentEventsFromStates = (type) => {
    const { events } = this.state
    return util.getCurrentEvents(events, type)
  }

  addEvent = () => {
    this.setState({ showCard: true })
  }

  /**
   * 保存运动事件
   * @param {String} title
   * @param {String} weight
   */
  pushEvent = ({ title = 'Sports', weight = '未记录' }) => {
    const { events } = this.state
    const currentEvents = this.getCurrentEventsFromStates(events, 'new')
    const len = currentEvents.length
    const newCurrentEvents = currentEvents.slice(0)
    const newEvents = {
      id: len,
      title,
      weight,
      allDay: false,
      start: util.getFormattedDate(),
      end: util.getFormattedDate()
    }

    if (!util.isUnique(newEvents, currentEvents)) { return }
    events[CURRENTYEAR] = newCurrentEvents.concat([newEvents])

    this.setState({ events }, () => {
      window.localStorage.setItem('sports', JSON.stringify(events, null, 2))
    })

    return util.copyToClipboard(JSON.stringify(newEvents, null, 2))
  }

  /**
   * [清除今日数据，仅在今日有数据时清除]
   * @return {[type]} [description]
   */
  clearToday = () => {
    const { events = {} } = this.state
    // 必须深拷贝，否则无法更新
    const newEvents = util.simpleDeepCopy(events)
    const currentEvents = this.getCurrentEventsFromStates(newEvents, 'new')
    const lastEvent = util.getLastEvent(currentEvents)

    if (lastEvent && util.isSameDate(util.getToday(), lastEvent.start)) {
      currentEvents.pop()
      newEvents[CURRENTYEAR] = currentEvents
    }
    this.setState({ events: newEvents }, () => {
      window.localStorage.setItem('sports', JSON.stringify(newEvents))
    })
  }

  /**
   * [清除所有数据]
   * @return {[type]} [description]
   */
  clearAll = () => {
    this.setState({
      events: {}
    }, () => {
      window.localStorage.setItem('sports', undefined)
    })
  }

  /**
   * [手动设置 events 样式]
   * @param  {[type]}  event      [description]
   * @param  {[type]}  start      [description]
   * @param  {[type]}  end        [description]
   * @param  {Boolean} isSelected [description]
   * @return {[type]}             [description]
   */
  eventPropGetter = (event, start, end, isSelected) => {
    const eventStyle = {
      event: {
        margin: '10px',
        paddingLeft: '20px',
        borderRadius: '4px',
        backgroundColor: '#78c2ad'
      }
    }

    return {
      style: eventStyle.event
    }
  }

  closeCard = () => {
    this.setState({ showCard: false })
  }

  handleCard = () => {
    this.setState({ showInfo: !this.state.showInfo })
  }

  handleSubmit = (e) => {
    if (e.keyCode === ENTER_KEYCODE && e.shiftKey) {
      const textValue = e.target.value || '';
      const [sportsValue = '', weightNumber] = textValue.split('\n') || [];
      const title = sportsValue ? `Sports: ${sportsValue}` : ''
      const weight = weightNumber ? `${weightNumber} 斤` : weightNumber;
      const tips = this.pushEvent({ title, weight }) ? { text: CONSTANTS.COPIED_SUCCESS } : {}

      this.closeCard()
      swal(Object.assign(SWAL_PUNCH_SUCCESS, tips))
    }
  }

  renderTip() {
    const text = this.getHeaderInfo()

    return (
      <wired-listbox class='wired-tip'>
        <wired-item value='one' text={text}></wired-item>
      </wired-listbox>
    )
  }

  renderCard() {
    const cardClass = this.state.showCard ? 'card show': 'card hidden'
    return (
      <div className={cardClass}>
        <div className='calendar-card'>
          <textarea className='card-textarea' autoFocus
          onKeyDown={this.handleSubmit}
          onBlur={this.closeCard}/>
        </div>
      </div>
    )
  }

  renderInfo() {
    const cardInfoClass = this.state.showInfo ? 'show': 'hidden'
    const currentEvents = this.getCurrentEventsFromStates()
    const len = (currentEvents || []).length;
    const lasting = util.getLastingMax(currentEvents)
    const info = util.getExercisedInfo(currentEvents)
    const UNEXISTED_STRING = '不存在的'
    const { monthly = [], times = {} } = info

    return (
      <wired-card class={`wired-card ${cardInfoClass}`} onClick={this.handleCard}>
        <h2>{this.state.events[CURRENTYEAR] ? CURRENTYEAR : LASTYEAR} 打卡统计面板:</h2>
        <h4>您目前已打卡{renderRedText(len)}次。</h4>
        <h4>其中，最长连续打卡{renderRedText(lasting)}次。</h4>
        {monthly.map((item) => {
          return (<h4 key={item.key}>其中，{renderRedText(item.month)}月打卡{renderRedText(item.times)}次。</h4>)
        })}
        <h4>其中，最多的一天是{renderRedText(times.maxDay || UNEXISTED_STRING)}, 做了{renderRedText(times.max || UNEXISTED_STRING)}次。</h4>
      </wired-card>
    )
  }

  renderBtns() {
    return (
      <div className='btns'>
        <wired-icon-button class='push-btn red big' onClick={this.addEvent}>
          favorite
        </wired-icon-button>
        <wired-icon-button class='info-btn green big' onClick={this.handleCard}>
          info
        </wired-icon-button>
      </div>
    )
  }

  renderClear() {
    return (
      <div className="clear-btns">
        <wired-button class='clear-btn' onClick={this.clearToday}>
          clearToday
        </wired-button>
        <wired-button class='clear-btn' onClick={this.clearAll}>
          clearAll
        </wired-button>
      </div>
    )
  }

  renderCalendar() {
    const currentEvents = this.getCurrentEventsFromStates()

    return <BigCalendar
          events={currentEvents}
          startAccessor='start'
          endAccessor='end'
          eventPropGetter={this.eventPropGetter}
        />
  }

  render() {
    return (
      <div className='calendar'>
        {this.renderTip()}
        {this.renderCard()}
        {this.renderClear()}
        {this.renderCalendar()}
        {this.renderBtns()}
        {this.renderInfo()}
      </div>
    )
  }
}
