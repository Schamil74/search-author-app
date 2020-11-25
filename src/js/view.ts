import { IPostModified } from './model'
import { EventEmitter } from './service'

export type view = typeof View

export default class View extends EventEmitter {
    isLoading: boolean = false
    inputSearch = document.querySelector('.js-search')!

    constructor() {
        super()
        ;(<HTMLInputElement>this.inputSearch).addEventListener(
            'input',
            (ev: any) => {
                this.emit('search', ev.target.value.trim())
            }
        )
    }

    renderPosts(posts: Array<IPostModified>) {
        const list = document.querySelector('.posts__list')!
        const html = posts.length
            ? posts
                  .map(
                      ({ author, title, body }) =>
                          `<article class="posts__item">
                                <h2 class="posts__title">${title}</h2>
                                <p class="posts__body">${body}</p>
                                <address class="posts__author">${author}</address>
                            </article>`
                  )
                  .join('')
            : '<div class="posts__result">Ничего не нашлось</div>'

        list.innerHTML = html
    }
}
