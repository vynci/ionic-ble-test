window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame   ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        function( callback ){
            window.setTimeout(callback, 10 / 60);
        };
})();

angular.module('starter.joystick', []).directive('joystick', function($timeout) {

    function joystickController ($scope) {
      $scope.joystickValue = 1;
    }

    return {
        restrict : 'E',
        controller : joystickController,
        scope : {
            position : '&',
            offset : '=',
            onDone: "&"
        },
        template : '<canvas class="joystickCanvas"></canvas>',
        link : function(scope, element) {

            // $timeout(function () {
            //   scope.onDone({
            //     value: "something"
            //   });
            // }, 3000);

            var joystickHeight = 200;
            var joystickWidth  = 200;

            var center = {
                x : joystickHeight / 2,
                y : joystickWidth / 2
            };

            var radiusCircle = 35;
            var radiusBound = 30;

            // Canvas and context element
            var container = element[0];
            var canvas = container.children[0];
            var ctx = canvas.getContext('2d');

            // Id of the touch on the cursor
            var cursorTouchId = -1;
            var cursorTouch = {
                x : center.x,
                y : center.y
            };

            function resetCanvas() {
                canvas.height = joystickHeight;
                canvas.width = joystickWidth;
            }

            function onTouchStart(event) {
                var touch = event.targetTouches[0];
                cursorTouchId = touch.identifier;
                cursorTouch = {
                    x : touch.pageX - touch.target.offsetLeft,
                    y : touch.pageY - (touch.target.offsetTop + 40)
                };
            }

            function onTouchMove(event) {
                // Prevent the browser from doing its default thing (scroll, zoom)
                event.preventDefault();
                for(var i = 0; i < event.changedTouches.length; i++){
                    var touch = event.changedTouches[i];

                    if(cursorTouchId === touch.identifier)
                    {
                        cursorTouch = {
                            x : touch.pageX - touch.target.offsetLeft,
                            y : touch.pageY - (touch.target.offsetTop + 40)
                        };

                        var scaleX = radiusBound / (cursorTouch.x - center.x);
                        var scaleY = radiusBound / (cursorTouch.y - center.y);

                        if(Math.abs(scaleX) < 1) {
                            cursorTouch.x = Math.abs(cursorTouch.x - center.x) * scaleX + center.x;
                        }

                        if (Math.abs(scaleY) < 1) {
                            cursorTouch.y = Math.abs(cursorTouch.y - center.y) * scaleY + center.y;
                        }

                        scope.$apply(
                            scope.position = {
                                x : Math.round(((cursorTouch.x - center.x)/radiusBound) * 100),
                                y : Math.round(((cursorTouch.y - center.y)/radiusBound) * -100)
                            }
                        );

                        break;
                    }
                }

            }

            function onTouchEnd() {

                cursorTouchId = -1;

                scope.$apply(
                    scope.position = {
                        x : 0,
                        y : 0
                    }
                );

                cursorTouch.x = center.x;
                cursorTouch.y = center.y;

                scope.endTouch = true;
            }

            function draw() {
                // Clear the canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                ctx.beginPath();
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 5;
                ctx.arc(center.x, center.y, radiusCircle, 0, Math.PI*2, true);
                ctx.stroke();

                ctx.beginPath();
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 2;
                ctx.arc(center.x, center.y, radiusBound, 0, Math.PI*2, true);
                ctx.stroke();

                ctx.beginPath();
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 2;
                ctx.arc(cursorTouch.x, cursorTouch.y, radiusCircle, 0, Math.PI*2, true);
                ctx.stroke();

                requestAnimFrame(draw);
            }

            // Check if touch is enabled
            var touchable = true;

            if(touchable) {
                canvas.addEventListener( 'touchstart', onTouchStart, false );
                canvas.addEventListener( 'touchmove', onTouchMove, false );
                canvas.addEventListener( 'touchend', onTouchEnd, false );

                window.onorientationchange = resetCanvas;
                window.onresize = resetCanvas;
            }

            // Bind to the values from outside as well
            scope.$watch('position', function(newVal, oldVal) {
              if(newVal !== oldVal){
                if(newVal.x === 100){
                  scope.onDone({
                    value: {
                      direction : 'right',
                      offset : scope.offset
                    }
                  });
                } else if(newVal.x === -100) {
                  scope.onDone({
                    value: {
                      direction : 'left',
                      offset : scope.offset
                    }
                  });
                } else if(newVal.y === 100) {
                  scope.onDone({
                    value: {
                      direction : 'up',
                      offset : scope.offset
                    }
                  });
                } else if(newVal.y === -100) {
                  scope.onDone({
                    value: {
                      direction : 'down',
                      offset : scope.offset
                    }
                  });
                } else if(newVal.x === 0 || newVal.y === 0) {
                  scope.onDone({
                    value: {
                      direction : 'center',
                      offset : scope.offset
                    }
                  });
                }

              }
            });

            resetCanvas();
            draw();

        }

    };

});
