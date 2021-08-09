import { Action } from './types/action'
import { Reducer } from './types/reducer'
import { State } from './types/state'
import { defaultActionType } from './utils/defaultActionType'

class Store {
  currentReducer: Reducer
  currentState: State
  isDispatching = false

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

    return action
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
    if (!!action.type) {
      throw new Error(
        'actionはtypeプロパティを持つオブジェクトでなければいけません'
      )
    }
  }
}

export const createStore = (args: { reducer: Reducer; initialState: State }) =>
  new Store(args)
