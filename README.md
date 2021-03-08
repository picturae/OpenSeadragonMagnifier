# OpenSeadragonMagnifier

An OpenSeadragon plugin to view part of the image magnified.

It could be useful for zooming into 2 separate parts of an image to compare them.

## Demo

http://picturae.github.io/openseadragonselection/#magnifier

## Usage

This plugin requires a version of OpenSeadragon later than 2.0

Include `dist/openseadragonmagnifier.js` after OpenSeadragon in your html. Then after you create a viewer:

    var magnifier = viewer.magnifier({
        sizeRatio:              0.2, // size relative to parent viewer
        magnifierRotate:        true, // rotate with parent viewer (does not work yet)
        keyboardShortcut:       'm', // to toggle magnifier visibility
        // ... supports all OpenSeadragon viewer options
        // because it is essentially a mini viewer
    });

## Build

Build using 'npm run build'

## TODO

- Fix Rotation
