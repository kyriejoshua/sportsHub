import moment from 'moment'

const CURRENTYEAR = new Date().getFullYear()
const LASTYEAR = CURRENTYEAR - 1

/**
 * [isUnique 判断是否已打卡过]
 * @param  {Object}  a [description]
 * @param  {Array}  b [description]
 * @return {Boolean}   [description]
 */
export function isUnique(a, b) {
  return !b.find((item) => {
    return moment(item.start).isSame(a.start, 'day')
  })
}

/**
 * [getFormattedDate 格式化日期]
 * @param  {Date} date [description]
 * @param  {Boolean} isDate [是否只格式化日期]
 * @return {String}      [description]
 */
export function getFormattedDate(date = undefined, isDate) {
  const format = isDate ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm'
  return moment(date).format('YYYY-MM-DD HH:mm')
}

export function isSameDate(date1, date2, type = 'day') {
  return date1.isSame(date2, type)
}

/**
 * [getToday 获取当天]
 * @return {Date} [description]
 */
export function getToday() {
  return moment()
}

/**
 * [getYesterday 获取昨天]
 * @return {Date} [description]
 */
export function getYesterday() {
  return getToday().add(-1, 'days')
}

/**
 * [isRecentlyExercised 最近有没有锻炼啊]
 * @param  {Array}   events [description]
 * @return {Boolean}        [description]
 */
export function isRecentlyExercised(events = []) {
  if (!Array.isArray(events) || events.length === 0) { return }
  const lastDay = events[events.length - 1]
  return lastDay && (isSameDate(getYesterday(), lastDay.start) || isSameDate(getToday(), lastDay.start))
}

/**
 * [getLastingMax 计算曾经最长打卡时间]
 * @param  {Array}  arr [description]
 * @return {Number}     [description]
 */
export function getLastingMax(arr = []) {
  const len = arr.length
  if (len === 0 || len === 1) { return len }
  let lasting = 1
  let temp = 1
  for (let index = 0; index < len; index++) {
    const current = arr[index];
    // 如果是第一个数，不做处理
    if (!arr[index - 1] && arr[index - 1] !== 0) { continue }
    // 如果正好是递增为 1 天
    if (isSameDate(moment(current.start).add(-1, 'days'), moment(arr[index - 1].start))) {
      temp++
    } else {
      lasting = temp > lasting ? temp : lasting
      temp = 1
    }
    // 如果正好是末尾连续
    if (index === (len - 1)) { lasting = temp > lasting ? temp : lasting }
    // 如果计算连续已停止，并且当前已经持续的数量超过剩下的数量
    if (lasting > (len - index - 1) && temp === 1) break;
  }
  return lasting
}

/**
 * [getRecentlyLasting 获取当前连续打卡天数]
 * @param  {Array}  arr [description]
 * @return {Number}     [description]
 */
export function getRecentlyLasting(arr = []) {
  const len = arr.length
  let lasting = 1
  for (let index = len - 1; index > 0; index--) {
    const current = arr[index];
    if (isSameDate(moment(current.start).add(-1, 'days'), moment(arr[index - 1].start))) {
      lasting++
    } else {
      break
    }
  }
  return lasting
}

/**
 * [getExercisedSizes 获取当天的锻炼数量]
 * @param  {String} str [description]
 * @return {Number}     [description]
 */
export function getExercisedSizes(str = '') {
  return parseFloat(str.substr(8, 4))
}

/**
 * [getExercisedInfo 获取打卡相关的信息]
 * @param  {Array}  arr [description]
 * @return {Object}     [description]
 */
export function getExercisedInfo(arr = []) {
  let info = {}
  const times = arr.map((item) => {
    return getExercisedSizes(item.title)
  })

  info.times = {
    max: times.length === 0 ? 0 : Math.max(...times)
  }
  const maxDay = arr.find((item) => {
    return getExercisedSizes(item.title) === info.times.max
  })

  info.times.maxDay = maxDay ? getFormattedDate(maxDay.start, true) : undefined
  info.monthly = getExercisedMonthly(arr)
  return info
}

/**
 * [getExercised 获取每月的锻炼次数，以对象形式存储，然后转化为数组]
 * @param  {Array}  arr [description]
 * @return {Array}     [description]
 */
export function getExercisedMonthly(arr = []) {
  let monthly = {}
  arr.map((item) => {
    let month = moment(item.start).month() + 1
    monthly[month] = monthly[month] ? monthly[month] + 1 : 1
  })
  return transformObjToArray(monthly)
}

/**
 * [transformObjToArray 将对象转化为数组格式，便于遍历]
 * @param  {Object} obj [description]
 * @return {Array}     [description]
 */
export function transformObjToArray(obj = {}) {
  let info = []
  for (let month in obj) {
    info.push({
      key: Math.random(),
      month,
      times: obj[month]
    })
  }
  return info
}

/**
 * 获取当前年份或次年的数据
 * @param {*} events
 * @param {*} type
 */
export function getCurrentEvents(events, type) {
  return type === 'new' ? (events[CURRENTYEAR] || []) : (events[CURRENTYEAR] || events[LASTYEAR])
}

export function copyToClipboard(str = '') {
  if (!str) { return }
  if (typeof str !== 'string') {
    str = JSON.stringify(str)
  }
  return createInput(str)
}

export function copyEvent() {
  try {
    document.execCommand('copy')
  } catch (error) {
    console.error('复制失败: ', error)
    return false
  }
  return true
}

export function createInput(str = '') {
  const input = document.createElement('input')
  input.value = str
  document.body.appendChild(input)
  input.select()
  const isCopied = copyEvent()
  document.body.removeChild(input);
  return isCopied
}
