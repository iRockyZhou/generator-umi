import { message } from 'antd'
import { formatMessage } from 'umi/locale'

import { withMixin } from '../helpers/dva'
import { redirectTo } from '../helpers/view'
import { getCurrentUser } from '../services/user'
import { clearAll, getToken } from '../helpers/storage'

export default withMixin({
  state: {
    currentUser: null
  },

  effects: {
    *initCurrentUser({ payload }, { put, call, select }) {
      if (!getToken()) {
        message.warn(
          formatMessage({
            id: 'APP_TOKEN_EXPIRED'
          })
        )
        yield put({
          type: 'updateState',
          payload: {
            currentUser: new Error()
          }
        })
        return redirectTo('/login')
      }
      const { currentUser } = yield select(_ => _.users)
      if (currentUser) {
        return currentUser
      }
      yield put({
        type: 'queryCurrentUser'
      })
    },
    *queryCurrentUser({ payload }, { put, call, select }) {
      const { success, data } = yield call(getCurrentUser)
      if (!success || !data) {
        message.warn(
          formatMessage({
            id: 'APP_TOKEN_EXPIRED'
          })
        )
        clearAll()
        return redirectTo('/login')
      }
      yield put({
        type: 'updateState',
        payload: {
          currentUser: data
        }
      })
    }
  },
  reducers: {}
})
