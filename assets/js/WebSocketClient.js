module.exports = class WebSocketClient {
    constructor(url) {
        this.autoReconnectInterval = 3 * 1000;	// ms
        this.url = url;
        this.open();
    }

    open() {
        this.instance = new WebSocket(this.url);
        this.instance.onopen = () => {
            this.onopen();
        };
        this.instance.onmessage = (data, flags) => {
            this.onmessage(data, flags);
        };
        this.instance.onclose = (e) => {
            switch (e.code) {
                case 1000:	// CLOSE_NORMAL
                    console.log("WebSocket: closed");
                    break;
                default:	// Abnormal closure
                    this.reconnect(e);
                    break;
            }
            this.onclose(e);
        };
        this.instance.onerror = (e) => {
            switch (e.code) {
                case 'ECONNREFUSED':
                    this.reconnect(e);
                    break;
                default:
                    this.onerror(e);
                    break;
            }
        };
    }

    reconnect(e) {
        console.log(`WebSocketClient: retry in ${this.autoReconnectInterval}ms`, e);
        this.instance = null;
        setTimeout(() => {
            console.log("WebSocketClient: reconnecting...");
            this.open();
        }, this.autoReconnectInterval);
    }

    onopen(e) {
    }

    onmessage(data, flags, number) {
    }

    onerror(e) {
    }

    onclose(e) {
    }
};