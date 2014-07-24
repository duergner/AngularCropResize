/* AngularCropResize
 *
 * Copyright (C) 2014 Michael Duergner <michael.duergner@gmail.com>
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */
(function(angular) {
    var name = 'cropresize';
    var mods = [];
    angular.module(name,mods).directive(name, [
        function() {
            return {
                template: '<div class="ng-cr" ng-class="ngCrCropStyleClass"><section class="canvas" ng-style="ngCrSectionStyles"><canvas class="ng-cr-canvas" width="{{canvasWidth}}" height="{{canvasHeight}}" ng-mousemove="onCanvasMouseMove($event)" ng-mousedown="onCanvasMouseDown($event)" ng-mouseup="onCanvasMouseUp($event)"></canvas><div class="ng-cr-guide" ng-style="ngCrGuideStyles"></div></section> <div><button class="btn btn-default btn-sm" ng-click="rotateLeft()" ng-disabled="!ready(\'rotateLeft\')" ng-class="{disabled:!ready(\'rotateLeft\')}"><i class="fa fa-rotate-left"></i></button> <button class="btn btn-default btn-sm" ng-click="rotateRight()" ng-disabled="!ready(\'rotateRight\')" ng-class="{disabled:!ready(\'rotateRight\')}"><i class="fa fa-rotate-right"></i></button> <button class="btn btn-default btn-sm" ng-click="zoomIn()" ng-disabled="!ready(\'zoomIn\')" ng-class="{disabled:!ready(\'zoomIn\')}"><i class="fa fa-plus"></i></button> <button class="btn btn-default btn-sm" ng-click="zoomOut()" ng-disabled="!ready(\'zoomOut\')" ng-class="{disabled:!ready(\'zoomOut\')}"><i class="fa fa-minus"></i></button> <button class="btn btn-success btn-sm" ng-click="done()"><i class="fa fa-check"></i></button> </div></div>',
                replace: true,
                restrict: 'AE',
                scope: {
                    file: '=ngCrInput',
                    canvasWidth: '=ngCrCanvasWidth',
                    canvasHeight: '=ngCrCanvasHeight',
                    callback: '=ngCrCallback'
                },
                link: function ($scope, element, attrs) {
                    var canvas = element.find('canvas')[0];
                    var image = new Image();
                    var fileReader = new FileReader();
                    var context = canvas.getContext('2d');

                    var width = attrs.ngCrCanvasWidth || 400;
                    var height = attrs.ngCrCanvasHeight || 300;

                    var currentX = 0, currentY = 0, dragging = false, startX = 0, startY = 0;
                    var rotation = 0;

                    var finalWidth = attrs.ngCrFinalWidth || 300;
                    var finalHeight = attrs.ngCrFinalHeight || 200;
                    var finalFactor = Math.max(Math.floor(finalWidth / width),Math.floor(finalHeight / height));

                    var cropStyle = attrs.ngCrCropStyle || 'rectangle';
                    var cropRectangleWidth = attrs.ngCrCropRectangeWidth || 300;
                    var cropRectangleHeight = attrs.ngCropRectangleHeight || 200;
                    var cropRectangleTop = Math.floor((height - cropRectangleHeight)/2);
                    var cropRectangleLeft = Math.floor((width - cropRectangleWidth)/2);
                    var cropCircleRadius = attrs.ngCrCropCircleRadius || 100;
                    if ('circle' === cropStyle) {
                        $scope.ngCrCropStyleClass = 'ng-cr-crop-circle';
                        $scope.ngCrGuideStyles = {
                            width: (cropCircleRadius * 2)+'px',
                            height: (cropCircleRadius * 2)+'px',
                            top: Math.floor((width - cropCircleRadius * 2)/2)+'px',
                            left: Math.floor((height - cropCircleRadius * 2)/2)+'px'
                        };
                    }
                    else {
                        $scope.ngCrCropStyleClass = 'ng-cr-crop-rectangle';
                        $scope.ngCrGuideStyles = {
                            width: cropRectangleWidth+'px',
                            height: cropRectangleHeight+'px',
                            top: cropRectangleTop+'px',
                            left: cropRectangleLeft+'px'
                        };
                    }
                    $scope.ngCrSectionStyles = {
                        width: width+'px',
                        height: height+'px'
                    };

                    var newWidth = 0, newHeight = 0;

                    var isReady = false;

                    fileReader.onload = function(e) {
                        image.src = this.result;
                    };

                    image.onload = function() {
                        var imgWidth = image.width;
                        var imgHeight = image.height;
                        var widthFactor = width / imgWidth;
                        var heightFactor = height / imgHeight;
                        var factor = 1;
                        currentX = 0;
                        currentY = 0;
                        if (widthFactor < heightFactor) {
                            factor = heightFactor;
                            currentX = -1 *Math.floor((imgWidth * factor - width) / 2);
                        }
                        else {
                            factor = widthFactor;
                            currentY = -1 * Math.floor((imgHeight * factor - height) / 2);
                        }

                        newWidth = Math.floor(imgWidth * factor);
                        newHeight = Math.floor(imgHeight * factor);

                        drawImage();
                        isReady = true;
                    };

                    $scope.ready = function(control) {
                        if (undefined !== control && null !== control) {
                            if (0 == control.indexOf('rotate')) {
                                return false;
                            }
                            else if (0 == control.indexOf('zoom')) {
                                return false;
                            }
                        }
                        return isReady;
                    };

                    $scope.rotateLeft = function() {
                        if (!$scope.ready('rotateLeft')) {
                            return;
                        }
                        context.rotate(-0.5 * Math.PI);
                        rotation--;
                        if (-4 <= rotation) {
                            rotation = 0;
                        }
                        drawImage();
                    };

                    $scope.rotateRight = function() {
                        if (!$scope.ready('rotateRight')) {
                            return;
                        }
                        context.rotate(0.5 * Math.PI);
                        rotation++;
                        if (4 >= rotation) {
                            rotation = 0;
                        }
                        drawImage();
                    };

                    $scope.zoomIn = function() {
                        if (!$scope.ready('zoomIn')) {
                            return;
                        }
                        // TODO Implement me!
                        drawImage();
                    };

                    $scope.zoomOut = function() {
                        if (!$scope.ready('zoomOut')) {
                            return;
                        }
                        // TODO Implement me!
                        drawImage();
                    };

                    $scope.done = function() {
                        var finalCanvas = document.createElement("canvas");
                        finalCanvas.setAttribute('width',finalWidth+'px');
                        finalCanvas.setAttribute('height',finalHeight+'px');
                        var finalContext = finalCanvas.getContext("2d");

                        finalContext.beginPath();
                        if ('circle' === cropStyle) {
                            finalContext.arc(Math.floor(finalWidth/2),Math.floor(finalHeight/2),finalFactor*cropCircleRadius,0,2*Math.PI);
                        }
                        else {
                            finalContext.rect(finalFactor*cropRectangleTop,finalFactor*cropRectangleLeft,finalFactor*cropRectangleWidth,finalFactor*cropRectangleHeight);
                        }
                        finalContext.clip();
                        finalContext.drawImage(image,finalFactor*currentX,finalFactor*currentY,finalFactor*newWidth,finalFactor*newHeight);
                        finalContext.closePath();
                        finalCanvas.toBlob(function(picture) {
                            if (undefined !== $scope.callback) {
                                $scope.callback(picture);
                            }
                        });
                    };

                    $scope.$watch('file',function(file) {
                        if (undefined !== file && null !== file) {
                            fileReader.readAsDataURL(file)
                        }
                    });

                    $scope.onCanvasMouseUp = function(event) {

                        if (!dragging) {
                            return;
                        }

                        event.preventDefault();
                        event.stopPropagation();

                        startX = 0;
                        startY = 0;
                        dragging = false;
                        currentX = targetX;
                        currentY = targetY;

                        removeBodyEventListener('mouseup', $scope.onCanvasMouseUp);
                        removeBodyEventListener('touchend', $scope.onCanvasMouseUp);
                        removeBodyEventListener('mousemove', $scope.onCanvasMouseMove);
                        removeBodyEventListener('touchmove', $scope.onCanvasMouseMove);
                    };

                    canvas.addEventListener('touchend', $scope.onCanvasMouseUp, false);

                    $scope.onCanvasMouseDown = function(event) {
                        startX = event.type === 'touchstart' ? event.changedTouches[0].clientX : event.clientX;
                        startY = event.type === 'touchstart' ? event.changedTouches[0].clientY : event.clientY;
                        dragging = true;

                        addBodyEventListener('mouseup', $scope.onCanvasMouseUp);
                        addBodyEventListener('mousemove', $scope.onCanvasMouseMove);
                    };

                    canvas.addEventListener('touchstart', $scope.onCanvasMouseDown, false);

                    function addBodyEventListener(eventName, func) {
                        document.documentElement.addEventListener(eventName, func, false);
                    }

                    function removeBodyEventListener(eventName, func) {
                        document.documentElement.removeEventListener(eventName, func);
                    }

                    $scope.onCanvasMouseMove = function(e) {

                        e.preventDefault();
                        e.stopPropagation();

                        if (!dragging) {
                            return;
                        }


                        var diffX = 0, diffY = 0;
                        if (0 == rotation) {
                            diffX = startX - ((e.type === 'touchmove') ? e.changedTouches[0].clientX : e.clientX); // how far mouse has moved in current drag
                            diffY = startY - ((e.type === 'touchmove') ? e.changedTouches[0].clientY : e.clientY); // how far mouse has moved in current drag
                        }
                        else if (2 == rotation) {
                            diffX = startX + ((e.type === 'touchmove') ? e.changedTouches[0].clientX : e.clientX); // how far mouse has moved in current drag
                            diffY = startY + ((e.type === 'touchmove') ? e.changedTouches[0].clientY : e.clientY); // how far mouse has moved in current drag
                        }

                        moveImage(currentX - diffX, currentY - diffY);

                    };

                    canvas.addEventListener('touchmove', $scope.onCanvasMouseMove, false);

                    function drawImage(clear) {
                        if (undefined === clear || null == clear) {
                            clear = true
                        }
                        if (clear) {
                            context.clearRect(0, 0, canvas.width, canvas.height);
                        }
                        context.drawImage(image,currentX,currentY,newWidth,newHeight);
                    }

                    function moveImage(x, y) {
                        targetX = x;
                        targetY = y;
                        context.clearRect(0, 0, canvas.width, canvas.height);
                        context.drawImage(image, x, y, newWidth, newHeight);
                    }
                }
            }
        }
    ]);
})(angular);