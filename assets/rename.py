import os

# Specify the path to the folder containing the images
IMAGES_FOLDER = "dice"

# Change to the images folder
os.chdir(IMAGES_FOLDER)

# Loop through the images and rename them
for i in range(144):
    # Generate the new filename
    new_filename = f"{i}.png"

    # Generate the original filename
    frame_number = f"{i:03d}"
    original_filename = f"frame_{frame_number}_delay-0.04s.png"

    # Rename the image file
    os.rename(original_filename, new_filename)

    # Optionally, you can print the progress for each renamed image
    print(f"Renamed image {original_filename} to {new_filename}")

print("All images have been renamed.")
