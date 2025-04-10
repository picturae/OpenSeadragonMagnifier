(function ($) {
    'use strict';

    if (!$.version || $.version.major < 2) {
        throw new Error('This version of Magnifier requires OpenSeadragon version 2.0.0+');
    }

    $.Viewer.prototype.magnifier = function (options) {
        if (!this.magnifierInstance || options) {
            options = options || {};
            options.viewer = this;
            this.magnifierInstance = new $.Magnifier(options);
        }
        return this.magnifierInstance;
    };

    /**
     * @typedef MagnifierPublicOptions
     * @property {number} sizeRatio
     * @property {string=} prefixUrl Prefix URL to use for control images.
     * @property {number=} viewerWidth Initial viewer width
     * @property {number=} viewerHeight Initial viewer height
     * @property {number=} minPixelRatio
     * @property {number=} defaultZoomLevel Initial zoom level for the viewer
     * @property {number} [minZoomLevel=1]
     * @property {string} [keyboardShortcut='m'] The default keyboard shortcut to toggle the magnifier.
     * @property {'topLeft' | 'full'} [regionMoveHandle='topLeft'] Controls the size of the area that can be used to
     * move the region around.
     * @property {'BOTTOM_RIGHT' | 'BOTTOM_LEFT' | 'TOP_RIGHT' | 'TOP_LEFT' | 'ABSOLUTE'} position Position to place the magnifier.
     * @property {number=} top Required when position is set to 'ABSOLUTE'
     * @property {number=} left Required when position is set to 'ABSOLUTE'
     * @property {number=} height Required when position is set to 'ABSOLUTE'
     * @property {number=} width Required when position is set to 'ABSOLUTE'
     * @property {boolean} [showMagnifierControl=false] Whether to show a button for toggling the magnifier.
     * @property {string | HTMLElement} magnifierButton
     * @property {boolean} [autoResize=true] Whether to automatically resize the inner magnifier view.
     * @property {boolean} [moveMagnifier=false] Initial value for whether to allow moving the magnifier window.
     * @property {string} navImages.magnifier.REST
     * @property {string} navImages.magnifier.GROUP
     * @property {string} navImages.magnifier.HOVER
     * @property {string} navImages.magnifier.DOWN
     */

    /**
     * @typedef MagnifierControlOptions
     * @property {OpenSeadragon.ControlAnchor} [anchor=OpenSeadragon.ControlAnchor.NONE]
     * @property {boolean} [attachToViewer=true]
     * @property {boolean} [autoFade=true]
     */

    /**
     * @typedef MagnifierPrivateOptions
     * @property {string=} id ID of element to use for the magnifier.
     * @property {OpenSeadragon.Viewer} viewer Target viewer.
     * @property {MagnifierControlOptions=} controlOptions Magnifier control options.
     */

    /**
     * @typedef MagnifierFields
     * @property {HTMLElement} element
     */

    /**
     * @typedef {MagnifierPublicOptions & MagnifierPrivateOptions & MagnifierFields & OpenSeadragon.Viewer} MagnifierInstance
     */

    /**
     * @class Magnifier
     * @classdesc Allows to view part of the image magnified.
     * @memberof OpenSeadragon
     * @param {MagnifierPublicOptions & MagnifierPrivateOptions} options
     * @this MagnifierInstance
     */
    $.Magnifier = function (options) {
        const viewer = options.viewer;
        const self = this;
        let viewerSize;
        let magnifierSize;

        //We may need to create a new element and id if they did not
        //provide the id for the existing element
        if (!options.id) {
            options.id = 'magnifier-' + $.now();
            this.element = $.makeNeutralElement('div');
            options.controlOptions = $.extend(true, {
                anchor: $.ControlAnchor.BOTTOM_RIGHT,
                attachToViewer: true,
                autoFade: false
            }, options.controlOptions || {});

            if (options.position) {
                if ('BOTTOM_RIGHT' === options.position) {
                    options.controlOptions.anchor = $.ControlAnchor.BOTTOM_RIGHT;
                } else if ('BOTTOM_LEFT' === options.position) {
                    options.controlOptions.anchor = $.ControlAnchor.BOTTOM_LEFT;
                } else if ('TOP_RIGHT' === options.position) {
                    options.controlOptions.anchor = $.ControlAnchor.TOP_RIGHT;
                } else if ('TOP_LEFT' === options.position) {
                    options.controlOptions.anchor = $.ControlAnchor.TOP_LEFT;
                } else if ('ABSOLUTE' === options.position) {
                    options.controlOptions.anchor = $.ControlAnchor.ABSOLUTE;
                    options.controlOptions.top = options.top;
                    options.controlOptions.left = options.left;
                    options.controlOptions.height = options.height;
                    options.controlOptions.width = options.width;
                }
            }

        } else {
            this.element = document.getElementById(options.id);
            options.controlOptions = $.extend(true, {
                anchor: $.ControlAnchor.NONE,
                attachToViewer: false,
                autoFade: false,
            }, options.controlOptions || {});
        }
        this.element.id = options.id;
        this.element.className += ' magnifier';

        options = $.extend(true, {
            sizeRatio: 0.2,
            magnifierRotate: true, // @TODO
            viewerWidth: null,
            viewerHeight: null,
            minPixelRatio: viewer.minPixelRatio,
            defaultZoomLevel: viewer.viewport.getZoom(true) * 2,
            minZoomLevel: 1,
            keyboardShortcut: 'm',
            moveMagnifier: false,
            navImages: {
                magnifier: {
                    REST: 'selection_rest.png',
                    GROUP: 'selection_grouphover.png',
                    HOVER: 'selection_hover.png',
                    DOWN: 'selection_pressed.png'
                }
            }
        }, options, {
            element: this.element,
            tabIndex: -1, // No keyboard navigation, omit from tab order
            //These need to be overridden to prevent recursion since
            //the magnifier is a viewer and a viewer has a magnifier/navigator
            showNavigator: false,
            showNavigationControl: false,
            showSequenceControl: false,
            magnifier: null,
            immediateRender: true,
            blendTime: 0,
            animationTime: 0,
            autoResize: options.autoResize,
            // prevent resizing the magnifier from adding unwanted space around the image
            minZoomImageRatio: 1.0,
        });

        $.setElementTouchActionNone(this.element);

        this.borderWidth = 2;
        this.viewerWidth = options.viewerWidth;
        this.viewerHeight = options.viewerHeight;

        //At some browser magnification levels the display regions lines up correctly, but at some there appears to
        //be a one pixel gap.
        this.fudge = new $.Point(1, 1);
        this.totalBorderWidths = new $.Point(this.borderWidth * 2, this.borderWidth * 2).minus(this.fudge);

        if (options.showMagnifierControl || options.magnifierButton) {
            const prefix = options.prefixUrl || '';
            const useGroup = viewer.buttons && viewer.buttons.buttons;
            const anyButton = useGroup ? viewer.buttons.buttons[0] : null;
            const onFocusHandler = anyButton ? anyButton.onFocus : null;
            const onBlurHandler = anyButton ? anyButton.onBlur : null;

            viewer.magnifierButton = new $.Button({
                element: options.magnifierButton ? $.getElement(options.magnifierButton) : null,
                clickTimeThreshold: viewer.clickTimeThreshold,
                clickDistThreshold: viewer.clickDistThreshold,
                tooltip: $.getString('Tooltips.SelectionToggle') || 'Toggle selection',
                srcRest: prefix + options.navImages.magnifier.REST,
                srcGroup: prefix + options.navImages.magnifier.GROUP,
                srcHover: prefix + options.navImages.magnifier.HOVER,
                srcDown: prefix + options.navImages.magnifier.DOWN,
                onRelease: this.toggleVisibility.bind(this),
                onFocus: onFocusHandler,
                onBlur: onBlurHandler
            });
        }

        if (options.controlOptions.anchor !== $.ControlAnchor.NONE) {
            (function (style, borderWidth) {
                style.margin = '0px';
                style.border = borderWidth + 'px solid #555';
                style.padding = '0px';
                style.background = '#000';
                style.overflow = 'hidden';
                style.minWidth = '50px';
                style.minHeight = '50px';
            }(this.element.style, this.borderWidth));
        }

        this.magnifierResizeHandle = $.makeNeutralElement('div');
        this.magnifierResizeHandle.id = this.element.id + '-magnifier-resize';
        this.magnifierResizeHandle.className = 'magnifier-resize';
        this.magnifierResizeHandle.style.position = 'absolute';

        switch (options.controlOptions.anchor) {
            case $.ControlAnchor.TOP_LEFT: {
                this.magnifierResizeHandle.style.bottom = '-1px';
                this.magnifierResizeHandle.style.right = '-1px';
                this.magnifierResizeHandle.style.cursor = 'se-resize';
                break;
            }

            case $.ControlAnchor.TOP_RIGHT: {
                this.magnifierResizeHandle.style.bottom = '-1px';
                this.magnifierResizeHandle.style.left = '-1px';
                this.magnifierResizeHandle.style.cursor = 'sw-resize';
                break;
            }

            case $.ControlAnchor.BOTTOM_LEFT: {
                this.magnifierResizeHandle.style.top = '-1px';
                this.magnifierResizeHandle.style.right = '-1px';
                this.magnifierResizeHandle.style.cursor = 'ne-resize';
                break;
            }

            case $.ControlAnchor.BOTTOM_RIGHT:
            default: {
                this.magnifierResizeHandle.style.top = '-1px';
                this.magnifierResizeHandle.style.left = '-1px';
                this.magnifierResizeHandle.style.cursor = 'nw-resize';
                break;
            }
        }

        this.magnifierResizeHandle.style.width = '10%';
        this.magnifierResizeHandle.style.height = '10%';
        this.magnifierResizeHandle.style.maxWidth = '50px';
        this.magnifierResizeHandle.style.maxHeight = '50px';
        this.magnifierResizeHandle.style.zIndex = '5'; // we need to be on top of OpenSeadragon

        new $.MouseTracker({
            element: this.magnifierResizeHandle,
            dragHandler: event => {
                const targets = _getAnchorTargets(options.controlOptions.anchor);

                const viewerSize = $.getElementSize(this.viewer.element);
                const deltaX = event.delta.x * targets.dxFactor;
                const deltaY = event.delta.y * targets.dyFactor;

                let newWidth = parseInt(this.element.style.width, 10) + deltaX;
                newWidth = Math.min(newWidth, viewerSize.x * .75);
                newWidth = Math.max(newWidth, parseInt(this.element.style.minWidth, 10));
                this.element.style.width = newWidth + 'px';

                let newHeight = parseInt(this.element.style.height, 10) + deltaY;
                newHeight = Math.min(newHeight, viewerSize.y * .75);
                newHeight = Math.max(newHeight, parseInt(this.element.style.minHeight, 10));
                this.element.style.height = newHeight + 'px';
            },
        });

        this.element.appendChild(this.magnifierResizeHandle);

        this.magnifierMoveHandle = $.makeNeutralElement('div');
        this.magnifierMoveHandle.id = this.element.id + '-magnifier-move';
        this.magnifierMoveHandle.className = 'magnifier-move';
        this.magnifierMoveHandle.style.display = options.moveMagnifier ? 'block' : 'none';
        this.magnifierMoveHandle.style.position = 'absolute';
        this.magnifierMoveHandle.style.top = '-1px';
        this.magnifierMoveHandle.style.left = '-1px';
        this.magnifierMoveHandle.style.width = '100%';
        this.magnifierMoveHandle.style.height = '100%';
        this.magnifierMoveHandle.style.cursor = 'move';
        this.magnifierMoveHandle.style.zIndex = '4'; // we need to be on top of OpenSeadragon

        new $.MouseTracker({
            element: this.magnifierMoveHandle,
            dragHandler: (event) => {
                const targets = _getAnchorTargets(this.controlOptions.anchor);

                // Get the current target values
                let horizontal = Number(this.element.style[targets.hOffset].replace('px', ''));
                let vertical = Number(this.element.style[targets.vOffset].replace('px', ''));

                // Get the related client rects
                const clientRect = this.element.getBoundingClientRect();
                const canvasRect = viewer.canvas.getBoundingClientRect();

                // Get the maximum translation for both directions
                const maxHorizontal = canvasRect.width - clientRect.width;
                const maxVertical = canvasRect.height - clientRect.height;

                // Get the correct delta value for given direction
                const deltaX = event.delta.x * targets.dxFactor;
                const deltaY = event.delta.y * targets.dyFactor;

                // Clamp translation to min and max values (where is Math.clamp when you need it.)
                horizontal = Math.min(Math.max(horizontal + deltaX, 0), maxHorizontal);
                vertical = Math.min(Math.max(vertical + deltaY, 0), maxVertical);

                this.element.style[targets.hOffset] = horizontal + 'px';
                this.element.style[targets.vOffset] = vertical + 'px';

                this.raiseEvent('magnifier-move', { originalEvent: event, [targets.hOffset]: horizontal, [targets.vOffset]: vertical, });
            },
        });

        this.element.appendChild(this.magnifierMoveHandle);

        this.displayRegion = $.makeNeutralElement('div');
        this.displayRegion.id = this.element.id + '-displayregion';
        this.displayRegion.className = 'displayregion';

        (function (style, borderWidth) {
            style.position = 'absolute';
            style.border = borderWidth + 'px solid #900';
            style.margin = '0px';
            style.padding = '0px';
        }(this.displayRegion.style, this.borderWidth));

        this.regionMoveHangle = $.makeNeutralElement('div');
        this.regionMoveHangle.id = this.element.id + '-displayregion-move';
        this.regionMoveHangle.className = 'displayregion-move';

        switch (options.regionMoveHandle) {
            case 'topLeft': {
                this.regionMoveHangle.style.width = '10%';
                this.regionMoveHangle.style.height = '10%';
                this.regionMoveHangle.style.maxWidth = '50px';
                this.regionMoveHangle.style.maxHeight = '50px';
                break;
            }

            case 'full': {
                this.regionMoveHangle.style.width = '100%';
                this.regionMoveHangle.style.height = '100%';
                break;
            }
        }

        this.regionMoveHangle.style.cursor = 'move';
        new $.MouseTracker({
            element: this.regionMoveHangle,
            dragHandler: $.delegate(this, moveRegion),
        });

        this.regionResizeHangle = $.makeNeutralElement('div');
        this.regionResizeHangle.id = this.element.id + '-displayregion-move';
        this.regionResizeHangle.className = 'displayregion-move';
        this.regionResizeHangle.style.position = 'absolute';
        this.regionResizeHangle.style.bottom = '-1px';
        this.regionResizeHangle.style.right = '-1px';
        this.regionResizeHangle.style.width = '10%';
        this.regionResizeHangle.style.height = '10%';
        this.regionResizeHangle.style.maxWidth = '50px';
        this.regionResizeHangle.style.maxHeight = '50px';
        this.regionResizeHangle.style.cursor = 'se-resize';
        new $.MouseTracker({
            element: this.regionResizeHangle,
            dragHandler: $.delegate(this, resizeRegion),
        });

        this.displayRegionContainer = $.makeNeutralElement('div');
        this.displayRegionContainer.id = this.element.id + '-displayregioncontainer';
        this.displayRegionContainer.className = 'displayregioncontainer';
        this.displayRegionContainer.style.width = '0';
        this.displayRegionContainer.style.height = '0';

        viewer.addControl(
            this.element,
            options.controlOptions
        );

        // TODO this is a hack to handle the elements OSD creates that prevent some pointer events from working
        //  correctly. Should be replaced with something more native to OSD.
        requestAnimationFrame(() => {
            this.element.parentNode.style.pointerEvents = 'none';
            this.element.parentNode.parentNode.style.pointerEvents = 'none';
        });

        this._resizeWithViewer = options.controlOptions.anchor !== $.ControlAnchor.ABSOLUTE &&
            options.controlOptions.anchor !== $.ControlAnchor.NONE;

        if (this._resizeWithViewer) {
            if (options.width && options.height) {
                this.element.style.height = typeof (options.height) === 'number' ? (options.height + 'px') : options.height;
                this.element.style.width = typeof (options.width) === 'number' ? (options.width + 'px') : options.width;
            } else {
                viewerSize = $.getElementSize(viewer.element);
                this.element.style.height = Math.round(viewerSize.y * options.sizeRatio) + 'px';
                this.element.style.width = Math.round(viewerSize.x * options.sizeRatio) + 'px';
                this.oldViewerSize = viewerSize;
            }
            magnifierSize = $.getElementSize(this.element);
            this.elementArea = magnifierSize.x * magnifierSize.y;
        }

        this.oldContainerSize = new $.Point(0, 0);

        $.Viewer.apply(this, [options]);

        this.displayRegion.appendChild(this.regionMoveHangle);
        this.displayRegion.appendChild(this.regionResizeHangle);
        this.displayRegionContainer.appendChild(this.displayRegion);
        viewer.canvas.appendChild(this.displayRegionContainer);

        if (this.keyboardShortcut) {
            $.addEvent(
                this.viewer.container,
                'keypress',
                $.delegate(this, onKeyPress),
                false
            );
        }

        if (options.magnifierRotate) {
            viewer.addHandler('rotate', function (args) {
                const center = viewer.viewport.pixelFromPoint(viewer.viewport.getCenter(), true);
                self.displayRegionContainer.style.transformOrigin = center.x + 'px ' + center.y + 'px';
                _setTransformRotate(self.displayRegionContainer, args.degrees);
                _setTransformRotate(self.displayRegion, -args.degrees);
                self.viewport.setRotation(args.degrees);
            });
        }

        this.addHandler('reset-size', function () {
            if (self.viewport) {
                self.viewport.goHome(true);
            }
        });

        this.addHandler('update-level', function () {
            if (viewer.viewport) {
                self.update(viewer.viewport);
            }
        });

        viewer.addHandler('update-level', function () {
            if (viewer.viewport) {
                self.update(viewer.viewport);
            }
        });

        viewer.addHandler('close', function () {
            self.close();
        });

        viewer.addHandler('full-page', function () {
            if (viewer.viewport) {
                self.update(viewer.viewport);
            }
        });

        viewer.addHandler('full-screen', function () {
            if (viewer.viewport) {
                self.update(viewer.viewport);
            }
        });

        viewer.world.addHandler('update-viewport', function () {
            if (viewer.viewport) {
                self.update(viewer.viewport);
            }
        });

        viewer.world.addHandler('item-index-change', function (event) {
            const item = self.world.getItemAt(event.previousIndex);
            self.world.setItemIndex(item, event.newIndex);
        });

        viewer.world.addHandler('remove-item', function (event) {
            const theirItem = event.item;
            const myItem = self._getMatchingItem(theirItem);
            if (myItem) {
                self.world.removeItem(myItem);
            }
        });

        this.storedBounds = null;

        _setTiledImages(this, viewer);

        this.update(viewer.viewport);

    };

    $.extend($.Magnifier.prototype, $.Viewer.prototype, /** @lends OpenSeadragon.Magnifier.prototype */{

        /**
         * Used to notify the magnifier when its size has changed.
         * Especially useful when {@link OpenSeadragon.Options}.magnifierAutoResize is set to false and the magnifier is resizable.
         * @function
         */
        updateSize: function () {
            if (this.viewport) {
                const containerSize = new $.Point(
                    (this.container.clientWidth === 0 ? 1 : this.container.clientWidth),
                    (this.container.clientHeight === 0 ? 1 : this.container.clientHeight)
                );

                if (!containerSize.equals(this.oldContainerSize)) {
                    this.viewport.resize(containerSize, true);
                    this.viewport.goHome(true);
                    this.oldContainerSize = containerSize;
                    this.drawer.clear();
                    this.world.draw();
                }
            }
        },

        /**
         * Used to update the magnifier's viewport rectangle when a change in the viewer's viewport occurs.
         * @function
         * @param {OpenSeadragon.Viewport} viewport viewport this magnifier is tracking.
         */
        update: function (viewport) {
            const viewerSize = $.getElementSize(this.viewer.element);
            if (this._resizeWithViewer && viewerSize.x && viewerSize.y && !viewerSize.equals(this.oldViewerSize)) {
                let newWidth;
                let newHeight;
                this.oldViewerSize = viewerSize;

                if (this.maintainSizeRatio || !this.elementArea) {
                    newWidth = viewerSize.x * this.sizeRatio;
                    newHeight = viewerSize.y * this.sizeRatio;
                } else {
                    newWidth = Math.sqrt(this.elementArea * (viewerSize.x / viewerSize.y));
                    newHeight = this.elementArea / newWidth;
                }

                // When dimensions are suplied with the plugin options
                if (this.viewerWidth && this.viewerHeight) {
                    newWidth = this.viewerWidth;
                    newHeight = this.viewerHeight;
                }

                this.element.style.width = Math.round(newWidth) + 'px';
                this.element.style.height = Math.round(newHeight) + 'px';

                if (!this.elementArea) {
                    this.elementArea = newWidth * newHeight;
                }

                this.updateSize();
            }

            if (viewport && this.viewport) {
                const bounds = this.viewport.getBounds(true);
                const topLeft = viewport.pixelFromPoint(bounds.getTopLeft(), true);
                const bottomRight = viewport.pixelFromPoint(bounds.getBottomRight(), true)
                    .minus(this.totalBorderWidths);

                //update style for magnifier-box
                const style = this.displayRegion.style;
                style.display = this.world.getItemCount() ? 'block' : 'none';

                style.top = Math.round(topLeft.y) + 'px';
                style.left = Math.round(topLeft.x) + 'px';

                const width = Math.abs(topLeft.x - bottomRight.x);
                const height = Math.abs(topLeft.y - bottomRight.y);
                // make sure width and height are non-negative so IE doesn't throw
                style.width = Math.round(Math.max(width, 0)) + 'px';
                style.height = Math.round(Math.max(height, 0)) + 'px';

                this.storedBounds = bounds;
            }

        },

        // overrides Viewer.addTiledImage
        addTiledImage: function (options) {
            const _this = this;

            const original = options.originalTiledImage;
            delete options.original;

            const optionsClone = $.extend({}, options, {
                success: function (event) {
                    const myItem = event.item;
                    myItem._originalForNavigator = original;
                    _this._matchBounds(myItem, original, true);

                    original.addHandler('bounds-change', function () {
                        _this._matchBounds(myItem, original);
                    });
                }
            });

            return $.Viewer.prototype.addTiledImage.apply(this, [optionsClone]);
        },

        toggleVisibility: function () {
            toggleBlockElement(this.element);
            toggleBlockElement(this.displayRegionContainer);
            return this;
        },

        /**
         * Enables moving the magnifier itself.
         */
        startMagnifierMove() {
            this.magnifierMoveHandle.style.display = 'block';
        },

        /**
         * Disables moving the magnifier itself.
         */
        stopMagnifierMove() {
            this.magnifierMoveHandle.style.display = 'none';
        },

        /**
         * @param theirItem
         * @returns {OpenSeadragon.TiledImage|null}
         * @private
         */
        _getMatchingItem(theirItem) {
            const count = this.world.getItemCount();
            let item;

            for (let i = 0; i < count; i++) {
                item = this.world.getItemAt(i);
                if (item._originalForNavigator === theirItem) {
                    return item;
                }
            }

            return null;
        },

        /**
         * @param myItem
         * @param theirItem
         * @param immediately
         * @private
         */
        _matchBounds(myItem, theirItem, immediately) {
            const bounds = theirItem.getBounds();
            myItem.setPosition(bounds.getTopLeft(), immediately);
            myItem.setWidth(bounds.width, immediately);
        },
    });

    /**
     * @function
     * @private
     * @param {Object} element
     * @param {Number} degrees
     */
    function _setTransformRotate(element, degrees) {
        element.style.webkitTransform = 'rotate(' + degrees + 'deg)';
        element.style.mozTransform = 'rotate(' + degrees + 'deg)';
        element.style.msTransform = 'rotate(' + degrees + 'deg)';
        element.style.oTransform = 'rotate(' + degrees + 'deg)';
        element.style.transform = 'rotate(' + degrees + 'deg)';
    }

    function _setTiledImages(magnifier, viewer) {
        let tiledImage;

        for (let i = 0; i < viewer.world.getItemCount(); i++) {
            tiledImage = viewer.world.getItemAt(i);
            magnifier.world.addItem(cloneTiledImage(magnifier, tiledImage), {});
        }

        viewer.world.addHandler('add-item', function (event) {
            magnifier.world.addItem(cloneTiledImage(magnifier, event.item), {
                index: viewer.world.getIndexOfItem(event.item)
            });

            if (magnifier.storedBounds) {
                magnifier.viewport.fitBounds(magnifier.storedBounds, true);
            }
        });
    }

    function _getAnchorTargets(anchor) {
        const isLeft = anchor === OpenSeadragon.ControlAnchor.TOP_LEFT
            || anchor === OpenSeadragon.ControlAnchor.BOTTOM_LEFT;

        const isTop = anchor === OpenSeadragon.ControlAnchor.TOP_LEFT
            || anchor === OpenSeadragon.ControlAnchor.TOP_RIGHT;

        return {
            hOffset: isLeft ? "left" : "right",
            vOffset: isTop? "top" : "bottom",

            dxFactor: isLeft ? 1 : -1,
            dyFactor: isTop ? 1 : -1,
        };
    }

    function cloneTiledImage(magnifier, tiledImage) {
        const myItem = new $.TiledImage({
            viewer: magnifier,
            source: tiledImage.source,
            viewport: magnifier.viewport,
            drawer: magnifier.drawer,
            tileCache: tiledImage._tileCache,
            imageLoader: tiledImage._imageLoader,
            clip: tiledImage._clip,
            placeholderFillStyle: tiledImage.placeholderFillStyle,
            opacity: tiledImage.opacity,
            springStiffness: magnifier.springStiffness,
            animationTime: magnifier.animationTime,
            minZoomImageRatio: magnifier.minZoomImageRatio,
            wrapHorizontal: magnifier.wrapHorizontal,
            wrapVertical: magnifier.wrapVertical,
            immediateRender: magnifier.immediateRender,
            blendTime: magnifier.blendTime,
            alwaysBlend: magnifier.alwaysBlend,
            minPixelRatio: magnifier.minPixelRatio,
            smoothTileEdgesMinZoom: magnifier.smoothTileEdgesMinZoom,
            crossOriginPolicy: magnifier.crossOriginPolicy,
            debugMode: magnifier.debugMode
        });
        myItem._originalForNavigator = tiledImage;
        magnifier._matchBounds(myItem, tiledImage, true);

        tiledImage.addHandler('bounds-change', function () {
            magnifier._matchBounds(myItem, tiledImage);
        });

        return myItem;
    }

    function moveRegion(event) {
        if (this.viewport) {
            if (!this.panHorizontal) {
                event.delta.x = 0;
            }
            if (!this.panVertical) {
                event.delta.y = 0;
            }
            this.viewport.panBy(
                this.viewer.viewport.deltaPointsFromPixels(
                    event.delta
                ),
                true
            );

            // store position
        }
    }

    function resizeRegion(event) {
        const bounds = this.viewport.getBounds(true);
        const topLeft = this.viewer.viewport.pixelFromPoint(bounds.getTopLeft(), true);
        const bottomRight = this.viewer.viewport
            .pixelFromPoint(bounds.getBottomRight(), true)
            .minus(this.totalBorderWidths);

        const width = Math.abs(topLeft.x - bottomRight.x);
        const height = Math.abs(topLeft.y - bottomRight.y);
        const delta = (event.delta.x / width) + (event.delta.y / height);
        const zoom = this.viewport.getZoom(true) * (1 - delta);

        if (zoom > this.minZoomImageRatio && zoom < this.viewport.getMaxZoom()) {
            this.viewport.zoomTo(zoom, undefined, true);
        }
    }

    function onKeyPress(e) {
        const key = e.keyCode || e.charCode;
        if (String.fromCharCode(key) === this.keyboardShortcut) {
            this.toggleVisibility();
        }
    }

    function toggleBlockElement(el) {
        el.style.display = el.style.display === 'none' ? 'block' : 'none';
    }

})(OpenSeadragon);
