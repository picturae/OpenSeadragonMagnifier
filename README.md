# OpenSeadragonMagnifier

An OpenSeadragon plugin to view part of the image magnified.

## Demo

@TODO http://picturae.github.io/openseadragonselection/#magnifier

## Usage

This plugin requires a version of OpenSeadragon later than 2.0

Include `dist/openseadragonmagnifier.js` after OpenSeadragon in your html. Then after you create a viewer:

    var magnifier = viewer.magnifier({
        sizeRatio:              0.2, // size relative to parent viewer
        magnifierRotate:        true, // rotate with parent viewer (does not work yet)
        // ... supports all OpenSeadragon viewer options
        // because it is essentially a mini viewer
    });
