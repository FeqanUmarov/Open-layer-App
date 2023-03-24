window.onload = init;

function init(){
    const map = new ol.Map({
        view: new ol.View({
            center: ol.proj.fromLonLat([47.5769, 40.1431]),
            zoom: 8
        }),
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        target: 'js-map'

    })
    
}