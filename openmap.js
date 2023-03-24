window.onload = init;

async function init() {
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

    });

    // Geojson verilenimizi qeyd edirik
    const geojsonUrl = '/geojson/Places.geojson';

    // geojson file oxuyunur
    const response = await fetch(geojsonUrl);
    const geojsonObject = await response.json();

    // GeoJSON formatını oxuyan bir dəyişən yaradılır
    const geojsonFormat = new ol.format.GeoJSON();

    // GeoJSON verilənini oxuyaraq bir lay yaradılır
    const vectorSource = new ol.source.Vector({
        features: geojsonFormat.readFeatures(geojsonObject, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
        })
    });

    const vectorLayer = new ol.layer.Vector({
        source: vectorSource,
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(165, 80, 51, 0.8)'
            }),
            stroke: new ol.style.Stroke({
                color: '#ffcc33',
                width: 2
            }),
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                    color: '#ffcc33'
                })
            })
        })
    });

    // Vektor lay xəritəyə əlavə edilir
    map.addLayer(vectorLayer);


    // Yeni bir layın yaradılması
    const typeSelect = document.getElementById('type');
    let draw;
    let lastFeature;

    function addInteraction() {
        const value = typeSelect.value;
        if (value !== 'None') {
            draw = new ol.interaction.Draw({
                source: vectorSource,
                type: typeSelect.value,
            });
            map.addInteraction(draw);

            draw.on('drawend', function (event) {
                lastFeature = event.feature;
            });



        }

    }

    typeSelect.onchange = function () {
        map.removeInteraction(draw);
        addInteraction();
    };

    document.getElementById('undo').addEventListener('click', function () {
        if (draw) {
            draw.removeLastPoint();
        }
    });

    addInteraction();


    // Son çəkilən poliqonun yadda saxlanılması ve endirilməsi
    function saveLastDrawnPolygon() {
        if (lastFeature) {
            const format = new ol.format.GeoJSON();
            const data = format.writeFeature(lastFeature, {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857',
            });
            download(data, 'LastDrawnPolygon.geojson', 'application/json');
        } else {
            alert('Henüz çizilmiş bir poligon yok.');
        }
    }

    // Son çəkilən poliqonun endirmə düyməsi
    document.getElementById('saveLastDrawnButton').addEventListener('click', saveLastDrawnPolygon);






    // Poligonları GeoJSON olaraq endirmə funksiyası
    function download(content, fileName, contentType) {
        const a = document.createElement('a');
        const file = new Blob([content], { type: contentType });
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
    }

    // Bütün poliqonları yükləmə düyməsinin funksiyası
    document.getElementById('saveButton').addEventListener('click', function () {
        const format = new ol.format.GeoJSON();
        const data = format.writeFeatures(vectorSource.getFeatures(), {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857',
        });
        download(data, 'Places.geojson', 'application/json');
    });





}