from flask import Flask, render_template
import json

app = Flask(__name__)

# Define POIs for each map
poi_data = {
    "stormpoint": [
        "Checkpoint", "Trident", "North Pad", "Downed Beast", "The Mill", "Bean", "Cenote Cave", "Barometer",
        "Ceto Station", "Cascades Falls", "Command Center", "The Wall", "Zeus Station", "Lightning Rod", "Hillside",
        "Storm Catcher", "Launch Pad", "Devastated Coast", "Echo HQ", "Coastal Camp", "The Pylon", "Jurassic", "Cascade Balls"
    ],
    "worldsedge": [
        "Sky West", "Sky East", "Countdown", "Lava Fissure", "Landslide", "Mirage", "Staging", "Thermal", "Harvester",
        "The Tree", "Lava Siphon", "Launch Site", "The Dome", "Stacks", "Big Maude", "The Geyser", "Fragment East",
        "Monument", "Survey Camp", "The Epicenter", "Climatizer", "Overlook"
    ],
    "edistrict": [
        "Resort", "The Lotus", "Electro Dam", "Boardwalk", "City Hall", "Riverside", "Galleria", "Angels Atrium",
        "Heights", "Blossom Drive", "Neon Square", "Energy Bank", "Stadium West", "Stadium North", "Stadium South",
        "Street Market", "Street Market Grief", "Viaduct", "Draft Point", "Is this a POI?", "Shipyard Arcade",
        "Humbert Labs", "Old Town"
    ]
}

@app.route('/draft-map')
def draft_map():
    current_map = "stormpoint"  # You can dynamically set this value based on user input or a default value
    poi_list = poi_data.get(current_map, [])
    return render_template('draft_index.html', current_map=current_map, poi_list=poi_list)

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=8002)
