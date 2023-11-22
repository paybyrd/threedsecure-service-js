export class Stopwatch {
    private start: number;
    private end: number;

    constructor() {
        this.start = Date.now();
    }
    
    stop() {
        this.end = Date.now();
    }

    get elapsed() {
        return (this.end || Date.now()) - this.start;
    }
}