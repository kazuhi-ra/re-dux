import { Action } from './types/action'
import { Reducer } from './types/reducer'
import { State } from './types/state'
import { defaultActionType } from './utils/defaultActionType'

class Store {
  currentReducer: Reducer
  currentState: State
  isDispatching = false
  currentListeners: (() => void)[] = []
  nextListeners = this.currentListeners
  isSubscribed = false

  constructor(args: { reducer: Reducer; initialState: State }) {
    const { reducer, initialState } = args
    this.currentReducer = reducer
    this.currentState = initialState

    this.init()
  }

  getState = () => {
    this.isDispatchingValidator(this.isDispatching)
    return this.currentState
  }

  dispatch = (action: Action): Action => {
    this.actionValidator(action)
    this.isDispatchingValidator(this.isDispatching)

    try {
      this.isDispatching = true
      this.currentState = this.currentReducer(this.currentState, action)
    } finally {
      this.isDispatching = false
    }

    this.execNextListeners()

    return action
  }

  subscribe = (listener: () => void) => {
    if (this.isDispatching) {
      throw new Error('reducerの実行中です')
    }
    this.isSubscribed = true
    this.ensureCanMutateNextListeners()
    this.nextListeners.push(listener)

    return this.unsubscribe
  }

  private init = (): void => {
    this.dispatch({ type: defaultActionType.INIT })
  }

  private isDispatchingValidator = (isDispatching: boolean): void => {
    if (isDispatching) {
      throw new Error('reducerの実行中には呼び出せません。')
    }
  }

  private actionValidator = (action: Action): void => {
    if (!action.type) {
      throw new Error(
        'actionはtypeプロパティを持つオブジェクトでなければいけません'
      )
    }
  }

  // dispatch中にsubscribeを呼ぶのを防ぐためのメソッド
  private ensureCanMutateNextListeners = (): void => {
    if (this.nextListeners === this.currentListeners) {
      this.nextListeners = this.currentListeners.slice()
    }
  }

  private execNextListeners = () => {
    const listeners = (this.currentListeners = this.nextListeners)
    if (!listeners) return

    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i]
      listener()
    }
  }

  private unsubscribe = (listener: () => void) => {
    if (!this.isSubscribed) return // isSubscribedがfalseの時に呼び出されても何もしない
    if (this.isDispatching) {
      throw new Error('reducerの実行中です')
    }

    this.isSubscribed = false

    this.ensureCanMutateNextListeners()
    const index = this.nextListeners.indexOf(listener)
    this.nextListeners.splice(index, 1)
    this.currentListeners = []
  }
}

export const createStore = (args: { reducer: Reducer; initialState: State }) =>
  new Store(args)
