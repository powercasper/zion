var db = require("./db/dynamoDb");
var WebSocket = require('ws');

function Remote() {
	this.connected				= false;
	this.handshaken 			= false;

	this.ws 					= undefined;
	this.command_count			= 0;
	this.onConnectCallback	 	= false;
	this.onDisconnectCallback 	= false;
	this.connectTimeout			= undefined;
	this.reconnectInterval		= undefined;
	this.reconnecting			= false;

}

Remote.prototype.connect = function( opts, callback ) {
	opts = opts || {};
	callback = callback || function(){}

	if( typeof opts.address == 'string' ) 	this.opts.address = opts.address;
	if( typeof opts.key == 'string' ) 		this.opts.key = opts.key;

	this.debug('connecting to', this.opts.address)
	this.ws = new WebSocket( 'ws://' + this.opts.address + ':' + this.opts.port );

	this.ws
		.on('open', onOpen.bind(this))
    .on('error', onError.bind(this))
    .on('close', onClose.bind(this))
    .on('message', onMessage.bind(this))

	if( typeof this.opts.connectTimeout == 'number' ) {
		if( this.connectTimeout ) clearTimeout(this.connectTimeout);
		this.connectTimeout = setTimeout(function(){
			if( typeof this.onConnectCallback == 'function' ) {
				if( this.opts.reconnectFromStart ) {
					this._reconnect();
				} else {
					this.onConnectCallback( new Error("timeout") );
					this.onConnectCallback = false;
				}
			}
		}.bind(this), this.opts.reconnectTimeout);
	}

	if( typeof callback == 'function' && this.onConnectCallback === false ) {
		this.onConnectCallback = callback;
	}
}