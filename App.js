import { View as GraphicsView } from 'expo-graphics';
import ExpoTHREE, { THREE } from 'expo-three';
import React from 'react';
import {Platform} from "react-native";

let cordsArray = [{lat: 59.9139, lon: 10.7522}, {lat:51.508476 ,lon: -0.103321}, {lat:48.5124 ,lon: 2.103321}, {lat:69.5836 ,lon: 23.1745}];


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

        //this.controls = new THREE.OrbitControls(this.camera);

        const earthGeometry = new THREE.SphereGeometry(2, 42, 42);
        const markerGeometry = new THREE.SphereGeometry(0.02,50,50);



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

        const earthMaterial = new THREE.MeshPhongMaterial({
            map,
            bumpMap,
            bumpScale
        });
        const markerMaterial = new THREE.MeshPhongMaterial({
            color: 0xff0000
        });

        this.sphere = new THREE.Mesh(earthGeometry, earthMaterial);

        //placeObjectOnPlanet(this.marker, 59.9139, 10.7522, 2);

        this.group = new THREE.Object3D();
        this.group.add(this.sphere);
        createMarkes(this.group, markerGeometry, markerMaterial);

        this.scene.add(this.group);

        // set earth start rotation
        this.group.rotation.x = 0.3;
        this.group.rotation.y = -2;
        //this.sphere.position.x = 1.5;
        //this.sphere.position.z = 2;


        this.scene.add(new THREE.AmbientLight(0x404040));

        const light = new THREE.DirectionalLight(0xffffff, 0.7);
        light.position.set(3, 3, 3);
        this.scene.add(light);
    };

    onRender = delta => {
        this.group.rotation.y += 0.2 * delta;
        //this.controls.update();
        this.renderer.render(this.scene, this.camera);
    };

}
function createMarkes(group, geo, mat){
    for (let i = 0; i < cordsArray.length; i++) {
        let marker = new THREE.Mesh(geo, mat);

        placeObjectOnPlanet(marker, cordsArray[i].lat, cordsArray[i].lon);
        group.add(marker)
    }
}

function placeObjectOnPlanet(object, lat, lon) {
    var latRad = lat * (Math.PI / 180);
    var lonRad = -lon * (Math.PI / 180);
    object.position.set(
        (Math.cos(latRad) * Math.cos(lonRad) * 2)+0.03,
        (Math.sin(latRad) * 2),
        (Math.cos(latRad) * Math.sin(lonRad) * 2)
    );
    object.rotation.set(0.0, -lonRad, latRad - Math.PI * 0.5);
}
