import type model from './model'
import type view from './view'

export default class Controller {
    model: model
    view: view
    constructor(model: model, view: view) {
        this.model = model
        this.view = view
        this.view.on('search', this.search.bind(this))
    }

    async init() {
        const posts = await this.model.getPosts()
        this.view.renderPosts(posts)
    }

    search = (string: string) => {
        const posts = this.model.getPostsByAuthor(string)
        this.view.renderPosts(posts)
    }
}
