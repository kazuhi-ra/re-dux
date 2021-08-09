const randomString = () =>
  Math.random().toString(36).substring(7).split('').join('.')

export const defaultActionType = {
  INIT: `@@redux/INIT${randomString()}`,
}
