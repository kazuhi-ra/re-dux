import { Action } from './action'
import { State } from './state'

export type Reducer = (state: State, action: Action) => State
