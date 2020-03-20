import { View as GraphicsView } from 'expo-graphics';
import ExpoTHREE, { THREE } from 'expo-three';
import React from 'react';
import {Platform} from "react-native";

export default class App extends React.Component {
    render() {
        // Create an `ExpoGraphics.View` covering the whole screen, tell it to call our
        // `onContextCreate` function once it's initialized.
        return (
            <GraphicsView
                style={{ flex: 1 }}
                onContextCreate={this.onContextCreate}
                onRender={this.onRender}
                colors={0xffffff}
            />
        );
    }

    // This is called by the `ExpoGraphics.View` once it's initialized
    onContextCreate = async ({
                                 gl,
                                 canvas,
                                 width,
                                 height,
                                 scale: pixelRatio,
                             }) => {
        this.renderer = new ExpoTHREE.Renderer({ gl, pixelRatio, width, height });
        this.renderer.setClearColor(0xffffff);
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.camera.position.z = 5;
        const geometry = new THREE.SphereGeometry(1.5, 42, 42);


        const texture = require('./assets/earth2.png');
        const bump = require("./assets/earthbump.png");
        let map;
        let bumpMap;
        let bumpScale = 0.2;
        if (Platform.OS === 'web') {
            map = texture;
            bumpMap = bump;
        } else {
            map = await ExpoTHREE.loadTextureAsync({asset: texture});
            bumpMap = await ExpoTHREE.loadTextureAsync({asset: bump});
        }

        const material = new THREE.MeshPhongMaterial({
            map,
            bumpMap,
            bumpScale
        });

        this.sphere = new THREE.Mesh(geometry, material);
        this.scene.add(this.sphere);

        // set earth start position
        this.sphere.rotation.x = 0.3;
        this.sphere.rotation.y = -2;
        //this.sphere.position.x = 1.5;
        //this.sphere.position.z = 2;




        this.scene.add(new THREE.AmbientLight(0x404040));

        const light = new THREE.DirectionalLight(0xffffff, 0.7);
        light.position.set(3, 3, 3);
        this.scene.add(light);
    };

    onRender = delta => {
        this.sphere.rotation.y += 0.2 * delta;
        this.renderer.render(this.scene, this.camera);
    };
}

function calcPosFromLatLonRad(lat,lon,radius){

    var phi   = (90-lat)*(Math.PI/180);
    var theta = (lon+180)*(Math.PI/180);

    x = -((radius) * Math.sin(phi)*Math.cos(theta));
    z = ((radius) * Math.sin(phi)*Math.sin(theta));
    y = ((radius) * Math.cos(phi));


    console.log([x,y,z]);
    return [x,y,z];
}
