from PIL import Image

# Open the PNG image
image = Image.open("dice/0.png")

# Convert the image to RGB mode if it's not already
image = image.convert("RGB")

# Get the width and height of the image
width, height = image.size

# Iterate over each pixel in the image
colors = []
for y in range(height):
    for x in range(width):
        # Get the RGB values of the pixel
        r, g, b = image.getpixel((x, y))

        # Append the color to the list
        colors.append((r, g, b))

# Print the list of colors
for color in colors:
    print(color)
