import { EventEmitter } from './service'
import axios from 'axios'

export type model = typeof Model

export interface IPost {
    'userId': number
    'id': number
    'title': string
    'body': string
}

export interface IPostModified extends IPost {
    'author': string
}

export default class Model extends EventEmitter {
    constructor() {
        super()
    }

    posts: Array<IPostModified> = []
    _isLoading: boolean = true

    get isLoading(): boolean {
        return this._isLoading
    }

    set isLoading(val: boolean) {
        this._isLoading = val
        if (!this._isLoading) {
            this.onChangeIsLoading()
        }
    }

    private onChangeIsLoading() {
        for (const elem of document.querySelectorAll('.is-hided')) {
            elem.classList.remove('is-hided')
            elem.removeAttribute('style')
        }

        ;(<HTMLElement>document.querySelector('.loader')).style.display = 'none'
    }

    async getPosts(): Promise<any> {
        this.isLoading = true

        try {
            const posts = await axios.get(
                'http://jsonplaceholder.typicode.com/posts'
            )

            const users = await axios.get(
                `http://jsonplaceholder.typicode.com/users/`
            )

            type TUser = typeof users.data[0]

            posts.data.forEach((post: IPostModified) => {
                users.data.forEach((user: TUser) => {
                    if (post.userId === user.id) {
                        post.author = user.name
                    }
                })
            })

            this.isLoading = false

            this.posts = posts.data
            return this.posts
        } catch (error) {
            this.isLoading = false
            console.log(error.message)
        }
    }

    getPostsByAuthor(string: string) {
        const posts = this.posts.filter(
            (post: IPostModified) =>
                post.author.toUpperCase().indexOf(string.toUpperCase()) > -1
        )

        return posts
    }
}
