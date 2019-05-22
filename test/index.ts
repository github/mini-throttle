import {throttle, debounce} from '../index'

throttle(() => {}, 100)
throttle(() => {}, 100, {start: false})
throttle(() => {}, 100, {middle: false})
debounce(() => {}, 100)
debounce(() => {}, 100, {start: false})
debounce(() => {}, 100, {middle: false})
