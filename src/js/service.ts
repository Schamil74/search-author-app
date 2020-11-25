type TArg = string | number | {} | []
type TListener = (arg: any) => void

class EventEmitter {
    events = {}

    on(type: string, listener: TListener) {
        this.events[type] = this.events[type] || []
        this.events[type].push(listener)
    }

    emit(type: string, arg: TArg) {
        if (this.events[type]) {
            this.events[type].forEach((listener: TListener) => listener(arg))
        }
    }
}

export { EventEmitter }
