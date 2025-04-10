!function(e){if(!e.version||e.version.major<2)throw new Error("This version of Magnifier requires OpenSeadragon version 2.0.0+");function t(e,t){e.style.webkitTransform="rotate("+t+"deg)",e.style.mozTransform="rotate("+t+"deg)",e.style.msTransform="rotate("+t+"deg)",e.style.oTransform="rotate("+t+"deg)",e.style.transform="rotate("+t+"deg)"}function i(e){const t=e===OpenSeadragon.ControlAnchor.TOP_LEFT||e===OpenSeadragon.ControlAnchor.BOTTOM_LEFT,i=e===OpenSeadragon.ControlAnchor.TOP_LEFT||e===OpenSeadragon.ControlAnchor.TOP_RIGHT;return{hOffset:t?"left":"right",vOffset:i?"top":"bottom",dxFactor:t?1:-1,dyFactor:i?1:-1}}function n(t,i){const n=new e.TiledImage({viewer:t,source:i.source,viewport:t.viewport,drawer:t.drawer,tileCache:i._tileCache,imageLoader:i._imageLoader,clip:i._clip,placeholderFillStyle:i.placeholderFillStyle,opacity:i.opacity,springStiffness:t.springStiffness,animationTime:t.animationTime,minZoomImageRatio:t.minZoomImageRatio,wrapHorizontal:t.wrapHorizontal,wrapVertical:t.wrapVertical,immediateRender:t.immediateRender,blendTime:t.blendTime,alwaysBlend:t.alwaysBlend,minPixelRatio:t.minPixelRatio,smoothTileEdgesMinZoom:t.smoothTileEdgesMinZoom,crossOriginPolicy:t.crossOriginPolicy,debugMode:t.debugMode});return n._originalForNavigator=i,t._matchBounds(n,i,!0),i.addHandler("bounds-change",(function(){t._matchBounds(n,i)})),n}function o(e){this.viewport&&(this.panHorizontal||(e.delta.x=0),this.panVertical||(e.delta.y=0),this.viewport.panBy(this.viewer.viewport.deltaPointsFromPixels(e.delta),!0))}function s(e){const t=this.viewport.getBounds(!0),i=this.viewer.viewport.pixelFromPoint(t.getTopLeft(),!0),n=this.viewer.viewport.pixelFromPoint(t.getBottomRight(),!0).minus(this.totalBorderWidths),o=Math.abs(i.x-n.x),s=Math.abs(i.y-n.y),r=e.delta.x/o+e.delta.y/s,a=this.viewport.getZoom(!0)*(1-r);a>this.minZoomImageRatio&&a<this.viewport.getMaxZoom()&&this.viewport.zoomTo(a,void 0,!0)}function r(e){const t=e.keyCode||e.charCode;String.fromCharCode(t)===this.keyboardShortcut&&this.toggleVisibility()}function a(e){e.style.display="none"===e.style.display?"block":"none"}e.Viewer.prototype.magnifier=function(t){return this.magnifierInstance&&!t||((t=t||{}).viewer=this,this.magnifierInstance=new e.Magnifier(t)),this.magnifierInstance},e.Magnifier=function(a){const l=a.viewer,h=this;let d,g;if(a.id?(this.element=document.getElementById(a.id),a.controlOptions=e.extend(!0,{anchor:e.ControlAnchor.NONE,attachToViewer:!1,autoFade:!1},a.controlOptions||{})):(a.id="magnifier-"+e.now(),this.element=e.makeNeutralElement("div"),a.controlOptions=e.extend(!0,{anchor:e.ControlAnchor.BOTTOM_RIGHT,attachToViewer:!0,autoFade:!1},a.controlOptions||{}),a.position&&("BOTTOM_RIGHT"===a.position?a.controlOptions.anchor=e.ControlAnchor.BOTTOM_RIGHT:"BOTTOM_LEFT"===a.position?a.controlOptions.anchor=e.ControlAnchor.BOTTOM_LEFT:"TOP_RIGHT"===a.position?a.controlOptions.anchor=e.ControlAnchor.TOP_RIGHT:"TOP_LEFT"===a.position?a.controlOptions.anchor=e.ControlAnchor.TOP_LEFT:"ABSOLUTE"===a.position&&(a.controlOptions.anchor=e.ControlAnchor.ABSOLUTE,a.controlOptions.top=a.top,a.controlOptions.left=a.left,a.controlOptions.height=a.height,a.controlOptions.width=a.width))),this.element.id=a.id,this.element.className+=" magnifier",a=e.extend(!0,{sizeRatio:.2,magnifierRotate:!0,viewerWidth:null,viewerHeight:null,minPixelRatio:l.minPixelRatio,defaultZoomLevel:2*l.viewport.getZoom(!0),minZoomLevel:1,keyboardShortcut:"m",moveMagnifier:!1,navImages:{magnifier:{REST:"selection_rest.png",GROUP:"selection_grouphover.png",HOVER:"selection_hover.png",DOWN:"selection_pressed.png"}}},a,{element:this.element,tabIndex:-1,showNavigator:!1,showNavigationControl:!1,showSequenceControl:!1,magnifier:null,immediateRender:!0,blendTime:0,animationTime:0,autoResize:a.autoResize,minZoomImageRatio:1}),e.setElementTouchActionNone(this.element),this.borderWidth=2,this.viewerWidth=a.viewerWidth,this.viewerHeight=a.viewerHeight,this.fudge=new e.Point(1,1),this.totalBorderWidths=new e.Point(2*this.borderWidth,2*this.borderWidth).minus(this.fudge),a.showMagnifierControl||a.magnifierButton){const t=a.prefixUrl||"",i=l.buttons&&l.buttons.buttons?l.buttons.buttons[0]:null,n=i?i.onFocus:null,o=i?i.onBlur:null;l.magnifierButton=new e.Button({element:a.magnifierButton?e.getElement(a.magnifierButton):null,clickTimeThreshold:l.clickTimeThreshold,clickDistThreshold:l.clickDistThreshold,tooltip:e.getString("Tooltips.SelectionToggle")||"Toggle selection",srcRest:t+a.navImages.magnifier.REST,srcGroup:t+a.navImages.magnifier.GROUP,srcHover:t+a.navImages.magnifier.HOVER,srcDown:t+a.navImages.magnifier.DOWN,onRelease:this.toggleVisibility.bind(this),onFocus:n,onBlur:o})}var m,p;switch(a.controlOptions.anchor!==e.ControlAnchor.NONE&&(m=this.element.style,p=this.borderWidth,m.margin="0px",m.border=p+"px solid #555",m.padding="0px",m.background="#000",m.overflow="hidden",m.minWidth="50px",m.minHeight="50px"),this.magnifierResizeHandle=e.makeNeutralElement("div"),this.magnifierResizeHandle.id=this.element.id+"-magnifier-resize",this.magnifierResizeHandle.className="magnifier-resize",this.magnifierResizeHandle.style.position="absolute",a.controlOptions.anchor){case e.ControlAnchor.TOP_LEFT:this.magnifierResizeHandle.style.bottom="-1px",this.magnifierResizeHandle.style.right="-1px",this.magnifierResizeHandle.style.cursor="se-resize";break;case e.ControlAnchor.TOP_RIGHT:this.magnifierResizeHandle.style.bottom="-1px",this.magnifierResizeHandle.style.left="-1px",this.magnifierResizeHandle.style.cursor="sw-resize";break;case e.ControlAnchor.BOTTOM_LEFT:this.magnifierResizeHandle.style.top="-1px",this.magnifierResizeHandle.style.right="-1px",this.magnifierResizeHandle.style.cursor="ne-resize";break;case e.ControlAnchor.BOTTOM_RIGHT:default:this.magnifierResizeHandle.style.top="-1px",this.magnifierResizeHandle.style.left="-1px",this.magnifierResizeHandle.style.cursor="nw-resize"}switch(this.magnifierResizeHandle.style.width="10%",this.magnifierResizeHandle.style.height="10%",this.magnifierResizeHandle.style.maxWidth="50px",this.magnifierResizeHandle.style.maxHeight="50px",this.magnifierResizeHandle.style.zIndex="5",new e.MouseTracker({element:this.magnifierResizeHandle,dragHandler:t=>{const n=i(a.controlOptions.anchor),o=e.getElementSize(this.viewer.element),s=t.delta.x*n.dxFactor,r=t.delta.y*n.dyFactor;let l=parseInt(this.element.style.width,10)+s;l=Math.min(l,.75*o.x),l=Math.max(l,parseInt(this.element.style.minWidth,10)),this.element.style.width=l+"px";let h=parseInt(this.element.style.height,10)+r;h=Math.min(h,.75*o.y),h=Math.max(h,parseInt(this.element.style.minHeight,10)),this.element.style.height=h+"px"}}),this.element.appendChild(this.magnifierResizeHandle),this.magnifierMoveHandle=e.makeNeutralElement("div"),this.magnifierMoveHandle.id=this.element.id+"-magnifier-move",this.magnifierMoveHandle.className="magnifier-move",this.magnifierMoveHandle.style.display=a.moveMagnifier?"block":"none",this.magnifierMoveHandle.style.position="absolute",this.magnifierMoveHandle.style.top="-1px",this.magnifierMoveHandle.style.left="-1px",this.magnifierMoveHandle.style.width="100%",this.magnifierMoveHandle.style.height="100%",this.magnifierMoveHandle.style.cursor="move",this.magnifierMoveHandle.style.zIndex="4",new e.MouseTracker({element:this.magnifierMoveHandle,dragHandler:e=>{const t=i(this.controlOptions.anchor);let n=Number(this.element.style[t.hOffset].replace("px","")),o=Number(this.element.style[t.vOffset].replace("px",""));const s=this.element.getBoundingClientRect(),r=l.canvas.getBoundingClientRect(),a=r.width-s.width,h=r.height-s.height,d=e.delta.x*t.dxFactor,g=e.delta.y*t.dyFactor;n=Math.min(Math.max(n+d,0),a),o=Math.min(Math.max(o+g,0),h),this.element.style[t.hOffset]=n+"px",this.element.style[t.vOffset]=o+"px",this.raiseEvent("magnifier-move",{originalEvent:e,[t.hOffset]:n,[t.vOffset]:o})}}),this.element.appendChild(this.magnifierMoveHandle),this.displayRegion=e.makeNeutralElement("div"),this.displayRegion.id=this.element.id+"-displayregion",this.displayRegion.className="displayregion",function(e,t){e.position="absolute",e.border=t+"px solid #900",e.margin="0px",e.padding="0px"}(this.displayRegion.style,this.borderWidth),this.regionMoveHangle=e.makeNeutralElement("div"),this.regionMoveHangle.id=this.element.id+"-displayregion-move",this.regionMoveHangle.className="displayregion-move",a.regionMoveHandle){case"topLeft":this.regionMoveHangle.style.width="10%",this.regionMoveHangle.style.height="10%",this.regionMoveHangle.style.maxWidth="50px",this.regionMoveHangle.style.maxHeight="50px";break;case"full":this.regionMoveHangle.style.width="100%",this.regionMoveHangle.style.height="100%"}this.regionMoveHangle.style.cursor="move",new e.MouseTracker({element:this.regionMoveHangle,dragHandler:e.delegate(this,o)}),this.regionResizeHangle=e.makeNeutralElement("div"),this.regionResizeHangle.id=this.element.id+"-displayregion-move",this.regionResizeHangle.className="displayregion-move",this.regionResizeHangle.style.position="absolute",this.regionResizeHangle.style.bottom="-1px",this.regionResizeHangle.style.right="-1px",this.regionResizeHangle.style.width="10%",this.regionResizeHangle.style.height="10%",this.regionResizeHangle.style.maxWidth="50px",this.regionResizeHangle.style.maxHeight="50px",this.regionResizeHangle.style.cursor="se-resize",new e.MouseTracker({element:this.regionResizeHangle,dragHandler:e.delegate(this,s)}),this.displayRegionContainer=e.makeNeutralElement("div"),this.displayRegionContainer.id=this.element.id+"-displayregioncontainer",this.displayRegionContainer.className="displayregioncontainer",this.displayRegionContainer.style.width="0",this.displayRegionContainer.style.height="0",l.addControl(this.element,a.controlOptions),requestAnimationFrame((()=>{this.element.parentNode.style.pointerEvents="none",this.element.parentNode.parentNode.style.pointerEvents="none"})),this._resizeWithViewer=a.controlOptions.anchor!==e.ControlAnchor.ABSOLUTE&&a.controlOptions.anchor!==e.ControlAnchor.NONE,this._resizeWithViewer&&(a.width&&a.height?(this.element.style.height="number"==typeof a.height?a.height+"px":a.height,this.element.style.width="number"==typeof a.width?a.width+"px":a.width):(d=e.getElementSize(l.element),this.element.style.height=Math.round(d.y*a.sizeRatio)+"px",this.element.style.width=Math.round(d.x*a.sizeRatio)+"px",this.oldViewerSize=d),g=e.getElementSize(this.element),this.elementArea=g.x*g.y),this.oldContainerSize=new e.Point(0,0),e.Viewer.apply(this,[a]),this.displayRegion.appendChild(this.regionMoveHangle),this.displayRegion.appendChild(this.regionResizeHangle),this.displayRegionContainer.appendChild(this.displayRegion),l.canvas.appendChild(this.displayRegionContainer),this.keyboardShortcut&&e.addEvent(this.viewer.container,"keypress",e.delegate(this,r),!1),a.magnifierRotate&&l.addHandler("rotate",(function(e){const i=l.viewport.pixelFromPoint(l.viewport.getCenter(),!0);h.displayRegionContainer.style.transformOrigin=i.x+"px "+i.y+"px",t(h.displayRegionContainer,e.degrees),t(h.displayRegion,-e.degrees),h.viewport.setRotation(e.degrees)})),this.addHandler("reset-size",(function(){h.viewport&&h.viewport.goHome(!0)})),this.addHandler("update-level",(function(){l.viewport&&h.update(l.viewport)})),l.addHandler("update-level",(function(){l.viewport&&h.update(l.viewport)})),l.addHandler("close",(function(){h.close()})),l.addHandler("full-page",(function(){l.viewport&&h.update(l.viewport)})),l.addHandler("full-screen",(function(){l.viewport&&h.update(l.viewport)})),l.world.addHandler("update-viewport",(function(){l.viewport&&h.update(l.viewport)})),l.world.addHandler("item-index-change",(function(e){const t=h.world.getItemAt(e.previousIndex);h.world.setItemIndex(t,e.newIndex)})),l.world.addHandler("remove-item",(function(e){const t=e.item,i=h._getMatchingItem(t);i&&h.world.removeItem(i)})),this.storedBounds=null,function(e,t){let i;for(let o=0;o<t.world.getItemCount();o++)i=t.world.getItemAt(o),e.world.addItem(n(e,i),{});t.world.addHandler("add-item",(function(i){e.world.addItem(n(e,i.item),{index:t.world.getIndexOfItem(i.item)}),e.storedBounds&&e.viewport.fitBounds(e.storedBounds,!0)}))}(this,l),this.update(l.viewport)},e.extend(e.Magnifier.prototype,e.Viewer.prototype,{updateSize:function(){if(this.viewport){const t=new e.Point(0===this.container.clientWidth?1:this.container.clientWidth,0===this.container.clientHeight?1:this.container.clientHeight);t.equals(this.oldContainerSize)||(this.viewport.resize(t,!0),this.viewport.goHome(!0),this.oldContainerSize=t,this.drawer.clear(),this.world.draw())}},update:function(t){const i=e.getElementSize(this.viewer.element);if(this._resizeWithViewer&&i.x&&i.y&&!i.equals(this.oldViewerSize)){let e,t;this.oldViewerSize=i,this.maintainSizeRatio||!this.elementArea?(e=i.x*this.sizeRatio,t=i.y*this.sizeRatio):(e=Math.sqrt(this.elementArea*(i.x/i.y)),t=this.elementArea/e),this.viewerWidth&&this.viewerHeight&&(e=this.viewerWidth,t=this.viewerHeight),this.element.style.width=Math.round(e)+"px",this.element.style.height=Math.round(t)+"px",this.elementArea||(this.elementArea=e*t),this.updateSize()}if(t&&this.viewport){const e=this.viewport.getBounds(!0),i=t.pixelFromPoint(e.getTopLeft(),!0),n=t.pixelFromPoint(e.getBottomRight(),!0).minus(this.totalBorderWidths),o=this.displayRegion.style;o.display=this.world.getItemCount()?"block":"none",o.top=Math.round(i.y)+"px",o.left=Math.round(i.x)+"px";const s=Math.abs(i.x-n.x),r=Math.abs(i.y-n.y);o.width=Math.round(Math.max(s,0))+"px",o.height=Math.round(Math.max(r,0))+"px",this.storedBounds=e}},addTiledImage:function(t){const i=this,n=t.originalTiledImage;delete t.original;const o=e.extend({},t,{success:function(e){const t=e.item;t._originalForNavigator=n,i._matchBounds(t,n,!0),n.addHandler("bounds-change",(function(){i._matchBounds(t,n)}))}});return e.Viewer.prototype.addTiledImage.apply(this,[o])},toggleVisibility:function(){return a(this.element),a(this.displayRegionContainer),this},startMagnifierMove(){this.magnifierMoveHandle.style.display="block"},stopMagnifierMove(){this.magnifierMoveHandle.style.display="none"},_getMatchingItem(e){const t=this.world.getItemCount();let i;for(let n=0;n<t;n++)if(i=this.world.getItemAt(n),i._originalForNavigator===e)return i;return null},_matchBounds(e,t,i){const n=t.getBounds();e.setPosition(n.getTopLeft(),i),e.setWidth(n.width,i)}})}(OpenSeadragon);
//# sourceMappingURL=openseadragonmagnifier.js.map
