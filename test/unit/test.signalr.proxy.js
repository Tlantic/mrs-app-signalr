describe('MRS.SignalR', function () {

    describe('SignalR service', function () {

        var signalrService, rootScopeService;

        beforeEach(module('MRS.SignalR'));

        beforeEach(inject(function ($rootScope, signalrProxy) {
            rootScopeService = $rootScope;
            signalrService = signalrProxy;

            signalrService.serviceUrl = 'http://localhost:9090';
            signalrService.hubName = 'myHub';
            signalrService.initialized = false;

            window.yepnope = jasmine.createSpy('yepnope').andCallFake(function (obj) {
                obj.callback();
            });

            spyOn(rootScopeService, '$broadcast');

            $ = {};
            $.connection = {};
            $.connection.hub = jasmine.createSpyObj('hub', ['start', 'stop', 'done', 'disconnected']);
            $.connection.hub.start.andCallFake(function () {
                return $.connection.hub;
            });

            $.connection.hub.done.andCallFake(function (obj) {
                obj();
            });

            $.connection[signalrService.hubName] = {};
            $.connection[signalrService.hubName].client = {};
            //$.connection[signalrService.hubName].client.subscribe = jasmine.createSpy('subscribe');
            $.connection[signalrService.hubName].server = {};
            $.connection[signalrService.hubName].server.broadcast = jasmine.createSpy('broadcast');

        }));

        it('should connect to a hub', function () {
            signalrService.connect();

            expect($.connection.hub.start).toHaveBeenCalled();
        });

        it('should fire an event when the server send a message', function () {
            signalrService.connect();

            var message = {};
            message.action = 'MY_EVENT';
            message.options = {
                "param1": "value1",
                "param2": "value2"
            };

            $.connection[signalrService.hubName].client.subscribe(message);

            expect(rootScopeService.$broadcast).toHaveBeenCalledWith('MY_EVENT', message.options);
        });

        it('should not fire an event if the hub is not connected', function () {

            $.connection.hub.done.andCallFake(function (obj) {
                // simulating done() hasn´t been called....
            });

            signalrService.connect();

            var message = {};
            message.action = 'MY_EVENT';
            message.options = {
                "param1": "value1",
                "param2": "value2"
            };

            $.connection[signalrService.hubName].client.subscribe(message);

            expect(rootScopeService.$broadcast).not.wasCalled();
            //expect($.connection[signalrService.hubName].client.subscribe).toBeUndefined();
        });

        it('should disconnect the hub', function () {

            signalrService.disconnect();

            expect($.connection.hub.disconnected).toHaveBeenCalled();
            expect($.connection.hub.stop).toHaveBeenCalled();
        });

        it('should broadcast a message', function () {

            signalrService.broadcast({
                action: 'myAction',
                myParam: 'param1'
            });

            expect($.connection[signalrService.hubName].server.broadcast).toHaveBeenCalledWith({
                action: 'myAction',
                myParam: 'param1'
            });

        });

    });

});