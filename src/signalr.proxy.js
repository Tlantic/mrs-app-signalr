/**
The signalrProxy service is a signalr wraper (http://signalr.net/) which allows building real-time web functionality, through the exchange of lightweight and fast messages between the client (browser) and the server.

It relies on WebSockets and fallbacks to other technologies according to the browser support.

@class signalr
@namespace MRS.SignalR
@since 0.1.0
**/
angular.module('MRS.SignalR').service('signalrProxy', ['$rootScope', function mrsSignalRProxy($rootScope) {
    'use strict';

        var self = this;

        /**
            Path to the service containing the operations the client can call (Service hub).
        
            @property serviceUrl 
            @public
            @type String
        **/
        self.serviceUrl = '';

        /**
            Name of the hub on the server side containing the operations.
        
            @property hubName 
            @public
            @type String
        **/
        self.hubName = '';

        /**
            Indicates whether the hub has already been successfully initialized.
            @property initialized 
            @private
            @type Boolean
        **/
        var initialized = false;

        /**
            Starts a new connection with the server.
            
            @method reconnect
            @private
            @param callback {Object} Function to be executed after the connection has been established.
        **/
        var reconnect = function signalRProxyReconnect() {
            $.connection.hub.disconnected(reconnect);
            $.connection.hub.start({
                jsonp: true
            }).done(function () {
                initialized = true;
            });
        };

        /**
            Load the hub containing all the valid operations on the server.
            @method connect
            @public
        **/
        self.connect = function signalRProxyConnect() {
            var serviceUrl = this.serviceUrl;
            var hubUrl = self.serviceUrl + '/signalr/hubs';

            yepnope({
                load: [hubUrl],
                callback: function signalRProxyYepNope() {
                    if ($.connection[self.hubName]) {
                        $.connection.hub.url = self.serviceUrl + '/signalr';
                        $.connection.hub.logging = true;

                        /**
                            Subscribes to events sent by the server and broadcasts to all client modules that are listening to this event.
                            
                            Need to have at least 1 function registered to be subscribed to hub
                            
                            @method subscribe
                            @param message {Object} Object containing the name of the event fired on the client side, along with  extra parameters.
                        **/
                        $.connection[self.hubName].client.subscribe = function (message) {
                            if (initialized) {
                                $rootScope.$broadcast(message.action, message.options);
                            }
                        };

                        reconnect();
                    }
                }
            });
        };

        /**
            Allows client modules to fire operations located in the server, exposed in the hub.
            
            @method broadcast
            @public
            @param message {Object} Object containing the name of the event to be fired and extra parameters.
        **/
        self.broadcast = function signalRProxyBroadCast(message) {
            $.connection[self.hubName].server.broadcast(message);
        };

        /**
            Forces the disconnection between the client (browser) and the server (hub).
            
            @method disconnect
            @public
        **/
        self.disconnect = function signalRProxyDisconnect() {
            $.connection.hub.disconnected(function () {});
            $.connection.hub.stop();

            initialized = false;
        };

    }]);