import json
import argparse
import re

def convert_weight_to_grams(weight_str):
    """
    Converts a weight string (e.g., '32.988 g', '0.5 kg') to grams.
    Returns the weight in grams as a float.
    """
    weight_pattern = re.match(r"([\d\.]+)\s*(\w+)", weight_str)
    
    if weight_pattern:
        value = float(weight_pattern.group(1))
        unit = weight_pattern.group(2).lower()

        # Convert to grams based on the unit
        if unit == 'g':  # grams
            return value
        elif unit == 'kg':  # kilograms
            return value * 1000
        elif unit == 'mg':  # milligrams
            return value / 1000
        else:
            raise ValueError(f"Unknown weight unit: {unit}")
    else:
        raise ValueError(f"Invalid weight format: {weight_str}")

def convert_collection_date_to_year(collection_date_str):
    """
    Converts a collection date string to an integer year.
    Ensures that the year is a 4-digit number.
    """
    # Use regex to extract a 4-digit year
    year_pattern = re.match(r"(\d{4})", collection_date_str)
    
    if year_pattern:
        year = int(year_pattern.group(1))
        return year
    else:
        raise ValueError(f"Invalid collection date format: {collection_date_str}")

def cleanse_json(input_file, output_file):
    # Load the data from the JSON file
    with open(input_file, 'r') as f:
        data = json.load(f)

    cleansed_data = []

    for item in data:
        # Check if latitude, longitude, and weight are not "N/A"
        if item['latitude'] != "N/A" and item['longitude'] != "N/A" and item['weight'] != "N/A":
            try:
                # Convert latitude and longitude from strings to floats
                latitude = float(item['latitude'])
                longitude = float(item['longitude'])

                # Update the original latitude and longitude fields to floats
                item['latitude'] = latitude
                item['longitude'] = longitude

                # Convert weight to grams and add as weight_gram
                weight_in_grams = convert_weight_to_grams(item['weight'])
                item['weight_gram'] = round(weight_in_grams, 3)

                # Remove the original 'weight' field
                del item['weight']

                # Convert collection_date to collection_year
                if 'collection_date' in item:
                    try:
                        collection_year = convert_collection_date_to_year(item['collection_date'])
                        item['collection_year'] = collection_year
                        # Remove the original 'collection_date' field
                        del item['collection_date']
                    except ValueError:
                        # Skip this entry if the collection_date is invalid
                        continue

                # Add the cleansed item to the result list
                cleansed_data.append(item)
            except (ValueError, KeyError):
                # Skip items where latitude, longitude, or weight is not valid
                pass

    # Save the cleansed data to the specified output JSON file
    with open(output_file, 'w') as f:
        json.dump(cleansed_data, f, indent=4)

    print(f"Cleansed data saved to: {output_file}")

if __name__ == "__main__":
    # Argument parser to handle command-line arguments
    parser = argparse.ArgumentParser(description="Cleanse JSON data by removing entries with no valid latitude, longitude, or weight, and add rounded latitude, longitude, and weight in grams.")
    
    # Input and output file arguments
    parser.add_argument("input_file", help="Path to the input JSON file.")
    parser.add_argument("output_file", help="Path to save the cleansed JSON file.")
    
    # Parse arguments
    args = parser.parse_args()

    # Call the cleanse function with the provided file names
    cleanse_json(args.input_file, args.output_file)
