import json
# Function to load, simplify, and output a GeoJSON file
# Additionally, it removes polygons with fewer than 10 coordinate points
def simplify_geojson_file_with_min_points(input_path, output_path, min_points=30):
    # Load the GeoJSON data from file
    with open(input_path, 'r') as file:
        geojson_data = json.load(file)

    # Simplify the GeoJSON features
    simplified_features = []
    
    for feature in geojson_data['features']:
        geometry = feature['geometry']
        
        def filter_coordinates(coordinates):
            # Remove polygons with fewer than min_points
            return [polygon for polygon in coordinates if len(polygon[0]) >= min_points]

        if geometry['type'] == 'MultiPolygon':
            # Filter out polygons with fewer than the specified number of points
            filtered_polygons = filter_coordinates(geometry['coordinates'])
            
            # Convert to Polygon if only one polygon remains, or keep as MultiPolygon
            if len(filtered_polygons) == 1:
                simplified_geometry = {
                    "type": "Polygon",
                    "coordinates": filtered_polygons[0]
                }
            elif len(filtered_polygons) > 1:
                simplified_geometry = {
                    "type": "MultiPolygon",
                    "coordinates": filtered_polygons
                }
            else:
                # Skip this feature if no polygons meet the minimum point requirement
                continue
        elif geometry['type'] == 'Polygon':
            # Filter polygons directly if it is a Polygon
            if len(geometry['coordinates'][0]) >= min_points:
                simplified_geometry = geometry
            else:
                # Skip this feature if it doesn't meet the minimum point requirement
                continue
        else:
            # Skip unknown geometry types
            continue
        
        # Append the simplified feature (without "properties")
        simplified_features.append({
            "type": "Feature",
            "geometry": simplified_geometry
        })
    
    # Create the simplified GeoJSON
    simplified_geojson = {
        "type": "FeatureCollection",
        "features": simplified_features
    }

    # Output the simplified GeoJSON to a file
    with open(output_path, 'w') as outfile:
        json.dump(simplified_geojson, outfile, indent=4)

# Example usage:
simplify_geojson_file_with_min_points('antarctica.geojson', 'cleansed_antarctica.geojson', 10)
