//import request from 'request'

import {ComponentStorerUnfound, ComponentStorerUnwritable} from './component-storer-errors'

class ComponentHttpStorer {

  read (address) {
    return new Promise((resolve, reject) => {
      request.get(address, (error, response, body) => {
        if (!error && response.statusCode === 200) {
          resolve(body)
        } else if (error) {
          if (error.code === 'ENOTFOUND') {
            reject(new ComponentStorerUnfound(this, address))
          } else {
            reject(new Error(error.message))
          }
        } else {
          if (response.statusCode === 404) {
            reject(new ComponentStorerUnfound(this, address))
          } else {
            reject(new Error(response.body))
          }
        }
      })
    })
  }

  write (address) {
    return Promise.reject(new ComponentStorerUnwritable(this, address))
  }

}

export default ComponentHttpStorer
