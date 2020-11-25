const ready = (callback: () => void) => {
    if (document.readyState && document.readyState !== 'loading') {
        callback()
    } else {
        document.addEventListener('DOMContentLoaded', callback)
    }
}

import 'core-js/es/promise/'
import Controller from './js/controller'
import Model from './js/model'
import View from './js/view'

ready(() => {
    const model = new Model()
    const view = new View()
    new Controller(model, view).init()
})
